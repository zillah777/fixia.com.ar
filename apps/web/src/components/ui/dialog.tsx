import * as React from "react";
import * as ReactDOM from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "./utils";

// Context for managing dialog state
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  modal?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  modal = true,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};
Dialog.displayName = "Dialog";

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const context = React.useContext(DialogContext);

    if (!context) {
      throw new Error("DialogTrigger must be used within Dialog");
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.onOpenChange(true);
      onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
          handleClick(e as any);
          children.props.onClick?.(e);
        },
      } as any);
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
DialogPortal.displayName = "DialogPortal";

const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const context = React.useContext(DialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(false);
      onClick?.(e);
    };

    return <button ref={ref} onClick={handleClick} {...props} />;
  }
);
DialogClose.displayName = "DialogClose";

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> { }

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      data-state="open"
      {...props}
    />
  )
);
DialogOverlay.displayName = "DialogOverlay";

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    // Handle escape key
    React.useEffect(() => {
      if (!context?.open) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          context.onOpenChange(false);
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [context]);

    // Focus trap
    React.useEffect(() => {
      if (!context?.open || !contentRef.current) return;

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
    }, [context?.open]);

    // Lock body scroll
    React.useEffect(() => {
      if (context?.open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [context?.open]);

    if (!context?.open) return null;

    return (
      <DialogPortal>
        <DialogOverlay onClick={() => context.onOpenChange(false)} />
        <div
          ref={contentRef}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 glass-strong p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl border border-white/10",
            "w-[95vw] sm:w-full md:w-full",
            className
          )}
          data-state="open"
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
          <button
            onClick={() => context.onOpenChange(false)}
            className="absolute right-4 top-4 rounded-xl glass hover:glass-medium opacity-70 hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};