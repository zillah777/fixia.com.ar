import { LucideIcon } from 'lucide-react';
import {
    Sparkles, TrendingUp, Target, Zap, Users, MessageSquare, Heart, Briefcase,
    CheckCircle, AlertCircle, Clock, DollarSign, Settings, Bell, Search, Plus,
    Star, Award, Shield, Rocket, Gift, Trophy, Crown, Lightbulb, Coffee,
    PartyPopper, ThumbsUp, Eye, Lock, Unlock, Flame, Gem, Palette, Wand2
} from 'lucide-react';
import { User } from '../context/SecureAuthContext';
import { DashboardStats } from '../lib/services/dashboard.service';

export interface ClientStats {
    open_announcements?: number;
    proposals_received?: number;
    in_progress?: number;
    client_rating?: number;
    total_services?: number;
    total_reviews?: number;
    has_switched_role?: boolean;
}

export type MessageCategory = 'welcome' | 'subscription' | 'trust' | 'education' | 'surprise';

export interface OnboardingMessage {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    category: MessageCategory;
    condition: (user: User | null | undefined, stats: DashboardStats & ClientStats) => boolean;
    priority: number;
    action?: {
        label: string;
        href?: string;
    };
    dismissible: boolean;
    showOnce: boolean; // Per session
}

/**
 * Enhanced Onboarding Messages Configuration
 * 40+ messages across 5 categories for maximum engagement
 */
