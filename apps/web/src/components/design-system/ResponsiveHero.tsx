/**
 * FIXIA RESPONSIVE HERO SECTION
 * World-class hero component with fluid typography and animations
 *
 * Features:
 * - Fluid typography scaling
 * - Full viewport height options
 * - Safe area support
 * - Animated backgrounds
 * - Multiple layout variants
 * - Reduced motion support
 */

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

/* ============================================
   HERO CONTAINER
   ============================================ */

const heroVariants = cva(
  [
    'relative w-full',
    'flex flex-col',
    'overflow-hidden',
  ].join(' '),
  {
    variants: {
      /** Height variant */
      height: {
        auto: 'min-h-auto',
        screen: 'min-h-screen',
        'screen-safe': 'min-h-[calc(100dvh-var(--header-height))]',
        half: 'min-h-[50vh]',
        'three-quarter': 'min-h-[75vh]',
      },
      /** Content alignment */
      align: {
        start: 'justify-start pt-12 sm:pt-16 md:pt-20',
        center: 'justify-center',
        end: 'justify-end pb-12 sm:pb-16 md:pb-20',
      },
      /** Text alignment */
      textAlign: {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end',
      },
    },
    defaultVariants: {
      height: 'screen-safe',
      align: 'center',
      textAlign: 'center',
    },
  }
);

export interface ResponsiveHeroProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof heroVariants> {
  children: React.ReactNode;
  /** Animated background orbs */
  withOrbs?: boolean;
  /** Gradient overlay */
  withGradient?: boolean;
  /** Grid pattern background */
  withGrid?: boolean;
  /** Custom background */
  backgroundElement?: React.ReactNode;
}

const ResponsiveHero = React.forwardRef<HTMLElement, ResponsiveHeroProps>(
  (
    {
      className,
      height,
      align,
      textAlign,
      children,
      withOrbs = true,
      withGradient = true,
      withGrid = false,
      backgroundElement,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <section
        ref={ref}
        className={cn(heroVariants({ height, align, textAlign }), className)}
        {...props}
      >
        {/* Background Effects */}
        {withGradient && <HeroGradientBackground />}
        {withOrbs && !shouldReduceMotion && <HeroOrbs />}
        {withGrid && <HeroGrid />}
        {backgroundElement}

        {/* Content */}
        <div
          className={cn(
            'relative z-10',
            'w-full max-w-7xl mx-auto',
            'px-4 sm:px-6 lg:px-8',
            'py-12 sm:py-16 md:py-20 lg:py-24',
            'pt-[calc(3rem+env(safe-area-inset-top))] sm:pt-[calc(4rem+env(safe-area-inset-top))]',
          )}
        >
          {children}
        </div>
      </section>
    );
  }
);

ResponsiveHero.displayName = 'ResponsiveHero';

/* ============================================
   HERO TITLE
   ============================================ */

interface HeroTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level */
  as?: 'h1' | 'h2' | 'h3';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Gradient text effect */
  gradient?: boolean;
  /** Animate on mount */
  animate?: boolean;
}

const titleSizes = {
  sm: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  md: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  lg: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  xl: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
};

