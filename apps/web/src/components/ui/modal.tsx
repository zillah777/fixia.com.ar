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
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-6xl"
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
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-modal-backdrop bg-black/60 backdrop-blur-sm modal-overlay"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className={cn(
              "fixed left-[50%] top-[50%] z-modal-content w-full translate-x-[-50%] translate-y-[-50%]",
              "glass-strong rounded-2xl shadow-2xl border border-white/10",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "w-[95vw] sm:w-full",
              sizeClasses[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              {(title || description || showCloseButton) && (
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {title && (
                      <h2 id="modal-title" className="text-lg font-semibold leading-none tracking-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-description" className="text-sm text-muted-foreground mt-2">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="rounded-xl glass-medium hover:glass-strong opacity-70 hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2 ml-4"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="relative">
                {children}
              </div>
            </div>
          </motion.div>
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