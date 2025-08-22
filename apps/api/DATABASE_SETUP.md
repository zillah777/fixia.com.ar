# 🗄️ Configuración de Base de Datos - Fixia Marketplace

Esta guía te ayudará a configurar la base de datos PostgreSQL para el marketplace Fixia.

## 🚀 Setup Rápido

### Opción 1: Script Automático (Recomendado)
```bash
./setup-database.sh
```

### Opción 2: Manual
```bash
# 1. Configurar DATABASE_URL en .env
# 2. Generar cliente Prisma
npm run db:generate

# 3. Aplicar migraciones
npm run db:migrate

# 4. Cargar datos de prueba
npm run db:seed
```

## 📋 Opciones de Base de Datos

### 🚂 1. Railway PostgreSQL (Recomendado)
**Pros:** Fácil configuración, gratis hasta cierto límite, ideal para desarrollo y producción
**Contras:** Requiere cuenta en Railway

**Setup:**
1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Crea un nuevo proyecto
3. Agrega un servicio PostgreSQL
4. Copia la DATABASE_URL que te proporciona
5. Actualiza tu archivo `.env`:

```env
DATABASE_URL="postgresql://postgres:password@roundhouse.proxy.rlwy.net:12345/railway"
```

### ⚡ 2. Supabase PostgreSQL
**Pros:** Gratis, excelente para desarrollo, APIs adicionales
**Contras:** Requiere cuenta en Supabase

**Setup:**
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > Database
4. Copia la Connection String (URI format)
5. Actualiza tu archivo `.env`:

```env
DATABASE_URL="postgresql://postgres:password@db.supabaseproject.supabase.co:5432/postgres"
```

### 🐳 3. Docker PostgreSQL Local
**Pros:** Control total, sin dependencias externas
**Contras:** Requiere Docker instalado

**Setup:**
```bash
# Iniciar PostgreSQL con Docker
docker compose up -d postgres

# La DATABASE_URL ya está configurada para Docker
DATABASE_URL="postgresql://fixia_user:fixia_password_dev_2024@localhost:5432/fixia_dev?schema=public"
```

### 🗄️ 4. PostgreSQL Local Nativo
**Pros:** Máximo control y rendimiento
**Contras:** Instalación más compleja

**Setup:**
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE fixia_dev;
CREATE USER fixia_user WITH PASSWORD 'fixia_password_dev_2024';
GRANT ALL PRIVILEGES ON DATABASE fixia_dev TO fixia_user;
\q

# Actualizar .env
DATABASE_URL="postgresql://fixia_user:fixia_password_dev_2024@localhost:5432/fixia_dev?schema=public"
```

## 📦 Datos de Prueba Incluidos

El seed carga automáticamente:

### 📂 Categorías (8)
- Desarrollo Web
- Diseño Gráfico  
- Reparaciones
- Marketing Digital
- Consultoría
- Limpieza
- Jardinería
- Educación

### 👥 Usuarios (4)
**Profesionales:**
- **Carlos Rodríguez** (carlos@fixia.com.ar) - Developer Full Stack
- **Ana Martínez** (ana@fixia.com.ar) - Diseñadora Gráfica
- **Miguel Santos** (miguel@fixia.com.ar) - Técnico en Reparaciones

**Cliente:**
- **María González** (cliente@fixia.com.ar) - Cliente de prueba

**Contraseña para todos:** `password123`

### 🛍️ Servicios (6)
- Desarrollo Web Completo ($85,000)
- E-commerce con Pasarela de Pagos ($150,000)
- Identidad Visual Completa ($45,000)
- Gestión de Redes Sociales ($35,000)
- Reparación de Electrodomésticos ($8,500)
- Instalación de Aires Acondicionados ($15,000)

### 📋 Proyectos (2)
- Aplicación móvil para delivery
- Rediseño de marca para empresa turística

### ⭐ Reseñas (6)
Reseñas de ejemplo con puntuaciones de 4-5 estrellas

## 🔧 Scripts NPM Disponibles

```bash
# Generar cliente de Prisma
npm run db:generate

# Crear y aplicar migración en desarrollo
npm run db:migrate

# Cargar datos de prueba
npm run db:seed

# Resetear base de datos (¡CUIDADO!)
npm run db:reset

# Aplicar migraciones en producción
npm run db:deploy
```

## 🚀 Para Producción (Railway)

### Variables de Entorno Requeridas:
```env
DATABASE_URL=postgresql://postgres:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-in-production
NODE_ENV=production
```

### Deploy con Railway:
```bash
# Aplicar migraciones
npm run db:deploy

# Cargar datos iniciales (opcional)
npm run db:seed
```

## 🔍 Verificación

### Comprobar Conexión:
```bash
# Iniciar el backend
npm run start:dev

# Deberías ver:
# 🗄️ Database connected successfully
```

### Comprobar Datos:
1. Ve a tu dashboard de base de datos
2. Verifica que existan las tablas: `users`, `services`, `categories`, etc.
3. Comprueba que hay datos en las tablas principales

## ❗ Solución de Problemas

### Error: "Authentication failed"
- Verifica que la DATABASE_URL sea correcta
- Comprueba usuario y contraseña
- Asegúrate de que la base de datos esté accesible

### Error: "relation does not exist"
- Ejecuta las migraciones: `npm run db:migrate`
- Verifica que el schema esté actualizado

### Error: "connect ECONNREFUSED"
- Verifica que PostgreSQL esté ejecutándose
- Comprueba host y puerto en DATABASE_URL
- Para Docker: `docker compose ps`

### Error al hacer seed
- Asegúrate de que las migraciones estén aplicadas
- Verifica que no haya datos duplicados
- Usa `npm run db:reset` para empezar de cero

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend: `npm run start:dev`
2. Verifica tu archivo `.env`
3. Comprueba que la base de datos esté accessible
4. Ejecuta `./setup-database.sh` para configuración guiada