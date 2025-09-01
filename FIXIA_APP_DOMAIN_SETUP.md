# 🌐 Guía Completa de Configuración: fixia.app

Esta guía te ayudará a configurar completamente el dominio `fixia.app` comprado en GoDaddy para que funcione con la aplicación Fixia.

## 📋 Resumen de Tareas

- ✅ Configuración de aplicación completada
- ✅ Variables de entorno actualizadas
- ✅ Templates de email creados
- ✅ SEO y meta tags configurados
- 🔄 **Configuración DNS en GoDaddy** (REQUIERE ACCIÓN)
- 🔄 **Configuración dominio en Vercel** (REQUIERE ACCIÓN)
- 🔄 **Configuración de email** (REQUIERE ACCIÓN)

---

## 🔧 PASO 1: Configuración DNS en GoDaddy

### A. Registros para Vercel (Hosting)

Ingresa a tu panel de GoDaddy → Gestionar DNS y agrega:

**1. Registro principal:**
```
Tipo: CNAME
Nombre: @
Valor: cname.vercel-dns.com
TTL: 600
```

**2. Registro www:**
```
Tipo: CNAME  
Nombre: www
Valor: cname.vercel-dns.com
TTL: 600
```

### B. Registros de Email (ImprovMX - Servicio Gratuito)

**1. Registros MX:**
```
Tipo: MX
Nombre: @
Valor: mx1.improvmx.com
Prioridad: 10
TTL: 3600

Tipo: MX
Nombre: @
Valor: mx2.improvmx.com
Prioridad: 20
TTL: 3600
```

**2. Registro SPF (Autenticación):**
```
Tipo: TXT
Nombre: @
Valor: v=spf1 include:_spf.improvmx.com ~all
TTL: 600
```

**3. Registro DMARC (Seguridad):**
```
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:dmarc@fixia.app
TTL: 600
```

---

## 🚀 PASO 2: Configuración en Vercel

### A. Agregar Dominio Personalizado

1. **Via Vercel Dashboard:**
   - Ve a tu proyecto de Fixia
   - Settings → Domains
   - Agrega `fixia.app` como dominio personalizado
   - Agrega `www.fixia.app` (se redirigirá automáticamente)

2. **Via Vercel CLI:**
```bash
# Si tienes Vercel CLI instalado
vercel domains add fixia.app --project=your-project-name
```

### B. Variables de Entorno en Vercel

En Settings → Environment Variables, agrega:

```bash
VITE_API_URL=https://api.fixia.app
VITE_APP_DOMAIN=fixia.app
VITE_APP_URL=https://fixia.app
VITE_SUPPORT_EMAIL=soporte@fixia.app
VITE_CONTACT_EMAIL=contacto@fixia.app
VITE_PRIVACY_EMAIL=privacidad@fixia.app
VITE_COMMERCIAL_EMAIL=comercial@fixia.app
VITE_NOREPLY_EMAIL=no-reply@fixia.app
```

---

## 📧 PASO 3: Configuración de Email

### A. Crear Cuenta en ImprovMX (Gratis)

1. Ve a [improvmx.com](https://improvmx.com)
2. Crea una cuenta gratuita
3. Agrega el dominio `fixia.app`
4. Verifica que los registros DNS estén configurados

### B. Configurar Alias de Email

En el panel de ImprovMX, crea estos alias (redirige a tu email personal):

```
soporte@fixia.app → tu-email@gmail.com
contacto@fixia.app → tu-email@gmail.com
privacidad@fixia.app → tu-email@gmail.com
comercial@fixia.app → tu-email@gmail.com
no-reply@fixia.app → tu-email@gmail.com
admin@fixia.app → tu-email@gmail.com
```

### C. Configuración de Email Transaccional (Opcional)

Para envío masivo de emails, puedes configurar:

**SendGrid (Recomendado):**
1. Crea cuenta en SendGrid
2. Verifica el dominio `fixia.app`
3. Configura DKIM y SPF
4. Obtén API Key

**Variables adicionales para Vercel:**
```bash
EMAIL_PROVIDER=SENDGRID
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=no-reply@fixia.app
```

---

## 🔒 PASO 4: Verificación y Pruebas

### A. Verificar DNS (Esperar 1-24 horas)

```bash
# Verificar registros DNS
nslookup fixia.app
nslookup -type=MX fixia.app
nslookup -type=TXT fixia.app
```

### B. Verificar Email

1. Envía un email de prueba a `contacto@fixia.app`
2. Debe llegar a tu email personal configurado en ImprovMX
3. Prueba responder desde tu email personal

### C. Verificar Sitio Web

1. Visita `https://fixia.app` (debe mostrar tu aplicación)
2. Verifica que `https://www.fixia.app` redirija a `https://fixia.app`
3. Verifica SSL (candado verde en el navegador)

---

## 📈 PASO 5: Deployment y Monitoreo

### A. Deploy Final

```bash
# En tu directorio del proyecto
git add .
git commit -m "feat: Configure fixia.app domain with complete email setup"
git push origin main
```

### B. Monitorear el Deploy

1. Ve a Vercel Dashboard
2. Verifica que el deploy fue exitoso
3. Comprueba que no hay errores en los logs
4. Verifica que el dominio funciona correctamente

---

## 🛠️ Herramientas de Verificación

### DNS Checkers
- [DNS Checker](https://dnschecker.org/)
- [MX Toolbox](https://mxtoolbox.com/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

### Email Testing
- [Mail Tester](https://www.mail-tester.com/)
- [ImprovMX Dashboard](https://improvmx.com/dashboard)

---

## 🆘 Solución de Problemas

### Dominio no funciona
- ✅ Verificar que DNS esté propagado (puede tomar hasta 48h)
- ✅ Confirmar registros CNAME en GoDaddy
- ✅ Verificar configuración en Vercel

### Emails no llegan
- ✅ Verificar registros MX en GoDaddy
- ✅ Confirmar configuración en ImprovMX
- ✅ Revisar spam en tu email personal

### SSL/HTTPS no funciona
- ✅ Vercel configura SSL automáticamente
- ✅ Esperar hasta 24h para propagación completa
- ✅ Verificar que no hay mixed content

---

## 📞 Contacto y Soporte

Si tienes problemas con la configuración:

- 📧 **Email técnico:** [Tu email personal]
- 🌐 **Documentación:** Este archivo
- 🔧 **Logs:** Vercel Dashboard → Functions → View Function Logs

---

## ✅ Checklist Final

- [ ] DNS configurado en GoDaddy (CNAME, MX, TXT)
- [ ] Dominio agregado en Vercel
- [ ] Variables de entorno configuradas
- [ ] ImprovMX configurado con alias
- [ ] Aplicación desplegada con nueva configuración
- [ ] Sitio web funcionando en https://fixia.app
- [ ] Emails funcionando (prueba enviando a contacto@fixia.app)
- [ ] SSL activo y funcionando
- [ ] Redirecciones www → non-www funcionando

Una vez completados todos los pasos, tu aplicación Fixia estará completamente funcional en el dominio `fixia.app` con email profesional incluido! 🎉