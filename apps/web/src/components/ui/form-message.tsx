import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "./utils";

const formMessageVariants = cva(
  "flex items-start gap-2 text-sm mt-2 animate-in slide-in-from-top-1 duration-200",
  {
    variants: {
      variant: {
        error: "text-destructive",
        success: "text-success",
        warning: "text-warning-foreground",
        info: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
);

export interface FormMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formMessageVariants> {
  message?: string;
  showIcon?: boolean;
}

const FormMessage = React.forwardRef<HTMLDivElement, FormMessageProps>(
  ({ className, variant, message, showIcon = true, children, ...props }, ref) => {
    const content = message || children;

    if (!content) return null;

    const Icon = {
      error: AlertCircle,
      success: CheckCircle,
      warning: AlertCircle,
      info: Info,
    }[variant || "error"];

    return (
      <div
        ref={ref}
        className={cn(formMessageVariants({ variant }), className)}
        role="alert"
        {...props}
      >
        {showIcon && <Icon className="h-4 w-4 mt-0.5 shrink-0" />}
        <span className="text-sm leading-5">{content}</span>
      </div>
    );
  }
);

FormMessage.displayName = "FormMessage";

export { FormMessage, formMessageVariants };
