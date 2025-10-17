# 📸 Guía de Configuración de Cloudinary para Fixia

## ¿Qué es Cloudinary?

Cloudinary es un servicio cloud de gestión de imágenes y videos que te permite:
- ✅ Subir y almacenar imágenes de forma segura
- ✅ Optimizar imágenes automáticamente (WebP, compresión, etc.)
- ✅ Redimensionar y transformar imágenes en tiempo real
- ✅ CDN global para carga rápida de imágenes
- ✅ **Plan gratuito**: 25 GB de almacenamiento, 25 GB de bandwidth mensual

## Paso 1: Crear Cuenta en Cloudinary (GRATIS)

1. Ve a: **https://cloudinary.com/users/register_free**
2. Regístrate con tu email (usa el mismo email de Fixia si es posible)
3. Selecciona el plan **FREE** (no necesitas tarjeta de crédito)
4. Verifica tu email

## Paso 2: Obtener Credenciales

Una vez que inicies sesión en Cloudinary:

1. En el **Dashboard** verás una sección llamada "Product Environment Credentials"
2. Encontrarás tres valores importantes:

```
Cloud Name: dxxxxxxxx (ejemplo: dfj3k2l9m)
API Key: 123456789012345 (números)
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz (alfanumérico)
```

3. **IMPORTANTE**: Copia estos valores en un lugar seguro temporalmente

## Paso 3: Configurar Variables de Entorno en Render

### Opción A: Mediante la Web de Render (Recomendado)

1. Ve a: **https://dashboard.render.com/**
2. Inicia sesión y selecciona tu servicio de backend: **fixia-api**
3. Ve a la pestaña **"Environment"** en el menú lateral
4. Haz clic en **"Add Environment Variable"**
5. Agrega las siguientes 3 variables (una por una):

```
CLOUDINARY_CLOUD_NAME = [tu_cloud_name_aquí]
CLOUDINARY_API_KEY = [tu_api_key_aquí]
CLOUDINARY_API_SECRET = [tu_api_secret_aquí]
```

**Ejemplo real:**
```
CLOUDINARY_CLOUD_NAME = dfj3k2l9m
CLOUDINARY_API_KEY = 123456789012345
CLOUDINARY_API_SECRET = AbCdEfGhIjKlMnOpQrStUvWxYz
```

6. Haz clic en **"Save Changes"**
7. **IMPORTANTE**: El servicio se reiniciará automáticamente (tarda ~2-3 minutos)

### Opción B: Mediante archivo .env local (Solo para desarrollo)

Si quieres probar localmente en tu computadora:

1. Abre el archivo: `apps/api/.env`
2. Busca estas líneas:

```env
# Cloudinary Configuration (Image Upload Service)
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

3. Reemplaza con tus valores reales:

```env
# Cloudinary Configuration (Image Upload Service)
CLOUDINARY_CLOUD_NAME="dfj3k2l9m"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
```

4. Guarda el archivo
5. Reinicia el servidor backend local

## Paso 4: Verificar que Funciona

### Prueba 1: Verificar logs del backend

1. En Render, ve a la pestaña **"Logs"** de tu servicio
2. Busca una línea que diga algo como:
```
[UploadService] Service initialized successfully
```

### Prueba 2: Subir tu foto de perfil

1. Ve a: **https://fixia.app/profile**
2. Haz clic en el **ícono de cámara** sobre tu avatar
3. Selecciona una imagen (JPG, PNG, WebP, GIF - máximo 5MB)
4. La imagen se subirá automáticamente a Cloudinary
5. Verás tu nueva foto de perfil actualizada

### Prueba 3: Verificar en Cloudinary

1. Ve al Dashboard de Cloudinary
2. Clic en **"Media Library"** en el menú lateral
3. Deberías ver una carpeta llamada **"fixia/avatars"**
4. Dentro verás tu imagen optimizada automáticamente

## Estructura de Carpetas en Cloudinary

El sistema creará automáticamente estas carpetas:

```
fixia/
  ├── avatars/        (Fotos de perfil de usuarios)
  ├── services/       (Imágenes de servicios publicados)
  ├── portfolios/     (Imágenes de portafolio de profesionales)
  └── general/        (Otras imágenes)
