import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  showCloseButton = true,
}: BaseModalProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md z-modal-backdrop"
            aria-hidden="true"
          />

          {/* Modal Container - Centered with responsive positioning */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed z-modal-content flex flex-col left-1/2 -translate-x-1/2 w-[95vw] ${maxWidth} h-auto rounded-2xl overflow-hidden pointer-events-auto`}
            style={{
              top: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: 'calc(100vh - 40px)',
              maxWidth: '95vw'
            }}
          >
            {/* Modal Panel - Glass morphism */}
            <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-950/90 backdrop-blur-2xl border border-white/12 shadow-2xl">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                className="sticky top-0 z-10 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-900/40 border-b border-white/15 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate leading-tight">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg transition-all hover:bg-white/20 hover:backdrop-blur-md active:bg-white/30 border border-white/10 hover:border-white/20 flex-shrink-0"
                      aria-label="Cerrar modal"
                    >
                      <X className="h-4 w-4 text-slate-300 hover:text-white transition-colors" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
