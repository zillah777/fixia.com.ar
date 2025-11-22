import * as React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  } | {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }[];
  animated?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, animated = true, ...props }, ref) => {
    const actions = Array.isArray(action) ? action : action ? [action] : [];

    const content = (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-6 text-center",
          className
        )}
        {...props}
        role="status"
        aria-label={`Empty state: ${title}`}
      >
        {Icon && (
          <motion.div
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={animated ? { duration: 0.3 } : undefined}
            className="h-14 w-14 rounded-xl glass-medium flex items-center justify-center mx-auto mb-4"
          >
            <motion.div
              animate={animated ? { y: [0, -10, 0] } : false}
              transition={animated ? { duration: 3, repeat: Infinity } : undefined}
            >
              {React.isValidElement(Icon) ? (
                Icon
              ) : typeof Icon === 'function' ? (
                <Icon className="h-7 w-7 text-muted-foreground" />
              ) : (
                Icon
              )}
            </motion.div>
          </motion.div>
        )}
        <motion.h3
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={animated ? { duration: 0.3, delay: 0.1 } : undefined}
          className="text-lg font-semibold mb-2"
        >
          {title}
        </motion.h3>
        {description && (
          <motion.p
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : false}
            transition={animated ? { duration: 0.3, delay: 0.2 } : undefined}
            className="text-sm text-muted-foreground max-w-md mb-6"
          >
            {description}
          </motion.p>
        )}
        {actions.length > 0 && (
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : false}
            transition={animated ? { duration: 0.3, delay: 0.3 } : undefined}
            className="flex gap-3 flex-wrap justify-center"
          >
            {actions.map((btn, idx) => (
              <Button
                key={idx}
                onClick={btn.onClick}
                variant={btn.variant || 'default'}
                size="sm"
              >
                {btn.label}
              </Button>
            ))}
          </motion.div>
        )}
      </div>
    );

    return animated ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    ) : (
      content
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
