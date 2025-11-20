import { motion } from 'motion/react';
import { Lock, Zap, Star, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { IS_DEVELOPMENT } from '@/config/features';

interface SubscriptionPaywallProps {
    /**
     * Feature being blocked
     */
    feature: 'services' | 'b2b' | 'general';

    /**
     * Optional custom title
     */
    title?: string;

    /**
     * Optional custom description
     */
    description?: string;

    /**
     * Whether to show as a banner instead of full page
     */
    variant?: 'full' | 'banner';
}

/**
 * Subscription Paywall Component
 * 
 * Elegant paywall shown to non-subscribers when trying to access
 * professional features. Encourages subscription with clear benefits.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * const { canPublishServices } = useSubscriptionStatus();
 * 
 * if (!canPublishServices) {
 *   return <SubscriptionPaywall feature="services" />;
 * }
 * ```
 */
export function SubscriptionPaywall({
    feature,
    title,
    description,
    variant = 'full',
}: SubscriptionPaywallProps) {
    const navigate = useNavigate();

    const featureConfig = {
        services: {
            title: 'Publica tus Servicios',
            description: 'Llega a miles de clientes potenciales y haz crecer tu negocio',
            icon: Zap,
            benefits: [
                'Hasta 5 servicios activos',
                'Perfil destacado en búsquedas',
                'Estadísticas de rendimiento',
                'Notificaciones instantáneas',
            ],
        },
        b2b: {
            title: 'Conecta con Profesionales',
            description: 'Accede a proyectos B2B exclusivos y expande tu red',
            icon: TrendingUp,
            benefits: [
                'Aplica a proyectos B2B',
                'Red de profesionales verificados',
                'Oportunidades de colaboración',
                'Prioridad en propuestas',
            ],
        },
        general: {
            title: 'Desbloquea tu Potencial',
            description: 'Accede a todas las funcionalidades profesionales de Fixia',
            icon: Star,
            benefits: [
                'Publicación de servicios',
                'Proyectos B2B ilimitados',
                'Perfil profesional destacado',
                'Soporte prioritario',
            ],
        },
    };

    const config = featureConfig[feature];
    const Icon = config.icon;

    // Banner variant (compact)
    if (variant === 'banner') {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Card className="glass-glow border-primary/30 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-3 flex-shrink-0">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-white">
                                        {title || config.title}
                                    </h3>
                                    {IS_DEVELOPMENT && (
                                        <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                                            DEV MODE
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-white/70 text-sm mb-3">
                                    {description || config.description}
                                </p>
                                <Button
                                    onClick={() => navigate('/pricing')}
                                    size="sm"
                                    className="liquid-gradient hover:opacity-90"
                                >
                                    Ver Planes
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Full page variant
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center min-h-[500px] p-6"
        >
            <Card className="glass-glow border-primary/30 p-8 max-w-md text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                {/* Dev mode indicator */}
                {IS_DEVELOPMENT && (
                    <div className="absolute top-4 right-4">
                        <Badge className="bg-warning/20 text-warning border-warning/30">
                            DEV MODE - Checks Disabled
                        </Badge>
                    </div>
                )}

                {/* Icon */}
                <div className="mb-6 relative z-10">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-6">
                            <Lock className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2 relative z-10">
                    {title || config.title}
                </h2>
                <p className="text-white/70 mb-6 relative z-10">
                    {description || config.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-8 text-left relative z-10">
                    {config.benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-3 text-sm text-white/80"
                        >
                            <div className="bg-success/20 rounded-full p-1 flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-success" />
                            </div>
                            <span>{benefit}</span>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Button */}
                <Button
                    onClick={() => navigate('/pricing')}
                    className="w-full liquid-gradient hover:opacity-90 text-lg h-12 relative z-10"
                >
                    <Zap className="h-5 w-5 mr-2" />
                    Ver Planes y Precios
                </Button>

                {/* Footer note */}
                <p className="text-xs text-white/50 mt-4 relative z-10">
                    Cancela cuando quieras. Sin compromisos ni permanencia.
                </p>
            </Card>
        </motion.div>
    );
}

/**
 * Subscription Banner Component
 * 
 * Compact banner version for use in dashboards
 */
export function SubscriptionBanner(props: Omit<SubscriptionPaywallProps, 'variant'>) {
    return <SubscriptionPaywall {...props} variant="banner" />;
}
