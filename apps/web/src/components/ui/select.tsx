import * as React from "react";
import * as ReactDOM from "react-dom";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "./utils";

// Select Context
interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    // Close select after selection
    handleOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </SelectContext.Provider>
  );
};
Select.displayName = "Select";

const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="group">{children}</div>
);
SelectGroup.displayName = "SelectGroup";

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = React.useContext(SelectContext);
  return <span>{context?.value || placeholder}</span>;
};
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    React.useImperativeHandle(ref, () => context!.triggerRef.current!);

    return (
      <button
        ref={context?.triggerRef}
        type="button"
        role="combobox"
        aria-expanded={context?.open}
        aria-haspopup="listbox"
        onClick={() => context?.onOpenChange(!context.open)}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-xl glass border-white/20 bg-input-background px-3 py-2 text-sm shadow-sm ring-offset pl-3 pr-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </div>
);
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronDown className="h-4 w-4" />
  </div>
);
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "popper" | "item-aligned";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "popper", ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    // Calculate position
    React.useEffect(() => {
      if (!context?.open || !contentRef.current || !context.triggerRef.current) return;

      const triggerRect = context.triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      let top = triggerRect.bottom + 4;
      let left = triggerRect.left;
      const width = triggerRect.width;

      // Keep within viewport
      if (top + contentRect.height > window.innerHeight) {
        top = triggerRect.top - contentRect.height - 4;
      }

      setPos({ top, left, width });
    }, [context?.open]);

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
        if (
          contentRef.current &&
          !contentRef.current.contains(e.target as Node) &&
          context.triggerRef.current &&
          !context.triggerRef.current.contains(e.target as Node)
        ) {
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
        role="listbox"
        data-state={context.open ? "open" : "closed"}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl glass border-white/20 text-popover-foreground shadow-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" && "data-[side=bottom]:translate-y-1",
          className
        )}
        style={{
          position: "fixed",
          top: `${pos.top}px`,
          left: `${pos.left}px`,
          minWidth: `${pos.width}px`,
        }}
        {...props}
      >
        <div className="p-1 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>,
      document.body
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  )
);
SelectLabel.displayName = "SelectLabel";

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const isSelected = context?.value === value;

    const handleClick = () => {
      context?.onValueChange(value);
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={handleClick}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          isSelected && "bg-accent/50",
          className
        )}
        {...props}
      >
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        <span>{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};