# COMPREHENSIVE UI/UX AUDIT REPORT - FIXIA MARKETPLACE
**Professional Services Marketplace Platform**
**Audit Date:** 2025-10-11
**Focus:** Visual Consistency, Component Polish, Accessibility, Professional Polish

---

## EXECUTIVE SUMMARY

This comprehensive audit examines the Fixia marketplace application's UI/UX implementation following initial standardization fixes. The platform uses a modern tech stack with React, TypeScript, Tailwind CSS, shadcn/ui components, and Framer Motion animations with a distinctive "liquid glass" design system.

**Overall Assessment:** The application has a strong foundation with recent height standardization improvements, but several visual inconsistencies, accessibility issues, and polish opportunities remain.

**Priority Breakdown:**
- **Critical Issues:** 8 (Must fix before production)
- **High Priority:** 15 (Significant impact on UX)
- **Medium Priority:** 22 (Polish and refinement)
- **Low Priority:** 12 (Nice-to-have improvements)

---

## 1. VISUAL CONSISTENCY ISSUES

### 1.1 BUTTON HEIGHT INCONSISTENCIES (CRITICAL)
**Files Affected:** Multiple pages

**Issue:** While recent standardization set h-11 for main buttons and h-9 for secondary, inconsistencies remain:

**Location:** `apps/web/src/components/ui/button.tsx`
- **Line 23:** `default: "h-9 px-4 py-2"` - Default button height is h-9
- **Line 24:** `sm: "h-8 rounded-lg px-3 text-xs"`
- **Line 25:** `lg: "h-12 rounded-xl px-8"`
- **Line 26:** `icon: "h-9 w-9"`

**Problem:** The default size (h-9) conflicts with the stated standard of h-11 for main buttons.

**Location:** `apps/web/src/pages/LoginPage.tsx`
- **Line 171:** Input has `h-11` - CORRECT
- **Line 189:** Input has `h-11` - CORRECT
- **Line 248:** Button has `h-9` - INCONSISTENT with input height

**Location:** `apps/web/src/pages/RegisterPage.tsx`
- **Line 167:** Button size="icon" with `h-9 w-9` - Should these match input heights?
- **Line 188:** Button size="icon" with `h-9 w-9` - Inconsistent
- **Line 674:** Button size="icon" with `h-9 w-9` - Inconsistent
- **Line 695:** Button size="icon" with `h-9 w-9` - Inconsistent

**Location:** `apps/web/src/pages/HomePage.tsx`
- No explicit button heights defined, relying on defaults

**Recommended Fix:**
```typescript
// apps/web/src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        default: "h-11 px-4 py-2",      // Changed from h-9
        sm: "h-9 rounded-lg px-3 text-xs",  // Keep for compact contexts
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",               // Changed from h-9 w-9
      },
    },
  }
)
```

**Priority:** CRITICAL
**Impact:** Visual consistency across the entire application

---

### 1.2 INPUT HEIGHT INCONSISTENCIES (HIGH)
**Files Affected:** `apps/web/src/components/ui/input.tsx`, multiple pages

**Location:** `apps/web/src/components/ui/input.tsx`
- **Line 14:** `"flex h-11 sm:h-9 w-full rounded-lg sm:rounded-xl..."`

**Problem:** Responsive height changes (h-11 on mobile, h-9 on desktop) creates inconsistent experience. This conflicts with the button standardization.

**Issues:**
1. Mobile gets taller inputs (h-11) while desktop gets shorter (h-9)
2. This is inverse to typical patterns where desktop has more space
3. Creates visual mismatch with buttons that have consistent heights
4. Touch targets on mobile are good (44px minimum), but desktop loses this

**Recommended Fix:**
```typescript
// apps/web/src/components/ui/input.tsx
className={cn(
  "flex h-11 w-full rounded-xl glass border-white/20 bg-input-background px-3 py-2 text-base sm:text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:glass-medium disabled:cursor-not-allowed disabled:opacity-50",
  className
)}
```

**Changes:**
- Remove responsive height (`h-11 sm:h-9` → `h-11`)
- Remove responsive border radius (`rounded-lg sm:rounded-xl` → `rounded-xl`)
- Keep responsive font size for better readability

**Priority:** HIGH
**Impact:** Form consistency across all breakpoints

---

### 1.3 SELECT COMPONENT HEIGHT MISMATCH (HIGH)
**Files Affected:** `apps/web/src/components/ui/select.tsx`

**Location:** `apps/web/src/components/ui/select.tsx`
- **Line 20:** SelectTrigger has `h-9` hardcoded

**Problem:** Select dropdowns are h-9, but inputs are h-11. When used together in forms (like RegisterPage), they look mismatched.

**Examples in RegisterPage:**
- Lines 294-309: Location select (h-9) next to phone input (h-11)
- Lines 802-817: Similar mismatch in professional form

**Recommended Fix:**
```typescript
// apps/web/src/components/ui/select.tsx - Line 20
className={cn(
  "flex h-11 w-full items-center justify-between whitespace-nowrap rounded-xl glass border-white/20 bg-input-background px-3 py-2 text-sm shadow-sm ring-offset pl-3 pr-10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  className
)}
```

**Priority:** HIGH
**Impact:** Form field visual consistency

---

### 1.4 TEXTAREA HEIGHT STANDARDIZATION (MEDIUM)
**Files Affected:** `apps/web/src/components/ui/textarea.tsx`

**Location:** `apps/web/src/components/ui/textarea.tsx`
- **Line 13:** Has proper rounded-xl and glass styling
- **Line 13:** Uses `min-h-[60px]` which is fine, but should document standard heights

**Issue:** Textareas don't have standardized heights for common use cases

**Recommended Fix:**
Add size variants similar to button:
```typescript
import { cva, type VariantProps } from "class-variance-authority"

const textareaVariants = cva(
  "flex w-full rounded-xl glass border-white/20 bg-input-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:glass-medium disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      size: {
        default: "min-h-[80px]",
        sm: "min-h-[60px]",
        lg: "min-h-[120px]",
        xl: "min-h-[200px]"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Priority:** MEDIUM
**Impact:** Consistency in multi-line input fields

---

### 1.5 ICON SIZING INCONSISTENCIES (HIGH)
**Files Affected:** Multiple pages and components

**Issues Found:**
1. **HomePage.tsx:**
   - Line 10-15: Multiple duplicate Heart imports
   - Line 104: Icon in logo is `h-8 w-8 sm:h-10 sm:w-10` (responsive)
   - Line 322-323: Category icons are `h-11 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16` (too many breakpoints)
   - Line 462: Button icon is `h-9 w-9` (inconsistent with parent)

2. **DashboardPage.tsx:**
   - Line 144: Icon container is `h-11 w-12` (non-square, awkward sizing)
   - Line 168: Icon container is `h-11 w-12` (repeated issue)
   - Line 187: Icon container is `h-11 w-12` (repeated issue)
   - Line 206: Icon container is `h-11 w-12` (repeated issue)
   - Line 429: Stat card icon container is `h-11 w-12` (repeated issue)

3. **ServicesPage.tsx:**
   - Line 74: Search icon is `h-5 w-5`
   - Line 417: Icon button with `h-9 w-9`
   - Line 549: Icon button with `h-9 w-9`

**Problem:**
- Non-square icon containers (h-11 w-12) look odd
- Too many responsive breakpoints for icons
- Inconsistent icon sizes (h-3, h-4, h-5, h-6, h-8) with no clear system

**Recommended Standards:**
```typescript
// Icon sizing system
// Inline icons (within text/buttons): h-4 w-4
// Small icons (compact UI): h-5 w-5
// Default icons (most cases): h-6 w-6
// Large icons (feature highlights): h-8 w-8
// Hero icons (landing/empty states): h-12 w-12 or h-16 w-16

