import * as React from "react";
import * as ReactDOM from "react-dom";

import { cn } from "./utils";

// Tooltip Provider Context
interface TooltipProviderContextValue {
  delayDuration: number;
}

const TooltipProviderContext = React.createContext<TooltipProviderContextValue>({
  delayDuration: 0,
});

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

function TooltipProvider({ children, delayDuration = 0 }: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  );
}
TooltipProvider.displayName = "TooltipProvider";

// Tooltip Context
interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

export interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

function Tooltip({ children, open: controlledOpen, defaultOpen = false, onOpenChange, delayDuration }: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const providerContext = React.useContext(TooltipProviderContext);
  const delay = delayDuration ?? providerContext.delayDuration;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <TooltipContext.Provider value={{ open, setOpen: handleOpenChange }}>
      <TooltipProvider delayDuration={delay}>
        {children}
      </TooltipProvider>
    </TooltipContext.Provider>
  );
}
Tooltip.displayName = "Tooltip";

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    const providerContext = React.useContext(TooltipProviderContext);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    if (!context) {
      throw new Error("TooltipTrigger must be used within Tooltip");
    }

    const handleMouseEnter = () => {
      if (providerContext.delayDuration > 0) {
        timeoutRef.current = setTimeout(() => {
          context.setOpen(true);
        }, providerContext.delayDuration);
      } else {
        context.setOpen(true);
      }
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      context.setOpen(false);
    };

    const handleFocus = () => {
      context.setOpen(true);
    };

    const handleBlur = () => {
      context.setOpen(false);
    };

    const triggerProps = {
      ...props,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      "data-slot": "tooltip-trigger",
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...triggerProps,
        ref,
      } as any);
    }

    return (
      <span ref={ref as any} {...triggerProps}>
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", sideOffset = 4, align = "center", children, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    // Calculate position based on trigger (simplified version)
    React.useEffect(() => {
      if (!context?.open || !contentRef.current) return;

      const trigger = contentRef.current.previousElementSibling as HTMLElement;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = triggerRect.top - contentRect.height - sideOffset;
          left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
          if (align === "start") left = triggerRect.left;
          if (align === "end") left = triggerRect.right - contentRect.width;
          break;
        case "bottom":
          top = triggerRect.bottom + sideOffset;
          left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
          if (align === "start") left = triggerRect.left;
          if (align === "end") left = triggerRect.right - contentRect.width;
          break;
        case "left":
          top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
          left = triggerRect.left - contentRect.width - sideOffset;
          break;
        case "right":
          top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
          left = triggerRect.right + sideOffset;
          break;
      }

      setPosition({ top, left });
    }, [context?.open, side, sideOffset, align]);

    if (!context?.open) return null;

    return ReactDOM.createPortal(
      <div
        ref={contentRef}
        data-slot="tooltip-content"
        data-side={side}
        data-state={context.open ? "open" : "closed"}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        style={{
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        {...props}
      >
        {children}
        <div
          className="absolute size-2.5 rotate-45 rounded-[2px] bg-primary"
          style={{
            [side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left"]: "-5px",
            [side === "top" || side === "bottom" ? "left" : "top"]: "50%",
            transform: side === "top" || side === "bottom" ? "translateX(-50%)" : "translateY(-50%)",
          }}
        />
      </div>,
      document.body
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
