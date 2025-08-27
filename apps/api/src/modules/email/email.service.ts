import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  template: string;
  templateData: Record<string, any>;
  from?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesPath = this.getTemplatesPath();
  private gmailTransporter: nodemailer.Transporter;

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
    // Try to configure SendGrid first
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    this.logger.log(`Email configuration check:`);
    this.logger.log(`- SendGrid API Key present: ${!!sendgridApiKey}`);
    this.logger.log(`- Email FROM configured: ${this.configService.get<string>('EMAIL_FROM')}`);
    
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
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
      this.logger.log('✅ Gmail SMTP transporter initialized');
    }
    
    if (!sendgridApiKey && (!gmailUser || !gmailPass)) {
      this.logger.error('❌ No email service configured. Neither SendGrid nor Gmail SMTP available.');
    }
  }

  /**
   * Send email using template
   */
  async sendTemplatedEmail(emailData: EmailTemplate): Promise<boolean> {
    try {
      this.logger.log(`📧 Attempting to send email to: ${emailData.to} with template: ${emailData.template}`);
      
      const htmlContent = await this.renderTemplate(emailData.template, emailData.templateData);
      const fromEmail = emailData.from || this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('GMAIL_USER', 'noreply@fixia.com.ar');
      
      this.logger.log(`Sending from: ${fromEmail}`);

      // Try SendGrid first if available
      const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (sendgridApiKey) {
        return await this.sendWithSendGrid(emailData, fromEmail, htmlContent);
      }
      
      // Fallback to Gmail SMTP
      if (this.gmailTransporter) {
        return await this.sendWithGmail(emailData, fromEmail, htmlContent);
      }
      
      this.logger.error(`❌ No email service available`);
      return false;

    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${emailData.to}:`, error);
      return false;
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
      const message = {
        to: Array.isArray(to) ? to : [to],
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@fixia.com.ar'),
        subject,
        text,
        html: html || text,
      };

      await sgMail.send(message);
      this.logger.log(`Plain email sent successfully to ${to}`);
      return true;

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