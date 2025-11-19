import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

// Navigation Menu Context
interface NavigationMenuContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | undefined>(undefined);

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  viewport?: boolean;
}

const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({ className, children, value: controlledValue, defaultValue = "", onValueChange, viewport = true, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <NavigationMenuContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <nav
          ref={ref}
          data-slot="navigation-menu"
          data-viewport={viewport}
          className={cn(
            "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
            className
          )}
          {...props}
        >
          {children}
          {viewport && <NavigationMenuViewport />}
        </nav>
      </NavigationMenuContext.Provider>
    );
  }
);
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  )
);
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
);
NavigationMenuItem.displayName = "NavigationMenuItem";

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
);

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsOpen(!isOpen);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="navigation-menu-trigger"
        data-state={isOpen ? "open" : "closed"}
        onClick={handleClick}
        className={cn(navigationMenuTriggerStyle(), "group", className)}
        {...props}
      >
        {children}{" "}
        <ChevronDownIcon
          className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </button>
    );
  }
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5",
        "group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md",
        "group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow",
        className
      )}
      {...props}
    />
  )
);
NavigationMenuContent.displayName = "NavigationMenuContent";

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("absolute top-full left-0 isolate z-50 flex justify-center")}>
      <div
        ref={ref}
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground relative mt-1.5 overflow-hidden rounded-md border shadow",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
          className
        )}
        {...props}
      />
    </div>
  )
);
NavigationMenuViewport.displayName = "NavigationMenuViewport";

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-1",
        "data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
);
NavigationMenuLink.displayName = "NavigationMenuLink";

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </div>
  )
);
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
