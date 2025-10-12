# Fixia Design System

## 📐 Spacing System

### Base Unit
- Base: `4px` (0.25rem)
- All spacing values are multiples of 4px for consistency

### Spacing Scale
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `xs` | 4px | `gap-1`, `space-y-1` | Tight spacing between related items |
| `sm` | 8px | `gap-2`, `space-y-2` | **Default minimum spacing** |
| `md` | 16px | `gap-4`, `space-y-4` | Between form fields, card sections |
| `lg` | 24px | `gap-6`, `space-y-6` | Between major sections |
| `xl` | 32px | `gap-8`, `space-y-8` | Between page sections |
| `2xl` | 48px | `gap-12`, `space-y-12` | Between major page blocks |

### Spacing Guidelines
- **Minimum spacing:** Never use `gap-1` or `space-y-1` except for very tight UI elements
- **Standard spacing:** Use `gap-2` (8px) as the minimum for most UI
- **Form fields:** Use `gap-4` or `space-y-4` (16px) between fields
- **Sections:** Use `gap-6` or `space-y-6` (24px) between card sections

---

## 🎨 Border Radius System

### Radius Scale
Based on CSS variable `--radius: 1rem` (16px)

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `sm` | 12px | `rounded-sm` | Small buttons, badges |
| `md` | 14px | `rounded-md` | Default for most elements |
| `lg` | 16px | `rounded-lg` | Cards, inputs (default) |
| `xl` | 20px | `rounded-xl` | **Primary standard** - buttons, cards, inputs |
| `2xl` | 24px | `rounded-2xl` | Large cards, modals |
| `full` | 9999px | `rounded-full` | Circular elements, avatars |

### Border Radius Guidelines
- **Default:** Use `rounded-xl` for most interactive elements
- **Cards:** Use `rounded-xl` or `rounded-2xl` for large cards
- **Buttons:** Use `rounded-xl` (standard)
- **Inputs:** Use `rounded-xl` (matches buttons)
- **Badges:** Use `rounded-lg` (slightly smaller)
- **Avatars:** Use `rounded-full`

---

## 🎯 Component Sizing

### Button Sizes
| Size | Height | Padding | Font Size | Usage |
|------|--------|---------|-----------|-------|
| `sm` | h-9 (36px) | px-4 | text-xs | Compact contexts, secondary actions |
| `default` | **h-11 (44px)** | px-6 | text-sm | **Primary standard** |
| `lg` | h-12 (48px) | px-8 | text-base | Hero sections, prominent CTAs |
| `icon` | h-11 w-11 (44px) | - | - | Icon-only buttons |

### Input Sizes
| Element | Height | Usage |
|---------|--------|-------|
| Input | **h-11 (44px)** | All text inputs |
| Textarea | min-h-[120px] | Multi-line text |
| Select | h-11 (44px) | Dropdown selects |

### Touch Targets (WCAG AAA)
- **Minimum:** 44px × 44px (h-11 w-11)
- All interactive elements must meet this minimum
- Icon buttons: h-11 w-11
- Regular buttons: h-11 (height enforced)

---

## 🎨 Color System

### Primary Colors
```css
--primary-solid: #667eea      /* Main brand color */
--primary-foreground: #ffffff /* Text on primary */
```

### Status Colors
```css
--success: #51cf66            /* Success states */
--warning: #ffd93d            /* Warning states */
--destructive: hsl(0, 62.8%, 30.6%) /* Error/danger states */
```

### Neutral Colors
```css
--background: hsl(240, 10%, 3.9%)     /* Page background */
--foreground: hsl(0, 0%, 98%)         /* Primary text */
--muted-foreground: hsl(240, 5%, 75%) /* Secondary text (WCAG AA) */
```

### Focus States
```css
--ring: hsl(217, 91%, 60%)    /* Focus ring color (high contrast) */
```

### Usage Guidelines
- **Focus rings:** Use `focus-visible:ring-2 focus-visible:ring-ring`
- **Disabled states:** Use `disabled:opacity-50`
- **Hover states:** Use `hover:opacity-90` or `hover:bg-accent`

---

## 🎭 Animation System

### Duration Tokens
```css
fast:   150ms   /* Hovers, clicks */
normal: 200ms   /* Standard transitions */
slow:   300ms   /* Modals, drawers */
slower: 500ms   /* Page transitions */
```

