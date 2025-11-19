import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

interface AccordionContextValue {
  type: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type, value: controlledValue, defaultValue, onValueChange, collapsible, ...props }, ref) => {
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
      <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
        <div
          ref={ref}
          data-slot="accordion"
          className={className}
          {...props}
        />
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="accordion-item"
        data-value={value}
        className={cn("border-b last:border-b-0", className)}
        {...props}
      />
    );
  }
);
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const itemElement = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => itemElement.current!);

    if (!context) {
      throw new Error('AccordionTrigger must be used within Accordion');
    }

    // Get value from parent AccordionItem
    const itemValue = itemElement.current?.closest('[data-value]')?.getAttribute('data-value') || '';

    const isOpen = context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(itemValue)
      : context.value === itemValue;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (context.type === "multiple") {
        const currentValues = Array.isArray(context.value) ? context.value : [];
        const newValues = currentValues.includes(itemValue)
          ? currentValues.filter(v => v !== itemValue)
          : [...currentValues, itemValue];
        context.onValueChange?.(newValues);
      } else {
        const newValue = context.value === itemValue ? "" : itemValue;
        context.onValueChange?.(newValue);
      }
      onClick?.(e);
    };

    return (
      <h3 className="flex">
        <button
          ref={itemElement}
          type="button"
          data-slot="accordion-trigger"
          data-state={isOpen ? "open" : "closed"}
          aria-expanded={isOpen}
          onClick={handleClick}
          className={cn(
            "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none",
            "hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            "[&[data-state=open]>svg]:rotate-180",
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        </button>
      </h3>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const contentElement = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentElement.current!);

    if (!context) {
      throw new Error('AccordionContent must be used within Accordion');
    }

    // Get value from parent AccordionItem
    const itemValue = contentElement.current?.closest('[data-value]')?.getAttribute('data-value') || '';

    const isOpen = context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(itemValue)
      : context.value === itemValue;

    if (!isOpen) {
      return null;
    }

    return (
      <div
        ref={contentElement}
        data-slot="accordion-content"
        data-state={isOpen ? "open" : "closed"}
        className="overflow-hidden text-sm transition-all"
        {...props}
      >
        <div className={cn("pt-0 pb-4", className)}>{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
