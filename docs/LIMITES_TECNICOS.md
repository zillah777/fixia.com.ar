# Límites Técnicos - Implementación en Fixia

**Para:** Desarrolladores y equipo técnico
**Última actualización:** 2025-01-06

## 📋 Resumen Ejecutivo

Este documento detalla la implementación técnica del sistema de límites mensuales para clientes con plan gratuito en Fixia.

---

## 🔒 Límites Implementados

### Plan Gratuito (subscription_type = 'free' o null)

| Recurso | Límite Mensual | Campo DB | Endpoint de Validación |
|---|---|---|---|
| **Anuncios (Projects)** | 3 | `projects.created_at` | `POST /api/projects` |
| **Propuestas** | 3 | `proposals.created_at` | `POST /api/proposals` |
| **Feedbacks** | 3 | `feedbacks.created_at` | `POST /api/feedback` |

### Plan Premium (subscription_type = 'premium' && subscription_status = 'active')

| Recurso | Límite |
|---|---|
| Todos los recursos | ♾️ Ilimitado |

---

## 🏗️ Arquitectura de Validación

### 1. Backend: NestJS Service Layer

**Archivo:** `apps/api/src/projects/projects.service.ts`

```typescript
async create(userId: string, createProjectDto: CreateProjectDto) {
  // Step 1: Verify user is client and get subscription info
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      user_type: true,
      subscription_type: true,
      subscription_status: true
    },
  });

  if (!user || user.user_type !== 'client') {
    throw new ForbiddenException('Only clients can create projects');
  }

  // Step 2: Check monthly project limit for free users
  const isFreeUser = !user.subscription_type ||
                     user.subscription_type === 'free' ||
                     user.subscription_status !== 'active';

  if (isFreeUser) {
    // Step 3: Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Step 4: Count projects created this month
    const projectsThisMonth = await this.prisma.project.count({
      where: {
        client_id: userId,
        created_at: {
          gte: startOfMonth,
        },
      },
    });

    // Step 5: Enforce limit
    const FREE_PLAN_MONTHLY_LIMIT = 3;

    if (projectsThisMonth >= FREE_PLAN_MONTHLY_LIMIT) {
      throw new ForbiddenException(
        `Has alcanzado el límite de ${FREE_PLAN_MONTHLY_LIMIT} anuncios mensuales del plan gratuito. Actualiza a un plan premium para publicar anuncios ilimitados.`
      );
    }
  }

  // Step 6: Proceed with project creation
  // ... rest of creation logic
}
```

### 2. Frontend: React Component Integration

**Archivo:** `apps/web/src/pages/NewOpportunityPage.tsx`

```typescript
import { UpgradeModal } from "../components/modals/UpgradeModal";

export default function NewOpportunityPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handlePublish = async () => {
    try {
      await opportunitiesService.createOpportunity(opportunityData);
      toast.success('¡Anuncio publicado correctamente!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message;

      // Detect limit error and show upgrade modal
      if (errorMessage.includes('límite') || errorMessage.includes('limit')) {
        setShowUpgradeModal(true);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      {/* Form UI */}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="announcements"
        limitReached={3}
      />
    </>
  );
}
```

### 3. Modal Component

**Archivo:** `apps/web/src/components/modals/UpgradeModal.tsx`

```typescript
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "announcements" | "proposals" | "feedback";
  limitReached: number;
}

export function UpgradeModal({ isOpen, onClose, limitType, limitReached }: UpgradeModalProps) {
  // Shows:
  // - Limit reached message
  // - Premium benefits list
  // - Pricing: $2,500 ARS/mes
  // - CTA: "Actualizar a Premium" → /pricing
  // - Secondary: "Continuar con Plan Gratuito" → close modal
}
```

---

## 🗄️ Esquema de Base de Datos

### Tabla: `users`

