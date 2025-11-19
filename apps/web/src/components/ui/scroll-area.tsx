import * as React from "react";

import { cn } from "./utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> { }

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative overflow-auto", className)}
        {...props}
      >
        <div
          data-slot="scroll-area-viewport"
          className="size-full rounded-[inherit]"
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    // Scrollbar is now handled by browser's native scrollbar
    // This component is kept for API compatibility but doesn't render anything custom
    return null;
  }
);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
