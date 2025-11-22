import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

interface SuccessModalProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    primary?: boolean;
  }[];
  className?: string;
  showConfetti?: boolean;
}

/**
 * SuccessModal - Confirmation modal for successful operations
 * Provides clear feedback and next steps after user actions
 */
export function SuccessModal({
  title,
  description,
  icon,
  actions = [],
  className,
  showConfetti = false,
}: SuccessModalProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      className="relative"
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className={cn('glass max-w-md w-full', className)}>
          <CardHeader className="text-center space-y-4">
            {/* Icon or Default Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 blur-xl rounded-full" />
                {icon ? (
                  <div className="relative z-10 p-3 bg-success/10 rounded-full">
                    {icon}
                  </div>
                ) : (
                  <div className="relative z-10 p-3 bg-success/10 rounded-full">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl">{title}</CardTitle>
            </motion.div>

            {/* Description */}
            {description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardDescription className="text-base">
                  {description}
                </CardDescription>
              </motion.div>
            )}
          </CardHeader>

          {/* Actions */}
          {actions.length > 0 && (
            <CardContent className="space-y-3">
              {actions.map((action, idx) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <Button
                    onClick={action.onClick}
                    variant={action.variant || (action.primary ? 'default' : 'outline')}
                    className="w-full"
                  >
                    {action.label}
                    {action.primary && (
                      <ArrowRight className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}
    </motion.div>
  );
}

/**
 * Confetti component for celebratory effect
 */
function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{ left: `${piece.left}%`, top: '-10px' }}
          animate={{
            y: window.innerHeight + 20,
            opacity: [1, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

/**
 * useSuccessModal - Hook for managing success modal state
 */
export function useSuccessModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<SuccessModalProps | null>(null);

  const show = (successConfig: SuccessModalProps) => {
    setConfig(successConfig);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setConfig(null), 300);
  };

  return {
    isOpen,
    config,
    show,
    close,
  };
}
