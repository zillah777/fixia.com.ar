import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, indeterminate, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Handle indeterminate state
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      onCheckedChange?.(inputRef.current?.indeterminate ? "indeterminate" : newChecked);
      onChange?.(e);
    };

    const isChecked = indeterminate ? false : checked;
    const showIndicator = checked || indeterminate;

    return (
      <label
        className={cn(
          "peer inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow outline-none cursor-pointer",
          "border-input bg-input-background dark:bg-input/30",
          "focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring",
          "has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary",
          "dark:has-[:checked]:bg-primary",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
          className,
        )}
        data-slot="checkbox"
      >
        <input
          ref={inputRef}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        {showIndicator && (
          <span
            data-slot="checkbox-indicator"
            className="flex items-center justify-center text-current transition-none"
          >
            {indeterminate ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-3.5"
              >
                <path
                  d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <CheckIcon className="size-3.5" />
            )}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
