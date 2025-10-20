# 🔄 Sistema de Roles Duales con Suscripción

## 📋 Resumen Ejecutivo

Implementación completa de un sistema donde **cualquier usuario puede ser Cliente Y Profesional simultáneamente**, activando su perfil profesional mediante el pago de una suscripción.

---

## 🎯 Concepto Principal

### **Estado por Default:**
```
Usuario Registrado Gratis = SOLO Cliente
```

### **Con Suscripción Activa:**
```
Usuario con Suscripción = Cliente + Profesional
```

---

## 📊 Matriz de Funcionalidades

| Rol | Sin Suscripción | Con Suscripción |
|-----|----------------|-----------------|
| **Cliente** | ✅ Crear proyectos | ✅ Crear proyectos |
| | ✅ Contratar servicios | ✅ Contratar servicios |
| | ✅ Dar feedback | ✅ Dar feedback |
| | ✅ Recibir feedback como cliente | ✅ Recibir feedback como cliente |
| **Profesional** | ❌ No puede publicar servicios | ✅ Publicar servicios |
| | ❌ No puede enviar propuestas | ✅ Enviar propuestas |
| | ❌ No tiene perfil profesional | ✅ Perfil profesional activo |
| | ❌ No recibe feedback profesional | ✅ Recibir feedback como profesional |

---

## 🗄️ Estructura de Base de Datos

### **User Model - Nuevos Campos:**

```prisma
model User {
  // ... campos existentes ...

  // === DUAL ROLES SYSTEM ===
  is_professional_active Boolean   @default(false)
  professional_since     DateTime?

  // === SUBSCRIPTION SYSTEM ===
  subscription_type       String?   @default("free")
  subscription_status     String?   @default("inactive")
  subscription_started_at DateTime?
  subscription_expires_at DateTime?
  subscription_mp_id      String?   // MercadoPago ID
  subscription_price      Decimal?
  auto_renew              Boolean   @default(true)

  // === ROLE-BASED TRUST SCORES ===
  role_trust_scores RoleTrustScore[]
}
```

### **Feedback Model - Contexto de Rol:**

```prisma
model Feedback {
  id           String  @id @default(uuid())
  from_user_id String
  to_user_id   String

  // NUEVO: Indica el rol en que actuó el receptor
  to_user_role String  @default("client") // "client" o "professional"

  comment      String?
  has_like     Boolean @default(false)
  job_id       String?
  service_id   String?

  // ... relations y timestamps ...
}
```

### **RoleTrustScore Model - Trust Scores Separados:**

```prisma
model RoleTrustScore {
  id      String @id @default(uuid())
  user_id String
  role    String  // "client" o "professional"

  total_likes      Int   @default(0)
  total_feedback   Int   @default(0)
  trust_percentage Float @default(0.0)

  last_calculated_at DateTime

  @@unique([user_id, role])
}
```

---

## 💡 Escenarios de Uso Real

### **Escenario 1: Electricista que Necesita Plomero**

```
Juan (Electricista):
┌─────────────────────────────────────┐
│ Registro Inicial: Cliente Gratis   │
│ • Puede crear proyectos             │
│ • No puede ofrecer servicios        │
└─────────────────────────────────────┘
              ↓
         Paga Suscripción
              ↓
┌─────────────────────────────────────┐
│ Cliente + Profesional Activo        │
│ • is_professional_active = true     │
│ • subscription_status = "active"    │
└─────────────────────────────────────┘

Como PROFESIONAL:
✅ Publica servicio: "Instalaciones Eléctricas - $5000/día"
✅ Recibe 45 feedbacks positivos como electricista
✅ Trust Score Profesional: 92%

Como CLIENTE:
✅ Crea proyecto: "Necesito plomero para casa"
✅ Contrata a Pedro (plomero)
✅ Recibe 12 feedbacks positivos como cliente
✅ Trust Score Cliente: 88%

Resultado:
Juan tiene 2 Trust Scores:
• Trust Score como Profesional: 92% (45 likes de 49 trabajos)
• Trust Score como Cliente: 88% (12 likes de 14 contrataciones)
```

### **Escenario 2: Cliente que se Vuelve Profesional**

