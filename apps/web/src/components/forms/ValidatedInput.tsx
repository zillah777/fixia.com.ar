import React, { memo, forwardRef, useCallback } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../ui/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  success?: string;
  helperText?: string;
  showValidationIcon?: boolean;
  onFieldChange?: (name: string, value: string) => void;
  onFieldBlur?: (name: string) => void;
  onFieldFocus?: (name: string) => void;
}

export const ValidatedInput = memo(forwardRef<HTMLInputElement, ValidatedInputProps>(({
  label,
  error,
  warning,
  success,
  helperText,
  showValidationIcon = true,
  onFieldChange,
  onFieldBlur,
  onFieldFocus,
  className,
  onChange,
  onBlur,
  onFocus,
  name,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const hasWarning = Boolean(warning && !error);
  const hasSuccess = Boolean(success && !error && !warning);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onFieldChange?.(name || '', e.target.value);
  }, [onChange, onFieldChange, name]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    onFieldBlur?.(name || '');
  }, [onBlur, onFieldBlur, name]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    onFieldFocus?.(name || '');
  }, [onFocus, onFieldFocus, name]);

  const inputId = props.id || name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          name={name}
          className={cn(
            className,
            hasError && "border-destructive focus-visible:ring-destructive",
            hasWarning && "border-yellow-500 focus-visible:ring-yellow-500",
            hasSuccess && "border-green-500 focus-visible:ring-green-500",
            showValidationIcon && (hasError || hasWarning || hasSuccess) && "pr-10"
          )}
          aria-invalid={hasError}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...props}
        />
        
        {showValidationIcon && (
          <>
            {hasError && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
            )}
            {hasWarning && (
              <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warning" />
            )}
            {hasSuccess && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
            )}
          </>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="py-2" id={errorId}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Warning Message */}
      {warning && !error && (
        <Alert className="py-2 border-warning/30 bg-warning/5 text-warning">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">{warning}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && !error && !warning && (
        <Alert className="py-2 border-success/30 bg-success/5 text-success">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-sm">{success}</AlertDescription>
        </Alert>
      )}
      
      {/* Helper Text */}
      {helperText && !error && !warning && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}));

ValidatedInput.displayName = 'ValidatedInput';