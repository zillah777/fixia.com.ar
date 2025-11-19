import * as React from "react";
import * as ReactDOM from "react-dom";

import { cn } from "./utils";
import { buttonVariants } from "./button";

// AlertDialog Context
interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined);

const AlertDialog: React.FC<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
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
    <AlertDialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
};
AlertDialog.displayName = "AlertDialog";

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(true);
      onClick?.(e);
    };

    return <button ref={ref} onClick={handleClick} {...props} />;
  }
);
AlertDialogTrigger.displayName = "AlertDialogTrigger";

const AlertDialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
AlertDialogPortal.displayName = "AlertDialogPortal";

const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

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
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }, [context?.open]);

    if (!context?.open) return null;

    return (
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <div
          ref={contentRef}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 glass border-white/20 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl",
            className
          )}
          data-state="open"
          role="alertdialog"
          aria-modal="true"
          {...props}
        />
      </AlertDialogPortal>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      // Alert dialog typically closes when action is clicked
      if (!e.defaultPrevented) {
        context?.onOpenChange(false);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant: "default" }), className)}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      context?.onOpenChange(false);
    };

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-2 sm:mt-0",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};