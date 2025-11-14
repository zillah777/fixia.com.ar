# 🎯 PLAN MAESTRO DETALLADO - FIXIA.COM.AR

**Fecha:** 13 Noviembre 2025
**Versión:** 1.0.0
**Status:** Análisis Completo - Listo para Ejecución

---

## 📊 RESUMEN EJECUTIVO

### Problemas Encontrados: 37 Total
- **🔴 Críticos:** 9 problemas (0-1 semana)
- **🟠 Importantes:** 14 problemas (1-2 semanas)
- **🟡 Moderados:** 10 problemas (2-4 semanas)
- **🟢 Leves:** 6 problemas (Nice-to-have)

### Esfuerzo Total: 52-72 horas
- **Sprint 0:** 2-3 horas (urgente)
- **Sprint 1:** 8-10 horas (semana 1)
- **Sprint 2:** 8-10 horas (semana 2)
- **Sprint 3:** 8-10 horas (semana 3-4)
- **Extras (32-37):** 12-17 horas (nice-to-have)

### Sprints Recomendados: 3-4 sprints de 2 semanas + fase de extras opcional

---

## 🔴 PROBLEMAS CRÍTICOS (URGENTES)

### 1. Admin Role Sin Validación (CRÍTICO DE SEGURIDAD)
- **Severidad:** 🔴 CRÍTICA
- **Archivos:** `review-moderation.controller.ts`
- **Problema:** Cualquier usuario puede moderar reseñas
- **Impacto:** Violación OWASP A01 - Broken Access Control
- **Solución:** Agregar `@UseGuards(RolesGuard)` y `@Roles('admin')` en todos endpoints admin
- **Tiempo:** 30 min
- **Dependencia:** Fix #5

### 2. 'admin' Role No Está en Enum
- **Severidad:** 🔴 ARQUITECTURA
- **Archivo:** `schema.prisma` línea 813
- **Problema:** Enum UserType no incluye 'admin'
- **Solución:** Agregar `admin` al enum
- **Pasos:**
  1. Editar schema.prisma
  2. `npx prisma migrate dev --name add_admin_role`
  3. Script para promover usuarios
- **Tiempo:** 45 min
- **Debe hacerse primero:** SÍ

### 3. RolesGuard No Soporta Lógica 'dual'
- **Severidad:** 🔴 FUNCIONALIDAD ROTA
- **Archivo:** `roles.guard.ts`
- **Problema:** Usuarios 'dual' bloqueados de endpoints profesionales
- **Impacto:** Usuarios pagan pero no pueden usar funcionalidad
- **Solución:** Implementar lógica dual en RolesGuard
- **Tiempo:** 1-1.5 horas
- **Código necesario:**
```typescript
const PROFESSIONAL_ROLES = ['professional', 'dual'];
const DUAL_AWARE_ROLES = (role: string) => {
  if (role === 'professional') return PROFESSIONAL_ROLES;
  return [role];
};
return requiredRoles.some((role) => {
  const validRoles = DUAL_AWARE_ROLES(role);
  return validRoles.includes(user?.user_type);
});
```

### 4. Usuarios 'dual' No Pueden Crear Servicios
- **Severidad:** 🔴 FUNCIONALIDAD ROTA
- **Archivo:** `services.service.ts` línea 22
- **Problema:** Validación rechaza 'dual' aunque deberían poder crear
- **Impacto:** Funcionalidad premium incompleta
- **Solución:** Reemplazar validación con constante reutilizable
- **Tiempo:** 2 horas (búsqueda exhaustiva)
- **Código:**
```typescript
const PROFESSIONAL_ROLES = ['professional', 'dual'];
if (!user || !PROFESSIONAL_ROLES.includes(user.user_type)) {
  throw new ForbiddenException('Only professionals can create services');
}
```

### 5. JWT Payload No Incluye 'dual'
- **Severidad:** 🔴 AUTORIZACIÓN
- **Archivo:** `jwt.strategy.ts` línea 11
- **Problema:** Interface JwtPayload falta 'dual'
- **Impacto:** Token no representa completamente al usuario
- **Solución:** Actualizar interface y payload generation
- **Tiempo:** 1 hora
- **Código:**
```typescript
export interface JwtPayload {
  user_type: 'client' | 'professional' | 'dual';  // Agregar 'dual'
  sub: string;
  email: string;
  subscription_type?: 'free' | 'premium' | 'professional';
  subscription_status?: 'active' | 'inactive';
}
```

