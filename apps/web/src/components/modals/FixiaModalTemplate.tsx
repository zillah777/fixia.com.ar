/**
 * FixiaModalTemplate - Unified Modal Component Template
 *
 * This is the canonical modal design pattern for Fixia.app
 * All modals should use this template to ensure visual consistency
 *
 * Key Features:
 * - Glass morphism design with premium gradients
 * - Responsive (full-screen mobile, compact desktop)
 * - Smooth animations with Framer Motion
 * - Accessible with proper ARIA labels
 *
 * Usage:
 * ```tsx
 * <FixiaModalTemplate
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Modal Title"
 *   children={<YourContent />}
 * />
 * ```
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FixiaModalTemplateProps {
  /** Controls modal open/close state */
  open: boolean;
  /** Callback when modal should change state */
  onOpenChange: (open: boolean) => void;
  /** Modal title/header */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom CSS classes for content */
  contentClassName?: string;
  /** Allow clicking backdrop to close */
  closeOnBackdropClick?: boolean;
}

export function FixiaModalTemplate({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  showCloseButton = true,
  contentClassName = '',
  closeOnBackdropClick = true,
}: FixiaModalTemplateProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* ============================================
              BACKDROP - Glass morphism overlay
              ============================================ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnBackdropClick && onOpenChange(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-md z-modal-backdrop"
            aria-hidden="true"
          />

          {/* ============================================
              MODAL CONTAINER - Centered on desktop,
              full-screen on mobile
              ============================================ */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed z-modal-content flex flex-col inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-w-lg md:h-auto md:max-h-[92vh] md:overflow-hidden"
          >
            {/* ========================================
                MODAL PANEL - Fixia Glass Design
                ======================================== */}
            <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-950/90 backdrop-blur-2xl border border-white/12 md:border-white/20 shadow-2xl">
              {/* ====================================
                  HEADER - Sticky with glass effect
                  ==================================== */}
              {(title || showCloseButton) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                  className="sticky top-0 z-10 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-900/40 border-b border-white/15 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      {title && (
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate leading-tight">
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={() => onOpenChange(false)}
                        className="p-1.5 rounded-lg transition-all hover:bg-white/20 hover:backdrop-blur-md active:bg-white/30 border border-white/10 hover:border-white/20"
                        aria-label="Cerrar modal"
                      >
                        <X className="h-4 w-4 text-slate-300 hover:text-white transition-colors" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ====================================
                  CONTENT - Scrollable area
                  ==================================== */}
              <div className={`flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 space-y-2.5 sm:space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5 ${contentClassName}`}>
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
