import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { VerificationType, verificationService } from '../../lib/services/verification.service';
import { X, Upload, FileText } from 'lucide-react';

interface VerificationRequestFormProps {
    type: Exclude<VerificationType, VerificationType.PHONE | VerificationType.EMAIL>;
    onClose: () => void;
    onSuccess: () => void;
}

export function VerificationRequestForm({ type, onClose, onSuccess }: VerificationRequestFormProps) {
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const typeLabel = verificationService.getVerificationTypeLabel(type);
    const processingTime = verificationService.getEstimatedProcessingTime(type);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (files.length === 0) {
            setError('Por favor adjunta al menos un documento');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await verificationService.createVerificationRequest(
                {
                    verificationType: type,
                    notes: notes.trim() || undefined
                },
                files
            );

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al enviar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const getRequirements = () => {
        switch (type) {
            case VerificationType.IDENTITY:
                return [
                    'Foto clara de tu DNI (frente y dorso)',
                    'Selfie sosteniendo tu DNI',
                    'Los documentos deben ser legibles y sin editar'
                ];
            case VerificationType.SKILLS:
                return [
                    'Certificados o diplomas de tus habilidades',
                    'Portafolio de trabajos realizados',
                    'Referencias profesionales (opcional)'
                ];
            case VerificationType.BUSINESS:
                return [
                    'Constancia de inscripción (AFIP, monotributo, etc.)',
                    'Comprobante de domicilio fiscal',
                    'Documentación legal del negocio'
                ];
            default:
                return ['Documentación requerida para la verificación'];
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Solicitud de Verificación de {typeLabel}</CardTitle>
                        <CardDescription>
                            Tiempo estimado de procesamiento: {processingTime}
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requirements */}
                    <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Requisitos:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {getRequirements().map((req, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="files">Documentos *</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                            <Input
                                id="files"
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={loading}
                            />
                            <label htmlFor="files" className="cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    {files.length > 0
                                        ? `${files.length} archivo(s) seleccionado(s)`
                                        : 'Haz clic para seleccionar archivos'
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Imágenes o PDF (máx. 10MB por archivo)
                                </p>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-2 mt-3">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1 truncate">{file.name}</span>
                                        <span className="text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Agrega cualquier información adicional que pueda ayudar en la verificación..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={loading}
                            rows={4}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || files.length === 0}
                            className="flex-1"
                        >
                            {loading ? 'Enviando...' : 'Enviar solicitud'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default VerificationRequestForm;
