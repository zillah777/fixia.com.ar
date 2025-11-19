import * as React from "react";

import { cn } from "./utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        data-slot="separator-root"
        data-orientation={orientation}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(
          "bg-border shrink-0",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className,
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };
