import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

type BadgeVariant = 'default' | 'outline' | 'glass' | 'gradient' | 'neon' | 'pulse';
type BadgeColor = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface PremiumBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  animated?: boolean;
  glow?: boolean;
  icon?: ReactNode;
  className?: string;
}

/**
 * PremiumBadge Component
 *
 * Stunning badge component with multiple variants and animations.
 * Perfect for status indicators, tags, and labels.
 *
 * @example
 * ```tsx
 * <PremiumBadge variant="neon" color="primary" glow animated>
 *   Featured
 * </PremiumBadge>
 *
 * <PremiumBadge variant="pulse" color="success">
 *   Available Now
 * </PremiumBadge>
 * ```
 */
const PremiumBadge = React.forwardRef<HTMLDivElement, PremiumBadgeProps>(
  ({
    children,
    variant = 'default',
    color = 'primary',
    size = 'md',
    animated = true,
    glow = true,
    icon,
    className,
  }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const getColorClasses = () => {
      const baseColors = {
        primary: 'text-primary border-primary/50 bg-primary/10 shadow-primary/30',
        accent: 'text-accent border-accent/50 bg-accent/10 shadow-accent/30',
        success: 'text-green-400 border-green-500/50 bg-green-500/10 shadow-green-500/30',
        warning: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10 shadow-yellow-500/30',
        danger: 'text-red-400 border-red-500/50 bg-red-500/10 shadow-red-500/30',
        info: 'text-blue-400 border-blue-500/50 bg-blue-500/10 shadow-blue-500/30',
      };
      return baseColors[color];
    };

    const getVariantClasses = () => {
      const variants = {
        default: 'border bg-white/5 backdrop-blur-sm',
        outline: 'border-2 bg-transparent',
        glass: 'border border-white/20 bg-white/10 backdrop-blur-lg',
        gradient: 'border border-transparent bg-gradient-to-r from-primary/20 to-accent/20',
        neon: 'border-2 border-current bg-current/5 shadow-lg',
        pulse: 'border border-current bg-current/5 shadow-lg',
      };
      return variants[variant];
    };

    const baseClasses = cn(
      'inline-flex items-center gap-2',
      'rounded-full font-semibold',
      'transition-all duration-300',
      'whitespace-nowrap',
      sizeClasses[size],
      getColorClasses(),
      getVariantClasses(),
      glow && 'shadow-lg',
      className
    );

    const content = (
      <div ref={ref} className={baseClasses}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    );

    if (!animated) {
      return content;
    }

    // Animate based on variant
    if (variant === 'pulse') {
      return (
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.3)',
              '0 0 40px rgba(168, 85, 247, 0.6)',
              '0 0 20px rgba(168, 85, 247, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={baseClasses}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </motion.div>
      );
    }

    if (variant === 'neon') {
      return (
        <motion.div
          animate={{
            textShadow: [
              '0 0 10px currentColor',
              '0 0 20px currentColor',
              '0 0 10px currentColor',
            ],
            boxShadow: [
              '0 0 20px currentColor',
              '0 0 40px currentColor',
              '0 0 20px currentColor',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={baseClasses}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </motion.div>
      );
    }

    // Default entrance animation
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          scale: 1.05,
          y: -2,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        className={baseClasses}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </motion.div>
    );
  }
);

PremiumBadge.displayName = 'PremiumBadge';

export { PremiumBadge };
