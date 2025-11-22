# FIXIA Enterprise Responsive Design System

**Version:** 2.0.0
**Status:** Production Ready
**Last Updated:** 2025-11-22

---

## Table of Contents

1. [Overview](#overview)
2. [Typography System](#typography-system)
3. [Spacing System](#spacing-system)
4. [Breakpoint Strategy](#breakpoint-strategy)
5. [Component Patterns](#component-patterns)
6. [Animation System](#animation-system)
7. [Safe Area Handling](#safe-area-handling)
8. [Accessibility Checklist](#accessibility-checklist)
9. [Implementation Guide](#implementation-guide)
10. [Testing Strategy](#testing-strategy)

---

## Overview

The Fixia Responsive Design System is a world-class, enterprise-grade design system built for the Fixia marketplace. It provides:

- **Mobile-first architecture** with progressive enhancement
- **Fluid typography** using `clamp()` for pixel-perfect scaling
- **8px base spacing system** for consistent layouts
- **Touch-optimized** interactions (44px minimum touch targets)
- **Safe area support** for modern devices (notch, Dynamic Island)
- **WCAG AA accessibility** compliance
- **Reduced motion support** for accessibility
- **Dark mode** optimized

### File Structure

```
apps/web/src/
├── components/
│   └── design-system/
│       ├── index.ts                    # Main exports
│       ├── ResponsiveButton.tsx        # Button components
│       ├── ResponsiveCard.tsx          # Card components
│       ├── ResponsiveModal.tsx         # Modal/sheet components
│       ├── ResponsiveGrid.tsx          # Grid system
│       ├── ResponsiveTable.tsx         # Table with mobile cards
│       ├── ResponsiveNavigation.tsx    # Nav with hamburger
│       └── ResponsiveHero.tsx          # Hero sections
├── config/
│   └── design-system.tailwind.ts       # Tailwind config extension
└── styles/
    └── design-system/
        ├── responsive-variables.css    # CSS custom properties
        └── responsive-utilities.css    # Utility classes
```

---

## Typography System

### Fluid Typography Scale

Using `clamp()` for smooth scaling across all viewport sizes:

| Token | Mobile (320px) | Desktop (1536px) | CSS Variable |
|-------|----------------|------------------|--------------|
| xs | 12px | 14px | `--font-size-xs` |
| sm | 14px | 15px | `--font-size-sm` |
| base | 16px | 18px | `--font-size-base` |
| md | 18px | 20px | `--font-size-md` |
| lg | 20px | 24px | `--font-size-lg` |
| xl | 24px | 30px | `--font-size-xl` |
| 2xl | 30px | 36px | `--font-size-2xl` |
| 3xl | 36px | 48px | `--font-size-3xl` |
| 4xl | 48px | 60px | `--font-size-4xl` |
| 5xl | 60px | 72px | `--font-size-5xl` |
| display | 72px | 96px | `--font-size-display` |

### Heading Hierarchy

```tsx
// Using Tailwind classes
<h1 className="text-fluid-4xl font-bold tracking-tight">Heading 1</h1>
<h2 className="text-fluid-3xl font-semibold tracking-tight">Heading 2</h2>
<h3 className="text-fluid-2xl font-semibold">Heading 3</h3>
<h4 className="text-fluid-xl font-medium">Heading 4</h4>
<h5 className="text-fluid-lg font-medium">Heading 5</h5>
<h6 className="text-fluid-md font-medium">Heading 6</h6>

// Using CSS variables
h1 { font-size: var(--heading-h1); }
```

### Line Heights

| Usage | Token | Value |
|-------|-------|-------|
| None | `--leading-none` | 1 |
| Tight (headings) | `--leading-tight` | 1.15 |
| Snug | `--leading-snug` | 1.25 |
| Normal (body) | `--leading-normal` | 1.5 |
| Relaxed (long text) | `--leading-relaxed` | 1.625 |
| Loose | `--leading-loose` | 1.75 |

### Letter Spacing

```css
--tracking-tighter: -0.05em;  /* Display headlines */
--tracking-tight: -0.025em;   /* Headings */
--tracking-normal: 0;         /* Body text */
--tracking-wide: 0.025em;     /* Buttons, labels */
--tracking-wider: 0.05em;     /* Uppercase text */
--tracking-widest: 0.1em;     /* Badges */
```

---

## Spacing System

### 8px Base Scale

```css
--space-0: 0;
--space-px: 1px;
--space-0-5: 2px;
--space-1: 4px;      /* xs */
--space-1-5: 6px;
--space-2: 8px;      /* sm */
--space-3: 12px;
--space-4: 16px;     /* md */
--space-5: 20px;
--space-6: 24px;     /* lg */
--space-8: 32px;     /* xl */
--space-12: 48px;    /* 2xl */
--space-16: 64px;    /* 3xl */
--space-24: 96px;    /* 4xl */
```

### Semantic Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
--spacing-4xl: 96px;
```

### Responsive Padding Patterns

```tsx
// Component padding (cards, inputs)
className="p-3 sm:p-4 md:p-5 lg:p-6"

// Section padding
className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"

// Page container
className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
```

### Gap Patterns

```tsx
// Card grid gaps
className="gap-4 sm:gap-5 md:gap-6"

// Form field gaps
className="gap-4"

// Button group gaps
className="gap-3 sm:gap-4"
```

---

## Breakpoint Strategy

### Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| xs | 320px | Small phones (minimum supported) |
| sm | 640px | Landscape phones, small tablets |
| md | 768px | Tablets |
| lg | 1024px | Small laptops, landscape tablets |
| xl | 1280px | Desktops |
| 2xl | 1536px | Ultra-wide displays |

### Mobile-First Pattern

```tsx
// Always start with mobile styles, then add larger breakpoints
className="
  w-full           // Mobile: full width
  sm:w-auto        // Small: auto width
  md:w-1/2         // Medium: half width
  lg:w-1/3         // Large: third width
"
```

### Common Responsive Patterns

#### 1. Stack to Row
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
</div>
```

#### 2. Grid Columns
```tsx
// 1 col -> 2 col -> 3 col -> 4 col
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

#### 3. Auto-fit Grid
```tsx
// Automatically fits as many cards as possible
<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
```

#### 4. Show/Hide by Breakpoint
```tsx
<div className="hidden sm:block">Desktop only</div>
<div className="sm:hidden">Mobile only</div>
```

---

## Component Patterns

### Responsive Card

```tsx
import { ResponsiveCard, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/design-system';

<ResponsiveCard variant="interactive" hoverLift>
  <ResponsiveCardHeader>
    <ResponsiveCardTitle>Card Title</ResponsiveCardTitle>
    <ResponsiveCardDescription>Description text</ResponsiveCardDescription>
  </ResponsiveCardHeader>
  <ResponsiveCardContent>
    {/* Content */}
  </ResponsiveCardContent>
  <ResponsiveCardFooter>
    <ResponsiveButton>Action</ResponsiveButton>
  </ResponsiveCardFooter>
</ResponsiveCard>
```

### Responsive Button

```tsx
import { ResponsiveButton, ResponsiveButtonGroup } from '@/components/design-system';

// Touch-friendly button (44px on mobile, 40px on desktop)
<ResponsiveButton variant="primary" size="default">
  Click Me
</ResponsiveButton>

// Button group that stacks on mobile
<ResponsiveButtonGroup stackOnMobile>
  <ResponsiveButton variant="primary">Primary</ResponsiveButton>
  <ResponsiveButton variant="outline">Secondary</ResponsiveButton>
</ResponsiveButtonGroup>

// Loading state
<ResponsiveButton isLoading loadingText="Processing...">
  Submit
</ResponsiveButton>
```

### Responsive Modal

```tsx
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalBody,
  ResponsiveModalFooter
} from '@/components/design-system';

const [isOpen, setIsOpen] = useState(false);

<ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ResponsiveModalOverlay />
  <ResponsiveModalContent size="md" swipeToClose>
    <ResponsiveModalHeader>
      <ResponsiveModalTitle>Modal Title</ResponsiveModalTitle>
    </ResponsiveModalHeader>
    <ResponsiveModalBody>
      {/* Content */}
    </ResponsiveModalBody>
    <ResponsiveModalFooter>
      <ResponsiveButton variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </ResponsiveButton>
      <ResponsiveButton>Confirm</ResponsiveButton>
    </ResponsiveModalFooter>
  </ResponsiveModalContent>
</ResponsiveModal>
```

### Responsive Table

```tsx
import {
  ResponsiveTable,
  TableElement,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/design-system';

// Table with card view on mobile
<ResponsiveTable mobileCards>
  <TableElement>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow labels={['Name', 'Status', 'Amount']}>
        <TableCell>John Doe</TableCell>
        <TableCell>Active</TableCell>
        <TableCell>$1,234</TableCell>
      </TableRow>
    </TableBody>
  </TableElement>
</ResponsiveTable>
```

### Responsive Navigation

```tsx
import { ResponsiveNavigation, NavLink, NavActions } from '@/components/design-system';

<ResponsiveNavigation logo={<Logo />}>
  <NavLink href="/" isActive>Home</NavLink>
  <NavLink href="/services">Services</NavLink>
  <NavLink href="/about">About</NavLink>
  <NavActions>
    <ResponsiveButton size="sm">Sign In</ResponsiveButton>
    <ResponsiveButton variant="primary" size="sm">Get Started</ResponsiveButton>
  </NavActions>
</ResponsiveNavigation>
```

### Responsive Hero

```tsx
import {
  ResponsiveHero,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroBadge
} from '@/components/design-system';

<ResponsiveHero height="screen-safe" withOrbs withGradient>
  <HeroBadge icon={<SparklesIcon />}>New Feature</HeroBadge>
  <HeroTitle gradient>
    Build Something Amazing
  </HeroTitle>
  <HeroSubtitle>
    Connect with skilled professionals for any project.
  </HeroSubtitle>
  <HeroActions>
    <ResponsiveButton size="xl">Get Started</ResponsiveButton>
    <ResponsiveButton variant="outline" size="xl">Learn More</ResponsiveButton>
  </HeroActions>
</ResponsiveHero>
```

---

## Animation System

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| instant | 0ms | No animation |
| fast | 150ms | Micro-interactions |
| normal | 200ms | Standard transitions |
| slow | 300ms | Deliberate animations |
| slower | 400ms | Emphasis |
| slowest | 500ms | Page transitions |

### Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Device Optimization

```css
/* Disable hover effects on touch devices */
@media (hover: none) and (pointer: coarse) {
  .hover-lift:hover {
    transform: none;
  }
}

/* Faster animations on mobile */
@media (hover: none) {
  --duration-normal: 150ms;
  --duration-slow: 200ms;
}
```

### Animation Examples

```tsx
// Hover lift effect (desktop only)
<div className="hover-lift">Lifts on hover</div>

// Glow animation
<div className="animate-glow">Glowing element</div>

// Float animation
<div className="animate-float">Floating element</div>

// Gradient shift
<div className="gradient-shift">Animated gradient</div>

// Framer Motion with reduced motion
const shouldReduceMotion = useReducedMotion();
<motion.div
  animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
  transition={{ duration: shouldReduceMotion ? 0 : 2 }}
/>
```

---

## Safe Area Handling

### iOS Safe Areas

```css
/* CSS Variables */
--safe-area-inset-top: env(safe-area-inset-top, 0px);
--safe-area-inset-right: env(safe-area-inset-right, 0px);
--safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
--safe-area-inset-left: env(safe-area-inset-left, 0px);
```

### Header with Safe Area

```tsx
<header className="
  fixed top-0 left-0 right-0
  pt-[env(safe-area-inset-top)]
  h-[calc(56px+env(safe-area-inset-top))]
">
  {/* Navigation content */}
</header>
```

### Bottom Navigation with Safe Area

```tsx
<nav className="
  fixed bottom-0 left-0 right-0
  pb-[env(safe-area-inset-bottom)]
  h-[calc(56px+env(safe-area-inset-bottom))]
">
  {/* Navigation items */}
</nav>
```

### Modal Footer with Safe Area

```tsx
<div className="
  px-4 py-4
  pb-[calc(1rem+env(safe-area-inset-bottom))]
">
  {/* Footer buttons */}
</div>
```

### Dynamic Viewport Height

```tsx
// Use dvh for full viewport height that accounts for browser chrome
<div className="min-h-dvh">Full viewport content</div>

// Or use CSS variable
<div style={{ minHeight: '100dvh' }}>Full viewport content</div>
```

---

## Accessibility Checklist

### WCAG AA Compliance

- [ ] **Color Contrast**: All text meets 4.5:1 contrast ratio (3:1 for large text)
- [ ] **Focus States**: Visible focus indicators on all interactive elements
- [ ] **Touch Targets**: Minimum 44x44px touch targets on mobile
- [ ] **Keyboard Navigation**: All interactive elements accessible via keyboard
- [ ] **Screen Reader**: Proper ARIA labels and roles
- [ ] **Reduced Motion**: Respect `prefers-reduced-motion`
- [ ] **Text Scaling**: Content remains usable at 200% zoom
- [ ] **Semantic HTML**: Proper heading hierarchy, landmarks

### Focus States

```tsx
// All interactive elements have visible focus states
className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
"
```

### Touch Targets

```tsx
// Minimum 44x44px touch targets
className="min-w-[44px] min-h-[44px]"

// Or use the utility class
className="touch-target"
```

### Screen Reader Support

```tsx
// Visually hidden but accessible to screen readers
<span className="sr-only">Close dialog</span>

// ARIA labels
<button aria-label="Close modal">X</button>

// ARIA expanded for menus
<button aria-expanded={isOpen}>Menu</button>
```

---

## Implementation Guide

### Step 1: Import CSS

Add to your main CSS file:

```css
@import './styles/design-system/responsive-variables.css';
@import './styles/design-system/responsive-utilities.css';
```

### Step 2: Configure Tailwind

Update `tailwind.config.js`:

```js
import { fixiaDesignSystem } from './src/config/design-system.tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    screens: fixiaDesignSystem.theme.screens,
    extend: {
      ...fixiaDesignSystem.theme.extend,
    },
  },
  plugins: [...fixiaDesignSystem.plugins],
};
```

### Step 3: Use Components

```tsx
import {
  ResponsiveButton,
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveModal,
} from '@/components/design-system';
```

### Step 4: Apply Responsive Patterns

Follow the mobile-first approach:

```tsx
// Component with responsive classes
<div className="
  p-3 sm:p-4 md:p-6         // Responsive padding
  text-sm sm:text-base       // Responsive typography
  grid-cols-1 sm:grid-cols-2 // Responsive grid
">
```

---

## Testing Strategy

### Breakpoint Testing

Test at these viewport widths:

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| xs | 320px | Small phones (iPhone SE) |
| xs-lg | 375px | Standard phones (iPhone 12) |
| sm | 640px | Landscape phones |
| md | 768px | Tablets (iPad Mini) |
| md-lg | 834px | Tablets (iPad Pro 11) |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Ultra-wide |

### Device Testing Checklist

- [ ] iPhone SE (320px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 12/13/14 Pro Max (428px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro 11" (834px)
- [ ] iPad Pro 12.9" (1024px)
- [ ] MacBook Air (1440px)
- [ ] Desktop 1080p (1920px)
- [ ] Ultra-wide (2560px)

### Accessibility Testing

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows)
3. **Color Contrast**: Use axe DevTools or Lighthouse
4. **Zoom**: Test at 200% browser zoom
5. **Reduced Motion**: Enable in system preferences

### Automated Tests

```tsx
// Playwright responsive test
test.describe('Responsive Design', () => {
  const viewports = [
    { width: 320, height: 568, name: 'mobile-xs' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 800, name: 'desktop' },
  ];

  viewports.forEach(({ width, height, name }) => {
    test(`renders correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page).toHaveScreenshot(`homepage-${name}.png`);
    });
  });
});
```

---

## Quick Reference

### Spacing Classes

```
p-3 sm:p-4 md:p-5 lg:p-6     // Responsive component padding
py-8 sm:py-12 md:py-16       // Section vertical padding
gap-4 sm:gap-5 md:gap-6      // Grid/flex gaps
```

### Typography Classes

```
text-fluid-xs     // 12-14px
text-fluid-sm     // 14-15px
text-fluid-base   // 16-18px
text-fluid-lg     // 20-24px
text-fluid-xl     // 24-30px
text-fluid-2xl    // 30-36px
text-fluid-3xl    // 36-48px
text-fluid-4xl    // 48-60px
```

### Grid Patterns

```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
```

### Glass Effects

```
glass              // Light glass
glass-medium       // Medium glass
glass-strong       // Strong glass
glass-ultra        // Ultra glass
```

### Animation Classes

```
animate-float      // Floating animation
animate-glow       // Glow pulse
animate-pulse-slow // Slow pulse
hover-lift         // Hover lift effect
hover-lift-subtle  // Subtle hover lift
```

---

**Created by:** Fixia Development Team
**License:** Proprietary
**Support:** dev@fixia.com.ar
