# Guia de Despliegue - CSP Cloudinary Fix

## Resumen Ejecutivo

**Problema:** Imagenes de Cloudinary bloqueadas por Content Security Policy
**Causa Raiz:** Faltaba `https://res.cloudinary.com` en la directiva `connect-src`
**Solucion:** Actualizar CSP en 3 archivos + agregar scripts de validacion

---

## Archivos Modificados

### 1. Archivos de Configuracion CSP (CRITICOS)

#### C:\xampp\htdocs\fixia.com.ar\vercel.json
- **Linea 73:** Actualizada directiva Content-Security-Policy
- **Cambios:**
  - Agregado `https://res.cloudinary.com` a `connect-src` (FIX PRINCIPAL)
  - Agregado `https://api.cloudinary.com` a `connect-src`
  - Agregado `blob:` a `img-src`
  - Agregado `https://sdk.mercadopago.com` a `script-src`
  - Agregado `https://api.mercadopago.com` a `connect-src`
  - Agregado `data:` a `font-src`
  - Agregado directivas: `object-src`, `form-action`, `upgrade-insecure-requests`

#### C:\xampp\htdocs\fixia.com.ar\apps\web\vercel.json
- **Linea 62:** Sincronizado con el vercel.json raiz
- **Cambios:** Identicos a vercel.json raiz

#### C:\xampp\htdocs\fixia.com.ar\apps\web\vite.config.ts
- **Lineas 43-49:** Agregados headers CSP en `server.headers` (desarrollo)
- **Lineas 56-62:** Agregados headers CSP en `preview.headers` (preview)
- **Cambios:**
  - CSP completo para dev server (incluye `http://localhost:*`, `ws://localhost:*`)
  - CSP completo para preview mode
  - Headers de seguridad adicionales (X-Content-Type-Options, X-Frame-Options, etc.)

### 2. Archivos de Documentacion (NUEVOS)

#### C:\xampp\htdocs\fixia.com.ar\docs\CSP_CONFIGURATION.md
- Documentacion completa de todas las directivas CSP
- Explicacion de cada dominio permitido
- Guias de troubleshooting
- Mejoras de seguridad futuras

#### C:\xampp\htdocs\fixia.com.ar\CSP_DEPLOYMENT_GUIDE.md
- Esta guia de deployment (archivo actual)

### 3. Scripts de Validacion (NUEVOS)

#### C:\xampp\htdocs\fixia.com.ar\apps\web\scripts\validate-csp.js
- Script Node.js para validar CSP en produccion
- Valida dominios requeridos
- Verifica directivas de seguridad
- Reporta warnings y errores

#### C:\xampp\htdocs\fixia.com.ar\apps\web\public\test-csp.html
- Pagina HTML de testing interactiva
- Prueba todas las directivas CSP
- Visualiza errores en tiempo real
- Accesible en `/test-csp.html` en dev y produccion

### 4. Package.json Actualizado

#### C:\xampp\htdocs\fixia.com.ar\apps\web\package.json
- **Lineas 24-25:** Nuevos scripts de validacion
  - `npm run validate:csp` - Valida localhost
  - `npm run validate:csp:prod` - Valida produccion

---

## Pasos de Deployment

### OPCION A: Deployment Rapido (Solo Fix)

```bash
# 1. Verificar cambios
cd C:\xampp\htdocs\fixia.com.ar
git status

# 2. Commit y push
git add vercel.json apps/web/vercel.json apps/web/vite.config.ts
git commit -m "fix(csp): Add Cloudinary support to Content Security Policy"
git push origin main

# 3. Vercel deployara automaticamente
# Espera 2-3 minutos y verifica en https://fixiaweb.vercel.app
```

### OPCION B: Deployment Completo (Fix + Documentacion + Scripts)

```bash
# 1. Verificar todos los cambios
cd C:\xampp\htdocs\fixia.com.ar
git status

# 2. Agregar todos los archivos
git add .

# 3. Commit con mensaje descriptivo
git commit -m "fix(csp): Add comprehensive CSP configuration for Cloudinary

- Add Cloudinary domains to connect-src and img-src
- Add MercadoPago SDK support
- Add blob: and data: support for dynamic content
- Implement CSP in vite.config.ts for dev/preview
- Add CSP validation script
- Add interactive CSP test page
- Add comprehensive documentation

Fixes: Images from res.cloudinary.com blocked by CSP
"

# 4. Push
git push origin main

# 5. Verificar deployment en Vercel
# Dashboard: https://vercel.com/tu-proyecto
```

---

## Verificacion Post-Deployment

### 1. Verificacion Automatica (Recomendada)

```bash
# Espera 3 minutos despues del push para que Vercel termine el deploy

cd apps/web
npm run validate:csp:prod
```

**Resultado esperado:**
```
PASSED: CSP configuration is valid!

Note: There are some warnings above for future security improvements.
```

### 2. Verificacion Manual en Navegador

#### A. Prueba de Imagenes Cloudinary

1. Abre: `https://fixiaweb.vercel.app`
2. Navega a cualquier perfil con avatar
3. Abre DevTools (F12) → Console
4. Busca errores que contengan "Content Security Policy"
5. **ESPERADO:** NO debe haber errores CSP relacionados con Cloudinary

#### B. Pagina de Test Interactiva

1. Abre: `https://fixiaweb.vercel.app/test-csp.html`
2. Todos los tests deben mostrar **PASS** en verde
3. Haz clic en "Ejecutar Fetch Test" → Debe ser PASS
4. Haz clic en "Ejecutar API Test" → Debe ser PASS

#### C. Verificar Headers con cURL

```bash
curl -I https://fixiaweb.vercel.app | findstr /i "content-security"
```

