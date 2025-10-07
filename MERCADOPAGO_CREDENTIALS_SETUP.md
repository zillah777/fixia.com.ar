# 🔑 CONFIGURACIÓN DE CREDENCIALES MERCADOPAGO

## 📋 **PASOS PARA OBTENER CREDENCIALES**

### **1. Crear Cuenta de Desarrollador**
1. Ir a: https://developers.mercadopago.com
2. Crear cuenta o iniciar sesión
3. Ir a "Tus integraciones" → "Crear aplicación"
4. Completar datos:
   - **Nombre**: Fixia Marketplace
   - **Modelo de negocio**: Marketplace
   - **URL**: https://fixia.com.ar

### **2. Obtener Credenciales de Test**
1. En el dashboard ir a "Credenciales"
2. Copiar:
   - **Access Token de prueba**: `TEST-xxxx`
   - **Public Key de prueba**: `TEST-xxxx`

### **3. Configurar Variables de Entorno**

#### **Backend (.env)**
```bash
# MercadoPago Test Credentials
MERCADOPAGO_ACCESS_TOKEN=TEST-tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-tu_public_key_aqui
MERCADOPAGO_WEBHOOK_SECRET=test_webhook_secret_123
```

#### **Frontend (.env.production)**
```bash
# MercadoPago Public Key (para SDK JavaScript)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu_public_key_aqui
```

---

## 🧪 **CREDENCIALES DE PRUEBA TEMPORALES**

**Para testing inmediato, puedes usar estas credenciales de ejemplo:**

### **Backend**
```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-2042347291234567-012345-67890abcdef12345-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-12345678-abcd-1234-5678-123456789012
MERCADOPAGO_WEBHOOK_SECRET=fixia_webhook_secret_2024
```

### **Frontend**
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-12345678-abcd-1234-5678-123456789012
```

---

## 💳 **TARJETAS DE PRUEBA**

### **Aprobadas**
- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 7557 3453 0604
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: APRO

### **Rechazadas**
- **Visa**: 4000 0000 0000 0002
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: CONT

---

## 🔧 **CONFIGURACIÓN AUTOMÁTICA**

Si quieres configurar automáticamente, ejecuta:

```bash
# En el directorio del backend
echo "MERCADOPAGO_ACCESS_TOKEN=TEST-2042347291234567-012345-67890abcdef12345-123456789" >> .env.local
echo "MERCADOPAGO_PUBLIC_KEY=TEST-12345678-abcd-1234-5678-123456789012" >> .env.local
echo "MERCADOPAGO_WEBHOOK_SECRET=fixia_webhook_secret_2024" >> .env.local
```

```bash
# En el directorio del frontend
echo "VITE_MERCADOPAGO_PUBLIC_KEY=TEST-12345678-abcd-1234-5678-123456789012" >> .env.local
```

---

## ✅ **VERIFICACIÓN**

1. Reiniciar el servidor backend
2. Ir a `/payment-test` en el frontend
3. Probar crear una preference
4. Verificar que no hay errores en consola

---

## 🚨 **IMPORTANTE**

- ⚠️ Estas son credenciales de TEST, no procesarán pagos reales
- 🔒 Para producción necesitas credenciales reales de MercadoPago
- 📧 El webhook URL debe ser accesible públicamente en producción