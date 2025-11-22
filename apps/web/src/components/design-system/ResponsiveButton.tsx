/**
 * FIXIA RESPONSIVE BUTTON COMPONENT
 * Enterprise-grade responsive button with touch optimization
 *
 * Features:
 * - Touch-friendly sizing (min 44x44px)
 * - Responsive sizing across breakpoints
 * - Haptic feedback support
 * - Ripple effect
 * - WCAG AA accessible
 * - Reduced motion support
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../ui/utils';

const responsiveButtonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'font-medium whitespace-nowrap',
    'transition-all duration-200',
    // Focus styles
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    // Disabled styles
    'disabled:pointer-events-none disabled:opacity-50',
    // Touch optimization
    'select-none touch-manipulation',
    // Icon sizing within button
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary - Gradient with glow
        primary: [
          'liquid-gradient text-white',
          'shadow-lg shadow-primary/25',
          // Hover (desktop only)
          '@media(hover:hover){hover:shadow-xl hover:shadow-primary/30}',
        ].join(' '),
        // Secondary - Glass effect
        secondary: [
          'glass-medium text-foreground',
          'border border-white/20',
          '@media(hover:hover){hover:glass-strong hover:border-white/30}',
        ].join(' '),
        // Outline - Transparent with border
        outline: [
          'bg-transparent border-2 border-white/30 text-foreground',
          '@media(hover:hover){hover:bg-white/5 hover:border-white/50}',
        ].join(' '),
        // Ghost - Minimal
        ghost: [
          'bg-transparent text-foreground',
          '@media(hover:hover){hover:bg-white/10}',
        ].join(' '),
        // Destructive
        destructive: [
          'bg-destructive text-destructive-foreground',
          'shadow-lg shadow-destructive/25',
          '@media(hover:hover){hover:bg-destructive/90}',
        ].join(' '),
        // Success
        success: [
          'bg-success text-success-foreground',
          'shadow-lg shadow-success/25',
          '@media(hover:hover){hover:bg-success/90}',
        ].join(' '),
        // Link style
        link: [
          'bg-transparent text-primary underline-offset-4',
          'hover:underline',
          'h-auto p-0',
        ].join(' '),
        // Fun - Animated gradient
        fun: [
          'gradient-shift text-white',
          'shadow-lg',
          '@media(hover:hover){hover:shadow-xl}',
        ].join(' '),
      },
      size: {
        // Extra small - icon buttons, badges
        xs: [
          'h-8 min-w-8 px-2.5 text-xs rounded-md',
          'sm:h-7 sm:min-w-7 sm:px-2',
          '[&_svg]:w-3.5 [&_svg]:h-3.5 sm:[&_svg]:w-3 sm:[&_svg]:h-3',
        ].join(' '),
        // Small
        sm: [
          'h-10 min-w-10 px-3.5 text-sm rounded-lg',
          'sm:h-8 sm:min-w-8 sm:px-3',
          '[&_svg]:w-4 [&_svg]:h-4',
        ].join(' '),
        // Default - Touch optimized
        default: [
          'h-11 min-w-11 px-4 text-sm rounded-xl',
          'md:h-10 md:min-w-10',
          '[&_svg]:w-4 [&_svg]:h-4 md:[&_svg]:w-5 md:[&_svg]:h-5',
        ].join(' '),
        // Large
        lg: [
          'h-12 min-w-12 px-6 text-base rounded-xl',
          'md:h-11 md:min-w-11',
          '[&_svg]:w-5 [&_svg]:h-5',
        ].join(' '),
        // Extra large - Hero CTAs
        xl: [
          'h-14 min-w-14 px-8 text-lg rounded-2xl',
          'md:h-12 md:min-w-12 md:px-6 md:text-base',
          '[&_svg]:w-5 [&_svg]:h-5 md:[&_svg]:w-6 md:[&_svg]:h-6',
        ].join(' '),
        // Icon only
        icon: [
          'h-11 w-11 rounded-xl p-0',
          'md:h-10 md:w-10',
          '[&_svg]:w-5 [&_svg]:h-5',
        ].join(' '),
        // Icon small
        'icon-sm': [
          'h-10 w-10 rounded-lg p-0',
          'sm:h-8 sm:w-8',
          '[&_svg]:w-4 [&_svg]:h-4',
        ].join(' '),
        // Icon large
        'icon-lg': [
          'h-12 w-12 rounded-xl p-0',
          'md:h-11 md:w-11',
          '[&_svg]:w-6 [&_svg]:h-6',
        ].join(' '),
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
      loading: false,
    },
  }
);

/* ============================================
   RIPPLE EFFECT HOOK
   ============================================ */

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

