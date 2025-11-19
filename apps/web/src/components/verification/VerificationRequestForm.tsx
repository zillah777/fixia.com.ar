import React, { useState, useEffect, memo } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  verificationService,
  VerificationType,
  CreateVerificationRequestDto,
  VerificationGuide
} from '../../lib/services/verification.service';
import { extractErrorMessage } from '../../utils/errorHandler';

interface VerificationRequestFormProps {
  verificationType?: VerificationType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerificationRequestForm = memo<VerificationRequestFormProps>(({
  verificationType: initialType,
  onClose,
  onSuccess
}) => {
  const [selectedType, setSelectedType] = useState<VerificationType | null>(initialType || null);
  const [guide, setGuide] = useState<VerificationGuide | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);

  useEffect(() => {
    if (selectedType) {
      loadVerificationGuide();
    }
  }, [selectedType]);

  const loadVerificationGuide = async () => {
    if (!selectedType) return;

    setIsLoadingGuide(true);
    try {
      const guideData = await verificationService.getVerificationGuide(selectedType);
      setGuide(guideData);
    } catch (error) {
      console.error('Error loading verification guide:', error);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setError(`${file.name}: Solo se permiten imágenes y archivos PDF`);
        return false;
      }

      if (file.size > maxSize) {
        setError(`${file.name}: El archivo es demasiado grande (máximo 10MB)`);
        return false;
      }

      return true;
    });

    if (files.length + validFiles.length > 10) {
      setError('Máximo 10 archivos permitidos');
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      setError('Por favor selecciona un tipo de verificación');
      return;
    }

    if (files.length === 0 && !verificationService.isInstantVerification(selectedType)) {
      setError('Por favor adjunta al menos un documento');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData: CreateVerificationRequestDto = {
        verificationType: selectedType,
        notes: notes.trim() || undefined,
        additionalInfo: Object.keys(additionalInfo).length > 0 ? additionalInfo : undefined
      };

      await verificationService.createVerificationRequest(requestData, files);
      onSuccess();
    } catch (error: unknown) {
      setError(extractErrorMessage(error, 'Error al crear la solicitud de verificación'));
    } finally {
      setIsLoading(false);
    }
  };

  const verificationTypes = [
    {
      value: VerificationType.IDENTITY,
      label: 'Verificación de Identidad',
      description: 'Confirma tu identidad con documento oficial'
    },
    {
      value: VerificationType.SKILLS,
      label: 'Verificación de Habilidades',
      description: 'Certifica tus competencias técnicas'
    },
    {
      value: VerificationType.BUSINESS,
      label: 'Verificación de Negocio',
      description: 'Valida tu actividad comercial'
    },
    {
      value: VerificationType.BACKGROUND_CHECK,
      label: 'Verificación de Antecedentes',
      description: 'Demuestra tu historial limpio'
    },
    {
      value: VerificationType.ADDRESS,
      label: 'Verificación de Dirección',
      description: 'Confirma tu dirección física'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[95%] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="glass-glow border-white/30 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Nueva Solicitud de Verificación</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Verification Type Selection */}
                <div className="space-y-2">
                  <Label>Tipo de Verificación</Label>
                  <Select
                    value={selectedType || ''}
                    onValueChange={(value) => setSelectedType(value as VerificationType)}
                  >
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Selecciona el tipo de verificación" />
                    </SelectTrigger>
                    <SelectContent>
                      {verificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Verification Guide */}
                {selectedType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {isLoadingGuide ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-6 w-6  text-primary" />
                      </div>
                    ) : guide ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 p-5 sm:p-6 rounded-xl"
                      >
                        <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">{guide.title}</h3>
                        <p className="text-sm text-white/80 mb-4">{guide.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-primary">▸</span> Requisitos
                            </h4>
                            <ul className="space-y-1 text-white/70">
                              {guide.requirements.map((req, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-primary/60">•</span> {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {guide.documents.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <span className="text-primary">▸</span> Documentos necesarios
                              </h4>
                              <ul className="space-y-1 text-white/70">
                                {guide.documents.map((doc, index) => (
                                  <li key={index} className="flex gap-2">
                                    <span className="text-primary/60">•</span> {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-primary/20 pt-4 mb-4">
                          <p className="text-sm text-white/70">
                            <span className="font-semibold text-white">⏱ Tiempo de procesamiento:</span> {guide.processingTime}
                          </p>
                        </div>

                        {guide.tips.length > 0 && (
                          <div className="border-t border-primary/20 pt-4">
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-primary">💡</span> Consejos
                            </h4>
                            <ul className="space-y-1 text-white/70 text-sm">
                              {guide.tips.map((tip, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-primary/60">→</span> {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ) : null}
                  </motion.div>
                )}

                {/* File Upload */}
                {selectedType && !verificationService.isInstantVerification(selectedType) && (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Documentos requeridos</Label>

                    <div className="border-2 border-dashed border-primary/40 hover:border-primary/60 transition-colors rounded-xl p-6 sm:p-8 text-center bg-primary/5">
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex"
                        >
                          <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
                        </motion.div>
                        <p className="text-sm text-white font-medium mb-1">
                          Haz clic para seleccionar archivos
                        </p>
                        <p className="text-xs text-white/70">
                          Imágenes y PDFs, máximo 10MB cada uno
                        </p>
                      </label>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <Label>Archivos seleccionados:</Label>
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notas adicionales (opcional)</Label>
                  <Textarea
                    placeholder="Agrega cualquier información adicional que pueda ayudar en la revisión..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="glass border-white/20"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !selectedType}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

VerificationRequestForm.displayName = 'VerificationRequestForm';