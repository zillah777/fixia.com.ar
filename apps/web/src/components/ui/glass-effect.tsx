import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

type GlassIntensity = 'light' | 'medium' | 'strong' | 'ultra';
type GlassColor = 'primary' | 'secondary' | 'accent' | 'neutral';

interface GlassEffectProps {
  children: ReactNode;
  className?: string;
  intensity?: GlassIntensity;
  color?: GlassColor;
  animated?: boolean;
  interactive?: boolean;
  glow?: boolean;
}

/**
 * GlassEffect Component
 *
 * Premium glass morphism effect with multiple intensity levels,
 * color variants, and interactive enhancements.
 *
 * @example
 * ```tsx
 * <GlassEffect intensity="strong" color="primary" glow>
 *   Content here
 * </GlassEffect>
 * ```
 */
const GlassEffect = React.forwardRef<HTMLDivElement, GlassEffectProps>(
  ({
    children,
    className,
    intensity = 'medium',
    color = 'neutral',
    animated = false,
    interactive = false,
    glow = false,
  }, ref) => {
    const getIntensityStyles = (): string => {
      switch (intensity) {
        case 'light':
          return 'backdrop-blur-sm bg-white/5 border border-white/10';
        case 'medium':
          return 'backdrop-blur-md bg-white/10 border border-white/20';
        case 'strong':
          return 'backdrop-blur-xl bg-white/15 border border-white/30';
        case 'ultra':
          return 'backdrop-blur-2xl bg-white/20 border border-white/40';
        default:
          return 'backdrop-blur-md bg-white/10 border border-white/20';
      }
    };

    const getColorStyles = (): string => {
      switch (color) {
        case 'primary':
          return 'shadow-lg shadow-primary/20';
        case 'secondary':
          return 'shadow-lg shadow-secondary/20';
        case 'accent':
          return 'shadow-lg shadow-accent/20';
        case 'neutral':
          return 'shadow-lg shadow-black/20';
        default:
          return 'shadow-lg shadow-black/20';
      }
    };

    const baseClasses = cn(
      'rounded-2xl transition-all duration-300',
      'supports-[backdrop-filter]:bg-white/10',
      'supports-[backdrop-filter]:backdrop-blur-lg',
      getIntensityStyles(),
      getColorStyles(),
      glow && 'ring-1 ring-white/50',
      interactive && 'hover:backdrop-blur-2xl hover:bg-white/20 hover:border-white/40',
      interactive && 'cursor-pointer transition-all duration-300',
      className
    );

    const content = (
      <div ref={ref} className={baseClasses}>
        {children}
      </div>
    );

    if (!animated) {
      return content;
    }

    return (
      <motion.div
        className={baseClasses}
        ref={ref}
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
        whileHover={interactive ? {
          backdropFilter: 'blur(24px)',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        } : {}}
        transition={{
          duration: 0.4,
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    );
  }
);

GlassEffect.displayName = 'GlassEffect';

export { GlassEffect };
