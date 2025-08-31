import { validatePassword } from './passwordValidation';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => ValidationResult;
  message?: string;
}

export interface FormValidationSchema {
  [fieldName: string]: FieldValidationRule | FieldValidationRule[];
}

// Common validation patterns
export const ValidationPatterns = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  PHONE: /^(?:\+54\s?)?(?:\d{2,4}\s?)?\d{6,8}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  PRICE: /^\d+(\.\d{2})?$/
};

// Common validation messages
export const ValidationMessages = {
  REQUIRED: 'Este campo es requerido',
  EMAIL: 'Ingresa un email válido',
  PHONE: 'Ingresa un teléfono válido (ej: +54 11 1234-5678)',
  URL: 'Ingresa una URL válida (ej: https://ejemplo.com)',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No puede tener más de ${max} caracteres`,
  NAME: 'Solo se permiten letras y espacios',
  PASSWORDS_MATCH: 'Las contraseñas no coinciden',
  TERMS: 'Debes aceptar los términos y condiciones',
  PRIVACY: 'Debes aceptar la política de privacidad',
  INVALID_FORMAT: 'Formato inválido',
  WEAK_PASSWORD: 'La contraseña es muy débil'
};

// Validate individual field
export function validateField(value: any, rules: FieldValidationRule | FieldValidationRule[]): ValidationResult {
  const rulesArray = Array.isArray(rules) ? rules : [rules];
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rulesArray) {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rule.message || ValidationMessages.REQUIRED);
      continue; // Skip other validations if field is required and empty
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      continue;
    }

    const stringValue = String(value).trim();

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      errors.push(rule.message || ValidationMessages.MIN_LENGTH(rule.minLength));
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors.push(rule.message || ValidationMessages.MAX_LENGTH(rule.maxLength));
    }

    // Email validation
    if (rule.email && !ValidationPatterns.EMAIL.test(stringValue)) {
      errors.push(rule.message || ValidationMessages.EMAIL);
    }

    // Phone validation
    if (rule.phone && !ValidationPatterns.PHONE.test(stringValue)) {
      errors.push(rule.message || ValidationMessages.PHONE);
    }

    // URL validation
    if (rule.url && !ValidationPatterns.URL.test(stringValue)) {
      errors.push(rule.message || ValidationMessages.URL);
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors.push(rule.message || ValidationMessages.INVALID_FORMAT);
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (!customResult.isValid) {
        errors.push(...customResult.errors);
      }
      if (customResult.warnings) {
        warnings.push(...customResult.warnings);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Validate entire form
export function validateForm<T extends Record<string, any>>(
  formData: T, 
  schema: FormValidationSchema
): { isValid: boolean; fieldErrors: Record<keyof T, string[]>; warnings?: Record<keyof T, string[]> } {
  const fieldErrors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
  const warnings: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(schema)) {
    if (fieldName in formData) {
      const result = validateField(formData[fieldName], rules);
      
      if (!result.isValid) {
        isValid = false;
        fieldErrors[fieldName as keyof T] = result.errors;
      }

      if (result.warnings && result.warnings.length > 0) {
        warnings[fieldName as keyof T] = result.warnings;
      }
    }
  }

  return {
    isValid,
    fieldErrors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
}

// Pre-built validation schemas for common forms
export const CommonSchemas: Record<string, FormValidationSchema> = {
  LOGIN: {
    email: {
      required: true,
      email: true,
      message: 'Ingresa un email válido'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'La contraseña debe tener al menos 6 caracteres'
    }
  },

  REGISTER_CLIENT: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: ValidationPatterns.NAME,
      message: 'Nombre completo inválido'
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      custom: (value: string) => {
        const result = validatePassword(value);
        return {
          isValid: result.isValid,
          errors: result.errors || []
        };
      }
    },
    confirmPassword: {
      required: true,
      message: 'Confirma tu contraseña'
    },
    phone: {
      required: false,
      phone: true
    },
    location: {
      required: true,
      minLength: 2,
      message: 'Selecciona tu ubicación'
    },
    agreeTerms: {
      required: true,
      custom: (value: boolean) => ({
        isValid: value === true,
        errors: value ? [] : [ValidationMessages.TERMS]
      })
    },
    agreePrivacy: {
      required: true,
      custom: (value: boolean) => ({
        isValid: value === true,
        errors: value ? [] : [ValidationMessages.PRIVACY]
      })
    }
  },

  REGISTER_PROFESSIONAL: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: ValidationPatterns.NAME,
      message: 'Nombre completo inválido'
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      custom: (value: string) => {
        const result = validatePassword(value);
        return {
          isValid: result.isValid,
          errors: result.errors || []
        };
      }
    },
    confirmPassword: {
      required: true,
      message: 'Confirma tu contraseña'
    },
    phone: {
      required: false,
      phone: true
    },
    location: {
      required: true,
      minLength: 2,
      message: 'Selecciona tu ubicación'
    },
    agreeTerms: {
      required: true,
      custom: (value: boolean) => ({
        isValid: value === true,
        errors: value ? [] : [ValidationMessages.TERMS]
      })
    },
    agreePrivacy: {
      required: true,
      custom: (value: boolean) => ({
        isValid: value === true,
        errors: value ? [] : [ValidationMessages.PRIVACY]
      })
    },
    serviceCategories: {
      required: true,
      custom: (value: string[]) => ({
        isValid: Array.isArray(value) && value.length > 0,
        errors: (!Array.isArray(value) || value.length === 0) ? ['Selecciona al menos una categoría de servicio'] : []
      })
    },
    description: {
      required: true,
      minLength: 50,
      maxLength: 500,
      message: 'Describe tu experiencia (50-500 caracteres)'
    },
    experience: {
      required: true,
      minLength: 10,
      message: 'Describe tu experiencia profesional'
    },
    pricing: {
      required: true,
      minLength: 10,
      message: 'Indica tus tarifas aproximadas'
    }
  },

  CONTACT: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: ValidationPatterns.NAME
    },
    email: {
      required: true,
      email: true
    },
    subject: {
      required: true,
      minLength: 5,
      maxLength: 200,
      message: 'El asunto debe tener entre 5 y 200 caracteres'
    },
    message: {
      required: true,
      minLength: 20,
      maxLength: 1000,
      message: 'El mensaje debe tener entre 20 y 1000 caracteres'
    },
    category: {
      required: true,
      message: 'Selecciona una categoría'
    }
  },

  PROFILE_UPDATE: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: ValidationPatterns.NAME
    },
    email: {
      required: true,
      email: true
    },
    phone: {
      required: false,
      phone: true
    },
    location: {
      required: false,
      minLength: 2
    }
  },

  PASSWORD_CHANGE: {
    currentPassword: {
      required: true,
      minLength: 6,
      message: 'Ingresa tu contraseña actual'
    },
    newPassword: {
      required: true,
      custom: (value: string) => {
        const result = validatePassword(value);
        return {
          isValid: result.isValid,
          errors: result.errors || []
        };
      }
    },
    confirmNewPassword: {
      required: true,
      message: 'Confirma tu nueva contraseña'
    }
  },

  FORGOT_PASSWORD: {
    email: {
      required: true,
      email: true,
      message: 'Ingresa el email de tu cuenta'
    }
  }
};

// Password confirmation validator
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  return {
    isValid: password === confirmPassword,
    errors: password !== confirmPassword ? [ValidationMessages.PASSWORDS_MATCH] : []
  };
}

// Real-time field validator for better UX
export function createFieldValidator(rules: FieldValidationRule | FieldValidationRule[]) {
  return (value: any) => validateField(value, rules);
}

// Debounced validation for performance
export function createDebouncedValidator(
  validator: (value: any) => ValidationResult,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (value: any, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
}