import { useCallback, useEffect, useState } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface UseHapticReturn {
    isSupported: boolean;
    trigger: (pattern?: HapticPattern) => void;
}

/**
 * Modern haptic feedback hook for mobile devices
 * Uses the Vibration API with safe fallbacks
 * Respects user's prefers-reduced-motion preference
 * 
 * @example
 * ```tsx
 * const { isSupported, trigger } = useHaptic();
 * 
 * <button onClick={() => trigger('light')}>
 *   Tap me (with haptic feedback)
 * </button>
 * ```
 */
export const useHaptic = (): UseHapticReturn => {
    const [isSupported, setIsSupported] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check if Vibration API is supported
        setIsSupported('vibrate' in navigator);

        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const trigger = useCallback((pattern: HapticPattern = 'light') => {
        // Don't vibrate if not supported or user prefers reduced motion
        if (!isSupported || prefersReducedMotion) return;

        // Vibration patterns (in milliseconds)
        const patterns: Record<HapticPattern, number | number[]> = {
            light: 10,
            medium: 20,
            heavy: 30,
            success: [10, 50, 10], // Double tap
            warning: [20, 100, 20, 100, 20], // Triple tap
            error: 50, // Single strong vibration
        };

        const vibrationPattern = patterns[pattern];

        try {
            if (Array.isArray(vibrationPattern)) {
                navigator.vibrate(vibrationPattern);
            } else {
                navigator.vibrate(vibrationPattern);
            }
        } catch (error) {
            // Silently fail if vibration fails
            console.debug('Haptic feedback failed:', error);
        }
    }, [isSupported, prefersReducedMotion]);

    return { isSupported, trigger };
};
