export const ERROR_CODES = {
  // Authentication Errors (1000-1999)
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_1001', message: 'Credenciales inválidas' },
  AUTH_EMAIL_NOT_VERIFIED: { code: 'AUTH_1002', message: 'Debes verificar tu email antes de iniciar sesión' },
  AUTH_ACCOUNT_LOCKED: { code: 'AUTH_1003', message: 'Cuenta bloqueada por múltiples intentos fallidos' },
  AUTH_TOKEN_EXPIRED: { code: 'AUTH_1004', message: 'Token expirado' },
  AUTH_TOKEN_INVALID: { code: 'AUTH_1005', message: 'Token inválido' },
  AUTH_UNAUTHORIZED: { code: 'AUTH_1006', message: 'No autorizado' },
  
  // Registration Errors (2000-2999)
  REG_EMAIL_EXISTS: { code: 'REG_2001', message: 'Ya existe una cuenta con este email' },
  REG_INVALID_EMAIL: { code: 'REG_2002', message: 'Formato de email inválido' },
  REG_WEAK_PASSWORD: { code: 'REG_2003', message: 'La contraseña no cumple los requisitos mínimos' },
  REG_AGE_RESTRICTION: { code: 'REG_2004', message: 'Debes ser mayor de 18 años para registrarte' },
  
  // Email Verification Errors (3000-3999)
  VERIFY_TOKEN_EXPIRED: { code: 'VERIFY_3001', message: 'El token de verificación ha expirado' },
  VERIFY_TOKEN_INVALID: { code: 'VERIFY_3002', message: 'Token de verificación inválido' },
  VERIFY_TOKEN_USED: { code: 'VERIFY_3003', message: 'Este token ya ha sido utilizado' },
  VERIFY_ALREADY_VERIFIED: { code: 'VERIFY_3004', message: 'Esta cuenta ya está verificada' },
  
  // Password Errors (4000-4999)
  PWD_CURRENT_INCORRECT: { code: 'PWD_4001', message: 'La contraseña actual es incorrecta' },
  PWD_SAME_AS_CURRENT: { code: 'PWD_4002', message: 'La nueva contraseña debe ser diferente a la actual' },
  PWD_RECENTLY_USED: { code: 'PWD_4003', message: 'No puedes reutilizar una contraseña reciente' },
  PWD_RESET_TOKEN_EXPIRED: { code: 'PWD_4004', message: 'El token de restablecimiento ha expirado' },
  PWD_RESET_TOKEN_INVALID: { code: 'PWD_4005', message: 'Token de restablecimiento inválido' },
  
  // Security Errors (5000-5999)
  SEC_CSRF_TOKEN_MISSING: { code: 'SEC_5001', message: 'Token de seguridad requerido' },
  SEC_CSRF_TOKEN_INVALID: { code: 'SEC_5002', message: 'Token de seguridad inválido' },
  SEC_RATE_LIMIT_EXCEEDED: { code: 'SEC_5003', message: 'Has excedido el límite de intentos' },
  SEC_SUSPICIOUS_ACTIVITY: { code: 'SEC_5004', message: 'Actividad sospechosa detectada' },
  
  // Validation Errors (6000-6999)
  VAL_REQUIRED_FIELD: { code: 'VAL_6001', message: 'Campo requerido faltante' },
  VAL_INVALID_FORMAT: { code: 'VAL_6002', message: 'Formato inválido' },
  VAL_MIN_LENGTH: { code: 'VAL_6003', message: 'Longitud mínima no cumplida' },
  VAL_MAX_LENGTH: { code: 'VAL_6004', message: 'Longitud máxima excedida' },
  
  // Server Errors (9000-9999)
  SERVER_ERROR: { code: 'SRV_9001', message: 'Error interno del servidor' },
  SERVER_MAINTENANCE: { code: 'SRV_9002', message: 'Servidor en mantenimiento' },
  SERVER_UNAVAILABLE: { code: 'SRV_9003', message: 'Servicio no disponible temporalmente' },
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]['code'];

// Helper function to create NestJS compatible errors with custom codes
export function createSecureError(
  errorCode: typeof ERROR_CODES[keyof typeof ERROR_CODES],
  ExceptionClass: any,
  details?: any
) {
  const error = new ExceptionClass(errorCode.message);
  (error as any).errorCode = errorCode.code;
  (error as any).details = details;
  return error;
}