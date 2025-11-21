import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight, Shield, AlertCircle, RefreshCw, Package } from 'lucide-react';
import api from '@/lib/api';
import { useState } from 'react';

interface FeaturedService {
    id: string;
    title: string;
    description: string;
    price: number;
    main_image: string;
    professional: {
        id: string;
        name: string;
        avatar: string;
        location: string;
        verified: boolean;
        professional_profile: {
            rating: number;
            review_count: number;
            level: string;
        };
    };
    category: {
        name: string;
        slug: string;
        icon: string;
    };
}

// Fetch featured services from API
const fetchFeaturedServices = async (): Promise<FeaturedService[]> => {
    const response = await api.get('/services/featured?limit=6');
    return response;
};

// Loading skeleton for service cards
function ServiceCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-3 pt-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}

export function FeaturedServicesSection() {
    const { data: services, isLoading, isError, refetch } = useQuery<FeaturedService[]>({
        queryKey: ['featured-services'],
        queryFn: fetchFeaturedServices,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    // Error state
    if (isError) {
        return (
            <section className="py-20 bg-gradient-to-b from-background to-muted/20">
                <div className="container mx-auto px-6">
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error al cargar servicios</h3>
                        <p className="text-muted-foreground mb-4">
                            No pudimos cargar los servicios destacados. Por favor, intenta nuevamente.
                        </p>
                        <Button onClick={() => refetch()} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    // Empty state
    if (!isLoading && (!services || services.length === 0)) {
        return (
            <section className="py-20 bg-gradient-to-b from-background to-muted/20">
                <div className="container mx-auto px-6">
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay servicios destacados</h3>
                        <p className="text-muted-foreground mb-4">
                            Explora todos nuestros servicios disponibles
                        </p>
                        <Link to="/services">
                            <Button>
                                Ver Todos los Servicios
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">Profesionales Destacados</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Los servicios más solicitados y mejor valorados de Chubut
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 6 }).map((_, i) => (
                            <ServiceCardSkeleton key={i} />
                        ))
                    ) : (
                        // Service cards
                        services?.map((service, index) => (
                            <ServiceCard key={service.id} service={service} index={index} />
                        ))
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <Link to="/services">
                        <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8">
                            Ver Más Profesionales
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

// Service card component
function ServiceCard({ service, index }: { service: FeaturedService; index: number }) {
    const [imageError, setImageError] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    // Fallback image
    const fallbackImage = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
        >
            <Link to={`/services/${service.id}`}>
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full overflow-hidden">
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                        <motion.img
                            src={imageError ? fallbackImage : service.main_image}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={() => setImageError(true)}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Category Badge */}
                        <Badge className="absolute top-3 left-3 bg-primary/90 text-white border-0">
                            {service.category.name}
                        </Badge>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-sm font-semibold">
                                ${service.price.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>

                    <CardContent className="p-6">
                        {/* Service Title & Description */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.description}
                        </p>

                        {/* Professional Info */}
                        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarImage
                                    src={avatarError ? undefined : service.professional.avatar}
                                    alt={service.professional.name}
                                    onError={() => setAvatarError(true)}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(service.professional.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <p className="font-medium text-sm truncate">
                                        {service.professional.name}
                                    </p>
                                    {service.professional.verified && (
                                        <Shield className="h-4 w-4 text-success flex-shrink-0" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{service.professional.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rating & Level */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                <span className="text-sm font-semibold">
                                    {service.professional.professional_profile.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({service.professional.professional_profile.review_count})
                                </span>
                            </div>

                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                {service.professional.professional_profile.level}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
