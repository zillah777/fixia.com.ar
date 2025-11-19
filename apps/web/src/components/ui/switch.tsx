import * as React from "react";

import { cn } from "./utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    return (
      <label
        className={cn(
          "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none cursor-pointer",
          "focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
          "has-[:checked]:bg-primary has-[:not(:checked)]:bg-switch-background dark:has-[:not(:checked)]:bg-input/80",
          className,
        )}
        data-slot="switch"
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <span
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
            "bg-card dark:bg-card-foreground",
            checked
              ? "translate-x-[calc(100%-2px)] dark:bg-primary-foreground"
              : "translate-x-0"
          )}
        />
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
