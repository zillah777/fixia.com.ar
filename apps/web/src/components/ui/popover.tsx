import * as React from "react";
import * as ReactDOM from "react-dom";

import { cn } from "./utils";

// Popover Context
interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

const Popover: React.FC<PopoverProps> = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </PopoverContext.Provider>
  );
};
Popover.displayName = "Popover";

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const context = React.useContext(PopoverContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(!context.open);
      onClick?.(e);
    };

    return <button ref={ref} onClick={handleClick} {...props} />;
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverAnchor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
);
PopoverAnchor.displayName = "PopoverAnchor";

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", side = "bottom", sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    // Calculate position
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

      // Keep within viewport
      top = Math.max(8, Math.min(top, window.innerHeight - contentRect.height - 8));
      left = Math.max(8, Math.min(left, window.innerWidth - contentRect.width - 8));

      setPosition({ top, left });
    }, [context?.open, side, sideOffset, align]);

    // Handle escape key
    React.useEffect(() => {
      if (!context?.open) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          context.onOpenChange(false);
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [context]);

    // Handle click outside
    React.useEffect(() => {
      if (!context?.open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          context.onOpenChange(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [context]);

    if (!context?.open) return null;

    return ReactDOM.createPortal(
      <div
        ref={contentRef}
        data-state={context.open ? "open" : "closed"}
        data-side={side}
        className={cn(
          "z-50 w-72 rounded-xl glass-strong border border-white/10 p-4 text-popover-foreground shadow-2xl outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
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
      </div>,
      document.body
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };