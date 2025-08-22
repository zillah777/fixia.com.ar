# Product Backlog - Fixia

**Marketplace de microservicios profesionales de Chubut**  
**Fecha**: 21 agosto 2025  
**Figma**: https://www.figma.com/design/Nz2tnXCDIdZhmHf8tvX2zX/fixia.com.ar

## 🎯 Épica: Monorepo & Production Setup

### 🔥 Sprint 1 (Prioridad ALTA - 1-2 semanas)

#### US-001: Setup Monorepo Base
**Como** developer  
**Quiero** una estructura monorepo profesional con Turborepo  
**Para** optimizar el desarrollo y deployment independiente del frontend y backend

**Criterios de Aceptación:**
- [ ] Estructura Turborepo configurada correctamente
- [ ] Workspace packages/ui, packages/types, packages/utils creados  
- [ ] Apps/web y apps/api separados funcionalmente
- [ ] Scripts de build/dev/test funcionando
- [ ] Hot reload trabajando en desarrollo
- [ ] TypeScript configurado estrictamente en todos los workspaces

**Definition of Done:**
- Código migratorio 100% funcional sin regresiones
- Documentación en README_DEV.md actualizada
- CI/CD configurado y funcionando
- Deploy exitoso en staging

---

#### US-002: Backend NestJS Implementation  
**Como** usuario del sistema  
**Quiero** una API REST funcional que soporte todos los flujos existentes  
**Para** que el frontend pueda consumir datos reales en lugar de mocks

**Criterios de Aceptación:**
- [ ] NestJS configurado con estructura modular (auth, users, services, projects)
- [ ] PostgreSQL + Prisma configurado con migrations
- [ ] JWT authentication implementado
- [ ] OpenAPI/Swagger documentation disponible en /docs
- [ ] Todos los endpoints del API.openapi.yaml funcionando
- [ ] Validación de inputs con class-validator
- [ ] Error handling middleware globalizado
- [ ] CORS configurado para frontend

**Flujos Principales a Cubrir:**
- Registro/Login de usuarios (client y professional)  
- CRUD de servicios (solo profesionales)
- CRUD de proyectos (solo clientes)
- Listado público de servicios con filtros
- Perfiles públicos de profesionales
- Dashboard data para usuarios autenticados

---

#### US-003: Frontend API Integration
**Como** usuario de Fixia  
**Quiero** que todas las pantallas consuman datos reales  
**Para** tener una experiencia funcional completa

**Criterios de Aceptación:**
- [ ] Context API reemplazado por React Query/SWR para state management
- [ ] Todos los formularios conectados a endpoints reales
- [ ] Loading states implementados en todas las páginas
- [ ] Error states implementados con user-friendly messages
- [ ] Empty states implementados cuando no hay contenido
- [ ] Authentication flow completamente funcional
- [ ] Protected routes funcionando correctamente
- [ ] Logout y session management funcionando

**Pantallas Prioritarias:**
1. Login/Register (alta prioridad)
2. Services catalog con filtros reales  
3. Service detail con datos del profesional
4. Dashboard con estadísticas reales
5. Profile management funcional

---

#### US-004: Production Deployment Setup
**Como** product owner  
**Quiero** el sistema deployado en producción  
**Para** que usuarios reales puedan usar la plataforma

**Criterios de Aceptación:**
- [ ] Frontend deployado en Vercel con dominio personalizado
- [ ] Backend deployado en Railway con PostgreSQL managed
- [ ] Variables de entorno configuradas correctamente
- [ ] SSL/HTTPS funcionando en ambos entornos
- [ ] CI/CD pipeline automatizado (GitHub Actions)
- [ ] Staging environment funcionando
- [ ] Monitoring básico configurado
- [ ] Backup strategy implementada para DB

---

## 🔄 Sprint 2 (Prioridad MEDIA - 2-3 semanas)

#### US-005: WhatsApp Integration
**Como** cliente o profesional  
**Quiero** contactar directamente por WhatsApp con un click  
**Para** acordar servicios sin intermediarios ni comisiones

**Criterios de Aceptación:**
- [ ] Botones de WhatsApp funcionando en service cards
- [ ] WhatsApp links pre-poblados con mensaje contextual
- [ ] Números de WhatsApp validados en profiles
- [ ] Tracking de contactos realizados (analytics)

---