const HeroTitle = React.forwardRef<HTMLHeadingElement, HeroTitleProps>(
  (
    {
      className,
      as: Component = 'h1',
      size = 'lg',
      gradient = false,
      animate = true,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const shouldAnimate = animate && !shouldReduceMotion;

    const titleVariants: Variants = {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    const content = (
      <Component
        ref={ref}
        className={cn(
          titleSizes[size],
          'font-bold',
          'leading-[1.1] tracking-tight',
          gradient && [
            'bg-clip-text text-transparent',
            'bg-gradient-to-r from-foreground via-foreground/80 to-foreground',
            'dark:from-white dark:via-purple-200 dark:to-pink-200',
          ],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );

    if (shouldAnimate) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

HeroTitle.displayName = 'HeroTitle';

/* ============================================
   HERO SUBTITLE
   ============================================ */

interface HeroSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animate on mount */
  animate?: boolean;
  /** Animation delay */
  delay?: number;
}

const subtitleSizes = {
  sm: 'text-base sm:text-lg',
  md: 'text-lg sm:text-xl md:text-2xl',
  lg: 'text-xl sm:text-2xl md:text-3xl',
};

const HeroSubtitle = React.forwardRef<HTMLParagraphElement, HeroSubtitleProps>(
  (
    {
      className,
      size = 'md',
      animate = true,
      delay = 0.15,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const shouldAnimate = animate && !shouldReduceMotion;

    const subtitleVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    const content = (
      <p
        ref={ref}
        className={cn(
          subtitleSizes[size],
          'text-muted-foreground',
          'leading-relaxed',
          'max-w-3xl',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );

    if (shouldAnimate) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={subtitleVariants}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

HeroSubtitle.displayName = 'HeroSubtitle';

/* ============================================
   HERO ACTIONS
   ============================================ */

interface HeroActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animate on mount */
  animate?: boolean;
  /** Animation delay */
  delay?: number;
  /** Stack on mobile */
  stackOnMobile?: boolean;
}

const HeroActions = React.forwardRef<HTMLDivElement, HeroActionsProps>(
  (
    {
      className,
      animate = true,
      delay = 0.3,
      stackOnMobile = true,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const shouldAnimate = animate && !shouldReduceMotion;

    const actionsVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 sm:gap-4',
          stackOnMobile ? 'flex-col sm:flex-row' : 'flex-row flex-wrap',
          stackOnMobile && 'w-full sm:w-auto',
          stackOnMobile && '[&>*]:w-full sm:[&>*]:w-auto',
          'mt-6 sm:mt-8 md:mt-10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    if (shouldAnimate) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={actionsVariants}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

HeroActions.displayName = 'HeroActions';

/* ============================================
   HERO BADGE (Above title)
   ============================================ */

interface HeroBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon */
  icon?: React.ReactNode;
  /** Animate on mount */
  animate?: boolean;
}

const HeroBadge = React.forwardRef<HTMLDivElement, HeroBadgeProps>(
  ({ className, icon, animate = true, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const shouldAnimate = animate && !shouldReduceMotion;

    const badgeVariants: Variants = {
      hidden: { opacity: 0, y: -10, scale: 0.9 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2',
          'px-3 py-1.5 sm:px-4 sm:py-2',
          'text-xs sm:text-sm font-medium',
          'rounded-full',
          'glass border border-white/20',
          'text-foreground/90',
          'mb-4 sm:mb-6',
          className
        )}
        {...props}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </div>
    );

    if (shouldAnimate) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={badgeVariants}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

HeroBadge.displayName = 'HeroBadge';

/* ============================================
   HERO GRADIENT BACKGROUND
   ============================================ */

const HeroGradientBackground: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'absolute inset-0 z-0',
      'bg-gradient-to-b from-background via-background to-background',
      className
    )}
    aria-hidden="true"
  >
    {/* Primary gradient blob */}
    <div
      className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
    {/* Secondary gradient blob */}
    <div
      className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
  </div>
);

/* ============================================
   HERO ANIMATED ORBS
   ============================================ */

const HeroOrbs: React.FC<{ className?: string }> = ({ className }) => {
  const orbs = [
    { size: 300, x: '10%', y: '20%', color: 'rgba(168, 85, 247, 0.15)', duration: 20 },
    { size: 200, x: '70%', y: '30%', color: 'rgba(236, 72, 153, 0.15)', duration: 25 },
    { size: 250, x: '30%', y: '70%', color: 'rgba(99, 102, 241, 0.15)', duration: 22 },
    { size: 150, x: '80%', y: '80%', color: 'rgba(168, 85, 247, 0.1)', duration: 18 },
  ];

  return (
    <div className={cn('absolute inset-0 z-0 overflow-hidden', className)} aria-hidden="true">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ============================================
   HERO GRID PATTERN
   ============================================ */

const HeroGrid: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'absolute inset-0 z-0',
      'opacity-[0.02] dark:opacity-[0.03]',
      className
    )}
    aria-hidden="true"
    style={{
      backgroundImage: `
        linear-gradient(to right, currentColor 1px, transparent 1px),
        linear-gradient(to bottom, currentColor 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }}
  />
);

/* ============================================
   HERO CONTENT WRAPPER (For split layouts)
   ============================================ */

interface HeroContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

const HeroContent = React.forwardRef<HTMLDivElement, HeroContentProps>(
  ({ className, maxWidth = 'lg', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col', maxWidthClasses[maxWidth], className)}
      {...props}
    >
      {children}
    </div>
  )
);

HeroContent.displayName = 'HeroContent';

/* ============================================
   HERO MEDIA (For image/video)
   ============================================ */

interface HeroMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animate on mount */
  animate?: boolean;
}

const HeroMedia = React.forwardRef<HTMLDivElement, HeroMediaProps>(
  ({ className, animate = true, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const shouldAnimate = animate && !shouldReduceMotion;

    const mediaVariants: Variants = {
      hidden: { opacity: 0, scale: 0.95, y: 40 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay: 0.4,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          'relative',
          'mt-8 sm:mt-12 md:mt-16',
          'rounded-xl sm:rounded-2xl overflow-hidden',
          'shadow-2xl',
          'border border-white/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    if (shouldAnimate) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={mediaVariants}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

HeroMedia.displayName = 'HeroMedia';

export {
  ResponsiveHero,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroBadge,
  HeroContent,
  HeroMedia,
  HeroGradientBackground,
  HeroOrbs,
  HeroGrid,
  heroVariants,
};
