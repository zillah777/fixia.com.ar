/**
 * FIXIA RESPONSIVE GRID SYSTEM
 * Enterprise-grade responsive grid with auto-fit/auto-fill
 *
 * Features:
 * - Mobile-first responsive columns
 * - Auto-fit and auto-fill support
 * - CSS Grid with gap system
 * - Subgrid support ready
 * - Container queries support
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

/* ============================================
   RESPONSIVE GRID
   ============================================ */

const responsiveGridVariants = cva('grid', {
  variants: {
    /** Column configuration */
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
      12: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12',
      // Auto-fit variants
      'auto-fit-sm': 'grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]',
      'auto-fit-md': 'grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))]',
      'auto-fit-lg': 'grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))]',
      'auto-fit-xl': 'grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))]',
      // Auto-fill variants
      'auto-fill-sm': 'grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))]',
      'auto-fill-md': 'grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))]',
      'auto-fill-lg': 'grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))]',
      'auto-fill-xl': 'grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))]',
    },
    /** Gap size */
    gap: {
      none: 'gap-0',
      xs: 'gap-1 sm:gap-2',
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4 md:gap-5',
      lg: 'gap-4 sm:gap-5 md:gap-6',
      xl: 'gap-5 sm:gap-6 md:gap-8',
      '2xl': 'gap-6 sm:gap-8 md:gap-10',
      responsive: 'gap-[var(--grid-gap-responsive)]',
    },
    /** Horizontal alignment */
    alignItems: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    /** Vertical alignment */
    justifyItems: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    },
  },
  defaultVariants: {
    cols: 3,
    gap: 'md',
    alignItems: 'stretch',
    justifyItems: 'stretch',
  },
});