// Icon containers should ALWAYS be square
// Small: h-9 w-9 or h-10 w-10
// Medium: h-12 w-12 or h-14 w-14
// Large: h-16 w-16 or h-20 w-20
```

**Recommended Fixes:**
```typescript
// DashboardPage.tsx - Line 144 and similar
<div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
  <Plus className="h-6 w-6 text-white" />
</div>

// DashboardPage.tsx - Line 429 (stat cards)
<div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center">
  <Icon className="h-6 w-6 text-primary" />
</div>

// HomePage.tsx - Line 322 (category icons)
<div className="h-14 w-14 md:h-16 md:w-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
  <Icon className="h-7 w-7 md:h-8 md:w-8 text-blue-400" />
</div>
```

**Priority:** HIGH
**Impact:** Visual balance and professional appearance

---

### 1.6 SPACING INCONSISTENCIES (MEDIUM)
**Files Affected:** Multiple pages

**Issues:**
1. **HomePage.tsx:**
   - Line 183-193: Card uses `p-3 sm:p-4` (inconsistent padding)
   - Line 321: CardContent uses `p-3 sm:p-4 md:p-6` (too many breakpoints)
   - Line 468: CardContent uses `p-6` (no responsive)
   - Line 580: CardContent uses `p-8` (different from others)

2. **DashboardPage.tsx:**
   - Line 143: CardContent uses `p-6`
   - Line 415: CardContent uses `p-6`
   - No mobile consideration

3. **ServicesPage.tsx:**
   - Line 567: CardContent uses `p-4 space-y-3`
   - Inconsistent with other pages

**Problem:** No standardized padding system for cards

**Recommended Standards:**
```typescript
// Card padding system
// Compact cards: p-4 (all breakpoints)
// Default cards: p-4 sm:p-6
// Spacious cards: p-6 sm:p-8
// Hero cards: p-8 sm:p-12

