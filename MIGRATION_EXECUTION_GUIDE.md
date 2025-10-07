# 🗄️ GUÍA DE EJECUCIÓN DE MIGRACIÓN

## 📋 **ESTADO ACTUAL**

✅ **Credenciales de MercadoPago configuradas**
- Backend: Variables agregadas a `.env`
- Frontend: VITE_MERCADOPAGO_PUBLIC_KEY configurada

🔄 **Migración pendiente de ejecución**
- Archivo de migración creado: `20251007_182647_add_mercadopago_fields`
- Script de ejecución preparado

---

## 🚀 **OPCIONES DE EJECUCIÓN**

### **Opción 1: Ejecutar en Railway (Recomendado)**

1. **Acceder a Railway Console**:
   ```bash
   # En Railway dashboard -> Connect -> Open Terminal
   cd /app
   ```

2. **Ejecutar migración**:
   ```bash
   node run-payment-migration-prisma.js
   ```

3. **Verificar resultado**:
   ```bash
   npx prisma db push --accept-data-loss
   ```

### **Opción 2: Usando Railway CLI**

1. **Instalar Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Conectar al proyecto**:
   ```bash
   railway link
   ```

3. **Ejecutar migración**:
   ```bash
   railway run node run-payment-migration-prisma.js
   ```

### **Opción 3: Manual via SQL**

1. **Conectar a la base de datos**:
   ```bash
   # Obtener DATABASE_URL desde Railway dashboard
   psql "postgresql://user:pass@host:port/db"
   ```

2. **Ejecutar SQL**:
   ```sql
   -- Copiar contenido de migration.sql y ejecutar manualmente
   ```

---

## 📝 **CONTENIDO DE LA MIGRACIÓN**

La migración incluye:

### **Nuevos campos en tabla `payments`**:
- `service_id` - Para pagos de servicios directos
- `mp_payment_id` - ID único de MercadoPago
- `mp_preference_id` - ID de preference de Checkout Pro
- `external_reference` - Referencia externa de Fixia
- `status_detail` - Detalle del estado de MP
- `user_id` - Usuario que hace el pago
- `professional_id` - Profesional que recibe el pago
- `payer_email` - Email del pagador
- `payer_name` - Nombre del pagador
- `description` - Descripción del pago
- `approval_url` - URL de aprobación de MP
- `transaction_data` - Datos completos de MP (JSON)

### **Nueva tabla `payment_preferences`**:
- Almacena preferences de Checkout Pro
- Relaciones con users, services, jobs
- URLs de callback (success/failure/pending)
- Estado de uso (used/unused)

### **Índices y restricciones**:
- Índices para performance en búsquedas
- Claves foráneas para integridad referencial
- Restricciones únicas para IDs de MP

---

## ✅ **VERIFICACIÓN POST-MIGRACIÓN**

Después de ejecutar la migración, verificar:

1. **Tablas creadas**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('payments', 'payment_preferences');
   ```

2. **Campos agregados**:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'payments' 
   AND column_name LIKE 'mp_%';
   ```

3. **Servidor backend**:
   ```bash
   # Reiniciar servidor
   npm run start:dev
   
   # Verificar que no hay errores de Prisma
   ```

4. **Frontend**:
   ```bash
   # Ir a /payment-test
   # Probar crear preference
   # Verificar consola sin errores
   ```

---

## 🔧 **TROUBLESHOOTING**

### **Error: "already exists"**
```
ℹ️  Normal - La migración ya fue ejecutada
✅ Verificar que las tablas estén correctas
```

### **Error: "permission denied"**
```
❌ Verificar permisos de usuario de BD
🔧 Ejecutar como superuser si es necesario
```

### **Error: "relation does not exist"**
```
⚠️  Tabla base no existe
🔧 Ejecutar migraciones previas primero
```

---

## 📞 **SIGUIENTE PASO**

Una vez ejecutada la migración:

1. ✅ Reiniciar servidor backend
2. ✅ Probar `/payment-test` en frontend  
3. ✅ Crear preference de prueba
4. ✅ Verificar logs sin errores

**¡El sistema de pagos estará 100% funcional!** 🎉