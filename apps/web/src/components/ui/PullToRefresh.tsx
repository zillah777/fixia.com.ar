import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';
import { useHaptic } from '../../hooks/useHaptic';

export interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    threshold?: number;
    disabled?: boolean;
    className?: string;
}

export function PullToRefresh({
    children,
    onRefresh,
    threshold = 80,
    disabled = false,
    className,
}: PullToRefreshProps) {
    const { trigger } = useHaptic();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const pullDistance = useMotionValue(0);

    const opacity = useTransform(pullDistance, [0, threshold], [0, 1]);
    const rotate = useTransform(pullDistance, [0, threshold], [0, 360]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || isRefreshing) return;

        const container = containerRef.current;
        if (!container) return;

        // Only start if scrolled to top
        if (container.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || disabled || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY.current);

        // Apply resistance
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
        pullDistance.set(resistedDistance);

        // Haptic feedback at threshold
        if (resistedDistance >= threshold && pullDistance.get() < threshold) {
            trigger('medium');
        }
    }, [isPulling, disabled, isRefreshing, threshold, pullDistance, trigger]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        const distance = pullDistance.get();
        setIsPulling(false);

        if (distance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            trigger('success');

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                pullDistance.set(0);
            }
        } else {
            pullDistance.set(0);
        }
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, trigger]);

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-y-auto h-full', className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <motion.div
                style={{ opacity }}
                className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
            >
                <motion.div style={{ rotate }}>
                    <Loader2 className={cn(
                        'h-6 w-6',
                        isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'
                    )} />
                </motion.div>
            </motion.div>

            {/* Content with pull offset */}
            <motion.div
                style={{
                    y: isRefreshing ? threshold : pullDistance,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