// Gap/Space system (already documented but not followed)
// Tight: gap-2 or space-y-2
// Default: gap-4 or space-y-4
// Relaxed: gap-6 or space-y-6
// Spacious: gap-8 or space-y-8
```

**Priority:** MEDIUM
**Impact:** Visual rhythm and consistency

---

### 1.7 BORDER RADIUS INCONSISTENCIES (MEDIUM)
**Files Affected:** Multiple components

**Issues:**
1. Button uses `rounded-xl` consistently - GOOD
2. Input uses `rounded-lg sm:rounded-xl` - INCONSISTENT
3. Cards use `rounded-xl` - GOOD
4. Dialog uses `rounded-2xl` - DIFFERENT
5. Select uses `rounded-xl` - GOOD
6. Badges use `rounded-md` - DIFFERENT

**Current System:**
- `--radius: 1rem` (16px)
- `rounded-sm: calc(var(--radius) - 4px)` = 12px
- `rounded-md: calc(var(--radius) - 2px)` = 14px
- `rounded-lg: var(--radius)` = 16px
- But code uses `rounded-xl` which is Tailwind's 12px, not using CSS variables

**Problem:** Mixing Tailwind defaults with CSS variable system

**Recommended Fix:**
Create consistent system:
```css
/* tailwind.config.js */
borderRadius: {
  sm: "calc(var(--radius) - 4px)",  // 12px - badges, small elements
  DEFAULT: "calc(var(--radius) - 2px)", // 14px - inputs, selects
  lg: "var(--radius)",                  // 16px - buttons, cards
  xl: "calc(var(--radius) + 4px)",      // 20px - dialogs, sheets
  "2xl": "calc(var(--radius) + 8px)",   // 24px - large containers
}
```

Then update components:
```typescript
// Input - use rounded-lg (14px)
// Select - use rounded-lg (14px)
// Button - use rounded-lg (14px)
// Card - use rounded-xl (20px)
// Dialog - use rounded-2xl (24px)
// Badge - use rounded-sm (12px)
```

**Priority:** MEDIUM
**Impact:** Cohesive visual language

---

## 2. COMPONENT POLISH ISSUES

### 2.1 CARD COMPONENT INCONSISTENCIES (HIGH)
**Files Affected:** `apps/web/src/components/ui/card.tsx`

**Location:** `apps/web/src/components/ui/card.tsx`
- **Lines 5-15:** Card component structure

**Issues:**
1. Card uses `gap-6` which may be too large for some use cases
2. No size variants for cards
3. Padding is in child components (CardHeader, CardContent) but not standardized
4. CardHeader has complex responsive grid `grid-rows-[auto_auto]` that may cause issues

**Current Implementation:**
```typescript
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}
```

**Recommended Fix:**
Add variants and better defaults:
```typescript
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border transition-all duration-200",
  {
    variants: {
      spacing: {
        tight: "gap-3",
        default: "gap-4",
        relaxed: "gap-6",
        spacious: "gap-8"
      },
      hover: {
        none: "",
        lift: "hover:shadow-lg hover:-translate-y-0.5",
        glow: "hover:shadow-xl hover:border-primary/30",
        glass: "hover:glass-medium"
      }
    },
    defaultVariants: {
      spacing: "default",
      hover: "none"
    }
  }
)

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, spacing, hover, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ spacing, hover }), className)}
      {...props}
    />
  );
}
```

**Priority:** HIGH
**Impact:** Reusable, consistent card system

---

### 2.2 BADGE COMPONENT IMPROVEMENTS (MEDIUM)
**Files Affected:** `apps/web/src/components/ui/badge.tsx`

**Location:** `apps/web/src/components/ui/badge.tsx`
- **Lines 7-26:** Badge variants

**Issues:**
1. Badge height is not standardized (`py-0.5` creates variable height)
2. No size variants
3. Icon handling is basic (`[&>svg]:size-3`)
4. Gap is hardcoded (`gap-1`)

**Current Variants:**
- default, secondary, destructive, outline

**Missing Variants:**
- success, warning, info (status indicators)
- No size variants (sm, default, lg)

**Recommended Fix:**
```typescript
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "text-foreground border-border hover:bg-accent",
        success: "border-transparent bg-success/20 text-success border-success/30",
        warning: "border-transparent bg-warning/20 text-warning border-warning/30",
        info: "border-transparent bg-blue-500/20 text-blue-400 border-blue-400/30",
      },
      size: {
        sm: "h-5 px-1.5 text-[10px] gap-0.5 [&>svg]:size-2.5",
        default: "h-6 px-2 text-xs gap-1 [&>svg]:size-3",
        lg: "h-7 px-2.5 text-sm gap-1.5 [&>svg]:size-3.5",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

**Usage Examples:**
```tsx
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info" size="lg">New Feature</Badge>
```

**Priority:** MEDIUM
**Impact:** More flexible status indicators

---

### 2.3 SKELETON LOADING IMPROVEMENTS (MEDIUM)
**Files Affected:** `apps/web/src/components/ui/skeleton.tsx`

**Location:** `apps/web/src/components/ui/skeleton.tsx`
- **Lines 1-14:** Basic skeleton implementation

**Issues:**
1. No size variants
2. No shape variants (circle, rounded, rectangle)
3. Uses `bg-accent` which may not contrast well with backgrounds
4. No shimmer/wave animation option

**Recommended Fix:**
```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const skeletonVariants = cva(
  "animate-pulse",
  {
    variants: {
      variant: {
        default: "bg-accent/50",
        light: "bg-white/10",
        dark: "bg-black/10",
        shimmer: "bg-gradient-to-r from-accent/50 via-accent/70 to-accent/50 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
      },
      shape: {
        default: "rounded-md",
        circle: "rounded-full",
        rectangle: "rounded-none",
        rounded: "rounded-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      shape: "default"
    }
  }
);

export interface SkeletonProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, shape, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, shape }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
```

Add shimmer animation to globals.css:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Usage Examples:**
```tsx
<Skeleton className="h-12 w-12" shape="circle" variant="shimmer" />
<Skeleton className="h-4 w-48" variant="light" />
```

**Priority:** MEDIUM
**Impact:** Better loading states

---

### 2.4 DIALOG/MODAL IMPROVEMENTS (HIGH)
**Files Affected:** `apps/web/src/components/ui/dialog.tsx`

**Location:** `apps/web/src/components/ui/dialog.tsx`
- **Line 23:** Overlay backdrop
- **Line 40:** Content positioning and styling
- **Line 46:** Close button

**Issues:**
1. Close button positioning (`right-4 top-4`) may not align with content padding
2. No size variants for dialog (sm, default, lg, xl, full)
3. Overlay blur is `backdrop-blur-sm` - may be too subtle
4. Close button uses multiple class names that could be simplified

**Recommended Fix:**
```typescript
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))

// Add variants
const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 glass border-white/20 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        default: "w-full max-w-lg",
        lg: "w-full max-w-2xl",
        xl: "w-full max-w-4xl",
        full: "w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-w-none"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ size }), className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 h-9 w-9 rounded-lg glass-medium hover:glass-strong opacity-70 hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none inline-flex items-center justify-center">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

**Priority:** HIGH
**Impact:** Better modal user experience

---

### 2.5 DROPDOWN MENU IMPROVEMENTS (MEDIUM)
**Files Affected:** Multiple (DropdownMenu usage in navigation)

**Location:** `apps/web/src/pages/DashboardPage.tsx` - Lines 87-125

**Issues:**
1. Dropdown items don't have consistent hover states
2. No keyboard focus indicators visible
3. Separator may not have enough contrast
4. No transition animations on open/close

**Recommended Improvements:**
```typescript
// In dropdown-menu.tsx
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors",
      "focus:glass-medium focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "hover:glass-light",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
```

**Priority:** MEDIUM
**Impact:** Better navigation menu interaction

---

## 3. RESPONSIVE DESIGN ISSUES

### 3.1 MOBILE NAVIGATION ISSUES (HIGH)
**Files Affected:** `apps/web/src/pages/HomePage.tsx`

**Location:** Lines 96-127 (Navigation component)

**Issues:**
1. **Line 109-113:** Logo text hidden on mobile with `hidden sm:flex`, but this breaks brand visibility
2. **Line 116-126:** Navigation completely hidden below lg breakpoint with no mobile alternative in this component (though MobileBottomNavigation exists)
3. **Line 131-133:** Button text changes from "Iniciar Sesión" to "Entrar" - may be too short
4. **Line 137-140:** Icon shown on mobile without text label - not accessible

**Problems:**
- Reliance on separate MobileBottomNavigation creates split UX
- No hamburger menu for full navigation access on tablet
- Desktop navigation disappears at `lg:` breakpoint (1024px) - too late, should be `md:`

**Recommended Fix:**
```tsx
// Add hamburger menu for mobile/tablet
<div className="flex items-center space-x-2 sm:space-x-4">
  {/* Mobile menu button - shown below lg */}
  <button
    className="lg:hidden p-2 hover:glass-medium rounded-lg transition-all"
    aria-label="Open navigation menu"
  >
    <Menu className="h-6 w-6" />
  </button>

  {/* Desktop actions */}
  <div className="hidden lg:flex items-center space-x-4">
    <Link to="/login">
      <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
        Iniciar Sesión
      </Button>
    </Link>
    <Link to="/register">
      <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
        <Gift className="h-4 w-4 mr-2" />
        Únete Gratis
      </Button>
    </Link>
  </div>

  {/* Mobile actions - compact */}
  <div className="flex lg:hidden items-center space-x-2">
    <Link to="/login">
      <Button variant="ghost" size="sm">
        Entrar
      </Button>
    </Link>
    <Link to="/register">
      <Button size="sm" className="liquid-gradient hover:opacity-90">
        <Gift className="h-4 w-4 mr-1" />
        Únete
      </Button>
    </Link>
  </div>
</div>
```

**Priority:** HIGH
**Impact:** Mobile navigation accessibility

---

### 3.2 EXCESSIVE RESPONSIVE BREAKPOINTS (MEDIUM)
**Files Affected:** Multiple pages

**Issues:**
1. **HomePage.tsx Line 321:** `p-3 sm:p-4 md:p-6` - 3 breakpoints for padding
2. **HomePage.tsx Line 322:** `h-11 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16` - 3 breakpoints for icons
3. **RegisterPage.tsx:** Multiple 2-3 breakpoint responsive patterns

**Problem:**
- Too many breakpoints create maintenance burden
- Subtle differences between breakpoints not noticeable
- Should stick to 2 breakpoints maximum: base/mobile and sm/desktop

**Recommended Standard:**
```typescript
// Use only 2 breakpoints for most cases
// Mobile-first: base (< 640px) and sm: (>= 640px)
// For complex layouts: add lg: (>= 1024px)

// GOOD
className="p-4 sm:p-6"
className="h-12 w-12 sm:h-16 sm:w-16"

// AVOID
className="p-3 sm:p-4 md:p-6"
className="h-11 sm:h-14 md:h-16 lg:h-20"
```

**Priority:** MEDIUM
**Impact:** Code maintainability and visual consistency

---

### 3.3 MOBILE CARD LAYOUT ISSUES (HIGH)
**Files Affected:** `apps/web/src/pages/ServicesPage.tsx`

**Location:** Lines 531-658 (ServiceCard grid view)

**Issues:**
1. Card content may be too tight on mobile
2. Button sizing in card footer (line 637-651) doesn't consider mobile touch targets
3. Image aspect ratio (line 535) may not work well on very small screens

**Recommended Fixes:**
```tsx
// Line 567 - Add mobile padding consideration
<CardContent className="p-4 sm:p-5 space-y-3">

// Lines 636-652 - Improve mobile button layout
<div className="flex flex-col sm:flex-row gap-2">
  <Button
    size="sm"
    variant="outline"
    className="glass border-white/20 hover:glass-medium flex-1 h-11 sm:h-9"
    onClick={handleContactClick}
  >
    <MessageCircle className="h-4 w-4 mr-2" />
    Contactar
  </Button>
  <Link to={`/services/${service.id}`} className="flex-1">
    <Button
      size="sm"
      className="liquid-gradient hover:opacity-90 transition-all duration-300 w-full h-11 sm:h-9"
    >
      Ver Detalles
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </Link>
</div>
```

**Priority:** HIGH
**Impact:** Mobile usability

---

### 3.4 TABLET BREAKPOINT GAP (MEDIUM)
**Files Affected:** Most pages

**Issue:** Current breakpoints jump from sm (640px) to lg (1024px), missing the common tablet breakpoint of md (768px). This creates awkward layouts on tablets.

**Examples:**
1. Grid layouts go from 1 column to 3-4 columns with no 2-column intermediate
2. Navigation goes from mobile to desktop with nothing in between
3. Card sizes don't scale smoothly

**Recommended Fix:**
Review and add `md:` breakpoint where needed:
```tsx
// Grid layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// Navigation
className="hidden md:flex items-center space-x-6"

// Cards
className="p-4 md:p-5 lg:p-6"
```

**Priority:** MEDIUM
**Impact:** Tablet experience improvement

---

## 4. ACCESSIBILITY ISSUES

### 4.1 FOCUS STATES INCONSISTENT (CRITICAL)
**Files Affected:** Multiple components

**Current Implementation:**
- Buttons: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Inputs: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Inconsistent across custom components

**Issues:**
1. **HomePage.tsx Line 195:** Toggle password button has `tabIndex={-1}` - removes from keyboard navigation (GOOD for avoiding double-focus)
2. **LoginPage.tsx Line 197:** Same pattern correctly implemented
3. However, some interactive elements lack visible focus indicators
4. Ring color (`--ring: 240 4.9% 83.9%`) may not have enough contrast on dark backgrounds

**Problems:**
- `focus-visible:ring-ring` uses a light color (83.9% lightness)
- On dark glass backgrounds, this may not meet WCAG 2.1 AA contrast ratio of 3:1 for UI components

**Recommended Fix:**
```css
/* globals.css - Update ring colors */
:root {
  --ring: 240 80% 65%;  /* More saturated blue for better contrast */
  --ring-offset: 240 10% 3.9%;  /* Match background */
}

/* Add focused state utility */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background;
}
```

Then apply consistently:
```typescript
// All interactive elements should have
className="focus-ring"
// or explicitly
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
```

**Test Contrast:**
- Use Chrome DevTools or browser extension to verify 3:1 minimum contrast
- Test with keyboard navigation (Tab key)
- Test with screen reader

**Priority:** CRITICAL
**Impact:** Keyboard navigation and accessibility compliance

---

### 4.2 COLOR CONTRAST ISSUES (CRITICAL)
**Files Affected:** `apps/web/src/styles/globals.css`, multiple components

**Issues Found:**

1. **Muted Text:**
   - `--muted-foreground: 240 5% 64.9%` (64.9% lightness)
   - On dark background (3.9% lightness)
   - Contrast ratio: approximately 4.5:1
   - Passes WCAG AA for normal text (4.5:1) but barely
   - Fails WCAG AAA (7:1)

2. **Success Color:**
   - `--success: #51cf66` (greenish)
   - On dark background: Good contrast
   - On light backgrounds: May fail if used for small text

