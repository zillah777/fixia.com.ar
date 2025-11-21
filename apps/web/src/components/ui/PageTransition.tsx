import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { cn } from "./utils";

type TransitionVariant = "fade" | "slide" | "scale" | "slideUp";

interface PageTransitionProps {
    children: React.ReactNode;
    variant?: TransitionVariant;
    className?: string;
}

const variants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slide: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
};

/**
 * Page transition wrapper for React Router
 * Compatible with React Router 7.9.6
 * Respects prefers-reduced-motion
 * 
 * @example
 * ```tsx
 * // In your route component
 * <PageTransition variant="slideUp">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({
    children,
    variant = "slideUp",
    className,
}: PageTransitionProps) {
    const location = useLocation();
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const selectedVariant = prefersReducedMotion ? variants.fade : variants[variant];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={selectedVariant}
                transition={{
                    duration: 0.3,
                    ease: "easeOut",
                }}
                className={cn("w-full", className)}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
