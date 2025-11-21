import * as React from "react";
import { motion } from "motion/react";
import { cn } from "./utils";

interface GradientTextProps extends Omit<React.ComponentProps<"span">, "onDrag" | "onDragStart" | "onDragEnd"> {
    gradient?: "primary" | "success" | "warning" | "rainbow" | "sunset";
    animate?: boolean;
}

const gradientPresets = {
    primary: "from-blue-400 via-purple-400 to-pink-400",
    success: "from-green-400 via-emerald-400 to-teal-400",
    warning: "from-yellow-400 via-orange-400 to-red-400",
    rainbow: "from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400",
    sunset: "from-orange-400 via-pink-400 to-purple-400",
};

/**
 * Text with animated gradient
 * Accessible with fallback to solid color
 * 
 * @example
 * ```tsx
 * <GradientText gradient="primary" animate>
 *   Beautiful Gradient Text
 * </GradientText>
 * ```
 */
export function GradientText({
    gradient = "primary",
    animate = false,
    className,
    children,
    ...props
}: GradientTextProps) {
    const gradientClass = gradientPresets[gradient];

    if (animate) {
        return (
            <motion.span
                className={cn(
                    "bg-gradient-to-r bg-clip-text text-transparent",
                    gradientClass,
                    "animate-gradient bg-[length:200%_auto]",
                    className
                )}
                animate={{
                    backgroundPosition: ["0% center", "200% center", "0% center"],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {children}
            </motion.span>
        );
    }

    return (
        <span
            className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                gradientClass,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