3. **Warning Color:**
   - `--warning: #ffd93d` (yellow)
   - `--warning-foreground: 0 0% 9%` (very dark text)
   - Yellow on dark background may have poor contrast
   - Dark text on yellow is good

4. **Glass Backgrounds:**
   - Text on glass overlays may have insufficient contrast
   - Glass backgrounds are semi-transparent, making contrast unpredictable

**Locations:**
- **ServicesPage.tsx Line 326:** `text-xs text-gray-400` - gray-400 on dark may fail
- **HomePage.tsx Line 211:** `text-xs sm:text-sm text-muted-foreground` - muted may be too light
- **DashboardPage.tsx Line 426:** `text-xs text-muted-foreground` - repeated issue

**Recommended Fixes:**
```css
/* globals.css - Improve contrast */
:root {
  /* Improve muted text contrast */
  --muted-foreground: 240 5% 70%;  /* Increase to 70% for better contrast */

  /* Ensure success has good contrast on both themes */
  --success: #4cc263;  /* Slightly darker green */

  /* Warning should work on dark backgrounds */
  --warning: #ffd93d;
  --warning-foreground: 0 0% 9%;
}

/* Light theme adjustments */
.light {
  --muted-foreground: rgba(10, 10, 11, 0.65);  /* Increase from 0.6 */
  --success: #2d8644;  /* Darker for light backgrounds */
}
```

**Add contrast checker utility:**
```typescript
// utils/contrast.ts
export function checkContrast(foreground: string, background: string): number {
  // Implement WCAG contrast calculation
  // Return ratio (e.g., 4.5, 7.0)
}

// Use in development to audit components
```

**Priority:** CRITICAL
**Impact:** WCAG 2.1 AA compliance, readability

---

### 4.3 ARIA LABELS AND SEMANTIC HTML (HIGH)
**Files Affected:** Multiple pages

**Issues:**

1. **Missing ARIA labels:**
   - **HomePage.tsx Line 98:** Link has no aria-label
   - **ServicesPage.tsx Line 417-426:** Favorite button icon-only needs aria-label
   - **ServicesPage.tsx Line 549-558:** Same issue

2. **Button vs Link confusion:**
   - Many `<Link><Button>` combinations should be `<Button asChild><Link>`
   - Example: HomePage.tsx lines 130-135, 136-142

3. **Icon-only buttons:**
   - **DashboardPage.tsx Line 72-77:** Bell notification button needs label
   - **DashboardPage.tsx Line 80-84:** Heart favorites button needs label
   - Screen readers can't determine purpose

4. **Form labels:**
   - RegisterPage has good label implementation
   - LoginPage has good label implementation
   - But some dynamic forms may be missing labels

**Recommended Fixes:**

```tsx
// Icon-only buttons must have aria-label or sr-only text
<Button variant="ghost" size="icon" aria-label="View notifications">
  <Bell className="h-4 w-4" />
</Button>

// Or use sr-only span
<Button variant="ghost" size="icon">
  <Bell className="h-4 w-4" />
  <span className="sr-only">View notifications</span>
</Button>

// Button inside Link should use asChild
<Button asChild variant="ghost">
  <Link to="/login">
    Iniciar Sesión
  </Link>
</Button>

// Favorite button needs state indication
<Button
  variant="ghost"
  size="icon"
  onClick={toggleFavorite}
  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
  aria-pressed={isFavorite}
>
  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
</Button>
```

**Add to all pages:**
```tsx
// Main content should have proper landmarks
<main id="main-content" role="main" aria-label="Page content">
  {/* content */}
</main>

// Navigation should have label
<nav aria-label="Main navigation">
  {/* nav items */}
</nav>
```

**Priority:** HIGH
**Impact:** Screen reader accessibility

---

### 4.4 KEYBOARD NAVIGATION GAPS (HIGH)
**Files Affected:** Multiple interactive components

**Issues:**

1. **Modal Traps:**
   - Dialog component doesn't show focus trap implementation
   - User may be able to tab outside modal while it's open
   - Need to verify Radix UI is handling this

2. **Skip Links:**
   - SkipNavigation component exists (good!)
   - But implementation needs verification

3. **Dropdown Menus:**
   - Arrow key navigation in dropdowns not explicitly shown
   - Escape key to close not shown (may be handled by Radix)

4. **Service Cards:**
   - Multiple interactive elements (favorite, contact, view) in card
   - Tab order should be logical
   - Current implementation may jump around

**Recommended Fixes:**

```tsx
// Verify focus trap in Dialog
<DialogContent onOpenAutoFocus={(e) => {
  // Focus first interactive element
  const firstInput = e.currentTarget.querySelector('input, button, select, textarea');
  if (firstInput) {
    e.preventDefault();
    (firstInput as HTMLElement).focus();
  }
}}>

// Add keyboard hints for power users
<div className="text-xs text-muted-foreground mt-2">
  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
</div>

// Service card - improve tab order with tabindex
<div className="relative">
  <Link to={`/services/${service.id}`} tabIndex={0}>
    {/* Main card content - focusable */}
  </Link>
  <Button
    onClick={toggleFavorite}
    tabIndex={0}
    className="absolute top-3 right-3"
  >
    {/* Favorite button - separate tab stop */}
  </Button>
</div>
```

**Test Plan:**
1. Test all pages with keyboard only (no mouse)
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Verify focus never gets trapped
4. Verify all interactive elements are reachable

**Priority:** HIGH
**Impact:** Keyboard-only users, accessibility compliance

---

### 4.5 FORM VALIDATION ACCESSIBILITY (MEDIUM)
**Files Affected:** RegisterPage, LoginPage, forms

**Current Implementation:**
- Visual validation feedback exists (color-coded messages)
- Password strength indicator is visual-only
- Error messages appear but may not be announced

**Issues:**
1. **RegisterPage Lines 198-276:** Password validation feedback
   - Visual indicators (colors, icons) good
   - But no `aria-live` region for dynamic announcements
   - Screen reader users don't get real-time feedback

2. **Form errors:**
   - Toast notifications may not be announced to screen readers
   - Form field errors need `aria-invalid` and `aria-describedby`

**Recommended Fixes:**

