import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useServiceRequest } from '@/hooks/useServiceRequest';
import type { Service } from '@/lib/services/services.service';

interface ServiceRequestModalProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Service Request Modal
 * 
 * Allows clients to request a service from a professional.
 * After request is accepted, contact info is revealed.
 */
export function ServiceRequestModal({
    service,
    isOpen,
    onClose,
}: ServiceRequestModalProps) {
    const [message, setMessage] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');

    const { createRequest, isCreating } = useServiceRequest();

    if (!service) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        createRequest(
            {
                service_id: service.id,
                message: message.trim(),
                budget: budget ? parseFloat(budget) : undefined,
                deadline: deadline || undefined,
            },
            {
                onSuccess: () => {
                    setMessage('');
                    setBudget('');
                    setDeadline('');
                    onClose();
                },
            }
        );
    };

    const isValid = message.trim().length >= 20;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass border-white/10 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Solicitar Servicio</DialogTitle>
                    <DialogDescription>
                        Envía una solicitud a {service.professional.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Service Info */}
                    <div className="p-4 glass-medium rounded-lg">
                        <div className="flex items-start gap-3">
                            {service.main_image && (
                                <img
                                    src={service.main_image}
                                    alt={service.title}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{service.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    ${service.price.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">
                            Mensaje para el profesional *
                        </Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe tu proyecto, necesidades y expectativas..."
                            className="glass border-white/20 min-h-32"
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            {message.length}/500 caracteres (mínimo 20)
                        </p>
                    </div>

                    {/* Budget (optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="budget">Presupuesto Estimado (opcional)</Label>
                        <Input
                            id="budget"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="5000"
                            className="glass border-white/20"
                            min="0"
                        />
                    </div>

                    {/* Deadline (optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="deadline">Fecha Límite (opcional)</Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="glass border-white/20"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Info Alert */}
                    <Alert className="border-primary/20 bg-primary/5">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-sm">
                            <strong>Información de contacto:</strong> Podrás ver el WhatsApp y datos
                            completos del profesional cuando acepte tu solicitud.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isCreating}
                            className="glass border-white/20"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating || !isValid}
                            className="liquid-gradient hover:opacity-90"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar Solicitud
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
