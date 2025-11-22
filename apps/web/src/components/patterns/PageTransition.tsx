import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type TransitionType = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomFade' | 'blur';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  triggerOnce?: boolean;
}

/**
 * PageTransition Component
 *
 * High-impact page transition animations that make navigation feel premium.
 * Automatically applies based on navigation direction.
 *
 * @example
 * ```tsx
 * <PageTransition type="slideUp" duration={0.5}>
 *   <YourPage />
 * </PageTransition>
 * ```
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'slideUp',
  duration = 0.6,
  delay = 0,
  triggerOnce = true,
}) => {
  const getVariants = () => {
    switch (type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
        };
      case 'slideDown':
        return {
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 50 },
        };
      case 'slideLeft':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 },
        };
      case 'slideRight':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
        };
      case 'zoomFade':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
        };
      case 'blur':
        return {
          initial: { opacity: 0, filter: 'blur(10px)' },
          animate: { opacity: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, filter: 'blur(10px)' },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration,
          delay,
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

PageTransition.displayName = 'PageTransition';

export { PageTransition };
