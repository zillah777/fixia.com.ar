/**
 * FIXIA ENTERPRISE DESIGN SYSTEM - TAILWIND CONFIGURATION
 * Version: 2.0.0
 *
 * This configuration extends Tailwind CSS with the Fixia design system tokens.
 * Import this in your tailwind.config.js/ts file.
 *
 * Usage:
 * import { fixiaDesignSystem } from './src/config/design-system.tailwind'
 *
 * export default {
 *   // ...
 *   theme: {
 *     extend: fixiaDesignSystem.theme.extend
 *   },
 *   plugins: [...fixiaDesignSystem.plugins]
 * }
 */

import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/* ============================================
   BREAKPOINTS
   ============================================ */

export const breakpoints = {
  xs: '320px',    // Small phones
  sm: '640px',    // Landscape phones, small tablets
  md: '768px',    // Tablets
  lg: '1024px',   // Small laptops, landscape tablets
  xl: '1280px',   // Desktops
  '2xl': '1536px', // Ultra-wide displays
} as const;

/* ============================================
   TYPOGRAPHY SCALE
   Using clamp() for fluid typography
   Scale Ratio: 1.125 (Major Second)
   ============================================ */

export const typography = {
  fontSize: {
    // Fluid typography using clamp()
    'fluid-xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }] as any,
    'fluid-sm': ['clamp(0.875rem, 0.85rem + 0.125vw, 0.9375rem)', { lineHeight: '1.5' }] as any,
    'fluid-base': ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.6' }] as any,
    'fluid-md': ['clamp(1.125rem, 1.075rem + 0.25vw, 1.25rem)', { lineHeight: '1.5' }] as any,
    'fluid-lg': ['clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)', { lineHeight: '1.4' }] as any,
    'fluid-xl': ['clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)', { lineHeight: '1.3' }] as any,
    'fluid-2xl': ['clamp(1.875rem, 1.7rem + 0.875vw, 2.25rem)', { lineHeight: '1.25' }] as any,
    'fluid-3xl': ['clamp(2.25rem, 1.95rem + 1.5vw, 3rem)', { lineHeight: '1.2' }] as any,
    'fluid-4xl': ['clamp(3rem, 2.6rem + 2vw, 3.75rem)', { lineHeight: '1.1' }] as any,
    'fluid-5xl': ['clamp(3.75rem, 3.25rem + 2.5vw, 4.5rem)', { lineHeight: '1.1' }] as any,
    'fluid-display': ['clamp(4.5rem, 3.75rem + 3.75vw, 6rem)', { lineHeight: '1' }] as any,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

/* ============================================
   SPACING SCALE (8px Base)
   ============================================ */

export const spacing = {
  // Extended spacing scale
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '1.5': '0.375rem',  // 6px
  '2': '0.5rem',      // 8px
  '2.5': '0.625rem',  // 10px
  '3': '0.75rem',     // 12px
  '3.5': '0.875rem',  // 14px
  '4': '1rem',        // 16px
  '5': '1.25rem',     // 20px
  '6': '1.5rem',      // 24px
  '7': '1.75rem',     // 28px
  '8': '2rem',        // 32px
  '9': '2.25rem',     // 36px
  '10': '2.5rem',     // 40px
  '11': '2.75rem',    // 44px
  '12': '3rem',       // 48px
  '14': '3.5rem',     // 56px
  '16': '4rem',       // 64px
  '18': '4.5rem',     // 72px
  '20': '5rem',       // 80px
  '24': '6rem',       // 96px
  '28': '7rem',       // 112px
  '32': '8rem',       // 128px
  '36': '9rem',       // 144px
  '40': '10rem',      // 160px
  '44': '11rem',      // 176px
  '48': '12rem',      // 192px
  '52': '13rem',      // 208px
  '56': '14rem',      // 224px
  '60': '15rem',      // 240px
  '64': '16rem',      // 256px
  '72': '18rem',      // 288px
  '80': '20rem',      // 320px
  '96': '24rem',      // 384px
  // Safe area values
  'safe-top': 'env(safe-area-inset-top, 0px)',
  'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
  'safe-left': 'env(safe-area-inset-left, 0px)',
  'safe-right': 'env(safe-area-inset-right, 0px)',
};

/* ============================================
   ANIMATION CONFIGURATION
   ============================================ */

export const animation = {
  keyframes: {
    // Ripple effect
    ripple: {
      to: {
        transform: 'scale(4)',
        opacity: '0',
      },
    },
    // Float animation
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    // Pulse slow
    'pulse-slow': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    // Glow animation
    glow: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
      '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)' },
    },
    // Gradient shift
    'gradient-shift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    // Slide up
    'slide-up': {
      from: { transform: 'translateY(100%)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    // Slide down
    'slide-down': {
      from: { transform: 'translateY(-100%)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    // Fade in
    'fade-in': {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    // Scale in
    'scale-in': {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    // Shimmer (for skeleton loading)
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
  animation: {
    ripple: 'ripple 0.6s linear',
    float: 'float 6s ease-in-out infinite',
    'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    glow: 'glow 2s ease-in-out infinite',
    'gradient-shift': 'gradient-shift 8s ease infinite',
    'slide-up': 'slide-up 0.3s ease-out',
    'slide-down': 'slide-down 0.3s ease-out',
    'fade-in': 'fade-in 0.2s ease-out',
    'scale-in': 'scale-in 0.2s ease-out',
    shimmer: 'shimmer 2s linear infinite',
  },
  transitionDuration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },
  transitionTimingFunction: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
};

/* ============================================
   Z-INDEX SCALE
   ============================================ */

export const zIndex = {
  base: '0',
  dropdown: '100',
  sticky: '200',
  fixed: '300',
  'modal-backdrop': '400',
  modal: '500',
  popover: '600',
  tooltip: '700',
  toast: '800',
  max: '9999',
};

/* ============================================
   COMPONENT SIZE TOKENS
   ============================================ */

export const componentSizes = {
  // Touch target minimum (44px)
  'touch-min': '2.75rem',
  'touch-comfortable': '3rem',
  // Button heights
  'btn-xs': '1.75rem',
  'btn-sm': '2rem',
  'btn-md': '2.5rem',
  'btn-default': '2.75rem',
  'btn-lg': '3rem',
  'btn-xl': '3.5rem',
  // Input heights
  'input-sm': '2rem',
  'input-md': '2.5rem',
  'input-default': '2.75rem',
  'input-lg': '3rem',
  // Avatar sizes
  'avatar-xs': '1.5rem',
  'avatar-sm': '2rem',
  'avatar-md': '2.5rem',
  'avatar-lg': '3rem',
  'avatar-xl': '4rem',
  'avatar-2xl': '6rem',
  // Icon sizes
  'icon-xs': '0.875rem',
  'icon-sm': '1rem',
  'icon-md': '1.25rem',
  'icon-lg': '1.5rem',
  'icon-xl': '2rem',
  'icon-2xl': '2.5rem',
};

/* ============================================
   CUSTOM PLUGIN
   ============================================ */

export const fixiaPlugin = plugin(function({ addUtilities, addComponents, theme }) {
  // Utility classes
  addUtilities({
    // Safe area padding
    '.p-safe': {
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
    },
    '.pt-safe': {
      paddingTop: 'env(safe-area-inset-top, 0px)',
    },
    '.pb-safe': {
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    },
    '.px-safe': {
      paddingLeft: 'env(safe-area-inset-left, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)',
    },
    '.py-safe': {
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    },
    // Dynamic viewport height
    '.h-dvh': {
      height: '100dvh',
    },
    '.min-h-dvh': {
      minHeight: '100dvh',
    },
    '.max-h-dvh': {
      maxHeight: '100dvh',
    },
    // Touch target minimum
    '.touch-target': {
      minWidth: '44px',
      minHeight: '44px',
    },
    '.touch-target-lg': {
      minWidth: '48px',
      minHeight: '48px',
    },
    // Text balance
    '.text-balance': {
      textWrap: 'balance',
    },
    '.text-pretty': {
      textWrap: 'pretty',
    },
    // Scrollbar hide
    '.scrollbar-hide': {
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    // Overscroll contain
    '.overscroll-contain': {
      overscrollBehavior: 'contain',
    },
    // GPU acceleration
    '.gpu': {
      transform: 'translateZ(0)',
      willChange: 'transform',
    },
  });

  // Glass morphism components
  addComponents({
    '.glass': {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      '-webkit-backdrop-filter': 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    '.glass-medium': {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      '-webkit-backdrop-filter': 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    '.glass-strong': {
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(32px)',
      '-webkit-backdrop-filter': 'blur(32px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '.glass-ultra': {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(40px)',
      '-webkit-backdrop-filter': 'blur(40px)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
    },
    // Gradient text
    '.gradient-text': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      backgroundClip: 'text',
    },
    // Liquid gradient
    '.liquid-gradient': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    // Glow effects
    '.glow-primary': {
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
    },
    '.glow-accent': {
      boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
    },
    '.glow-success': {
      boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
    },
    '.glow-destructive': {
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
    },
    // Hover lift
    '.hover-lift': {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '@media (hover: hover)': {
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    '.hover-lift-subtle': {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '@media (hover: hover)': {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 15px -3px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    // Responsive container
    '.container-responsive': {
      width: '100%',
      maxWidth: 'min(100% - 2rem, 72rem)',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: 'clamp(1rem, 5vw, 3rem)',
      paddingRight: 'clamp(1rem, 5vw, 3rem)',
    },
  });
});

/* ============================================
   COMPLETE THEME EXTENSION
   ============================================ */

export const fixiaDesignSystem: Partial<Config> = {
  theme: {
    screens: breakpoints,
    extend: {
      fontSize: typography.fontSize,
      letterSpacing: typography.letterSpacing,
      spacing: spacing,
      keyframes: animation.keyframes,
      animation: animation.animation,
      transitionDuration: animation.transitionDuration,
      transitionTimingFunction: animation.transitionTimingFunction,
      zIndex: zIndex,
      width: componentSizes,
      height: componentSizes,
      minWidth: componentSizes,
      minHeight: componentSizes,
      maxWidth: {
        prose: '65ch',
        narrow: '40rem',
        content: '72rem',
        wide: '90rem',
      },
    },
  },
  plugins: [fixiaPlugin],
};

export default fixiaDesignSystem;
