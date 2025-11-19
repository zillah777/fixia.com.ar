import * as React from "react";

import { cn } from "./utils";

interface TabsContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value: controlledValue, defaultValue, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <div
          ref={ref}
          data-slot="tabs"
          className={cn("flex flex-col gap-2", className)}
          {...props}
        />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> { }

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
          className,
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext);

    if (!context) {
      throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === value;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.onValueChange?.(value);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        data-slot="tabs-trigger"
        onClick={handleClick}
        className={cn(
          "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:outline-ring focus-visible:outline-1",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          isActive
            ? "bg-card dark:text-foreground dark:border-input dark:bg-input/30 text-foreground"
            : "text-foreground dark:text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);

    if (!context) {
      throw new Error('TabsContent must be used within Tabs');
    }

    const isActive = context.value === value;

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        data-slot="tabs-content"
        className={cn("flex-1 outline-none", className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
