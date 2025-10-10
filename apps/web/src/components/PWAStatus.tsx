import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function PWAStatus() {
  const { isOnline, updateAvailable, updateServiceWorker } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    setShowOfflineBanner(!isOnline);

    if (!isOnline) {
      toast.error('Sin conexión a Internet', {
        description: 'Trabajando en modo offline',
        duration: 3000,
      });
    } else {
      toast.success('Conectado', {
        description: 'Conexión restaurada',
        duration: 2000,
      });
    }
  }, [isOnline]);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateBanner(true);
      toast.info('Actualización disponible', {
        description: 'Haz clic para actualizar la aplicación',
        duration: 5000,
      });
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    updateServiceWorker();
    setShowUpdateBanner(false);
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-warning/90 backdrop-blur-sm border-b border-warning"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">Sin conexión - Modo Offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm border-b border-primary"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="font-medium">Nueva versión disponible</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                className="h-7 text-xs"
              >
                Actualizar ahora
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online/Offline Indicator (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 bg-warning/90 backdrop-blur-sm rounded-full px-3 py-2 text-sm font-medium shadow-lg"
            >
              <WifiOff className="h-4 w-4" />
              <span>Offline</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
