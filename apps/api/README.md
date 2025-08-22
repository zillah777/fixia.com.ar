# Fixia API

Backend del marketplace de microservicios profesionales de Chubut. Desarrollado con NestJS, PostgreSQL y Prisma.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Sistema de roles** (client/professional)
- **CRUD completo** para servicios, proyectos y usuarios
- **Sistema de matching** para oportunidades
- **Filtros y paginación** avanzados
- **Validación robusta** con class-validator
- **Documentación automática** con Swagger
- **Error handling** centralizado
- **Logging** estructurado
- **Ready for Railway** deployment

## 📚 API Documentation

La documentación interactiva está disponible en:
- Local: `http://localhost:4000/docs`
- Staging: `https://api-staging.fixia.com.ar/docs`
- Producción: `https://api.fixia.com.ar/docs`

## 🛠️ Stack Tecnológico

- **Framework**: NestJS v10
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Railway
- **Testing**: Jest

## 🏗️ Arquitectura

```
src/
├── auth/           # Autenticación y autorización
├── users/          # Gestión de usuarios y perfiles
├── services/       # CRUD de servicios profesionales
├── projects/       # Gestión de proyectos y oportunidades
├── contact/        # Formulario de contacto
├── common/         # Servicios compartidos (Prisma, filtros, etc.)
└── main.ts         # Configuración principal
```

## 🔧 Configuración Local

### Prerequisites

- Node.js v18+
- PostgreSQL v13+
- npm o yarn

### Installation

1. **Clonar y instalar dependencias**:
```bash
cd apps/api
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fixia_dev"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"
```

3. **Configurar base de datos**:

**Opción A - Setup automático (Recomendado)**:
```bash
# Script interactivo de configuración
npm run db:setup
```

**Opción B - Setup manual**:
```bash
# Generar Prisma client
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de prueba
npm run db:seed

# Verificar configuración
npm run db:test
```

**Ver guía completa**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

4. **Iniciar servidor de desarrollo**:
```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:4000`

## 🚀 Deploy en Railway

### 1. Preparar el proyecto

1. Conectar tu repositorio a Railway
2. Configurar las variables de entorno en Railway dashboard

### 2. Variables de entorno requeridas

```env
# Railway provee automáticamente
DATABASE_URL=postgresql://...

# Configurar manualmente
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
JWT_REFRESH_SECRET=your-production-refresh-secret-very-long-and-secure
NODE_ENV=production
ALLOWED_ORIGINS=https://fixia.com.ar,https://www.fixia.com.ar
```

### 3. Deploy automático

Railway detectará automáticamente el `railway.json` y:
- Ejecutará `npm install && npm run build`
- Generará el cliente Prisma con `postinstall`
- Iniciará con `npm run start:prod`
- Realizará health checks en `/health`

### 4. Configurar base de datos

Railway creará automáticamente una base PostgreSQL. Para migrar:

```bash
# En Railway terminal o localmente con DATABASE_URL de producción
npm run db:deploy
npm run db:seed  # Solo si quieres datos de prueba
```

## 🔐 Usuarios de Prueba

Después del seed, puedes usar estas credenciales:

**Profesionales:**
- `carlos@fixia.com.ar` / `password123` (Desarrollador Web)
- `ana@fixia.com.ar` / `password123` (Diseñadora Gráfica)  
- `miguel@fixia.com.ar` / `password123` (Técnico Reparaciones)

**Cliente:**
- `cliente@fixia.com.ar` / `password123`

## 📝 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/forgot-password` - Recuperar contraseña

### Usuarios
- `GET /user/profile` - Perfil del usuario autenticado
- `PUT /user/profile` - Actualizar perfil
- `GET /user/dashboard` - Dashboard con estadísticas
- `GET /users/:id` - Perfil público de usuario

### Servicios
- `GET /services` - Listar servicios con filtros
- `GET /services/featured` - Servicios destacados
- `GET /services/categories` - Categorías disponibles
- `GET /services/:id` - Detalle de servicio
- `POST /services` - Crear servicio (solo profesionales)
- `PUT /services/:id` - Actualizar servicio propio
- `DELETE /services/:id` - Eliminar servicio propio

### Proyectos
- `GET /projects` - Listar proyectos del usuario
- `POST /projects` - Crear proyecto (solo clientes)
- `GET /projects/:id` - Detalle de proyecto
- `PUT /projects/:id` - Actualizar proyecto propio
- `DELETE /projects/:id` - Eliminar proyecto propio

### Oportunidades
- `GET /opportunities` - Oportunidades para profesionales
- `GET /opportunities/stats` - Estadísticas de oportunidades

### Contacto
- `POST /contact` - Enviar mensaje de contacto

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Watch mode
npm run test:watch
```

## 🔍 Filtros Disponibles

### Servicios
- `category_id` - Filtrar por categoría
- `location` - Filtrar por ubicación
- `min_price/max_price` - Rango de precios
- `rating_min` - Calificación mínima
- `professional_level` - Nivel del profesional
- `verified` - Solo profesionales verificados
- `search` - Búsqueda en título/descripción
- `sort_by` - Ordenar por (price, rating, created_at, view_count)
- `sort_order` - Orden (asc, desc)
- `page/limit` - Paginación

## 🛡️ Seguridad

- **Validación de entrada** con class-validator
- **Sanitización** automática de datos
- **Rate limiting** (pendiente de implementar)
- **CORS** configurado para dominios específicos
- **JWT** con expiración y refresh tokens
- **Passwords** hasheados con bcrypt
- **SQL injection** prevención con Prisma
- **Error handling** que no expone información sensible

## 📊 Monitoreo

- **Health check** endpoint en `/health`
- **Logging** estructurado con contexto
- **Error tracking** centralizado
- **Performance** monitoring con interceptors

## 🚨 Troubleshooting

### Error de conexión a BD
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar cadena de conexión
echo $DATABASE_URL
```

### Error de Prisma
```bash
# Regenerar cliente
npm run db:generate

# Reset completo
npm run db:reset
```

### Error de JWT
```bash
# Verificar que JWT_SECRET esté configurado
echo $JWT_SECRET
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

- Email: dev@fixia.com.ar
- Documentation: `/docs`
- Issues: GitHub Issues