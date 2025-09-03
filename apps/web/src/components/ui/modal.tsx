import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "./utils"

interface ModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const sizeClasses = {
  sm: "max-w-[90vw] sm:max-w-sm",
  md: "max-w-[95vw] sm:max-w-md", 
  lg: "max-w-[95vw] sm:max-w-lg",
  xl: "max-w-[95vw] sm:max-w-2xl",
  full: "max-w-[98vw] sm:max-w-6xl"
}

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
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <DialogPrimitive.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 z-modal-backdrop bg-black/60 backdrop-blur-sm modal-overlay"
                  onClick={closeOnOverlayClick ? onClose : undefined}
                />
              </DialogPrimitive.Overlay>

              {/* Content */}
              <DialogPrimitive.Content asChild>
                <motion.div
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
                    "glass border-white/20 rounded-lg sm:rounded-2xl shadow-2xl mx-4 sm:mx-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "max-h-[90vh] overflow-auto",
                    sizeClasses[size],
                    className
                  )}
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    {(title || description || showCloseButton) && (
                      <div className="flex items-start justify-between mb-4 sm:mb-6">
                        <div className="flex-1">
                          {title && (
                            <DialogPrimitive.Title className="mobile-text-xl font-semibold leading-none tracking-tight">
                              {title}
                            </DialogPrimitive.Title>
                          )}
                          {description && (
                            <DialogPrimitive.Description className="mobile-text-base text-muted-foreground mt-2">
                              {description}
                            </DialogPrimitive.Description>
                          )}
                        </div>
                        
                        {showCloseButton && (
                          <DialogPrimitive.Close asChild>
                            <button
                              onClick={onClose}
                              className="rounded-lg sm:rounded-xl glass-medium hover:glass-strong opacity-70 hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2 ml-4 touch-target"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Close</span>
                            </button>
                          </DialogPrimitive.Close>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative">
                      {children}
                    </div>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0 pt-4 sm:pt-6 border-t border-white/10",
        className
      )}
      {...props}
    />
  )
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left mb-4 sm:mb-6",
        className
      )}
      {...props}
    />
  )
}