### 6. Match Creado Desde Frontend (ARQUITECTURA INCORRECTA)
- **Severidad:** 🔴 ARQUITECTURA
- **Archivo:** `ProposalCard.tsx` línea 87-104
- **Problema:** Creación de entidad crítica desde cliente (unreliable)
- **Impacto:** Si frontend falla, match no existe aunque propuesta aceptada
- **Solución:** Mover creación a backend en transacción atómica
- **Tiempo:** 2-3 horas
- **Archivos:**
  - `opportunities.service.ts` - Agregar creación Match
  - `ProposalCard.tsx` - Remover createMatch()

### 7. notifyMatchCreated() NUNCA se Invoca
- **Severidad:** 🔴 FUNCIONALIDAD ROTA
- **Archivo:** `notification.service.ts` línea 106-114
- **Problema:** Profesionales no reciben notificación de matches
- **Impacto:** Matches en limbo, experiencia pobre
- **Solución:** Invocar en acceptProposal() después de crear Match
- **Tiempo:** 1-2 horas
- **Dependencia:** Fix #6

### 8. Sin Validaciones en createMatch()
- **Severidad:** 🔴 INTEGRIDAD DE DATOS
- **Archivo:** `match.service.ts` línea 50-100
- **Problema:** No verifica propuesta, estado, propiedad
- **Impacto:** Crear matches con datos inválidos
- **Solución:** Agregar validaciones listadas en plan
- **Tiempo:** 1.5-2 horas
- **Validaciones necesarias:**
  1. Propuesta existe
  2. Propuesta está aceptada
  3. Usuario es propietario del proyecto
  4. Match no existe ya

### 9. Validación de Completación Sin Job
- **Severidad:** 🔴 LÓGICA DE NEGOCIO
- **Archivo:** `review.service.ts` línea 62-72
- **Problema:** Si match.job_id es NULL, se salta validación
- **Impacto:** Reviews sin confirmación de completación
- **Solución:** Agregar `completion_confirmed_at` a Match o validar Job
- **Tiempo:** 1.5-2 horas

---

## 🟠 PROBLEMAS IMPORTANTES (Semanas 1-2)

### 10. Confusión Servicios vs Proyectos en Frontend
- **Archivo:** `NewProjectPage.tsx`
- **Problema:** Página se llama "Proyecto" pero crea "Servicios"
- **Tiempo:** 2-3 horas

### 11. Sin Validación budget_min ≤ budget_max
- **Archivo:** `create-project.dto.ts`
- **Problema:** Cliente puede crear presupuesto inválido
- **Tiempo:** 1 hora

### 12. Imágenes/Galería se Pierden
- **Archivo:** `schema.prisma`
- **Problema:** Frontend sube imágenes pero no se guardan en BD
- **Solución:** Agregar `main_image_url` y `gallery_urls[]` a Project
- **Tiempo:** 2-3 horas

### 13. Límite de Proyectos Hardcodeado
- **Archivo:** `projects.service.ts`
- **Problema:** "3" hardcodeado, no configurable
- **Tiempo:** 1-1.5 horas

### 14. Sin Rate Limiting
- **Archivo:** Todos endpoints POST
- **Problema:** DoS attack posible
- **Tiempo:** 2 horas

### 15. Deadline Puede Ser en Pasado
- **Archivo:** `create-project.dto.ts`
- **Problema:** No valida que deadline > ahora
- **Tiempo:** 30 min

### 16. Milestones No Vinculados a Payments
- **Archivo:** `schema.prisma`
- **Problema:** Imposible rastrear pago = hito
- **Tiempo:** 2-3 horas

### 17. Inconsistencia Serialización snake_case/camelCase
- **Archivos:** Backend → Frontend
- **Problema:** Backend devuelve snake_case, Frontend espera camelCase
- **Solución:** Interceptor global de transformación
- **Tiempo:** 3-4 horas

### 18. Sin Sistema de Moderación de Reviews
- **Archivo:** `review-moderation.service.ts`
- **Problema:** No se pueden rechazar reviews inapropiados
- **Solución:** Agregar campos `moderation_status`, `flagged_count`, `moderated_by`
- **Tiempo:** 4-6 horas

