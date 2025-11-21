import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
    size?: "sm" | "md" | "lg";
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
    (
        {
            className,
            message = "Cargando...",
            size = "md",
            ...props
        },
        ref
    ) => {
        const sizeClasses = {
            sm: "h-6 w-6",
            md: "h-12 w-12",
            lg: "h-16 w-16",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col items-center justify-center py-12 px-6",
                    className
                )}
                role="status"
                aria-live="polite"
                {...props}
            >
                <Loader2
                    className={cn(
                        sizeClasses[size],
                        "animate-spin text-primary mb-4"
                    )}
                />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        );
    }
);

LoadingState.displayName = "LoadingState";

export { LoadingState };