export interface ResponsiveGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof responsiveGridVariants> {
  /** Render as different element */
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol';
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  (
    {
      className,
      cols,
      gap,
      alignItems,
      justifyItems,
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => (
    <Component
      ref={ref}
      className={cn(
        responsiveGridVariants({ cols, gap, alignItems, justifyItems }),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

/* ============================================
   GRID ITEM
   ============================================ */

const gridItemVariants = cva('', {
  variants: {
    /** Column span */
    colSpan: {
      1: 'col-span-1',
      2: 'col-span-1 sm:col-span-2',
      3: 'col-span-1 sm:col-span-2 lg:col-span-3',
      4: 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4',
      full: 'col-span-full',
      // Responsive spans
      'half-mobile': 'col-span-1 md:col-span-2 lg:col-span-2',
      'third-mobile': 'col-span-1 lg:col-span-1',
    },
    /** Row span */
    rowSpan: {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
      full: 'row-span-full',
    },
    /** Self alignment */
    alignSelf: {
      auto: 'self-auto',
      start: 'self-start',
      center: 'self-center',
      end: 'self-end',
      stretch: 'self-stretch',
    },
  },
  defaultVariants: {
    colSpan: 1,
    rowSpan: 1,
    alignSelf: 'auto',
  },
});

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {}

const ResponsiveGridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, alignSelf, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gridItemVariants({ colSpan, rowSpan, alignSelf }), className)}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveGridItem.displayName = 'ResponsiveGridItem';

/* ============================================
   CARD GRID (Specialized for cards)
   ============================================ */

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum card width */
  minCardWidth?: number;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveCardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  ({ className, minCardWidth = 300, gap = 'md', children, ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-3 sm:gap-4',
      md: 'gap-4 sm:gap-5 md:gap-6',
      lg: 'gap-5 sm:gap-6 md:gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', gapClasses[gap], className)}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minCardWidth}px), 1fr))`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveCardGrid.displayName = 'ResponsiveCardGrid';

/* ============================================
   MASONRY GRID (CSS-only approach)
   ============================================ */

interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveMasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 'md', children, ...props }, ref) => {
    const columnClasses = {
      2: 'columns-1 sm:columns-2',
      3: 'columns-1 sm:columns-2 lg:columns-3',
      4: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
    };

    const gapClasses = {
      sm: 'gap-3 sm:gap-4',
      md: 'gap-4 sm:gap-5 md:gap-6',
      lg: 'gap-5 sm:gap-6 md:gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn(columnClasses[columns], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveMasonryGrid.displayName = 'ResponsiveMasonryGrid';

/* ============================================
   MASONRY ITEM
   ============================================ */

interface MasonryItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap below item */
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveMasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  ({ className, gap = 'md', children, ...props }, ref) => {
    const gapClasses = {
      sm: 'mb-3 sm:mb-4',
      md: 'mb-4 sm:mb-5 md:mb-6',
      lg: 'mb-5 sm:mb-6 md:mb-8',
    };

    return (
      <div
        ref={ref}
        className={cn('break-inside-avoid', gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveMasonryItem.displayName = 'ResponsiveMasonryItem';

/* ============================================
   FORM GRID (Two-column forms)
   ============================================ */

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max columns on desktop */
  maxCols?: 2 | 3 | 4;
}

const ResponsiveFormGrid = React.forwardRef<HTMLDivElement, FormGridProps>(
  ({ className, maxCols = 2, children, ...props }, ref) => {
    const colClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    return (
      <div
        ref={ref}
        className={cn('grid gap-4 sm:gap-5 md:gap-6', colClasses[maxCols], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveFormGrid.displayName = 'ResponsiveFormGrid';

/* ============================================
   FORM FIELD (Grid-aware form field)
   ============================================ */

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Span full width */
  fullWidth?: boolean;
}

const ResponsiveFormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, fullWidth = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 sm:gap-2', fullWidth && 'col-span-full', className)}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveFormField.displayName = 'ResponsiveFormField';

/* ============================================
   SIDEBAR LAYOUT
   ============================================ */

interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right';
  /** Sidebar width */
  sidebarWidth?: string;
  /** Collapse sidebar on mobile */
  collapseMobile?: boolean;
}

const ResponsiveSidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  (
    {
      className,
      sidebarPosition = 'left',
      sidebarWidth = '280px',
      collapseMobile = true,
      children,
      ...props
    },
    ref
  ) => {
    // Extract sidebar and main content from children
    const childArray = React.Children.toArray(children);
    const sidebar = childArray.find(
      (child) => React.isValidElement(child) && child.type === ResponsiveSidebar
    );
    const mainContent = childArray.filter(
      (child) => !React.isValidElement(child) || child.type !== ResponsiveSidebar
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          collapseMobile ? 'flex-col lg:flex-row' : 'flex-row',
          sidebarPosition === 'right' && 'lg:flex-row-reverse',
          'gap-4 sm:gap-5 md:gap-6 lg:gap-8',
          className
        )}
        style={
          {
            '--sidebar-width': sidebarWidth,
          } as React.CSSProperties
        }
        {...props}
      >
        {sidebar}
        <div className="flex-1 min-w-0">{mainContent}</div>
      </div>
    );
  }
);

ResponsiveSidebarLayout.displayName = 'ResponsiveSidebarLayout';

/* ============================================
   SIDEBAR
   ============================================ */

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Sticky on scroll */
  sticky?: boolean;
}

const ResponsiveSidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, sticky = true, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        'w-full lg:w-[var(--sidebar-width)] lg:flex-shrink-0',
        sticky && 'lg:sticky lg:top-[calc(var(--header-height-md)+1rem)] lg:self-start',
        'lg:max-h-[calc(100vh-var(--header-height-md)-2rem)]',
        'lg:overflow-y-auto',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
);

ResponsiveSidebar.displayName = 'ResponsiveSidebar';

export {
  ResponsiveGrid,
  ResponsiveGridItem,
  ResponsiveCardGrid,
  ResponsiveMasonryGrid,
  ResponsiveMasonryItem,
  ResponsiveFormGrid,
  ResponsiveFormField,
  ResponsiveSidebarLayout,
  ResponsiveSidebar,
  responsiveGridVariants,
  gridItemVariants,
};