### Easing Functions
```css
smooth: cubic-bezier(0.4, 0, 0.2, 1)        /* Standard easing */
bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55) /* Playful bounce */
```

### Tailwind Classes
```tsx
// Duration
duration-fast   // 150ms
duration-normal // 200ms (default)
duration-slow   // 300ms
duration-slower // 500ms

// Easing
ease-smooth
ease-bounce
```

### Animation Guidelines
- **Buttons:** `transition-all duration-200`
- **Cards:** `transition-all duration-300`
- **Modals:** `duration-200` with `ease-out`
- **Hover states:** `transition-colors duration-150`

---

## 📱 Responsive Breakpoints

### Breakpoint Scale
| Name | Value | Usage |
|------|-------|-------|
| `xs` | 480px | Mobile small |
| `sm` | 640px | Mobile large / Tablet small |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop large |
| `2xl` | 1536px | Desktop XL |

### Responsive Guidelines
- **Mobile-first:** Start with mobile styles, add `sm:`, `md:`, etc.
- **Primary breakpoint:** Focus on `sm:` (640px) for mobile→desktop
- **Tablet support:** Use `md:` (768px) where needed
- **Simplify:** Avoid complex responsive patterns, prefer 1-2 breakpoints

---

## 🎨 Glass Morphism

### Glass Effect Utilities
```css
.glass        /* Light: rgba(255, 255, 255, 0.15) + blur(20px) */
.glass-medium /* Medium: rgba(255, 255, 255, 0.225) + blur(24px) */
.glass-strong /* Strong: rgba(255, 255, 255, 0.3) + blur(32px) */
```

### Usage
```tsx
<div className="glass rounded-xl border border-white/20">
  {/* Glass effect card */}
</div>
```

---

## 🏗️ Component Variants

### Card Variants
```tsx
<Card variant="default" />     // Standard card
<Card variant="interactive" /> // Hover scale + shadow
<Card variant="elevated" />    // Permanent shadow
<Card variant="glass" />       // Glass morphism effect
```

### Badge Variants
```tsx
<Badge variant="default" />    // Primary color
<Badge variant="secondary" />  // Muted
<Badge variant="success" />    // Green
<Badge variant="warning" />    // Yellow
<Badge variant="destructive" /> // Red
<Badge variant="outline" />    // Bordered
```

### Button Variants
```tsx
<Button variant="default" />     // Primary gradient
<Button variant="destructive" /> // Red
<Button variant="outline" />     // Bordered
<Button variant="secondary" />   // Glass medium
<Button variant="ghost" />       // Transparent
<Button variant="link" />        // Link style
```

---

## ✨ Best Practices

### DO's ✅
- Use `h-11` for all buttons and inputs (WCAG AAA)
- Use `rounded-xl` for consistency
- Use `gap-2` minimum for spacing
- Use `transition-all duration-200` for interactions
- Add `focus-visible:ring-2` to all interactive elements
- Use glass morphism effects for cards and panels

### DON'Ts ❌
- Don't use `gap-1` or `space-y-1` (too tight)
- Don't mix border radius (stick to `rounded-xl`)
- Don't use `h-9` for primary buttons (too small)
- Don't forget focus states
- Don't skip ARIA labels on icons
- Don't use inline styles (use Tailwind)

---

## 📚 Component Library

### Available Components
1. **EmptyState** - Empty state with icon, title, description, action
2. **ErrorState** - Error state with icon, title, description, retry
3. **LoadingSpinner** - Consistent loading indicator
4. **FormMessage** - Inline form validation messages
5. **PasswordStrength** - Password strength indicator
6. **Toast** - Notification system

### Using Components
```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Toast } from "@/components/ui/toast";
```

---

## 🎯 Accessibility Checklist

- [ ] All buttons min 44px height
- [ ] Focus indicators visible (ring-2)
- [ ] Color contrast WCAG AA minimum
- [ ] ARIA labels on icon-only buttons
- [ ] Keyboard navigation supported
- [ ] Screen reader compatible
- [ ] Touch targets minimum 44px
- [ ] Form validation messages have role="alert"

---

*Last Updated: 2025-10-11*
*Fixia Design System v1.0*
