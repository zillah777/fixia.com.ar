import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./utils";

interface ConfettiProps {
    active?: boolean;
    particleCount?: number;
    colors?: string[];
    duration?: number;
    className?: string;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
    delay: number;
}

/**
 * Subtle confetti celebration component
 * Uses Motion v12 for smooth particle animations
 * Canvas-free implementation for better performance
 * 
 * @example
 * ```tsx
 * const [celebrate, setCelebrate] = useState(false);
 * 
 * <Confetti active={celebrate} particleCount={20} />
 * <Button onClick={() => setCelebrate(true)}>Celebrate!</Button>
 * ```
 */
export function Confetti({
    active = false,
    particleCount = 30,
    colors = ['#667eea', '#764ba2', '#f093fb', '#51cf66', '#ffd93d'],
    duration = 2000,
    className,
}: ConfettiProps) {
    const [particles, setParticles] = React.useState<Particle[]>([]);

    React.useEffect(() => {
        if (active) {
            // Generate random particles
            const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                x: Math.random() * 100 - 50, // -50 to 50
                y: Math.random() * -100 - 50, // -150 to -50
                rotation: Math.random() * 360,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.2,
            }));

            setParticles(newParticles);

            // Clear particles after animation
            const timeout = setTimeout(() => {
                setParticles([]);
            }, duration);

            return () => clearTimeout(timeout);
        }

        return undefined;
    }, [active, particleCount, colors, duration]);

    return (
        <div className={cn("pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden", className)}>
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                            rotate: 0,
                            scale: 0,
                        }}
                        animate={{
                            x: particle.x,
                            y: particle.y,
                            opacity: 0,
                            rotate: particle.rotation,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: duration / 1000,
                            delay: particle.delay,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="absolute h-3 w-3 rounded-sm"
                        style={{
                            backgroundColor: particle.color,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
