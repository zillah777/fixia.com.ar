import React, { useState, useEffect, memo, useCallback } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { sanitizeInput, detectMaliciousContent } from '../utils/sanitization';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sanitizationType?: 'plainText' | 'basicHTML' | 'richText' | 'url' | 'email' | 'phone' | 'filename';
  onSecureChange?: (rawValue: string, sanitizedValue: string) => void; // Parameters swapped for clarity
  showSecurityStatus?: boolean;
  customValidation?: (value: string) => { isValid: boolean; message?: string };
  maxLength?: number;
  getSanitizedValue?: () => string; // Expose method to get sanitized value when needed
}

interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  sanitizationType?: 'plainText' | 'basicHTML' | 'richText';
  onSecureChange?: (rawValue: string, sanitizedValue: string) => void; // Parameters swapped for clarity
  showSecurityStatus?: boolean;
  customValidation?: (value: string) => { isValid: boolean; message?: string };
  maxLength?: number;
  getSanitizedValue?: () => string; // Expose method to get sanitized value when needed
}

export const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(({
  label,
  sanitizationType = 'plainText',
  onSecureChange,
  onChange,
  showSecurityStatus = true,
  customValidation,
  maxLength,
  className = '',
  value = '',
  ...props
}, ref) => {
  const [securityStatus, setSecurityStatus] = useState<{
    isSafe: boolean;
    reasons: string[];
    sanitized: boolean;
  }>({ isSafe: true, reasons: [], sanitized: false });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalValue = e.target.value;
    
    // Only apply length limit during typing - no sanitization
    const truncatedValue = maxLength ? originalValue.substring(0, maxLength) : originalValue;
    
    // Only detect malicious content without sanitizing during typing
    const maliciousCheck = detectMaliciousContent(truncatedValue);
    
    // Update security status based on detection only
    setSecurityStatus({
      isSafe: maliciousCheck.isSafe,
      reasons: maliciousCheck.reasons,
      sanitized: false // No sanitization during typing
    });
    
    // Custom validation on raw input
    if (customValidation) {
      const validation = customValidation(truncatedValue);
      setValidationError(validation.isValid ? null : validation.message || 'Valor inválido');
    } else {
      setValidationError(null);
    }
    
    // Pass the original (unsanitized) value to callbacks
    if (onSecureChange) {
      // For onSecureChange, provide both original and what would be sanitized
      const wouldBeSanitized = sanitizeInput(truncatedValue, sanitizationType);
      onSecureChange(truncatedValue, wouldBeSanitized);
    }
    
    if (onChange) {
      // Pass through the original event with truncated value (no sanitization)
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: truncatedValue }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Add a method to get sanitized value for form submission
  const getSanitizedValue = useCallback(() => {
    if (!value || typeof value !== 'string') return '';
    return sanitizeInput(value, sanitizationType);
  }, [value, sanitizationType]);

  const getSecurityIndicator = () => {
    if (!showSecurityStatus) return null;
    
    if (!securityStatus.isSafe) {
      return (
        <div className="flex items-center space-x-1 text-destructive text-xs mt-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Contenido potencialmente peligroso detectado</span>
        </div>
      );
    }
    
    // Note: We no longer show "sanitized" status during typing since we don't sanitize in real-time
    
    if (value && securityStatus.isSafe) {
      return (
        <div className="flex items-center space-x-1 text-success text-xs mt-1">
          <CheckCircle className="h-3 w-3" />
          <span>Contenido seguro</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      
      <div className="relative">
        <Input
          ref={ref}
          className={`glass border-white/20 ${!securityStatus.isSafe ? 'border-destructive' : ''} ${className}`}
          onChange={handleChange}
          value={value}
          {...props}
        />
        
        {maxLength && (
          <div className="absolute right-2 top-2 text-xs text-muted-foreground">
            {String(value).length}/{maxLength}
          </div>
        )}
      </div>
      
      {getSecurityIndicator()}
      
      {!securityStatus.isSafe && securityStatus.reasons.length > 0 && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <ul className="list-disc list-inside">
              {securityStatus.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validationError && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {validationError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});

SecureInput.displayName = 'SecureInput';

export const SecureTextarea = React.forwardRef<HTMLTextAreaElement, SecureTextareaProps>(({
  label,
  sanitizationType = 'basicHTML',
  onSecureChange,
  onChange,
  showSecurityStatus = true,
  customValidation,
  maxLength,
  className = '',
  value = '',
  ...props
}, ref) => {
  const [securityStatus, setSecurityStatus] = useState<{
    isSafe: boolean;
    reasons: string[];
    sanitized: boolean;
  }>({ isSafe: true, reasons: [], sanitized: false });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const originalValue = e.target.value;
    
    // Only apply length limit during typing - no sanitization
    const truncatedValue = maxLength ? originalValue.substring(0, maxLength) : originalValue;
    
    // Only detect malicious content without sanitizing during typing
    const maliciousCheck = detectMaliciousContent(truncatedValue);
    
    // Update security status based on detection only
    setSecurityStatus({
      isSafe: maliciousCheck.isSafe,
      reasons: maliciousCheck.reasons,
      sanitized: false // No sanitization during typing
    });
    
    // Custom validation on raw input
    if (customValidation) {
      const validation = customValidation(truncatedValue);
      setValidationError(validation.isValid ? null : validation.message || 'Valor inválido');
    } else {
      setValidationError(null);
    }
    
    // Pass the original (unsanitized) value to callbacks
    if (onSecureChange) {
      // For onSecureChange, provide both original and what would be sanitized
      const wouldBeSanitized = sanitizeInput(truncatedValue, sanitizationType);
      onSecureChange(truncatedValue, wouldBeSanitized);
    }
    
    if (onChange) {
      // Pass through the original event with truncated value (no sanitization)
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: truncatedValue }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  // Add a method to get sanitized value for form submission
  const getSanitizedValue = useCallback(() => {
    if (!value || typeof value !== 'string') return '';
    return sanitizeInput(value, sanitizationType);
  }, [value, sanitizationType]);

  const getSecurityIndicator = () => {
    if (!showSecurityStatus) return null;
    
    if (!securityStatus.isSafe) {
      return (
        <div className="flex items-center space-x-1 text-destructive text-xs mt-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Contenido potencialmente peligroso detectado</span>
        </div>
      );
    }
    
    // Note: We no longer show "sanitized" status during typing since we don't sanitize in real-time
    
    if (value && securityStatus.isSafe) {
      return (
        <div className="flex items-center space-x-1 text-success text-xs mt-1">
          <CheckCircle className="h-3 w-3" />
          <span>Contenido seguro</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      
      <div className="relative">
        <Textarea
          ref={ref}
          className={`glass border-white/20 ${!securityStatus.isSafe ? 'border-destructive' : ''} ${className}`}
          onChange={handleChange}
          value={value}
          {...props}
        />
        
        {maxLength && (
          <div className="absolute right-2 bottom-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
            {String(value).length}/{maxLength}
          </div>
        )}
      </div>
      
      {getSecurityIndicator()}
      
      {!securityStatus.isSafe && securityStatus.reasons.length > 0 && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <ul className="list-disc list-inside">
              {securityStatus.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validationError && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {validationError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});

SecureTextarea.displayName = 'SecureTextarea';

export default SecureInput;