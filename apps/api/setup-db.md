# Configuración de Base de Datos para Fixia

## Opción 1: Railway PostgreSQL (Recomendado para desarrollo y producción)

### Paso 1: Crear proyecto en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Agrega un servicio PostgreSQL
4. Copia la DATABASE_URL que te proporciona

### Paso 2: Configurar variables de entorno
Actualiza el archivo `.env` con tu DATABASE_URL de Railway:

```env
DATABASE_URL="postgresql://postgres:password@roundhouse.proxy.rlwy.net:12345/railway"
```

### Paso 3: Aplicar migraciones y seed
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Opción 2: PostgreSQL Local con Docker

### Paso 1: Instalar Docker
- Windows: Docker Desktop
- Linux: `sudo apt install docker.io docker-compose`
- macOS: Docker Desktop

### Paso 2: Iniciar base de datos
```bash
docker compose up -d postgres
```

### Paso 3: Aplicar migraciones
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Opción 3: PostgreSQL Local Nativo

### Paso 1: Instalar PostgreSQL
- Windows: Descarga desde postgresql.org
- Linux: `sudo apt install postgresql postgresql-contrib`
- macOS: `brew install postgresql`

### Paso 2: Crear base de datos
```sql
CREATE DATABASE fixia_dev;
CREATE USER fixia_user WITH PASSWORD 'fixia_password_dev_2024';
GRANT ALL PRIVILEGES ON DATABASE fixia_dev TO fixia_user;
```

### Paso 3: Configurar .env y aplicar migraciones
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Scripts NPM disponibles

- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:migrate` - Crea y aplica migraciones
- `npm run db:seed` - Carga datos de prueba
- `npm run db:reset` - Resetea la base de datos
- `npm run db:deploy` - Aplica migraciones en producción

## Datos de prueba incluidos

El seed incluye:
- 8 categorías de servicios
- 3 profesionales verificados
- 1 cliente de prueba
- 6 servicios de ejemplo
- 2 proyectos abiertos
- 6 reseñas de ejemplo

### Credenciales de prueba:
**Profesionales:**
- carlos@fixia.com.ar / password123
- ana@fixia.com.ar / password123  
- miguel@fixia.com.ar / password123

**Cliente:**
- cliente@fixia.com.ar / password123