#### US-006: Mobile Responsive Fixes
**Como** usuario móvil  
**Quiero** una experiencia optimizada en dispositivos móviles  
**Para** poder usar Fixia desde cualquier dispositivo

**Criterios de Aceptación:**  
- [ ] Navigation hamburger menu implementado
- [ ] Todas las pantallas responsive tested en mobile/tablet
- [ ] Touch interactions optimizadas
- [ ] Performance optimizada para conexiones lentas

---

#### US-007: Advanced Search & Filters
**Como** cliente  
**Quiero** filtros avanzados en el catálogo de servicios  
**Para** encontrar exactamente lo que necesito

**Criterios de Aceptación:**
- [ ] Filtros por ubicación específica dentro de Chubut  
- [ ] Filtros por rango de precio
- [ ] Filtros por rating de profesional
- [ ] Filtros por disponibilidad
- [ ] Ordenamiento por varios criterios
- [ ] Búsqueda por texto en title/description

---

## 🎨 Sprint 3 (Prioridad BAJA - 3-4 semanas)

#### US-008: Professional Verification System  
**Como** profesional  
**Quiero** obtener verificación oficial  
**Para** generar más confianza en clientes potenciales

**Criterios de Aceptación:**
- [ ] Proceso de verificación de identidad
- [ ] Verificación de especialidades/certificaciones
- [ ] Badges visuales en profiles y service cards
- [ ] Admin panel para aprobar verificaciones

---

#### US-009: Rating & Review System
**Como** cliente  
**Quiero** ver y dejar reseñas de profesionales  
**Para** tomar decisiones informadas

**Criterios de Aceptación:**
- [ ] Sistema de rating 1-5 estrellas
- [ ] Reviews con comentarios de texto
- [ ] Promedio y conteo de reviews visible
- [ ] Solo usuarios que contrataron pueden reviewar

---

#### US-010: Notification System
**Como** usuario  
**Quiero** recibir notificaciones relevantes  
**Para** estar al día con actividad importante

**Criterios de Aceptación:**
- [ ] In-app notifications con badge count
- [ ] Email notifications opcionales
- [ ] Push notifications (PWA)
- [ ] Configuración de preferencias de notificación

---

## 🏆 Features Futuras (Backlog Extendido)

#### US-011: Project Matching Algorithm
**Como** profesional  
**Quiero** recibir oportunidades relevantes automáticamente  
**Para** maximizar mis posibilidades de trabajo

#### US-012: Premium Plans Implementation  
**Como** business owner  
**Quiero** monetizar la plataforma con planes premium  
**Para** generar ingresos sostenibles

#### US-013: Multi-language Support (ESP/ENG)
**Como** usuario turista o extranjero  
**Quiero** usar la plataforma en inglés  
**Para** acceder a servicios en Chubut

#### US-014: Advanced Analytics Dashboard
**Como** profesional  
**Quiero** ver métricas detalladas de mi performance  
**Para** optimizar mis servicios y precios

#### US-015: Integrated Chat System
**Como** usuario  
**Quiero** un chat interno complementario a WhatsApp  
**Para** mantener historial de conversaciones

---

## 📊 Métricas de Éxito

### Sprint 1 Goals:
- [ ] 0% regresión en funcionalidad existente
- [ ] 100% de pantallas conectadas a API real  
- [ ] Deploy production funcionando 24/7
- [ ] Performance Lighthouse > 90 en mobile/desktop

### Sprint 2 Goals:
- [ ] 100% mobile responsive
- [ ] WhatsApp integration funcionando
- [ ] Filtros avanzados implementados

### Comerciales (Post-Launch):
- [ ] 50+ profesionales registrados primer mes
- [ ] 200+ usuarios registrados primer mes  
- [ ] 10+ servicios contactados vía WhatsApp por semana
- [ ] 5+ proyectos publicados por semana

---

## 🚫 Out of Scope (Explícitamente NO incluir)

- ❌ Sistema de pagos integrado (es sin comisiones, contacto directo)
- ❌ Video calls o meeting scheduling  
- ❌ Geolocalización en tiempo real
- ❌ Social media features (shares, likes masivos)
- ❌ Marketplace para productos físicos
- ❌ Sistema de pujas/bidding automático
- ❌ Multi-tenant para otras provincias (solo Chubut V1)

---

**Estado**: Actualizado  
**Próxima revisión**: 28 agosto 2025  
**Owner**: Product Team