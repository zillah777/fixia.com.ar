import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
    DollarSign,
    Clock,
    Star,
    AlertCircle,
    CheckCircle,
    Pause,
    Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionPaywall';
import type { Service } from '@/lib/services/services.service';

/**
 * Professional Services Tab Component
 * 
 * Displays and manages professional's services with:
 * - Stats overview (total, active, paused)
 * - Service list with quick actions
 * - Subscription status and limits
 */
export function ProfessionalServicesTab() {
    const {
        services,
        isLoading,
        subscriptionStatus,
        totalServices,
        activeServices,
        inactiveServices,
        toggleActive,
        isToggling,
    } = useServiceManagement();

    // Show subscription banner if not professional
    if (!subscriptionStatus.isProfessional) {
        return <SubscriptionBanner feature="services" />;
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <StatsCard
                    title="Total Servicios"
                    value={totalServices}
                    icon={TrendingUp}
                    iconColor="text-primary"
                    bgColor="bg-primary/20"
                />
                <StatsCard
                    title="Activos"
                    value={activeServices}
                    icon={CheckCircle}
                    iconColor="text-success"
                    bgColor="bg-success/20"
                    valueColor="text-success"
                />
                <StatsCard
                    title="Pausados"
                    value={inactiveServices}
                    icon={Pause}
                    iconColor="text-gray-400"
                    bgColor="bg-gray-500/20"
                    valueColor="text-gray-400"
                />
            </div>

            {/* Subscription Limit Warning */}
            {subscriptionStatus.hasReachedServiceLimit && (
                <Alert className="border-warning/20 bg-warning/5">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <AlertDescription className="text-warning">
                        Has alcanzado el límite de {subscriptionStatus.maxServices} servicios activos.
                        Pausa un servicio existente o actualiza tu plan para publicar más.
                    </AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Mis Servicios</h2>
                    <p className="text-muted-foreground">Gestiona tus servicios publicados</p>
                </div>
                <Link to="/new-project">
                    <Button
                        className="liquid-gradient hover:opacity-90"
                        disabled={subscriptionStatus.hasReachedServiceLimit}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Servicio
                    </Button>
                </Link>
            </div>

            {/* Services List */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : services.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {services.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <ServiceCard
                                    service={service}
                                    onToggle={() => toggleActive(service.id)}
                                    isToggling={isToggling}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

/**
 * Stats Card Component
 */
interface StatsCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    valueColor?: string;
}

function StatsCard({ title, value, icon: Icon, iconColor, bgColor, valueColor }: StatsCardProps) {
    return (
        <Card className="glass border-white/10">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <h3 className={`text-2xl font-bold mt-1 ${valueColor || ''}`}>{value}</h3>
                    </div>
                    <div className={`h-12 w-12 ${bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="glass border-white/10 animate-pulse">
                    <CardContent className="p-6">
                        <div className="h-20 bg-muted/20 rounded" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Empty State
 */
function EmptyState() {
    return (
        <Card className="glass border-white/10 text-center">
            <CardContent className="p-12">
                <div className="max-w-md mx-auto">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No tienes servicios publicados</h3>
                    <p className="text-muted-foreground mb-6">
                        Crea tu primer servicio y empieza a recibir solicitudes de clientes
                    </p>
                    <Link to="/new-project">
                        <Button className="liquid-gradient hover:opacity-90">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Primer Servicio
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Service Card Component
 */
interface ServiceCardProps {
    service: Service;
    onToggle: () => void;
    isToggling: boolean;
}

function ServiceCard({ service, onToggle, isToggling }: ServiceCardProps) {
    return (
        <Card className="glass border-white/10 hover:glass-medium transition-all group">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Service Image */}
                    <ServiceImage service={service} />

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                        <ServiceHeader service={service} />
                        <ServiceStats service={service} />
                        <ServiceTags service={service} />
                    </div>

                    {/* Actions */}
                    <ServiceActions
                        service={service}
                        onToggle={onToggle}
                        isToggling={isToggling}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Service Image Component
 */
function ServiceImage({ service }: { service: Service }) {
    return (
        <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted">
                {service.main_image ? (
                    <img
                        src={service.main_image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                        <span className="text-2xl font-bold">{service.title.charAt(0)}</span>
                    </div>
                )}
            </div>
            {service.featured && (
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-warning rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-white" />
                </div>
            )}
        </div>
    );
}

/**
 * Service Header Component
 */
function ServiceHeader({ service }: { service: Service }) {
    return (
        <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{service.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                </p>
            </div>
            <Badge
                className={
                    service.active
                        ? 'bg-success/20 text-success border-success/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                }
            >
                {service.active ? 'Activo' : 'Pausado'}
            </Badge>
        </div>
    );
}

/**
 * Service Stats Component
 */
function ServiceStats({ service }: { service: Service }) {
    return (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-white">
                    ${service.price.toLocaleString()}
                </span>
            </div>

            {service.delivery_time_days && (
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{service.delivery_time_days} días</span>
                </div>
            )}

            <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{service.view_count || 0} vistas</span>
            </div>

            {service.averageRating && (
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span>{service.averageRating.toFixed(1)}</span>
                </div>
            )}
        </div>
    );
}

/**
 * Service Tags Component
 */
function ServiceTags({ service }: { service: Service }) {
    if (!service.tags || service.tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {service.tags.slice(0, 3).map((tag) => (
                <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-primary/5 border-primary/20"
                >
                    {tag}
                </Badge>
            ))}
            {service.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                    +{service.tags.length - 3}
                </Badge>
            )}
        </div>
    );
}

/**
 * Service Actions Component
 * Simplified: Direct buttons instead of dropdown menu
 */
interface ServiceActionsProps {
    service: Service;
    onToggle: () => void;
    isToggling: boolean;
}

function ServiceActions({ service, onToggle, isToggling }: ServiceActionsProps) {
    return (
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Toggle Active/Pause */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                disabled={isToggling}
                title={service.active ? 'Pausar servicio' : 'Activar servicio'}
                className="h-8 px-2"
            >
                {service.active ? (
                    <Pause className="h-4 w-4" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
            </Button>

            {/* View Public */}
            <Link to={`/services/${service.id}`} target="_blank">
                <Button
                    variant="ghost"
                    size="sm"
                    title="Ver página pública"
                    className="h-8 px-2 w-full"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>

            {/* Edit (future: open modal) */}
            <Button
                variant="ghost"
                size="sm"
                title="Editar servicio"
                className="h-8 px-2"
                onClick={() => {
                    // TODO: Implement edit modal
                    window.location.href = `/new-project?edit=${service.id}`;
                }}
            >
                <Edit className="h-4 w-4" />
            </Button>
        </div>
    );
}
