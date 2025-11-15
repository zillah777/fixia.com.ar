import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface InstallFixiaButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

/**
 * Modern Install Button Component
 * Automatically handles Android (beforeinstallprompt) and shows appropriate UI
 * For iOS, this button won't show (iOS modal handles that separately)
 */
export function InstallFixiaButton({
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  fullWidth = false,
}: InstallFixiaButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);

    const success = await promptInstall();

    if (success) {
      setJustInstalled(true);
      setTimeout(() => {
        setJustInstalled(false);
      }, 3000);
    }

    setIsInstalling(false);
  };

  // Don't show button if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(fullWidth && 'w-full')}
    >
      <Button
        onClick={handleInstall}
        disabled={isInstalling || justInstalled}
        variant={variant}
        size={size}
        className={cn(
          'relative overflow-hidden',
          variant === 'default' && 'liquid-gradient hover:opacity-90',
          fullWidth && 'w-full',
          className
        )}
      >
        {/* Loading/Success Animation */}
        <AnimatePresence mode="wait">
          {isInstalling ? (
            <motion.div
              key="installing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Instalando...</span>
            </motion.div>
          ) : justInstalled ? (
            <motion.div
              key="installed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>¡Instalado!</span>
            </motion.div>
          ) : (
            <motion.div
              key="install"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              {showIcon && <Download className="h-4 w-4" />}
              <span>Instalar Fixia</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shimmer Effect */}
        {!isInstalling && !justInstalled && variant === 'default' && (
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ translateX: ['100%', '100%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'linear',
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}

/**
 * Compact floating install button for corner placement
 */
export function InstallFixiaFab() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();

    if (success) {
      setIsVisible(false);
    }

    setIsInstalling(false);
  };

  // Don't show if not installable or already installed
  if (!isInstallable || isInstalled || !isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 100 }}
      transition={{ type: 'spring', duration: 0.6, delay: 1 }}
      className="fixed bottom-20 right-4 z-40"
    >
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        size="lg"
        className="h-14 w-14 rounded-full liquid-gradient shadow-2xl hover:opacity-90 hover:scale-110 transition-transform"
      >
        {isInstalling ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          <Smartphone className="h-5 w-5" />
        )}
      </Button>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap pointer-events-none"
      >
        <p className="text-xs font-medium text-white">Instalar Fixia</p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-l-8 border-l-slate-900/95 border-y-4 border-y-transparent" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Inline install banner for placement within content
 */
export function InstallFixiaBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();

    if (success) {
      setIsDismissed(true);
    }

    setIsInstalling(false);
  };

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 rounded-xl p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-xl liquid-gradient flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Instala Fixia</h3>
            <p className="text-sm text-muted-foreground">
              Acceso rápido, notificaciones y modo offline
            </p>
          </div>
        </div>

        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className="liquid-gradient hover:opacity-90 flex-shrink-0"
        >
          {isInstalling ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
