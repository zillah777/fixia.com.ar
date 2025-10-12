import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "./utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl glass border-white/20 p-4 pr-8 shadow-2xl transition-all duration-300 animate-in slide-in-from-top-2 fade-in",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        success: "bg-success/10 border-success/30 text-success-foreground",
        error: "bg-destructive/10 border-destructive/30 text-destructive-foreground",
        warning: "bg-warning/10 border-warning/30 text-warning-foreground",
        info: "bg-blue-500/10 border-blue-500/30 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, onClose, duration = 5000, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const Icon = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      default: Info,
    }[variant || "default"];

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          {title && <div className="text-sm font-semibold leading-5">{title}</div>}
          {description && <div className="text-sm opacity-90 leading-5">{description}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-lg p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = "Toast";

export { Toast, toastVariants };
