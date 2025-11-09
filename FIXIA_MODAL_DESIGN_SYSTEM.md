# 🎨 Fixia Modal Design System

## Canonical Modal Template: `FixiaModalTemplate`

This document defines the unified visual design for all modals in Fixia.app. All modals must follow this template to ensure visual consistency and coherent user experience.

---

## 📐 Visual Specification

### Color Palette

| Element | Color | CSS Variable | Usage |
|---------|-------|--------------|-------|
| **Background** | #0a0a0b (Deep Navy) | `from-slate-950/90` | Primary modal bg |
| **Bg Gradient Mid** | #0f172a | `via-slate-900/85` | Gradient middle |
| **Bg Gradient End** | #0a0a0b | `to-slate-950/90` | Gradient end |
| **Header Bg** | slate-950/70 | `from-slate-950/70` | Header background |
| **Header Mid** | slate-900/60 | `via-slate-900/60` | Header gradient |
| **Header Light** | slate-900/40 | `to-slate-900/40` | Header fade |
| **Border Light** | rgba(255, 255, 255, 0.12) | `border-white/12` | Mobile borders |
| **Border Medium** | rgba(255, 255, 255, 0.20) | `border-white/20` | Desktop borders |
| **Primary Accent** | #667eea → #764ba2 | `--primary` | Highlights, gradients |
| **Success Green** | #51cf66 | `--success` | Positive actions, tags |
| **Warning Yellow** | #ffd93d | `--warning` | Alerts, warnings |
| **Destructive Red** | #d12c2c | `--destructive` | Negative actions |

### Typography

| Element | Font Size | Weight | Color | Line Height |
|---------|-----------|--------|-------|-------------|
| **Modal Title** | 1rem - 1.25rem | Bold (700) | White (#ffffff) | 1.2 |
| **Subtitle** | 0.75rem | Normal (400) | slate-500 | 1 |
| **Section Title** | 0.875rem - 1rem | Medium (600) | White | 1.4 |
| **Body Text** | 0.875rem - 1rem | Normal (400) | slate-300 | 1.6 |
| **Small Text** | 0.75rem | Normal (400) | slate-400 | 1.5 |

### Spacing & Dimensions

```
Desktop (≥768px):
- Modal max-width: 32rem (lg)
- Modal max-height: 92vh
- Border radius: 1.5rem (rounded-3xl)
- Horizontal padding: 1.5rem (px-6)
- Vertical padding: 1rem (py-4)

Mobile (<768px):
- Full width & height (inset-0)
- Border radius: 0
- Horizontal padding: 1rem (px-4)
- Vertical padding: 0.75rem (py-3)
```

### Shadows & Effects

```css
/* Box Shadow */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);

/* Backdrop Blur */
backdrop-filter: blur(64px);
-webkit-backdrop-filter: blur(64px);

/* Border */
border: 1px solid rgba(255, 255, 255, 0.12-0.20);
```

---

## 🎯 Key Visual Features

### 1. **Glass Morphism**
- Heavy blur effect (blur-2xl)
- Semi-transparent backgrounds with white opacity (0.05 - 0.30)
- Subtle gradients from dark to slightly lighter
- Premium, frosted glass aesthetic

### 2. **Hierarchy with Cards**
```tsx
// Info Cards (Glass cards with subtle border)
bg-gradient-to-br from-white/10 via-white/8 to-white/5
border border-white/20
rounded-xl md:rounded-2xl
```

### 3. **Color-Coded Sections**
```tsx
// Success Section (Green accent)
bg-gradient-to-r from-success/25 via-success/18 to-success/10
border border-success/40

// Primary Section (Blue/Purple accent)
bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10
border border-primary/50

// Warning Section (Yellow accent)
bg-gradient-to-r from-warning/25 via-warning/18 to-warning/10
border border-warning/40
```

### 4. **Animations**
```js
// Modal Entrance
initial={{ scale: 0.95, opacity: 0, y: 20 }}
animate={{ scale: 1, opacity: 1, y: 0 }}
exit={{ scale: 0.95, opacity: 0, y: 20 }}
transition={{ duration: 0.3, ease: 'easeOut' }}

// Header Entrance (staggered)
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.08, duration: 0.3 }}

// Content Stagger
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.12 + (index * 0.04), duration: 0.3 }}
```

---

## 🔧 Component Structure

### Base Template Usage

```tsx
<FixiaModalTemplate
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Modal Title"
  subtitle="Optional subtitle"
  showCloseButton={true}
  closeOnBackdropClick={true}
>
  {/* Your content goes here */}
  <YourModalContent />
</FixiaModalTemplate>
```

### Content Card Pattern

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.12, duration: 0.3 }}
  className="bg-gradient-to-br from-white/10 via-white/8 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 hover:bg-white/12 hover:border-white/30 transition-all shadow-lg"
