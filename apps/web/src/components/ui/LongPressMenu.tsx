import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from './utils';
import { useHaptic } from '../../hooks/useHaptic';

export interface MenuItem {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}

export interface LongPressMenuProps {
    children: React.ReactNode;
    items: MenuItem[];
    delay?: number;
    disabled?: boolean;
    className?: string;
}

export function LongPressMenu({
    children,
    items,
    delay = 500,
    disabled = false,
    className,
}: LongPressMenuProps) {
    const { trigger } = useHaptic();
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;

        const touch = e.touches[0];
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Calculate menu position
        let x = touch.clientX;
        let y = touch.clientY;

        // Adjust if too close to edges
        const menuWidth = 200;
        const menuHeight = items.length * 48;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 16;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 16;
        }

        setPosition({ x, y });

        // Start long press timer
        longPressTimer.current = setTimeout(() => {
            trigger('medium');
            setIsOpen(true);
        }, delay);
    };

    const handleTouchMove = () => {
        // Cancel long press if moved
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.disabled) return;

        trigger('light');
        item.onClick();
        setIsOpen(false);
    };

    const handleBackdropClick = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                className={cn('relative', className)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>

            {/* Menu portal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleBackdropClick}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                            }}
                            style={{
                                position: 'fixed',
                                left: position.x,
                                top: position.y,
                            }}
                            className="z-50 min-w-[200px] glass-strong rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleItemClick(item)}
                                    disabled={item.disabled}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                        'hover:bg-white/10 active:bg-white/20',
                                        'disabled:opacity-50 disabled:cursor-not-allowed',
                                        item.danger && 'text-red-500',
                                        !item.danger && 'text-foreground',
                                        index !== items.length - 1 && 'border-b border-white/5'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
