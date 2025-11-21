import { useRef, useEffect, useCallback } from 'react';

export interface GestureConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onLongPress?: () => void;
    onDoubleTap?: () => void;
    swipeThreshold?: number;
    longPressDelay?: number;
    doubleTapDelay?: number;
}

export interface GestureData {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    deltaX: number;
    deltaY: number;
    startTime: number;
    isPressed: boolean;
}

export function useGesture(config: GestureConfig = {}) {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        onLongPress,
        onDoubleTap,
        swipeThreshold = 50,
        longPressDelay = 500,
        doubleTapDelay = 300,
    } = config;

    const gestureRef = useRef<GestureData>({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
        startTime: 0,
        isPressed: false,
    });

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const lastTapTime = useRef<number>(0);

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            const touch = e.touches[0];
            const now = Date.now();

            gestureRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                deltaX: 0,
                deltaY: 0,
                startTime: now,
                isPressed: true,
            };

            // Long press detection
            if (onLongPress) {
                longPressTimer.current = setTimeout(() => {
                    if (gestureRef.current.isPressed) {
                        onLongPress();
                    }
                }, longPressDelay);
            }

            // Double tap detection
            if (onDoubleTap) {
                const timeSinceLastTap = now - lastTapTime.current;
                if (timeSinceLastTap < doubleTapDelay) {
                    onDoubleTap();
                    lastTapTime.current = 0;
                } else {
                    lastTapTime.current = now;
                }
            }
        },
        [onLongPress, onDoubleTap, longPressDelay, doubleTapDelay]
    );

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!gestureRef.current.isPressed) return;

        const touch = e.touches[0];
        gestureRef.current.currentX = touch.clientX;
        gestureRef.current.currentY = touch.clientY;
        gestureRef.current.deltaX = touch.clientX - gestureRef.current.startX;
        gestureRef.current.deltaY = touch.clientY - gestureRef.current.startY;

        // Cancel long press if moved too much
        if (Math.abs(gestureRef.current.deltaX) > 10 || Math.abs(gestureRef.current.deltaY) > 10) {
            clearLongPressTimer();
        }
    }, [clearLongPressTimer]);

    const handleTouchEnd = useCallback(() => {
        clearLongPressTimer();

        if (!gestureRef.current.isPressed) return;

        const { deltaX, deltaY } = gestureRef.current;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine swipe direction
        if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
            if (absDeltaX > absDeltaY) {
                // Horizontal swipe
                if (deltaX > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (deltaX < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            } else {
                // Vertical swipe
                if (deltaY > 0 && onSwipeDown) {
                    onSwipeDown();
                } else if (deltaY < 0 && onSwipeUp) {
                    onSwipeUp();
                }
            }
        }

        gestureRef.current.isPressed = false;
    }, [clearLongPressTimer, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

    const bind = useCallback(() => {
        return {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
            onTouchCancel: handleTouchEnd,
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    useEffect(() => {
        return () => {
            clearLongPressTimer();
        };
    }, [clearLongPressTimer]);

    return {
        bind,
        gestures: gestureRef.current,
    };
}
