import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
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
  private readonly templatesPath = path.join(__dirname, '../../templates/emails');

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    this.logger.log(`SendGrid configuration check: API Key present: ${!!apiKey}`);
    this.logger.log(`Email FROM configured: ${this.configService.get<string>('EMAIL_FROM')}`);
    
    if (!apiKey) {
      this.logger.error('SendGrid API key not configured. Email functionality will be disabled.');
      return;
    }

    sgMail.setApiKey(apiKey);
    this.logger.log('SendGrid email service initialized successfully');
  }

  /**
   * Send email using template
   */
  async sendTemplatedEmail(emailData: EmailTemplate): Promise<boolean> {
    try {
      this.logger.log(`Attempting to send email to: ${emailData.to} with template: ${emailData.template}`);
      
      const htmlContent = await this.renderTemplate(emailData.template, emailData.templateData);
      
      const fromEmail = emailData.from || this.configService.get<string>('EMAIL_FROM', 'noreply@fixia.com.ar');
      this.logger.log(`Sending from: ${fromEmail}`);
      
      const message = {
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        from: fromEmail,
        subject: emailData.subject,
        html: htmlContent,
        attachments: emailData.attachments || [],
      };

      this.logger.log(`SendGrid message prepared: ${JSON.stringify({
        to: message.to,
        from: message.from,
        subject: message.subject,
        hasHtml: !!message.html
      })}`);

      await sgMail.send(message);
      this.logger.log(`✅ Email sent successfully to ${emailData.to}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${emailData.to}:`, error);
      this.logger.error(`SendGrid error details:`, JSON.stringify(error.response?.body || error.message));
      return false;
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