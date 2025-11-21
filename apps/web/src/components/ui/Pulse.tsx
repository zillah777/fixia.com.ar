import * as React from "react";
import { motion } from "motion/react";
import { cn } from "./utils";

interface PulseProps {
    children: React.ReactNode;
    color?: string;
    size?: "sm" | "md" | "lg";
    speed?: "slow" | "normal" | "fast";
    className?: string;
}

const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
};

const speedDurations = {
    slow: 2,
    normal: 1.5,
    fast: 1,
};

/**
 * Pulsing indicator for live status
 * Perfect for "online", "recording", "live" indicators
 * 
 * @example
 * ```tsx
 * <Pulse color="green" size="sm">
 *   <span>Online</span>
 * </Pulse>
 * ```
 */
export function Pulse({
    children,
    color = "green",
    size = "sm",
    speed = "normal",
    className,
}: PulseProps) {
    const duration = speedDurations[speed];

    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            <div className="relative">
                {/* Pulse ring */}
                <motion.span
                    className={cn(
                        "absolute inset-0 rounded-full opacity-75",
                        `bg-${color}-500`
                    )}
                    animate={{
                        scale: [1, 2],
                        opacity: [0.75, 0],
                    }}
                    transition={{
                        duration,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                />

                {/* Dot */}
                <span
                    className={cn(
                        "relative block rounded-full",
                        sizeClasses[size],
                        `bg-${color}-500`
                    )}
                />
            </div>
            {children}
        </div>
    );
}
