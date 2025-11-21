import * as React from "react";
import { motion } from "motion/react";
import { cn } from "./utils";

interface MicroCelebrationProps {
    trigger: boolean;
    type?: "pulse" | "bounce" | "shake";
    children: React.ReactNode;
    className?: string;
}

/**
 * Micro-celebration wrapper for subtle success feedback
 * Triggers animation when action completes
 * 
 * @example
 * ```tsx
 * const [saved, setSaved] = useState(false);
 * 
 * <MicroCelebration trigger={saved} type="pulse">
 *   <Button onClick={() => setSaved(true)}>Save</Button>
 * </MicroCelebration>
 * ```
 */
export function MicroCelebration({
    trigger,
    type = "pulse",
    children,
    className,
}: MicroCelebrationProps) {
    return (
        <div className={cn("relative inline-block", className)}>
            <motion.div
                animate={
                    trigger
                        ? type === "pulse"
                            ? { scale: [1, 1.1, 1] }
                            : type === "bounce"
                                ? { y: [0, -10, 0] }
                                : { x: [0, -5, 5, -5, 5, 0] }
                        : {}
                }
                transition={{
                    duration: 0.4,
                    ease: "easeOut",
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
