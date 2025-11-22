import React from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'grid' | 'form' | 'profile';
  count?: number;
  className?: string;
}

/**
 * SkeletonLoader - Accessible loading state component
 * Provides visual feedback while content is loading
 */
export function SkeletonLoader({
  variant = 'card',
  count = 3,
  className,
}: SkeletonLoaderProps) {
  switch (variant) {
    case 'card':
      return (
        <motion.div
          className={cn('grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3', className)}
          role="status"
          aria-label="Loading content"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: 'easeOut' },
                },
              }}
            >
              <Card className="glass">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="pt-2">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      );

    case 'list':
      return (
        <motion.div
          className={cn('space-y-3', className)}
          role="status"
          aria-label="Loading items"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.4, ease: 'easeOut' },
                },
              }}
              className="flex gap-4"
            >
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      );

    case 'grid':
      return (
        <motion.div
          className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}
          role="status"
          aria-label="Loading grid items"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, ease: 'easeOut' },
                },
              }}
              className="space-y-2"
            >
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </motion.div>
          ))}
        </motion.div>
      );

    case 'form':
      return (
        <div
          className={cn('space-y-4', className)}
          role="status"
          aria-label="Loading form"
        >
          {[...Array(count)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div
          className={cn('space-y-6', className)}
          role="status"
          aria-label="Loading profile"
        >
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Card className="glass">
            <CardContent className="space-y-3 pt-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );

    default:
      return null;
  }
}

export { Skeleton };
