import * as React from "react";
import { AlertCircle, LucideIcon, RefreshCw } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  error?: Error | string;
  showDetails?: boolean;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      icon: Icon = AlertCircle,
      title = "Algo salió mal",
      description = "Ha ocurrido un error. Por favor, intenta de nuevo.",
      action,
      error,
      showDetails = process.env.NODE_ENV === "development",
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-6 text-center",
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="h-12 w-12 rounded-xl glass-medium border border-destructive/30 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-destructive" />
        </div>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {description}
          </p>
        )}

        {showDetails && errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 max-w-md w-full">
            <p className="text-xs font-mono text-destructive break-all text-left">
              {errorMessage}
            </p>
          </div>
        )}

        {action && (
          <Button onClick={action.onClick} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";

export { ErrorState };
