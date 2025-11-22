import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useCardParallax } from '../../hooks/useCardParallax';
import { cn } from '../ui/utils';

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  parallax?: boolean;
  intensity?: number;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'dark';
}

/**
 * EnhancedCard Component
 *
 * High-impact card component with parallax effects, advanced hover states,
 * and smooth animations. Perfect for marketplace listings.
 *
 * @example
 * ```tsx
 * <EnhancedCard parallax hoverable variant="glass">
 *   <CardContent />
 * </EnhancedCard>
 * ```
 */
const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({
    children,
    className,
    hoverable = true,
    parallax = false,
    intensity = 0.3,
    onClick,
    variant = 'default',
  }, ref) => {
    const { ref: parallaxRef, style: parallaxStyle } = useCardParallax({
      intensity,
      enableHover: parallax,
    });

    const variantClasses = {
      default: 'bg-background border border-white/10 backdrop-blur-sm',
      glass: 'bg-white/5 border border-white/20 backdrop-blur-md',
      gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10',
      dark: 'bg-slate-900/50 border border-white/5 backdrop-blur-sm',
    };

    const baseClasses = cn(
      'rounded-2xl p-6 transition-all duration-300',
      hoverable && 'cursor-pointer hover:border-white/30',
      variantClasses[variant],
      className
    );

    const content = (
      <motion.div
        ref={parallax ? parallaxRef : ref}
        className={baseClasses}
        style={parallax ? parallaxStyle : {}}
        whileHover={hoverable ? {
          scale: 1.02,
          y: -4,
        } : {}}
        whileTap={hoverable ? {
          scale: 0.98,
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );

    return parallax ? content : React.cloneElement(content, { ref });
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard };
