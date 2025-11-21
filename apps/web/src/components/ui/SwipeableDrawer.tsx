import * as React from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import { X } from "lucide-react";
import { cn } from "./utils";
import { useHaptic } from "../../hooks/useHaptic";

interface SwipeableDrawerProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    position?: "bottom" | "top" | "left" | "right";
    className?: string;
}

/**
 * Swipeable drawer component for mobile
 * Supports swipe-to-dismiss gesture
 * Includes haptic feedback
 * 
 * @example
 * ```tsx
 * <SwipeableDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Filters"
 *   position="bottom"
 * >
 *   <FilterContent />
 * </SwipeableDrawer>
 * ```
 */
export function SwipeableDrawer({
    open,
    onClose,
    children,
    title,
    position = "bottom",
    className,
}: SwipeableDrawerProps) {
    const { trigger } = useHaptic();
    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, 300], [1, 0]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 150;

        if (position === "bottom" && info.offset.y > threshold) {
            trigger("light");
            onClose();
        } else if (position === "top" && info.offset.y < -threshold) {
            trigger("light");
            onClose();
        } else if (position === "left" && info.offset.x < -threshold) {
            trigger("light");
            onClose();
        } else if (position === "right" && info.offset.x > threshold) {
            trigger("light");
            onClose();
        }
    };

    const getPositionStyles = () => {
        switch (position) {
            case "bottom":
                return "bottom-0 left-0 right-0 rounded-t-2xl";
            case "top":
                return "top-0 left-0 right-0 rounded-b-2xl";
            case "left":
                return "left-0 top-0 bottom-0 rounded-r-2xl";
            case "right":
                return "right-0 top-0 bottom-0 rounded-l-2xl";
        }
    };

    const getInitialPosition = () => {
        switch (position) {
            case "bottom":
                return { y: "100%" };
            case "top":
                return { y: "-100%" };
            case "left":
                return { x: "-100%" };
            case "right":
                return { x: "100%" };
        }
    };

    const getDragConstraints = () => {
        switch (position) {
            case "bottom":
                return { top: 0, bottom: 0 };
            case "top":
                return { top: 0, bottom: 0 };
            case "left":
                return { left: 0, right: 0 };
            case "right":
                return { left: 0, right: 0 };
        }
    };

    const getDragDirection = () => {
        return position === "left" || position === "right" ? "x" : "y";
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
                initial={getInitialPosition()}
                animate={{ x: 0, y: 0 }}
                exit={getInitialPosition()}
                drag={getDragDirection()}
                dragConstraints={getDragConstraints()}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ y, opacity }}
                transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                }}
                className={cn(
                    "fixed z-50 glass-ultra border border-white/20 shadow-2xl",
                    getPositionStyles(),
                    className
                )}
            >
                {/* Drag Handle */}
                {(position === "bottom" || position === "top") && (
                    <div className="flex justify-center py-3">
                        <div className="h-1.5 w-12 rounded-full bg-white/30" />
                    </div>
                )}

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    {children}
                </div>
            </motion.div>
        </>
    );
}
