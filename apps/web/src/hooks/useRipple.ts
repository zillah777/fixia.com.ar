import { useCallback, useState, MouseEvent } from 'react';

interface RippleEffect {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface UseRippleReturn {
  ripples: RippleEffect[];
  createRipple: (event: MouseEvent<HTMLElement>) => void;
  clearRipple: (id: number) => void;
}

/**
 * Modern ripple effect hook for Material Design 3 style interactions
 * Uses only React 18 hooks and CSS animations (GPU accelerated)
 * 
 * @example
 * ```tsx
 * const { ripples, createRipple, clearRipple } = useRipple();
 * 
 * <button onClick={createRipple} className="ripple-container">
 *   Click me
 *   {ripples.map(ripple => (
 *     <span
 *       key={ripple.id}
 *       className="ripple"
 *       style={{
 *         left: ripple.x,
 *         top: ripple.y,
 *         width: ripple.size,
 *         height: ripple.size,
 *       }}
 *       onAnimationEnd={() => clearRipple(ripple.id)}
 *     />
 *   ))}
 * </button>
 * ```
 */
export const useRipple = (): UseRippleReturn => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  const createRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate ripple position relative to button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate ripple size (diameter should cover the entire button)
    const size = Math.max(rect.width, rect.height) * 2;
    
    const newRipple: RippleEffect = {
      x: x - size / 2,
      y: y - size / 2,
      size,
      id: Date.now() + Math.random(), // Unique ID
    };

    setRipples(prev => [...prev, newRipple]);
  }, []);

  const clearRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  }, []);

  return { ripples, createRipple, clearRipple };
};
