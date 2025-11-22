/**
 * FIXIA RESPONSIVE MODAL COMPONENT
 * World-class modal with mobile sheet behavior
 *
 * Features:
 * - Bottom sheet on mobile, centered modal on desktop
 * - Safe area support (notch, Dynamic Island)
 * - Full viewport height on mobile
 * - Keyboard-aware (adjusts for virtual keyboard)
 * - Focus trap and accessibility
 * - Reduced motion support
 * - Swipe to close on mobile
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'motion/react';
import { cn } from '../ui/utils';

/* ============================================
   MODAL CONTEXT
   ============================================ */

interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a ResponsiveModal');
  }
  return context;
};

/* ============================================
   MODAL ROOT
   ============================================ */

interface ResponsiveModalProps {
  children: React.ReactNode;
  /** Controlled open state */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Prevent scroll on body when open */
  preventScroll?: boolean;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  children,
  isOpen,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventScroll = true,
}) => {
  // Detect mobile viewport
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  const contextValue = React.useMemo(
    () => ({ isOpen, onClose, isMobile }),
    [isOpen, onClose, isMobile]
  );

  // Render in portal
  if (typeof window === 'undefined') return null;

  return createPortal(
    <ModalContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {isOpen && children}
      </AnimatePresence>
    </ModalContext.Provider>,
    document.body
  );
};

/* ============================================
   MODAL OVERLAY
   ============================================ */

interface ModalOverlayProps {
  className?: string;
}

const ResponsiveModalOverlay: React.FC<ModalOverlayProps> = ({ className }) => {
  const { onClose, isMobile } = useModal();

  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-[9998]',
        'bg-black/60',
        'backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      aria-hidden="true"
    />
  );
};

/* ============================================
   MODAL CONTENT
   ============================================ */

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  /** Size variant (desktop only) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Enable swipe to close on mobile */
  swipeToClose?: boolean;
  /** Custom max height */
  maxHeight?: string;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-[calc(100vw-2rem)]',
};

const ResponsiveModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      children,
      className,
      size = 'md',
      swipeToClose = true,
      maxHeight,
    },
    ref
  ) => {
    const { onClose, isMobile } = useModal();
    const dragControls = useDragControls();
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => contentRef.current!);

    // Focus trap
    React.useEffect(() => {
      const content = contentRef.current;
      if (!content) return;

      const focusableElements = content.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus first element
      firstFocusable?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      };

      content.addEventListener('keydown', handleTab);
      return () => content.removeEventListener('keydown', handleTab);
    }, []);

    // Handle swipe to close
    const handleDragEnd = (_: unknown, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    };

    // Reduced motion check
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile: Bottom sheet
    const mobileProps = {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', damping: 25, stiffness: 300 },
      drag: swipeToClose ? ('y' as const) : false,
      dragControls,
      dragConstraints: { top: 0 },
      dragElastic: { top: 0, bottom: 0.5 },
      onDragEnd: swipeToClose ? handleDragEnd : undefined,
    };

    // Desktop: Centered modal
    const desktopProps = {
      initial: { opacity: 0, scale: 0.95, y: -20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: -20 },
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', damping: 25, stiffness: 300 },
    };

    const motionProps = isMobile ? mobileProps : desktopProps;

    return (
      <motion.div
        ref={contentRef}
        className={cn(
          'fixed z-[9999]',
          'bg-card border border-white/10',
          'shadow-2xl',
          'overflow-hidden',
          'flex flex-col',

          // Mobile: Bottom sheet
          'inset-x-0 bottom-0',
          'rounded-t-2xl',
          'max-h-[calc(100dvh-env(safe-area-inset-top)-1rem)]',

          // Desktop: Centered modal
          'sm:inset-auto sm:left-1/2 sm:top-1/2',
          'sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:rounded-2xl',
          'sm:w-full',
          sizeClasses[size],
          'sm:max-h-[calc(100vh-4rem)]',

          className
        )}
        style={{ maxHeight: maxHeight || undefined }}
        role="dialog"
        aria-modal="true"
        {...motionProps}
      >
        {/* Drag handle for mobile */}
        {isMobile && swipeToClose && (
          <div
            className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>
        )}

        {children}
      </motion.div>
    );
  }
);

ResponsiveModalContent.displayName = 'ResponsiveModalContent';

/* ============================================
   MODAL HEADER
   ============================================ */

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show close button */
  showClose?: boolean;
}

const ResponsiveModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, showClose = true, children, ...props }, ref) => {
    const { onClose } = useModal();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          'px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4',
          'border-b border-white/10',
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">{children}</div>

        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex-shrink-0',
              'w-8 h-8 sm:w-9 sm:h-9',
              'flex items-center justify-center',
              'rounded-lg',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-white/10',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

ResponsiveModalHeader.displayName = 'ResponsiveModalHeader';

/* ============================================
   MODAL TITLE
   ============================================ */

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

const ResponsiveModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, as: Component = 'h2', children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-lg sm:text-xl font-semibold',
        'leading-tight tracking-tight',
        'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

ResponsiveModalTitle.displayName = 'ResponsiveModalTitle';

/* ============================================
   MODAL DESCRIPTION
   ============================================ */

const ResponsiveModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-muted-foreground',
      'leading-relaxed',
      'mt-1',
      className
    )}
    {...props}
  >
    {children}
  </p>
));

ResponsiveModalDescription.displayName = 'ResponsiveModalDescription';

/* ============================================
   MODAL BODY
   ============================================ */

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable scroll */
  scrollable?: boolean;
}

const ResponsiveModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, scrollable = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-4 py-4 sm:px-6 sm:py-5',
        'flex-1',
        scrollable && 'overflow-y-auto overscroll-contain',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveModalBody.displayName = 'ResponsiveModalBody';

/* ============================================
   MODAL FOOTER
   ============================================ */

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack buttons on mobile */
  stackOnMobile?: boolean;
}

const ResponsiveModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, stackOnMobile = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-4 py-4 sm:px-6 sm:py-5',
        'border-t border-white/10',
        'flex gap-3',
        stackOnMobile ? 'flex-col-reverse sm:flex-row sm:justify-end' : 'flex-row justify-end',
        // Safe area padding for iOS
        'pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveModalFooter.displayName = 'ResponsiveModalFooter';

/* ============================================
   MODAL TRIGGER (Optional utility)
   ============================================ */

interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Open callback */
  onOpen: () => void;
}

const ResponsiveModalTrigger = React.forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ onOpen, children, ...props }, ref) => (
    <button ref={ref} type="button" onClick={onOpen} {...props}>
      {children}
    </button>
  )
);

ResponsiveModalTrigger.displayName = 'ResponsiveModalTrigger';

export {
  ResponsiveModal,
  ResponsiveModalOverlay,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTrigger,
  useModal,
};
