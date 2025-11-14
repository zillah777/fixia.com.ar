# Análisis del Sistema de Calificaciones y Reviews

**Fecha:** 2025-11-13 | **Versión:** 1.0 | **Estado:** Funcional con Problemas

## RESUMEN EJECUTIVO - ⚠️ CRÍTICO CON INCOMPLETOS

### Lo que FUNCIONA
- Creación y edición de reviews (1-5 estrellas)
- Cálculo automático de promedios
- Actualización de ratings en perfiles
- Validación de ratings entre 1-5
- Comentarios hasta 1000 caracteres
- Relación bidireccional cliente-profesional

### Lo que FALTA/ESTÁ ROTO
- Validación de completación depende de Job (problema si no existe)
- Sin sistema de moderación (campos no existen en BD)
- Sin auditoría de cambios (qué cambió, cuándo, quién)
- Sin protección contra spam (rate limiting)
- Eliminación sin registrar (hard delete, no soft delete)
- Sin protección contra ratings vengativas

---

## 1. CREACIÓN DE RATINGS Y REVIEWS

### Backend
- **Controlador:** `apps/api/src/matching/match.controller.ts:207-216`
- **Endpoint:** `POST /matches/:matchId/reviews`
- **Lógica:** `apps/api/src/matching/review.service.ts:18-134`

### Frontend
- **Componente:** `apps/web/src/components/match/ReviewForm.tsx`
- **Servicio:** `apps/web/src/lib/services/review.service.ts`

### Validaciones Realizadas
1. Match existe
2. Usuario es parte del match (cliente O profesional)
3. Sin review previo del mismo usuario
4. Completación confirmada (SI match.job_id existe)
5. Ratings entre 1-5
6. Comentario máx 1000 caracteres

---

## 2. ALMACENAMIENTO DE CALIFICACIONES

### Tabla: match_reviews
```
├─ id (UUID)
├─ match_id + reviewer_id (UNIQUE) - Garantiza 1 review por persona
├─ overall_rating (1-5, REQUERIDO)
├─ communication/quality/professionalism/timeliness_rating (1-5, OPCIONALES)
├─ comment (String, máx 1000 chars, OPCIONAL)
├─ verified_match (Boolean, siempre true)
├─ created_at / updated_at
└─ Relaciones: match, reviewer, reviewed_user
```

### Tabla: professional_profiles
- `rating` (Float): Promedio general
- `review_count` (Int): Total recibidos
- Se actualiza automáticamente

---

## 3. ACCESO A RATINGS/REVIEWS

### Endpoints
```
GET /matches/:matchId/reviews
GET /matches/:matchId/reviews/status
GET /matches/:matchId/reviews/can-review
GET /matches/users/:userId/reviews
GET /matches/users/:userId/reviews/stats
PUT /matches/reviews/:reviewId
DELETE /matches/reviews/:reviewId
```

### Métodos
- `getUserReviews()` - Reviews recibidas
- `getMatchReviews()` - Reviews de un match
- `getReviewStatus()` - Quién revisó a quién
- `getReviewStats()` - Promedios y distribución
- `canLeaveReview()` - ¿Puede revisar?

---

## 4. CUÁNDO SE PUEDEN HACER RATINGS

### Condiciones (TODAS deben ser verdaderas)
1. Usuario es parte del match
2. Completación confirmada en job (⚠️ PROBLEMA si no existe job)
3. Sin review previo del mismo usuario
4. Ratings válidos (1-5)

### Verificación
```typescript
// En canLeaveReview()
- Match existe
- Usuario es client O professional del match
- Si match.job_id existe: job.completion_confirmed_at != null
- Sin existingReview con unique (match_id, reviewer_id)
```

---

## 5. CÁLCULO DE RATINGS PROMEDIO

### Proceso
1. Obtener todos reviews donde reviewed_user_id = userId
2. Sumar overall_rating / contar = promedio (redondeo 1 decimal)
3. Para ratings opcionales: solo contar los que existen
4. Contar distribución (1⭐, 2⭐, 3⭐, 4⭐, 5⭐)

### Fórmula
```
average_overall = Math.round((sum / count) * 10) / 10
average_communication = sum_communication / count_con_communication
... similar para otros ratings
```

### Actualización Automática
Se actualiza cada vez que se crea/edita/elimina review:
```typescript
updateProfessionalRating(userId) {
  stats = getReviewStats(userId)
  UPDATE professional_profiles SET 
    rating = stats.average_overall_rating,
    review_count = stats.total_reviews
}
```