### 19. Actualización de Reviews Sin Límite
- **Archivo:** `review.service.ts`
- **Problema:** Usuario puede cambiar review indefinidamente
- **Solución:** Límite de 24 horas + auditoría
- **Tiempo:** 2-3 horas

### 20. Eliminación de Reviews Sin Auditoría
- **Archivo:** `review.service.ts`
- **Problema:** Hard delete, no hay auditoría
- **Solución:** Soft delete con `deleted_at` y `deleted_reason`
- **Tiempo:** 2-3 horas

### 21. Sin Rate Limiting en Reviews
- **Archivo:** `match.controller.ts`
- **Problema:** Spam posible
- **Tiempo:** 30 min

---

## 🟡 PROBLEMAS MODERADOS (Semanas 2-4)

### 22. Incoherencia de Ratings
- **Severidad:** 🟡 MODERADO
- **Archivo:** `review.service.ts`
- **Problema:** overall=5 pero communication=1 (inconsistencia lógica)
- **Solución:** Validar que overall no sea > promedio de scores individuales
- **Tiempo:** 1 hora

### 23. Sin Información Contextual en Reviews
- **Severidad:** 🟡 MODERADO
- **Archivo:** `review.entity.ts`
- **Problema:** Review no guarda job_title, price (contexto perdido)
- **Solución:** Agregar campos `job_title` y `price_snapshot` a Review
- **Tiempo:** 1 hora

### 24. Sin Índices en BD - Matches
- **Severidad:** 🟡 PERFORMANCE
- **Archivo:** `schema.prisma`
- **Problema:** Faltan índices en tabla matches (queries lentas)
- **Solución:** Agregar índices en `client_id`, `professional_id`, `status`
- **Tiempo:** 1 hora

### 25. Sin Índices en BD - Jobs
- **Severidad:** 🟡 PERFORMANCE
- **Archivo:** `schema.prisma`
- **Problema:** Faltan índices en tabla jobs
- **Solución:** Agregar índices en `client_id`, `status`, `created_at`
- **Tiempo:** 1 hora

### 26. Sin Índices en BD - Feedback
- **Severidad:** 🟡 PERFORMANCE
- **Archivo:** `schema.prisma`
- **Problema:** Faltan índices en tabla reviews/feedback
- **Solución:** Agregar índices en `match_id`, `reviewer_id`, `created_at`
- **Tiempo:** 1 hora

### 27. Sin Timeout en Flujo de Completación
- **Severidad:** 🟡 FUNCIONALIDAD
- **Archivo:** `match.service.ts`
- **Problema:** Match puede quedar en "pending_completion" indefinidamente
- **Solución:** Agregar timeout automático después de N días
- **Tiempo:** 1.5 horas

### 28. Inconsistencia en Códigos de Error
- **Severidad:** 🟡 MANTENIBILIDAD
- **Archivo:** `common/exceptions/`
- **Problema:** Diferentes endpoints usan diferentes códigos para mismo error
- **Solución:** Crear catálogo centralizado de códigos de error
- **Tiempo:** 1-2 horas

### 29. Sin Validación de Suscripción
- **Severidad:** 🟡 NEGOCIO
- **Archivo:** `subscription.service.ts`
- **Problema:** Usuarios activos pueden perder acceso sin notificación
- **Solución:** Validar suscripción activa en endpoints premium
- **Tiempo:** 2-3 horas

### 30. Log Incompleto JobStatusUpdate
- **Severidad:** 🟡 AUDITORÍA
- **Archivo:** `job.service.ts`
- **Problema:** No se registra quién cambió el status o por qué
- **Solución:** Agregar campos `changed_by`, `change_reason` a logs
- **Tiempo:** 1 hora

### 31. Sin Versionado de API
- **Severidad:** 🟡 MANTENIBILIDAD
- **Archivo:** `main.ts`
- **Problema:** Cambios de API rompen clientes viejos
- **Solución:** Implementar `/v1/`, `/v2/` con deprecación gradual
- **Tiempo:** 2-3 horas

---

## 🟢 PROBLEMAS LEVES

### 32. Falta Internacionalización (i18n)
- **Severidad:** 🟢 LEVE
- **Archivo:** Backend y Frontend
- **Problema:** Textos hardcodeados en español
- **Solución:** Implementar i18n para EN/ES
- **Tiempo:** 3-4 horas

