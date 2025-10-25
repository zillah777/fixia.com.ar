# Dashboard UI/UX Improvements - Pendiente

## Contexto
El usuario reportó los siguientes problemas en el Dashboard:

1. **Espaciado**: En "Mis Solicitudes Activas" - "Anuncios y propuestas recibidas" se ve feo, no tienen espacio entre ellas
2. **Contraste**: Hay problemas de contraste en las cards de anuncios y propuestas
3. **Onboarding**: Necesita mensajes de onboarding inteligentes que:
   - Expliquen el dashboard
   - Sugieran acciones según actividad del usuario
   - Sean latentes hasta que el usuario los lea o cierre
   - No se muestren más después de leídos/cerrados

## Archivo a modificar
`apps/web/src/pages/DashboardPage.tsx` (1465 líneas)

## Cambios específicos requeridos

### 1. Arreglar espaciado en ClientAnnouncements (Líneas 497-504)

**Problema actual:**
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle>Mis Solicitudes Activas</CardTitle>
      <p className="text-sm text-muted-foreground mt-1">
        Anuncios y propuestas recibidas
      </p>
    </div>
```

**Solución:**
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="mb-2">Mis Solicitudes Activas</CardTitle>
      <p className="text-sm text-muted-foreground/80">
        Anuncios y propuestas recibidas
      </p>
    </div>
```

### 2. Mejorar contraste en cards de anuncios (Líneas 545-605)

**Cambios necesarios:**
- Cambiar `glass-medium` a `glass-glow` para mejor contraste base
- Cambiar `hover:glass-strong` a `hover:glass-medium`
- Mejorar backgrounds de badges con más opacidad
- Agregar mejor separación visual entre cards

**Ejemplo de mejora:**
```tsx
<div className="p-4 sm:p-5 glass-glow rounded-lg hover:glass-medium transition-all cursor-pointer border border-white/10">
  <div className="flex items-start justify-between mb-4">
    {/* Mejor espaciado y contraste */}
  </div>
</div>
```

### 3. Crear sistema de Onboarding

**Nuevo componente:** `apps/web/src/components/OnboardingMessages.tsx`

```tsx
import { useState, useEffect } from 'react';
import { X, Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingMessage {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  condition: (user: any, stats: any) => boolean;
  priority: number;
}

export function OnboardingMessages({ user, dashboardData, clientStats }: any) {
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Load dismissed messages from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedOnboarding');
    if (dismissed) {
      setDismissedMessages(JSON.parse(dismissed));
    }
  }, []);

  const messages: OnboardingMessage[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a tu Dashboard!',
      description: 'Aquí puedes ver tus estadísticas, gestionar servicios y revisar propuestas.',
      icon: Zap,
      color: 'from-blue-500 to-purple-500',
      condition: (user, stats) => !stats || (stats.open_announcements === 0 && stats.proposals_received === 0),
      priority: 1
    },
    {
      id: 'create_first_service',
      title: 'Crea tu primer servicio',
      description: 'Los profesionales que publican servicios reciben 3x más contactos.',
      icon: Target,
      color: 'from-green-500 to-teal-500',
      condition: (user, stats) => user?.userType === 'professional' && (!stats?.total_services || stats.total_services === 0),
      priority: 2
    },
    {
      id: 'create_announcement',
      title: 'Publica tu primer anuncio',
      description: 'Los clientes que publican anuncios reciben propuestas en menos de 24 horas.',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      condition: (user, stats) => stats?.open_announcements === 0,
      priority: 2
    },
    {
      id: 'inactive_user',
      title: '¿Necesitas ayuda?',
      description: 'Parece que llevas tiempo inactivo. Explora oportunidades o crea un servicio.',
      icon: TrendingUp,
      color: 'from-pink-500 to-red-500',
      condition: (user, stats) => {
        // Check if user has been inactive (no activity in last 7 days)
        // This would need actual activity tracking
        return false; // Placeholder
      },
      priority: 3
    }
  ];

  const activeMessages = messages
    .filter(msg => !dismissedMessages.includes(msg.id))
    .filter(msg => msg.condition(user, { ...dashboardData, ...clientStats }))
    .sort((a, b) => a.priority - b.priority);

  const handleDismiss = (messageId: string) => {
    const updated = [...dismissedMessages, messageId];
    setDismissedMessages(updated);
    localStorage.setItem('dismissedOnboarding', JSON.stringify(updated));

    if (currentMessageIndex < activeMessages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const handleDismissAll = () => {
    const allIds = activeMessages.map(m => m.id);
    setDismissedMessages(allIds);
    localStorage.setItem('dismissedOnboarding', JSON.stringify(allIds));
  };

  if (activeMessages.length === 0) return null;

  const currentMessage = activeMessages[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMessage.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={`glass border-white/20 bg-gradient-to-r ${currentMessage.color} bg-opacity-10 overflow-hidden`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${currentMessage.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 text-white">{currentMessage.title}</h3>
                <p className="text-sm text-white/80 mb-3">{currentMessage.description}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDismiss(currentMessage.id)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Entendido
                  </Button>
                  {activeMessages.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismissAll}
                      className="text-white/60 hover:text-white/80 hover:bg-white/10"
                    >
                      Cerrar todos ({activeMessages.length})
                    </Button>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDismiss(currentMessage.id)}
                className="h-8 w-8 text-white/60 hover:text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {activeMessages.length > 1 && (
              <div className="flex gap-1 mt-3 justify-center">
                {activeMessages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentMessageIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Integración en DashboardPage.tsx:**

Agregar después de la línea 1236 (después del header de bienvenida):

```tsx
{/* Onboarding Messages */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.15 }}
  className="mb-8"
>
  <OnboardingMessages
    user={user}
    dashboardData={dashboardData}
    clientStats={clientStats}
  />
</motion.div>
```

### 4. Mejoras adicionales de UI/UX

**En StatCards (líneas 396-416):**
- Agregar animaciones de hover más suaves
- Mejorar gradientes de texto
- Mejor espaciado entre elementos

**En ClientAnnouncements cards (líneas 550-602):**
```tsx
<div className="p-5 glass-glow rounded-xl hover:glass-medium transition-all duration-300 cursor-pointer border border-white/10 hover:border-primary/30">
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-semibold text-base truncate">{project.title}</h4>
        {project.status === 'open' && (
          <Badge className="bg-success/20 text-success border-success/40 text-xs font-medium">
            Abierto
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground/90 line-clamp-2">
        {project.description}
      </p>
    </div>
  </div>

  <div className="mt-4 pt-4 border-t border-white/10">
    {hasProposals ? (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-primary">
              {proposalCount} {proposalCount === 1 ? 'propuesta' : 'propuestas'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground/70">
            <Clock className="h-3 w-3 inline mr-1" />
            {formatTimeAgo(project.created_at)}
          </div>
        </div>
        <Button size="sm" className="liquid-gradient text-white font-medium">
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Ver Propuestas
        </Button>
      </div>
    ) : (
      // ... resto del código
    )}
  </div>
</div>
```

## Resumen de cambios en archivos

1. **apps/web/src/pages/DashboardPage.tsx**
   - Líneas 501-504: Mejorar espaciado en header
   - Líneas 545-605: Mejorar contraste y diseño de cards
   - Línea ~1237: Agregar componente OnboardingMessages
   - Import: Agregar `import { OnboardingMessages } from "../components/OnboardingMessages";`

2. **apps/web/src/components/OnboardingMessages.tsx** (NUEVO)
   - Crear componente completo de onboarding

## Próximos pasos

1. Crear el componente `OnboardingMessages.tsx`
2. Aplicar cambios de espaciado en DashboardPage
3. Mejorar contraste en todas las cards
4. Testear funcionamiento de mensajes de onboarding
5. Build y commit

## Notas adicionales

- El sistema de onboarding usa `localStorage` para persistir mensajes cerrados
- Los mensajes tienen prioridades y condiciones para mostrarse
- Se muestran uno a la vez con indicadores de progreso
- Opción de cerrar todos o uno por uno