---

## 6. CAMPOS DE LOS RATINGS/REVIEWS

| Campo | Tipo | Req | Validación |
|-------|------|-----|-----------|
| overall_rating | Int | SÍ | 1-5 |
| communication_rating | Int | No | 1-5 |
| quality_rating | Int | No | 1-5 |
| professionalism_rating | Int | No | 1-5 |
| timeliness_rating | Int | No | 1-5 |
| comment | String | No | Max 1000 |
| verified_match | Boolean | Siempre true |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

---

## 7. PROBLEMAS EN ESTE FLUJO

### PROBLEMA #1: ⚠️ CRÍTICO - Completación sin Job
**Dónde:** `review.service.ts:62-72`

Si match.job_id es NULL, se salta validación de completación:
```typescript
if (match.job_id) {  // ← Si es null, salta esto
  const job = await this.prisma.job.findUnique(...);
  if (!job.completion_confirmed_at) throw error;
}
// Usuario puede revisar sin confirmación
```

**Solución:** Agregar completion_confirmed_at directamente en Match

---

### PROBLEMA #2: ⚠️ IMPORTANTE - Sin Moderación
**Dónde:** `review-moderation.service.ts`

Campos necesarios no existen:
- No hay moderation_status (pending/approved/rejected)
- No hay flagged_count
- No hay moderator_id

**Solución:** Agregar campos al modelo MatchReview

---

### PROBLEMA #3: ⚠️ IMPORTANTE - Actualización Ilimitada
**Dónde:** `review.service.ts:380-440`

Puede cambiar review indefinidamente antes que el otro revise:
- Usuario A revisa lunes 1⭐
- Usuario A revisa martes 5⭐
- Permitido (no hay límite ni auditoría)

**Solución:** Máx 24h para editar O no editar si el otro ya revisó

---

### PROBLEMA #4: ⚠️ IMPORTANTE - Eliminación sin Auditoría
**Dónde:** `review.service.ts:445-480`

Hard delete, sin historial:
```typescript
await prisma.matchReview.delete({ where: { id } });
// Desaparece completamente, el revisado no sabe por qué su rating bajó
```

**Solución:** Soft delete con deleted_at, deleted_reason

---

### PROBLEMA #5: ⚠️ MODERADO - Sin Rate Limiting
Puede spammear reviews si completa muchos trabajos el mismo día

**Solución:** @RateLimit({windowMs: 3600000, max: 10}) // 10 por hora

---

### PROBLEMA #6: ⚠️ LEVE - Incoherencia de Ratings
Permitido: overall_rating=5 pero communication_rating=1

**Solución:** Validar que overall esté cerca del promedio de otros

---

## 8. FLUJO COMPLETO

1. Professional completa trabajo
2. Client confirma: PUT /matches/{id}/confirm-completion
3. Backend: job.completion_confirmed_at = NOW()
4. Frontend: GET /matches/{id}/reviews/can-review → true
5. Client: POST /matches/{id}/reviews con ratings
6. Backend valida (completación, ratings, no review previo)
7. Guarda en match_reviews
8. Actualiza professional_profiles.rating
9. Envía notificación a Professional
10. Professional revisa Client (igual proceso)
11. Ambos revisaron → both_reviewed=true

---

## 9. RECOMENDACIONES

### FIXES CRÍTICOS (2-3 horas)
1. Validar completación sin depender de job_id
2. Agregar campos de moderación a BD
3. Implementar soft delete (deleted_at)

### FEATURES IMPORTANTES (4-6 horas)
4. Rate limiting (máx 10 reviews/hora)
5. Auditoría de cambios (quién cambió qué cuándo)
6. Sistema de flags/reportes

### NICE TO HAVE (8+ horas)
7. Validación de coherencia entre ratings
8. Información contextual (job_title, category)
9. Analytics y dashboards

---

## Archivos Clave

**Backend:**
- Controller: `apps/api/src/matching/match.controller.ts`
- Service: `apps/api/src/matching/review.service.ts`
- DTOs: `apps/api/src/matching/dto/review.dto.ts`
- Schema: `apps/api/prisma/schema.prisma` (línea 278-304)

**Frontend:**
- Form: `apps/web/src/components/match/ReviewForm.tsx`
- Card: `apps/web/src/components/match/ReviewCard.tsx`
- Section: `apps/web/src/components/match/ReviewsSection.tsx`
- Stats: `apps/web/src/components/profile/UserReviewStats.tsx`
- Service: `apps/web/src/lib/services/review.service.ts`

