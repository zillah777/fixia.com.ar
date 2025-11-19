import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-accent aria-pressed:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed: controlledPressed, defaultPressed, onPressedChange, onClick, ...props }, ref) => {
    const [internalPressed, setInternalPressed] = React.useState(defaultPressed || false);
    const pressed = controlledPressed !== undefined ? controlledPressed : internalPressed;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !pressed;
      if (controlledPressed === undefined) {
        setInternalPressed(newPressed);
      }
      onPressedChange?.(newPressed);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="toggle"
        data-state={pressed ? "on" : "off"}
        aria-pressed={pressed}
        onClick={handleClick}
        className={cn(toggleVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
