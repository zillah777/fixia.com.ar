import * as React from "react";

import { cn } from "./utils";

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(undefined);

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open: controlledOpen, defaultOpen = false, onOpenChange, disabled, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    return (
      <CollapsibleContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange, disabled }}>
        <div ref={ref} data-slot="collapsible" data-state={isOpen ? "open" : "closed"} {...props} />
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);

    if (!context) {
      throw new Error('CollapsibleTrigger must be used within Collapsible');
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!context.disabled) {
        context.onOpenChange(!context.open);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="collapsible-trigger"
        data-state={context.open ? "open" : "closed"}
        aria-expanded={context.open}
        disabled={context.disabled}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, style, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);

    if (!context) {
      throw new Error('CollapsibleContent must be used within Collapsible');
    }

    if (!context.open) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-slot="collapsible-content"
        data-state={context.open ? "open" : "closed"}
        className={cn("overflow-hidden transition-all", className)}
        style={{
          ...style,
        }}
        {...props}
      />
    );
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