```tsx
// Add aria-live region for password validation
<div
  className="space-y-4"
  aria-live="polite"
  aria-atomic="true"
>
  {formData.password.length > 0 && (
    <div className="space-y-3" role="status">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Fortaleza de contraseña
        </span>
        <span className={`text-sm font-medium ${passwordValidation.strengthColor}`}>
          {passwordValidation.strengthLabel} ({passwordValidation.score}/100)
        </span>
      </div>
      {/* Strength bars */}
    </div>
  )}
</div>

// Form fields need proper error handling
<div className="space-y-2">
  <Label htmlFor="email">Correo Electrónico *</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    aria-invalid={emailError ? "true" : "false"}
    aria-describedby={emailError ? "email-error" : undefined}
  />
  {emailError && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {emailError}
    </p>
  )}
</div>

// Toast notifications need aria-live
// Verify sonner library implements this (it should)
```

**Priority:** MEDIUM
**Impact:** Form usability for screen reader users

---

## 5. PROFESSIONAL POLISH ISSUES

### 5.1 ANIMATION INCONSISTENCIES (MEDIUM)
**Files Affected:** Multiple pages with Framer Motion

**Current Animations:**
1. **HomePage.tsx:**
   - Float animation (6s ease-in-out infinite)
   - Pulse-slow (4s)
   - Page transitions (0.6-0.8s duration)
   - Hover lift (y: -4px)

2. **DashboardPage.tsx:**
   - Similar patterns but slightly different timings
   - Hover lift (y: -2px) - INCONSISTENT

3. **ServicesPage.tsx:**
   - Hover lift (y: -4px) on card
   - Different from dashboard

**Issues:**
- Inconsistent hover lift amounts (-2px vs -4px)
- Inconsistent animation durations
- Some animations may feel too slow (0.8s for page load)

**Recommended Standards:**
```typescript
// Animation duration system
export const ANIMATION_DURATION = {
  fast: 0.15,      // Quick feedback (150ms)
  normal: 0.3,     // Standard transitions (300ms)
  slow: 0.5,       // Emphasis transitions (500ms)
  pageLoad: 0.6,   // Page load animations (600ms)
} as const;

// Hover transformations
export const HOVER_TRANSFORM = {
  subtle: -2,      // Subtle lift (badges, small cards)
  normal: -4,      // Standard lift (cards, buttons)
  prominent: -8,   // Prominent lift (featured items)
} as const;

// Stagger delays
export const STAGGER_DELAY = 0.1;  // 100ms between items

// Usage
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: ANIMATION_DURATION.pageLoad }}
  whileHover={{ y: HOVER_TRANSFORM.normal }}
>
```

**Apply consistently:**
```tsx
// HomePage - card hover
whileHover={{ y: HOVER_TRANSFORM.normal }}
transition={{ duration: ANIMATION_DURATION.normal }}

// DashboardPage - quick action cards
whileHover={{ y: HOVER_TRANSFORM.normal }}
transition={{ duration: ANIMATION_DURATION.normal }}

// ServicesPage - service cards
whileHover={{ y: HOVER_TRANSFORM.normal }}
transition={{ duration: ANIMATION_DURATION.normal }}
```

**Priority:** MEDIUM
**Impact:** Consistent, polished feel

---

### 5.2 LOADING SPINNER INCONSISTENCIES (MEDIUM)
**Files Affected:** Multiple pages

**Current Implementations:**
1. **LoginPage Line 285:** `<Loader2 className="mr-2 h-4 w-4 animate-spin" />`
2. **ServicesPage Line 315:** `<Loader2 className="h-4 w-4 mr-2 animate-spin" />`
3. **ServicesPage Line 422:** `<Loader2 className="h-4 w-4 animate-spin text-white" />`
4. **ServicesPage Line 829:** `<Loader2 className="h-6 w-6 animate-spin text-primary" />`

**Issues:**
- Inconsistent sizing (h-4 vs h-6)
- Inconsistent colors (default, text-white, text-primary)
- Manual implementation each time

**Recommended Fix:**
Create loading component:

```typescript
// components/ui/loading.tsx
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const loadingVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8"
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        light: "text-white",
        inherit: ""
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

export interface LoadingProps
  extends React.ComponentProps<typeof Loader2>,
    VariantProps<typeof loadingVariants> {}

export function Loading({ className, size, variant, ...props }: LoadingProps) {
  return (
    <Loader2
      className={cn(loadingVariants({ size, variant }), className)}
      {...props}
    />
  )
}

// Full page loader
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="glass rounded-2xl p-8 flex flex-col items-center space-y-4">
        <Loading size="xl" />
        <span className="text-lg text-muted-foreground">Cargando...</span>
      </div>
    </div>
  )
}

// Inline loader (for buttons)
export function InlineLoader({ className, ...props }: Omit<LoadingProps, 'size'>) {
  return <Loading size="sm" className={cn("mr-2", className)} {...props} />
}
```

**Usage:**
```tsx
// In buttons
<Button disabled={loading}>
  {loading ? (
    <>
      <InlineLoader variant="light" />
      Cargando...
    </>
  ) : (
    "Enviar"
  )}
</Button>

// Full page
{loading && <PageLoader />}

// Custom
<Loading size="lg" variant="muted" />
```

**Priority:** MEDIUM
**Impact:** Consistent loading states

---

### 5.3 EMPTY STATE IMPROVEMENTS (MEDIUM)
**Files Affected:** DashboardPage, ServicesPage

**Current Implementations:**
1. **DashboardPage Lines 284-293:** Recent activity empty state
2. **DashboardPage Lines 478-492:** Projects empty state
3. **ServicesPage Lines 912-940:** No services empty state

**Issues:**
- Inconsistent icon sizes
- Inconsistent messaging tone
- Some have CTAs, some don't
- Different padding/spacing

**Current Structure:**
- Icon container
- Title
- Description
- CTA (sometimes)

**Recommended Standard Component:**
```typescript
// components/ui/empty-state.tsx
import { cn } from "./utils"
import { Button } from "./button"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline"
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className={action.variant === "default" ? "liquid-gradient hover:opacity-90" : ""}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Compact variant for smaller areas
export function EmptyStateCompact({
  icon: Icon,
  title,
  description,
  className
}: Omit<EmptyStateProps, 'action'>) {
  return (
    <div className={cn("text-center py-8", className)}>
      <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="font-medium mb-1 text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
```

**Usage:**
```tsx
// DashboardPage
{activities.length === 0 && (
  <EmptyStateCompact
    icon={Clock}
    title="Sin actividad reciente"
    description="Tu actividad aparecerá aquí cuando comiences a usar la plataforma."
  />
)}

// With action
{projects.length === 0 && (
  <EmptyState
    icon={Briefcase}
    title="No tienes proyectos actuales"
    description="Cuando tengas proyectos activos, aparecerán aquí para que puedas hacer seguimiento de su progreso."
    action={{
      label: "Crear tu primer servicio",
      onClick: () => navigate("/new-project")
    }}
  />
)}
```

**Priority:** MEDIUM
**Impact:** Consistent empty states

---

### 5.4 ERROR STATE IMPROVEMENTS (MEDIUM)
**Files Affected:** ServicesPage, potentially others

**Location:** `apps/web/src/pages/ServicesPage.tsx` - Lines 836-856

**Current Implementation:**
```tsx
{error && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16"
  >
    <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
      <div className="h-16 w-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Search className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold mb-4">Error al cargar servicios</h3>
      <p className="text-muted-foreground mb-6">{error}</p>
      <Button
        onClick={() => window.location.reload()}
        className="liquid-gradient hover:opacity-90"
      >
        Reintentar
      </Button>
    </div>
  </motion.div>
)}
```

**Issues:**
- Using `window.location.reload()` is heavy-handed
- No differentiation between error types
- Icon doesn't match error type (Search icon for general error?)

