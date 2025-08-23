# Sistema de Emails de Fixia

Este módulo maneja todos los emails transaccionales de la plataforma Fixia usando SendGrid como proveedor de correo electrónico.

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@fixia.com.ar
APP_URL=https://fixia.com.ar
```

### SendGrid Setup

1. Crear cuenta en [SendGrid](https://sendgrid.com/)
2. Generar API Key con permisos de envío
3. Verificar el dominio `fixia.com.ar` en SendGrid
4. Configurar autenticación SPF/DKIM

## Templates Disponibles

### 1. Verificación de Cuenta (`account-verification.html`)
- **Uso**: Confirmar email al registrarse
- **Variables**: `userName`, `verificationUrl`, `unsubscribeUrl`

### 2. Bienvenida (`welcome.html`) 
- **Uso**: Email de bienvenida tras verificar cuenta
- **Variables**: `userName`, `userType`, `isProfessional`, URLs de navegación

### 3. Restablecer Contraseña (`password-reset.html`)
- **Uso**: Recuperación de contraseña olvidada  
- **Variables**: `userName`, `resetUrl`, `helpUrl`

### 4. Eliminación de Cuenta (`account-deletion.html`)
- **Uso**: Confirmación de eliminación de cuenta
- **Variables**: `userName`, `deletionDate`, `recoveryUrl`, `feedbackUrl`

### 5. Contacto Profesional (`professional-contact.html`)
- **Uso**: Notificar profesional sobre cliente interesado
- **Variables**: Datos de cliente, proyecto, URLs de acción

### 6. Consulta de Servicio (`service-inquiry.html`)
- **Uso**: Notificar sobre consulta específica de servicio
- **Variables**: Datos de consulta, servicio, cliente

## Uso del Servicio

### Inyección de Dependencia

```typescript
import { EmailService } from './modules/email/email.service';

constructor(private emailService: EmailService) {}
```

### Ejemplos de Uso

#### Enviar Email de Verificación
```typescript
await this.emailService.sendAccountVerification(
  'user@example.com',
  'Juan Pérez',
  'https://fixia.com.ar/verify?token=abc123'
);
```

#### Enviar Email de Bienvenida
```typescript
await this.emailService.sendWelcomeEmail(
  'user@example.com',
  'Juan Pérez', 
  'cliente',
  false // isProfessional
);
```

#### Enviar Reset de Contraseña
```typescript
await this.emailService.sendPasswordReset(
  'user@example.com',
  'Juan Pérez',
  'https://fixia.com.ar/reset?token=abc123'
);
```

#### Notificar Profesional sobre Cliente
```typescript
await this.emailService.sendProfessionalContact(
  'professional@example.com',
  'Carlos Martínez',
  {
    name: 'María González',
    initials: 'MG',
    location: 'Trelew, Chubut',
    memberSince: 'Enero 2023',
    projectsCount: 5,
    rating: 4.8,
    isVerified: true
  },
  {
    description: 'Necesito renovar mi cocina...',
    category: 'Renovación',
    budget: '$50,000 - $80,000',
    preferredDate: 'Próximas 2 semanas',
    urgency: 'Media',
    isHighUrgency: false
  }
);
```

## API Endpoints

### POST `/email/test`
Envía un email de prueba

```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test"
}
```

### POST `/email/verification`
Envía email de verificación

```json
{
  "to": "user@example.com",
  "userName": "Juan Pérez",
  "verificationUrl": "https://fixia.com.ar/verify?token=abc123"
}
```

### POST `/email/welcome`
Envía email de bienvenida

```json
{
  "to": "user@example.com", 
  "userName": "Juan Pérez",
  "userType": "cliente",
  "isProfessional": false
}
```

### POST `/email/password-reset`
Envía email de reset de contraseña

```json
{
  "to": "user@example.com",
  "userName": "Juan Pérez", 
  "resetUrl": "https://fixia.com.ar/reset?token=abc123"
}
```

## Personalización de Templates

Los templates usan Handlebars para interpolación de variables:

```html
<h1>Hola {{userName}}!</h1>
<p>Tu código es: {{verificationCode}}</p>

{{#if isProfessional}}
  <p>Eres un profesional verificado</p>
{{else}}
  <p>Eres un cliente</p>
{{/if}}
```

### Variables Globales Disponibles
- `userName`: Nombre del usuario
- `userEmail`: Email del usuario (automático)
- `currentYear`: Año actual (automático)
- `siteName`: "Fixia" (automático)
- `siteUrl`: URL de la aplicación

## Monitoreo y Logs

El servicio incluye logging automático:
- ✅ Emails enviados exitosamente
- ❌ Errores al enviar emails
- ⚠️ Configuración faltante

## Mejores Prácticas

1. **Validar emails**: Usar `isValidEmail()` antes de enviar
2. **Manejar errores**: Siempre verificar el valor de retorno
3. **Templates**: Mantener coherencia visual con la marca
4. **Personalización**: Usar nombre del usuario cuando sea posible
5. **URLs**: Usar URLs absolutas en todos los enlaces

## Desarrollo y Testing

### Testing Local
```bash
# Usar email de prueba para development
EMAIL_FROM=test@localhost
SENDGRID_API_KEY=disabled

# Los emails se loggearán en lugar de enviarse
```

### Debugging
```typescript
// Habilitar logs detallados
const logger = new Logger('EmailService');
logger.setLogLevel('debug');
```

## Troubleshooting

### Email no llega
1. Verificar API key de SendGrid
2. Confirmar dominio verificado en SendGrid
3. Revisar logs de la aplicación
4. Verificar configuración SPF/DKIM

### Template no renderiza
1. Verificar sintaxis de Handlebars
2. Confirmar que el archivo template existe
3. Verificar permisos de lectura del archivo

### Error de autenticación
1. Regenerar API key en SendGrid
2. Verificar que la clave tiene permisos de envío
3. Confirmar configuración de dominio