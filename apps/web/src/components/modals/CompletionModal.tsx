import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { matchService } from '@/lib/services/match.service';
import { useToast } from '@/lib/hooks/use-toast';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  mode: 'request' | 'confirm'; // request = one party requests, confirm = other party confirms
  oppositePartyName: string;
  onCompleted?: () => void;
}

export function CompletionModal({
  isOpen,
  onClose,
  matchId,
  mode,
  oppositePartyName,
  onCompleted,
}: CompletionModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setStep('loading');

      if (mode === 'request') {
        await matchService.requestCompletion(matchId, comment);
      } else {
        await matchService.confirmCompletion(matchId, comment);
      }

      setStep('success');
      onCompleted?.();
      toast({
        title: 'Success',
        description:
          mode === 'request'
            ? 'Completion request sent'
            : 'Completion confirmed! You can now leave reviews.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process completion',
      });
    }
  };

  const handleClose = () => {
    setStep('initial');
    setComment('');
    setError('');
    onClose();
  };

  const title =
    mode === 'request'
      ? '¿Marcar servicio como completado?'
      : `¿Confirmar que ${oppositePartyName} completó el servicio?`;

  const description =
    mode === 'request'
      ? 'Notificaremos a la otra parte. Ambas partes deben confirmar para habilitar calificaciones.'
      : 'Una vez confirmado, ambas partes podrán dejar calificaciones.';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-modal-content p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-[95%] sm:max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-glow border-primary/40 relative shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>

                <CardContent className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {step === 'initial' && (
                      <motion.div
                        key="initial"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Header */}
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2">
                            {title}
                          </h2>
                          <p className="text-white/80 text-sm sm:text-base">
                            {description}
                          </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-white/5 border border-primary/20 rounded-xl p-4">
                          <p className="text-xs text-white/60 mb-2">
                            {mode === 'request'
                              ? 'Lo que sucede después:'
                              : 'Beneficios de confirmar:'}
                          </p>
                          <ul className="space-y-2 text-sm text-white/80">
                            {mode === 'request' ? (
                              <>
                                <li className="flex gap-2">
                                  <span className="text-primary">✓</span>
                                  <span>{oppositePartyName} recibirá notificación</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="text-primary">✓</span>
                                  <span>Ambas partes deben confirmar</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="text-primary">✓</span>
                                  <span>Se habilitarán las calificaciones</span>
                                </li>
                              </>
                            ) : (
                              <>
                                <li className="flex gap-2">
                                  <span className="text-success">✓</span>
                                  <span>Ambas partes podrán dejar calificaciones</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="text-success">✓</span>
                                  <span>Se creará un historial verificado</span>
                                </li>
                                <li className="flex gap-2">
                                  <span className="text-success">✓</span>
                                  <span>Tu reputación mejorará</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        {/* Comment Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">
                            Comentario (opcional)
                          </label>
                          <Textarea
                            placeholder="Agrega un breve comentario..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={200}
                            className="glass border-white/20 focus:border-primary/50 min-h-24 resize-none text-sm"
                          />
                          <p className="text-xs text-white/60 text-right">
                            {comment.length}/200
                          </p>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                          <Button
                            onClick={handleSubmit}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl"
                          >
                            {mode === 'request' ? 'Marcar como Completado' : 'Confirmar Completación'}
                          </Button>

                          <Button
                            onClick={handleClose}
                            variant="outline"
                            className="w-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 'loading' && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 py-8"
                      >
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-white/70 text-sm">Procesando...</p>
                      </motion.div>
                    )}

                    {step === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center space-y-6 py-8"
                      >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success/60 shadow-lg">
                          <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">¡Listo!</h3>
                          <p className="text-white/80 text-sm">
                            {mode === 'request'
                              ? `Hemos notificado a ${oppositePartyName}`
                              : 'Completación confirmada. Ahora puedes dejar calificaciones.'}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={handleClose}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            Cerrar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 'error' && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="bg-destructive/20 border border-destructive/50 rounded-xl p-5">
                          <div className="flex gap-3">
                            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-destructive mb-1">Error</p>
                              <p className="text-white/80 text-sm">{error}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={() => setStep('initial')}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            Intentar de Nuevo
                          </Button>
                          <Button
                            onClick={handleClose}
                            variant="outline"
                            className="w-full text-white/70 hover:text-white hover:bg-white/10"
                          >
                            Cerrar
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
