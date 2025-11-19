import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    type?: "single" | "multiple";
  }
>({
  size: "default",
  variant: "default",
});

export interface ToggleGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant, size, type = "single", value: controlledValue, defaultValue, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      defaultValue || (type === "multiple" ? [] : "")
    );
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleValueChange = (newValue: string | string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        role="group"
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        className={cn(
          "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
          className,
        )}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ variant, size, value, onValueChange: handleValueChange, type }}>
          {children}
        </ToggleGroupContext.Provider>
      </div>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof toggleVariants> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, onClick, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);

    const isPressed = context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(value)
      : context.value === value;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (context.type === "multiple") {
        const currentValues = Array.isArray(context.value) ? context.value : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        context.onValueChange?.(newValues);
      } else {
        const newValue = context.value === value ? "" : value;
        context.onValueChange?.(newValue);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="toggle-group-item"
        data-state={isPressed ? "on" : "off"}
        data-variant={context.variant || variant}
        data-size={context.size || size}
        aria-pressed={isPressed}
        onClick={handleClick}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
