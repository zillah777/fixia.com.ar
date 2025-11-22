import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from './utils';

interface FormFieldErrorProps {
  error?: string;
  success?: string;
  description?: string;
  className?: string;
  id?: string;
}

/**
 * FormFieldError - Accessible form validation feedback
 * Provides inline error and success messages with proper ARIA attributes
 */
export function FormFieldError({
  error,
  success,
  description,
  className,
  id,
}: FormFieldErrorProps) {
  if (!error && !success && !description) return null;

  return (
    <div className={cn('text-sm', className)}>
      {error && (
        <div
          id={id ? `${id}-error` : undefined}
          className="flex items-center gap-2 text-destructive mt-2"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-2 text-success mt-2"
          role="status"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}
      {description && !error && !success && (
        <p
          id={id ? `${id}-description` : undefined}
          className="text-muted-foreground mt-2"
        >
          {description}
        </p>
      )}
    </div>
  );
}

interface FormFieldCharCountProps {
  current: number;
  max: number;
  className?: string;
  id?: string;
}

/**
 * FormFieldCharCount - Character counter for form fields
 * Shows current character count and warns when approaching limit
 */
export function FormFieldCharCount({
  current,
  max,
  className,
  id,
}: FormFieldCharCountProps) {
  const percentage = (current / max) * 100;
  const isWarning = percentage > 80;
  const isExceeded = current > max;

  return (
    <div
      className={cn('text-xs flex justify-end mt-1', className)}
      id={id ? `${id}-counter` : undefined}
      aria-live="polite"
    >
      <span
        className={cn(
          isExceeded
            ? 'text-destructive font-semibold'
            : isWarning
            ? 'text-yellow-500'
            : 'text-muted-foreground'
        )}
      >
        {current}/{max}
      </span>
    </div>
  );
}

interface FormFieldPasswordStrengthProps {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  className?: string;
  id?: string;
}

/**
 * FormFieldPasswordStrength - Password strength indicator
 * Provides visual feedback on password strength
 */
export function FormFieldPasswordStrength({
  strength,
  className,
  id,
}: FormFieldPasswordStrengthProps) {
  const strengthConfig = {
    weak: { color: 'bg-destructive', label: 'Muy débil', width: 'w-1/4' },
    fair: { color: 'bg-yellow-500', label: 'Débil', width: 'w-2/4' },
    good: { color: 'bg-blue-500', label: 'Buena', width: 'w-3/4' },
    strong: { color: 'bg-success', label: 'Fuerte', width: 'w-full' },
  };

  const config = strengthConfig[strength];

  return (
    <div className={cn('space-y-2 mt-2', className)}>
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full flex-1 bg-border transition-all duration-200',
              i < (strength === 'weak' ? 1 : strength === 'fair' ? 2 : strength === 'good' ? 3 : 4)
                ? config.color
                : 'bg-border'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <div
        className="text-xs text-muted-foreground flex justify-between"
        id={id ? `${id}-strength` : undefined}
      >
        <span>Fortaleza de contraseña:</span>
        <span className={strength === 'weak' ? 'text-destructive' : strength === 'fair' ? 'text-yellow-500' : strength === 'good' ? 'text-blue-500' : 'text-success'}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