function useRippleEffect() {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);

  const createRipple = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, ripple]);
  }, []);

  const clearRipple = React.useCallback((id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  }, []);

  return { ripples, createRipple, clearRipple };
}

/* ============================================
   LOADING SPINNER
   ============================================ */

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/* ============================================
   BUTTON COMPONENT
   ============================================ */

export interface ResponsiveButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof responsiveButtonVariants> {
  children?: React.ReactNode;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Loading text (replaces children when loading) */
  loadingText?: string;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Disable ripple effect */
  disableRipple?: boolean;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Use as child (render as different element) */
  asChild?: boolean;
}

const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      children,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disableRipple = false,
      disableAnimation = false,
      disabled,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { ripples, createRipple, clearRipple } = useRippleEffect();

    // Check for reduced motion preference
    const prefersReducedMotion = React.useMemo(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    const shouldAnimate = !disableAnimation && !prefersReducedMotion;
    const isDisabled = disabled || isLoading;
    const showRipple = !disableRipple && variant !== 'link' && shouldAnimate;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (showRipple) {
        createRipple(e);
      }

      // Haptic feedback for supported devices
      if ('vibrate' in navigator && !isDisabled) {
        navigator.vibrate(10);
      }

      onClick?.(e);
    };

    // Motion variants
    const motionProps = shouldAnimate
      ? {
          whileHover:
            variant !== 'link'
              ? {
                  scale: 1.02,
                  boxShadow:
                    variant === 'primary'
                      ? '0 0 20px rgba(168, 85, 247, 0.5), 0 10px 30px rgba(0, 0, 0, 0.2)'
                      : variant === 'destructive'
                      ? '0 0 20px rgba(239, 68, 68, 0.5), 0 10px 30px rgba(0, 0, 0, 0.2)'
                      : variant === 'success'
                      ? '0 0 20px rgba(34, 197, 94, 0.5), 0 10px 30px rgba(0, 0, 0, 0.2)'
                      : undefined,
                }
              : undefined,
          whileTap: variant !== 'link' ? { scale: 0.95 } : undefined,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 20,
          },
        }
      : {};

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          responsiveButtonVariants({
            variant,
            size,
            fullWidth,
            loading: isLoading,
          }),
          'relative overflow-hidden',
          className
        )}
        onClick={handleClick}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...motionProps}
        {...props}
      >
        {/* Loading state */}
        {isLoading && (
          <LoadingSpinner className="w-4 h-4 md:w-5 md:h-5" />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}

        {/* Content */}
        {isLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children && <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
        )}

        {/* Right icon */}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}

        {/* Ripple effects */}
        {showRipple &&
          ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
              }}
              onAnimationEnd={() => clearRipple(ripple.id)}
            />
          ))}
      </motion.button>
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

/* ============================================
   BUTTON GROUP
   ============================================ */

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack vertically on mobile */
  stackOnMobile?: boolean;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  /** Align buttons */
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const ResponsiveButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      stackOnMobile = true,
      gap = 'md',
      align = 'start',
      children,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6',
    };

    const alignClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      stretch: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          stackOnMobile ? 'flex-col sm:flex-row' : 'flex-row flex-wrap',
          gapClasses[gap],
          alignClasses[align],
          align === 'stretch' && '[&>*]:flex-1',
          stackOnMobile && '[&>*]:w-full sm:[&>*]:w-auto',
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveButtonGroup.displayName = 'ResponsiveButtonGroup';

/* ============================================
   ICON BUTTON
   ============================================ */

interface IconButtonProps extends Omit<ResponsiveButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  /** Accessible label */
  'aria-label': string;
}

const ResponsiveIconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => (
    <ResponsiveButton ref={ref} size={size} {...props}>
      {icon}
    </ResponsiveButton>
  )
);

ResponsiveIconButton.displayName = 'ResponsiveIconButton';

/* ============================================
   RIPPLE ANIMATION KEYFRAMES (add to CSS)
   ============================================ */

// Add this to your global CSS:
// @keyframes ripple {
//   to {
//     transform: scale(4);
//     opacity: 0;
//   }
// }
// .animate-ripple {
//   animation: ripple 0.6s linear;
// }

export {
  ResponsiveButton,
  ResponsiveButtonGroup,
  ResponsiveIconButton,
  responsiveButtonVariants,
};
