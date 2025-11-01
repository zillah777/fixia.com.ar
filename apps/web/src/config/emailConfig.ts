/**
 * Email configuration for Fixia marketplace
 * Manages all email-related settings and templates
 */

export interface EmailProvider {
  name: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  replyTo?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export const EMAIL_ADDRESSES = {
  SUPPORT: 'soporte@fixia.app',
  CONTACT: 'contacto@fixia.app',
  PRIVACY: 'privacidad@fixia.app',
  COMMERCIAL: 'comercial@fixia.app',
  NO_REPLY: 'no-reply@fixia.app',
  ADMIN: 'admin@fixia.app',
} as const;

export const EMAIL_PROVIDERS = {
  SENDGRID: {
    name: 'SendGrid',
    smtp: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY || '',
      },
    },
    from: EMAIL_ADDRESSES.NO_REPLY,
    replyTo: EMAIL_ADDRESSES.SUPPORT,
  },
  MAILGUN: {
    name: 'Mailgun',
    smtp: {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_USERNAME || '',
        pass: process.env.MAILGUN_PASSWORD || '',
      },
    },
    from: EMAIL_ADDRESSES.NO_REPLY,
    replyTo: EMAIL_ADDRESSES.SUPPORT,
  },
  AWS_SES: {
    name: 'AWS SES',
    smtp: {
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_SES_ACCESS_KEY || '',
        pass: process.env.AWS_SES_SECRET_KEY || '',
      },
    },
    from: EMAIL_ADDRESSES.NO_REPLY,
    replyTo: EMAIL_ADDRESSES.SUPPORT,
  },
} as const;

export const getEmailProvider = (): EmailProvider => {
  const provider = process.env.EMAIL_PROVIDER || 'SENDGRID';
  return EMAIL_PROVIDERS[provider as keyof typeof EMAIL_PROVIDERS] || EMAIL_PROVIDERS.SENDGRID;
};

