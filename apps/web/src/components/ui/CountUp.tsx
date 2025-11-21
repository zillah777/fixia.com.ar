import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface CountUpProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

/**
 * Animated number counter
 * Smoothly animates from 0 to target value
 * 
 * @example
 * ```tsx
 * <CountUp value={1234} duration={2} prefix="$" />
 * <CountUp value={98.5} decimals={1} suffix="%" />
 * ```
 */
export function CountUp({
    value,
    duration = 1,
    decimals = 0,
    prefix = "",
    suffix = "",
    className,
}: CountUpProps) {
    const count = useMotionValue(0);
    const [displayValue, setDisplayValue] = React.useState("0");

    React.useEffect(() => {
        const unsubscribe = count.on("change", (latest) => {
            setDisplayValue(latest.toFixed(decimals));
        });

        const controls = animate(count, value, { duration });

        return () => {
            unsubscribe();
            controls.stop();
        };
    }, [count, value, duration, decimals]);

    return (
        <span className={className}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}
