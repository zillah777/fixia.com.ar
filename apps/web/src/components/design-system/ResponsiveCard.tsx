/**
 * FIXIA RESPONSIVE CARD COMPONENT
 * World-class responsive card with pixel-perfect scaling
 *
 * Features:
 * - Mobile-first responsive design
 * - Glass morphism variants
 * - Fluid spacing and typography
 * - Touch-optimized interactions
 * - WCAG AA accessible
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../ui/utils';

const responsiveCardVariants = cva(
  [
    // Base styles
    'relative flex flex-col overflow-hidden',
    // Responsive padding using CSS custom properties
    'p-3 sm:p-4 md:p-5 lg:p-6',
    // Responsive gap
    'gap-3 sm:gap-4 md:gap-5',
    // Responsive border radius
    'rounded-xl sm:rounded-2xl',
    // Base shadow
    'shadow-md sm:shadow-lg',
    // Border
    'border border-white/10',
    // Transition
    'transition-all duration-200',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'glass',
        glass: 'glass backdrop-blur-lg',
        'glass-medium': 'glass-medium backdrop-blur-xl',
        'glass-strong': 'glass-strong backdrop-blur-2xl',
        solid: 'bg-card',
        interactive: [
          'glass cursor-pointer',
          // Touch states - larger active area on mobile
          'active:scale-[0.98] sm:active:scale-[0.99]',
          // Hover only on non-touch devices
          '@media(hover:hover){hover:border-white/20 hover:shadow-xl}',
        ].join(' '),
        elevated: 'glass-medium shadow-xl sm:shadow-2xl',
        glow: 'glass border-white/20 glow-border',
      },
      size: {
        sm: 'p-2 sm:p-3 md:p-4 gap-2 sm:gap-3',
        md: 'p-3 sm:p-4 md:p-5 lg:p-6 gap-3 sm:gap-4 md:gap-5',
        lg: 'p-4 sm:p-5 md:p-6 lg:p-8 gap-4 sm:gap-5 md:gap-6',
        xl: 'p-5 sm:p-6 md:p-8 lg:p-10 gap-5 sm:gap-6 md:gap-8',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: true,
    },
  }
);

export interface ResponsiveCardProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    VariantProps<typeof responsiveCardVariants> {
  children: React.ReactNode;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Enable hover lift effect (desktop only) */
  hoverLift?: boolean;
  /** Custom press scale */
  pressScale?: number;
  /** Add glow on hover */
  glowOnHover?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

const ResponsiveCard = React.forwardRef<HTMLDivElement, ResponsiveCardProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      children,
      disableAnimation = false,
      hoverLift = false,
      pressScale = 0.98,
      glowOnHover = false,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    // Check for reduced motion preference
    const prefersReducedMotion = React.useMemo(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    const shouldAnimate = !disableAnimation && !prefersReducedMotion;

    const motionProps = shouldAnimate
      ? {
          whileHover: hoverLift
            ? {
                y: -4,
                boxShadow: glowOnHover
                  ? '0 0 20px rgba(168, 85, 247, 0.4), 0 20px 40px rgba(0, 0, 0, 0.2)'
                  : '0 20px 40px rgba(0, 0, 0, 0.15)',
              }
            : undefined,
          whileTap: variant === 'interactive' ? { scale: pressScale } : undefined,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
          },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(responsiveCardVariants({ variant, size, fullWidth }), className)}
        role={variant === 'interactive' ? 'button' : undefined}
        tabIndex={variant === 'interactive' ? 0 : undefined}
        aria-label={ariaLabel}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

ResponsiveCard.displayName = 'ResponsiveCard';

/* ============================================
   CARD HEADER
   ============================================ */

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add border below header */
  withBorder?: boolean;
}

const ResponsiveCardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-1 sm:gap-1.5',
        withBorder && 'pb-3 sm:pb-4 border-b border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveCardHeader.displayName = 'ResponsiveCardHeader';

/* ============================================
   CARD TITLE
   ============================================ */

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const ResponsiveCardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm sm:text-base font-medium',
      md: 'text-base sm:text-lg md:text-xl font-semibold',
      lg: 'text-lg sm:text-xl md:text-2xl font-bold',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size],
          'leading-tight tracking-tight text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveCardTitle.displayName = 'ResponsiveCardTitle';

/* ============================================
   CARD DESCRIPTION
   ============================================ */

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Limit lines (truncate) */
  lineClamp?: 1 | 2 | 3 | 4;
}

const ResponsiveCardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, lineClamp, children, ...props }, ref) => {
    const lineClampClasses = {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
    };

    return (
      <p
        ref={ref}
        className={cn(
          'text-xs sm:text-sm text-muted-foreground leading-relaxed',
          lineClamp && lineClampClasses[lineClamp],
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

ResponsiveCardDescription.displayName = 'ResponsiveCardDescription';

/* ============================================
   CARD CONTENT
   ============================================ */

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add top padding (when following header) */
  withTopPadding?: boolean;
}

const ResponsiveCardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, withTopPadding = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex-1',
        withTopPadding && 'pt-3 sm:pt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveCardContent.displayName = 'ResponsiveCardContent';

/* ============================================
   CARD FOOTER
   ============================================ */

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add border above footer */
  withBorder?: boolean;
  /** Stack buttons on mobile */
  stackOnMobile?: boolean;
}

const ResponsiveCardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withBorder = false, stackOnMobile = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 sm:gap-3',
        stackOnMobile ? 'flex-col sm:flex-row' : 'flex-row',
        withBorder && 'pt-3 sm:pt-4 border-t border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveCardFooter.displayName = 'ResponsiveCardFooter';

/* ============================================
   CARD ACTION
   ============================================ */

const ResponsiveCardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4', className)}
    {...props}
  >
    {children}
  </div>
));

ResponsiveCardAction.displayName = 'ResponsiveCardAction';

/* ============================================
   CARD IMAGE
   ============================================ */

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio */
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto';
  /** Fill entire card width (negative margin) */
  fullBleed?: boolean;
}

const ResponsiveCardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, aspectRatio = 'video', fullBleed = false, src, alt, ...props }, ref) => {
    const aspectRatioClasses = {
      video: 'aspect-video',
      square: 'aspect-square',
      portrait: 'aspect-[3/4]',
      wide: 'aspect-[21/9]',
      auto: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg sm:rounded-xl',
          aspectRatioClasses[aspectRatio],
          fullBleed && '-mx-3 -mt-3 sm:-mx-4 sm:-mt-4 md:-mx-5 md:-mt-5 lg:-mx-6 lg:-mt-6 rounded-none rounded-t-xl sm:rounded-t-2xl',
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          {...props}
        />
      </div>
    );
  }
);

ResponsiveCardImage.displayName = 'ResponsiveCardImage';

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
  ResponsiveCardFooter,
  ResponsiveCardAction,
  ResponsiveCardImage,
  responsiveCardVariants,
};