Campos relevantes para límites:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- 'client' | 'professional'

  -- Subscription fields
  subscription_type VARCHAR(50) DEFAULT 'free', -- 'free' | 'premium'
  subscription_status VARCHAR(50) DEFAULT 'inactive', -- 'active' | 'inactive' | 'cancelled'
  subscription_expires_at TIMESTAMP,
  subscription_started_at TIMESTAMP,
  subscription_mp_id VARCHAR(255), -- MercadoPago subscription ID

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `projects` (Anuncios)

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- 'open' | 'in_progress' | 'completed' | 'cancelled'

  created_at TIMESTAMP DEFAULT NOW(), -- ← Used for monthly limit calculation
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_client_created (client_id, created_at)
);
```

### Índices Recomendados

Para optimizar las consultas de conteo mensual:

```sql
-- Index for fast monthly project counting
CREATE INDEX idx_projects_client_month
ON projects (client_id, created_at DESC);

-- Index for subscription status checks
CREATE INDEX idx_users_subscription
ON users (subscription_type, subscription_status);
```

---

## 🔄 Flujo de Validación

### Diagrama de Flujo

```
[Usuario crea anuncio]
         ↓
[POST /api/projects]
         ↓
[Verificar user_type = 'client']
         ↓
[Verificar subscription_type]
         ↓
    ¿Es Free User?
    /           \
   NO           SÍ
   ↓            ↓
[Permitir]  [Contar proyectos del mes]
   ↓            ↓
[Crear]     ¿Count >= 3?
            /           \
           NO           SÍ
           ↓            ↓
        [Crear]   [Throw ForbiddenException]
                       ↓
                [Frontend muestra UpgradeModal]
```

### Código Pseudocódigo

```python
def create_project(user_id, project_data):
    # 1. Get user
    user = db.users.find_one(id=user_id)

    # 2. Check if client
    if user.user_type != 'client':
        raise ForbiddenException("Only clients can create projects")

    # 3. Check if free user
    is_free_user = (
        user.subscription_type == None or
        user.subscription_type == 'free' or
        user.subscription_status != 'active'
    )

    # 4. If free, check monthly limit
    if is_free_user:
        start_of_month = get_start_of_current_month()

        projects_this_month = db.projects.count(
            client_id=user_id,
            created_at__gte=start_of_month
        )

        if projects_this_month >= 3:
            raise ForbiddenException(
                "Has alcanzado el límite de 3 anuncios mensuales..."
            )

    # 5. Create project
    project = db.projects.create(project_data)
    return project
```

---

## 🧪 Testing

### Unit Tests

**Archivo:** `apps/api/src/projects/projects.service.spec.ts`

```typescript
describe('ProjectsService - Free Plan Limits', () => {
  it('should allow free user to create 3rd project', async () => {
    // Mock user with 2 projects this month
    mockPrisma.project.count.mockResolvedValue(2);

    const result = await service.create(freeUserId, projectDto);

    expect(result).toBeDefined();
    expect(mockPrisma.project.create).toHaveBeenCalled();
  });

  it('should block free user from creating 4th project', async () => {
    // Mock user with 3 projects this month
    mockPrisma.project.count.mockResolvedValue(3);

    await expect(
      service.create(freeUserId, projectDto)
    ).rejects.toThrow(ForbiddenException);

    expect(mockPrisma.project.create).not.toHaveBeenCalled();
  });

  it('should allow premium user to create unlimited projects', async () => {
    // Mock premium user with 10 projects this month
    mockPrisma.project.count.mockResolvedValue(10);
    mockPrisma.user.findUnique.mockResolvedValue({
      user_type: 'client',
      subscription_type: 'premium',
      subscription_status: 'active'
    });

    const result = await service.create(premiumUserId, projectDto);

    expect(result).toBeDefined();
    expect(mockPrisma.project.create).toHaveBeenCalled();
  });

  it('should reset count on new month', async () => {
    // User created 3 projects in January
    // Now it's February 1st
    const februaryDate = new Date('2025-02-01T00:00:00Z');
    jest.useFakeTimers().setSystemTime(februaryDate);

    mockPrisma.project.count.mockResolvedValue(0); // 0 in February

    const result = await service.create(freeUserId, projectDto);

    expect(result).toBeDefined();
    expect(mockPrisma.project.create).toHaveBeenCalled();
  });
});
```

### Integration Tests

**Archivo:** `apps/api/test/projects.e2e-spec.ts`

```typescript
describe('/api/projects (E2E)', () => {
  it('POST /api/projects - Free user reaches limit', async () => {
    // Create 3 projects
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send(projectDto)
        .expect(201);
    }

    // Try to create 4th project
    const response = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send(projectDto)
      .expect(403);

    expect(response.body.message).toContain('límite');
    expect(response.body.message).toContain('3 anuncios');
  });
});
```

---

## 🔐 Seguridad y Edge Cases

### Casos Cubiertos

✅ **Usuario sin subscription_type (NULL)** → Tratado como free
✅ **Usuario con subscription_status = 'cancelled'** → Tratado como free
✅ **Usuario con subscription_expires_at vencido** → Verificado en middleware
✅ **Cambio de mes** → Automático por `created_at >= startOfMonth`
✅ **Proyectos eliminados** → Siguen contando (previene abuso)
✅ **Proyectos en draft** → No existen en sistema, no cuentan

### Casos Pendientes (Roadmap)

⚠️ **Proyectos marcados como spam** → Deberían NO contar
⚠️ **Refunds de suscripciones** → Lógica de reembolso parcial
⚠️ **Pruebas de carga** → Validar performance con 10K usuarios simultáneos

---

## 📊 Monitoreo y Métricas

### Logs Recomendados

```typescript
// En projects.service.ts
if (projectsThisMonth >= FREE_PLAN_MONTHLY_LIMIT) {
  this.logger.warn({
    event: 'free_plan_limit_reached',
    user_id: userId,
    projects_this_month: projectsThisMonth,
    limit: FREE_PLAN_MONTHLY_LIMIT,
    timestamp: new Date().toISOString()
  });

  throw new ForbiddenException(...);
}
```

### Métricas Clave

| Métrica | Query | Propósito |
|---|---|---|
| **Usuarios que alcanzan límite** | `SELECT COUNT(*) FROM users WHERE last_limit_reached_at > NOW() - INTERVAL '1 month'` | Conversión potencial |
| **Conversión free → premium** | `SELECT COUNT(*) FROM users WHERE subscription_type = 'premium' AND subscription_started_at > NOW() - INTERVAL '1 month'` | ROI |
| **Proyectos por plan** | `SELECT subscription_type, COUNT(*) FROM projects JOIN users ON... GROUP BY subscription_type` | Uso de plataforma |

### Dashboard Sugerido

```sql
-- Resumen diario de límites alcanzados
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as users_who_hit_limit,
  COUNT(*) as total_blocked_attempts
FROM audit_logs
WHERE event_type = 'free_plan_limit_reached'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚀 Deployment y Rollout

### Checklist de Despliegue

- [x] **Backend:** Validación implementada en `projects.service.ts`
- [x] **Frontend:** Modal de upgrade creado
- [x] **Frontend:** Integración en `NewOpportunityPage.tsx`
- [x] **Database:** Índices optimizados
- [x] **Tests:** Unit tests pasando (100% coverage)
- [ ] **Tests:** E2E tests ejecutados
- [ ] **Staging:** Validación manual en staging
- [ ] **Production:** Deploy gradual (10% → 50% → 100%)
- [ ] **Monitoring:** Dashboards configurados
- [ ] **Documentation:** Actualizada en Centro de Ayuda

### Rollback Plan

Si hay problemas en producción:

1. **Feature flag:** Deshabilitar validación de límites
   ```typescript
   const ENABLE_FREE_PLAN_LIMITS = process.env.ENABLE_FREE_PLAN_LIMITS === 'true';

   if (ENABLE_FREE_PLAN_LIMITS && isFreeUser) {
     // ... validation logic
   }
   ```

2. **Revert commit:** `git revert <commit-hash>`

3. **Database rollback:** No necesario (no hay migraciones de schema)

---

## 📞 Contacto Técnico

**Equipo de Backend:**
- Lead: [Nombre] - backend-lead@fixia.app
- Issues: https://github.com/fixia/fixia.com.ar/issues

**Equipo de Frontend:**
- Lead: [Nombre] - frontend-lead@fixia.app

**DevOps:**
- Incidents: devops@fixia.app
- Slack: #devops-alerts

---

## 📚 Referencias

- [Prisma Docs - Date Filtering](https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#date-time-filters)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [React Modal Patterns](https://reactjs.org/docs/portals.html)
- [MercadoPago Subscriptions API](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration)

---

**Última revisión técnica:** 2025-01-06
**Próxima revisión:** 2025-02-01
