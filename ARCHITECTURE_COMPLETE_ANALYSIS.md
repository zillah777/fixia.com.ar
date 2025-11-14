# ANALISIS COMPLETO DE ARQUITECTURA - PROYECTO FIXIA

## 1. ESTRUCTURA GENERAL DEL PROYECTO

El proyecto Fixia es un Monorepo de Marketplace de Microservicios con arquitectura de aplicaciones separadas:

```
fixia.com.ar/
├── apps/
│   ├── api/           # Backend NestJS
│   └── web/           # Frontend React + Vite
├── packages/
│   ├── types/         # Tipos compartidos (TypeScript)
│   ├── ui/            # Componentes UI compartidos
│   ├── utils/         # Utilidades compartidas
│   └── config/        # Configuraciones compartidas
└── [documentación y scripts de configuración]
```

## 2. STACK TECNOLOGICO ACTUAL

### Backend (NestJS)
- Framework: NestJS 10.0.0
- Lenguaje: TypeScript 5.9.2
- Base de Datos: PostgreSQL + Prisma ORM 5.22.0
- Autenticación: JWT + Passport.js
- Seguridad: bcryptjs, Helmet, CSRF protection
- APIs: RESTful con Swagger
- WebSockets: Socket.IO 4.7.2
- Email: SendGrid + Nodemailer
- Almacenamiento: Cloudinary
- Pagos: MercadoPago
- Testing: Jest + Supertest

### Frontend (React + Vite)
- Framework: React 18.3.1
- Build Tool: Vite 5.4.19
- Lenguaje: TypeScript 5.3.0
- Enrutamiento: React Router DOM
- Estilos: Tailwind CSS 3.4.0 + Radix UI
- HTTP Client: Axios 1.11.0
- State Management: React Context API
- Formularios: React Hook Form 7.55.0
- Testing: Jest + React Testing Library + Playwright

## 3. ESTRUCTURA DEL BACKEND

### Directorio Principal
apps/api/src/
├── auth/                      # Autenticación
├── users/                     # Gestión de usuarios
├── services/                  # Servicios ofertados
├── projects/                  # Proyectos/Trabajos
├── matching/                  # Sistema de matching
├── jobs/                      # Trabajos (dual system)
├── feedback/                  # Sistema de retroalimentación
├── notifications/             # Notificaciones
├── payments/                  # Pagos
├── subscription/              # Suscripciones
├── dashboard/                 # Dashboard
├── favorites/                 # Favoritos
├── categories/                # Categorías
├── trust/                     # Puntuación de confianza
├── verification/              # Verificación de usuarios
├── upload/                    # Carga de archivos
├── admin/                     # Administración
└── common/                    # Servicios comunes

