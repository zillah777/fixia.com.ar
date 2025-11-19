import * as React from "react";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  name?: string;
  disabled?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, name, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, name }}>
        <div
          ref={ref}
          role="radiogroup"
          data-slot="radio-group"
          className={cn("grid gap-3", className)}
          aria-disabled={disabled}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);

    if (!context) {
      throw new Error('RadioGroupItem must be used within RadioGroup');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        context.onValueChange?.(value);
      }
    };

    const isChecked = context.value === value;

    return (
      <label
        className={cn(
          "inline-flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border shadow-xs transition-[color,box-shadow] outline-none cursor-pointer",
          "border-input text-primary dark:bg-input/30",
          "focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
          className,
        )}
        data-slot="radio-group-item"
      >
        <input
          ref={ref}
          type="radio"
          className="sr-only"
          name={context.name}
          value={value}
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        {isChecked && (
          <span
            data-slot="radio-group-indicator"
            className="relative flex items-center justify-center"
          >
            <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
          </span>
        )}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
