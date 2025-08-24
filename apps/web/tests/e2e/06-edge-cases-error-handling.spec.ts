import { test, expect, Page } from '@playwright/test';

/**
 * Edge Cases & Error Handling Testing
 * 
 * Tests error scenarios including network issues, invalid data, authorization errors,
 * server errors, empty states, and boundary conditions.
 */

test.describe('Edge Cases & Error Handling', () => {
  test.describe('Network Issues', () => {
    test('should handle offline behavior', async ({ page, context }) => {
      await page.goto('/');
      
      // Simulate going offline
      await context.setOffline(true);
      
      // Try to navigate to a new page
      await page.click('text=Servicios');
      
      // Should show offline message or cached content
      const offlineMessage = page.locator('[data-testid="offline-message"]');
      if (await offlineMessage.isVisible()) {
        await expect(offlineMessage).toContainText(/sin conexión|offline/i);
      } else {
        // If cached content is shown, verify it's still functional
        await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
      }
      
      // Go back online
      await context.setOffline(false);
      
      // Should reconnect and work normally
      await page.reload();
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
    });

    test('should handle connection timeouts', async ({ page }) => {
      // Intercept requests and delay them significantly
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 30000); // 30 second delay
      });
      
      await page.goto('/services');
      
      // Should show loading state and eventually timeout message
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
      
      // After timeout, should show error message
      await expect(page.locator('text=Error de conexión')).toBeVisible({ timeout: 35000 });
      
      // Should provide retry option
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible();
      }
    });

    test('should handle intermittent connectivity', async ({ page, context }) => {
      await page.goto('/services');
      
      // Simulate intermittent connectivity during form submission
      await page.route('**/api/auth/login', route => {
        // Randomly fail some requests
        if (Math.random() > 0.5) {
          route.fulfill({ status: 503, body: 'Service Unavailable' });
        } else {
          route.continue();
        }
      });
      
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      
      // Multiple attempts should eventually work or show appropriate error
      let attempts = 0;
      while (attempts < 3) {
        await page.click('[data-testid="login-button"]');
        
        // Wait for either success or error
        try {
          await Promise.race([
            page.waitForURL('/dashboard', { timeout: 5000 }),
            page.waitForSelector('text=Error', { timeout: 5000 })
          ]);
          break;
        } catch (error) {
          attempts++;
        }
      }
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 3000); // 3 second delay
      });
      
      await page.goto('/services');
      
      // Should show progressive loading states
      await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
      
      // Content should eventually load
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Invalid Data Handling', () => {
    test('should prevent XSS attacks in form inputs', async ({ page }) => {
      await page.goto('/register');
      
      // Try to inject malicious scripts
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '"><script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">'
      ];
      
      for (const payload of xssPayloads) {
        await page.fill('[data-testid="fullName-input"]', payload);
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'password');
        await page.click('[data-testid="register-button"]');
        
        // Script should not execute - no alert dialog should appear
        await page.waitForTimeout(1000);
        
        // Form should either reject the input or sanitize it
        const nameValue = await page.inputValue('[data-testid="fullName-input"]');
        expect(nameValue).not.toContain('<script>');
        expect(nameValue).not.toContain('javascript:');
      }
    });

    test('should handle SQL injection attempts', async ({ page }) => {
      await page.goto('/services');
      
      // Try SQL injection in search
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO users VALUES('hacker', 'password'); --"
      ];
      
      for (const payload of sqlPayloads) {
        await page.fill('[data-testid="search-services-input"]', payload);
        await page.click('[data-testid="search-button"]');
        
        // Should not cause server errors or expose data
        await page.waitForTimeout(1000);
        
        // Should either show no results or safe error message
        const errorMessage = page.locator('text=Error en la búsqueda');
        const noResults = page.locator('text=No se encontraron servicios');
        
        // One of these should be true, but no 500 errors or data exposure
        expect(await errorMessage.isVisible() || await noResults.isVisible()).toBeTruthy();
      }
    });

    test('should validate file upload types and sizes', async ({ page }) => {
      await page.goto('/register');
      await page.selectOption('[data-testid="userType-select"]', 'professional');
      
      const fileInput = page.locator('[data-testid="portfolio-upload-input"]');
      if (await fileInput.isVisible()) {
        // Try uploading invalid file types
        const invalidFiles = [
          { name: 'malicious.exe', type: 'application/x-msdownload' },
          { name: 'script.js', type: 'application/javascript' },
          { name: 'large-file.jpg', size: 50 * 1024 * 1024 } // 50MB file
        ];
        
        // This would need to be adjusted based on actual implementation
        // As Playwright can't directly create files with specific content
        
        // Test that proper validation messages appear
        await expect(page.locator('text=Tipo de archivo no válido')).toBeVisible();
      }
    });

    test('should handle malformed URLs', async ({ page }) => {
      // Try accessing malformed URLs
      const malformedUrls = [
        '/services/../../../etc/passwd',
        '/services/%2e%2e%2f%2e%2e%2f',
        '/services/<script>alert("xss")</script>',
        '/services/999999999999999999999',
        '/services/null',
        '/services/undefined'
      ];
      
      for (const url of malformedUrls) {
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Should redirect to 404 page or home page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(404|not-found|$)/);
        
        // Should not expose server errors or system paths
        const pageContent = await page.textContent('body');
        expect(pageContent).not.toContain('/etc/');
        expect(pageContent).not.toContain('Error 500');
        expect(pageContent).not.toContain('Stack trace');
      }
    });
  });

  test.describe('Authorization Errors', () => {
    test('should handle expired authentication tokens', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Simulate token expiration
      await page.evaluate(() => {
        localStorage.setItem('fixia_token', 'expired.token.here');
      });
      
      // Try to access protected resource
      await page.goto('/dashboard');
      
      // Should redirect to login with appropriate message
      await expect(page).toHaveURL('/login');
      await expect(page.locator('text=Sesión expirada')).toBeVisible();
    });

    test('should prevent access to unauthorized resources', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'client@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Try to access admin-only features (if any exist)
      await page.goto('/admin');
      
      // Should redirect or show access denied
      await expect(page).toHaveURL(/\/(login|404|access-denied)/);
    });

    test('should handle role-based access correctly', async ({ page }) => {
      // Login as client
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'client@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Try to access professional-only features
      await page.goto('/services/create');
      
      // Should be redirected or show appropriate message
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/services/create');
      
      // Should show appropriate error message
      await expect(page.locator('text=No tienes permisos')).toBeVisible();
    });

    test('should handle concurrent session conflicts', async ({ page, context }) => {
      // Create two browser contexts
      const context1 = await context.browser()?.newContext();
      const context2 = await context.browser()?.newContext();
      
      if (context1 && context2) {
        const page1 = await context1.newPage();
        const page2 = await context2.newPage();
        
        // Login with same user in both contexts
        const credentials = { email: 'test@example.com', password: 'password' };
        
        // Login in first context
        await page1.goto('/login');
        await page1.fill('[data-testid="email-input"]', credentials.email);
        await page1.fill('[data-testid="password-input"]', credentials.password);
        await page1.click('[data-testid="login-button"]');
        
        // Login in second context (should invalidate first session if implemented)
        await page2.goto('/login');
        await page2.fill('[data-testid="email-input"]', credentials.email);
        await page2.fill('[data-testid="password-input"]', credentials.password);
        await page2.click('[data-testid="login-button"]');
        
        // First session might be invalidated
        await page1.goto('/dashboard');
        
        // Depending on implementation, first session might be logged out
        // This test would need adjustment based on business requirements
        
        await context1.close();
        await context2.close();
      }
    });
  });

  test.describe('Server Errors', () => {
    test('should handle 500 internal server errors', async ({ page }) => {
      // Intercept API calls and return 500 errors
      await page.route('**/api/services', route => {
        route.fulfill({ 
          status: 500, 
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await page.goto('/services');
      
      // Should show user-friendly error message
      await expect(page.locator('text=Error del servidor')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="server-error-illustration"]')).toBeVisible();
      
      // Should provide retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Should not expose technical details
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('Stack trace');
      expect(pageContent).not.toContain('Database error');
    });

    test('should handle 503 service unavailable', async ({ page }) => {
      await page.route('**/api/**', route => {
        route.fulfill({ 
          status: 503, 
          contentType: 'text/html',
          body: '<h1>Service Temporarily Unavailable</h1>'
        });
      });
      
      await page.goto('/services');
      
      // Should show maintenance message
      await expect(page.locator('text=Servicio temporalmente no disponible')).toBeVisible();
      
      // Should suggest trying again later
      await expect(page.locator('text=Intenta nuevamente más tarde')).toBeVisible();
    });

    test('should handle API rate limiting', async ({ page }) => {
      // Simulate rate limiting
      await page.route('**/api/**', route => {
        route.fulfill({ 
          status: 429, 
          contentType: 'application/json',
          headers: { 'Retry-After': '60' },
          body: JSON.stringify({ error: 'Too Many Requests' })
        });
      });
      
      await page.goto('/services');
      await page.fill('[data-testid="search-services-input"]', 'test');
      
      // Rapid searches should trigger rate limiting
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="search-button"]');
        await page.waitForTimeout(100);
      }
      
      // Should show rate limit message
      await expect(page.locator('text=Demasiadas solicitudes')).toBeVisible();
      await expect(page.locator('text=Intenta nuevamente en unos minutos')).toBeVisible();
    });

    test('should handle database connection failures', async ({ page }) => {
      await page.route('**/api/**', route => {
        route.fulfill({ 
          status: 500, 
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database connection failed' })
        });
      });
      
      await page.goto('/services');
      
      // Should show generic error message, not database details
      await expect(page.locator('text=Error del servidor')).toBeVisible();
      
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('Database');
      expect(pageContent).not.toContain('SQL');
      expect(pageContent).not.toContain('connection failed');
    });
  });

  test.describe('Empty States', () => {
    test('should handle no services available', async ({ page }) => {
      // Mock empty services response
      await page.route('**/api/services', route => {
        route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ data: [], total: 0 })
        });
      });
      
      await page.goto('/services');
      
      // Should show empty state illustration
      await expect(page.locator('[data-testid="empty-services-state"]')).toBeVisible();
      await expect(page.locator('text=No hay servicios disponibles')).toBeVisible();
      
      // Should suggest actions
      await expect(page.locator('text=Sé el primero en ofrecer servicios')).toBeVisible();
      await expect(page.locator('[data-testid="create-service-cta"]')).toBeVisible();
    });

    test('should handle no projects for client', async ({ page }) => {
      // Login as client with no projects
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'newclient@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/dashboard');
      
      // Should show empty projects state
      const emptyProjectsSection = page.locator('[data-testid="empty-projects-state"]');
      if (await emptyProjectsSection.isVisible()) {
        await expect(emptyProjectsSection.locator('text=No tienes proyectos')).toBeVisible();
        await expect(emptyProjectsSection.locator('[data-testid="create-first-project-button"]')).toBeVisible();
      }
    });

    test('should handle no opportunities for professional', async ({ page }) => {
      // Login as professional
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'professional@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/opportunities');
      
      // Mock empty opportunities
      await page.route('**/api/opportunities', route => {
        route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ data: [], total: 0 })
        });
      });
      
      await page.reload();
      
      // Should show empty opportunities state
      await expect(page.locator('[data-testid="empty-opportunities-state"]')).toBeVisible();
      await expect(page.locator('text=No hay oportunidades disponibles')).toBeVisible();
    });

    test('should handle no notifications', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Open notifications
      const notificationsButton = page.locator('[data-testid="notifications-button"]');
      if (await notificationsButton.isVisible()) {
        await notificationsButton.click();
        
        // Should show empty notifications state
        await expect(page.locator('[data-testid="empty-notifications-state"]')).toBeVisible();
        await expect(page.locator('text=No tienes notificaciones')).toBeVisible();
      }
    });

    test('should handle empty search results with suggestions', async ({ page }) => {
      await page.goto('/services');
      
      // Search for something that doesn't exist
      await page.fill('[data-testid="search-services-input"]', 'servicio-inexistente-xyz123');
      await page.click('[data-testid="search-button"]');
      
      // Should show empty search state
      await expect(page.locator('[data-testid="empty-search-state"]')).toBeVisible();
      await expect(page.locator('text=No encontramos servicios')).toBeVisible();
      
      // Should provide suggestions
      await expect(page.locator('text=Prueba con diferentes términos')).toBeVisible();
      await expect(page.locator('[data-testid="search-suggestions-list"]')).toBeVisible();
      
      // Should provide alternative actions
      await expect(page.locator('[data-testid="browse-categories-button"]')).toBeVisible();
    });
  });

  test.describe('Boundary Conditions', () => {
    test('should handle very long input strings', async ({ page }) => {
      await page.goto('/register');
      
      // Generate very long strings
      const longString = 'A'.repeat(10000);
      const mediumString = 'B'.repeat(1000);
      
      // Try to input extremely long text
      await page.fill('[data-testid="fullName-input"]', longString);
      await page.fill('[data-testid="email-input"]', `${mediumString}@example.com`);
      
      // Form should handle this gracefully
      const nameValue = await page.inputValue('[data-testid="fullName-input"]');
      const emailValue = await page.inputValue('[data-testid="email-input"]');
      
      // Values should be truncated or rejected
      expect(nameValue.length).toBeLessThan(1000);
      expect(emailValue.length).toBeLessThan(500);
    });

    test('should handle maximum file upload limits', async ({ page }) => {
      await page.goto('/register');
      await page.selectOption('[data-testid="userType-select"]', 'professional');
      
      const fileInput = page.locator('[data-testid="portfolio-upload-input"]');
      if (await fileInput.isVisible()) {
        // This would need adjustment based on actual implementation
        // Test that appropriate file size limits are enforced
        
        // Should show error for oversized files
        await expect(page.locator('text=Archivo demasiado grande')).toBeVisible();
      }
    });

    test('should handle edge case dates', async ({ page }) => {
      await page.goto('/register');
      
      // Try edge case dates if date inputs exist
      const dateInputs = page.locator('input[type="date"]');
      const dateCount = await dateInputs.count();
      
      if (dateCount > 0) {
        const firstDateInput = dateInputs.first();
        
        // Try future dates, past dates, invalid formats
        const edgeCaseDates = [
          '1900-01-01',
          '2100-12-31',
          '2000-02-29', // Leap year
          '2001-02-29', // Non-leap year
          '2023-13-45', // Invalid date
        ];
        
        for (const date of edgeCaseDates) {
          await firstDateInput.fill(date);
          
          // Should handle invalid dates appropriately
          const currentValue = await firstDateInput.inputValue();
          if (date === '2023-13-45') {
            expect(currentValue).not.toBe(date); // Should reject invalid date
          }
        }
      }
    });

    test('should handle special characters in all text inputs', async ({ page }) => {
      await page.goto('/register');
      
      // Special characters that might cause issues
      const specialChars = [
        '👨‍💼🔧⚡', // Emojis
        'José María Ñoño', // Spanish accents and ñ
        '中文测试', // Chinese characters
        '🇦🇷 Argentina', // Flag emoji
        '"quotes" \'apostrophes\'', // Quotes
        'test@domain.co.uk', // Email with special domain
      ];
      
      for (const chars of specialChars) {
        await page.fill('[data-testid="fullName-input"]', chars);
        
        // Should handle special characters appropriately
        const value = await page.inputValue('[data-testid="fullName-input"]');
        
        // Should preserve accents and special characters for names
        if (chars.includes('José')) {
          expect(value).toContain('José');
          expect(value).toContain('ñ');
        }
        
        // Should handle emojis (either accept or reject consistently)
        if (chars.includes('👨‍💼')) {
          // Check that it doesn't break the form
          await page.click('[data-testid="register-button"]');
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Performance Edge Cases', () => {
    test('should handle large numbers of search results', async ({ page }) => {
      // Mock response with many items
      await page.route('**/api/services', route => {
        const largeDataset = Array(1000).fill(null).map((_, i) => ({
          id: i,
          title: `Servicio ${i}`,
          description: `Descripción del servicio ${i}`,
          price: 1000 + i,
          rating: 4 + (i % 10) / 10,
          professional: { name: `Profesional ${i}`, location: 'Puerto Madryn' }
        }));
        
        route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ data: largeDataset, total: 1000 })
        });
      });
      
      await page.goto('/services');
      
      // Should handle large dataset without crashing
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
      
      // Should implement pagination or virtual scrolling
      const serviceCards = page.locator('[data-testid="service-card"]');
      const visibleCards = await serviceCards.count();
      
      // Should not load all 1000 items at once
      expect(visibleCards).toBeLessThan(100);
      
      // Should provide pagination or infinite scroll
      const pagination = page.locator('[data-testid="pagination"]');
      const infiniteScroll = page.locator('[data-testid="load-more-button"]');
      
      expect(await pagination.isVisible() || await infiniteScroll.isVisible()).toBeTruthy();
    });

    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/services');
      
      // Rapidly click filters and search
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      const searchButton = page.locator('[data-testid="search-button"]');
      
      // Rapid interactions should not crash the app
      for (let i = 0; i < 20; i++) {
        if (await categoryFilter.isVisible()) {
          await categoryFilter.selectOption(`option-${i % 3}`);
        }
        
        if (await searchButton.isVisible()) {
          await searchButton.click();
        }
        
        await page.waitForTimeout(50);
      }
      
      // App should still be functional
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
    });

    test('should handle memory limitations on mobile', async ({ page }) => {
      // Simulate mobile device with limited memory
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate through multiple pages quickly
      const pages = ['/services', '/about', '/how-it-works', '/contact', '/pricing'];
      
      for (const route of pages) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Check that page is still responsive
        await expect(page.locator('body')).toBeVisible();
      }
      
      // Memory usage should not cause crashes (hard to test directly)
      // But the app should remain functional
      await page.goto('/services');
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
    });
  });
});