export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  score: number; // 0-100
}

/**
 * Comprehensive password validation with security best practices
 * Based on OWASP guidelines and industry standards
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Required validations (errors)
  if (!password || password.length === 0) {
    errors.push('La contraseña es requerida');
    return {
      isValid: false,
      errors,
      warnings,
      strength: 'very-weak',
      score: 0
    };
  }

  // Minimum length requirement (8 characters - OWASP standard)
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  } else {
    score += 20;
  }

  // Maximum length (prevent DoS attacks)
  if (password.length > 128) {
    errors.push('No puede exceder 128 caracteres');
  }

  // Character variety requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasUnicode = /[^\x00-\x7F]/.test(password);

  // At least 3 out of 4 character types required
  const charTypesCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (charTypesCount < 2) {
    errors.push('Debe incluir al menos 2 tipos de caracteres (mayúsculas, minúsculas, números, símbolos)');
  } else {
    score += charTypesCount * 10;
  }

  // Length scoring
  if (password.length >= 12) score += 15;
  else if (password.length >= 10) score += 10;
  else if (password.length >= 8) score += 5;

  // Bonus points for character variety
  if (hasLowercase) score += 5;
  if (hasUppercase) score += 5;
  if (hasNumbers) score += 5;
  if (hasSpecialChars) score += 10;
  if (hasUnicode) score += 5;

  // Check for common weak patterns
  const commonPatterns = [
    /^(.)\1{7,}$/, // Repeated characters
    /^(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
    /^(qwer|asdf|zxcv|qwerty|asdfgh|zxcvbn)/i, // Keyboard patterns
    /^\d{8,}$/, // All numbers
    /^[a-z]{8,}$/i, // All letters
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    warnings.push('Evita patrones comunes como secuencias o repeticiones');
    score -= 10;
  }

  // Check against common passwords (basic list)
  const commonPasswords = [
    'password', 'password123', '123456789', 'qwerty123',
    'admin123', 'letmein', 'welcome123', 'password1',
    'admin', 'root', 'user', 'guest', 'test', 'demo'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('No uses contraseñas comunes');
    score = Math.max(0, score - 20);
  }

  // Recommendations (warnings, not errors)
  if (password.length < 12) {
    warnings.push('Recomendado: usar al menos 12 caracteres para mayor seguridad');
  }
  
  if (!hasSpecialChars) {
    warnings.push('Recomendado: incluir símbolos especiales (!@#$%^&*)');
  }

  if (charTypesCount < 4) {
    warnings.push('Recomendado: usar mayúsculas, minúsculas, números y símbolos');
  }

  // Personal information patterns (basic detection)
  const personalPatterns = [
    /\b(fixia|admin|user|test)\b/i,
    /\b(2024|2023|2022)\b/, // Recent years
  ];
  
  if (personalPatterns.some(pattern => pattern.test(password))) {
    warnings.push('Evita incluir información personal o del sitio');
    score -= 5;
  }

  // Calculate final score and strength
  score = Math.max(0, Math.min(100, score));

  let strength: PasswordValidationResult['strength'];
  if (score >= 90) strength = 'very-strong';
  else if (score >= 75) strength = 'strong';
  else if (score >= 60) strength = 'good';
  else if (score >= 40) strength = 'fair';
  else if (score >= 20) strength = 'weak';
  else strength = 'very-weak';

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    strength,
    score
  };
};

/**
 * Get strength color for UI display
 */
export const getStrengthColor = (strength: PasswordValidationResult['strength']): string => {
  switch (strength) {
    case 'very-strong': return 'text-success';
    case 'strong': return 'text-success';
    case 'good': return 'text-blue-500';
    case 'fair': return 'text-warning';
    case 'weak': return 'text-orange-500';
    case 'very-weak': return 'text-destructive';
    default: return 'text-gray-500';
  }
};

/**
 * Get strength label for UI display
 */
export const getStrengthLabel = (strength: PasswordValidationResult['strength']): string => {
  switch (strength) {
    case 'very-strong': return 'Muy Fuerte';
    case 'strong': return 'Fuerte';
    case 'good': return 'Buena';
    case 'fair': return 'Regular';
    case 'weak': return 'Débil';
    case 'very-weak': return 'Muy Débil';
    default: return 'Sin evaluar';
  }
};

/**
 * Generate password strength indicator bars
 */
export const getStrengthBars = (strength: PasswordValidationResult['strength']): number => {
  switch (strength) {
    case 'very-strong': return 5;
    case 'strong': return 4;
    case 'good': return 3;
    case 'fair': return 2;
    case 'weak': return 1;
    case 'very-weak': return 0;
    default: return 0;
  }
};

/**
 * Hook for real-time password validation in React components
 */
export const usePasswordValidation = (password: string) => {
  const validation = validatePassword(password);
  
  return {
    ...validation,
    strengthColor: getStrengthColor(validation.strength),
    strengthLabel: getStrengthLabel(validation.strength),
    strengthBars: getStrengthBars(validation.strength)
  };
};