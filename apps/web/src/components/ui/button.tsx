import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "liquid-gradient text-primary-foreground shadow-lg hover:opacity-90 hover:shadow-xl",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "glass border-white/20 bg-transparent shadow-sm hover:glass-medium hover:text-accent-foreground",
        secondary:
          "glass-medium text-secondary-foreground shadow-sm hover:glass-strong",
        ghost: "hover:glass-medium hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Simplified typing for asChild - modern best practice 2024
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }))

    // Modern asChild pattern: delegate rendering to child
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        ...props,
        className: cn(classes, children.props.className),
        ref,
      } as any)
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }