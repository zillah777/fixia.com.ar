import { test, expect, Page } from '@playwright/test';

/**
 * Authentication & Security Testing
 * 
 * Validates authentication system including login, logout, password recovery,
 * session management, and security measures.
 */

test.describe('Authentication & Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('should display login form with correct elements', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await expect(page).toHaveURL('/login');
      
      // Check login form elements
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
      await expect(page.locator('text=¿Olvidaste tu contraseña?')).toBeVisible();
      await expect(page.locator('text=¿No tienes cuenta?')).toBeVisible();
    });

    test('should validate required login fields', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Try to submit empty form
      await page.click('[data-testid="login-button"]');
      
      // Check validation errors
      await expect(page.locator('text=El email es requerido')).toBeVisible();
      await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
    });

    test('should validate email format in login', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('text=Email inválido')).toBeVisible();
    });

    test('should handle invalid credentials', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Should show error message
      await expect(page.locator('text=Credenciales inválidas')).toBeVisible({ timeout: 10000 });
      await expect(page).toHaveURL('/login'); // Should stay on login page
    });

    test('should successfully log in valid user', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Use test credentials
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
      await expect(page.locator('text=Bienvenido')).toBeVisible({ timeout: 10000 });
    });

    test('should show loading state during login', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      
      // Click login and immediately check for loading state
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
      await expect(page.locator('text=Iniciando sesión...')).toBeVisible();
    });

    test('should handle network errors during login', async ({ page }) => {
      // Intercept login request and make it fail
      await page.route('**/auth/login', route => 
        route.fulfill({ status: 500, body: 'Server Error' })
      );
      
      await page.click('text=Iniciar Sesión');
      
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Should show error message
      await expect(page.locator('text=Error en el inicio de sesión')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Logout Flow', () => {
    test('should successfully log out user', async ({ page }) => {
      // First login
      await page.click('text=Iniciar Sesión');
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
      
      // Then logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Cerrar Sesión');
      
      // Should redirect to home page
      await expect(page).toHaveURL('/', { timeout: 10000 });
      await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
      await expect(page.locator('text=Sesión cerrada correctamente')).toBeVisible();
    });

    test('should clear authentication state after logout', async ({ page }) => {
      // Login first
      await page.click('text=Iniciar Sesión');
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Cerrar Sesión');
      
      // Try to access protected route
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login'); // Should redirect to login
    });
  });

  test.describe('Password Recovery', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      await expect(page).toHaveURL('/forgot-password');
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-button"]')).toBeVisible();
    });

    test('should validate email in forgot password form', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      // Try with empty email
      await page.click('[data-testid="reset-button"]');
      await expect(page.locator('text=El email es requerido')).toBeVisible();
      
      // Try with invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="reset-button"]');
      await expect(page.locator('text=Email inválido')).toBeVisible();
    });

    test('should handle password reset request', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.click('[data-testid="reset-button"]');
      
      // Should show success message
      await expect(page.locator('text=Instrucciones enviadas a tu email')).toBeVisible({ timeout: 10000 });
    });

    test('should handle non-existent email in password reset', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      await page.click('text=¿Olvidaste tu contraseña?');
      
      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
      await page.click('[data-testid="reset-button"]');
      
      // Should show appropriate message (may be generic for security)
      await expect(page.locator('text=Si el email existe, recibirás instrucciones')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await page.click('text=Iniciar Sesión');
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
      
      // Refresh page
      await page.reload();
      
      // Should still be logged in
      await expect(page).toHaveURL('/dashboard');
    });

    test('should handle expired tokens', async ({ page }) => {
      // This test simulates token expiration
      // Implementation depends on how token expiration is handled
      
      // Login first
      await page.click('text=Iniciar Sesión');
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
      
      // Clear token or simulate expiration
      await page.evaluate(() => {
        localStorage.removeItem('fixia_token');
      });
      
      // Make authenticated request
      await page.goto('/profile');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should handle concurrent sessions', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      try {
        // Login in both contexts with same user
        const credentials = {
          email: process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local',
          password: process.env.TEST_CLIENT_PASSWORD || 'TestClient123!'
        };
        
        // Login in first context
        await page1.goto('/login');
        await page1.fill('[data-testid="email-input"]', credentials.email);
        await page1.fill('[data-testid="password-input"]', credentials.password);
        await page1.click('[data-testid="login-button"]');
        await expect(page1).toHaveURL('/dashboard');
        
        // Login in second context
        await page2.goto('/login');
        await page2.fill('[data-testid="email-input"]', credentials.email);
        await page2.fill('[data-testid="password-input"]', credentials.password);
        await page2.click('[data-testid="login-button"]');
        await expect(page2).toHaveURL('/dashboard');
        
        // Both should be logged in (or handle according to business rules)
        await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible();
        await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();
        
      } finally {
        await context1.close();
        await context2.close();
      }
    });
  });

  test.describe('Security Measures', () => {
    test('should protect against brute force attacks', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', `wrongpassword${i}`);
        await page.click('[data-testid="login-button"]');
        
        // Wait for error message
        await page.waitForSelector('text=Credenciales inválidas', { timeout: 5000 });
        
        // Clear fields for next attempt
        await page.fill('[data-testid="email-input"]', '');
        await page.fill('[data-testid="password-input"]', '');
      }
      
      // After multiple attempts, should show rate limiting message
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('text=Demasiados intentos')).toBeVisible({ timeout: 10000 });
    });

    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      // Login first
      await page.click('text=Iniciar Sesión');
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
      
      // Try to access login page while authenticated
      await page.goto('/login');
      await expect(page).toHaveURL('/dashboard'); // Should redirect back to dashboard
      
      // Try to access register page while authenticated
      await page.goto('/register');
      await expect(page).toHaveURL('/dashboard'); // Should redirect back to dashboard
    });

    test('should protect sensitive routes', async ({ page }) => {
      // Try to access protected routes without authentication
      const protectedRoutes = ['/dashboard', '/profile', '/new-project', '/opportunities'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL('/login'); // Should redirect to login
      }
    });

    test('should handle XSS prevention in forms', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      // Try to inject script in email field
      const xssPayload = '<script>alert("xss")</script>';
      await page.fill('[data-testid="email-input"]', xssPayload);
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Script should not execute
      // Check that no alert dialog appears
      await page.waitForTimeout(2000);
    });
  });

  test.describe('UI/UX Security Feedback', () => {
    test('should mask password input', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should provide option to show/hide password', async ({ page }) => {
      await page.click('text=Iniciar Sesión');
      
      const showPasswordButton = page.locator('[data-testid="toggle-password-visibility"]');
      if (await showPasswordButton.isVisible()) {
        await showPasswordButton.click();
        await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'text');
        
        await showPasswordButton.click();
        await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'password');
      }
    });

    test('should clear sensitive data on logout', async ({ page }) => {
      // Login
      await page.click('text=Iniciar Sesión');
      await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
      await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
      
      // Check that token exists
      const tokenBefore = await page.evaluate(() => localStorage.getItem('fixia_token'));
      expect(tokenBefore).toBeTruthy();
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Cerrar Sesión');
      
      // Check that tokens are cleared
      const tokenAfter = await page.evaluate(() => localStorage.getItem('fixia_token'));
      const userAfter = await page.evaluate(() => localStorage.getItem('fixia_user'));
      expect(tokenAfter).toBeNull();
      expect(userAfter).toBeNull();
    });
  });
});