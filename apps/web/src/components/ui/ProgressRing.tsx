import * as React from "react";
import { motion } from "motion/react";
import { cn } from "./utils";

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
    gradient?: boolean;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Circular progress indicator with optional gradient
 * SVG-based with Motion v12 animation
 * 
 * @example
 * ```tsx
 * <ProgressRing progress={75} gradient showPercentage />
 * <ProgressRing progress={profileCompletion} size={120}>
 *   <span className="text-sm">Profile</span>
 * </ProgressRing>
 * ```
 */
export function ProgressRing({
    progress,
    size = 100,
    strokeWidth = 8,
    showPercentage = false,
    gradient = false,
    className,
    children,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    {gradient && (
                        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="50%" stopColor="#764ba2" />
                            <stop offset="100%" stopColor="#f093fb" />
                        </linearGradient>
                    )}
                </defs>

                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted opacity-20"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={gradient ? "url(#progress-gradient)" : "currentColor"}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className={gradient ? "" : "text-primary"}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                    }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && !children && (
                    <motion.span
                        className="text-2xl font-semibold"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    >
                        {Math.round(progress)}%
                    </motion.span>
                )}
                {children}
            </div>
        </div>
    );
}
