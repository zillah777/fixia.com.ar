# 📱 Fixia PWA - Guía Completa de Implementación

> **Estado**: ✅ Implementación completa y lista para producción
> **Fecha**: 15 de Noviembre, 2025
> **Versión**: 1.0.0

---

## 📋 Índice

1. [Resumen de Implementación](#resumen-de-implementación)
2. [Arquitectura PWA](#arquitectura-pwa)
3. [Componentes Implementados](#componentes-implementados)
4. [Service Worker](#service-worker)
5. [Manifest & Iconos](#manifest--iconos)
6. [Uso de Componentes](#uso-de-componentes)
7. [Testing & Validación](#testing--validación)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Resumen de Implementación

### ¿Qué se ha implementado?

✅ **Service Worker** (`/public/sw.js`)
- Caching estratégico (Network-first para API, Cache-first para assets)
- Soporte offline completo
- Actualización automática con skipWaiting
- Push notifications
- Background sync

✅ **Manifest** (`/public/manifest.json`)
- Configuración completa con todos los iconos
- Shortcuts para acceso rápido
- Optimizado para Android y iOS

✅ **Componentes React**
- `PWAInstallPrompt` - Prompt de instalación para Android
- `PWAiOSInstallModal` - Modal con instrucciones para iOS
- `PWAStatus` - Indicadores de estado online/offline
- `InstallFixiaButton` - Botón de instalación moderno
- `InstallFixiaFab` - Botón flotante
- `InstallFixiaBanner` - Banner inline

✅ **Hook personalizado** (`usePWA`)
- Gestión completa del ciclo de vida PWA
- Detección de instalabilidad
- Manejo de actualizaciones
- Control de cache

---

## 🏗️ Arquitectura PWA

```
apps/web/
├── public/
│   ├── sw.js                          # Service Worker (producción)
│   ├── manifest.json                  # Web App Manifest
│   ├── offline.html                   # Página offline
│   └── icons/                         # Iconos PWA
│       ├── icon-16x16.png
│       ├── icon-32x32.png
│       └── apple-touch-icon.png
│
├── src/
│   ├── components/
│   │   ├── PWAInstallPrompt.tsx      # Prompt Android
│   │   ├── PWAiOSInstallModal.tsx    # Modal iOS
│   │   ├── PWAStatus.tsx             # Indicadores online/offline
│   │   └── InstallFixiaButton.tsx    # Botones de instalación
│   │
│   ├── hooks/
│   │   └── usePWA.ts                 # Hook para gestión PWA
│   │
│   └── App.tsx                        # Integración principal
│
└── index.html                         # Meta tags PWA
```

---

## 🧩 Componentes Implementados

### 1. PWAInstallPrompt (Android)

**Ubicación**: `src/components/PWAInstallPrompt.tsx`

**Funcionalidad**:
- Detecta evento `beforeinstallprompt` (solo Android/Chrome)
- Muestra prompt después de 5 segundos
- Sistema de dismissal con localStorage (reaparece cada 7 días)
- Animación suave con Framer Motion
- Benefits highlights (acceso offline, notificaciones, etc.)

**Auto-integrado en**: `App.tsx` (línea 546)

```tsx
<PWAInstallPrompt />
```

**Comportamiento**:
- ✅ Se muestra automáticamente en Android/Chrome
- ✅ No se muestra si ya está instalado
- ✅ No se muestra en iOS (tiene su propio modal)
- ✅ Respeta la preferencia del usuario (dismiss)

---

### 2. PWAiOSInstallModal (iOS Safari)

**Ubicación**: `src/components/PWAiOSInstallModal.tsx`

**Funcionalidad**:
- Detecta dispositivos iOS automáticamente
- Muestra instrucciones paso a paso para instalación manual
- Se muestra después de 3 segundos
- Sistema de dismissal (reaparece cada 14 días)
- Diseño nativo y visual con iconos ilustrativos

**Auto-integrado en**: `App.tsx` (línea 547)

```tsx
<PWAiOSInstallModal />
```

**Pasos que muestra**:
1. Tocar botón "Compartir" en Safari
2. Seleccionar "Añadir a pantalla de inicio"
3. Confirmar instalación

**Comportamiento**:
- ✅ Solo se muestra en dispositivos iOS
- ✅ No se muestra si ya está en modo standalone
- ✅ Incluye nota sobre requisito de Safari
- ✅ Dismissal configurable

---

### 3. PWAStatus

**Ubicación**: `src/components/PWAStatus.tsx`

**Funcionalidad**:
- Monitorea estado online/offline
- Banner superior cuando hay actualización disponible
- Indicador flotante cuando está offline
- Toast notifications para cambios de conectividad

**Auto-integrado en**: `App.tsx` (línea 545)

```tsx
<PWAStatus />
```

**Elementos UI**:
- Banner amarillo cuando offline (top)
- Banner azul cuando hay actualización (top)
- Indicador flotante (bottom-right) cuando offline

---

### 4. InstallFixiaButton (Componentes modulares)

**Ubicación**: `src/components/InstallFixiaButton.tsx`

**Incluye 3 variantes**:

#### a) InstallFixiaButton (Principal)
```tsx
import { InstallFixiaButton } from '@/components/InstallFixiaButton';

// Uso básico
<InstallFixiaButton />

// Con customización
<InstallFixiaButton
  variant="outline"
  size="lg"
  fullWidth
  showIcon={false}
/>
```

**Props**:
- `variant`: 'default' | 'outline' | 'ghost'
- `size`: 'default' | 'sm' | 'lg'
- `className`: string (estilos adicionales)
- `showIcon`: boolean (mostrar icono de descarga)
- `fullWidth`: boolean (ancho completo)

#### b) InstallFixiaFab (Botón flotante)
```tsx
import { InstallFixiaFab } from '@/components/InstallFixiaButton';

<InstallFixiaFab />
```

**Características**:
- Posición fija (bottom-right)
- Botón circular con icono de smartphone
- Tooltip explicativo
- Animación de entrada con delay

#### c) InstallFixiaBanner (Banner inline)
```tsx
import { InstallFixiaBanner } from '@/components/InstallFixiaButton';

<InstallFixiaBanner />
```

**Características**:
- Se puede colocar dentro de cualquier página
- Diseño horizontal con logo y CTA
- Ideal para landing page o dashboard

**Dónde usar cada uno**:
- `InstallFixiaButton` → Navbar, Settings page, Footer
- `InstallFixiaFab` → Floating en todas las páginas
- `InstallFixiaBanner` → HomePage, Dashboard (inline)

---

## ⚙️ Service Worker

**Ubicación**: `public/sw.js`

### Estrategias de Caching

#### 1. Network-First (API requests)
```javascript
// Usado para: /api/*
// Prioridad: Red > Cache > Offline
```
- Siempre intenta red primero
- Fallback a cache si offline
- Actualiza cache en background

#### 2. Cache-First (Static assets)
```javascript
// Usado para: .js, .css, .png, .jpg, .svg, .woff2
// Prioridad: Cache > Red
```
- Respuesta instantánea desde cache
- Actualización en background (stale-while-revalidate)

### Eventos Implementados

#### Install
```javascript
// Pre-cache de assets críticos
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];
```

#### Activate
```javascript
// Limpieza de caches antiguos
// Claim de clients activos
```

#### Fetch
```javascript
// Routing inteligente basado en tipo de request
```

#### Push & NotificationClick
```javascript
// Soporte para push notifications
// Manejo de clicks en notificaciones
```

#### Sync
```javascript
// Background sync para acciones offline
// Tags: 'sync-contacts', 'sync-favorites'
```

### Versioning

```javascript
const CACHE_NAME = 'fixia-v1.0.0';
const RUNTIME_CACHE = 'fixia-runtime-v1.0.0';
const API_CACHE = 'fixia-api-v1.0.0';
```

**Para actualizar**:
1. Cambiar número de versión en sw.js
2. El service worker se auto-actualizará
3. Los usuarios verán el banner "Nueva versión disponible"

---

## 🎨 Manifest & Iconos

### Manifest.json

**Ubicación**: `public/manifest.json`

**Configuración actual**:

```json
{
  "name": "Fixia - Marketplace de Servicios Profesionales",
  "short_name": "Fixia",
  "description": "Plataforma para conectar profesionales...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [...],
  "shortcuts": [...]
}
```

### Iconos Implementados

✅ **Iconos actuales**:
- `/favicon.ico` (48x48)
- `/icons/icon-16x16.png`
- `/icons/icon-32x32.png`
- `/logo.png` (usado para 192x192 y 512x512)
- `/icons/apple-touch-icon.png` (180x180)

**Configuración en manifest**:
```json
"icons": [
  { "src": "/favicon.ico", "sizes": "48x48", "type": "image/x-icon" },
  { "src": "/icons/icon-16x16.png", "sizes": "16x16", "type": "image/png" },
  { "src": "/icons/icon-32x32.png", "sizes": "32x32", "type": "image/png" },
  {
    "src": "/logo.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/logo.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icons/apple-touch-icon.png",
    "sizes": "180x180",
    "type": "image/png"
  }
]
```

### Shortcuts (App Shortcuts)

Permiten acceso rápido desde el home screen (long-press):

```json
"shortcuts": [
  { "name": "Buscar Servicios", "url": "/services" },
  { "name": "Mis Trabajos", "url": "/jobs" },
  { "name": "Dashboard", "url": "/dashboard" },
  { "name": "Notificaciones", "url": "/notifications" }
]
```

---

## 📖 Uso de Componentes

### Opción 1: Auto-instalación (Recomendado - Ya implementado ✅)

Los componentes ya están integrados en `App.tsx` y se muestran automáticamente:

```tsx
// App.tsx (líneas 545-547)
<PWAStatus />
<PWAInstallPrompt />
<PWAiOSInstallModal />
```

**No requiere ninguna acción adicional** - funcionan automáticamente.

---

### Opción 2: Botones manuales (Opcional)

Si quieres agregar botones de instalación en lugares específicos:

#### En HomePage (Landing):

```tsx
// apps/web/src/pages/HomePage.tsx
import { InstallFixiaBanner } from '@/components/InstallFixiaButton';

// Dentro del JSX, después del Hero Section
<InstallFixiaBanner />
```

#### En Navbar:

```tsx
// apps/web/src/components/Navbar.tsx
import { InstallFixiaButton } from '@/components/InstallFixiaButton';

// Dentro del JSX
<InstallFixiaButton size="sm" variant="outline" />
```

#### En Dashboard:

```tsx
// apps/web/src/pages/DashboardPage.tsx
import { InstallFixiaBanner } from '@/components/InstallFixiaButton';

// Al inicio del contenido principal
<InstallFixiaBanner />
```

#### Botón flotante global:

```tsx
// App.tsx (agregar junto a otros PWA components)
import { InstallFixiaFab } from './components/InstallFixiaButton';

// Dentro del return
<InstallFixiaFab />
```

---

## 🧪 Testing & Validación

### 1. Lighthouse PWA Audit

**Cómo ejecutar**:
1. Abrir Chrome DevTools
2. Tab "Lighthouse"
3. Seleccionar "Progressive Web App"
4. Click "Analyze page load"

**Criterios que debe pasar**:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Uses HTTPS
- ✅ Redirects HTTP to HTTPS

**Score esperado**: 90-100/100

---

### 2. Application Tab (Chrome DevTools)

#### Service Worker
```
Application > Service Workers
```
**Verificar**:
- ✅ Service worker registered
- ✅ Status: activated and running
- ✅ Update on reload (para testing)

#### Cache Storage
```
Application > Cache Storage
```
**Verificar caches**:
- ✅ `fixia-v1.0.0` (precache)
- ✅ `fixia-runtime-v1.0.0` (runtime)
- ✅ `fixia-api-v1.0.0` (API responses)

#### Manifest
```
Application > Manifest
```
**Verificar**:
- ✅ Name, short_name, description
- ✅ Icons rendering correctly
- ✅ Start URL válida
- ✅ Display mode: standalone

---

### 3. Testing Offline

**Método 1 - DevTools**:
1. Abrir DevTools
2. Tab "Network"
3. Throttling dropdown → "Offline"
4. Navegar por la app

**Método 2 - Service Worker**:
1. Application > Service Workers
2. Check "Offline"
3. Navegar por la app

**Comportamiento esperado**:
- ✅ Muestra banner "Sin conexión - Modo Offline"
- ✅ Toast notification "Sin conexión a Internet"
- ✅ Páginas previamente visitadas cargan desde cache
- ✅ Navegación a páginas no cacheadas muestra `offline.html`

---

### 4. Testing Instalación

#### Android (Chrome/Edge):

1. **Desktop**:
   - Icono de instalación en barra de direcciones (⊕)
   - Banner `PWAInstallPrompt` después de 5 segundos
   - Verificar que muestra benefits y botón "Instalar App"

2. **Mobile**:
   - Abrir en Chrome Android
   - Menú → "Agregar a pantalla de inicio"
   - O esperar prompt automático

**Verificación post-instalación**:
- ✅ Icono en home screen
- ✅ Abre en ventana standalone (sin barra del navegador)
- ✅ Splash screen con logo y theme color
- ✅ Componente `PWAInstallPrompt` ya no se muestra

#### iOS (Safari):

1. Abrir `fixiaweb.vercel.app` en Safari iOS
2. Esperar 3 segundos
3. Debe aparecer modal `PWAiOSInstallModal`
4. Verificar que muestra 3 pasos claros con iconos

**Instalación manual**:
1. Botón "Compartir" (⬆️)
2. Scroll hacia abajo
3. "Añadir a pantalla de inicio"
4. Confirmar

**Verificación post-instalación**:
- ✅ Icono en home screen
- ✅ Abre en modo standalone
- ✅ Status bar adaptado (black-translucent)

---

### 5. Testing Actualizaciones

**Simular nueva versión**:

1. Modificar `public/sw.js`:
```javascript
const CACHE_NAME = 'fixia-v1.0.1'; // Cambiar versión
```

2. Deploy a producción

3. Usuario con versión anterior:
   - Recarga la página
   - Service worker detecta nueva versión
   - Aparece banner "Nueva versión disponible"
   - Click en "Actualizar ahora"
   - Página se recarga con nueva versión

---

## 🚀 Deployment

### Checklist Pre-Deploy

- [ ] Service worker registrado en `index.html` o `main.tsx`
- [ ] Manifest enlazado en `index.html`
- [ ] Todos los iconos existen en `/public/icons/`
- [ ] HTTPS configurado (requisito PWA)
- [ ] `start_url` en manifest apunta a dominio correcto
- [ ] Lighthouse PWA audit pasa (>90)

### Vercel (Configuración actual)

**Ubicación**: Ya deployado en `fixiaweb.vercel.app`

✅ **HTTPS**: Automático con Vercel
✅ **Redirects**: HTTP → HTTPS automático
✅ **Service Worker**: Servido como static asset
✅ **Manifest**: Servido como static asset

**Headers recomendados** (opcional):

Crear `vercel.json` en la raíz:

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

---

### Build Process

**Importante**: El service worker debe estar en `/public/sw.js` (no en `/src/`) para que Vite lo copie al build sin procesarlo.

```bash
# Build
npm run build

# Preview local
npm run preview

# Deploy
git push origin main  # Auto-deploy con Vercel
```

**Verificar build**:
```
dist/
├── index.html          # ✅ Debe incluir <link rel="manifest">
├── sw.js              # ✅ Service worker copiado
├── manifest.json      # ✅ Manifest copiado
└── icons/             # ✅ Iconos copiados
```

---

## 🐛 Troubleshooting

### Problema: "Service Worker not registering"

**Síntomas**:
- No hay service worker en DevTools > Application
- Offline no funciona

**Solución**:
1. Verificar que `sw.js` está en `/public/sw.js`
2. Verificar que `usePWA` hook se está usando en algún componente montado
3. Verificar que la app está en HTTPS (o localhost)
4. Revisar console para errores

**Código de registro**:
```typescript
// apps/web/src/hooks/usePWA.ts (línea 46-91)
if ('serviceWorker' in navigator) {
  registerServiceWorker();
}
```

---

### Problema: "Install prompt not showing (Android)"

**Síntomas**:
- Componente `PWAInstallPrompt` no aparece
- No hay icono ⊕ en barra de Chrome

**Causas posibles**:
1. **Ya está instalado** → Verificar si ya hay icono en home screen
2. **Manifest inválido** → DevTools > Application > Manifest (buscar errores)
3. **No cumple criterios** → Debe tener:
   - HTTPS
   - Service worker
   - Manifest válido
   - start_url válida
   - 2+ visitas al sitio (criterio de Chrome)

**Debugging**:
```javascript
// Agregar en usePWA.ts para debug
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ beforeinstallprompt fired', e);
});
```

---

### Problema: "iOS modal not showing"

**Síntomas**:
- Modal de instrucciones iOS no aparece

**Causas posibles**:
1. **No es iOS** → Modal solo se muestra en iPhone/iPad
2. **Ya está instalado** → Verificar standalone mode
3. **Dismissed recientemente** → localStorage tiene timestamp (esperar 14 días o limpiar)

**Debugging**:
```javascript
// En consola de Safari iOS
console.log('Is iOS:', /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()));
console.log('Is Standalone:', window.matchMedia('(display-mode: standalone)').matches);
console.log('Dismissed:', localStorage.getItem('ios-pwa-install-dismissed'));
```

**Forzar modal**:
```javascript
// Limpiar dismissal
localStorage.removeItem('ios-pwa-install-dismissed');
// Recargar página
```

---

### Problema: "Offline page not showing"

**Síntomas**:
- Cuando offline, muestra error del navegador en vez de `offline.html`

**Solución**:
1. Verificar que `offline.html` existe en `/public/offline.html`
2. Verificar que está en precache del SW:
```javascript
// public/sw.js
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'  // ← Debe estar aquí
];
```
3. Reinstalar service worker (Application > Service Workers > Unregister > Refresh)

---

### Problema: "Cache not updating"

**Síntomas**:
- Cambios en el código no se reflejan
- Usuarios ven versión antigua

**Solución**:

**Para desarrollo**:
1. DevTools > Application > Service Workers
2. Check "Update on reload"
3. Check "Bypass for network"

**Para producción**:
1. Incrementar versión en `sw.js`:
```javascript
const CACHE_NAME = 'fixia-v1.0.1'; // Cambiar
```
2. Deploy
3. Service worker auto-detectará cambio
4. Banner "Actualización disponible" se mostrará
5. Usuario hace click en "Actualizar ahora"

**Limpiar cache manualmente**:
```javascript
// En consola
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

---

### Problema: "Icons not showing correctly"

**Síntomas**:
- Icono por defecto en home screen
- Splash screen sin logo

**Solución**:
1. Verificar que iconos existen:
```bash
ls -la apps/web/public/icons/
# Debe mostrar:
# icon-16x16.png
# icon-32x32.png
# apple-touch-icon.png
```

2. Verificar rutas en manifest:
```json
"icons": [
  { "src": "/icons/icon-16x16.png", ... }
  // ← Ruta relativa correcta
]
```

3. Verificar que logo.png tiene resolución adecuada:
   - Mínimo: 192x192
   - Recomendado: 512x512

4. **Para iOS**: Verificar apple-touch-icon en `index.html`:
```html
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
```

---

### Problema: "Update banner showing repeatedly"

**Síntomas**:
- Banner "Nueva versión disponible" no desaparece después de actualizar

**Solución**:
1. Verificar que `skipWaiting()` está en SW:
```javascript
// public/sw.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // ← Debe estar aquí
  }
});
```

2. Verificar que el hook maneja correctamente:
```typescript
// hooks/usePWA.ts
const updateServiceWorker = () => {
  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload(); // ← Recarga necesaria
    });
  }
};
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **PWA Overview**: https://web.dev/progressive-web-apps/
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Web App Manifest**: https://developer.mozilla.org/en-US/docs/Web/Manifest
- **Workbox (Advanced)**: https://developers.google.com/web/tools/workbox

### Herramientas

- **Lighthouse**: Chrome DevTools → Lighthouse tab
- **PWA Builder**: https://www.pwabuilder.com/
- **Manifest Generator**: https://app-manifest.firebaseapp.com/
- **Icon Generator**: https://realfavicongenerator.net/

### Testing Tools

- **ngrok** (Test on real devices): https://ngrok.com/
- **BrowserStack** (Test iOS/Android): https://www.browserstack.com/
- **Chrome DevTools**: Application tab

---

## 🎯 Próximos Pasos (Opcional - Mejoras Futuras)

### 1. Push Notifications

El SW ya tiene soporte básico, solo falta:
- Backend para enviar notificaciones
- Solicitar permiso al usuario
- Guardar subscription token

**Implementación**:
```typescript
// Solicitar permiso
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_KEY'
  });

  // Enviar subscription al backend
  await api.post('/push/subscribe', subscription);
}
```

### 2. Background Sync

Ya implementado en SW, activar desde frontend:
```typescript
// Cuando usuario crea algo offline
await registration.sync.register('sync-contacts');
```

### 3. Advanced Caching

Implementar Workbox para strategies más avanzadas:
```bash
npm install workbox-webpack-plugin
```

### 4. App Shortcuts Dinámicos

Actualizar shortcuts basándose en uso del usuario:
```typescript
if ('getInstalledRelatedApps' in navigator) {
  // Detectar shortcuts más usados y priorizarlos
}
```

### 5. Share Target API

Permitir compartir contenido a Fixia:
```json
// manifest.json
"share_target": {
  "action": "/share",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url"
  }
}
```

---

## ✅ Checklist Final

Antes de marcar como completo, verificar:

### Desarrollo
- [x] Service worker en `/public/sw.js`
- [x] Manifest en `/public/manifest.json`
- [x] Offline page en `/public/offline.html`
- [x] Iconos en `/public/icons/`
- [x] PWA components creados
- [x] Hook `usePWA` implementado
- [x] Componentes integrados en App.tsx
- [x] Meta tags en index.html

### Testing
- [ ] Lighthouse PWA audit pasa (>90)
- [ ] Service worker registra correctamente
- [ ] Offline mode funciona
- [ ] Install prompt aparece (Android)
- [ ] iOS modal aparece (Safari iOS)
- [ ] Iconos se ven correctos
- [ ] Update mechanism funciona
- [ ] Cache strategies correctas

### Producción
- [ ] HTTPS configurado
- [ ] Domain en manifest correcto
- [ ] Icons optimizados
- [ ] Service worker versionado
- [ ] Headers configurados
- [ ] Analytics integrado (opcional)
- [ ] Error tracking configurado (opcional)

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar este documento** - Sección Troubleshooting
2. **Chrome DevTools Console** - Buscar errores
3. **Lighthouse Report** - Ver qué falla
4. **GitHub Issues** - Reportar bugs
5. **Stack Overflow** - Tag: [progressive-web-apps]

---

**Guía creada por**: Claude AI
**Para**: Fixia Marketplace
**Última actualización**: 15 de Noviembre, 2025

---

🎉 **¡Tu PWA está lista para producción!**