### 33. Sin Cumplimiento GDPR
- **Severidad:** 🟢 LEVE (Legal)
- **Archivo:** `user.service.ts`
- **Problema:** No hay endpoint para exportar/eliminar datos
- **Solución:** Agregar `exportUserData()` y `deleteUserData()`
- **Tiempo:** 2-3 horas

### 34. Sin Tracking de Analytics
- **Severidad:** 🟢 LEVE
- **Archivo:** Toda la app
- **Problema:** No hay métrica de user behavior
- **Solución:** Integrar Mixpanel o similar
- **Tiempo:** 2 horas

### 35. Sin Documentación de API
- **Severidad:** 🟢 LEVE
- **Archivo:** `main.ts`
- **Problema:** Swagger/OpenAPI no configurado
- **Solución:** Agregar `@nestjs/swagger`
- **Tiempo:** 1-2 horas

### 36. Caché Incompleto
- **Severidad:** 🟢 LEVE
- **Archivo:** Services
- **Problema:** Datos no cacheados adecuadamente
- **Solución:** Implementar Redis caching estratégico
- **Tiempo:** 2 horas

### 37. Sin Notificaciones Email
- **Severidad:** 🟢 LEVE
- **Archivo:** `notification.service.ts`
- **Problema:** Solo notificaciones en-app
- **Solución:** Integrar SendGrid/Nodemailer
- **Tiempo:** 2-3 horas

**Tiempo combinado problemas 32-37:** 12-17 horas

---

## 📋 PLAN DE IMPLEMENTACIÓN

### **SPRINT 0 (Urgente - 2-3 días)**
Solo arreglos críticos de seguridad:
1. Fix #5: Agregar 'admin' a enum
2. Fix #1: Validar admin role
3. Fix #2: RolesGuard con dual

**Tiempo:** 2-3 horas

### **SPRINT 1 (Semana 1)**
Arquitectura y funcionalidad:
1. Fix #6: Mover Match creation a backend
2. Fix #7: Invocar notifyMatchCreated()
3. Fix #8: Validaciones en createMatch()
4. Fix #4: Servicios para 'dual'
5. Fix #3: JWT payload

**Tiempo:** 8-10 horas
**Resultado:** Matching funcional

### **SPRINT 2 (Semana 2)**
Reviews y ratings:
1. Fix #9: Validación de completación
2. Fix #19: Límite actualización 24h
3. Fix #20: Soft delete
4. Fix #21: Rate limiting
5. Fix #18: Moderación

**Tiempo:** 8-10 horas
**Resultado:** Reviews robusto

### **SPRINT 3 (Semana 3-4)**
Validación y integrity:
1. Fix #11: budget_min ≤ budget_max
2. Fix #12: Imágenes en BD
3. Fix #15: Deadline futuro
4. Fix #14: Rate limiting global
5. Fix #13: Límites configurable
6. Fix #17: Serialización
7. Fix #24: Índices en Matches
8. Fix #25: Índices en Jobs
9. Fix #26: Índices en Feedback

**Tiempo:** 8-10 horas
**Resultado:** Data integrity completo

---

## 💾 ARCHIVOS A MODIFICAR

**Backend (20+ archivos):**
- schema.prisma
- auth/strategies/jwt.strategy.ts
- auth/guards/roles.guard.ts
- projects/opportunities.service.ts
- projects/dto/create-project.dto.ts
- services/services.service.ts
- matching/match.service.ts
- matching/review.service.ts
- matching/notification.service.ts
- Y más...

**Frontend (10+ archivos):**
- ProposalCard.tsx
- NewProjectPage.tsx
- Múltiples servicios

**Total:** ~30 archivos

---

## 🎯 IMPACTO ESPERADO

| Fase | Resultado |
|------|-----------|
| Sprint 0 | 0% brecha seguridad admin |
| Sprint 1 | 100% usuarios pueden matchear |
| Sprint 2 | 0% reviews sin confirmación |
| Sprint 3 | 0% datos inválidos |

---

## 📌 NOTAS FINALES

- **Todos los problemas son resolvibles**
- **No hay cambios de arquitectura mayor**
- **Cada sprint es independiente** (pueden paralelizarse)
- **Recomendado hacer Sprint 0 primero** (seguridad)
- **Después sprints 1-3 en paralelo o secuencial**

---

**Documento generado:** 13 Noviembre 2025
**Por:** Análisis Automático con Agentes Especializados
