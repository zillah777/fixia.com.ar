import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  validateForm, 
  validateField, 
  FormValidationSchema, 
  ValidationResult,
  FieldValidationRule
} from '../utils/formValidation';

interface FieldError {
  message: string;
  touched: boolean;
}

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  debounceMs?: number;
}

interface UseFormValidationReturn<T> {
  // State
  errors: Partial<Record<keyof T, FieldError>>;
  warnings: Partial<Record<keyof T, string[]>>;
  isValid: boolean;
  isValidating: boolean;
  touchedFields: Set<keyof T>;
  
  // Actions
  validateField: (fieldName: keyof T, value: any) => Promise<ValidationResult>;
  validateForm: () => Promise<boolean>;
  clearFieldError: (fieldName: keyof T) => void;
  clearAllErrors: () => void;
  markFieldTouched: (fieldName: keyof T) => void;
  markFieldUntouched: (fieldName: keyof T) => void;
  resetValidation: () => void;
  
  // Handlers
  getFieldProps: (fieldName: keyof T) => {
    error: string | undefined;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  };
}

export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  schema: FormValidationSchema,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    debounceMs = 300
  } = options;

  // State
  const [errors, setErrors] = useState<Partial<Record<keyof T, FieldError>>>({});
  const [warnings, setWarnings] = useState<Partial<Record<keyof T, string[]>>>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Debounce timers
  const debounceTimers = useMemo(() => new Map<keyof T, NodeJS.Timeout>(), []);

  // Computed values
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error?.message);
  }, [errors]);

  // Clear debounce timer for a field
  const clearDebounceTimer = useCallback((fieldName: keyof T) => {
    const timer = debounceTimers.get(fieldName);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.delete(fieldName);
    }
  }, [debounceTimers]);

  // Validate individual field
  const validateFieldInternal = useCallback(async (
    fieldName: keyof T, 
    value: any,
    immediate = false
  ): Promise<ValidationResult> => {
    const fieldSchema = schema[fieldName as string];
    if (!fieldSchema) {
      return { isValid: true, errors: [] };
    }

    return new Promise((resolve) => {
      const performValidation = () => {
        setIsValidating(true);
        const result = validateField(value, fieldSchema);
        
        setErrors(prev => ({
          ...prev,
          [fieldName]: {
            message: result.errors[0] || '',
            touched: touchedFields.has(fieldName)
          }
        }));

        if (result.warnings && result.warnings.length > 0) {
          setWarnings(prev => ({
            ...prev,
            [fieldName]: result.warnings
          }));
        } else {
          setWarnings(prev => {
            const newWarnings = { ...prev };
            delete newWarnings[fieldName];
            return newWarnings;
          });
        }

        setIsValidating(false);
        resolve(result);
      };

      if (immediate || debounceMs === 0) {
        performValidation();
      } else {
        clearDebounceTimer(fieldName);
        const timer = setTimeout(performValidation, debounceMs);
        debounceTimers.set(fieldName, timer);
      }
    });
  }, [schema, touchedFields, debounceMs, debounceTimers, clearDebounceTimer]);

  // Validate entire form
  const validateFormInternal = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    
    const result = validateForm(formData, schema);
    
    // Convert field errors to our format
    const newErrors: Partial<Record<keyof T, FieldError>> = {};
    for (const [fieldName, fieldErrors] of Object.entries(result.fieldErrors)) {
      newErrors[fieldName as keyof T] = {
        message: fieldErrors[0] || '',
        touched: true
      };
    }

    // Mark all fields as touched
    const allFields = new Set(Object.keys(formData) as Array<keyof T>);
    setTouchedFields(allFields);
    
    setErrors(newErrors);
    setWarnings(result.warnings || {});
    setIsValidating(false);

    return result.isValid;
  }, [formData, schema]);

  // Field interaction handlers
  const markFieldTouched = useCallback((fieldName: keyof T) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  const markFieldUntouched = useCallback((fieldName: keyof T) => {
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    setWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[fieldName];
      return newWarnings;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setWarnings({});
    setTouchedFields(new Set());
    // Clear all debounce timers
    debounceTimers.forEach(timer => clearTimeout(timer));
    debounceTimers.clear();
  }, [debounceTimers]);

  // Get props for field components
  const getFieldProps = useCallback((fieldName: keyof T) => {
    const error = errors[fieldName];
    const hasError = error?.message && touchedFields.has(fieldName);
    
    return {
      error: hasError ? error.message : undefined,
      'aria-invalid': hasError ? true : false,
      'aria-describedby': hasError ? `${String(fieldName)}-error` : undefined
    };
  }, [errors, touchedFields]);

  // Auto-validate on form data changes
  useEffect(() => {
    if (validateOnChange) {
      const fieldsToValidate = Object.keys(formData).filter(
        fieldName => touchedFields.has(fieldName as keyof T)
      ) as Array<keyof T>;

      fieldsToValidate.forEach(fieldName => {
        validateFieldInternal(fieldName, formData[fieldName]);
      });
    }
  }, [formData, validateOnChange, touchedFields, validateFieldInternal]);

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateFormInternal();
    }
    
    // Cleanup debounce timers on unmount
    return () => {
      debounceTimers.forEach(timer => clearTimeout(timer));
    };
  }, [validateOnMount, validateFormInternal, debounceTimers]);

  return {
    // State
    errors,
    warnings,
    isValid,
    isValidating,
    touchedFields,
    
    // Actions
    validateField: validateFieldInternal,
    validateForm: validateFormInternal,
    clearFieldError,
    clearAllErrors,
    markFieldTouched,
    markFieldUntouched,
    resetValidation,
    
    // Helpers
    getFieldProps
  };
}

// Specialized hooks for common forms
export function useLoginValidation(formData: { email: string; password: string }) {
  return useFormValidation(formData, {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  });
}

export function useContactValidation(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}) {
  return useFormValidation(formData, {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, email: true },
    subject: { required: true, minLength: 5, maxLength: 200 },
    message: { required: true, minLength: 20, maxLength: 1000 },
    category: { required: true }
  });
}

// Higher-order component for form validation (removed due to TypeScript JSX issues)