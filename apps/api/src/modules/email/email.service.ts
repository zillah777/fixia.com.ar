import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

// Register secure HTML escaping helper
Handlebars.registerHelper('escapeHtml', (text: string) => {
  if (!text || typeof text !== 'string') return '';
  return Handlebars.escapeExpression(text);
});

// Register safe URL helper for URLs
Handlebars.registerHelper('escapeUrl', (url: string) => {
  if (!url || typeof url !== 'string') return '';

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  const lowerUrl = url.toLowerCase().trim();

  if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    return ''; // Return empty string for dangerous protocols
  }

  // Basic URL validation and encoding
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return Handlebars.escapeExpression(urlObj.toString());
  } catch {
    // If invalid URL, return empty string for security
    return '';
  }
});

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  template: string;
  templateData: Record<string, any>;
  from?: string;
  fromType?: 'support' | 'contact' | 'privacy' | 'commercial' | 'no-reply' | 'custom';
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
  }>;
}

export interface EmailQueueItem {
  id: string;
  emailData: EmailTemplate;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  nextRetry: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesPath = this.getTemplatesPath();
  private gmailTransporter: nodemailer.Transporter;
  private resend: Resend;
  private emailQueue: EmailQueueItem[] = [];
  private isProcessingQueue = false;

  private getTemplatesPath(): string {
    // In production (dist), templates are copied to dist/templates/emails
    // In development, they're in src/templates/emails
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      return path.join(__dirname, '../../templates/emails');
    } else {
      // In production, templates are in dist/templates/emails
      return path.join(process.cwd(), 'dist', 'templates', 'emails');
    }
  }

  constructor(private configService: ConfigService) {
    this.logger.log(`📧 Email configuration check:`);

    // Try to configure Resend first (HTTP-based, works with Railway)
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.logger.log(`- Resend API Key present: ${!!resendApiKey}`);

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('✅ Resend API service initialized (HTTP-based)');
    }

    // Try to configure SendGrid as secondary
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.logger.log(`- SendGrid API Key present: ${!!sendgridApiKey}`);

    if (sendgridApiKey) {
      sgMail.setApiKey(sendgridApiKey);
      this.logger.log('✅ SendGrid email service initialized');
    }

    // Configure Gmail SMTP as fallback
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailPass = this.configService.get<string>('GMAIL_APP_PASSWORD');

    this.logger.log(`- Gmail SMTP User: ${gmailUser}`);
    this.logger.log(`- Gmail App Password present: ${!!gmailPass}`);

    if (gmailUser && gmailPass) {
      this.gmailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds  
        socketTimeout: 75000,     // 75 seconds
      });
      this.logger.log('✅ Gmail SMTP transporter initialized with explicit configuration');

      // Test connection
      this.gmailTransporter.verify().then(() => {
        this.logger.log('✅ Gmail SMTP connection verified successfully');
      }).catch((error) => {
        this.logger.error(`❌ Gmail SMTP connection verification failed:`, error.message);
      });
    }

    this.logger.log(`- Email FROM configured: ${this.configService.get<string>('EMAIL_FROM')}`);

    if (!resendApiKey && !sendgridApiKey && (!gmailUser || !gmailPass)) {
      this.logger.error('❌ No email service configured. None of Resend, SendGrid, or Gmail SMTP available.');
    } else {
      const services = [];
      if (resendApiKey) services.push('Resend API');
      if (sendgridApiKey) services.push('SendGrid');
      if (gmailUser && gmailPass) services.push('Gmail SMTP');
      this.logger.log(`📧 Available email services: ${services.join(', ')}`);
    }
  }

  /**
   * Send email using template
   */
  async sendTemplatedEmail(emailData: EmailTemplate): Promise<boolean> {
    try {
      this.logger.log(`📧 Attempting to send email to: ${emailData.to} with template: ${emailData.template}`);

      const htmlContent = await this.renderTemplate(emailData.template, emailData.templateData);

      // Use appropriate FROM email based on service
      let fromEmail = emailData.from || this.configService.get<string>('EMAIL_FROM');

      // Configure appropriate FROM email based on service and purpose
      if (this.resend && (!fromEmail || fromEmail.includes('@gmail.com'))) {
        // Use Resend with fixia.app domain if configured, otherwise default
        fromEmail = this.configService.get<string>('EMAIL_FROM') || 'Fixia <no-reply@fixia.app>';
      } else if (!fromEmail) {
        fromEmail = this.configService.get<string>('EMAIL_FROM') || 'no-reply@fixia.app';
      }

      this.logger.log(`Sending from: ${fromEmail}`);

      // Try Resend first if available (HTTP-based, works with Railway)
      if (this.resend) {
        return await this.sendWithResend(emailData, fromEmail, htmlContent);
      }

      // Try SendGrid as secondary
      const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (sendgridApiKey) {
        return await this.sendWithSendGrid(emailData, fromEmail, htmlContent);
      }

      // Fallback to Gmail SMTP (likely blocked on Railway)
      if (this.gmailTransporter) {
        return await this.sendWithGmail(emailData, fromEmail, htmlContent);
      }

      // Development fallback - log email content for testing
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(`📧 DEVELOPMENT FALLBACK: Email would be sent to ${emailData.to}`);
        console.log('='.repeat(60));
        console.log('📧 EMAIL FALLBACK (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${emailData.to}`);
        console.log(`From: ${fromEmail}`);
        console.log(`Subject: ${emailData.subject}`);
        console.log(`Template: ${emailData.template}`);
        console.log('Template Data:', JSON.stringify(emailData.templateData, null, 2));
        console.log('='.repeat(60));
        // Return true for development to not block the flow
        return true;
      }

      this.logger.error(`❌ No email service available`);
      return false;

    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${emailData.to}:`, error);
      return false;
    }
  }

  private async sendWithResend(emailData: EmailTemplate, fromEmail: string, htmlContent: string): Promise<boolean> {
    try {
      const emailPayload = {
        from: fromEmail,
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: htmlContent,
      };

      this.logger.log(`📤 Sending via Resend API: ${JSON.stringify({
        to: emailPayload.to,
        from: emailPayload.from,
        subject: emailPayload.subject
      })}`);

      const result = await this.resend.emails.send(emailPayload);
      this.logger.log(`✅ Email sent successfully via Resend to ${emailData.to}`);
      this.logger.log(`Resend response: ${JSON.stringify(result)}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Resend failed:`, error);
      throw error;
    }
  }

  private async sendWithSendGrid(emailData: EmailTemplate, fromEmail: string, htmlContent: string): Promise<boolean> {
    try {
      const message = {
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        from: fromEmail,
        subject: emailData.subject,
        html: htmlContent,
        attachments: emailData.attachments || [],
      };

      this.logger.log(`📤 Sending via SendGrid: ${JSON.stringify({
        to: message.to,
        from: message.from,
        subject: message.subject
      })}`);

      await sgMail.send(message);
      this.logger.log(`✅ Email sent successfully via SendGrid to ${emailData.to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ SendGrid failed:`, JSON.stringify(error.response?.body || error.message));
      throw error;
    }
  }

  private async sendWithGmail(emailData: EmailTemplate, fromEmail: string, htmlContent: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: fromEmail,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: htmlContent,
        attachments: emailData.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.type
        })) || [],
      };

      this.logger.log(`📤 Sending via Gmail SMTP: ${JSON.stringify({
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject
      })}`);

      const result = await this.gmailTransporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent successfully via Gmail SMTP to ${emailData.to}`);
      this.logger.log(`Gmail response: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Gmail SMTP failed:`, error);
      throw error;
    }
  }

  /**
   * Send account verification email
   */
  async sendAccountVerification(to: string, userName: string, verificationUrl: string): Promise<boolean> {
    return this.sendTemplatedEmail({
      to,
      subject: 'Verifica tu cuenta - Fixia',
      template: 'account-verification',
      templateData: {
        userName,
        verificationUrl,
        unsubscribeUrl: `${this.configService.get('APP_URL')}/unsubscribe?email=${encodeURIComponent(to)}`,
      },
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
    userType: 'cliente' | 'profesional',
    isProfessional: boolean = false
  ): Promise<boolean> {
    const baseUrl = this.configService.get('APP_URL', 'https://fixia.com.ar');

    return this.sendTemplatedEmail({
      to,
      subject: `¡Bienvenido/a a Fixia, ${userName}!`,
      template: 'welcome',
      templateData: {
        userName,
        userType,
        isProfessional,
        dashboardUrl: `${baseUrl}/dashboard`,
        servicesUrl: `${baseUrl}/services`,
        profileUrl: `${baseUrl}/profile`,
        helpUrl: `${baseUrl}/help`,
        facebookUrl: 'https://facebook.com/fixia',
        instagramUrl: 'https://instagram.com/fixia',
        linkedinUrl: 'https://linkedin.com/company/fixia',
        unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(to)}`,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, userName: string, resetUrl: string): Promise<boolean> {
    const baseUrl = this.configService.get('APP_URL', 'https://fixia.com.ar');

    return this.sendTemplatedEmail({
      to,
      subject: 'Restablecer contraseña - Fixia',
      template: 'password-reset',
      templateData: {
        userName,
        resetUrl,
        helpUrl: `${baseUrl}/help`,
      },
    });
  }

  /**
   * Send account deletion confirmation
   */
  async sendAccountDeletion(
    to: string,
    userName: string,
    deletionDate: string
  ): Promise<boolean> {
    const baseUrl = this.configService.get('APP_URL', 'https://fixia.com.ar');

    return this.sendTemplatedEmail({
      to,
      subject: 'Confirmación de eliminación de cuenta - Fixia',
      template: 'account-deletion',
      templateData: {
        userName,
        deletionDate,
        recoveryUrl: `${baseUrl}/account/recover?email=${encodeURIComponent(to)}`,
        feedbackUrl: `${baseUrl}/feedback`,
        privacyUrl: `${baseUrl}/privacy`,
      },
    });
  }

  /**
   * Send professional contact notification
   */
  async sendProfessionalContact(
    professionalEmail: string,
    professionalName: string,
    clientData: {
      name: string;
      initials: string;
      location: string;
      memberSince: string;
      projectsCount: number;
      rating?: number;
      isVerified: boolean;
    },
    projectData: {
      description: string;
      category: string;
      budget: string;
      preferredDate: string;
      urgency: string;
      isHighUrgency: boolean;
      reasonForContact?: string;
    }
  ): Promise<boolean> {
    const baseUrl = this.configService.get('APP_URL', 'https://fixia.com.ar');

    return this.sendTemplatedEmail({
      to: professionalEmail,
      subject: '¡Nuevo cliente interesado! - Fixia',
      template: 'professional-contact',
      templateData: {
        professionalName,
        clientName: clientData.name,
        clientInitials: clientData.initials,
        clientLocation: clientData.location,
        clientMemberSince: clientData.memberSince,
        clientProjectsCount: clientData.projectsCount,
        clientRating: clientData.rating,
        clientIsVerified: clientData.isVerified,
        projectDescription: projectData.description,
        serviceCategory: projectData.category,
        budgetRange: projectData.budget,
        preferredDate: projectData.preferredDate,
        urgencyLevel: projectData.urgency,
        isHighUrgency: projectData.isHighUrgency,
        reasonForContact: projectData.reasonForContact,
        contactClientUrl: `${baseUrl}/messages/new?client=${encodeURIComponent(clientData.name)}`,
        viewProjectUrl: `${baseUrl}/projects/view`,
        unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(professionalEmail)}`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      },
    });
  }

  /**
   * Send service inquiry notification
   */
  async sendServiceInquiry(
    professionalEmail: string,
    professionalName: string,
    inquiryData: {
      clientName: string;
      clientLocation: string;
      clientProjectsCompleted: number;
      clientRating?: number;
      clientMemberSince: string;
      message: string;
      inquiryDate: string;
      isUrgent: boolean;
      responseWindow: number;
      reason?: string;
    },
    serviceData: {
      name: string;
      price: string;
      estimatedTime: string;
      location: string;
    }
  ): Promise<boolean> {
    const baseUrl = this.configService.get('APP_URL', 'https://fixia.com.ar');

    return this.sendTemplatedEmail({
      to: professionalEmail,
      subject: `Nueva consulta sobre "${serviceData.name}" - Fixia`,
      template: 'service-inquiry',
      templateData: {
        professionalName,
        serviceName: serviceData.name,
        servicePrice: serviceData.price,
        estimatedTime: serviceData.estimatedTime,
        serviceLocation: serviceData.location,
        clientName: inquiryData.clientName,
        clientLocation: inquiryData.clientLocation,
        clientProjectsCompleted: inquiryData.clientProjectsCompleted,
        clientRating: inquiryData.clientRating,
        clientMemberSince: inquiryData.clientMemberSince,
        clientMessage: inquiryData.message,
        inquiryDate: inquiryData.inquiryDate,
        isUrgentInquiry: inquiryData.isUrgent,
        responseWindow: inquiryData.responseWindow,
        inquiryReason: inquiryData.reason,
        respondUrl: `${baseUrl}/inquiries/respond`,
        viewServiceUrl: `${baseUrl}/services/manage`,
        clientProfileUrl: `${baseUrl}/client/profile`,
        unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(professionalEmail)}`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      },
    });
  }

  /**
   * Render email template with data
   */
  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      this.logger.log(`Looking for template at: ${templatePath}`);
      this.logger.log(`Template data: ${JSON.stringify(data)}`);

      if (!fs.existsSync(templatePath)) {
        this.logger.error(`Template file not found: ${templatePath}`);
        throw new Error(`Template file not found: ${templatePath}`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      this.logger.log(`Template loaded successfully, size: ${templateContent.length} chars`);

      const template = Handlebars.compile(templateContent);
      const renderedContent = template(data);

      this.logger.log(`Template rendered successfully, output size: ${renderedContent.length} chars`);
      return renderedContent;

    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}: ${error.message}`);
      this.logger.error(`Templates path: ${this.templatesPath}`);
      throw new Error(`Template rendering failed: ${templateName}`);
    }
  }

  /**
   * Send plain text email (for testing or simple notifications)
   */
  async sendPlainEmail(
    to: string | string[],
    subject: string,
    text: string,
    html?: string
  ): Promise<boolean> {
    try {
      // Determine FROM address
      let fromEmail = this.configService.get<string>('EMAIL_FROM');

      // Configure appropriate FROM email based on service
      if (this.resend && (!fromEmail || fromEmail.includes('@gmail.com'))) {
        fromEmail = this.configService.get<string>('EMAIL_FROM') || 'Fixia <no-reply@fixia.app>';
      } else if (!fromEmail) {
        fromEmail = 'no-reply@fixia.app';
      }

      // 1. Try Resend
      if (this.resend) {
        try {
          await this.resend.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            text,
            html: html || text,
          });
          this.logger.log(`Plain email sent successfully via Resend to ${to}`);
          return true;
        } catch (error) {
          this.logger.error(`Resend failed for plain email: ${error.message}`);
          // Continue to fallbacks
        }
      }

      // 2. Try SendGrid
      const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (sendgridApiKey) {
        const message = {
          to: Array.isArray(to) ? to : [to],
          from: fromEmail,
          subject,
          text,
          html: html || text,
        };
        await sgMail.send(message);
        this.logger.log(`Plain email sent successfully via SendGrid to ${to}`);
        return true;
      }

      // 3. Try Gmail
      if (this.gmailTransporter) {
        await this.gmailTransporter.sendMail({
          from: fromEmail,
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          text,
          html: html || text,
        });
        this.logger.log(`Plain email sent successfully via Gmail to ${to}`);
        return true;
      }

      this.logger.error('No email service available for plain email');
      return false;

    } catch (error) {
      this.logger.error(`Failed to send plain email: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate email address format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}