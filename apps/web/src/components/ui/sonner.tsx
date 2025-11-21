import * as React from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "./utils";

// Enhanced toast with custom icons and actions
interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  icon?: React.ReactNode;
}

/**
 * Enhanced toast notifications with custom icons and actions
 * Built on top of Sonner 2.0.3
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: options?.icon || <CheckCircle2 className="h-5 w-5 text-green-500" />,
      action: options?.action
        ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
        : undefined,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: options?.icon || <AlertCircle className="h-5 w-5 text-red-500" />,
      action: options?.action
        ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
        : undefined,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: options?.icon || <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      action: options?.action
        ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
        : undefined,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: options?.icon || <Info className="h-5 w-5 text-blue-500" />,
      action: options?.action
        ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
        : undefined,
    });
  },

  custom: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: options?.icon,
      action: options?.action
        ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
        : undefined,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

interface ToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
}

/**
 * Enhanced Toaster component with premium styling
 */
export function Toaster({
  position = "bottom-right",
  expand = false,
  richColors = true,
  closeButton = true,
}: ToasterProps = {}) {
  return (
    <SonnerToaster
      position={position}
      expand={expand}
      richColors={richColors}
      closeButton={closeButton}
      toastOptions={{
        classNames: {
          toast: cn(
            "glass-medium border border-white/10 shadow-2xl",
            "backdrop-blur-xl rounded-xl",
            "group-[.toaster]:text-foreground"
          ),
          title: "text-sm font-semibold",
          description: "text-xs text-muted-foreground",
          actionButton: cn(
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "rounded-lg px-3 py-1.5 text-xs font-medium"
          ),
          cancelButton: cn(
            "bg-muted text-muted-foreground",
            "hover:bg-muted/80 transition-colors",
            "rounded-lg px-3 py-1.5 text-xs font-medium"
          ),
          closeButton: cn(
            "bg-white/10 hover:bg-white/20",
            "border-0 transition-colors"
          ),
        },
      }}
    />
  );
}
