import * as React from "react";
import { motion, useScroll, useSpring } from "motion/react";

interface ScrollProgressProps {
    className?: string;
}

/**
 * Scroll progress indicator
 * Shows reading progress at top of page
 * 
 * @example
 * ```tsx
 * // In your layout or page component
 * <ScrollProgress />
 * ```
 */
export function ScrollProgress({ className }: ScrollProgressProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className={className || "scroll-progress"}
            style={{ scaleX }}
        />
    );
}
