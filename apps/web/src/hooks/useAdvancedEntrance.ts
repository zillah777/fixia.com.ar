import { useEffect, useState, useCallback } from 'react';

type EntranceType = 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'rotateIn' | 'flip';

interface EntranceOptions {
  delay?: number;
  duration?: number;
  type?: EntranceType;
  stagger?: number;
  triggerOnce?: boolean;
}

/**
 * Hook for advanced entrance animations
 * Provides multiple animation types with easy configuration
 *
 * @example
 * ```tsx
 * const variants = useAdvancedEntrance({ type: 'fadeUp', delay: 0.2 });
 *
 * <motion.div variants={variants.container} initial="hidden" animate="visible">
 *   {items.map((item, i) => (
 *     <motion.div key={i} variants={variants.item} />
 *   ))}
 * </motion.div>
 * ```
 */
export function useAdvancedEntrance(options: EntranceOptions = {}) {
  const {
    delay = 0,
    duration = 0.6,
    type = 'fadeUp',
    stagger = 0.1,
    triggerOnce = true,
  } = options;

  const getInitialState = useCallback(() => {
    switch (type) {
      case 'fadeUp':
        return { opacity: 0, y: 20 };
      case 'fadeDown':
        return { opacity: 0, y: -20 };
      case 'slideLeft':
        return { opacity: 0, x: -30 };
      case 'slideRight':
        return { opacity: 0, x: 30 };
      case 'zoomIn':
        return { opacity: 0, scale: 0.8 };
      case 'rotateIn':
        return { opacity: 0, rotate: -10, scale: 0.9 };
      case 'flip':
        return { opacity: 0, rotateY: 90 };
      default:
        return { opacity: 0 };
    }
  }, [type]);

  const getAnimateState = useCallback(() => {
    switch (type) {
      case 'fadeUp':
      case 'fadeDown':
      case 'slideLeft':
      case 'slideRight':
      case 'zoomIn':
      case 'rotateIn':
      case 'flip':
        return { opacity: 1, ...Object.fromEntries(
          Object.entries(getInitialState()).filter(([key]) => key !== 'opacity').map(([key, value]) => [key, 0 || value === 'opacity' ? 0 : value === true ? 360 : typeof value === 'number' ? 0 : value])
        )};
      default:
        return { opacity: 1 };
    }
  }, [type, getInitialState]);

  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          delayChildren: delay,
        },
      },
    },
    item: {
      hidden: getInitialState(),
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        rotateY: 0,
        transition: {
          duration,
          type: 'spring',
          stiffness: 100,
          damping: 15,
        },
      },
    },
  };
}
