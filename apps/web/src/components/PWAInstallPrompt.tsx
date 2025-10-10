import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Zap, Bell, Wifi } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = wasDismissed ? parseInt(wasDismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if installable, not installed, not dismissed, or dismissed more than 7 days ago
    if (isInstallable && !isInstalled && (!wasDismissed || daysSinceDismissed > 7)) {
      // Wait a bit before showing to avoid being intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const installed = await promptInstall();

    if (installed) {
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <Card className="glass border-white/10 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">F</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Instala Fixia</h3>
                    <p className="text-sm text-muted-foreground">
                      Acceso rápido y offline
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <span>Acceso desde tu pantalla de inicio</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span>Carga más rápida y mejor rendimiento</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-primary" />
                  </div>
                  <span>Funciona sin conexión</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <span>Notificaciones push en tiempo real</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 liquid-gradient hover:opacity-90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Instalar App
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="glass border-white/20"
                >
                  Ahora no
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
