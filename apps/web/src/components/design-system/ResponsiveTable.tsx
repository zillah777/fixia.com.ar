/**
 * FIXIA RESPONSIVE TABLE COMPONENT
 * World-class responsive table with card view on mobile
 *
 * Features:
 * - Horizontal scroll on mobile with sticky headers
 * - Card-based view option for mobile
 * - Sticky first column option
 * - Sortable headers
 * - WCAG AA accessible
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

/* ============================================
   TABLE CONTEXT
   ============================================ */

interface TableContextValue {
  isMobile: boolean;
  displayMode: 'table' | 'cards';
  stickyHeader: boolean;
  stickyFirstColumn: boolean;
}

const TableContext = React.createContext<TableContextValue>({
  isMobile: false,
  displayMode: 'table',
  stickyHeader: false,
  stickyFirstColumn: false,
});

const useTableContext = () => React.useContext(TableContext);

/* ============================================
   TABLE CONTAINER
   ============================================ */

const tableContainerVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'glass rounded-xl sm:rounded-2xl overflow-hidden',
      bordered: 'border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden',
      simple: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface ResponsiveTableProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableContainerVariants> {
  children: React.ReactNode;
  /** Force card display on mobile */
  mobileCards?: boolean;
  /** Breakpoint for switching to cards */
  mobileBreakpoint?: number;
  /** Sticky header on scroll */
  stickyHeader?: boolean;
  /** Sticky first column */
  stickyFirstColumn?: boolean;
}

const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  (
    {
      className,
      variant,
      children,
      mobileCards = false,
      mobileBreakpoint = 768,
      stickyHeader = true,
      stickyFirstColumn = false,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < mobileBreakpoint);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, [mobileBreakpoint]);

    const displayMode = mobileCards && isMobile ? 'cards' : 'table';

    const contextValue = React.useMemo(
      () => ({
        isMobile,
        displayMode,
        stickyHeader,
        stickyFirstColumn,
      }),
      [isMobile, displayMode, stickyHeader, stickyFirstColumn]
    );

    return (
      <TableContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(tableContainerVariants({ variant }), className)}
          {...props}
        >
          {displayMode === 'table' ? (
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              {children}
            </div>
          ) : (
            <div className="p-3 sm:p-4">{children}</div>
          )}
        </div>
      </TableContext.Provider>
    );
  }
);

ResponsiveTable.displayName = 'ResponsiveTable';

/* ============================================
   TABLE ELEMENT
   ============================================ */

const TableElement = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, children, ...props }, ref) => {
  const { displayMode } = useTableContext();

  if (displayMode === 'cards') {
    return <div className="flex flex-col gap-3">{children}</div>;
  }

  return (
    <table
      ref={ref}
      className={cn('w-full min-w-[600px] border-collapse', className)}
      {...props}
    >
      {children}
    </table>
  );
});

TableElement.displayName = 'TableElement';

