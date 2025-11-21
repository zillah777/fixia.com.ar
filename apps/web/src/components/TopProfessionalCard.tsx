import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Shield, Clock, CheckCircle } from 'lucide-react';
import { SimulatedProfessional } from '@/types/professional';
import { useState } from 'react';

interface TopProfessionalCardProps {
    professional: SimulatedProfessional;
    index?: number;
}

/**
 * TopProfessionalCard Component
 * Displays a professional's service with premium UX and trust indicators
 * 
 * Security: All data is pre-sanitized from simulated data source
 * Accessibility: Full ARIA labels and keyboard navigation support
 */
export function TopProfessionalCard({ professional, index = 0 }: TopProfessionalCardProps) {
    const [avatarError, setAvatarError] = useState(false);

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format price range
    const formatPrice = (min: number, max: number) => {
        const formatter = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        if (min === max) {
            return formatter.format(min);
        }
        return `${formatter.format(min)} - ${formatter.format(max)}`;
    };

    // Get level color
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Elite':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Experto':
                return 'bg-primary/20 text-primary border-primary/30';
            case 'Intermedio':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="h-full"
        >
            <Link
                to={`/services/${professional.service.id}`}
                aria-label={`Ver servicio de ${professional.name}: ${professional.service.title}`}
            >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full overflow-hidden">
                    <CardContent className="p-6">
                        {/* Header: Professional Info */}
                        <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/20 flex-shrink-0">
                                <AvatarImage
                                    src={avatarError ? undefined : professional.avatar}
                                    alt={professional.name}
                                    onError={() => setAvatarError(true)}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {getInitials(professional.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                        {professional.name}
                                    </h3>
                                    {professional.verified && (
                                        <Shield
                                            className="h-4 w-4 text-success flex-shrink-0"
                                            aria-label="Profesional verificado"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{professional.location}</span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                                        <span className="text-sm font-semibold">
                                            {professional.professional_profile.rating.toFixed(1)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        ({professional.professional_profile.review_count} reseñas)
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ml-auto ${getLevelColor(professional.professional_profile.level)}`}
                                    >
                                        {professional.professional_profile.level}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Service Title & Description */}
                        <div className="mb-4 pt-4 border-t border-white/10">
                            <h4 className="font-semibold text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {professional.service.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {professional.service.description}
                            </p>
                        </div>

                        {/* Footer: Price & Delivery */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Desde</p>
                                <p className="font-bold text-lg text-primary">
                                    {formatPrice(professional.service.price_min, professional.service.price_max)}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                <span>{professional.service.delivery_time_days} días</span>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-success" aria-hidden="true" />
                                <span>{professional.professional_profile.completed_jobs} trabajos</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 text-primary" aria-hidden="true" />
                                <span>Responde en {professional.professional_profile.response_time_hours}h</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