**Resultado esperado:**
```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://sdk.mercadopago.com; ... https://res.cloudinary.com ...
```

### 3. Testing en Desarrollo Local

```bash
# 1. Iniciar dev server
cd apps/web
npm run dev

# 2. Abrir navegador
# http://localhost:3000/test-csp.html

# 3. Verificar que todos los tests pasen
# 4. Probar login y visualizacion de avatares
```

---

## Rollback (Si algo sale mal)

### OPCION 1: Revert desde Git

```bash
# Ver commits recientes
git log --oneline -5

# Revert al commit anterior (reemplaza HASH_ANTERIOR)
git revert HEAD
git push origin main
```

### OPCION 2: Rollback en Vercel Dashboard

1. Ir a https://vercel.com/tu-proyecto/deployments
2. Buscar el deployment anterior (antes del CSP fix)
3. Click en "..." → "Promote to Production"

### OPCION 3: Fix Rapido Manual

Si solo Cloudinary esta roto, edita `vercel.json` linea 73:

**Cambio minimo:**
```json
"connect-src 'self' ... https://res.cloudinary.com ..."
```

Commit y push solo ese cambio.

---

## Troubleshooting

### Problema 1: Imagenes de Cloudinary aun bloqueadas

**Sintomas:**
- Error en console: `Refused to connect to https://res.cloudinary.com`
- Avatares no cargan

**Diagnostico:**
```bash
# Ver CSP en produccion
curl -I https://fixiaweb.vercel.app | findstr "content-security"

# Debe contener: https://res.cloudinary.com en connect-src
```

**Solucion:**
1. Verifica que el deployment termino (Vercel dashboard)
2. Hard refresh (Ctrl+Shift+R) para limpiar cache
3. Prueba en ventana incognito
4. Si persiste, ejecuta `npm run validate:csp:prod`

### Problema 2: Dev server no funciona

**Sintomas:**
- `npm run dev` da error
- Hot reload no funciona

**Diagnostico:**
```bash
# Verificar sintaxis de vite.config.ts
cd apps/web
npm run type-check
```

**Solucion:**
1. Verifica que `vite.config.ts` tiene sintaxis correcta
2. Elimina `node_modules/.vite` y reinicia:
   ```bash
   npm run clean
   npm run dev
   ```

### Problema 3: MercadoPago SDK bloqueado

**Sintomas:**
- Error: `Refused to load script from https://sdk.mercadopago.com`

**Solucion:**
Verifica que CSP incluye:
```
script-src ... https://sdk.mercadopago.com
connect-src ... https://api.mercadopago.com
```

### Problema 4: Google Fonts no cargan

**Sintomas:**
- Fuentes se ven como Arial o sans-serif default

**Solucion:**
Verifica 3 directivas:
```
style-src ... https://fonts.googleapis.com
font-src ... https://fonts.gstatic.com
connect-src ... https://fonts.googleapis.com
```

---

## Monitoreo Post-Deployment

### Herramientas de Monitoreo

#### 1. Browser DevTools
- Chrome/Edge: F12 → Console → Filtra por "csp" o "policy"
- Firefox: F12 → Console → Filtra por "Content Security"

#### 2. Vercel Analytics
- Dashboard: https://vercel.com/tu-proyecto/analytics
- Busca errores 0 o failed requests a Cloudinary

#### 3. Script de Validacion Periodica

Agrega a tu CI/CD:
```yaml
# .github/workflows/validate-csp.yml
name: Validate CSP
on:
  schedule:
    - cron: '0 */6 * * *' # Cada 6 horas
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run validate:csp:prod
```

---

## Checklist de Deployment

### Pre-Deployment
- [ ] Todos los archivos actualizados y guardados
- [ ] `git status` muestra los archivos correctos
- [ ] Commit message es descriptivo
- [ ] No hay archivos sensibles en el commit (.env, keys, etc.)

### Durante Deployment
- [ ] `git push` exitoso
- [ ] Vercel inicia el build automaticamente
- [ ] Build completa sin errores (check en Vercel dashboard)

### Post-Deployment
- [ ] Ejecutar `npm run validate:csp:prod` → PASS
- [ ] Abrir `https://fixiaweb.vercel.app/test-csp.html` → Todos PASS
- [ ] Probar login y navegacion de perfiles
- [ ] Verificar que avatares cargan correctamente
- [ ] Hard refresh (Ctrl+Shift+R) y probar de nuevo
- [ ] Probar en incognito mode
- [ ] Probar en otro navegador (Chrome, Firefox, Edge)
- [ ] No hay errores CSP en DevTools Console

### Rollback Trigger (si cualquiera falla)
- [ ] Deployment de Vercel fallo
- [ ] `validate:csp:prod` muestra FAILED
- [ ] Imagenes de Cloudinary no cargan
- [ ] Otros recursos bloqueados (fonts, API, etc.)
- [ ] Errores CSP en produccion

---

## Contacto y Soporte

**Documentacion Adicional:**
- CSP Completo: `docs/CSP_CONFIGURATION.md`
- Script de validacion: `apps/web/scripts/validate-csp.js`
- Test interactivo: `apps/web/public/test-csp.html`

**Referencias Externas:**
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Vercel Headers Docs](https://vercel.com/docs/edge-network/headers)

---

## Notas Finales

Este fix resuelve el problema critico de CSP que bloqueaba imagenes de Cloudinary.
Los cambios son backward-compatible y no afectan funcionalidad existente.

**Tiempo estimado de deployment:** 5-10 minutos (incluyendo validacion)

**Proximo paso recomendado:** Implementar nonces para eliminar 'unsafe-inline' de script-src
(Ver `docs/CSP_CONFIGURATION.md` seccion "Mejoras de Seguridad Futuras")
