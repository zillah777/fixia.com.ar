import * as React from "react";
import * as ReactDOM from "react-dom";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

// Context Menu Context
interface ContextMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | undefined>(undefined);

export interface ContextMenuProps {
  children: React.ReactNode;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  return (
    <ContextMenuContext.Provider value={{ open, onOpenChange: setOpen, position }}>
      {children}
    </ContextMenuContext.Provider>
  );
};
ContextMenu.displayName = "ContextMenu";

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ onContextMenu, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      context?.onOpenChange(true);
      // Set position based on mouse click
      const position = { x: e.clientX, y: e.clientY };
      (context as any).position = position;
      onContextMenu?.(e);
    };

    return (
      <div
        ref={ref}
        data-slot="context-menu-trigger"
        onContextMenu={handleContextMenu}
        {...props}
      />
    );
  }
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ ...props }) => (
  <div role="group" data-slot="context-menu-group" {...props} />
);
ContextMenuGroup.displayName = "ContextMenuGroup";

const ContextMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
ContextMenuPortal.displayName = "ContextMenuPortal";

const ContextMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
ContextMenuSub.displayName = "ContextMenuSub";

const ContextMenuRadioGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ ...props }) => (
  <div role="radiogroup" data-slot="context-menu-radio-group" {...props} />
);
ContextMenuRadioGroup.displayName = "ContextMenuRadioGroup";

export interface ContextMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitem"
      aria-haspopup="menu"
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </div>
  )
);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

const ContextMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menu"
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

const ContextMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

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

    return (
      <ContextMenuPortal>
        <div
          ref={contentRef}
          role="menu"
          data-slot="context-menu-content"
          data-state={context.open ? "open" : "closed"}
          className={cn(
            "bg-popover text-popover-foreground z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
          style={{
            position: "fixed",
            top: `${context.position.y}px`,
            left: `${context.position.x}px`,
          }}
          {...props}
        />
      </ContextMenuPortal>
    );
  }
);
ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, inset, variant = "default", onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);

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
        data-slot="context-menu-item"
        data-inset={inset}
        data-variant={variant}
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20",
          "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    );
  }
);
ContextMenuItem.displayName = "ContextMenuItem";

export interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
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
        data-slot="context-menu-checkbox-item"
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
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const [checked, setChecked] = React.useState(false);

    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        data-slot="context-menu-radio-item"
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
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn("text-foreground px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  )
);
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span
    data-slot="context-menu-shortcut"
    className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
    {...props}
  />
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
