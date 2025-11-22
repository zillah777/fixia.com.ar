/**
 * Global Visual Configuration - FASE 3
 *
 * This configuration ensures that all visual enhancements are applied
 * consistently throughout the entire application.
 */

export const visualConfig = {
  // Color Palette
  colors: {
    primary: '#a855f7',      // Purple
    accent: '#ec4899',       // Pink
    success: '#22c55e',      // Green
    warning: '#f59e0b',      // Amber
    danger: '#ef4444',       // Red
    info: '#3b82f6',         // Blue
    indigo: '#6366f1',       // Indigo
  },

  // Animation Defaults
  animations: {
    defaultDuration: 0.6,
    defaultEase: 'easeInOut',
    springConfig: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
    scrollDuration: 0.3,
  },

  // Effects Configuration
  effects: {
    blur: {
      soft: 'blur(4px)',
      medium: 'blur(8px)',
      strong: 'blur(16px)',
      ultra: 'blur(24px)',
    },
    glow: {
      primary: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.2)',
      accent: '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(236, 72, 153, 0.2)',
      success: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.2)',
      danger: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.2)',
    },
    glass: {
      light: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      medium: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      strong: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      },
    },
  },

  // Component Defaults
  components: {
    button: {
      glowOnHover: true,
      pressScale: 0.95,
      hoverScale: 1.05,
      roundedClass: 'rounded-xl',
    },
    card: {
      roundedClass: 'rounded-2xl',
      shadowDefault: 'shadow-lg',
      glassEffectDefault: 'glass-medium',
    },
    input: {
      roundedClass: 'rounded-lg',
      glassEffect: true,
    },
    badge: {
      roundedClass: 'rounded-full',
      defaultVariant: 'default',
      animatedDefault: true,
    },
  },

  // Cursor Trail Config
  cursorTrail: {
    enabled: true,
    color: 'rgba(168, 85, 247, 0.8)',
    particleSize: 8,
    trailLength: 15,
    throttle: 10, // ms
  },

  // Background Effects Config
  backgroundEffects: {
    orbes: {
      enabled: true,
      count: 5,
      blur: true,
    },
    particles: {
      enabled: true,
      count: 20,
      speed: 'slow',
    },
    neuro: {
      enabled: false, // Optional, can be enabled per page
      nodeCount: 15,
      intensity: 0.6,
    },
  },

  // Page Transitions
  pageTransitions: {
    enabled: true,
    defaultType: 'slideUp',
    duration: 0.6,
  },

  // Navbar Config
  navbar: {
    sticky: true,
    variant: 'glass',
    withBorder: true,
    logoSize: 'sm',
    logoVariant: 'glow',
  },

  // Footer Config
  footer: {
    variant: 'glass',
    withBorder: true,
  },

  // Overall Theme
  theme: {
    isDarkMode: true,
    roundingScale: 'high', // 'low', 'medium', 'high'
    effectIntensity: 'high', // 'low', 'medium', 'high'
    animationSpeed: 'normal', // 'slow', 'normal', 'fast'
  },

  // Responsive
  responsive: {
    mobileBreakpoint: 640,  // sm
    tabletBreakpoint: 1024, // lg
    desktopBreakpoint: 1536, // 2xl
  },

  // Performance
  performance: {
    reduceMotionRespected: true,
    lazyLoadImages: true,
    optimizeAnimations: true,
  },
};

// Export type for TypeScript
export type VisualConfig = typeof visualConfig;

// Helper functions for consistent styling
export const getColorClass = (color: keyof typeof visualConfig.colors) => {
  return visualConfig.colors[color];
};

export const getGlowClass = (type: 'primary' | 'accent' | 'success' | 'danger') => {
  return `glow-${type}`;
};

export const getGlassClass = (intensity: 'light' | 'medium' | 'strong') => {
  return `glass-${intensity}`;
};

export const getAnimationConfig = () => {
  const config = visualConfig.animations;
  return {
    duration: config.defaultDuration,
    ease: config.defaultEase,
    transition: config.springConfig,
  };
};

// Theme provider context value
export const defaultThemeContextValue = {
  config: visualConfig,
  toggleDarkMode: () => {},
  updateEffectIntensity: (intensity: 'low' | 'medium' | 'high') => {},
  updateAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => {},
};
