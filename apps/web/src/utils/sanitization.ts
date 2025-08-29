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
 * Valida y sanitiza URLs
 */
export const sanitizeURL = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Sanitizar primero
  const cleaned = DOMPurify.sanitize(input.trim(), SANITIZATION_CONFIGS.URL);
  
  // Validar que sea una URL válida
  try {
    const url = new URL(cleaned);
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return cleaned;
  } catch {
    return '';
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
  
  // Validar formato de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return '';
  }
  
  return cleaned.toLowerCase();
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