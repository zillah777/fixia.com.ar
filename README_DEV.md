# Fixia - Guía de Desarrollo

**Marketplace de microservicios profesionales de Chubut, Argentina**

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+

### Instalación y Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/fixia.com.ar.git
cd fixia.com.ar

# Instalar dependencias
pnpm install

# Setup base de datos local
docker-compose up -d postgres

# Ejecutar migraciones
pnpm db:migrate

# Poblar datos iniciales
pnpm db:seed

# Iniciar desarrollo
pnpm dev
```

### URLs de Desarrollo
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Documentación API**: http://localhost:4000/docs

## 🏗️ Arquitectura del Monorepo

```
fixia.com.ar/
├── apps/
│   ├── web/              # Frontend React/Next.js → Vercel
│   └── api/              # Backend NestJS → Railway  
├── packages/
│   ├── ui/               # Componentes UI compartidos
│   ├── types/            # Tipos TypeScript
│   ├── config/           # Configuraciones ESLint/TS
│   └── utils/            # Utilidades compartidas
├── docs/                 # Documentación técnica
├── state/                # Estado del proyecto (sprints, backlog)
└── prisma/              # Schema y migraciones DB
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests e2e
pnpm test:e2e

# Cobertura
pnpm test:coverage
```

## 📦 Build y Deploy

```bash
# Build completo
pnpm build

# Build solo frontend
pnpm build:web

# Build solo backend  
pnpm build:api

# Deploy staging
pnpm deploy:staging

# Deploy production
pnpm deploy:prod
```

## 🛠️ Comandos Útiles

```bash
# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm type-check

# Base de datos
pnpm db:migrate
pnpm db:seed
pnpm db:studio

# Agregar dependencia a workspace
pnpm add package-name --filter @fixia/web
pnpm add package-name --filter @fixia/api
```

## 📝 Convenciones

### Git Workflow
- **main**: Código production
- **develop**: Integración desarrollo  
- **feature/**: Nuevas funcionalidades
- **hotfix/**: Correcciones urgentes

### Commits
Usar [Conventional Commits](https://conventionalcommits.org/):
```
feat: add user authentication
fix: resolve login validation bug
docs: update API documentation
```

### Code Style
- TypeScript estricto
- ESLint + Prettier
- Tailwind CSS para estilos
- Componentes funcionales con hooks

## 🔒 Variables de Entorno

### Desarrollo (.env.local)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/fixia_dev"
JWT_SECRET="tu-jwt-secret-desarrollo"
NEXTAUTH_SECRET="tu-nextauth-secret"
```

### Production
Ver `docs/DEPLOYMENT_GUIDE.md` para configuración de variables en Vercel y Railway.

## 📚 Documentación Adicional

- [Mapeo Figma → Componentes](./docs/MAPEO_FIGMA.md)
- [API Specification](./docs/API.openapi.yaml) 
- [Modelo de Datos](./docs/DATA_MODEL.md)
- [Guía de Deploy](./docs/DEPLOYMENT_GUIDE.md)
- [Definition of Done](./docs/DOD.md)

## 🚨 Solución de Problemas

### Errores Comunes

**Error de conexión a DB:**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose up -d postgres
pnpm db:migrate
```

**Error de tipos TypeScript:**
```bash
# Regenerar tipos de Prisma
pnpm db:generate
pnpm type-check
```

**Error de build:**
```bash
# Limpiar cache y reinstalar
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

## 📞 Soporte

- **Documentación**: `/docs`
- **Issues**: GitHub Issues
- **Wiki**: GitHub Wiki
- **Team**: Consultar con team lead

---
**Última actualización**: 21 agosto 2025
**Versión**: 1.0.0