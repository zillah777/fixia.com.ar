import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook for scroll-triggered animations
 * Uses Intersection Observer for performance
 * 
 * @example
 * ```tsx
 * const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
 * 
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 50 }}
 *   animate={isVisible ? { opacity: 1, y: 0 } : {}}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
    options: ScrollAnimationOptions = {}
) {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // If already triggered and triggerOnce is true, don't observe
        if (triggerOnce && hasTriggered) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting;
                setIsVisible(visible);

                if (visible && triggerOnce) {
                    setHasTriggered(true);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce, hasTriggered]);

    return { ref, isVisible };
}