**Recommended Standard Component:**
```typescript
// components/ui/error-state.tsx
import { AlertCircle, WifiOff, ServerCrash, XCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "./utils"

export type ErrorType = 'network' | 'server' | 'not-found' | 'generic'

export interface ErrorStateProps {
  type?: ErrorType
  title?: string
  message: string
  onRetry?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const ERROR_CONFIG = {
  network: {
    icon: WifiOff,
    defaultTitle: "Error de conexión",
    color: "text-warning"
  },
  server: {
    icon: ServerCrash,
    defaultTitle: "Error del servidor",
    color: "text-destructive"
  },
  'not-found': {
    icon: XCircle,
    defaultTitle: "No encontrado",
    color: "text-muted-foreground"
  },
  generic: {
    icon: AlertCircle,
    defaultTitle: "Algo salió mal",
    color: "text-destructive"
  }
}

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  action,
  className
}: ErrorStateProps) {
  const config = ERROR_CONFIG[type]
  const Icon = config.icon

  return (
    <div className={cn("text-center py-16", className)}>
      <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
        <div className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
          type === 'not-found' ? "bg-muted" : "bg-destructive/20"
        )}>
          <Icon className={cn("h-8 w-8", config.color)} />
        </div>
        <h3 className="text-xl font-semibold mb-4">
          {title || config.defaultTitle}
        </h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="glass border-white/20 hover:glass-medium"
            >
              Reintentar
            </Button>
          )}
          {action && (
            <Button
              onClick={action.onClick}
              className="liquid-gradient hover:opacity-90"
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
// ServicesPage
{error && (
  <ErrorState
    type="server"
    message={error}
    onRetry={() => {
      setError(null)
      setCurrentPage(1)
    }}
  />
)}

// Network error
<ErrorState
  type="network"
  message="No se pudo conectar con el servidor. Verifica tu conexión a internet."
  onRetry={refetch}
/>

// Not found
<ErrorState
  type="not-found"
  title="Servicio no encontrado"
  message="El servicio que buscas no existe o ha sido eliminado."
  action={{
    label: "Volver al inicio",
    onClick: () => navigate('/')
  }}
/>
```

**Priority:** MEDIUM
**Impact:** Better error handling UX

---

### 5.5 TOAST NOTIFICATION CONSISTENCY (LOW)
**Files Affected:** Multiple pages using `toast` from Sonner

**Current Usage Patterns:**
1. **LoginPage:**
   - Success with description and long duration
   - Error with simple message
2. **RegisterPage:**
   - Complex success with emoji and description
   - Various error types with different formats
3. **ServicesPage:**
   - Simple success/error messages

**Issues:**
- Inconsistent use of emojis
- Inconsistent duration values
- Inconsistent use of descriptions
- No standardized error/success patterns

**Recommended Standards:**
```typescript
// utils/toast.ts
import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },

  error: (message: string, options?: { description?: string; action?: { label: string; onClick: () => void }; duration?: number }) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 5000,
      description: options?.description,
      action: options?.action,
    })
  },

  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },

  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 5000,
      description: options?.description,
    })
  },

  // Special cases
  authSuccess: (message: string) => {
    return sonnerToast.success(message, {
      duration: 6000,
      description: "Bienvenido a Fixia",
    })
  },

  authError: (message: string, options?: { action?: { label: string; onClick: () => void } }) => {
    return sonnerToast.error(message, {
      duration: 6000,
      description: "Por favor verifica tus credenciales e intenta nuevamente.",
      action: options?.action,
    })
  },

  networkError: () => {
    return sonnerToast.error("Error de conexión", {
      duration: 6000,
      description: "Verifica tu conexión a internet e intenta nuevamente.",
    })
  }
}

// Usage
toast.success("Operación exitosa")
toast.error("Error al procesar", {
  description: "Detalles del error",
  action: { label: "Reintentar", onClick: retry }
})
toast.authSuccess("Inicio de sesión exitoso")
toast.networkError()
```

**Priority:** LOW
**Impact:** Consistent feedback messages

---

## 6. ANIMATION & TRANSITIONS

### 6.1 MISSING TRANSITIONS (MEDIUM)
**Files Affected:** Various components

**Elements Missing Smooth Transitions:**
1. Select dropdown open/close - has animation but could be smoother
2. Mobile menu (if implemented) - needs slide-in animation
3. Badge appearance - could fade in
4. Tooltip appearance - needs animation
5. Tab switching - could have slide/fade
6. Accordion expand/collapse - needs smooth height transition

**Current Good Examples:**
- Dialog has good zoom + slide animation
- Buttons have `transition-all duration-200`
- Cards have `transition-all duration-300`

**Recommended Additions:**
```css
/* globals.css - Add standard transitions */
@layer utilities {
  .transition-default {
    @apply transition-all duration-200 ease-out;
  }

  .transition-slow {
    @apply transition-all duration-300 ease-out;
  }

  .transition-colors-only {
    @apply transition-colors duration-200 ease-out;
  }

  .transition-transform-only {
    @apply transition-transform duration-200 ease-out;
  }
}
```

**Apply to elements:**
```tsx
// Badges that appear dynamically
<Badge className="transition-default">Status</Badge>

// Tab content switching
<TabsContent className="transition-slow">

// Hover effects that should only transform
<div className="transition-transform-only hover:scale-105">
```

**Priority:** MEDIUM
**Impact:** Smoother micro-interactions

---

### 6.2 ANIMATION PERFORMANCE (LOW)
**Files Affected:** Pages with many animated elements

**Potential Issues:**
1. HomePage has many `whileInView` animations that may affect performance
2. ServicesPage animates every card individually
3. Multiple simultaneous animations on page load

**Recommendations:**
```tsx
// Use viewport options to optimize
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}  // Add margin to trigger earlier
  transition={{ duration: 0.6 }}
>

// Limit number of staggered items
const visibleItems = items.slice(0, 20) // Only animate first 20

// Use CSS animations for simple cases instead of Framer Motion
<div className="animate-fade-in">
```

**Priority:** LOW
**Impact:** Performance on lower-end devices

---

## 7. FORM VALIDATION POLISH

### 7.1 PASSWORD STRENGTH INDICATOR (MEDIUM)
**Files Affected:** RegisterPage

**Location:** `apps/web/src/pages/RegisterPage.tsx` - Lines 198-276

**Current Implementation:** Good visual feedback with colors and bars

**Issues:**
1. Strength bars use inline conditional colors - hard to maintain
2. No clear indication of minimum requirement met
3. Verbosity - lots of repeated code for client and professional forms

**Recommended Improvement:**
```tsx
// components/forms/PasswordStrengthIndicator.tsx
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const validation = usePasswordValidation(password)

  if (!password) return null

  const barColors = {
    'very-weak': 'bg-red-500',
    'weak': 'bg-orange-500',
    'fair': 'bg-yellow-500',
    'good': 'bg-blue-500',
    'strong': 'bg-green-500',
    'very-strong': 'bg-green-600'
  }

  return (
    <div className={cn("space-y-4", className)} aria-live="polite" role="status">
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Fortaleza de contraseña</span>
          <span className={cn("text-sm font-medium", validation.strengthColor)}>
            {validation.strengthLabel} ({validation.score}/100)
          </span>
        </div>
        <div className="flex space-x-1 h-2">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={cn(
                "flex-1 rounded-sm transition-colors duration-300",
                bar <= validation.strengthBars
                  ? barColors[validation.strength]
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Requisitos:</p>
        {validation.requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {req.met ? (
              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={req.met ? "text-success" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">Errores:</p>
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Priority:** MEDIUM
**Impact:** Better password UX

---

### 7.2 INLINE VALIDATION FEEDBACK (HIGH)
**Files Affected:** All forms

**Current State:** Forms validate on submit, not during typing

**Issue:** Users don't get feedback until they submit, which is frustrating

**Recommended Implementation:**
```tsx
// Use react-hook-form or custom validation
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
const [touched, setTouched] = useState<Record<string, boolean>>({})

