import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

interface TickerItem {
  id: string | number;
  content: ReactNode;
  icon?: ReactNode;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
}

interface PremiumTickerProps {
  items: TickerItem[];
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  repeat?: number;
  className?: string;
  showGlow?: boolean;
  pauseOnHover?: boolean;
}

/**
 * PremiumTicker Component
 *
 * Stunning, smooth ticker/carousel with neon-like effects,
 * smooth animations, and premium visual feedback.
 *
 * Perfect for:
 * - Featured services
 * - Live activity feeds
 * - Customer testimonials
 * - Price updates
 * - Trending items
 *
 * @example
 * ```tsx
 * <PremiumTicker
 *   items={services}
 *   direction="left"
 *   speed="normal"
 *   showGlow
 * />
 * ```
 */
const PremiumTicker: React.FC<PremiumTickerProps> = ({
  items,
  direction = 'left',
  speed = 'normal',
  repeat = 2,
  className,
  showGlow = true,
  pauseOnHover = true,
}) => {
  const speedDuration = {
    slow: 30,
    normal: 20,
    fast: 15,
  };

  const directionVariant = {
    left: -100,
    right: 100,
  };

  const getColorGlow = (color?: string) => {
    switch (color) {
      case 'primary':
        return 'shadow-lg shadow-primary/40 hover:shadow-primary/60';
      case 'accent':
        return 'shadow-lg shadow-accent/40 hover:shadow-accent/60';
      case 'success':
        return 'shadow-lg shadow-green-500/40 hover:shadow-green-500/60';
      case 'warning':
        return 'shadow-lg shadow-yellow-500/40 hover:shadow-yellow-500/60';
      case 'danger':
        return 'shadow-lg shadow-red-500/40 hover:shadow-red-500/60';
      default:
        return 'shadow-lg shadow-primary/30 hover:shadow-primary/50';
    }
  };

  return (
    <div className={cn(
      'w-full overflow-hidden relative py-8',
      'bg-gradient-to-r from-background/50 via-background/20 to-background/50',
      className
    )}>
      {/* Gradient overlay edges for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Animated ticker container */}
      <motion.div
        className="flex gap-6 px-6"
        animate={{
          x: direction === 'left'
            ? [0, directionVariant.left * (items.length * repeat)]
            : [directionVariant.right * (items.length * repeat), 0],
        }}
        transition={{
          duration: speedDuration[speed],
          repeat: Infinity,
          ease: 'linear',
        }}
        onHoverStart={pauseOnHover ? (controls) => {
          controls.stop?.();
        } : undefined}
        onHoverEnd={pauseOnHover ? (controls) => {
          controls.start?.('animate');
        } : undefined}
      >
        {/* Render items multiple times for seamless loop */}
        {Array.from({ length: repeat }).map((_, repeatIndex) => (
          <div key={`repeat-${repeatIndex}`} className="flex gap-6">
            {items.map((item) => (
              <motion.div
                key={`${repeatIndex}-${item.id}`}
                className={cn(
                  'flex-shrink-0 min-w-[300px] md:min-w-[400px]',
                  'px-6 py-4 rounded-xl',
                  'border border-white/20',
                  'bg-gradient-to-br from-white/5 to-white/[0.02]',
                  'backdrop-blur-sm',
                  'flex items-center gap-4',
                  'transition-all duration-300',
                  'hover:border-white/40',
                  'hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5',
                  showGlow && getColorGlow(item.color),
                )}
                whileHover={{
                  scale: 1.05,
                  y: -4,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                {/* Icon */}
                {item.icon && (
                  <motion.div
                    className="flex-shrink-0 text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {item.icon}
                  </motion.div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {typeof item.content === 'string' ? (
                    <p className="text-sm md:text-base text-foreground truncate">
                      {item.content}
                    </p>
                  ) : (
                    item.content
                  )}
                </div>

                {/* Right accent line */}
                <motion.div
                  className="h-8 w-1 bg-gradient-to-b from-primary via-accent to-transparent rounded-full"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

PremiumTicker.displayName = 'PremiumTicker';

export { PremiumTicker };
export type { TickerItem };