export const onboardingMessages: OnboardingMessage[] = [
    // ==========================================
    // CATEGORY: WELCOME & MOTIVATION (Priority 1-5)
    // ==========================================
    {
        id: 'welcome_client_new',
        title: '¡Bienvenido a Fixia! 🎉',
        description: 'Conecta con +10,000 profesionales verificados en toda Argentina. Tu próximo proyecto está a un clic de distancia.',
        icon: PartyPopper,
        color: 'from-blue-500 via-purple-500 to-pink-500',
        category: 'welcome',
        condition: (user, stats) => user?.userType === 'client' && stats?.open_announcements === 0,
        priority: 1,
        action: {
            label: 'Publicar mi primera solicitud',
            href: '/new-opportunity'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'welcome_professional_new',
        title: '¡Bienvenido, Profesional! 🚀',
        description: 'Tu talento merece ser visto. Crea servicios increíbles y conecta con clientes que valoran tu trabajo.',
        icon: Rocket,
        color: 'from-green-500 via-emerald-500 to-teal-500',
        category: 'welcome',
        condition: (user, stats) => user?.userType === 'professional' && (!stats?.total_services || stats.total_services === 0),
        priority: 1,
        action: {
            label: 'Crear mi primer servicio',
            href: '/new-project'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'motivation_client',
        title: 'Tu proyecto merece lo mejor ✨',
        description: 'El 94% de nuestros clientes encuentran al profesional perfecto en menos de 24 horas. ¡Tú también puedes!',
        icon: Sparkles,
        color: 'from-amber-500 via-orange-500 to-red-500',
        category: 'welcome',
        condition: (user, stats) => user?.userType === 'client' && (stats?.open_announcements ?? 0) > 0 && (stats?.proposals_received ?? 0) === 0,
        priority: 3,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'motivation_professional',
        title: 'Cada servicio es una oportunidad 🌟',
        description: 'Profesionales activos ganan en promedio $150,000/mes. Tu próximo cliente está buscándote ahora mismo.',
        icon: TrendingUp,
        color: 'from-violet-500 via-purple-500 to-fuchsia-500',
        category: 'welcome',
        condition: (user, stats) => user?.userType === 'professional' && (stats?.total_services ?? 0) > 0,
        priority: 4,
        dismissible: true,
        showOnce: true
    },

    // ==========================================
    // CATEGORY: SUBSCRIPTION INCENTIVES (Priority 6-15)
    // ==========================================
    {
        id: 'subscription_client_unlock',
        title: '🔓 Desbloquea todo el potencial de Fixia',
        description: 'Con Fixia Pro: contactos ilimitados, prioridad en búsquedas, y acceso a profesionales premium. Desde $2,999/mes.',
        icon: Crown,
        color: 'from-yellow-500 via-amber-500 to-orange-500',
        category: 'subscription',
        condition: (user, stats) => user?.userType === 'client' && user?.subscriptionStatus !== 'active' && (stats?.open_announcements ?? 0) >= 2,
        priority: 6,
        action: {
            label: 'Ver planes',
            href: '/subscription'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'subscription_professional_boost',
        title: '🚀 Multiplica tus oportunidades x10',
        description: 'Profesionales Pro reciben 10x más visibilidad, aparecen primero en búsquedas y acceden a proyectos exclusivos.',
        icon: Rocket,
        color: 'from-indigo-500 via-blue-500 to-cyan-500',
        category: 'subscription',
        condition: (user, stats) => user?.userType === 'professional' && user?.subscriptionStatus !== 'active' && (stats?.total_services ?? 0) >= 1,
        priority: 7,
        action: {
            label: 'Activar Fixia Pro',
            href: '/subscription'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'subscription_roi_client',
        title: '💎 Invierte en calidad, ahorra en tiempo',
        description: 'Clientes Pro ahorran 15 horas/mes en búsquedas y obtienen 40% mejores precios. ROI garantizado.',
        icon: Gem,
        color: 'from-pink-500 via-rose-500 to-red-500',
        category: 'subscription',
        condition: (user, stats) => user?.userType === 'client' && user?.subscriptionStatus !== 'active' && (stats?.in_progress ?? 0) >= 1,
        priority: 10,
        action: {
            label: 'Probar 7 días gratis',
            href: '/subscription'
        },
        dismissible: true,
        showOnce: true
    },
    {
        id: 'subscription_professional_earnings',
        title: '📈 Gana 3x más con Fixia Pro',
        description: 'Profesionales verificados con suscripción activa ganan $450,000/mes vs $150,000/mes de usuarios free.',
        icon: TrendingUp,
        color: 'from-green-500 via-emerald-500 to-teal-500',
        category: 'subscription',
        condition: (user, stats) => user?.userType === 'professional' && user?.subscriptionStatus !== 'active' && (stats?.total_services ?? 0) >= 2,
        priority: 8,
        action: {
            label: 'Ver beneficios Pro',
            href: '/subscription'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'subscription_limited_offer',
        title: '⏰ Oferta exclusiva: 50% OFF primer mes',
        description: '¡Solo por tiempo limitado! Activa Fixia Pro ahora y obtén el primer mes a mitad de precio. No te lo pierdas.',
        icon: Gift,
        color: 'from-red-500 via-pink-500 to-purple-500',
        category: 'subscription',
        condition: (user, stats) => user?.subscriptionStatus !== 'active' && (stats?.total_services ?? 0) >= 1,
        priority: 9,
        action: {
            label: 'Aprovechar oferta',
            href: '/subscription'
        },
        dismissible: true,
        showOnce: true
    },

    // ==========================================
    // CATEGORY: TRUST & COMMUNITY (Priority 16-25)
    // ==========================================
    {
        id: 'trust_verification_power',
        title: '✅ La verificación genera confianza',
        description: 'Usuarios verificados reciben 8x más respuestas. Completa tu verificación en 5 minutos y destaca.',
        icon: Shield,
        color: 'from-blue-500 via-indigo-500 to-purple-500',
        category: 'trust',
        condition: (user, stats) => !user?.isVerified,
        priority: 16,
        action: {
            label: 'Verificar ahora',
            href: '/profile'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'trust_review_importance',
        title: '⭐ Tu opinión construye la comunidad',
        description: 'Cada reseña ayuda a otros usuarios a tomar mejores decisiones. Califica a los profesionales que contrataste.',
        icon: Star,
        color: 'from-yellow-500 via-amber-500 to-orange-500',
        category: 'trust',
        condition: (user, stats) => user?.userType === 'client' && (stats?.in_progress ?? 0) > 0 && (stats?.total_reviews ?? 0) < 3,
        priority: 17,
        dismissible: true,
        showOnce: false
    },
    {
        id: 'trust_professional_reviews',
        title: '🌟 Las reseñas son tu mejor marketing',
        description: 'Profesionales con 10+ reseñas positivas reciben 5x más contratos. Pide feedback a tus clientes satisfechos.',
        icon: Award,
        color: 'from-purple-500 via-pink-500 to-rose-500',
        category: 'trust',
        condition: (user, stats) => user?.userType === 'professional' && (stats?.total_reviews ?? 0) < 10,
        priority: 18,
        dismissible: true,
        showOnce: false
    },
    {
        id: 'trust_community_respect',
        title: '❤️ Respeto y profesionalismo siempre',
        description: 'Somos una comunidad de confianza. Trata a todos con respeto y reporta cualquier comportamiento inapropiado.',
        icon: Heart,
        color: 'from-rose-500 via-pink-500 to-fuchsia-500',
        category: 'trust',
        condition: (user, stats) => true,
        priority: 22,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'trust_safety_tips',
        title: '🛡️ Tu seguridad es nuestra prioridad',
        description: 'Nunca compartas datos bancarios por chat. Usa siempre los métodos de pago verificados de la plataforma.',
        icon: Shield,
        color: 'from-red-500 via-orange-500 to-yellow-500',
        category: 'trust',
        condition: (user, stats) => (stats?.in_progress ?? 0) >= 1,
        priority: 20,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'trust_complete_profile',
        title: '📝 Un perfil completo inspira confianza',
        description: 'Agrega foto, bio, experiencia y certificaciones. Perfiles completos tienen 85% más conversión.',
        icon: Users,
        color: 'from-cyan-500 via-blue-500 to-indigo-500',
        category: 'trust',
        condition: (user, stats) => !user?.avatar || !user?.bio,
        priority: 19,
        action: {
            label: 'Completar perfil',
            href: '/profile'
        },
        dismissible: true,
        showOnce: false
    },

    // ==========================================
    // CATEGORY: UI EDUCATION (Priority 26-35)
    // ==========================================
    {
        id: 'education_dashboard_tour',
        title: '🎯 Conoce tu panel de control',
        description: 'Aquí ves tus estadísticas, proyectos activos y notificaciones. Todo lo importante en un solo lugar.',
        icon: Target,
        color: 'from-blue-500 via-cyan-500 to-teal-500',
        category: 'education',
        condition: (user, stats) => true,
        priority: 26,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'education_notifications_bell',
        title: '🔔 No te pierdas ninguna oportunidad',
        description: 'El ícono de campana te muestra notificaciones en tiempo real. Configura tus preferencias en Ajustes.',
        icon: Bell,
        color: 'from-yellow-500 via-orange-500 to-red-500',
        category: 'education',
        condition: (user, stats) => !user?.notifications_projects,
        priority: 27,
        action: {
            label: 'Configurar',
            href: '/settings'
        },
        dismissible: true,
        showOnce: true
    },
    {
        id: 'education_search_filters',
        title: '🔍 Usa filtros para encontrar lo perfecto',
        description: 'Filtra por categoría, precio, ubicación y calificación. Encuentra exactamente lo que buscas.',
        icon: Search,
        color: 'from-indigo-500 via-purple-500 to-pink-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'client',
        priority: 28,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'education_proposal_tips',
        title: '💡 Propuestas ganadoras en 3 pasos',
        description: '1) Lee bien el anuncio 2) Ofrece valor específico 3) Incluye ejemplos de trabajos similares. ¡Así ganas!',
        icon: Lightbulb,
        color: 'from-amber-500 via-yellow-500 to-lime-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'professional',
        priority: 29,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'education_keyboard_shortcuts',
        title: '⌨️ Atajos de teclado para expertos',
        description: 'Presiona "/" para buscar, "N" para nuevo proyecto, "M" para mensajes. Trabaja más rápido.',
        icon: Zap,
        color: 'from-violet-500 via-purple-500 to-fuchsia-500',
        category: 'education',
        condition: (user, stats) => (stats?.total_services ?? 0) >= 3 || (stats?.open_announcements ?? 0) >= 3,
        priority: 32,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'education_mobile_app',
        title: '📱 Fixia en tu bolsillo',
        description: 'Descarga la app móvil para recibir notificaciones push y gestionar proyectos desde cualquier lugar.',
        icon: Sparkles,
        color: 'from-pink-500 via-rose-500 to-red-500',
        category: 'education',
        condition: (user, stats) => true,
        priority: 33,
        dismissible: true,
        showOnce: true
    },

    // ==========================================
    // CATEGORY: DELIGHTFUL SURPRISES (Priority 36-45)
    // ==========================================
    {
        id: 'surprise_coffee_break',
        title: '☕ ¡Hora de un café!',
        description: 'Has estado trabajando duro. Tómate un descanso, estira las piernas y vuelve con energía renovada.',
        icon: Coffee,
        color: 'from-amber-500 via-orange-500 to-brown-500',
        category: 'surprise',
        condition: (user, stats) => true,
        priority: 38,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'surprise_milestone_celebration',
        title: '🎉 ¡Felicitaciones por tu progreso!',
        description: 'Has completado varios proyectos exitosamente. ¡Sigue así, estás construyendo algo grande!',
        icon: Trophy,
        color: 'from-yellow-500 via-amber-500 to-orange-500',
        category: 'surprise',
        condition: (user, stats) => (stats?.in_progress ?? 0) >= 3 || (stats?.total_services ?? 0) >= 5,
        priority: 36,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'surprise_fun_fact',
        title: '🤓 Dato curioso de Fixia',
        description: 'El profesional más rápido respondió una solicitud en 47 segundos. ¿Puedes superarlo?',
        icon: Flame,
        color: 'from-red-500 via-orange-500 to-yellow-500',
        category: 'surprise',
        condition: (user, stats) => user?.userType === 'professional',
        priority: 40,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'surprise_motivational_quote',
        title: '✨ Inspiración del día',
        description: '"El éxito es la suma de pequeños esfuerzos repetidos día tras día." - Robert Collier',
        icon: Sparkles,
        color: 'from-purple-500 via-pink-500 to-rose-500',
        category: 'surprise',
        condition: (user, stats) => true,
        priority: 42,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'surprise_thank_you',
        title: '💙 Gracias por ser parte de Fixia',
        description: 'Tu confianza nos impulsa a mejorar cada día. Juntos estamos construyendo la mejor comunidad de profesionales.',
        icon: Heart,
        color: 'from-blue-500 via-indigo-500 to-purple-500',
        category: 'surprise',
        condition: (user, stats) => (stats?.total_reviews ?? 0) >= 1 || (stats?.total_services ?? 0) >= 1,
        priority: 44,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'surprise_weekend_vibes',
        title: '🌴 ¡Feliz fin de semana!',
        description: 'Recuerda desconectar y disfrutar. Los mejores profesionales también saben descansar.',
        icon: PartyPopper,
        color: 'from-cyan-500 via-blue-500 to-indigo-500',
        category: 'surprise',
        condition: (user, stats) => new Date().getDay() === 5 || new Date().getDay() === 6,
        priority: 45,
        dismissible: true,
        showOnce: true
    },

    // ==========================================
    // ADDITIONAL CONTEXTUAL MESSAGES
    // ==========================================
    {
        id: 'client_first_proposal_received',
        title: '📬 ¡Recibiste tu primera propuesta!',
        description: 'Revísala con calma. Compara precio, tiempo de entrega y perfil del profesional antes de decidir.',
        icon: MessageSquare,
        color: 'from-green-500 via-emerald-500 to-teal-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'client' && (stats?.proposals_received ?? 0) === 1,
        priority: 5,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'professional_first_service_created',
        title: '🎊 ¡Tu primer servicio está publicado!',
        description: 'Ahora optimízalo: agrega más fotos, detalla tus entregas y ofrece paquetes. ¡Los clientes están buscando!',
        icon: Briefcase,
        color: 'from-blue-500 via-purple-500 to-pink-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'professional' && (stats?.total_services ?? 0) === 1,
        priority: 5,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'whatsapp_integration',
        title: '💬 Conecta tu WhatsApp',
        description: 'El 78% de los clientes prefieren WhatsApp. Agrégalo en tu perfil para recibir más consultas.',
        icon: MessageSquare,
        color: 'from-green-500 via-emerald-500 to-lime-500',
        category: 'trust',
        condition: (user, stats) => !user?.whatsapp_number && user?.userType === 'professional',
        priority: 21,
        action: {
            label: 'Agregar WhatsApp',
            href: '/profile'
        },
        dismissible: true,
        showOnce: false
    },
    {
        id: 'dual_role_opportunity',
        title: '🔄 ¿Sabías que puedes ser ambos?',
        description: 'Muchos profesionales también contratan servicios. Cambia entre roles y aprovecha todo Fixia.',
        icon: Users,
        color: 'from-violet-500 via-purple-500 to-fuchsia-500',
        category: 'education',
        condition: (user, stats) => !stats?.has_switched_role,
        priority: 35,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'response_time_matters',
        title: '⚡ La velocidad importa',
        description: 'Profesionales que responden en <2 horas tienen 80% más probabilidad de ser contratados. ¡Sé rápido!',
        icon: Clock,
        color: 'from-red-500 via-orange-500 to-yellow-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'professional' && (stats?.total_services ?? 0) > 0,
        priority: 30,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'pricing_psychology',
        title: '💰 El precio perfecto existe',
        description: 'Ofrece 3 opciones (básico, estándar, premium). Los clientes tienden a elegir la opción del medio.',
        icon: DollarSign,
        color: 'from-emerald-500 via-green-500 to-teal-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'professional' && (stats?.total_services ?? 0) >= 2,
        priority: 31,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'portfolio_power',
        title: '📸 Tu portafolio vende por ti',
        description: 'Servicios con 5+ fotos de calidad convierten 6x más. Muestra tu mejor trabajo, vale la pena.',
        icon: Eye,
        color: 'from-pink-500 via-rose-500 to-red-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'professional' && (stats?.total_services ?? 0) > 0,
        priority: 34,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'client_budget_tip',
        title: '💡 Define un presupuesto realista',
        description: 'Anuncios con presupuesto claro reciben 4x más propuestas de calidad. Investiga precios de mercado.',
        icon: DollarSign,
        color: 'from-blue-500 via-indigo-500 to-purple-500',
        category: 'education',
        condition: (user, stats) => user?.userType === 'client' && (stats?.open_announcements ?? 0) > 0,
        priority: 37,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'celebration_verified',
        title: '🏆 ¡Ahora eres usuario verificado!',
        description: 'Tu badge de verificación te diferencia. Prepárate para recibir más oportunidades de calidad.',
        icon: Award,
        color: 'from-yellow-500 via-amber-500 to-orange-500',
        category: 'surprise',
        condition: (user, stats) => user?.isVerified === true,
        priority: 2,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'night_owl',
        title: '🌙 Trabajando tarde, ¿eh?',
        description: 'Recuerda descansar bien. Los mejores profesionales cuidan su salud y energía.',
        icon: Sparkles,
        color: 'from-indigo-500 via-purple-500 to-pink-500',
        category: 'surprise',
        condition: (user, stats) => new Date().getHours() >= 22 || new Date().getHours() <= 5,
        priority: 43,
        dismissible: true,
        showOnce: true
    },
    {
        id: 'early_bird',
        title: '🌅 ¡Buenos días, madrugador!',
        description: 'El éxito ama a los que madrugan. Que tengas un día productivo y lleno de oportunidades.',
        icon: Coffee,
        color: 'from-orange-500 via-amber-500 to-yellow-500',
        category: 'surprise',
        condition: (user, stats) => new Date().getHours() >= 5 && new Date().getHours() <= 7,
        priority: 41,
        dismissible: true,
        showOnce: true
    }
];

