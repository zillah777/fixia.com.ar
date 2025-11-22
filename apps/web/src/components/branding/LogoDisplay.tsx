import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';

interface LogoDisplayProps {
  logoSrc: string;
  logoAlt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glow' | 'neon' | 'glass' | 'elevated';
  animated?: boolean;
  withBackground?: boolean;
  onHover?: boolean;
  className?: string;
}

/**
 * LogoDisplay Component
 *
 * High-impact logo display with multiple premium visual effects.
 * Makes the brand stand out with beautiful animations and glows.
 *
 * @example
 * ```tsx
 * <LogoDisplay
 *   logoSrc="/logo.png"
 *   size="lg"
 *   variant="neon"
 *   animated
 *   withBackground
 * />
 * ```
 */
const LogoDisplay = React.forwardRef<HTMLDivElement, LogoDisplayProps>(
  ({
    logoSrc,
    logoAlt = 'Logo',
    size = 'md',
    variant = 'glow',
    animated = true,
    withBackground = true,
    onHover = true,
    className,
  }, ref) => {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
      xl: 'w-48 h-48',
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'glow':
          return 'shadow-lg shadow-primary/50 hover:shadow-primary/80';
        case 'neon':
          return 'shadow-lg shadow-primary/80 glow-primary';
        case 'glass':
          return 'backdrop-blur-md bg-white/10 border border-white/20 shadow-lg shadow-primary/30';
        case 'elevated':
          return 'shadow-2xl shadow-black/40 hover:shadow-2xl hover:shadow-primary/60';
        case 'default':
        default:
          return 'shadow-md';
      }
    };

    const content = (
      <motion.div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-2xl',
          sizeClasses[size],
          getVariantClasses(),
          'transition-all duration-300',
          onHover && 'hover:scale-105',
          className
        )}
        animate={animated ? {
          scale: [1, 1.02, 1],
          y: [0, -4, 0],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={onHover && animated ? {
          scale: 1.15,
          y: -8,
        } : {}}
      >
        {/* Background glow layer */}
        {withBackground && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Logo image with glow */}
        <motion.img
          src={logoSrc}
          alt={logoAlt}
          className="relative z-10 w-full h-full object-contain drop-shadow-lg"
          animate={animated ? {
            filter: [
              'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
              'drop-shadow(0 0 16px rgba(168, 85, 247, 0.8))',
              'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
            ],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Neon border effect */}
        {variant === 'neon' && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.4) inset',
                '0 0 40px rgba(168, 85, 247, 0.8) inset',
                '0 0 20px rgba(168, 85, 247, 0.4) inset',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Rotating glow background */}
        {variant === 'glow' && (
          <motion.div
            className="absolute inset-0 rounded-2xl -z-10 blur-xl opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6), transparent)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
    );

    return content;
  }
);

LogoDisplay.displayName = 'LogoDisplay';

export { LogoDisplay };