// Validate on blur
const handleBlur = (field: string) => {
  setTouched(prev => ({ ...prev, [field]: true }))

  // Validate field
  const error = validateField(field, formData[field])
  setFieldErrors(prev => ({ ...prev, [field]: error }))
}

// Show error only if touched
{touched.email && fieldErrors.email && (
  <p className="text-sm text-destructive flex items-center space-x-1 mt-1">
    <AlertCircle className="h-3 w-3" />
    <span>{fieldErrors.email}</span>
  </p>
)}
```

**Priority:** HIGH
**Impact:** Better form UX

---

## 8. MOBILE-SPECIFIC ISSUES

### 8.1 TOUCH TARGET SIZES (HIGH)
**Files Affected:** Multiple components

**WCAG Requirement:** Minimum 44x44px touch targets

**Audit Results:**
1. **Button Component:**
   - Default: h-9 (36px) - FAILS
   - Should be h-11 (44px) minimum

2. **Icon Buttons:**
   - h-9 w-9 (36px) - FAILS
   - Should be h-11 w-11 (44px) minimum

3. **Checkboxes/Radios:**
   - Need to verify size (typically 16-20px is too small)

4. **Links in text:**
   - May be too small if text is small

**Recommended Fixes:**
```typescript
// button.tsx - Already addressed in 1.1
size: {
  default: "h-11 px-4 py-2",      // 44px height ✓
  sm: "h-9 rounded-lg px-3",      // 36px - only for desktop contexts
  lg: "h-12 rounded-xl px-8",     // 48px ✓
  icon: "h-11 w-11",              // 44px ✓
}

// Add touch-target utility for edge cases
@layer utilities {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}

// For small interactive elements, add padding/margin
<Checkbox className="h-5 w-5" /> {/* 20px visual */}
// But wrap in larger clickable area
<label className="flex items-center space-x-2 py-2 cursor-pointer touch-target">
  <Checkbox className="h-5 w-5" />
  <span>Label text</span>
</label>
```

**Priority:** HIGH
**Impact:** Mobile usability and accessibility compliance

---

### 8.2 MOBILE FORM IMPROVEMENTS (MEDIUM)
**Files Affected:** LoginPage, RegisterPage

**Issues:**
1. Form fields could be larger on mobile for easier tapping
2. Virtual keyboard may cover inputs
3. No input type optimizations (e.g., email keyboard, number pad)

**Current Good Practices:**
- Email inputs have `type="email"` - GOOD
- Phone inputs have `type="tel"` - GOOD (RegisterPage line 283)

**Recommended Improvements:**
```tsx
// Add inputMode for better mobile keyboards
<Input
  type="text"
  inputMode="email"  // Shows @ key
  autoComplete="email"
/>

<Input
  type="text"
  inputMode="tel"    // Shows number pad
  autoComplete="tel"
/>

<Input
  type="text"
  inputMode="url"    // Shows .com key
  autoComplete="url"
/>

// Handle virtual keyboard overlap
<div className="pb-safe"> {/* Add safe area padding */}
  <form className="space-y-4">
    {/* Form fields */}
  </form>
</div>

// Add scroll into view on focus (for mobile)
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  setTimeout(() => {
    e.target.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, 300) // After keyboard opens
}
```

**Priority:** MEDIUM
**Impact:** Mobile form experience

---

### 8.3 HORIZONTAL SCROLLING ISSUES (HIGH)
**Files Affected:** Potential issue in tables and wide content

**Check These Areas:**
1. Tables in admin pages
2. Code blocks if any
3. Long unbreakable text (URLs, emails)
4. Wide cards or forms

**Prevention:**
```css
/* globals.css - Add overflow handling */
@layer base {
  * {
    /* Prevent horizontal scroll from children */
    min-width: 0;
  }

  /* Break long words in text content */
  p, span, div {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Make tables responsive */
  table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
  }
}

/* Add mobile container constraints */
.mobile-container {
  @apply px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden;
}
```

**Test:**
```tsx
// Add test content with long text
<p className="break-words">
  verylongurlthatwontbreakverylongurlthatwontbreakverylongurlthatwontbreak
