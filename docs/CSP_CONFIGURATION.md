# Content Security Policy (CSP) - Configuracion de Fixia

## Problema Resuelto
Las imagenes de Cloudinary estaban siendo bloqueadas por CSP debido a que faltaba `https://res.cloudinary.com` en la directiva `connect-src`.

## Arquitectura de Implementacion

### 1. Produccion (Vercel)
**Archivo:** `vercel.json` y `apps/web/vercel.json`
- Headers aplicados por el edge network de Vercel
- Configuracion mas restrictiva para seguridad maxima
- Se aplica ANTES de que llegue al navegador

### 2. Desarrollo Local (Vite Dev Server)
**Archivo:** `apps/web/vite.config.ts` (seccion `server.headers`)
- Headers aplicados por el dev server de Vite en `localhost:3000`
- Incluye permisos adicionales para desarrollo (localhost, 127.0.0.1, WebSockets locales)
- Permite hot-reload y comunicacion con el dev server

### 3. Preview Mode (Vite Preview)
**Archivo:** `apps/web/vite.config.ts` (seccion `preview.headers`)
- Headers aplicados cuando ejecutas `npm run preview`
- Replica la configuracion de produccion en modo local
- Util para testing antes de deploy

## Directivas CSP Explicadas

### default-src 'self'
- **Que hace:** Politica por defecto para todos los recursos
- **Valor:** Solo permite recursos del mismo origen (fixiaweb.vercel.app)
- **Ejemplo bloqueado:** Scripts/imagenes de dominios externos sin permiso explicito

### script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://sdk.mercadopago.com
- **Que hace:** Controla de donde se pueden cargar y ejecutar scripts
- **'unsafe-inline':** Permite `<script>` inline en HTML (requerido por Vite en dev)
- **'unsafe-eval':** Permite `eval()` y `new Function()` (requerido por algunas librerías)
- **Cloudflare:** Google Fonts necesita ejecutar scripts de fuentes
- **MercadoPago:** SDK de pagos necesita ejecutar JavaScript

**Mejora futura:** Eliminar 'unsafe-inline' y 'unsafe-eval' usando nonces o hashes

### style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
- **Que hace:** Controla de donde se pueden cargar estilos CSS
- **'unsafe-inline':** Permite CSS inline en HTML y `<style>` tags
- **Google Fonts:** Necesita cargar hojas de estilo

**Mejora futura:** Eliminar 'unsafe-inline' usando hashes CSS

### font-src 'self' https://fonts.gstatic.com data:
- **Que hace:** Controla de donde se pueden cargar fuentes
- **fonts.gstatic.com:** CDN de fuentes de Google (archivo .woff2, .ttf)
- **data::** Permite fuentes embebidas en base64 (iconos inline)

### img-src 'self' data: blob: https://res.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com
- **Que hace:** Controla de donde se pueden cargar imagenes
- **'self':** Imagenes propias (logo.png, icons/)
- **data::** Imagenes en base64 (placeholders, favicons inline)
- **blob:** Imagenes generadas dinamicamente (canvas, File API)
- **res.cloudinary.com:** Imagenes de avatares, portadas de anuncios
- **fonts.googleapis.com/fonts.gstatic.com:** Iconos de fuentes

**CRITICO:** Sin `https://res.cloudinary.com` las imagenes de usuario NO cargan

### connect-src (LA MAS CRITICA)
```
'self'
https://api.fixia.app
https://fixia-api.onrender.com
wss://fixia-api.onrender.com
https://res.cloudinary.com
https://api.cloudinary.com
https://fonts.googleapis.com
https://fonts.gstatic.com
https://api.mercadopago.com
```

- **Que hace:** Controla XMLHttpRequest, fetch(), WebSockets, EventSource
- **'self':** API calls al mismo dominio
- **api.fixia.app:** API de produccion
- **fixia-api.onrender.com:** Backend en Render
- **wss://fixia-api.onrender.com:** WebSocket para chat/notificaciones real-time
- **res.cloudinary.com:** FETCH de imagenes (cuando se usa fetch() en lugar de <img>)
- **api.cloudinary.com:** Upload directo a Cloudinary desde frontend
- **api.mercadopago.com:** Procesamiento de pagos

**DESARROLLO ADICIONAL (solo en vite.config.ts):**
- `http://localhost:*` - Dev server, API local
- `ws://localhost:*` - WebSocket dev server (hot reload)
- `http://127.0.0.1:*` - Mismo que localhost (alternativa)
- `ws://127.0.0.1:*` - WebSocket alternativo

**POR QUE ESTO RESUELVE EL PROBLEMA:**
El error `Refused to connect because it violates the document's Content Security Policy`
se debe a que JavaScript usa `fetch()` para cargar imagenes de Cloudinary, NO solo `<img>`.
La directiva `connect-src` controla `fetch()`, por lo tanto DEBE incluir `https://res.cloudinary.com`.

### object-src 'none'
- **Que hace:** Bloquea <object>, <embed>, <applet>
- **Valor:** 'none' = Totalmente bloqueado
- **Razon:** Mitigacion de vulnerabilidades XSS y plugins inseguros