export const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: '¡Bienvenido a Fixia! 🎉',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: white; width: 60px; height: 60px; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px; font-weight: bold; color: #667eea;">F</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">¡Bienvenido a Fixia!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Tu marketplace de microservicios profesionales</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 22px;">¡Gracias por unirte a nuestra comunidad!</h2>
          
          <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 25px;">
            Estamos emocionados de tenerte como parte de Fixia. Ahora puedes:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
              <li style="margin-bottom: 10px;">🔍 Explorar miles de servicios profesionales</li>
              <li style="margin-bottom: 10px;">👥 Conectar con expertos verificados</li>
              <li style="margin-bottom: 10px;">💼 Publicar tus propios servicios</li>
              <li style="margin-bottom: 0;">⭐ Construir tu reputación profesional</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fixia.app/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Comenzar Ahora
            </a>
          </div>

          <p style="color: #6a6a6a; font-size: 14px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@fixia.app" style="color: #667eea;">soporte@fixia.app</a>
          </p>
        </div>
      </div>
    `,
  },
  EMAIL_VERIFICATION: {
    subject: 'Verifica tu dirección de email - Fixia',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: white; width: 60px; height: 60px; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px; font-weight: bold; color: #667eea;">F</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Verifica tu Email</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 22px;">¡Último paso para completar tu registro!</h2>
          
          <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 25px;">
            Haz clic en el botón de abajo para verificar tu dirección de email y activar tu cuenta de Fixia.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationLink}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Verificar Email
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⏰ Este enlace expira en 24 horas</strong><br>
              Si no verificas tu email, tu cuenta será eliminada automáticamente.
            </p>
          </div>
          
          <p style="color: #6a6a6a; font-size: 14px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            ¿No solicitaste esta verificación? Puedes ignorar este email de forma segura.<br>
            ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@fixia.app" style="color: #667eea;">soporte@fixia.app</a>
          </p>
        </div>
      </div>
    `,
  },
  PASSWORD_RESET: {
    subject: 'Restablecer tu contraseña - Fixia',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: white; width: 60px; height: 60px; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px; font-weight: bold; color: #667eea;">🔐</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Restablecer Contraseña</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 22px;">Solicitud de nueva contraseña</h2>
          
          <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 25px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta de Fixia. Haz clic en el botón de abajo para crear una nueva contraseña.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 25px 0;">
            <p style="margin: 0; color: #721c24; font-size: 14px;">
              <strong>🔒 Seguridad importante:</strong><br>
              • Este enlace expira en 1 hora<br>
              • Solo puedes usarlo una vez<br>
              • Si no solicitaste este cambio, ignora este email
            </p>
          </div>
          
          <p style="color: #6a6a6a; font-size: 14px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            ¿No solicitaste este cambio? Tu cuenta está segura, puedes ignorar este email.<br>
            ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@fixia.app" style="color: #667eea;">soporte@fixia.app</a>
          </p>
        </div>
      </div>
    `,
  },
  CONTACT_FORM: {
    subject: 'Nuevo mensaje de contacto - Fixia',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Nuevo Mensaje de Contacto</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <strong style="color: #1a1a1a;">De:</strong> {{name}} ({{email}})
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #1a1a1a;">Asunto:</strong> {{subject}}
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #1a1a1a;">Mensaje:</strong>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 10px;">
              {{message}}
            </div>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              <strong>📧 Responder a:</strong> <a href="mailto:{{email}}" style="color: #0066cc;">{{email}}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  },
} as const;

export const DNS_RECORDS_GUIDE = {
  MX_RECORDS: [
    { type: 'MX', name: '@', value: 'mx1.improvmx.com', priority: 10 },
    { type: 'MX', name: '@', value: 'mx2.improvmx.com', priority: 20 },
  ],
  SPF_RECORD: {
    type: 'TXT',
    name: '@',
    value: 'v=spf1 include:_spf.improvmx.com ~all',
  },
  DKIM_RECORD: {
    type: 'TXT',
    name: 'fm1._domainkey',
    value: 'fm1._domainkey.fixia.app.dkim.improvmx.com.',
  },
  DMARC_RECORD: {
    type: 'TXT',
    name: '_dmarc',
    value: 'v=DMARC1; p=none; rua=mailto:dmarc@fixia.app',
  },
};

export const GODADDY_DNS_INSTRUCTIONS = `
🔧 CONFIGURACIÓN DNS EN GODADDY PARA FIXIA.APP

1. REGISTROS PARA VERCEL:
   ━━━━━━━━━━━━━━━━━━━━
   Tipo: CNAME
   Nombre: @
   Valor: cname.vercel-dns.com
   TTL: 600

   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   TTL: 600

2. REGISTROS DE EMAIL (IMPROVMX - GRATUITO):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tipo: MX
   Nombre: @
   Valor: mx1.improvmx.com
   Prioridad: 10
   TTL: 3600

   Tipo: MX
   Nombre: @
   Valor: mx2.improvmx.com
   Prioridad: 20
   TTL: 3600

3. REGISTROS DE AUTENTICACIÓN DE EMAIL:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tipo: TXT
   Nombre: @
   Valor: v=spf1 include:_spf.improvmx.com ~all
   TTL: 600

   Tipo: TXT
   Nombre: _dmarc
   Valor: v=DMARC1; p=none; rua=mailto:dmarc@fixia.app
   TTL: 600

4. CONFIGURAR ALIAS EN IMPROVMX:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Registrarse en improvmx.com
   - Agregar dominio fixia.app
   - Crear alias:
     * soporte@fixia.app → tu-email-personal@gmail.com
     * contacto@fixia.app → tu-email-personal@gmail.com
     * privacidad@fixia.app → tu-email-personal@gmail.com
     * comercial@fixia.app → tu-email-personal@gmail.com
     * no-reply@fixia.app → tu-email-personal@gmail.com
`;