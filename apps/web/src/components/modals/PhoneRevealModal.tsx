import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { matchService } from '@/lib/services/match.service';
import { useToast } from '@/lib/hooks/use-toast';

interface PhoneRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  oppositePartyName: string;
  onPhoneRevealed?: (phone: string) => void;
}

export function PhoneRevealModal({
  isOpen,
  onClose,
  matchId,
  oppositePartyName,
  onPhoneRevealed,
}: PhoneRevealModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'initial' | 'loading' | 'masked' | 'revealed' | 'error'>('initial');
  const [maskedNumber, setMaskedNumber] = useState('');
  const [revealToken, setRevealToken] = useState('');
  const [revealedPhone, setRevealedPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Get masked number on mount
  useEffect(() => {
    if (isOpen && step === 'initial') {
      getMaskedNumber();
    }
  }, [isOpen]);

  // Countdown timer for token expiration
  useEffect(() => {
    if (!expiresAt || step !== 'masked') return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setStep('error');
        setError('Token expired');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, step]);

  const getMaskedNumber = async () => {
    try {
      setStep('loading');
      const result = await matchService.getMaskedPhoneNumber(matchId);
      setMaskedNumber(result.maskedNumber);

      if (result.revealed) {
        setStep('revealed');
      } else {
        setStep('masked');
      }
    } catch (err) {
      setError('Failed to load phone number');
      setStep('error');
    }
  };

  const handleRequestReveal = async () => {
    try {
      setStep('loading');
      const result = await matchService.generatePhoneRevealToken(matchId);
      setRevealToken(result.token);
      setExpiresAt(new Date(result.expiresAt));
      setTimeLeft('24h 0m');
      setStep('masked');
      toast({
        title: 'Token Generated',
        description: 'Token is valid for 24 hours',
      });
    } catch (err) {
      setError('Failed to generate token');
      setStep('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate reveal token',
      });
    }
  };

  const handleRevealPhone = async () => {
    if (!revealToken) {
      setError('No token available');
      return;
    }

    try {
      setStep('loading');
      const result = await matchService.revealPhone(matchId, revealToken);
      setRevealedPhone(result.phoneNumber);
      setStep('revealed');
      onPhoneRevealed?.(result.phoneNumber);
      toast({
        title: 'Phone Revealed',
        description: 'Phone number copied to clipboard',
      });
    } catch (err) {
      setError('Failed to reveal phone number. Token may be expired or already used.');
      setStep('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not reveal phone number',
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(revealedPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied',
        description: 'Phone number copied to clipboard',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy',
      });
    }
  };

  const handleClose = () => {
    setStep('initial');
    setMaskedNumber('');
    setRevealToken('');
    setRevealedPhone('');
    setCopied(false);
    setError('');
    setExpiresAt(null);
    setTimeLeft('');
    onClose();
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
                  {/* Header */}
                  <motion.div
                    key={`header-${step}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2">
                      {step === 'revealed' ? 'WhatsApp Revelado' : 'Revelar WhatsApp'}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base">
                      {step === 'revealed'
                        ? `Número de ${oppositePartyName}`
                        : `Solicita el WhatsApp de ${oppositePartyName}`}
                    </p>
                  </motion.div>

                  {/* Content by Step */}
                  <AnimatePresence mode="wait">
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

                    {step === 'masked' && (
                      <motion.div
                        key="masked"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Masked Number Display */}
                        <div className="bg-white/5 border border-primary/20 rounded-xl p-5 text-center">
                          <p className="text-xs text-white/60 mb-2">Número mascarado</p>
                          <p className="text-2xl font-mono font-bold text-primary">
                            {maskedNumber}
                          </p>
                          <p className="text-[10px] text-white/50 mt-2">
                            Por tu seguridad, el número está parcialmente oculto
                          </p>
                        </div>

                        {/* Token Info */}
                        {revealToken && (
                          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                            <div className="flex gap-2">
                              <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-white/80">
                                <p className="font-semibold">Token válido por {timeLeft}</p>
                                <p className="mt-1">Cada token se puede usar una sola vez</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="space-y-3">
                          <Button
                            onClick={handleRevealPhone}
                            disabled={!revealToken}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl"
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            Mostrar Número
                          </Button>

                          {!revealToken && (
                            <Button
                              onClick={handleRequestReveal}
                              variant="outline"
                              className="w-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            >
                              Generar Token
                            </Button>
                          )}

                          <Button
                            onClick={handleClose}
                            variant="ghost"
                            className="w-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 'revealed' && (
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Revealed Number */}
                        <div className="bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-xl p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-white/60 mb-2">WhatsApp</p>
                              <p className="text-2xl font-mono font-bold text-white">
                                {revealedPhone}
                              </p>
                            </div>
                            <button
                              onClick={copyToClipboard}
                              className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                              {copied ? (
                                <Check className="h-5 w-5 text-success" />
                              ) : (
                                <Copy className="h-5 w-5 text-white/80" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-xs text-white/80">
                            ✓ Este número fue revelado de forma segura con token único
                          </p>
                          <p className="text-xs text-white/60 mt-2">
                            Todos los accesos están auditados
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Button
                            asChild
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          >
                            <a
                              href={`https://wa.me/${revealedPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Abrir en WhatsApp
                            </a>
                          </Button>

                          <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            className="w-full text-white/70 hover:text-white hover:bg-white/10"
                          >
                            {copied ? 'Copiado!' : 'Copiar Número'}
                          </Button>

                          <Button
                            onClick={handleClose}
                            variant="ghost"
                            className="w-full text-white/70 hover:text-white hover:bg-white/10"
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
                            onClick={getMaskedNumber}
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

                  {/* Footer Note */}
                  <p className="text-xs text-center text-muted-foreground/70 mt-6">
                    La privacidad y seguridad de tus datos es nuestra prioridad
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