/* ============================================
   TABLE HEADER
   ============================================ */

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Column headers for card view */
  columns?: string[];
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, columns, ...props }, ref) => {
    const { displayMode, stickyHeader } = useTableContext();

    if (displayMode === 'cards') {
      return null; // Headers shown inline in card view
    }

    return (
      <thead
        ref={ref}
        className={cn(
          'border-b border-white/10',
          stickyHeader && 'sticky top-0 z-10 bg-card/95 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

/* ============================================
   TABLE BODY
   ============================================ */

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => {
  const { displayMode } = useTableContext();

  if (displayMode === 'cards') {
    return <div className="flex flex-col gap-3">{children}</div>;
  }

  return (
    <tbody ref={ref} className={cn('divide-y divide-white/5', className)} {...props}>
      {children}
    </tbody>
  );
});

TableBody.displayName = 'TableBody';

/* ============================================
   TABLE ROW
   ============================================ */

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Clickable row */
  interactive?: boolean;
  /** Data labels for card view */
  labels?: string[];
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, interactive = false, labels, children, onClick, ...props }, ref) => {
    const { displayMode } = useTableContext();

    if (displayMode === 'cards') {
      const cells = React.Children.toArray(children);

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'glass rounded-xl p-3 sm:p-4',
            'border border-white/10',
            interactive && 'cursor-pointer active:scale-[0.98] transition-transform',
            className
          )}
          onClick={onClick as any}
        >
          <div className="flex flex-col gap-2.5">
            {cells.map((cell, index) => {
              if (!React.isValidElement(cell)) return null;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  {labels?.[index] && (
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium flex-shrink-0">
                      {labels[index]}
                    </span>
                  )}
                  <span className="text-sm text-right">{cell.props.children}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    return (
      <tr
        ref={ref}
        className={cn(
          'transition-colors duration-150',
          interactive && [
            'cursor-pointer',
            'hover:bg-white/5',
            'active:bg-white/10',
          ],
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

/* ============================================
   TABLE HEAD CELL
   ============================================ */

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Sortable column */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Sort callback */
  onSort?: () => void;
  /** Sticky column */
  sticky?: boolean;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      sortable = false,
      sortDirection = null,
      onSort,
      sticky = false,
      children,
      ...props
    },
    ref
  ) => {
    const { stickyFirstColumn } = useTableContext();

    return (
      <th
        ref={ref}
        className={cn(
          'px-3 py-3 sm:px-4 sm:py-4',
          'text-left text-xs sm:text-sm font-semibold text-foreground',
          'whitespace-nowrap',
          sortable && 'cursor-pointer select-none hover:text-primary transition-colors',
          (sticky || stickyFirstColumn) && 'sticky left-0 bg-card/95 backdrop-blur-sm z-20',
          className
        )}
        onClick={sortable ? onSort : undefined}
        aria-sort={
          sortDirection
            ? sortDirection === 'asc'
              ? 'ascending'
              : 'descending'
            : undefined
        }
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {children}
          {sortable && (
            <span className="flex flex-col">
              <svg
                className={cn(
                  'w-2.5 h-2.5 -mb-0.5',
                  sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'
                )}
                viewBox="0 0 10 6"
                fill="currentColor"
              >
                <path d="M5 0L10 6H0L5 0Z" />
              </svg>
              <svg
                className={cn(
                  'w-2.5 h-2.5 -mt-0.5',
                  sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'
                )}
                viewBox="0 0 10 6"
                fill="currentColor"
              >
                <path d="M5 6L0 0H10L5 6Z" />
              </svg>
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

/* ============================================
   TABLE CELL
   ============================================ */

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Sticky column */
  sticky?: boolean;
  /** Truncate long content */
  truncate?: boolean;
  /** Max width for truncation */
  maxWidth?: string;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, sticky = false, truncate = false, maxWidth, children, ...props }, ref) => {
    const { stickyFirstColumn, displayMode } = useTableContext();

    if (displayMode === 'cards') {
      return <span>{children}</span>;
    }

    return (
      <td
        ref={ref}
        className={cn(
          'px-3 py-3 sm:px-4 sm:py-4',
          'text-sm text-foreground/90',
          truncate && 'truncate',
          (sticky || stickyFirstColumn) &&
            'sticky left-0 bg-card/95 backdrop-blur-sm z-10',
          className
        )}
        style={{ maxWidth: truncate ? maxWidth || '200px' : undefined }}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

/* ============================================
   TABLE FOOTER
   ============================================ */

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => {
  const { displayMode } = useTableContext();

  if (displayMode === 'cards') {
    return (
      <div
        className={cn('pt-3 border-t border-white/10 mt-3', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-white/10',
        'bg-white/5',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
});

TableFooter.displayName = 'TableFooter';

/* ============================================
   TABLE CAPTION
   ============================================ */

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, children, ...props }, ref) => {
  const { displayMode } = useTableContext();

  if (displayMode === 'cards') {
    return (
      <div
        className={cn(
          'text-xs sm:text-sm text-muted-foreground text-center',
          'py-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <caption
      ref={ref}
      className={cn(
        'text-xs sm:text-sm text-muted-foreground text-center',
        'py-3',
        className
      )}
      {...props}
    >
      {children}
    </caption>
  );
});

TableCaption.displayName = 'TableCaption';

/* ============================================
   EMPTY STATE
   ============================================ */

interface TableEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  className,
  icon,
  title = 'No data available',
  description,
  action,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center',
      'py-12 px-4',
      'text-center',
      className
    )}
    {...props}
  >
    {icon && (
      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-muted-foreground/50">
        {icon}
      </div>
    )}
    <h3 className="text-base sm:text-lg font-medium text-foreground mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ============================================
   LOADING STATE
   ============================================ */

interface TableLoadingStateProps {
  rows?: number;
  columns?: number;
}

const TableLoadingState: React.FC<TableLoadingStateProps> = ({
  rows = 5,
  columns = 4,
}) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <div className="h-4 bg-white/10 rounded animate-pulse" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export {
  ResponsiveTable,
  TableElement,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
  TableEmptyState,
  TableLoadingState,
  useTableContext,
};
