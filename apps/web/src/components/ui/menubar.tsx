import * as React from "react";
import * as ReactDOM from "react-dom";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

const Menubar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menubar"
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className
      )}
      {...props}
    />
  )
);
Menubar.displayName = "Menubar";

// Menu Context
interface MenubarMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | undefined>(undefined);

const MenubarMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <MenubarMenuContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
      {children}
    </MenubarMenuContext.Provider>
  );
};
MenubarMenu.displayName = "MenubarMenu";

const MenubarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ ...props }) => (
  <div role="group" data-slot="menubar-group" {...props} />
);
MenubarGroup.displayName = "MenubarGroup";

const MenubarPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
MenubarPortal.displayName = "MenubarPortal";

const MenubarRadioGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ ...props }) => (
  <div role="radiogroup" data-slot="menubar-radio-group" {...props} />
);
MenubarRadioGroup.displayName = "MenubarRadioGroup";

const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(MenubarMenuContext);

    React.useImperativeHandle(ref, () => context!.triggerRef.current!);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(!context.open);
      onClick?.(e);
    };

    return (
      <button
        ref={context?.triggerRef}
        type="button"
        data-slot="menubar-trigger"
        data-state={context?.open ? "open" : "closed"}
        aria-haspopup="menu"
        aria-expanded={context?.open}
        onClick={handleClick}
        className={cn(
          "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-none select-none",
          "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
MenubarTrigger.displayName = "MenubarTrigger";

export interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  sideOffset?: number;
}

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ className, align = "start", alignOffset = -4, sideOffset = 8, children, ...props }, ref) => {
    const context = React.useContext(MenubarMenuContext);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    // Calculate position
    React.useEffect(() => {
      if (!context?.open || !contentRef.current || !context.triggerRef.current) return;

      const triggerRect = context.triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      let top = triggerRect.bottom + sideOffset;
      let left = triggerRect.left + alignOffset;

      if (align === "center") {
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width;
      }

      // Keep within viewport
      top = Math.max(8, Math.min(top, window.innerHeight - contentRect.height - 8));
      left = Math.max(8, Math.min(left, window.innerWidth - contentRect.width - 8));

      setPosition({ top, left });
    }, [context?.open, align, alignOffset, sideOffset]);

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
      <MenubarPortal>
        <div
          ref={contentRef}
          role="menu"
          data-slot="menubar-content"
          data-state={context.open ? "open" : "closed"}
          className={cn(
            "bg-popover text-popover-foreground z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
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
      </MenubarPortal>
    );
  }
);
MenubarContent.displayName = "MenubarContent";

export interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
}

const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, inset, variant = "default", onClick, ...props }, ref) => {
    const context = React.useContext(MenubarMenuContext);

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
        data-slot="menubar-item"
        data-inset={inset}
        data-variant={variant}
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10",
          "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    );
  }
);
MenubarItem.displayName = "MenubarItem";

export interface MenubarCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, MenubarCheckboxItemProps>(
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
        data-slot="menubar-checkbox-item"
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-none select-none",
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
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

const MenubarRadioItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const [checked, setChecked] = React.useState(false);

    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        data-slot="menubar-radio-item"
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-none select-none",
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
MenubarRadioItem.displayName = "MenubarRadioItem";

export interface MenubarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const MenubarLabel = React.forwardRef<HTMLDivElement, MenubarLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  )
);
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
);
MenubarSeparator.displayName = "MenubarSeparator";

const MenubarShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span
    data-slot="menubar-shortcut"
    className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
    {...props}
  />
);
MenubarShortcut.displayName = "MenubarShortcut";

const MenubarSub: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
MenubarSub.displayName = "MenubarSub";

export interface MenubarSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const MenubarSubTrigger = React.forwardRef<HTMLDivElement, MenubarSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitem"
      aria-haspopup="menu"
      data-slot="menubar-sub-trigger"
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
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </div>
  )
);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menu"
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
);
MenubarSubContent.displayName = "MenubarSubContent";

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
