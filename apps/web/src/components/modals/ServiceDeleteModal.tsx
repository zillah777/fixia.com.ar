import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Service } from '@/lib/services/services.service';

interface ServiceDeleteModalProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (serviceId: string) => void;
    isDeleting: boolean;
}

/**
 * Service Delete Confirmation Modal
 * 
 * Shows warning and confirmation before deleting a service
 */
export function ServiceDeleteModal({
    service,
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: ServiceDeleteModalProps) {
    if (!service) return null;

    const handleConfirm = () => {
        onConfirm(service.id);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass border-white/10 sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 bg-destructive/20 rounded-full flex items-center justify-center">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle>Eliminar Servicio</DialogTitle>
                            <DialogDescription>
                                Esta acción no se puede deshacer
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Service Info */}
                    <Card className="glass-medium border-white/10">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                {service.main_image && (
                                    <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={service.main_image}
                                            alt={service.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{service.title}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {service.description}
                                    </p>
                                    <p className="text-sm text-primary font-medium mt-1">
                                        ${service.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warning */}
                    <Alert className="border-destructive/20 bg-destructive/5">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                            <strong>¿Estás seguro?</strong> Esta acción eliminará permanentemente este servicio.
                            {service.active && ' El servicio está activo y será removido de las búsquedas inmediatamente.'}
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="glass border-white/20"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Servicio
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