```

## Características del Sistema de Upload

### Optimizaciones Automáticas

- **Avatars**: Redimensionados a 400x400px, crop cuadrado enfocado en rostros
- **Servicios**: Máximo 1200x1200px con thumbnails de 800x800px
- **Compresión**: Calidad automática optimizada
- **Formato**: Conversión automática a WebP cuando es posible
- **CDN**: Todas las imágenes se sirven desde CDN global de Cloudinary

### Validaciones

- **Tipos permitidos**: JPG, PNG, WebP, GIF
- **Tamaño máximo**: 5MB por archivo
- **Rate limiting**: 5 uploads de avatar por minuto, 10 imágenes generales por minuto

## Troubleshooting (Solución de Problemas)

### Error: "Error al subir imagen: Authentication failed"

**Causa**: Credenciales incorrectas o no configuradas

**Solución**:
1. Verifica que las 3 variables de entorno estén en Render
2. Asegúrate de no tener espacios extra al copiar/pegar
3. Verifica que el API Secret sea el correcto (es case-sensitive)
4. Reinicia el servicio en Render

### Error: "No file uploaded"

**Causa**: El frontend no está enviando el archivo correctamente

**Solución**:
1. Verifica que el frontend esté desplegado con los últimos cambios
2. Limpia el caché del navegador (Ctrl+Shift+R)
3. Prueba con un archivo más pequeño (< 1MB)

### Error: "El archivo es demasiado grande"

**Causa**: Imagen supera 5MB

**Solución**:
1. Comprime la imagen antes de subirla
2. Usa herramientas como: https://tinypng.com/
3. O reduce la resolución de la imagen

### La imagen no se muestra en el perfil

**Causa**: El navegador muestra la imagen en caché

**Solución**:
1. Refresca la página (F5 o Ctrl+R)
2. Si persiste, limpia caché (Ctrl+Shift+Del)
3. Cierra sesión y vuelve a iniciar sesión

## Plan Gratuito de Cloudinary - Límites

- **Almacenamiento**: 25 GB
- **Bandwidth**: 25 GB/mes
- **Transformaciones**: 25,000/mes
- **Requests**: Sin límite especificado

**¿Es suficiente para Fixia?**

Sí, el plan gratuito es más que suficiente para:
- Miles de usuarios
- Decenas de miles de imágenes
- Si cada imagen pesa ~200KB, puedes almacenar ~125,000 imágenes

## ¿Cuándo actualizar a plan pago?

Solo necesitarás un plan pago si:
- Tienes más de 25GB de imágenes almacenadas (muy difícil en primeros años)
- Superas 25GB de bandwidth mensual (indica que tienes MUCHO tráfico - ¡buena señal!)
- Necesitas más de 25,000 transformaciones/mes

**Plan pago más económico**: ~$89 USD/año (solo si realmente lo necesitas)

## Seguridad

### Datos Sensibles

- ❌ **NUNCA** compartas tu API Secret públicamente
- ❌ **NUNCA** subas el archivo .env al repositorio (ya está en .gitignore)
- ✅ Solo configura variables en Render (son privadas)
- ✅ El frontend nunca ve las credenciales

### Validaciones de Seguridad

- Solo usuarios autenticados pueden subir imágenes
- Rate limiting previene abuso
- Validación de tipo de archivo (solo imágenes)
- Validación de tamaño (máx 5MB)

## Soporte

Si tienes problemas:

1. **Cloudinary Support**: https://support.cloudinary.com/
2. **Documentación**: https://cloudinary.com/documentation
3. **Logs de Render**: Revisa los logs del backend en Render
4. **Consulta el código**: `apps/api/src/upload/upload.service.ts`

## Endpoints Disponibles

Una vez configurado, estos endpoints estarán disponibles:

```
POST /upload/avatar          - Sube avatar de usuario (400x400 optimizado)
POST /upload/image           - Sube imagen general (hasta 1200x1200)
DELETE /upload/image/:id     - Elimina imagen de Cloudinary
```

Todos requieren autenticación JWT.

---

## ✅ Checklist de Configuración

- [ ] Cuenta de Cloudinary creada
- [ ] Credenciales copiadas (Cloud Name, API Key, API Secret)
- [ ] Variables configuradas en Render
- [ ] Servicio backend reiniciado en Render
- [ ] Prueba de upload de avatar exitosa
- [ ] Imagen visible en perfil
- [ ] Imagen visible en Cloudinary Media Library

¡Listo! Ahora tu sistema Fixia tiene almacenamiento profesional de imágenes en la nube. 🚀

---

**Última actualización**: 17 de Octubre, 2025
**Versión de Fixia**: 1.0.0
**Soporte técnico**: Revisa los logs de Render o el código en GitHub
