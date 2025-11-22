import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useDataWithState } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState, type EmptyStateProps } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ListPageTemplate - Complete list page layout with all states handled
 *
 * Provides a full page template with:
 * - Header section with title and description
 * - Filter/search section
 * - Content area with semantic state management
 * - Loading skeletons
 * - Empty state with actions
 * - Error handling with retry
 *
 * Usage:
 * <ListPageTemplate
 *   title="Opportunities"
 *   description="Find exciting projects to work on"
 *   fetchFn={() => api.getOpportunities()}
 *   renderItem={(item) => <Card item={item} />}
 *   renderFilters={() => <FilterPanel />}
 * />
 */

interface ListPageTemplateProps<T> {
  // Page content
  title: string;
  description?: string;
  subtitle?: string;

  // Data fetching
  fetchFn: () => Promise<T[]>;
  dependencies?: any[];

  // Rendering
  renderItem: (item: T, index: number) => ReactNode;
  renderFilters?: () => ReactNode;
  renderHeader?: () => ReactNode;

  // Layout
  layout?: 'grid' | 'list';
  gridCols?: number;
  containerClassName?: string;

  // States
  emptyState?: Partial<EmptyStateProps>;
  errorState?: {
    title?: string;
    description?: string;
    showRetryButton?: boolean;
  };

  // Callbacks
  onStateChange?: (state: 'loading' | 'empty' | 'error' | 'ready') => void;
  onRefresh?: () => void;

  // Features
  showRefreshButton?: boolean;
  animateOnLoad?: boolean;
}

export const ListPageTemplate = React.forwardRef<
  HTMLDivElement,
  ListPageTemplateProps<any>
>(
  (
    {
      title,
      description,
      subtitle,
      fetchFn,
      dependencies = [],
      renderItem,
      renderFilters,
      renderHeader,
      layout = 'grid',
      gridCols = 3,
      containerClassName,
      emptyState: emptyStateCustom,
      errorState: errorStateCustom = {},
      onStateChange,
      onRefresh,
      showRefreshButton = true,
      animateOnLoad = true,
    },
    ref
  ) => {
    // Data management with semantic state
    const { data, state, error, refetch } = useDataWithState(
      fetchFn,
      dependencies
    );

    // Notify state changes
    React.useEffect(() => {
      onStateChange?.(state);
    }, [state, onStateChange]);

    // Handle refresh
    const handleRefresh = React.useCallback(() => {
      refetch();
      onRefresh?.();
    }, [refetch, onRefresh]);

    // Default empty state
    const emptyStateConfig: EmptyStateProps = {
      title: 'No items found',
      description: 'Try adjusting your filters or check back later',
      ...emptyStateCustom,
    };

    // Default error state
    const errorConfig = {
      title: 'Failed to load data',
      description: error?.message || 'Something went wrong. Please try again.',
      showRetryButton: true,
      ...errorStateCustom,
    };

    return (
      <div ref={ref} className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-b border-white/10 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm sticky top-0 z-10"
        >
          <div className="container mx-auto px-4 md:px-6 py-8">
            {renderHeader ? (
              renderHeader()
            ) : (
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="space-y-2">
                  <h1 className="text-gradient-header text-3xl md:text-4xl">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-muted-foreground text-lg">
                      {description}
                    </p>
                  )}
                  {subtitle && (
                    <p className="text-sm text-muted-foreground/70">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showRefreshButton && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={state === 'loading'}
                      aria-label="Refresh data"
                    >
                      <RefreshCw
                        className={cn(
                          'h-4 w-4 mr-2',
                          state === 'loading' && 'animate-spin'
                        )}
                      />
                      Refresh
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Filters Section */}
          {renderFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="border-t border-white/10 bg-gradient-to-b from-background/50 to-transparent"
            >
              <div className="container mx-auto px-4 md:px-6 py-6">
                {renderFilters()}
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="container mx-auto px-4 md:px-6 py-12"
        >
          {/* Loading State */}
          {state === 'loading' && (
            <SkeletonLoader
              variant={layout === 'list' ? 'list' : 'grid'}
              count={gridCols === 3 ? 6 : gridCols === 2 ? 4 : 3}
              className={containerClassName}
            />
          )}

          {/* Empty State */}
          {state === 'empty' && (
            <EmptyState
              {...emptyStateConfig}
              animated={animateOnLoad}
            />
          )}

          {/* Error State */}
          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/20 p-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-destructive mb-2">
                {errorConfig.title}
              </h3>
              <p className="text-sm text-destructive/80 mb-6 max-w-md mx-auto">
                {errorConfig.description}
              </p>
              {errorConfig.showRetryButton && (
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              )}
            </motion.div>
          )}

          {/* Content Grid/List */}
          {state === 'ready' && (
            <motion.div
              className={cn(
                layout === 'grid'
                  ? `grid gap-6 grid-cols-1 md:grid-cols-2 ${gridCols >= 3 ? 'lg:grid-cols-3' : ''}`
                  : 'space-y-4',
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
                          delayChildren: 0.2,
                        },
                      },
                    }
                  : undefined
              }
            >
              {data?.map((item, index) => (
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
                >
                  {renderItem(item, index)}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.main>
      </div>
    );
  }
);

ListPageTemplate.displayName = 'ListPageTemplate';

/**
 * USAGE EXAMPLE
 *
 * Perfect for OpportunitiesPage:
 *
 * <ListPageTemplate
 *   title="Find Opportunities"
 *   description="Discover exciting projects from verified clients"
 *   subtitle="Showing 24 opportunities"
 *   fetchFn={() => api.getOpportunities()}
 *   dependencies={[filters]}
 *   renderItem={(opp) => <OpportunityCard opportunity={opp} />}
 *   renderFilters={() => (
 *     <div className="flex gap-4">
 *       <FilterInput label="Category" />
 *       <FilterInput label="Budget Range" />
 *       <FilterInput label="Duration" />
 *     </div>
 *   )}
 *   emptyState={{
 *     icon: Briefcase,
 *     title: "No opportunities match your filters",
 *     description: "Try adjusting your criteria to see more",
 *     action: {
 *       label: "Clear Filters",
 *       onClick: () => clearFilters()
 *     }
 *   }}
 *   onStateChange={(state) => {
 *     if (state === 'ready') {
 *       console.log('Data loaded successfully');
 *     }
 *   }}
 * />
 */
