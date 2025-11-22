import React from 'react';
import { motion } from 'motion/react';

interface AnimatedOrbesProps {
  count?: number;
  colors?: string[];
  blur?: boolean;
}

/**
 * AnimatedOrbes Component
 *
 * Creates stunning animated orb effects in the background.
 * Perfect for hero sections, landing pages, and premium UIs.
 *
 * @example
 * ```tsx
 * <div className="relative w-full h-screen bg-background overflow-hidden">
 *   <AnimatedOrbes count={4} blur />
 *   <div className="relative z-10">Your content</div>
 * </div>
 * ```
 */
const AnimatedOrbes: React.FC<AnimatedOrbesProps> = ({
  count = 5,
  colors = [
    'rgba(168, 85, 247, 0.15)',  // Purple
    'rgba(236, 72, 153, 0.15)',  // Pink
    'rgba(59, 130, 246, 0.15)',  // Blue
    'rgba(14, 165, 233, 0.15)',  // Sky
    'rgba(124, 58, 255, 0.15)',  // Violet
  ],
  blur = true,
}) => {
  const orbes = Array.from({ length: count }).map((_, i) => ({
    id: i,
    color: colors[i % colors.length],
    delay: i * 2,
    duration: 8 + i * 2,
    size: 300 + i * 100,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    endX: Math.random() * 100,
    endY: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Ambient blur backdrop for enhanced effect */}
      {blur && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/50 to-background/80" />
      )}

      {/* Animated orbes */}
      {orbes.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full mix-blend-screen filter"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: `${orb.startX}%`,
            top: `${orb.startY}%`,
            transform: 'translate(-50%, -50%)',
            filter: blur ? 'blur(80px)' : 'blur(40px)',
          }}
          animate={{
            x: [(orb.endX - orb.startX) * 10, (orb.startX - orb.endX) * 10],
            y: [(orb.endY - orb.startY) * 10, (orb.startY - orb.endY) * 10],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Additional subtle moving glow */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Corner accent glow */}
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

AnimatedOrbes.displayName = 'AnimatedOrbes';

export { AnimatedOrbes };
