# 🎨 Diseño UX/UI: Sistema de Trabajos Contratados

## 📋 Objetivo
Crear una experiencia visual moderna, atractiva y funcional para que clientes y profesionales gestionen trabajos contratados con máximo impacto visual y facilidad de uso.

---

## 🎯 Principios de Diseño

### 1. **Conexión Visual**
- Mostrar claramente la vinculación entre cliente y profesional
- Avatares destacados de ambas partes
- Indicadores de estado del trabajo en tiempo real

### 2. **Progreso Transparente**
- Barra de progreso visual con milestones
- Timeline interactivo de actualizaciones
- Badges de estado coloridos y descriptivos

### 3. **Call-to-Actions Claros**
- Botones grandes y coloridos para acciones principales
- Microinteracciones con Framer Motion
- Feedback visual inmediato

### 4. **Trust & Safety**
- Mostrar Trust Score de ambas partes
- Badges de verificación
- Historial de comunicaciones

---

## 🎨 Componente Principal: `ActiveJobCard`

### Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  🔵 [Estado Badge]              💰 $3,900 ARS    🕐 3 días  │
│                                                               │
│  ┌──────┐                         ┌──────┐                  │
│  │ 👤   │  Juan Pérez            │ 👤   │  María García   │
│  │Client│  ⭐ 4.8 (12)            │ Pro  │  ⭐ 4.9 (45)     │
│  └──────┘                         └──────┘                  │
│                                                               │
│  📋 Desarrollo de sitio web e-commerce                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                               │
│  ⏳ Progreso: 60% completado                                │
│  ████████████░░░░░░░░░░                                     │
│                                                               │
│  ✅ Milestone 1: Diseño UI - Completado                     │
│  🔄 Milestone 2: Desarrollo Backend - En progreso           │
│  ⏸  Milestone 3: Testing - Pendiente                        │
│                                                               │
│  💬 3 mensajes nuevos    📎 2 archivos adjuntos             │
│                                                               │
│  [Ver Detalles] [Mensaje] [Marcar Completado] [Calificar]  │
└─────────────────────────────────────────────────────────────┘
```

### Estados Visuales

#### **🔵 En Progreso** (in_progress)
- Color: Blue-500 gradient
- Animación: Pulso sutil
- Icono: Clock animado

#### **✅ Completado - Pendiente Calificación** (completed)
- Color: Green-500 gradient
- Animación: Checkmark con confetti
- Icono: CheckCircle con brillos
- CTA Principal: **"Calificar y Dejar Reseña"**

#### **⏸ En Revisión** (milestone_review)
- Color: Amber-500 gradient
- Animación: Breathing effect
- Icono: Eye con escaneo

#### **❌ Cancelado** (cancelled)
- Color: Red-500 con opacity
- Estado visual: Desaturado
- Sin CTAs principales

---

## 📱 Vista Cliente: "Mis Trabajos Contratados"

### Layout Principal

```typescript
// Tabs superiores con badges de conteo
[En Progreso (3)] [Completados (12)] [Histórico (45)]

// Grid adaptativo
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  <ActiveJobCard />
  <ActiveJobCard />
  <ActiveJobCard />
</div>
```

### Características Especiales para Clientes

1. **Vista Compacta** (por defecto)
   - Card de altura fija
   - Información esencial visible
   - Expandible con animación

2. **Vista Detallada** (expandido)
   - Muestra timeline completo
   - Chat integrado
   - Archivos adjuntos
   - Historial de pagos

3. **Quick Actions**
   - Aprobar milestone: Un solo click
   - Enviar mensaje: Modal inline
   - Solicitar actualización: Template mensaje

---

## 👨‍💼 Vista Profesional: "Mis Trabajos"

### Layout Principal

```typescript
// Tabs con analytics visuales
[Activos (5)] [Completados (23)] [Por Calificar (2)] [Histórico (67)]

// Vista Kanban estilo Trello
<div className="flex gap-4 overflow-x-auto pb-4">
  <Column title="Por Iniciar" jobs={[...]} />
  <Column title="En Progreso" jobs={[...]} />
  <Column title="Revisión Cliente" jobs={[...]} />
  <Column title="Completados" jobs={[...]} />
</div>
```

### Características Especiales para Profesionales

1. **Dashboard de Progreso**
   - Métricas de tiempo
   - Earnings this month
   - Completion rate
   - Average rating

2. **Actualización Rápida de Estado**
   - Drag & drop entre columnas
   - Click derecho para opciones
   - Botón flotante "Actualizar Progreso"

3. **Milestone Manager**
   - Crear/editar milestones
   - Marcar como completado
   - Adjuntar evidencia (fotos/docs)

---

## 🎭 Modal de Calificación Mutua

### Trigger
Cuando el trabajo llega a estado `completed` y no hay review:

```typescript
// Aparece en ambas vistas con máxima prominencia
<Card className="border-2 border-primary animate-pulse-glow">
  <CardHeader>
    <Sparkles /> ¡Es hora de calificar!
  </CardHeader>
  <CardContent>
    Este trabajo fue completado. Comparte tu experiencia.
    [Calificar Ahora] // Grande, colorido, imposible de ignorar
  </CardContent>
</Card>
```

### Diseño del Modal

```
┌──────────────────────────────────────────────┐
│  ✨ Califica tu experiencia con Juan Pérez   │
│                                                │
│  Desarrollo de sitio web e-commerce          │
│  Completado el 15 de Nov, 2025                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                │
│  ⭐ Calificación General                      │
│  ★ ★ ★ ★ ★  (Hover para seleccionar)        │
│                                                │
│  📊 Calificaciones Detalladas                 │
│                                                │
│  💬 Comunicación        ★★★★★                 │
│  ⚡ Calidad del Trabajo  ★★★★★                 │
│  ⏰ Puntualidad          ★★★★★                 │
│  👔 Profesionalismo     ★★★★★                 │
│                                                │
│  ✍ Cuéntanos más (opcional)                   │
│  ┌──────────────────────────────────────┐    │
│  │ Juan fue muy profesional y entregó  │    │
│  │ un trabajo de excelente calidad...  │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  📸 Adjuntar fotos del resultado (opcional)   │
│  [+ Subir imagen]                             │
│                                                │
│  ☑ Hacer pública esta reseña                 │
│  ☐ Recomendar a otros usuarios                │
│                                                │
│  [Cancelar]          [Enviar Calificación]   │
└──────────────────────────────────────────────┘
```

### Animaciones del Modal

1. **Entrada**: Scale + Fade con overshoot
2. **Estrellas**: Hover scale + color transition gold
3. **Envío**: Success confetti + checkmark animation
4. **Post-envío**: Redirect a job detail con banner "¡Gracias por tu reseña!"

---

## 🔄 Flujo de Estados del Trabajo

```mermaid
not_started → in_progress → milestone_review → completed → [REVIEW_PENDING] → [REVIEWED]
                    ↓
                cancelled
```

### Estados de Revisión

1. **REVIEW_PENDING** (sistema custom)
   - `job.status = 'completed'`
   - `!hasClientReview || !hasProfessionalReview`
   - Mostrar prominentemente badge "Pendiente Calificación"

2. **REVIEWED** (sistema custom)
   - `job.status = 'completed'`
   - `hasClientReview && hasProfessionalReview`
   - Badge verde "Calificado"
   - Link directo a reviews

---

## 🎨 Paleta de Colores por Estado

```css
/* Estados de Job */
--job-not-started: #64748b (slate-500)
--job-in-progress: #3b82f6 (blue-500)
--job-milestone-review: #f59e0b (amber-500)
--job-completed: #10b981 (emerald-500)
--job-cancelled: #ef4444 (red-500)
--job-disputed: #8b5cf6 (violet-500)

/* Acciones */
--action-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--action-success: linear-gradient(135deg, #10b981 0%, #059669 100%)
--action-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)
--action-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%)
```

---

## 🚀 Microinteracciones

### 1. **Card Hover**
```typescript
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: "spring", stiffness: 300 }}
>
```

### 2. **Estado Change**
```typescript
// Cuando cambia de in_progress → completed
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: [0, 1.2, 1] }}
  transition={{ duration: 0.6 }}
>
  <Confetti />
  <CheckCircle className="text-success" />
</motion.div>
```

### 3. **Nueva Actualización**
```typescript
// Badge de "Nuevo" con ping animation
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
</span>
```

---

## 📊 Métricas a Mostrar

### Para Clientes
- Tiempo transcurrido vs estimado
- % Completado
- Próximo milestone
- Mensajes sin leer
- Archivos compartidos

### Para Profesionales
- Tiempo invertido
- Earnings acumulados
- Next payment date
- Client satisfaction (si hay reviews previos)
- Urgencia de milestones

---

## 🎯 Call-to-Actions por Rol

### Cliente
1. **Ver Progreso** → Abre timeline detallado
2. **Enviar Mensaje** → Chat inline o modal
3. **Aprobar Milestone** → Confirmación + release payment
4. **Calificar Trabajo** → Modal de review (solo cuando completed)

### Profesional
1. **Actualizar Progreso** → Form con % y mensaje
2. **Completar Milestone** → Marca milestone + notifica cliente
3. **Enviar Mensaje** → Chat inline o modal
4. **Declarar Completado** → Cambia estado + solicita review cliente
5. **Calificar Cliente** → Modal de review (solo cuando completed)

---

## 🎁 Extras de Delight

1. **Achievement Badges**
   - "Primera Colaboración" 🎉
   - "Entrega a Tiempo" ⚡
   - "5 Estrellas" ⭐
   - "Cliente Frecuente" 🔄

2. **Celebraciones**
   - Confetti al completar
   - Success sound (opcional)
   - Animación de estrella cuando califica 5/5

3. **Progress Rewards**
   - Visual feedback cada 25% completado
   - Milestone badges
   - Trust score increase indicator

---

## 📱 Responsive Design

### Mobile (< 768px)
- Cards stack vertically
- Swipe para ver más detalles
- Bottom sheet para acciones
- Floating action button para quick access

### Tablet (768px - 1024px)
- Grid 2 columnas
- Sidebar con filtros
- Modal fullscreen

### Desktop (> 1024px)
- Grid 3 columnas
- Sidebar persistente con analytics
- Modal centrado overlay

---

## ✅ Checklist de Implementación

- [ ] Crear componente `ActiveJobCard`
- [ ] Crear componente `JobProgressTimeline`
- [ ] Crear componente `MilestoneTracker`
- [ ] Crear componente `MutualReviewModal`
- [ ] Actualizar `JobsPage` para clientes
- [ ] Actualizar `JobsPage` para profesionales
- [ ] Agregar endpoint `/jobs/:id/review`
- [ ] Agregar notificaciones push para estados
- [ ] Tests E2E del flujo completo
- [ ] Analytics tracking

---

## 🎨 Inspiración de Diseño

**Referencias visuales:**
- Airbnb (conexión host-guest)
- Upwork (job cards)
- Trello (kanban boards)
- Dribbble (microinteracciones)
- Linear (clean UI, status badges)

**Biblioteca de componentes:**
- shadcn/ui para base
- Framer Motion para animaciones
- Lucide React para iconos
- Recharts para analytics

---

**Diseño creado con ❤️ por Claude Code**
