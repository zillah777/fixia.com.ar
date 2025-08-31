/**
 * Utility to validate that no demo/test credentials are used in production
 * This helps prevent accidental use of hardcoded credentials
 */

const DEMO_PATTERNS = [
  // Common demo emails
  /demo@.*\.(com|ar|local)/i,
  /test@.*\.(com|ar|local)/i,
  /admin@.*\.(com|ar|local)/i,
  /example@.*\.(com|ar|local)/i,
  
  // Common demo usernames
  /^(demo|test|admin|example|user|cliente|profesional)$/i,
  
  // Common demo passwords
  /^(password|123456|demo|test|admin)$/i,
  /password123/i,
  /demo123/i,
  /test123/i,
];

/**
 * Check if a credential looks like a demo/test credential
 */
export const isDemoCredential = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  
  return DEMO_PATTERNS.some(pattern => pattern.test(value));
};

/**
 * Validate credentials and warn if they appear to be demo credentials
 * Only runs in development/testing environments
 */
export const validateProductionCredentials = (
  email?: string, 
  password?: string, 
  username?: string
): { isValid: boolean; warnings: string[] } => {
  // Skip validation in production build
  if (import.meta.env.PROD) {
    return { isValid: true, warnings: [] };
  }
  
  const warnings: string[] = [];
  let isValid = true;
  
  if (email && isDemoCredential(email)) {
    warnings.push(`Demo email detected: ${email}. Use real credentials in production.`);
    isValid = false;
  }
  
  if (password && isDemoCredential(password)) {
    warnings.push('Demo password detected. Use a strong password in production.');
    isValid = false;
  }
  
  if (username && isDemoCredential(username)) {
    warnings.push(`Demo username detected: ${username}. Use a real username in production.`);
    isValid = false;
  }
  
  // Log warnings in development
  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn('🚨 Demo credentials detected:', warnings);
  }
  
  return { isValid, warnings };
};

/**
 * Environment check to ensure we're not accidentally using demo data
 */
export const isProductionEnvironment = (): boolean => {
  return import.meta.env.PROD && import.meta.env.MODE === 'production';
};

/**
 * Get safe environment identifier (without exposing sensitive info)
 */
export const getEnvironmentInfo = () => {
  return {
    isProd: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    // Never expose actual environment variables
    hasApiUrl: Boolean(import.meta.env.VITE_API_URL),
  };
};