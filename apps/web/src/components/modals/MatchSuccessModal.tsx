import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Phone, Copy, MessageCircle, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import type { MatchCelebration } from '@/types/client-circuit';

interface MatchSuccessModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * Match celebration data
     */
    data: MatchCelebration | null;

    /**
     * Callback when modal is closed
     */
    onClose: () => void;

    /**
     * Optional callback when WhatsApp is opened
     */
    onWhatsAppClick?: () => void;
}

/**
 * Match Success Modal
 * 
 * Celebration modal shown when a client accepts a proposal.
 * Features:
 * - CSS-only confetti animation
 * - Professional info display
 * - WhatsApp number reveal
 * - Direct WhatsApp link
 * - Copy number functionality
 * 
 * @component
 */
export function MatchSuccessModal({
    isOpen,
    data,
    onClose,
    onWhatsAppClick,
}: MatchSuccessModalProps) {
    if (!data) return null;

    const handleCopyNumber = () => {
        navigator.clipboard.writeText(data.whatsappNumber);
        toast.success('Número copiado al portapapeles');
    };

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(
            `Hola ${data.professionalName}, acepté tu propuesta para "${data.projectTitle}" en Fixia. ¡Hablemos!`
        );
        window.open(`https://wa.me/${data.whatsappNumber}?text=${message}`, '_blank');
        onWhatsAppClick?.();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="pointer-events-auto w-full max-w-lg"
                        >
                            <Card className="glass-glow border-primary/30 shadow-2xl overflow-hidden relative">
                                {/* Confetti Animation (CSS-only) */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ y: -20, x: Math.random() * 100 + '%', opacity: 1 }}
                                            animate={{
                                                y: '120%',
                                                rotate: Math.random() * 360,
                                                opacity: 0,
                                            }}
                                            transition={{
                                                duration: Math.random() * 2 + 2,
                                                delay: Math.random() * 0.5,
                                                ease: 'easeOut',
                                            }}
                                            className={`absolute w-2 h-2 rounded-full ${i % 4 === 0
                                                    ? 'bg-primary'
                                                    : i % 4 === 1
                                                        ? 'bg-success'
                                                        : i % 4 === 2
                                                            ? 'bg-warning'
                                                            : 'bg-purple-500'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>

                                <CardContent className="p-8 space-y-6">
                                    {/* Success Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                        className="flex justify-center"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-success/30 rounded-full blur-xl animate-pulse" />
                                            <CheckCircle className="h-20 w-20 text-success relative z-10" />
                                        </div>
                                    </motion.div>

                                    {/* Title */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center space-y-2"
                                    >
                                        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                            ¡Hay Conexión!
                                        </h2>
                                        <p className="text-white/70 text-lg">
                                            El profesional ha sido notificado
                                        </p>
                                    </motion.div>

                                    {/* Professional Info */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/5 border border-primary/20 rounded-xl p-4"
                                    >
                                        <p className="text-xs text-white/60 mb-3 uppercase tracking-wider font-semibold">
                                            Profesional Asignado
                                        </p>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar className="h-12 w-12 border-2 border-primary/40">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.professionalName}`} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                    {data.professionalName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white text-lg">
                                                    {data.professionalName}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    ✓ Verificado
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Project Details */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-white/60 mb-1">Precio Acordado</p>
                                                <p className="text-lg font-bold text-primary">
                                                    ${data.agreedPrice.toLocaleString('es-AR')}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-white/60 mb-1">Plazo</p>
                                                <p className="text-lg font-bold text-white">
                                                    {data.deliveryTimeDays} días
                                                </p>
                                            </div>
                                        </div>

                                        {/* WhatsApp Reveal */}
                                        <div className="bg-gradient-to-br from-success/20 to-success/10 border border-success/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Phone className="h-5 w-5 text-success" />
                                                <span className="font-semibold text-white text-sm">
                                                    Número de WhatsApp Revelado
                                                </span>
                                            </div>

                                            <div className="bg-black/30 rounded-lg p-3 mb-3">
                                                <p className="text-2xl font-mono tracking-wide text-success text-center">
                                                    {data.whatsappNumber}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={handleCopyNumber}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-success/30 text-success hover:bg-success/10"
                                                >
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copiar
                                                </Button>
                                                <Button
                                                    onClick={handleWhatsAppClick}
                                                    size="sm"
                                                    className="bg-success hover:bg-success/90 text-white"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    WhatsApp
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Info Message */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                                    >
                                        <p className="text-sm text-white/80 leading-relaxed">
                                            <span className="font-semibold text-white">Próximos pasos:</span>
                                            <br />
                                            • Contacta al profesional por WhatsApp
                                            <br />
                                            • Coordina los detalles del trabajo
                                            <br />
                                            • Al finalizar, califica tu experiencia
                                        </p>
                                    </motion.div>

                                    {/* Action Button */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <Button
                                            onClick={onClose}
                                            className="w-full bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold h-12"
                                        >
                                            Entendido
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
