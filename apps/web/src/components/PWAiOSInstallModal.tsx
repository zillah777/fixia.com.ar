import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, Smartphone, Apple } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * iOS PWA Installation Modal
 * Detects iOS Safari and shows installation instructions
 * since iOS doesn't support beforeinstallprompt API
 */
export function PWAiOSInstallModal() {
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    // Check if already installed (standalone mode)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    // Show modal only on iOS, not installed, and not dismissed recently
    if (isIOSDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('ios-pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show after 3 seconds if not dismissed or dismissed more than 14 days ago
      if (!dismissed || daysSinceDismissed > 14) {
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem('ios-pwa-install-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setShowModal(false);
    // Don't save to localStorage so it shows again on next visit
  };

  // Don't render if not iOS or already installed
  if (!isIOS || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleRemindLater}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-lg z-[9999]"
          >
            <Card className="glass border-white/10 shadow-2xl">
              <CardHeader className="relative pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="absolute right-2 top-2 h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="h-14 w-14 liquid-gradient rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">F</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Instala Fixia en iOS</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Acceso rápido desde tu pantalla de inicio
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Benefits */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">Acceso instantáneo como una app nativa</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Apple className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">Experiencia optimizada para iOS</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">Pasos para instalar:</h3>

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-white/5">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1.5">
                        Toca el botón de compartir
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/20 rounded-md border border-blue-500/30">
                          <Share className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-xs text-blue-300 font-medium">Compartir</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          (en la barra inferior de Safari)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-white/5">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1.5">
                        Selecciona "Añadir a la pantalla de inicio"
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/20 rounded-md border border-primary/30">
                          <Plus className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs text-primary font-medium">Añadir</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          (desplázate hacia abajo si es necesario)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-white/5">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">3</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1.5">
                        Confirma la instalación
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Toca "Añadir" en la esquina superior derecha
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="text-amber-500 text-lg mt-0.5">💡</div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    <strong className="font-semibold">Nota:</strong> Estos pasos solo funcionan en Safari.
                    Si estás usando otro navegador, abre esta página en Safari para instalar Fixia.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleRemindLater}
                    className="flex-1 glass border-white/20"
                  >
                    Ahora no
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    className="flex-1 liquid-gradient hover:opacity-90"
                  >
                    Entendido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
