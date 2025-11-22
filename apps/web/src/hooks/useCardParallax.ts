import { useRef, useEffect, useState, useCallback } from 'react';

interface ParallaxOptions {
  intensity?: number;
  enableHover?: boolean;
  enableScroll?: boolean;
}

/**
 * Hook for card parallax effects and 3D transforms
 * Creates engaging depth perception on card hover/scroll
 *
 * @example
 * ```tsx
 * const { ref, style } = useCardParallax({ intensity: 0.5 });
 *
 * <motion.div ref={ref} style={style}>
 *   Card content
 * </motion.div>
 * ```
 */
export function useCardParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) {
  const { intensity = 0.5, enableHover = true, enableScroll = true } = options;
  const ref = useRef<T>(null);
  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enableHover || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * intensity * 5;
    const rotateY = ((x - centerX) / centerX) * intensity * -5;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      boxShadow: `0 ${20 + intensity * 20}px ${32 + intensity * 20}px rgba(0, 0, 0, 0.2)`,
    });
  }, [enableHover, intensity]);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enableHover) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableHover, handleMouseMove, handleMouseLeave]);

  return { ref, style };
}
