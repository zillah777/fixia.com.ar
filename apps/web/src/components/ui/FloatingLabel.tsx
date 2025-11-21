import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./utils";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
}

/**
 * Input with floating label animation
 * Material Design 3 style
 * 
 * @example
 * ```tsx
 * <FloatingLabel
 *   label="Email"
 *   type="email"
 *   error={errors.email}
 * />
 * ```
 */
export const FloatingLabel = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);

        const isFloating = isFocused || hasValue;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
        };

        return (
            <div className="relative w-full">
                {/* Input */}
                <input
                    ref={ref}
                    {...props}
                    onChange={handleChange}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={cn(
                        "peer w-full rounded-lg border bg-background px-4 pb-2 pt-6 text-sm transition-all",
                        "focus:outline-none focus:ring-2",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/10 focus:border-primary focus:ring-primary/20",
                        "placeholder-transparent",
                        className
                    )}
                    placeholder={label}
                />

                {/* Floating Label */}
                <motion.label
                    initial={false}
                    animate={{
                        y: isFloating ? -8 : 8,
                        scale: isFloating ? 0.85 : 1,
                        color: error ? "#ef4444" : isFocused ? "var(--primary)" : "var(--muted-foreground)",
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                    }}
                    className={cn(
                        "absolute left-4 origin-left pointer-events-none",
                        "transition-colors duration-200"
                    )}
                >
                    {label}
                </motion.label>

                {/* Helper Text / Error */}
                <AnimatePresence mode="wait">
                    {(error || helperText) && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "mt-1.5 text-xs",
                                error ? "text-red-500" : "text-muted-foreground"
                            )}
                        >
                            {error || helperText}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

FloatingLabel.displayName = "FloatingLabel";
