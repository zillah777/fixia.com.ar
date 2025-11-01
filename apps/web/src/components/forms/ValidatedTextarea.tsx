import React, { memo, forwardRef, useCallback, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../ui/utils';

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  warning?: string;
  success?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  showValidationIcon?: boolean;
  onFieldChange?: (name: string, value: string) => void;
  onFieldBlur?: (name: string) => void;
  onFieldFocus?: (name: string) => void;
}

export const ValidatedTextarea = memo(forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(({
  label,
  error,
  warning,
  success,
  helperText,
  showCharacterCount = false,
  showValidationIcon = true,
  onFieldChange,
  onFieldBlur,
  onFieldFocus,
  className,
  onChange,
  onBlur,
  onFocus,
  name,
  maxLength,
  ...props
}, ref) => {
  const [characterCount, setCharacterCount] = useState(0);
  
  const hasError = Boolean(error);
  const hasWarning = Boolean(warning && !error);
  const hasSuccess = Boolean(success && !error && !warning);
  const isNearLimit = maxLength ? characterCount / maxLength > 0.8 : false;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharacterCount(value.length);
    onChange?.(e);
    onFieldChange?.(name || '', value);
  }, [onChange, onFieldChange, name]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    onBlur?.(e);
    onFieldBlur?.(name || '');
  }, [onBlur, onFieldBlur, name]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
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
        <Textarea
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
          maxLength={maxLength}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...props}
        />
        
        {showValidationIcon && (
          <>
            {hasError && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
            )}
            {hasWarning && (
              <Info className="absolute right-3 top-3 h-4 w-4 text-warning" />
            )}
            {hasSuccess && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-success" />
            )}
          </>
        )}
      </div>
      
      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div className="flex justify-end">
          <span className={cn(
            "text-xs",
            isNearLimit ? "text-warning" : "text-muted-foreground",
            characterCount >= maxLength && "text-destructive"
          )}>
            {characterCount}/{maxLength}
          </span>
        </div>
      )}
      
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

ValidatedTextarea.displayName = 'ValidatedTextarea';