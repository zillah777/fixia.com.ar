import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"
import { useRipple } from "../../hooks/useRipple"
import { useHaptic } from "../../hooks/useHaptic"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ripple-container",
  {
    variants: {
      variant: {
        default: "liquid-gradient text-primary-foreground shadow-lg hover:opacity-90 hover:shadow-xl hover-lift-subtle",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover-lift-subtle",
        outline:
          "glass border-white/20 bg-transparent shadow-sm hover:glass-medium hover:text-accent-foreground hover-lift-subtle",
        secondary:
          "glass-medium text-secondary-foreground shadow-sm hover:glass-strong hover-lift-subtle",
        ghost: "hover:glass-medium hover:text-accent-foreground hover-lift-subtle",
        link: "text-primary underline-offset-4 hover:underline",
        fun: "gradient-shift text-primary-foreground shadow-lg hover:shadow-xl hover-lift",
      },
      size: {
        default: "h-11 sm:h-9 px-4 py-2",
        sm: "h-11 sm:h-8 rounded-lg px-3 text-xs sm:text-xs",
        lg: "h-12 rounded-xl px-6 sm:px-8",
        icon: "h-11 w-11 sm:h-9 sm:w-9",
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
  disableRipple?: boolean
  disableHaptic?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disableRipple = false, disableHaptic = false, children, onClick, ...props }, ref) => {
    const { ripples, createRipple, clearRipple } = useRipple();
    const { trigger } = useHaptic();
    const classes = cn(buttonVariants({ variant, size, className }))

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Create ripple effect
      if (!disableRipple && variant !== 'link') {
        createRipple(e);
      }

      // Trigger haptic feedback
      if (!disableHaptic) {
        if (variant === 'destructive') {
          trigger('warning');
        } else if (variant === 'fun') {
          trigger('success');
        } else {
          trigger('light');
        }
      }

      // Call original onClick
      onClick?.(e);
    };

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
        onClick={handleClick}
        {...props}
      >
        {children}
        {!disableRipple && variant !== 'link' && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            onAnimationEnd={() => clearRipple(ripple.id)}
          />
        ))}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }