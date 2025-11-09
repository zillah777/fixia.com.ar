import { useState, useEffect, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  X, TrendingUp, Target, Zap, Users,
  MessageSquare, Heart, Briefcase,
  CheckCircle, AlertCircle,
  Clock, DollarSign, Settings, Bell, Search, Plus
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../context/SecureAuthContext';
import { DashboardStats } from '../lib/services/dashboard.service';

interface ClientStats {
  open_announcements?: number;
  proposals_received?: number;
  in_progress?: number;
  client_rating?: number;
  total_services?: number;
  total_reviews?: number;
  has_switched_role?: boolean;
}

interface OnboardingMessage {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  condition: (user: User | null | undefined, stats: DashboardStats & ClientStats) => boolean;
  priority: number;
}

interface OnboardingMessagesProps {
  user: User | null | undefined;
  dashboardData?: DashboardStats | null;
  clientStats?: ClientStats;
}

export function OnboardingMessages({ user, dashboardData, clientStats }: OnboardingMessagesProps): ReactNode {
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  // Load dismissed messages from localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('dismissedOnboarding');
      if (dismissed) {
        setDismissedMessages(JSON.parse(dismissed));
      }
    } catch (error) {
      console.warn('Failed to load dismissed messages from localStorage:', error);
    }
  }, []);

  const messages: OnboardingMessage[] = [
    // === MENSAJES DE BIENVENIDA ===
    {
      id: 'welcome_client',
      title: '¡Bienvenido a Fixia! 👋',
      description: 'Conecta con profesionales verificados en toda Argentina. Publica lo que necesitas y recibe propuestas en minutos.',
      icon: Plus,
      color: 'from-blue-500 to-purple-500',
      condition: (user, stats) => user?.userType === 'client' && stats?.open_announcements === 0,
      priority: 1
    },
    {
      id: 'welcome_professional',
      title: '¡Bienvenido Profesional! 🚀',
      description: 'Tu perfil está listo. Crea servicios, responde a oportunidades y construye tu reputación en Fixia.',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      condition: (user, stats) => user?.userType === 'professional' && (!stats?.total_services || stats.total_services === 0),
      priority: 1
    },

    // === MENSAJES PARA CLIENTES ===
    {
      id: 'client_first_announcement',
      title: 'Publica tu primera solicitud',
      description: '📢 Los anuncios bien detallados reciben un 300% más propuestas. Incluye fotos, presupuesto y plazo estimado.',
      icon: Plus,
      color: 'from-yellow-500 to-orange-500',
      condition: (user, stats) => user?.userType === 'client' && stats?.open_announcements === 0,
      priority: 2
    },
    {
      id: 'client_explore_services',
      title: 'Explora el catálogo de servicios',
      description: '🔍 Encuentra profesionales verificados navegando por categorías. Revisa calificaciones y portafolios antes de contratar.',
      icon: Search,
      color: 'from-cyan-500 to-blue-500',
      condition: (user, stats) => user?.userType === 'client' && stats?.open_announcements === 0,
      priority: 3
    },
    {
      id: 'client_pending_proposals',
      title: '¡Tienes propuestas esperando! 📬',
      description: 'Revisa las ofertas recibidas. Compara precios, tiempos y perfiles antes de decidir.',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      condition: (user, stats) => stats?.proposals_received > 0 && stats?.open_announcements > 0,
      priority: 1
    },
    {
      id: 'client_leave_review',
      title: 'Ayuda a la comunidad con tu opinión',
      description: '⭐ Califica a los profesionales que contrataste. Tu feedback ayuda a otros clientes a decidir mejor.',
      icon: Heart,
      color: 'from-amber-500 to-yellow-500',
      condition: (user, stats) => stats?.in_progress > 0,
      priority: 4
    },
    {
      id: 'client_announcement_tips',
      title: 'Mejora tus solicitudes',
      description: '💡 Tip: Sé específico con fechas, ubicación y presupuesto. Los anuncios claros atraen mejores profesionales.',
      icon: Target,
      color: 'from-indigo-500 to-purple-500',
      condition: (user, stats) => stats?.open_announcements > 0 && stats?.proposals_received < 3,
      priority: 5
    },
    {
      id: 'client_verify_profile',
      title: 'Verifica tu cuenta',
      description: 'Usuarios verificados reciben 2x más respuestas. Agrega tu teléfono y completa tu perfil.',
      icon: CheckCircle,
      color: 'from-green-500 to-teal-500',
      condition: (user, stats) => !user?.isVerified,
      priority: 3
    },

    // === MENSAJES PARA PROFESIONALES ===
    {
      id: 'pro_create_first_service',
      title: 'Crea tu primer servicio',
      description: '🎯 Los profesionales con servicios publicados reciben 5x más contactos que los que solo responden anuncios.',
      icon: Briefcase,
      color: 'from-green-500 to-teal-500',
      condition: (user, stats) => user?.userType === 'professional' && (!stats?.total_services || stats.total_services === 0),
      priority: 2
    },
    {
      id: 'pro_add_portfolio',
      title: 'Agrega fotos a tu portafolio',
      description: '📸 Servicios con 3+ imágenes profesionales tienen 400% más conversión. Muestra tu mejor trabajo.',
      icon: Briefcase,
      color: 'from-pink-500 to-rose-500',
      condition: (user, stats) => user?.userType === 'professional' && stats?.total_services > 0,
      priority: 3
    },
    {
      id: 'pro_explore_opportunities',
      title: 'Explora oportunidades activas',
      description: '💼 Hay clientes buscando tus servicios ahora. Revisa anuncios y envía propuestas personalizadas.',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      condition: (user, stats) => user?.userType === 'professional' && stats?.total_services > 0,
      priority: 4
    },
    {
      id: 'pro_complete_profile',
      title: 'Completa tu perfil profesional',
      description: '📝 Agrega experiencia, certificaciones y especialidades. Perfiles completos tienen 3x más visibilidad.',
      icon: Users,
      color: 'from-orange-500 to-amber-500',
      condition: (user, stats) => user?.userType === 'professional' && !user?.bio,
      priority: 2
    },
    {
      id: 'pro_response_time',
      title: 'Responde rápido = Más contratos',
      description: '⚡ Los profesionales que responden en menos de 2 horas tienen 80% más probabilidad de ser contratados.',
      icon: Clock,
      color: 'from-red-500 to-orange-500',
      condition: (user, stats) => user?.userType === 'professional',
      priority: 5
    },
    {
      id: 'pro_pricing_strategy',
      title: 'Optimiza tus precios',
      description: '💰 Ofrece 3 paquetes (básico, estándar, premium). Los clientes prefieren tener opciones para elegir.',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-500',
      condition: (user, stats) => user?.userType === 'professional' && stats?.total_services > 0,
      priority: 6
    },
    {
      id: 'pro_get_verified',
      title: '¡Verifica tu cuenta profesional!',
      description: '🏆 Profesionales verificados reciben 10x más confianza. Completa el proceso en 5 minutos.',
      icon: CheckCircle,
      color: 'from-blue-500 to-indigo-500',
      condition: (user, stats) => user?.userType === 'professional' && !user?.isVerified,
      priority: 1
    },
    {
      id: 'pro_build_reputation',
      title: 'Construye tu reputación',
      description: '⭐ Cada trabajo completado suma. Pide a tus clientes que te califiquen para destacar en búsquedas.',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      condition: (user, stats) => user?.userType === 'professional' && stats?.total_reviews < 5,
      priority: 7
    },
    {
      id: 'pro_service_visibility',
      title: 'Mejora la visibilidad de tus servicios',
      description: '👁️ Usa títulos claros, descripciones detalladas y tags relevantes. El SEO interno te posiciona mejor.',
      icon: Search,
      color: 'from-indigo-500 to-purple-500',
      condition: (user, stats) => user?.userType === 'professional' && stats?.total_services > 0,
      priority: 8
    },
    {
      id: 'pro_notifications',
      title: 'Activa las notificaciones',
      description: '🔔 No pierdas oportunidades. Configura alertas para nuevos anuncios en tus categorías favoritas.',
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
      condition: (user, stats) => user?.userType === 'professional' && !user?.notifications_projects,
      priority: 4
    },

    // === MENSAJES GENERALES Y TIPS ===
    {
      id: 'profile_photo_tip',
      title: 'Agrega una foto de perfil',
      description: '📷 Perfiles con foto profesional generan 85% más confianza. Usa una imagen clara y amigable.',
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
      condition: (user, stats) => !user?.avatar,
      priority: 3
    },
    {
      id: 'settings_reminder',
      title: 'Personaliza tu experiencia',
      description: '⚙️ Configura tus preferencias, zona horaria y métodos de contacto favoritos en Ajustes.',
      icon: Settings,
      color: 'from-gray-500 to-slate-500',
      condition: (user, stats) => !user?.timezone,
      priority: 9
    },
    {
      id: 'community_guidelines',
      title: 'Sé parte de la comunidad',
      description: '❤️ Respeto, honestidad y profesionalismo. Reporta cualquier conducta inapropiada.',
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      condition: (user, stats) => true, // Siempre mostrar si no fue cerrado
      priority: 10
    },
    {
      id: 'whatsapp_contact',
      title: 'Agrega tu WhatsApp',
      description: '📱 Clientes prefieren contactar por WhatsApp. Agrégalo en tu perfil para más conversiones.',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      condition: (user, stats) => !user?.whatsapp_number,
      priority: 6
    },
    {
      id: 'dual_role_tip',
      title: '¿Sabías que puedes ser cliente Y profesional?',
      description: '🔄 Muchos usuarios publican servicios y también contratan. Aprovecha ambas funcionalidades.',
      icon: Users,
      color: 'from-violet-500 to-purple-500',
      condition: (user, stats) => user?.userType === 'client' && !stats?.has_switched_role,
      priority: 11
    }
  ];

  const mergedStats: DashboardStats & ClientStats = {
    total_services: 0,
    active_projects: 0,
    total_earnings: 0,
    average_rating: 0,
    review_count: 0,
    profile_views: 0,
    messages_count: 0,
    pending_proposals: 0,
    ...dashboardData,
    ...clientStats
  };

  const activeMessages = messages
    .filter(msg => !dismissedMessages.includes(msg.id))
    .filter(msg => msg.condition(user, mergedStats))
    .sort((a, b) => a.priority - b.priority);

  const handleDismiss = (messageId: string) => {
    // Prevent double dismissal
    if (isDismissing || dismissedMessages.includes(messageId)) {
      return;
    }

    setIsDismissing(true);
    try {
      const updated = [...dismissedMessages, messageId];
      setDismissedMessages(updated);

      try {
        localStorage.setItem('dismissedOnboarding', JSON.stringify(updated));
      } catch (storageError) {
        console.warn('Failed to save dismissed messages to localStorage:', storageError);
        // Continue anyway - dismissal is not critical
      }

      if (currentMessageIndex < activeMessages.length - 1) {
        setCurrentMessageIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error dismissing onboarding message:', error);
      // Don't show error to user - just continue
    } finally {
      setIsDismissing(false);
    }
  };

  const handleDismissAll = () => {
    try {
      const allIds = activeMessages.map(m => m.id);
      setDismissedMessages(allIds);

      try {
        localStorage.setItem('dismissedOnboarding', JSON.stringify(allIds));
      } catch (storageError) {
        console.warn('Failed to save dismissed messages to localStorage:', storageError);
        // Continue anyway - dismissal is not critical
      }
    } catch (error) {
      console.error('Error dismissing all onboarding messages:', error);
      // Don't show error to user - just continue
    }
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
