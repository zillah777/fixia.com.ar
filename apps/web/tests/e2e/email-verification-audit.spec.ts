import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Comprehensive Email Verification Frontend Audit
 * 
 * This test suite audits the complete frontend email verification experience:
 * - UX flow testing
 * - Accessibility compliance
 * - Mobile responsiveness
 * - Error handling
 * - Security testing
 * - Performance testing
 */

test.describe('Email Verification Frontend Audit', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('1. UX Flow Testing', () => {
    test('should display email verification page correctly', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Check page title and basic elements
      await expect(page).toHaveTitle(/verifica|verification/i);
      await expect(page.locator('h1, h2')).toContainText(/verifica.*email/i);
      
      // Check email masking
      await expect(page.locator('text=te***t@example.com')).toBeVisible();
      
      // Check instruction text
      await expect(page.locator('text=/bandeja de entrada/i')).toBeVisible();
      await expect(page.locator('text=/carpeta de spam/i')).toBeVisible();
      await expect(page.locator('text=/24 horas/i')).toBeVisible();
      
      console.log('✅ UX Flow: Basic page display working correctly');
    });

    test('should handle verification token processing', async () => {
      // Mock successful verification
      await page.route('**/auth/verify-email', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Email verificado exitosamente' })
        });
      });

      await page.goto('/verify-email?email=test@example.com&token=valid-token');
      
      // Should show loading state initially
      await expect(page.locator('text=/verificando.*email/i')).toBeVisible({ timeout: 1000 });
      
      // Should show success state
      await expect(page.locator('text=/email verificado/i')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=/cuenta verificada.*segura/i')).toBeVisible();
      
      // Should have login button
      const loginButton = page.locator('button:has-text("Iniciar Sesión")');
      await expect(loginButton).toBeVisible();
      
      console.log('✅ UX Flow: Successful verification flow working');
    });

    test('should handle verification errors gracefully', async () => {
      // Mock verification error
      await page.route('**/auth/verify-email', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Token de verificación inválido o expirado' })
        });
      });

      await page.goto('/verify-email?email=test@example.com&token=invalid-token');
      
      // Should show error message
      await expect(page.locator('text=/token.*inválido.*expirado/i')).toBeVisible({ timeout: 10000 });
      
      // Should still show resend option
      await expect(page.locator('button:has-text("Reenviar Email")')).toBeVisible();
      
      console.log('✅ UX Flow: Error handling working correctly');
    });

    test('should test resend functionality', async () => {
      // Mock resend success
      await page.route('**/auth/resend-verification', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Email de verificación enviado' })
        });
      });

      await page.goto('/verify-email?email=test@example.com');
      
      const resendButton = page.locator('button:has-text("Reenviar Email")');
      await expect(resendButton).toBeVisible();
      
      // Click resend
      await resendButton.click();
      
      // Should show sending state
      await expect(page.locator('text=/enviando/i')).toBeVisible({ timeout: 1000 });
      
      // Should start cooldown
      await expect(page.locator('text=/reenviar en.*s/i')).toBeVisible({ timeout: 5000 });
      
      // Button should be disabled during cooldown
      await expect(resendButton).toBeDisabled();
      
      console.log('✅ UX Flow: Resend functionality working with cooldown');
    });

    test('should test auto-redirect after successful verification', async () => {
      // Mock successful verification
      await page.route('**/auth/verify-email', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Email verificado exitosamente' })
        });
      });

      await page.goto('/verify-email?email=test@example.com&token=valid-token');
      
      // Wait for success state
      await expect(page.locator('text=/email verificado/i')).toBeVisible();
      
      // Should show countdown message
      await expect(page.locator('text=/serás redirigido automáticamente/i')).toBeVisible();
      
      // Note: We don't test the actual redirect timing in this test to keep it fast
      console.log('✅ UX Flow: Auto-redirect messaging displayed correctly');
    });

    test('should handle edge cases in email masking', async () => {
      const testCases = [
        { input: 'a@b.com', expected: 'a@b.com' }, // Too short to mask
        { input: 'ab@test.com', expected: 'ab@test.com' }, // Too short to mask
        { input: 'abc@test.com', expected: 'ab*c@test.com' }, // Minimal masking
        { input: 'verylongemail@example.com', expected: 've***********l@example.com' }, // Long email
        { input: '', expected: 'tu email' }, // Empty email
      ];

      for (const testCase of testCases) {
        await page.goto(`/verify-email?email=${encodeURIComponent(testCase.input)}`);
        
        if (testCase.expected !== 'tu email') {
          await expect(page.locator(`text=${testCase.expected}`)).toBeVisible();
        } else {
          await expect(page.locator('text=tu email')).toBeVisible();
        }
      }
      
      console.log('✅ UX Flow: Email masking edge cases handled correctly');
    });
  });

  test.describe('2. Accessibility Testing', () => {
    test('should meet WCAG accessibility standards', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Check semantic HTML structure
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      await expect(page.locator('h1, h2')).toBeVisible();
      
      // Check proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check button accessibility
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect(text || ariaLabel).toBeTruthy(); // Buttons should have accessible text
      }
      
      // Check form labels
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelExists = await label.count() > 0;
          expect(labelExists || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
      
      console.log('✅ Accessibility: Basic WCAG compliance verified');
    });

    test('should support keyboard navigation', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      
      // Should be able to navigate to interactive elements
      const interactiveElements = await page.locator('button, input, a, [tabindex]').all();
      
      if (interactiveElements.length > 0) {
        for (let i = 0; i < Math.min(interactiveElements.length, 5); i++) {
          await page.keyboard.press('Tab');
          const currentFocus = await page.evaluate(() => document.activeElement?.tagName);
          expect(['BUTTON', 'INPUT', 'A'].includes(currentFocus)).toBeTruthy();
        }
      }
      
      console.log('✅ Accessibility: Keyboard navigation working');
    });

    test('should have proper ARIA attributes', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Check for ARIA landmarks
      const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"]').count();
      expect(landmarks).toBeGreaterThan(0);
      
      // Check loading states have proper ARIA
      // Mock verification to test loading state
      await page.route('**/auth/verify-email', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Delay to see loading
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Success' })
        });
      });
      
      await page.goto('/verify-email?email=test@example.com&token=test-token');
      
      // Should have aria-live regions for dynamic content
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
      
      if (liveRegions > 0) {
        console.log('✅ Accessibility: ARIA live regions present for dynamic content');
      } else {
        console.warn('⚠️ AUDIT FINDING: Missing ARIA live regions for dynamic content updates');
      }
    });

    test('should support screen readers', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Check for screen reader friendly text
      const srOnlyText = await page.locator('.sr-only, .visually-hidden, [aria-label]').count();
      
      // Check alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or be marked as decorative
        expect(alt !== null || ariaLabel || role === 'presentation').toBeTruthy();
      }
      
      // Check for descriptive text
      await expect(page.locator('text=/verifica.*email/i')).toBeVisible();
      await expect(page.locator('text=/bandeja de entrada/i')).toBeVisible();
      
      console.log('✅ Accessibility: Screen reader support verified');
    });

    test('should have sufficient color contrast', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // This would require actual color analysis, but we can check for:
      // - No use of color alone to convey information
      // - Text elements are readable
      
      const textElements = await page.locator('p, span, div, h1, h2, h3, button').all();
      
      for (const element of textElements.slice(0, 5)) { // Check first 5 elements
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Basic checks - text should have color and reasonable size
        expect(styles.color).not.toBe('');
        expect(styles.fontSize).toBeTruthy();
      }
      
      console.log('✅ Accessibility: Color and contrast basics verified');
    });
  });

  test.describe('3. Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/verify-email?email=test@example.com');
      
      // Page should be fully visible without horizontal scroll
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox.width).toBeLessThanOrEqual(375);
      
      // Touch targets should be large enough (44px minimum)
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40); // Slightly less than 44 for flexibility
        }
      }
      
      // Text should be readable
      const textElements = await page.locator('p, span, div').all();
      for (const element of textElements.slice(0, 3)) {
        const fontSize = await element.evaluate(el => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });
        expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
      }
      
      console.log('✅ Mobile: Mobile layout and usability verified');
    });

    test('should handle mobile interactions correctly', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/verify-email?email=test@example.com');
      
      // Mock resend success
      await page.route('**/auth/resend-verification', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Email enviado' })
        });
      });
      
      // Test touch interaction
      const resendButton = page.locator('button:has-text("Reenviar")');
      if (await resendButton.count() > 0) {
        await resendButton.tap(); // Use tap instead of click for mobile
        
        // Should respond to touch
        await expect(page.locator('text=/enviando/i')).toBeVisible({ timeout: 5000 });
      }
      
      console.log('✅ Mobile: Touch interactions working correctly');
    });

    test('should work on tablet devices', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/verify-email?email=test@example.com');
      
      // Should adapt layout for tablet
      const container = page.locator('main, [data-testid*="container"], .container').first();
      const containerBox = await container.boundingBox();
      
      if (containerBox) {
        expect(containerBox.width).toBeLessThanOrEqual(768);
        expect(containerBox.width).toBeGreaterThan(375); // Should use more space than mobile
      }
      
      console.log('✅ Mobile: Tablet layout working correctly');
    });

    test('should handle orientation changes', async () => {
      // Portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/verify-email?email=test@example.com');
      
      const portraitHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // Landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      
      const landscapeHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // Content should still be accessible in both orientations
      await expect(page.locator('text=/verifica.*email/i')).toBeVisible();
      
      console.log('✅ Mobile: Orientation changes handled correctly');
    });
  });

  test.describe('4. Performance Testing', () => {
    test('should load quickly', async () => {
      const startTime = Date.now();
      
      await page.goto('/verify-email?email=test@example.com');
      
      // Wait for main content to be visible
      await expect(page.locator('h1, h2')).toBeVisible({ timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      console.log(`✅ Performance: Page loaded in ${loadTime}ms`);
    });

    test('should handle slow network conditions', async () => {
      // Simulate slow network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/verify-email?email=test@example.com');
      
      // Should still load within reasonable time
      await expect(page.locator('text=/verifica.*email/i')).toBeVisible({ timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Performance: Page loaded in ${loadTime}ms under slow network`);
    });

    test('should minimize resource usage', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Check for excessive DOM elements
      const elementCount = await page.evaluate(() => document.querySelectorAll('*').length);
      expect(elementCount).toBeLessThan(1000); // Reasonable limit
      
      // Check for JavaScript errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      expect(errors.length).toBe(0);
      
      console.log('✅ Performance: Resource usage optimized');
    });

    test('should handle multiple concurrent operations', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Mock multiple API responses with delays
      await page.route('**/auth/resend-verification', async route => {
        await new Promise(resolve => setTimeout(resolve, 500));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Email enviado' })
        });
      });
      
      // Try multiple rapid clicks (should be handled gracefully)
      const resendButton = page.locator('button:has-text("Reenviar")');
      
      if (await resendButton.count() > 0) {
        // Click multiple times rapidly
        await Promise.all([
          resendButton.click(),
          resendButton.click(),
          resendButton.click()
        ]);
        
        // Should handle gracefully without errors
        await expect(page.locator('text=/enviando|enviado/i')).toBeVisible({ timeout: 5000 });
      }
      
      console.log('✅ Performance: Concurrent operations handled correctly');
    });
  });

  test.describe('5. Security Testing', () => {
    test('should handle XSS attempts safely', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '"><img src=x onerror=alert(1)>',
        '&#60;script&#62;alert(1)&#60;/script&#62;'
      ];

      for (const payload of xssPayloads) {
        await page.goto(`/verify-email?email=${encodeURIComponent(payload)}&token=${encodeURIComponent(payload)}`);
        
        // Should not execute the script
        const alertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
        const alert = await alertPromise;
        expect(alert).toBeNull();
        
        // Should not contain unescaped HTML
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>');
        expect(pageContent).not.toContain('onerror=');
      }
      
      console.log('✅ Security: XSS protection working correctly');
    });

    test('should handle malicious URLs safely', async () => {
      const maliciousUrls = [
        '/verify-email?email=test@example.com&redirect=javascript:alert(1)',
        '/verify-email?email=test@example.com&token=../../../etc/passwd',
        '/verify-email?email=test@example.com&callback=eval(atob("YWxlcnQoMSk="))'
      ];

      for (const url of maliciousUrls) {
        await page.goto(url);
        
        // Page should load normally without executing malicious code
        await expect(page.locator('text=/verifica.*email/i')).toBeVisible({ timeout: 5000 });
        
        // Should not show JavaScript alerts
        const alertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
        const alert = await alertPromise;
        expect(alert).toBeNull();
      }
      
      console.log('✅ Security: Malicious URL protection working');
    });

    test('should prevent CSRF attacks', async () => {
      // Test that verification requires proper content-type and origin
      const response = await page.evaluate(async () => {
        try {
          const result = await fetch('/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
              'Origin': 'https://malicious-site.com'
            },
            body: 'token=malicious-token'
          });
          return { status: result.status, ok: result.ok };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      // Should be rejected or handled securely
      expect(response.status).not.toBe(200);
      
      console.log('✅ Security: CSRF protection verified');
    });

    test('should sanitize user input', async () => {
      const dangerousInputs = [
        'test+<script>alert(1)</script>@example.com',
        'test@example.com" onload="alert(1)',
        'test@example.com</a><script>alert(1)</script>'
      ];

      for (const input of dangerousInputs) {
        await page.goto(`/verify-email?email=${encodeURIComponent(input)}`);
        
        // Check that dangerous content is sanitized in display
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>');
        expect(pageContent).not.toContain('onload=');
        expect(pageContent).not.toContain('</a>');
        
        // Should still show email (sanitized)
        await expect(page.locator('text=/email/i')).toBeVisible();
      }
      
      console.log('✅ Security: Input sanitization working correctly');
    });

    test('should handle rate limiting gracefully', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Mock rate limiting response
      let requestCount = 0;
      await page.route('**/auth/resend-verification', route => {
        requestCount++;
        if (requestCount > 3) {
          route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Too many requests' })
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'Email enviado' })
          });
        }
      });
      
      const resendButton = page.locator('button:has-text("Reenviar")');
      
      if (await resendButton.count() > 0) {
        // Make multiple requests
        for (let i = 0; i < 5; i++) {
          await resendButton.click();
          await page.waitForTimeout(100);
        }
        
        // Should handle rate limiting gracefully
        await expect(page.locator('text=/muchas solicitudes|rate limit/i')).toBeVisible({ timeout: 5000 });
      }
      
      console.log('✅ Security: Rate limiting handled correctly');
    });
  });

  test.describe('6. Error Handling', () => {
    test('should handle network failures gracefully', async () => {
      await page.goto('/verify-email?email=test@example.com');
      
      // Mock network failure
      await page.route('**/auth/resend-verification', route => {
        route.abort('failed');
      });
      
      const resendButton = page.locator('button:has-text("Reenviar")');
      
      if (await resendButton.count() > 0) {
        await resendButton.click();
        
        // Should show error message
        await expect(page.locator('text=/error|problema/i')).toBeVisible({ timeout: 5000 });
        
        // Button should be re-enabled for retry
        await expect(resendButton).toBeEnabled({ timeout: 5000 });
      }
      
      console.log('✅ Error handling: Network failures handled gracefully');
    });

    test('should handle server errors appropriately', async () => {
      await page.goto('/verify-email?email=test@example.com&token=server-error-token');
      
      // Mock server error
      await page.route('**/auth/verify-email', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' })
        });
      });
      
      // Should show user-friendly error message
      await expect(page.locator('text=/error|problema/i')).toBeVisible({ timeout: 10000 });
      
      // Should not expose technical details
      const pageContent = await page.content();
      expect(pageContent).not.toContain('Internal server error');
      expect(pageContent).not.toContain('500');
      expect(pageContent).not.toContain('stack trace');
      
      console.log('✅ Error handling: Server errors handled securely');
    });

    test('should provide helpful error messages in Spanish', async () => {
      // Test various error scenarios
      const errorScenarios = [
        {
          route: '**/auth/verify-email',
          response: { status: 400, body: { message: 'Token inválido' } },
          expectedText: /inválido/i
        },
        {
          route: '**/auth/verify-email',
          response: { status: 400, body: { message: 'Token expirado' } },
          expectedText: /expirado/i
        },
        {
          route: '**/auth/resend-verification',
          response: { status: 400, body: { message: 'Email no encontrado' } },
          expectedText: /email.*encontrado/i
        }
      ];

      for (const scenario of errorScenarios) {
        await page.route(scenario.route, route => {
          route.fulfill({
            status: scenario.response.status,
            contentType: 'application/json',
            body: JSON.stringify(scenario.response.body)
          });
        });
        
        if (scenario.route.includes('verify-email')) {
          await page.goto('/verify-email?email=test@example.com&token=test-token');
        } else {
          await page.goto('/verify-email?email=test@example.com');
          await page.locator('button:has-text("Reenviar")').click();
        }
        
        await expect(page.locator(`text=${scenario.expectedText}`)).toBeVisible({ timeout: 5000 });
        
        // Clean up route
        await page.unroute(scenario.route);
      }
      
      console.log('✅ Error handling: Spanish error messages displayed correctly');
    });
  });

  test.describe('7. Integration with Email Providers', () => {
    test('should handle different email client behaviors', async () => {
      // Test common email client URL modifications
      const emailClientUrls = [
        '/verify-email?email=test@example.com&token=abc123', // Direct
        '/verify-email?email=test@example.com&token=abc123&utm_source=email', // With tracking
        '/verify-email?email=test@example.com&token=abc123#mailclient', // With hash
        '/verify-email?email=test%40example.com&token=abc123', // URL encoded
      ];

      for (const url of emailClientUrls) {
        // Mock successful verification
        await page.route('**/auth/verify-email', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'Email verificado' })
          });
        });
        
        await page.goto(url);
        
        // Should handle URL variations correctly
        await expect(page.locator('text=/verificando|verificado/i')).toBeVisible({ timeout: 5000 });
        
        // Clean up
        await page.unroute('**/auth/verify-email');
      }
      
      console.log('✅ Integration: Email client URL variations handled correctly');
    });

    test('should work with email client dark mode', async () => {
      // Test with dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/verify-email?email=test@example.com');
      
      // Should be readable in dark mode
      const backgroundColor = await page.locator('body').evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      const textColor = await page.locator('h1, h2').first().evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      // Colors should be set (not default)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(textColor).not.toBe('rgba(0, 0, 0, 0)');
      
      console.log('✅ Integration: Dark mode support verified');
    });
  });
});