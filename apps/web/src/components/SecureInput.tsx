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
  onSecureChange?: (sanitizedValue: string, originalValue: string) => void;
  showSecurityStatus?: boolean;
  customValidation?: (value: string) => { isValid: boolean; message?: string };
  maxLength?: number;
}

interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  sanitizationType?: 'plainText' | 'basicHTML' | 'richText';
  onSecureChange?: (sanitizedValue: string, originalValue: string) => void;
  showSecurityStatus?: boolean;
  customValidation?: (value: string) => { isValid: boolean; message?: string };
  maxLength?: number;
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
    
    // Aplicar límite de longitud si se especifica
    const truncatedValue = maxLength ? originalValue.substring(0, maxLength) : originalValue;
    
    // Detectar contenido malicioso antes de sanitizar
    const maliciousCheck = detectMaliciousContent(truncatedValue);
    
    // Sanitizar el contenido
    const sanitizedValue = sanitizeInput(truncatedValue, sanitizationType);
    
    // Verificar si hubo cambios en la sanitización
    const wasSanitized = originalValue !== sanitizedValue;
    
    // Actualizar estado de seguridad
    setSecurityStatus({
      isSafe: maliciousCheck.isSafe,
      reasons: maliciousCheck.reasons,
      sanitized: wasSanitized
    });
    
    // Validación personalizada
    if (customValidation) {
      const validation = customValidation(sanitizedValue);
      setValidationError(validation.isValid ? null : validation.message || 'Valor inválido');
    } else {
      setValidationError(null);
    }
    
    // Llamar callbacks
    if (onSecureChange) {
      onSecureChange(sanitizedValue, originalValue);
    }
    
    if (onChange) {
      // Crear un evento sintético con el valor sanitizado
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: sanitizedValue }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

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
    
    if (securityStatus.sanitized) {
      return (
        <div className="flex items-center space-x-1 text-warning text-xs mt-1">
          <Shield className="h-3 w-3" />
          <span>Contenido sanitizado por seguridad</span>
        </div>
      );
    }
    
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
    
    // Aplicar límite de longitud si se especifica
    const truncatedValue = maxLength ? originalValue.substring(0, maxLength) : originalValue;
    
    // Detectar contenido malicioso antes de sanitizar
    const maliciousCheck = detectMaliciousContent(truncatedValue);
    
    // Sanitizar el contenido
    const sanitizedValue = sanitizeInput(truncatedValue, sanitizationType);
    
    // Verificar si hubo cambios en la sanitización
    const wasSanitized = originalValue !== sanitizedValue;
    
    // Actualizar estado de seguridad
    setSecurityStatus({
      isSafe: maliciousCheck.isSafe,
      reasons: maliciousCheck.reasons,
      sanitized: wasSanitized
    });
    
    // Validación personalizada
    if (customValidation) {
      const validation = customValidation(sanitizedValue);
      setValidationError(validation.isValid ? null : validation.message || 'Valor inválido');
    } else {
      setValidationError(null);
    }
    
    // Llamar callbacks
    if (onSecureChange) {
      onSecureChange(sanitizedValue, originalValue);
    }
    
    if (onChange) {
      // Crear un evento sintético con el valor sanitizado
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: sanitizedValue }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

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
    
    if (securityStatus.sanitized) {
      return (
        <div className="flex items-center space-x-1 text-warning text-xs mt-1">
          <Shield className="h-3 w-3" />
          <span>Contenido sanitizado por seguridad</span>
        </div>
      );
    }
    
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