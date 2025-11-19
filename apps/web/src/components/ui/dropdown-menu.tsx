import * as React from "react";
import * as ReactDOM from "react-dom";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

// Dropdown Menu Context
interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  modal?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const triggerRef = React.useRef<HTMLElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};
DropdownMenu.displayName = "DropdownMenu";

const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
DropdownMenuPortal.displayName = "DropdownMenuPortal";

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    React.useImperativeHandle(ref, () => context!.triggerRef.current as HTMLButtonElement);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(!context.open);
      onClick?.(e);
    };

    return (
      <button
        ref={context?.triggerRef as React.Ref<HTMLButtonElement>}
        data-slot="dropdown-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={context?.open}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, align = "start", side = "bottom", children, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    // Calculate position
    React.useEffect(() => {
      if (!context?.open || !contentRef.current || !context.triggerRef.current) return;

      const triggerRect = context.triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (side) {
        case "bottom":
          top = triggerRect.bottom + sideOffset;
          left = triggerRect.left;
          if (align === "center") left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
          if (align === "end") left = triggerRect.right - contentRect.width;
          break;
        case "top":
          top = triggerRect.top - contentRect.height - sideOffset;
          left = triggerRect.left;
          if (align === "center") left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
          if (align === "end") left = triggerRect.right - contentRect.width;
          break;
        case "right":
          top = triggerRect.top;
          left = triggerRect.right + sideOffset;
          break;
        case "left":
          top = triggerRect.top;
          left = triggerRect.left - contentRect.width - sideOffset;
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

    return (
      <DropdownMenuPortal>
        <div
          ref={contentRef}
          data-slot="dropdown-menu-content"
          data-state={context.open ? "open" : "closed"}
          data-side={side}
          role="menu"
          className={cn(
            "glass-strong text-popover-foreground z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-xl border border-white/10 p-1 shadow-xl",
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
        </div>
      </DropdownMenuPortal>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ ...props }) => (
  <div data-slot="dropdown-menu-group" role="group" {...props} />
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, variant = "default", onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        context?.onOpenChange(false);
      }
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        data-slot="dropdown-menu-item"
        data-inset={inset}
        data-variant={variant}
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive",
          "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onCheckedChange?.(!checked);
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        data-slot="dropdown-menu-checkbox-item"
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          {checked && <CheckIcon className="size-4" />}
        </span>
        {children}
      </div>
    );
  }
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ ...props }) => (
  <div role="radiogroup" data-slot="dropdown-menu-radio-group" {...props} />
);
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

export interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, value, ...props }, ref) => {
    // In a real implementation, this would need radio group context
    const [checked, setChecked] = React.useState(false);

    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        data-slot="dropdown-menu-radio-item"
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          {checked && <CircleIcon className="size-2 fill-current" />}
        </span>
        {children}
      </div>
    );
  }
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span
    data-slot="dropdown-menu-shortcut"
    className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
    {...props}
  />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Submenu components
const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
DropdownMenuSub.displayName = "DropdownMenuSub";

export interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitem"
      aria-haspopup="menu"
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  )
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menu"
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
