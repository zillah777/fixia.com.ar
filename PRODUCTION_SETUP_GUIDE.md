# 🚀 GUÍA DE CONFIGURACIÓN PARA PRODUCCIÓN - FIXIA

Esta guía te ayudará a configurar todos los servicios necesarios para el lanzamiento comercial de Fixia.

## 📋 CHECKLIST DE SERVICIOS

- [x] ✅ **Aplicación Base** - Funcionando
- [x] ✅ **Sistema de Autenticación** - Completado
- [x] ✅ **Base de Datos** - Configurada
- [ ] 🔄 **Servicio de Email** - Pendiente configuración
- [ ] 🔄 **Pagos con MercadoPago** - Pendiente integración
- [ ] 🔄 **Almacenamiento de Archivos** - Pendiente configuración
- [ ] 🔄 **Datos Iniciales** - Pendiente población

---

## 1. 📧 CONFIGURAR SERVICIO DE EMAIL (PRIORIDAD ALTA)

### Opción A: Resend (Recomendado)

```bash
# 1. Crear cuenta en https://resend.com
# 2. Verificar dominio o usar dominio gratuito
# 3. Obtener API Key
# 4. Configurar variables de entorno:

RESEND_API_KEY=re_xxxxxxxxx_tu_api_key
EMAIL_FROM=Fixia <no-reply@tu-dominio.com>
```

**Beneficios de Resend:**
- ✅ Gratis hasta 3,000 emails/mes
- ✅ Funciona con Railway/Vercel
- ✅ Fácil configuración
- ✅ Entregabilidad excelente

### Configuración de Dominio Personalizado

```bash
# Si tienes dominio propio, agregar estos registros DNS:
# Tipo: TXT
# Nombre: @
# Valor: (proporcionado por Resend)

# Para emails desde tu dominio:
EMAIL_FROM=Fixia <no-reply@fixia.com.ar>
```

---

## 2. 💳 INTEGRAR MERCADOPAGO

### Crear cuenta en MercadoPago Developers

```bash
# 1. Ir a https://developers.mercadopago.com
# 2. Crear aplicación
# 3. Obtener credenciales de prueba y producción
```

### Variables de Entorno

```bash
# Para pruebas
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-123456789

# Para producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-123456789
MERCADOPAGO_PUBLIC_KEY=APP_USR-123456789
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret
```

### Implementar Servicio de Pagos

```typescript
// apps/api/src/payments/payments.service.ts
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private mp: MercadoPagoConfig;

  constructor() {
    this.mp = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
  }

  async createPayment(paymentData: CreatePaymentDto) {
    const payment = new Payment(this.mp);
    
    return await payment.create({
      body: {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: paymentData.paymentMethodId,
        payer: {
          email: paymentData.payerEmail,
        },
      }
    });
  }
}
```

---

## 3. 📁 CONFIGURAR ALMACENAMIENTO DE ARCHIVOS

### Opción A: Cloudinary (Recomendado)

```bash
# 1. Crear cuenta en https://cloudinary.com
# 2. Obtener credenciales del dashboard
# 3. Configurar variables:

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=tu_api_secret
```

### Configurar Servicio de Upload

```typescript
// apps/api/src/upload/upload.service.ts
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return cloudinary.uploader.upload(file.path, {
      folder: 'fixia',
      resource_type: 'auto',
    });
  }
}
```

---

## 4. 🗄️ POBLAR BASE DE DATOS CON DATOS INICIALES

### Ejecutar Seed con Datos Realistas

```bash
# En Railway o tu servidor de producción
npm run db:seed:prod
```

### Crear Datos de Ejemplo

```bash
# Ejecutar script para crear:
# - 50 servicios realistas
# - 20 profesionales verificados
# - 30 clientes de ejemplo
# - Reviews y ratings
# - Categorías principales

node scripts/populate-production-data.js
```

---

## 5. 🔔 CONFIGURAR CHAT EN TIEMPO REAL

### Instalar Socket.io

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Implementar Gateway

```typescript
// apps/api/src/chat/chat.gateway.ts
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
  },
})
export class ChatGateway {
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string }) {
    client.join(payload.roomId);
  }

  @SubscribeMessage('send-message')
  handleMessage(client: Socket, payload: MessageDto) {
    this.server.to(payload.roomId).emit('receive-message', payload);
  }
}
```

---

## 6. 🌐 CONFIGURAR VARIABLES DE ENTORNO COMPLETAS

### Backend (.env)

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/fixia

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_64_caracteres_minimo
JWT_REFRESH_SECRET=tu_refresh_secret_diferente

# Email
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=Fixia <no-reply@fixia.com.ar>

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxx

# App
NODE_ENV=production
PORT=3001
APP_URL=https://fixia.com.ar
```

### Frontend (.env.production)

```bash
# API
VITE_API_URL=https://api.fixia.com.ar

# MercadoPago (Clave pública)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxx

# App
VITE_APP_NAME=Fixia
VITE_APP_VERSION=1.0.0
```

---

## 7. 🚀 DEPLOYMENT

### Railway (Backend)

```bash
# 1. Conectar repositorio
# 2. Configurar variables de entorno
# 3. Deploy automático desde main
```

### Vercel (Frontend)

```bash
# 1. Conectar repositorio
# 2. Configurar build settings:
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install
```

---

## 8. ✅ VERIFICACIÓN FINAL

### Tests de Funcionalidad

```bash
# Backend
npm run test:e2e

# Frontend  
npm run test

# Verificar endpoints críticos
curl https://api.fixia.com.ar/health
curl https://api.fixia.com.ar/auth/status
```

### Checklist Pre-Lanzamiento

- [ ] ✅ Emails de verificación funcionando
- [ ] ✅ Registro y login completos
- [ ] ✅ Búsqueda de servicios
- [ ] ✅ Contacto entre usuarios
- [ ] ✅ Dashboard funcional
- [ ] ✅ Pagos configurados
- [ ] ✅ Upload de archivos
- [ ] ✅ Notificaciones
- [ ] ✅ Performance optimizada
- [ ] ✅ SSL configurado
- [ ] ✅ Dominio personalizado

---

## 🎯 PRÓXIMOS PASOS

1. **Configurar Resend** (30 min)
2. **Integrar MercadoPago** (2 horas)
3. **Configurar Cloudinary** (30 min)
4. **Poblar datos iniciales** (1 hora)
5. **Testing final** (1 hora)
6. **Deploy a producción** (30 min)

**Total estimado: 5-6 horas**

---

¿Por cuál servicio quieres empezar? Te guío paso a paso en la configuración.