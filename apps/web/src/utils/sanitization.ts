import DOMPurify from 'dompurify';

// Configuraciones de sanitización para diferentes contextos
export const SANITIZATION_CONFIGS = {
  // Para texto plano (nombres, títulos)
  PLAIN_TEXT: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // Para texto con formato básico (biografías, descripciones)
  BASIC_HTML: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // Para contenido más rico (pero aún restringido)
  RICH_TEXT: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    KEEP_CONTENT: true,
  },
  
  // Para URLs
  URL: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }
};

/**
 * Sanitiza texto plano eliminando cualquier HTML
 */
export const sanitizePlainText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input.trim(), SANITIZATION_CONFIGS.PLAIN_TEXT);
};

/**
 * Sanitiza texto con formato HTML básico permitido
 */
export const sanitizeBasicHTML = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input.trim(), SANITIZATION_CONFIGS.BASIC_HTML);
};

/**
 * Sanitiza texto con formato HTML enriquecido pero seguro
 */
export const sanitizeRichText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input.trim(), SANITIZATION_CONFIGS.RICH_TEXT);
};

/**
 * Sanitiza URLs sin validar formato durante escritura
 */
export const sanitizeURL = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Solo sanitizar, no validar formato durante la escritura
  // La validación de URL debe hacerse en el submit, no en tiempo real
  const cleaned = DOMPurify.sanitize(input.trim(), SANITIZATION_CONFIGS.URL);
  
  return cleaned;
};

/**
 * Valida el formato de URL (para usar en submit, no durante escritura)
 */
export const validateURLFormat = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Solo permitir http y https
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitiza nombres de archivo para prevenir path traversal
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename || typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Solo caracteres seguros
    .replace(/_{2,}/g, '_') // Reducir guiones múltiples
    .replace(/^[._-]+|[._-]+$/g, '') // Eliminar caracteres especiales al inicio/final
    .toLowerCase()
    .substring(0, 100); // Limitar longitud
};

/**
 * Valida y sanitiza emails
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  const cleaned = sanitizePlainText(email);
  
  // Solo sanitizar, no validar formato durante la escritura
  // La validación de formato debe hacerse en el submit, no en tiempo real
  // Permitir caracteres válidos para emails: letras, números, @, ., -, _, +, %
  const emailSafeChars = cleaned.replace(/[^a-zA-Z0-9@.\-_+%]/g, '');
  
  return emailSafeChars.toLowerCase();
};

/**
 * Valida el formato de email (para usar en submit, no durante escritura)
 */
export const validateEmailFormat = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Sanitiza números de teléfono
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Permitir solo números, espacios, +, -, () y paréntesis
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
};

/**
 * Detecta contenido potencialmente malicioso
 */
export const detectMaliciousContent = (input: string): {
  isSafe: boolean;
  reasons: string[];
} => {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, reasons: [] };
  }
  
  const reasons: string[] = [];
  const lowerInput = input.toLowerCase();
  
  // Detectar scripts
  if (lowerInput.includes('<script') || lowerInput.includes('javascript:')) {
    reasons.push('Posible script malicioso detectado');
  }
  
  // Detectar intentos de XSS
  const xssPatterns = [
    'onerror=',
    'onload=',
    'onclick=',
    'onfocus=',
    'onmouseover=',
    'eval(',
    'document.cookie',
    'document.write',
    'innerHTML'
  ];
  
  xssPatterns.forEach(pattern => {
    if (lowerInput.includes(pattern)) {
      reasons.push(`Patrón XSS detectado: ${pattern}`);
    }
  });
  
  // Detectar SQL injection básico
  const sqlPatterns = [
    "' or '1'='1",
    '" or "1"="1',
    'union select',
    'drop table',
    'delete from'
  ];
  
  sqlPatterns.forEach(pattern => {
    if (lowerInput.includes(pattern)) {
      reasons.push(`Posible SQL injection: ${pattern}`);
    }
  });
  
  return {
    isSafe: reasons.length === 0,
    reasons
  };
};

/**
 * Sanitizador genérico que elige la configuración apropiada según el tipo de contenido
 */
export const sanitizeInput = (
  input: string, 
  type: 'plainText' | 'basicHTML' | 'richText' | 'url' | 'email' | 'phone' | 'filename' = 'plainText'
): string => {
  switch (type) {
    case 'plainText':
      return sanitizePlainText(input);
    case 'basicHTML':
      return sanitizeBasicHTML(input);
    case 'richText':
      return sanitizeRichText(input);
    case 'url':
      return sanitizeURL(input);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhone(input);
    case 'filename':
      return sanitizeFilename(input);
    default:
      return sanitizePlainText(input);
  }
};

/**
 * Hook personalizado para sanitización en tiempo real
 * DEPRECATED: Use sanitizeForSubmission instead
 * This hook was used for real-time sanitization which caused input blocking issues
 */
export const useSanitizedInput = (
  initialValue: string = '',
  type: Parameters<typeof sanitizeInput>[1] = 'plainText'
) => {
  const sanitize = (value: string) => sanitizeInput(value, type);
  
  return {
    sanitize,
    validate: (value: string) => detectMaliciousContent(value)
  };
};

/**
 * Sanitize form data on submission (recommended approach)
 * This function should be used when submitting forms to ensure data is cleaned
 * without interfering with user input during typing
 */
export const sanitizeForSubmission = <T extends Record<string, any>>(
  formData: T,
  fieldMappings: Record<keyof T, Parameters<typeof sanitizeInput>[1]>
): T => {
  const sanitized = { ...formData };
  
  for (const [field, sanitizationType] of Object.entries(fieldMappings)) {
    if (field in sanitized && sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field as keyof T] = sanitizeInput(sanitized[field], sanitizationType) as T[keyof T];
    }
  }
  
  return sanitized;
};

/**
 * Helper to create form submission sanitizer for common form types
 */
export const createFormSanitizer = <T extends Record<string, any>>(
  fieldMappings: Record<keyof T, Parameters<typeof sanitizeInput>[1]>
) => {
  return (formData: T) => sanitizeForSubmission(formData, fieldMappings);
};

// Pre-configured sanitizers for common forms
export const FormSanitizers = {
  // Login form sanitizer
  LOGIN: createFormSanitizer({
    email: 'email',
    password: 'plainText'
  }),
  
  // Registration form sanitizer
  REGISTRATION: createFormSanitizer({
    fullName: 'plainText',
    email: 'email',
    password: 'plainText',
    confirmPassword: 'plainText',
    phone: 'phone',
    location: 'plainText',
    description: 'basicHTML',
    portfolio: 'url',
    certifications: 'plainText'
  }),
  
  // Contact form sanitizer
  CONTACT: createFormSanitizer({
    name: 'plainText',
    email: 'email',
    subject: 'plainText',
    message: 'basicHTML',
    phone: 'phone'
  }),
  
  // Profile update sanitizer
  PROFILE: createFormSanitizer({
    name: 'plainText',
    email: 'email',
    phone: 'phone',
    location: 'plainText',
    bio: 'basicHTML',
    website: 'url'
  })
};