### base-uri 'self'
- **Que hace:** Restringe URLs que pueden ser usadas en <base href="...">
- **Razon:** Previene ataques de inyeccion de base URL

### frame-ancestors 'none'
- **Que hace:** Controla quien puede embeber tu sitio en <iframe>
- **Valor:** 'none' = Nadie puede hacer iframe de tu sitio
- **Razon:** Previene clickjacking attacks

**Nota:** Mas restrictivo que `X-Frame-Options: DENY` (CSP3)

### form-action 'self' https://api.fixia.app https://fixia-api.onrender.com https://api.mercadopago.com
- **Que hace:** Controla a donde pueden enviar datos los formularios
- **Razon:** Previene que formularios envien datos a sitios maliciosos

### upgrade-insecure-requests
- **Que hace:** Convierte automaticamente HTTP a HTTPS
- **Ejemplo:** `http://res.cloudinary.com/...` → `https://res.cloudinary.com/...`
- **Razon:** Seguridad de transporte, previene mixed content

## Testing y Verificacion

### 1. Desarrollo Local (npm run dev)
```bash
cd apps/web
npm run dev
```
- Abre DevTools → Console
- Busca errores CSP (aparecen en rojo)
- Verifica que imagenes de Cloudinary carguen correctamente

### 2. Preview Build (npm run preview)
```bash
cd apps/web
npm run build
npm run preview
```
- Simula produccion en localhost:4173
- Verifica que NO aparezcan errores CSP

### 3. Produccion (Vercel)
```bash
git add .
git commit -m "fix: Add Cloudinary CSP support"
git push
```
- Vercel deployara automaticamente
- Verifica en `https://fixiaweb.vercel.app`
- DevTools → Network → Filtra por "cloudinary"
- Verifica que Status = 200 (no 0 o blocked)

### 4. Comandos de Debug

#### Ver headers en produccion:
```bash
curl -I https://fixiaweb.vercel.app | grep -i content-security
```

#### Validar CSP online:
https://csp-evaluator.withgoogle.com/

## Mejoras de Seguridad Futuras

### 1. Eliminar 'unsafe-inline' en script-src
**Problema actual:** Permite scripts inline (XSS risk)
**Solucion:** Implementar nonces o hashes

```typescript
// vite.config.ts - Plugin para generar nonces
import { cspNoncePlugin } from 'vite-plugin-csp-nonce';

export default defineConfig({
  plugins: [
    react(),
    cspNoncePlugin({
      nonce: '{{nonce}}', // Reemplazado dinamicamente
    }),
  ],
});
```

### 2. Eliminar 'unsafe-eval'
**Problema actual:** Algunas librerías usan eval()
**Solucion:** Reemplazar librerías que usan eval() o usar Web Workers

### 3. Reporte de Violaciones CSP
Agregar directiva `report-uri` o `report-to`:

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; report-uri https://fixia-api.onrender.com/csp-report"
}
```

### 4. Subresource Integrity (SRI)
Para recursos externos (Google Fonts, MercadoPago SDK):

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter"
  rel="stylesheet"
  integrity="sha384-HASH_AQUI"
  crossorigin="anonymous"
>
```

## Troubleshooting

### Problema: Imagenes de Cloudinary no cargan
**Sintoma:** `Refused to connect to https://res.cloudinary.com/...`
**Solucion:** Verifica que `connect-src` incluya `https://res.cloudinary.com`

### Problema: Hot reload no funciona en desarrollo
**Sintoma:** Cambios no se reflejan automaticamente
**Solucion:** Verifica que `connect-src` incluya `ws://localhost:*` en vite.config.ts

### Problema: MercadoPago SDK no funciona
**Sintoma:** `Refused to load script from https://sdk.mercadopago.com`
**Solucion:** Verifica que `script-src` incluya `https://sdk.mercadopago.com`

### Problema: Fuentes de Google no cargan
**Sintoma:** Fuentes se ven como fallback (Arial, sans-serif)
**Solucion:** Verifica estas 3 directivas:
- `style-src` → `https://fonts.googleapis.com`
- `font-src` → `https://fonts.gstatic.com`
- `connect-src` → `https://fonts.googleapis.com`

## Referencias

- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Vercel Headers Documentation](https://vercel.com/docs/edge-network/headers)
- [Vite Server Options](https://vitejs.dev/config/server-options.html)

## Changelog

### 2025-11-15 - Cloudinary CSP Fix
- Agregado `https://res.cloudinary.com` a `connect-src` (CRITICO)
- Agregado `https://api.cloudinary.com` a `connect-src` (upload)
- Agregado `blob:` a `img-src` (imagenes dinamicas)
- Agregado `https://sdk.mercadopago.com` a `script-src`
- Agregado `https://api.mercadopago.com` a `connect-src`
- Agregado `data:` a `font-src` (iconos inline)
- Agregado `object-src 'none'` (seguridad XSS)
- Agregado `form-action` (seguridad formularios)
- Agregado `upgrade-insecure-requests` (HTTPS enforcement)
- Sincronizado CSP en vite.config.ts (dev/preview) y vercel.json (prod)
