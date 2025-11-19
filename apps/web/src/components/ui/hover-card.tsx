import * as React from "react";
import * as ReactDOM from "react-dom";

import { cn } from "./utils";

// HoverCard Context
interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | undefined>(undefined);

export interface HoverCardProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
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
    <HoverCardContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {children}
    </HoverCardContext.Provider>
  );
};
HoverCard.displayName = "HoverCard";

const HoverCardTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    const context = React.useContext(HoverCardContext);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        context?.setOpen(true);
      }, 700); // Default 700ms delay
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        context?.setOpen(false);
      }, 300); // Default 300ms  close delay
    };

    return (
      <div
        ref={ref}
        data-slot="hover-card-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);
HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = "center", side = "bottom", sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(HoverCardContext);
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

      setPosition({ top, left });
    }, [context?.open, side, sideOffset, align]);

    // Keep hover card open when hovering over it
    const handleMouseEnter = () => {
      context?.setOpen(true);
    };

    const handleMouseLeave = () => {
      context?.setOpen(false);
    };

    if (!context?.open) return null;

    return ReactDOM.createPortal(
      <div
        ref={contentRef}
        data-slot="hover-card-content"
        data-state={context.open ? "open" : "closed"}
        data-side={side}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden",
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
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