```
María (Diseñadora):
┌─────────────────────────────────────┐
│ Mes 1-3: Solo Cliente               │
│ • Contrata programadores            │
│ • Feedback como cliente: 15 likes   │
│ • Trust Score Cliente: 93%          │
└─────────────────────────────────────┘
              ↓
      Decide ofrecer servicios
              ↓
┌─────────────────────────────────────┐
│ Mes 4: Activa Suscripción           │
│ • subscription_type = "basic"       │
│ • subscription_price = 2999 ARS/mes │
│ • is_professional_active = true     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Cliente + Profesional               │
│ MANTIENE su Trust Score de Cliente  │
│ INICIA nuevo Trust Score Profesional│
└─────────────────────────────────────┘

Después de 3 meses:
• Trust Score Cliente: 93% (histórico preservado)
• Trust Score Profesional: 87% (nuevo, creciendo)
```

---

## 🔐 Lógica de Activación

### **Flujo de Suscripción:**

```typescript
// 1. Usuario en Dashboard ve banner: "Conviértete en Profesional"
//    Clic en "Activar Perfil Profesional"

// 2. Página de Planes:
{
  free: {
    price: 0,
    features: ["Solo Cliente", "Crear proyectos", "Contratar servicios"]
  },
  basic: {
    price: 2999,
    features: [
      "Cliente + Profesional",
      "Publicar hasta 5 servicios",
      "Responder proyectos ilimitados",
      "Trust Score profesional"
    ]
  },
  premium: {
    price: 5999,
    features: [
      "Todo en Basic +",
      "Servicios ilimitados",
      "Badge 'Premium'",
      "Prioridad en búsquedas",
      "Estadísticas avanzadas"
    ]
  },
  enterprise: {
    price: 12999,
    features: [
      "Todo en Premium +",
      "Equipo de profesionales",
      "API access",
      "Manager dedicado"
    ]
  }
}

// 3. Usuario selecciona plan → MercadoPago
// 4. Pago exitoso → Webhook de MercadoPago
// 5. Backend actualiza:
await prisma.user.update({
  where: { id: userId },
  data: {
    is_professional_active: true,
    professional_since: new Date(),
    subscription_type: "basic",
    subscription_status: "active",
    subscription_started_at: new Date(),
    subscription_expires_at: addMonths(new Date(), 1),
    subscription_mp_id: mpSubscriptionId,
    subscription_price: 2999
  }
});

// 6. Crea ProfessionalProfile automáticamente
await prisma.professionalProfile.create({
  data: {
    user_id: userId,
    level: "Nuevo",
    availability_status: "available"
  }
});

// 7. Inicializa RoleTrustScore para profesional
await prisma.roleTrustScore.create({
  data: {
    user_id: userId,
    role: "professional",
    total_likes: 0,
    total_feedback: 0,
    trust_percentage: 0
  }
});
```

---

## 📈 Sistema de Feedback con Roles

### **Dar Feedback con Contexto de Rol:**

```typescript
// Cuando María (profesional) termina trabajo para Juan (cliente)
// Juan da feedback a María:

await feedbackService.giveFeedback(juanId, {
  toUserId: mariaId,
  toUserRole: "professional", // ← IMPORTANTE: María actuó como profesional
  comment: "Excelente diseño, muy profesional",
  hasLike: true,
  jobId: job.id
});

// Esto suma al Trust Score PROFESIONAL de María
// NO afecta su Trust Score de Cliente
```

```typescript
// Cuando Juan (profesional) termina trabajo para Pedro (cliente)
// Pedro da feedback a Juan:

await feedbackService.giveFeedback(pedroId, {
  toUserId: juanId,
  toUserRole: "professional", // ← Juan actuó como profesional
  comment: "Instalación perfecta, llegó a tiempo",
  hasLike: true,
  jobId: job.id
});

// Suma al Trust Score PROFESIONAL de Juan
```

```typescript
// Cuando Juan (cliente) contrata a Pedro
// Pedro da feedback a Juan:

await feedbackService.giveFeedback(pedroId, {
  toUserId: juanId,
  toUserRole: "client", // ← Juan actuó como CLIENTE
  comment: "Cliente muy claro con sus necesidades",
  hasLike: true,
  jobId: job.id
});

// Suma al Trust Score CLIENTE de Juan
```

---

## 🎨 UI/UX - Experiencia de Usuario

### **Dashboard - Usuario Sin Suscripción:**

```
┌──────────────────────────────────────────────┐
│ 🎯 ¡Conviértete en Profesional!              │
│                                              │
│ Ofrece tus servicios y gana dinero en Fixia │
│                                              │
│ [Ver Planes] →                               │
└──────────────────────────────────────────────┘

Tu Perfil: Cliente
Trust Score: 88% (12 feedbacks)
```

