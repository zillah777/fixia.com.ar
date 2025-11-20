import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, DollarSign, Clock, Tag } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/lib/services/services.service';

interface ServiceEditModalProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (serviceId: string, data: Partial<Service>) => void;
    isUpdating: boolean;
}

/**
 * Service Edit Modal
 * 
 * Quick edit modal for service basic info
 */
export function ServiceEditModal({
    service,
    isOpen,
    onClose,
    onSave,
    isUpdating,
}: ServiceEditModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        delivery_time_days: 0,
    });

    // Initialize form data when service changes
    useEffect(() => {
        if (service) {
            setFormData({
                title: service.title,
                description: service.description,
                price: service.price,
                delivery_time_days: service.delivery_time_days || 0,
            });
        }
    }, [service]);

    if (!service) return null;

    const handleSave = () => {
        onSave(service.id, formData);
        onClose();
    };

    const isValid = formData.title.trim().length >= 10 &&
        formData.description.trim().length >= 50 &&
        formData.price > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass border-white/10 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Servicio</DialogTitle>
                    <DialogDescription>
                        Actualiza la información de tu servicio
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Servicio *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Desarrollo Web Profesional"
                            className="glass border-white/20"
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.title.length}/100 caracteres (mínimo 10)
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe tu servicio en detalle..."
                            className="glass border-white/20 min-h-32"
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.description.length}/2000 caracteres (mínimo 50)
                        </p>
                    </div>

                    {/* Price and Delivery Time */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio (ARS) *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="5000"
                                    className="glass border-white/20 pl-10"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delivery_time">Tiempo de Entrega (días)</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="delivery_time"
                                    type="number"
                                    value={formData.delivery_time_days || ''}
                                    onChange={(e) => setFormData({ ...formData, delivery_time_days: parseInt(e.target.value) || 0 })}
                                    placeholder="7"
                                    className="glass border-white/20 pl-10"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-primary">Nota:</strong> Para editar imágenes, galería o tags,
                            usa el formulario completo de edición desde la página del servicio.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isUpdating}
                        className="glass border-white/20"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isUpdating || !isValid}
                        className="liquid-gradient hover:opacity-90"
                    >
                        {isUpdating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