>
  {/* Content */}
</motion.div>
```

### Info Box Pattern

```tsx
<div className="bg-gradient-to-r from-primary/25 via-primary/15 to-primary/8 backdrop-blur-xl border border-primary/40 rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 hover:bg-primary/28 hover:border-primary/50 transition-all shadow-md">
  {/* Info content */}
</div>
```

---

## 📋 Implementation Checklist

When creating a new modal, ensure:

- [ ] Use `FixiaModalTemplate` as the wrapper
- [ ] Apply correct color gradients for content sections
- [ ] Use proper Framer Motion animations with stagger delays
- [ ] Maintain responsive padding/sizing
- [ ] Use semantic HTML with proper ARIA labels
- [ ] Implement glass blur effects (blur-2xl minimum)
- [ ] Apply hover states with transition-all
- [ ] Test on mobile and desktop viewports
- [ ] Ensure text contrast meets WCAG AA standards
- [ ] Use icons from lucide-react consistently

---

## 🎨 Color-Coded Sections Reference

### Success/Positive (Green)
```css
Background: from-success/25 via-success/18 to-success/10
Border: border-success/40
Hover: hover:bg-success/28 hover:border-success/50
Text: text-success
```

### Primary/Information (Blue-Purple)
```css
Background: from-primary/30 via-primary/20 to-primary/10
Border: border-primary/50
Hover: hover:bg-primary/32 hover:border-primary/60
Text: text-white (with primary glow)
```

### Warning/Caution (Yellow)
```css
Background: from-warning/25 via-warning/18 to-warning/10
Border: border-warning/40
Hover: hover:bg-warning/28 hover:border-warning/50
Text: text-warning
```

### Destructive/Negative (Red)
```css
Background: from-destructive/25 via-destructive/18 to-destructive/10
Border: border-destructive/40
Hover: hover:bg-destructive/28 hover:border-destructive/50
Text: text-destructive
```

### Neutral (White/Gray)
```css
Background: from-white/10 via-white/8 to-white/5
Border: border-white/20
Hover: hover:bg-white/12 hover:border-white/30
Text: text-white or text-slate-300
```

---

## 📱 Responsive Behavior

```tsx
// Desktop (md and above)
- Max width: 32rem (lg)
- Centered on screen with left-1/2, top-1/2, translate
- Border radius: 1.5rem
- Padding: px-6, py-4-5
- Max height: 92vh

// Mobile (below md)
- Full screen: inset-0
- No border radius (natural corners)
- Padding: px-4, py-3
- Slide up animation from bottom
```

---

## 🚀 Migration Guide

To update an existing modal to use `FixiaModalTemplate`:

1. **Replace the wrapper:**
   ```tsx
   // Before
   <motion.div className="fixed inset-0..." />

   // After
   <FixiaModalTemplate
     open={open}
     onOpenChange={onOpenChange}
     title={title}
   >
     {/* Move content inside */}
   </FixiaModalTemplate>
   ```

2. **Update content cards to use proper gradients**
3. **Add stagger animations to multiple elements**
4. **Test responsiveness on mobile/desktop**

---

## 📚 Example Modals Using This System

- `ProposalDetailsModal.tsx` ✅ (Canonical reference)
- `PhoneRevealModal.tsx` (Should follow this pattern)
- `ReviewModal.tsx` (Should follow this pattern)
- `CompletionModal.tsx` (Should follow this pattern)
- `UpgradeModal.tsx` (Should follow this pattern)
- `GiveFeedbackModal.tsx` (Should follow this pattern)

---

## ✅ Validation Checklist

Before committing modal changes:

```
Visual Elements:
☐ Colors match design system
☐ Glass morphism effects present
☐ Shadows/depth proper
☐ Typography hierarchy correct
☐ Icons consistent (lucide-react)
☐ Badges properly styled

Responsiveness:
☐ Desktop layout (centered, compact)
☐ Mobile layout (full screen)
☐ Touch targets 44px+ minimum
☐ Text readable at all sizes
☐ Padding appropriate for viewport

Interactions:
☐ Smooth animations (0.3s ease-out)
☐ Backdrop click closes modal
☐ Close button functional
☐ Hover states defined
☐ Loading states visible

Accessibility:
☐ ARIA labels present
☐ Focus management
☐ Color not only indicator
☐ Text contrast WCAG AA
☐ Keyboard navigation possible
```

---

## 📞 Design System Support

For questions or updates to this design system, refer to:
- Design tokens: `apps/web/src/styles/globals.css`
- Component library: `apps/web/src/components/ui/`
- Modal template: `apps/web/src/components/modals/FixiaModalTemplate.tsx`

Last updated: 2025-11-09
