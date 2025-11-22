import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useDataWithState, usePaginatedData } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState, type EmptyStateProps } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DataListPattern - Reusable component for lists with semantic state management
 *
 * Combines useDataWithState + usePaginatedData for a complete list experience:
 * - Loading states with SkeletonLoader
 * - Empty states with animation
 * - Error handling with retry
 * - Pagination controls
 * - Staggered grid animations
 *
 * Usage:
 * <DataList
 *   fetchFn={() => api.getItems()}
 *   dependencies={[userId]}
 *   renderItem={(item) => <ItemCard item={item} />}
 *   layout="grid"
 *   emptyState={{
 *     icon: Briefcase,
 *     title: "No items",
 *     description: "Create one to get started"
 *   }}
 * />
 */

interface DataListPatternProps<T> {
  // Data fetching
  fetchFn: () => Promise<T[]>;
  dependencies?: any[];

  // Rendering
  renderItem: (item: T, index: number) => ReactNode;
  layout?: 'grid' | 'list';
  gridCols?: number;

  // Pagination
  enablePagination?: boolean;
  itemsPerPage?: number;

  // Empty state customization
  emptyState?: Partial<EmptyStateProps>;

  // Loading state customization
  skeletonVariant?: 'card' | 'list' | 'grid';
  skeletonCount?: number;

  // Callbacks
  onStateChange?: (state: 'loading' | 'empty' | 'error' | 'ready') => void;
  onError?: (error: Error) => void;

  // Styling
  className?: string;
  containerClassName?: string;
  itemClassName?: string;

  // Feature flags
  animateOnLoad?: boolean;
  showPaginationInfo?: boolean;
}

export const DataListPattern = React.forwardRef<
  HTMLDivElement,
  DataListPatternProps<any>
>(
  (
    {
      fetchFn,
      dependencies = [],
      renderItem,
      layout = 'grid',
      gridCols = 3,
      enablePagination = true,
      itemsPerPage = 12,
      emptyState: emptyStateCustom,
      skeletonVariant = layout === 'list' ? 'list' : 'grid',
      skeletonCount = itemsPerPage,
      onStateChange,
      onError,
      className,
      containerClassName,
      itemClassName,
      animateOnLoad = true,
      showPaginationInfo = true,
    },
    ref
  ) => {
    // Data fetching with semantic state
    const { data, state, error, refetch } = useDataWithState(
      fetchFn,
      dependencies,
      {
        onError,
      }
    );

    // Notify state changes
    React.useEffect(() => {
      onStateChange?.(state);
    }, [state, onStateChange]);

    // Pagination management
    const {
      page,
      pageSize,
      goToPage,
      nextPage,
      prevPage,
      canGoNext,
      canGoPrev,
      totalPages,
    } = usePaginatedData(data?.length || 0, {
      initialPageSize: itemsPerPage,
    });

    // Get paginated items
    const paginatedData = React.useMemo(() => {
      if (!data) return [];
      if (!enablePagination) return data;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return data.slice(start, end);
    }, [data, page, pageSize, enablePagination]);

    // Default empty state config
    const emptyStateConfig: EmptyStateProps = {
      title: 'No items found',
      description: 'Try adjusting your filters or check back later',
      ...emptyStateCustom,
    };

    // Render loading state
    if (state === 'loading') {
      return (
        <div ref={ref} className={cn('w-full', className)}>
          <SkeletonLoader
            variant={skeletonVariant}
            count={skeletonCount}
            className={containerClassName}
          />
        </div>
      );
    }

    // Render empty state
    if (state === 'empty') {
      return (
        <div ref={ref} className={cn('w-full', className)}>
          <EmptyState
            {...emptyStateConfig}
            animated={animateOnLoad}
          />
        </div>
      );
    }

    // Render error state
    if (state === 'error') {
      return (
        <div ref={ref} className={cn('w-full', className)}>
          <div className="p-6 border border-destructive rounded-lg bg-destructive/10 text-center">
            <p className="text-destructive font-semibold mb-4">
              {error?.message || 'Failed to load data'}
            </p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // Render content
    return (
      <div ref={ref} className={cn('w-full space-y-6', className)}>
        {/* Grid/List of items with staggered animation */}
        {layout === 'grid' ? (
          <motion.div
            className={cn(
              `grid gap-6`,
              `grid-cols-1 md:grid-cols-2 ${gridCols >= 3 ? 'lg:grid-cols-3' : ''}`,
              containerClassName
            )}
            initial={animateOnLoad ? 'hidden' : false}
            animate={animateOnLoad ? 'visible' : false}
            variants={
              animateOnLoad
                ? {
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0,
                      },
                    },
                  }
                : undefined
            }
          >
            {paginatedData.map((item, index) => (
              <motion.div
                key={index}
                variants={
                  animateOnLoad
                    ? {
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, ease: 'easeOut' },
                        },
                      }
                    : undefined
                }
                className={itemClassName}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className={cn('space-y-3', containerClassName)}
            initial={animateOnLoad ? 'hidden' : false}
            animate={animateOnLoad ? 'visible' : false}
            variants={
              animateOnLoad
                ? {
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }
                : undefined
            }
          >
            {paginatedData.map((item, index) => (
              <motion.div
                key={index}
                variants={
                  animateOnLoad
                    ? {
                        hidden: { opacity: 0, x: -20 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.4, ease: 'easeOut' },
                        },
                      }
                    : undefined
                }
                className={itemClassName}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 pt-4">
            {showPaginationInfo && (
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({data?.length} total items)
              </p>
            )}

            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={prevPage}
                disabled={!canGoPrev}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={pageNum === page ? 'default' : 'outline'}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                size="sm"
                variant="outline"
                onClick={nextPage}
                disabled={!canGoNext}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataListPattern.displayName = 'DataListPattern';

/**
 * USAGE EXAMPLES
 *
 * 1. Simple Grid
 * <DataListPattern
 *   fetchFn={() => api.getServices()}
 *   renderItem={(service) => <ServiceCard service={service} />}
 *   layout="grid"
 *   gridCols={3}
 * />
 *
 * 2. List with Pagination
 * <DataListPattern
 *   fetchFn={() => api.getOpportunities()}
 *   dependencies={[filters]}
 *   renderItem={(opp) => <OpportunityCard opportunity={opp} />}
 *   layout="list"
 *   enablePagination={true}
 *   itemsPerPage={10}
 * />
 *
 * 3. Custom Empty State
 * <DataListPattern
 *   fetchFn={() => api.getUserServices(userId)}
 *   renderItem={(service) => <ServiceCard service={service} />}
 *   emptyState={{
 *     icon: Search,
 *     title: "No services yet",
 *     description: "Create your first service",
 *     action: {
 *       label: "Create Service",
 *       onClick: () => navigate('/services/new')
 *     }
 *   }}
 * />
 *
 * 4. List with State Change Tracking
 * <DataListPattern
 *   fetchFn={async () => {
 *     // Simulate loading
 *     await new Promise(r => setTimeout(r, 1000));
 *     return api.getData();
 *   }}
 *   renderItem={(item) => <Item data={item} />}
 *   onStateChange={(newState) => {
 *     console.log('Data state changed to:', newState);
 *   }}
 *   onError={(error) => {
 *     console.error('Data fetch failed:', error);
 *   }}
 * />
 */
