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

          {/* Modal Container - Bottom sheet on mobile, top-positioned scrollable on desktop */}
          <motion.div
            initial={{ y: 500, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 500, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed z-modal-content flex flex-col w-screen sm:w-[95vw] ${maxWidth} h-auto sm:max-h-[calc(100vh-40px)] bottom-0 sm:bottom-auto sm:top-5 sm:left-1/2 sm:-translate-x-1/2 rounded-t-3xl sm:rounded-2xl overflow-hidden sm:overflow-y-auto pointer-events-auto`}
            style={{
              borderRadius: 'var(--radius, 1rem)'
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
