import React, { memo, forwardRef, useState, useCallback, useMemo } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { cn } from '../ui/utils';
import { validatePassword } from '../../utils/passwordValidation';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showStrengthIndicator?: boolean;
  showToggle?: boolean;
  showValidationDetails?: boolean;
  onFieldChange?: (name: string, value: string) => void;
  onFieldBlur?: (name: string) => void;
  onFieldFocus?: (name: string) => void;
  confirmPassword?: string;
  showConfirmationCheck?: boolean;
}

const getStrengthColor = (score: number): string => {
  if (score < 30) return 'bg-destructive';
  if (score < 60) return 'bg-warning';
  if (score < 80) return 'bg-blue-500';
  return 'bg-success';
};

const getStrengthText = (score: number): string => {
  if (score < 30) return 'Muy débil';
  if (score < 60) return 'Débil';
  if (score < 80) return 'Buena';
  return 'Muy fuerte';
};

export const PasswordInput = memo(forwardRef<HTMLInputElement, PasswordInputProps>(({
  label = 'Contraseña',
  showStrengthIndicator = false,
  showToggle = true,
  showValidationDetails = false,
  onFieldChange,
  onFieldBlur,
  onFieldFocus,
  confirmPassword,
  showConfirmationCheck = false,
  className,
  onChange,
  onBlur,
  onFocus,
  name,
  value = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Password validation
  const passwordValidation = useMemo(() => {
    if (!value || typeof value !== 'string') {
      return { isValid: true, score: 0, errors: [], warnings: [] };
    }
    return validatePassword(value);
  }, [value]);

  // Confirmation check
  const passwordsMatch = useMemo(() => {
    if (!showConfirmationCheck || !confirmPassword) return true;
    return value === confirmPassword;
  }, [value, confirmPassword, showConfirmationCheck]);

  const stringValue = String(value || '');
  const hasValidationError = !passwordValidation.isValid && stringValue && stringValue.length > 0;
  const showStrength = showStrengthIndicator && stringValue && stringValue.length > 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onFieldChange?.(name || '', e.target.value);
  }, [onChange, onFieldChange, name]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
    onFieldBlur?.(name || '');
  }, [onBlur, onFieldBlur, name]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
    onFieldFocus?.(name || '');
  }, [onFocus, onFieldFocus, name]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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
          type={showPassword ? 'text' : 'password'}
          className={cn(
            className,
            hasValidationError && "border-destructive focus-visible:ring-destructive",
            !hasValidationError && passwordValidation.isValid && value && "border-green-500 focus-visible:ring-green-500",
            showToggle && "pr-10"
          )}
          aria-invalid={hasValidationError ? 'true' : 'false'}
          aria-describedby={cn(
            hasValidationError && errorId,
            showValidationDetails && helperId
          )}
          value={stringValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...props}
        />
        
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {/* Strength Indicator */}
      {showStrength && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Seguridad: {getStrengthText(passwordValidation.score)}
            </span>
            <span className="text-xs text-muted-foreground">
              {passwordValidation.score}/100
            </span>
          </div>
          <Progress 
            value={passwordValidation.score} 
            className="h-2"
            // Apply dynamic color through style since Progress doesn't support dynamic classes well
            style={{
              '--progress-foreground': passwordValidation.score < 30 ? 'rgb(239 68 68)' :
                                    passwordValidation.score < 60 ? 'rgb(234 179 8)' :
                                    passwordValidation.score < 80 ? 'rgb(59 130 246)' :
                                    'rgb(34 197 94)'
            } as React.CSSProperties}
          />
        </div>
      )}

      {/* Validation Details */}
      {showValidationDetails && isFocused && stringValue && (
        <div className="p-3 border rounded-md bg-muted/30" id={helperId}>
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Requisitos de seguridad
            </h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className={cn(
                "flex items-center gap-2",
                stringValue.length >= 8 ? "text-success" : "text-muted-foreground"
              )}>
                <CheckCircle className="h-3 w-3" />
                Mínimo 8 caracteres
              </div>
              <div className={cn(
                "flex items-center gap-2",
                /[A-Z]/.test(stringValue) ? "text-success" : "text-muted-foreground"
              )}>
                <CheckCircle className="h-3 w-3" />
                Al menos una mayúscula
              </div>
              <div className={cn(
                "flex items-center gap-2",
                /[a-z]/.test(stringValue) ? "text-success" : "text-muted-foreground"
              )}>
                <CheckCircle className="h-3 w-3" />
                Al menos una minúscula
              </div>
              <div className={cn(
                "flex items-center gap-2",
                /\d/.test(stringValue) ? "text-success" : "text-muted-foreground"
              )}>
                <CheckCircle className="h-3 w-3" />
                Al menos un número
              </div>
              <div className={cn(
                "flex items-center gap-2",
                /[!@#$%^&*(),.?":{}|<>]/.test(stringValue) ? "text-success" : "text-muted-foreground"
              )}>
                <CheckCircle className="h-3 w-3" />
                Al menos un carácter especial
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {hasValidationError && (
        <Alert variant="destructive" className="py-2" id={errorId}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {passwordValidation.errors[0]}
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation Error */}
      {showConfirmationCheck && !passwordsMatch && confirmPassword && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Las contraseñas no coinciden
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {passwordValidation.isValid && stringValue && stringValue.length > 0 && (
        <Alert className="py-2 border-success/30 bg-success/5 text-success">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-sm">
            Contraseña segura
            {passwordsMatch && showConfirmationCheck && ' y confirmada'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}));

PasswordInput.displayName = 'PasswordInput';