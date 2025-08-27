import { test, expect, Page } from '@playwright/test';

/**
 * User Registration Flow Testing
 * 
 * Tests complete registration journeys for both client and professional users
 * including form validation, email verification, and onboarding flow.
 */

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Client Registration', () => {
    test('should display registration form with correct fields', async ({ page }) => {
      await page.click('text=Registrarse');
      await expect(page).toHaveURL('/register');
      
      // Check basic form elements
      await expect(page.locator('[data-testid="fullName-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="location-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="userType-select"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Try to submit empty form
      await page.click('[data-testid="register-button"]');
      
      // Check validation errors
      await expect(page.locator('text=Este campo es requerido')).toBeVisible();
      await expect(page.locator('text=El email es requerido')).toBeVisible();
      await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Enter invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="register-button"]');
      
      await expect(page.locator('text=Email inválido')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Test weak password
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="register-button"]');
      
      await expect(page.locator('text=La contraseña debe tener al menos')).toBeVisible();
    });

    test('should successfully register a new client', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Generate unique test data
      const timestamp = Date.now();
      const testEmail = `test.client.${timestamp}@example.com`;
      
      // Fill registration form
      await page.fill('[data-testid="fullName-input"]', 'Juan Pérez Cliente');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="phone-input"]', '+54 280 123-4567');
      await page.selectOption('[data-testid="location-select"]', 'Puerto Madryn, Chubut');
      await page.selectOption('[data-testid="userType-select"]', 'client');
      
      // Accept terms
      await page.check('[data-testid="terms-checkbox"]');
      
      // Submit form
      await page.click('[data-testid="register-button"]');
      
      // Should redirect to dashboard or email verification
      await expect(page).toHaveURL(/\/dashboard|\/verify-email/, { timeout: 15000 });
      
      // Should show success message
      await expect(page.locator('text=Cuenta creada exitosamente')).toBeVisible({ timeout: 10000 });
    });

    test('should handle duplicate email error', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Try to register with existing email
      await page.fill('[data-testid="fullName-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'existing@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="phone-input"]', '+54 280 123-4567');
      await page.selectOption('[data-testid="location-select"]', 'Puerto Madryn, Chubut');
      await page.selectOption('[data-testid="userType-select"]', 'client');
      await page.check('[data-testid="terms-checkbox"]');
      
      await page.click('[data-testid="register-button"]');
      
      // Should show error message
      await expect(page.locator('text=El email ya está registrado')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Professional Registration', () => {
    test('should show professional-specific fields when userType is professional', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Select professional user type
      await page.selectOption('[data-testid="userType-select"]', 'professional');
      
      // Professional-specific fields should appear
      await expect(page.locator('[data-testid="serviceCategories-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="description-textarea"]')).toBeVisible();
      await expect(page.locator('[data-testid="experience-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="pricing-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="availability-select"]')).toBeVisible();
    });

    test('should validate professional-specific required fields', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Select professional and try to submit
      await page.selectOption('[data-testid="userType-select"]', 'professional');
      await page.fill('[data-testid="fullName-input"]', 'Test Professional');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.check('[data-testid="terms-checkbox"]');
      
      await page.click('[data-testid="register-button"]');
      
      // Should validate professional fields
      await expect(page.locator('text=Selecciona al menos una categoría')).toBeVisible();
      await expect(page.locator('text=Describe tus servicios')).toBeVisible();
    });

    test('should successfully register a new professional', async ({ page }) => {
      await page.click('text=Registrarse');
      
      const timestamp = Date.now();
      const testEmail = `test.professional.${timestamp}@example.com`;
      
      // Fill basic information
      await page.fill('[data-testid="fullName-input"]', 'María González Profesional');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="phone-input"]', '+54 280 765-4321');
      await page.selectOption('[data-testid="location-select"]', 'Trelew, Chubut');
      await page.selectOption('[data-testid="userType-select"]', 'professional');
      
      // Fill professional-specific information
      await page.selectOption('[data-testid="serviceCategories-select"]', 'Plomería');
      await page.fill('[data-testid="description-textarea"]', 'Plomero profesional con 10 años de experiencia en instalaciones y reparaciones.');
      await page.selectOption('[data-testid="experience-select"]', '5-10 años');
      await page.fill('[data-testid="pricing-input"]', '$5000-$15000');
      await page.selectOption('[data-testid="availability-select"]', 'Disponible');
      
      await page.check('[data-testid="terms-checkbox"]');
      
      // Submit form
      await page.click('[data-testid="register-button"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
      await expect(page.locator('text=Cuenta creada exitosamente')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Email Verification', () => {
    test('should redirect to email verification page after successful registration', async ({ page }) => {
      await page.goto('/register');
      
      const timestamp = Date.now();
      const testEmail = `verify.test.${timestamp}@example.com`;
      
      // Fill basic client registration form
      await page.fill('#fullName', 'Test User');
      await page.fill('#email', testEmail);
      await page.fill('#password', 'TestPassword123!');
      await page.fill('#confirmPassword', 'TestPassword123!');
      await page.selectOption('#location', 'Puerto Madryn');
      await page.fill('#birthdate', '1990-01-01');
      await page.check('#agreeTerms');
      await page.check('#agreePrivacy');
      
      // Submit form
      await page.click('text=Crear Cuenta Gratuita');
      
      // Should redirect to email verification page
      await expect(page).toHaveURL(/\/verify-email/, { timeout: 15000 });
      await expect(page.locator('text=Verifica tu Email')).toBeVisible();
    });

    test('should prevent login for unverified users and show resend option', async ({ page }) => {
      await page.goto('/login');
      
      // Try to login with unverified account (this would normally fail in real app)
      await page.fill('#email', 'unverified@example.com');
      await page.fill('#password', 'TestPassword123!');
      await page.click('text=Iniciar Sesión');
      
      // Should show email verification error with resend option
      await expect(page.locator('text=Debes verificar tu email')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Reenviar email de verificación')).toBeVisible();
    });

    test('should handle email verification token validation', async ({ page }) => {
      // Test with invalid token
      await page.goto('/verify-email?token=invalid-token');
      
      // Should show error message
      await expect(page.locator('text=Error de Verificación')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Reenviar Email de Verificación')).toBeVisible();
    });

    test('should show success message for valid verification', async ({ page }) => {
      // This would require a valid token from backend - mock for now
      await page.route('**/auth/verify-email', route => 
        route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ message: 'Email verificado exitosamente', success: true })
        })
      );
      
      await page.goto('/verify-email?token=valid-token-mock');
      
      // Should show success message
      await expect(page.locator('text=¡Email Verificado!')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Ir al Login Ahora')).toBeVisible();
    });

    test('should allow resending verification email', async ({ page }) => {
      // Mock the resend endpoint
      await page.route('**/auth/resend-verification', route => 
        route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ message: 'Email de verificación enviado', success: true })
        })
      );

      await page.goto('/verify-email?email=test@example.com');
      
      // Click resend button
      await page.click('text=Reenviar Email de Verificación');
      
      // Should show success message
      await expect(page.locator('text=Email de verificación reenviado')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Form Validation Edge Cases', () => {
    test('should handle special characters in name', async ({ page }) => {
      await page.click('text=Registrarse');
      
      await page.fill('[data-testid="fullName-input"]', 'José María O\'Connor-Smith');
      // Should accept names with accents, apostrophes, and hyphens
      // No validation error should appear
    });

    test('should validate phone number format', async ({ page }) => {
      await page.click('text=Registrarse');
      
      // Test invalid phone formats
      await page.fill('[data-testid="phone-input"]', '123');
      await page.click('[data-testid="register-button"]');
      
      await expect(page.locator('text=Formato de teléfono inválido')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept registration request and make it fail
      await page.route('**/auth/register', route => 
        route.fulfill({ status: 500, body: 'Server Error' })
      );
      
      await page.click('text=Registrarse');
      
      const timestamp = Date.now();
      await page.fill('[data-testid="fullName-input"]', 'Network Error Test');
      await page.fill('[data-testid="email-input"]', `network.test.${timestamp}@example.com`);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="phone-input"]', '+54 280 123-4567');
      await page.selectOption('[data-testid="location-select"]', 'Puerto Madryn, Chubut');
      await page.selectOption('[data-testid="userType-select"]', 'client');
      await page.check('[data-testid="terms-checkbox"]');
      
      await page.click('[data-testid="register-button"]');
      
      // Should show error message
      await expect(page.locator('text=Error en el registro')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('text=Registrarse');
      
      // Form should be usable on mobile
      await expect(page.locator('[data-testid="fullName-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      
      // Form should be scrollable and elements should be touchable
      const registerButton = page.locator('[data-testid="register-button"]');
      await expect(registerButton).toBeVisible();
      
      // Touch target should be appropriate size (at least 44px)
      const buttonBBox = await registerButton.boundingBox();
      expect(buttonBBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should work correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.click('text=Registrarse');
      
      // Form should adapt to tablet layout
      await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();
    });
  });
});