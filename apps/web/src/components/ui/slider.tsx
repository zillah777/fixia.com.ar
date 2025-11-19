import * as React from "react";

import { cn } from "./utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({
    className,
    value,
    defaultValue = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    orientation = "horizontal",
    disabled,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;

    // For now, only support single value
    const singleValue = currentValue[0] || min;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)];
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    const percentage = ((singleValue - min) / (max - min)) * 100;

    return (
      <div
        data-slot="slider"
        data-orientation={orientation}
        data-disabled={disabled}
        className={cn(
          "relative flex w-full touch-none items-center select-none",
          "data-[disabled=true]:opacity-50",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className,
        )}
      >
        {/* Track */}
        <div
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-hidden rounded-full",
            orientation === "horizontal" ? "h-4 w-full" : "h-full w-1.5"
          )}
        >
          {/* Range (filled part) */}
          <div
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute",
              orientation === "horizontal" ? "h-full" : "w-full bottom-0"
            )}
            style={
              orientation === "horizontal"
                ? { width: `${percentage}%` }
                : { height: `${percentage}%` }
            }
          />
        </div>

        {/* Native input */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={singleValue}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />

        {/* Visual thumb */}
        <div
          data-slot="slider-thumb"
          className={cn(
            "border-primary bg-background ring-ring/50 absolute block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow]",
            "hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          style={
            orientation === "horizontal"
              ? { left: `calc(${percentage}% - 0.5rem)` }
              : { bottom: `calc(${percentage}% - 0.5rem)` }
          }
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
