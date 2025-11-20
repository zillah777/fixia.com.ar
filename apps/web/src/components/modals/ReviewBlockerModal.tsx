import { motion } from 'motion/react';
import { AlertCircle, Star, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import type { ReviewBlocker } from '@/types/client-circuit';

interface ReviewBlockerModalProps {
    /**
     * Review blocker state
     */
    blocker: ReviewBlocker;

    /**
     * Callback when user clicks to review
     */
    onReviewClick: () => void;

    /**
     * Whether the modal can be dismissed (usually false)
     */
    canDismiss?: boolean;

    /**
     * Optional callback when dismissed (if canDismiss is true)
     */
    onDismiss?: () => void;
}

/**
 * Review Blocker Modal
 * 
 * Blocks user from creating new projects until they complete pending reviews.
 * This enforces the quality feedback loop in the marketplace.
 * 
 * Features:
 * - Cannot be dismissed (forced action)
 * - Shows pending review info
 * - Direct link to review form
 * - Urgency indicator based on completion date
 * 
 * @component
 */
export function ReviewBlockerModal({
    blocker,
    onReviewClick,
    canDismiss = false,
    onDismiss,
}: ReviewBlockerModalProps) {
    if (!blocker.hasPendingReview) return null;

    // Calculate days since completion for urgency
    const getDaysSinceCompletion = () => {
        if (!blocker.completedAt) return 0;
        const completed = new Date(blocker.completedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - completed.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysSince = getDaysSinceCompletion();
    const isUrgent = daysSince > 7; // More than a week

    return (
        <>
            {/* Backdrop - cannot click through */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="glass-glow border-warning/30 shadow-2xl overflow-hidden relative">
                        {/* Close button (only if dismissible) */}
                        {canDismiss && onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        )}

                        <CardHeader className="pb-4">
                            {/* Warning Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="flex justify-center mb-4"
                            >
                                <div className="relative">
                                    <div className={`absolute inset-0 ${isUrgent ? 'bg-destructive/30' : 'bg-warning/30'} rounded-full blur-xl animate-pulse`} />
                                    <AlertCircle className={`h-16 w-16 ${isUrgent ? 'text-destructive' : 'text-warning'} relative z-10`} />
                                </div>
                            </motion.div>

                            <CardTitle className="text-center text-2xl">
                                Calificación Pendiente
                            </CardTitle>

                            {isUrgent && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center text-destructive text-sm font-semibold"
                                >
                                    ⚠️ Hace {daysSince} días que completaste este trabajo
                                </motion.p>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <p className="text-white/80 leading-relaxed">
                                    Para seguir usando Fixia, por favor cuéntanos cómo te fue con{' '}
                                    <span className="font-bold text-white">{blocker.revieweeName}</span>
                                </p>
                            </motion.div>

                            {/* Project Info */}
                            {blocker.projectTitle && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/5 border border-primary/20 rounded-lg p-4"
                                >
                                    <p className="text-xs text-white/60 mb-2 uppercase tracking-wider font-semibold">
                                        Proyecto Completado
                                    </p>
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-primary/40 flex-shrink-0">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blocker.revieweeName}`} />
                                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                {blocker.revieweeName?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">
                                                {blocker.projectTitle}
                                            </p>
                                            <p className="text-sm text-white/60">
                                                con {blocker.revieweeName}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Why Reviews Matter */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    <Star className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-semibold text-white">
                                        ¿Por qué son importantes las calificaciones?
                                    </p>
                                </div>
                                <ul className="text-xs text-white/70 space-y-1 ml-6 list-disc">
                                    <li>Ayudan a otros clientes a tomar mejores decisiones</li>
                                    <li>Mejoran la calidad del servicio en Fixia</li>
                                    <li>Reconocen el buen trabajo de los profesionales</li>
                                    <li>Mantienen la confianza en la comunidad</li>
                                </ul>
                            </motion.div>

                            {/* Action Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    onClick={onReviewClick}
                                    className={`
                    w-full h-12 font-semibold text-lg
                    ${isUrgent
                                            ? 'bg-gradient-to-r from-destructive via-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70'
                                            : 'bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                                        }
                    text-white shadow-lg
                  `}
                                >
                                    <Star className="h-5 w-5 mr-2" />
                                    Calificar Ahora
                                </Button>
                            </motion.div>

                            {/* Footer Note */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-xs text-white/60 text-center italic"
                            >
                                Solo tomará 2 minutos. Tu opinión es muy valiosa.
                            </motion.p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}
