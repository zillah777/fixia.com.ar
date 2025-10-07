import { toast } from "sonner";

// Hook para usar toasts compatible con el componente NotificationsPage
export function useToast() {
  return {
    toast: (options: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
      duration?: number;
    }) => {
      const { title, description, variant = "default", duration } = options;
      
      if (variant === "destructive") {
        toast.error(title || "Error", {
          description,
          duration,
        });
      } else {
        toast.success(title || "Éxito", {
          description,
          duration,
        });
      }
    },
  };
}

// Export directo de toast de sonner para uso directo
export { toast };