</p>
```

**Priority:** HIGH
**Impact:** Mobile layout integrity

---

## 9. IMPLEMENTATION PRIORITY ROADMAP

### PHASE 1: CRITICAL FIXES (Week 1)
**Must complete before production**

1. **Button Height Standardization** (Issue 1.1)
   - Update button.tsx default height to h-11
   - Update icon button to h-11 w-11
   - Fix all pages using size="icon"
   - Estimated: 4 hours

2. **Focus States** (Issue 4.1)
   - Update ring color for better contrast
   - Verify all interactive elements have focus indicators
   - Test keyboard navigation
   - Estimated: 6 hours

3. **Color Contrast** (Issue 4.2)
   - Update muted-foreground color
   - Test all text/background combinations
   - Fix any failures
   - Estimated: 4 hours

4. **Touch Target Sizes** (Issue 8.1)
   - Implement h-11 minimum for interactive elements
   - Add touch-target utility
   - Update checkboxes/radios with proper labels
   - Estimated: 4 hours

**Total Phase 1: 18 hours (2-3 days)**

---

### PHASE 2: HIGH PRIORITY (Week 2)
**Significant UX improvements**

1. **Input Height Consistency** (Issue 1.2)
   - Remove responsive height variations
   - Update all forms
   - Estimated: 2 hours

2. **Select Component Fix** (Issue 1.3)
   - Update select height to h-11
   - Test all forms with selects
   - Estimated: 2 hours

3. **Icon Sizing Standards** (Issue 1.5)
   - Fix non-square containers
   - Standardize icon sizes
   - Update all pages
   - Estimated: 6 hours

4. **Card Component Polish** (Issue 2.1)
   - Add variants to card component
   - Update major pages
   - Estimated: 4 hours

5. **Dialog Improvements** (Issue 2.4)
   - Add size variants
   - Improve close button
   - Estimated: 3 hours

6. **Mobile Navigation** (Issue 3.1)
   - Add hamburger menu
   - Implement mobile menu drawer
   - Estimated: 6 hours

7. **Mobile Card Layout** (Issue 3.3)
   - Fix button heights on mobile
   - Improve card padding
   - Estimated: 3 hours

8. **ARIA Labels** (Issue 4.3)
   - Add aria-labels to icon buttons
   - Fix button/link semantics
   - Add landmarks
   - Estimated: 4 hours

9. **Keyboard Navigation** (Issue 4.4)
   - Test and fix tab order
   - Add keyboard hints
   - Estimated: 4 hours

10. **Inline Form Validation** (Issue 7.2)
    - Implement real-time validation
    - Add error messages
    - Estimated: 6 hours

**Total Phase 2: 40 hours (5 days)**

---

### PHASE 3: MEDIUM PRIORITY (Week 3)
**Polish and refinement**

1. **Spacing Standardization** (Issue 1.6)
   - Document spacing system
   - Update card padding across app
   - Estimated: 4 hours

2. **Border Radius System** (Issue 1.7)
   - Update Tailwind config
   - Apply consistent radius
   - Estimated: 3 hours

3. **Textarea Variants** (Issue 1.4)
   - Add size variants
   - Update forms
   - Estimated: 2 hours

4. **Badge Improvements** (Issue 2.2)
   - Add success/warning/info variants
   - Add size variants
   - Update usage
   - Estimated: 3 hours

5. **Skeleton Improvements** (Issue 2.3)
   - Add variants
   - Add shimmer animation
   - Update loading states
   - Estimated: 3 hours

6. **Dropdown Menu Polish** (Issue 2.5)
   - Improve hover states
   - Add transitions
   - Estimated: 2 hours

7. **Responsive Breakpoints** (Issue 3.2)
   - Simplify to 2 breakpoints
   - Update complex patterns
   - Estimated: 4 hours

8. **Tablet Support** (Issue 3.4)
   - Add md: breakpoint where needed
   - Test on tablet devices
   - Estimated: 4 hours

9. **Form Validation Accessibility** (Issue 4.5)
   - Add aria-live regions
   - Implement aria-invalid
   - Estimated: 3 hours

10. **Animation Consistency** (Issue 5.1)
    - Create animation constants
    - Apply consistently
    - Estimated: 4 hours

11. **Loading Spinners** (Issue 5.2)
    - Create Loading component
    - Replace all implementations
    - Estimated: 3 hours

12. **Empty States** (Issue 5.3)
    - Create EmptyState component
    - Replace all implementations
    - Estimated: 3 hours

13. **Error States** (Issue 5.4)
    - Create ErrorState component
    - Replace all implementations
    - Estimated: 3 hours

14. **Missing Transitions** (Issue 6.1)
    - Add transition utilities
    - Apply to elements
    - Estimated: 3 hours

15. **Password Strength** (Issue 7.1)
    - Create PasswordStrengthIndicator
    - Replace inline implementations
    - Estimated: 3 hours

16. **Mobile Forms** (Issue 8.2)
    - Add inputMode attributes
    - Handle keyboard overlap
    - Estimated: 3 hours

**Total Phase 3: 50 hours (6-7 days)**

---

### PHASE 4: LOW PRIORITY (Week 4)
**Nice-to-have improvements**

1. **Toast Consistency** (Issue 5.5)
   - Create toast utility wrapper
   - Update all usages
   - Estimated: 3 hours

2. **Animation Performance** (Issue 6.2)
   - Optimize viewport options
   - Limit animated items
   - Estimated: 3 hours

3. **Horizontal Scroll Prevention** (Issue 8.3)
   - Add overflow handling
   - Test edge cases
   - Estimated: 2 hours

4. **General Polish:**
   - Fix any discovered edge cases
   - Improve micro-interactions
   - Browser testing
   - Estimated: 8 hours

**Total Phase 4: 16 hours (2 days)**

---

## TOTAL ESTIMATED EFFORT
- **Phase 1 (Critical):** 18 hours
- **Phase 2 (High):** 40 hours
- **Phase 3 (Medium):** 50 hours
- **Phase 4 (Low):** 16 hours
- **TOTAL:** 124 hours (~15-16 working days)

---

## TESTING CHECKLIST

### Accessibility Testing
- [ ] Keyboard navigation on all pages
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Color contrast verification (Chrome DevTools)
- [ ] Focus indicators visible and sufficient
- [ ] All interactive elements have labels
- [ ] Forms have proper validation feedback
- [ ] ARIA attributes correct

### Visual Testing
- [ ] All buttons have consistent heights
- [ ] All inputs have consistent heights
- [ ] All selects match input heights
- [ ] Icons are properly sized and centered
- [ ] Cards have consistent spacing
- [ ] Border radius is consistent
- [ ] Colors pass contrast tests
- [ ] Hover states work consistently
- [ ] Loading states look professional
- [ ] Empty states are clear and helpful

### Responsive Testing
- [ ] Mobile (375px - iPhone SE)
- [ ] Mobile (414px - iPhone Pro Max)
- [ ] Tablet (768px - iPad)
- [ ] Tablet (1024px - iPad Pro)
- [ ] Desktop (1280px)
- [ ] Large Desktop (1920px)
- [ ] No horizontal scrolling
- [ ] Touch targets meet 44px minimum
- [ ] Virtual keyboard doesn't break layout

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Testing
- [ ] Page load animations smooth
- [ ] No jank on hover effects
- [ ] Transitions smooth on mobile
- [ ] List animations don't cause lag
- [ ] Large lists perform well

---

## CONCLUSION

The Fixia marketplace application has a strong visual foundation with its distinctive liquid glass design system. The recent standardization work on button and input heights was a good start, but several inconsistencies remain that need attention before production launch.

**Key Strengths:**
- Modern, cohesive design system
- Good use of animations and transitions
- Proper component architecture with shadcn/ui
- Mobile-first approach in many areas
- Accessibility considerations started

**Key Weaknesses:**
- Inconsistent component sizing throughout
- Some accessibility gaps (focus states, ARIA labels)
- Missing responsive breakpoints for tablets
- No standardized empty/error states
- Touch targets below WCAG guidelines

**Recommendation:**
Prioritize Phase 1 (Critical) and Phase 2 (High Priority) fixes before production launch. These address fundamental accessibility and consistency issues. Phase 3 and 4 can be implemented post-launch as continuous improvements.

The application shows professional attention to design but needs systematic cleanup to achieve the polish expected of a production marketplace platform. Following this roadmap will result in a significantly improved user experience across all devices and user contexts.

---

## APPENDIX A: COMPONENT SIZING REFERENCE

### Standard Heights
```typescript
// Buttons
h-11 (44px) - Main buttons, primary actions
h-9 (36px)  - Secondary buttons (desktop only)
h-12 (48px) - Large CTAs

// Inputs
h-11 (44px) - All text inputs
h-11 (44px) - All selects
min-h-[80px] - Default textarea
min-h-[60px] - Small textarea

// Icons
h-4 w-4 (16px) - Inline icons in buttons/text
h-5 w-5 (20px) - Small standalone icons
h-6 w-6 (24px) - Default icons
h-8 w-8 (32px) - Large icons
h-12 w-12 (48px) - Hero icons

// Icon Containers
h-10 w-10 (40px) - Small containers
h-12 w-12 (48px) - Default containers
h-16 w-16 (64px) - Large containers

// Badges
h-5 (20px) - Small badges
h-6 (24px) - Default badges
h-7 (28px) - Large badges
```

### Standard Spacing
```typescript
// Card Padding
p-4 (16px)       - Compact mobile
p-4 sm:p-6       - Default responsive
p-6 sm:p-8       - Spacious responsive

// Gap/Space
gap-2 (8px)      - Tight
gap-4 (16px)     - Default
gap-6 (24px)     - Relaxed
gap-8 (32px)     - Spacious

// Margins
mb-4 sm:mb-6     - Standard bottom margin
mt-8 sm:mt-12    - Section spacing
```

### Standard Border Radius
```typescript
rounded-sm   - 12px - Badges, small elements
rounded-md   - 14px - (Deprecated, use rounded instead)
rounded      - 14px - Inputs, selects
rounded-lg   - 16px - Buttons, cards
rounded-xl   - 20px - Dialogs, large cards
rounded-2xl  - 24px - Hero sections, modals
```

---

## APPENDIX B: COLOR PALETTE REFERENCE

### Primary Colors
```css
--primary-solid: #667eea (Blue)
--primary-foreground: #fafafa (Off-white)
```

### Status Colors
```css
--success: #51cf66 (Green)
--warning: #ffd93d (Yellow)
--destructive: hsl(0 62.8% 30.6%) (Red)
```

### UI Colors
```css
--background: hsl(240 10% 3.9%) (Very dark blue-gray)
--foreground: hsl(0 0% 98%) (Off-white)
--muted-foreground: hsl(240 5% 64.9%) (Gray) - UPDATE TO 70% for better contrast
--border: hsl(240 3.7% 15.9%) (Dark gray)
```

### Glass Effects
```css
--glass-light: rgba(255, 255, 255, 0.15)
--glass-medium: rgba(255, 255, 255, 0.225)
--glass-strong: rgba(255, 255, 255, 0.3)
```

---

**End of Audit Report**
