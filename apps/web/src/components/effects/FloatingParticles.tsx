import React from 'react';
import { motion } from 'motion/react';

interface FloatingParticlesProps {
  count?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
  opacity?: number;
}

/**
 * FloatingParticles Component
 *
 * Creates subtle floating particle effects for premium visual depth.
 * Works great as background enhancement for hero sections.
 *
 * @example
 * ```tsx
 * <FloatingParticles count={30} color="rgba(168, 85, 247, 0.5)" speed="slow" />
 * ```
 */
const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  size = 'small',
  color = 'rgba(168, 85, 247, 0.6)',
  speed = 'normal',
  opacity = 0.5,
}) => {
  const sizeMap = {
    small: { width: 4, height: 4 },
    medium: { width: 8, height: 8 },
    large: { width: 12, height: 12 },
  };

  const speedMap = {
    slow: { duration: 20 },
    normal: { duration: 15 },
    fast: { duration: 10 },
  };

  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    delay: (i * 0.1) % 2,
    duration: speedMap[speed].duration + Math.random() * 5,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    endX: Math.random() * 100,
    endY: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: sizeMap[size].width,
            height: sizeMap[size].height,
            background: color,
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            opacity: opacity,
            boxShadow: `0 0 ${sizeMap[size].width * 2}px ${color}`,
          }}
          animate={{
            x: [0, (particle.endX - particle.startX) * 20],
            y: [0, Math.sin(particle.delay) * 100 - 50],
            opacity: [opacity * 0.3, opacity, opacity * 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

FloatingParticles.displayName = 'FloatingParticles';

export { FloatingParticles };
