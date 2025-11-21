import { useMemo } from 'react';
import type { Variants } from 'framer-motion';

/**
 * Standard animation variants for consistent motion design
 */
export const useAnimations = () => {
  const animations = useMemo(() => ({
    // Fade animations
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },

    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    },

    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    },

    // Scale animations
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2, ease: 'easeOut' }
    },

    // Slide animations
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    },

    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    },

    // Stagger children animations
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },

    staggerItem: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    }
  }), []);

  return animations;
};

/**
 * Framer Motion variants for common UI patterns
 */
export const motionVariants: Record<string, Variants> = {
  // Modal/Dialog
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.15, ease: 'easeIn' }
    }
  },

  // Overlay/Backdrop
  overlay: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 }
    }
  },

  // Card hover
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  },

  // List items
  listItem: {
    hidden: { opacity: 0, x: -10 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: 'easeOut'
      }
    })
  },

  // Notification/Toast
  notification: {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  },

  // Page transitions
  page: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },

  // Spring bounce - realistic physics animation
  springBounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  },

  // Fast stagger for large lists
  staggerFast: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05
      }
    }
  },

  // Morph scale - smooth transformation for modals
  morphScale: {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeIn' }
    }
  },

  // Slide with spring
  slideSpring: {
    initial: { opacity: 0, x: -30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: 30,
      transition: { duration: 0.2 }
    }
  },

  // Glow effect for interactive elements
  glow: {
    rest: {
      boxShadow: '0 0 0 rgba(102, 126, 234, 0)'
    },
    hover: {
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
      transition: { duration: 0.3 }
    }
  }
};

/**
 * Standard transition durations in milliseconds
 */
export const transitionDurations = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500
} as const;

/**
 * Standard easing functions
 */
export const easingFunctions = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
} as const;
