import * as React from "react";
import { motion } from "motion/react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { cn } from "./utils";

type RevealVariant = "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale" | "blur";

interface ScrollRevealProps {
    children: React.ReactNode;
    variant?: RevealVariant;
    delay?: number;
    duration?: number;
    threshold?: number;
    triggerOnce?: boolean;
    className?: string;
}

const variants = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    },
    slideDown: {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    },
    slideRight: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    },
    blur: {
        hidden: { opacity: 0, filter: "blur(10px)" },
        visible: { opacity: 1, filter: "blur(0px)" },
    },
};

/**
 * Scroll-triggered reveal animation wrapper
 * Automatically animates when element enters viewport
 * 
 * @example
 * ```tsx
 * <ScrollReveal variant="slideUp" delay={0.2}>
 *   <Card>Content that animates on scroll</Card>
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
    children,
    variant = "slideUp",
    delay = 0,
    duration = 0.6,
    threshold = 0.2,
    triggerOnce = true,
    className,
}: ScrollRevealProps) {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold, triggerOnce });
    const selectedVariant = variants[variant];

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={selectedVariant}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}
