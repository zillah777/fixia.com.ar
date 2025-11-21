import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { cn } from './utils';
import { useHaptic } from '../../hooks/useHaptic';
import { LucideIcon } from 'lucide-react';

export interface SwipeAction {
    icon: LucideIcon;
    label: string;
    color: 'red' | 'green' | 'blue' | 'yellow' | 'purple';
    onClick: () => void;
}

export interface SwipeableCardProps {
    children: React.ReactNode;
    leftAction?: SwipeAction;
    rightAction?: SwipeAction;
    threshold?: number;
    className?: string;
    disabled?: boolean;
}

const colorClasses = {
    red: 'bg-red-500/20 text-red-500',
    green: 'bg-green-500/20 text-green-500',
    blue: 'bg-blue-500/20 text-blue-500',
    yellow: 'bg-yellow-500/20 text-yellow-500',
    purple: 'bg-purple-500/20 text-purple-500',
};

export function SwipeableCard({
    children,
    leftAction,
    rightAction,
    threshold = 100,
    className,
    disabled = false,
}: SwipeableCardProps) {
    const { trigger } = useHaptic();
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const hasTriggered = useRef(false);

    const leftOpacity = useTransform(x, [-threshold, 0], [1, 0]);
    const rightOpacity = useTransform(x, [0, threshold], [0, 1]);

    const handleDragStart = () => {
        setIsDragging(true);
        hasTriggered.current = false;
    };

    const handleDrag = (_: any, info: PanInfo) => {
        const offset = info.offset.x;

        // Trigger haptic at threshold
        if (!hasTriggered.current) {
            if ((offset < -threshold && leftAction) || (offset > threshold && rightAction)) {
                trigger('medium');
                hasTriggered.current = true;
            }
        }
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        setIsDragging(false);
        const offset = info.offset.x;

        // Execute action if threshold exceeded
        if (offset < -threshold && leftAction) {
            trigger('success');
            leftAction.onClick();
        } else if (offset > threshold && rightAction) {
            trigger('success');
            rightAction.onClick();
        }

        // Reset position
        x.set(0);
    };

    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className="relative overflow-hidden">
            {/* Left action background */}
            {leftAction && (
                <motion.div
                    style={{ opacity: leftOpacity }}
                    className={cn(
                        'absolute inset-y-0 left-0 flex items-center justify-start px-6',
                        colorClasses[leftAction.color]
                    )}
                >
                    <div className="flex items-center gap-2">
                        <leftAction.icon className="h-6 w-6" />
                        <span className="font-medium">{leftAction.label}</span>
                    </div>
                </motion.div>
            )}

            {/* Right action background */}
            {rightAction && (
                <motion.div
                    style={{ opacity: rightOpacity }}
                    className={cn(
                        'absolute inset-y-0 right-0 flex items-center justify-end px-6',
                        colorClasses[rightAction.color]
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{rightAction.label}</span>
                        <rightAction.icon className="h-6 w-6" />
                    </div>
                </motion.div>
            )}

            {/* Swipeable content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: leftAction ? -threshold * 1.5 : 0, right: rightAction ? threshold * 1.5 : 0 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={cn(
                    'relative bg-background',
                    isDragging && 'cursor-grabbing',
                    !isDragging && 'cursor-grab',
                    className
                )}
            >
                {children}
            </motion.div>
        </div>
    );
}