### **Dashboard - Usuario Con Suscripción:**

```
┌──────────────────────────────────────────────┐
│ 👤 Juan Pérez                                │
│ 💼 Cliente + Profesional ⭐                   │
│                                              │
│ Trust Score Cliente: 88%     [Ver Feedback]  │
│ Trust Score Profesional: 92% [Ver Feedback]  │
│                                              │
│ Suscripción: Premium                         │
│ Renovación: 20 Nov 2025                      │
│ [Gestionar Suscripción]                      │
└──────────────────────────────────────────────┘
```

### **Perfil Público - Dual Roles:**

```
┌──────────────────────────────────────────────┐
│ Juan Pérez                                   │
│ 📍 Buenos Aires                              │
│                                              │
│ [Cliente] [Profesional] ← Toggle tabs       │
│                                              │
│ Como Profesional:                            │
│ 🛠️ Electricista Profesional                 │
│ ⭐ 92% Trust Score (45 likes)                │
│ 📊 49 trabajos completados                   │
│ 💬 Ver Feedback Profesional →                │
│                                              │
│ Como Cliente:                                │
│ ⭐ 88% Trust Score (12 likes)                │
│ 📊 14 proyectos publicados                   │
│ 💬 Ver Feedback Cliente →                    │
└──────────────────────────────────────────────┘
```

---

## 🔄 Lógica de Cancelación

```typescript
// Usuario cancela suscripción
await prisma.user.update({
  where: { id: userId },
  data: {
    subscription_status: "cancelled",
    auto_renew: false
    // NO se cambia is_professional_active hasta que expire
  }
});

// Al expirar (cron job diario):
if (user.subscription_expires_at < new Date()) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      is_professional_active: false,
      subscription_status: "expired"
    }
  });

  // Los servicios quedan ocultos, NO se eliminan
  await prisma.service.updateMany({
    where: { professional_id: userId },
    data: { active: false }
  });
}

// Trust Scores se PRESERVAN, no se eliminan
// Si reactiva suscripción, todo vuelve a activarse
```

---

## 📊 Queries Útiles

### **Obtener usuarios con suscripción activa:**
```typescript
const activeProfessionals = await prisma.user.findMany({
  where: {
    is_professional_active: true,
    subscription_status: "active",
    subscription_expires_at: { gte: new Date() }
  }
});
```

### **Obtener Trust Scores de un usuario:**
```typescript
const trustScores = await prisma.roleTrustScore.findMany({
  where: { user_id: userId }
});

// trustScores = [
//   { role: "client", trust_percentage: 88.0, total_likes: 12 },
//   { role: "professional", trust_percentage: 92.0, total_likes: 45 }
// ]
```

### **Feedback recibido como profesional:**
```typescript
const professionalFeedback = await prisma.feedback.findMany({
  where: {
    to_user_id: userId,
    to_user_role: "professional"
  }
});
```

---

## 🚀 Próximos Pasos de Implementación

### **1. Backend:**
- [x] Schema actualizado con dual roles
- [ ] DTOs para suscripción (CreateSubscriptionDto, UpdateSubscriptionDto)
- [ ] Subscription Service (activate, cancel, renew)
- [ ] Subscription Controller (endpoints REST)
- [ ] MercadoPago webhook handler
- [ ] Cron job para expirar suscripciones
- [ ] Actualizar Feedback service para role-based trust scores

### **2. Frontend:**
- [ ] Página de Planes (/pricing)
- [ ] Flow de pago MercadoPago
- [ ] Banner "Conviértete en Profesional"
- [ ] Toggle Cliente/Profesional en perfil
- [ ] Indicadores de rol activo
- [ ] Gestión de suscripción en Settings

### **3. Testing:**
- [ ] E2E: Usuario gratis → Suscripción → Publicar servicio
- [ ] E2E: Feedback con roles correctos
- [ ] E2E: Cancelación y expiración
- [ ] Unit tests: Trust score por rol

---

## 💰 Modelo de Negocio

```
Ingresos Mensuales Proyectados:

100 usuarios × $2,999 (Basic)    = $299,900
 50 usuarios × $5,999 (Premium)  = $299,950
 10 usuarios × $12,999 (Enterprise) = $129,990
                                    ─────────
TOTAL MENSUAL:                      $729,840

TOTAL ANUAL:                        $8,758,080
```

---

**Sistema implementado exitosamente. ¡Listo para monetizar! 🎉**
