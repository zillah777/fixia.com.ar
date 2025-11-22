import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CursorTrail {
  id: number;
  x: number;
  y: number;
  scale: number;
}

/**
 * InteractiveCursorTrail Component
 *
 * Creates an engaging, addictive cursor trail effect that makes
 * every interaction feel more playful and modern.
 *
 * Perfect for making the app feel interactive and alive!
 */
const InteractiveCursorTrail: React.FC<{
  color?: string;
  particleSize?: number;
  trailLength?: number;
  enabled?: boolean;
}> = ({
  color = 'rgba(168, 85, 247, 0.8)',
  particleSize = 8,
  trailLength = 15,
  enabled = true,
}) => {
  const [trails, setTrails] = React.useState<CursorTrail[]>([]);
  const idRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      // Only create particle every 10ms for performance
      if (now - lastTimeRef.current < 10) return;

      lastTimeRef.current = now;

      const newTrail: CursorTrail = {
        id: idRef.current++,
        x: e.clientX,
        y: e.clientY,
        scale: 1,
      };

      setTrails((prev) => [...prev, newTrail].slice(-trailLength));
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, trailLength]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {trails.map((trail, index) => (
          <motion.div
            key={trail.id}
            initial={{
              x: trail.x,
              y: trail.y,
              scale: 1,
              opacity: 0.8,
            }}
            animate={{
              x: trail.x,
              y: trail.y,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            onAnimationComplete={() => {
              setTrails((prev) =>
                prev.filter((t) => t.id !== trail.id)
              );
            }}
            className="absolute pointer-events-none"
            style={{
              width: particleSize,
              height: particleSize,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${particleSize}px ${color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

InteractiveCursorTrail.displayName = 'InteractiveCursorTrail';

export { InteractiveCursorTrail };
