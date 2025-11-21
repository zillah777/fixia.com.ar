import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "./utils";

interface ParallaxSectionProps {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}

/**
 * Parallax scrolling effect
 * Creates depth with scroll-based transforms
 * 
 * @example
 * ```tsx
 * <ParallaxSection speed={0.5}>
 *   <img src="background.jpg" alt="Background" />
 * </ParallaxSection>
 * ```
 */
export function ParallaxSection({
    children,
    speed = 0.5,
    className,
}: ParallaxSectionProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

    return (
        <div ref={ref} className={cn("relative overflow-hidden", className)}>
            <motion.div style={{ y }}>
                {children}
            </motion.div>
        </div>
    );
}
