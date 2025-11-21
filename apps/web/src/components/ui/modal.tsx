import * as React from "react";
import * as ReactDOM from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./utils";

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-full h-full sm:h-auto sm:max-w-sm sm:rounded-xl",
  md: "w-full h-full sm:h-auto sm:max-w-md sm:rounded-xl",
  lg: "w-full h-full sm:h-auto sm:max-w-lg sm:rounded-xl",
  xl: "w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-xl",
  full: "w-full h-full sm:h-auto sm:max-w-6xl sm:rounded-xl"
};

export function Modal({
  children,
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className
}: ModalProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Focus trap
  React.useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
              className={cn(
                "relative bg-background shadow-2xl",
                "glass-strong border-0 sm:border border-white/10",
                "max-h-screen sm:max-h-[90vh] overflow-hidden flex flex-col",
                "rounded-t-2xl sm:rounded-xl",
                sizeClasses[size],
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              aria-describedby={description ? "modal-description" : undefined}
            >
              {/* Mobile drag indicator */}
              <div className="sm:hidden flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-white/10">
                  <div className="flex-1">
                    {title && (
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-11 min-w-11 sm:min-h-0 sm:min-w-0"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6 border-t border-white/10",
        className
      )}
      {...props}
    />
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left mb-6",
        className
      )}
      {...props}
    />
  );
}