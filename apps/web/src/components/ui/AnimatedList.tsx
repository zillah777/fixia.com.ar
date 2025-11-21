import * as React from "react";
import { motion } from "motion/react";
import { cn } from "./utils";

interface AnimatedListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
    itemClassName?: string;
    staggerDelay?: number;
    useIntersectionObserver?: boolean;
}

/**
 * Animated list wrapper with stagger animation
 * Uses Motion v12 staggerChildren for smooth entrance
 * Optional Intersection Observer for performance
 * 
 * @example
 * ```tsx
 * <AnimatedList
 *   items={services}
 *   renderItem={(service, index) => (
 *     <ServiceCard key={service.id} service={service} />
 *   )}
 *   staggerDelay={0.05}
 * />
 * ```
 */
export function AnimatedList<T>({
    items,
    renderItem,
    className,
    itemClassName,
    staggerDelay = 0.05,
    useIntersectionObserver = true,
}: AnimatedListProps<T>) {
    const [isVisible, setIsVisible] = React.useState(!useIntersectionObserver);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!useIntersectionObserver) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [useIntersectionObserver]);

    return (
        <motion.div
            ref={ref}
            className={cn("grid gap-4", className)}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: 0.1,
                    },
                },
            }}
        >
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    className={itemClassName}
                    variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.95 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                            },
                        },
                    }}
                >
                    {renderItem(item, index)}
                </motion.div>
            ))}
        </motion.div>
    );
}
