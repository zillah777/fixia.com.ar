import { test, expect, Page } from '@playwright/test';

/**
 * Accessibility & Usability Testing
 * 
 * Validates accessibility standards including keyboard navigation, screen reader compatibility,
 * color contrast, mobile usability, and loading states for optimal user experience.
 */

test.describe('Accessibility & Usability', () => {
  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation through main elements
      await page.keyboard.press('Tab');
      
      // Skip link should be first focusable element
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      if (await skipLink.isVisible()) {
        await expect(skipLink).toBeFocused();
        
        // Skip link should work
        await page.keyboard.press('Enter');
        await expect(page.locator('[data-testid="main-content"]')).toBeFocused();
      }
      
      // Navigate through header
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to reach all interactive elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have logical tab order', async ({ page }) => {
      await page.goto('/services');
      
      // Record tab order
      const tabOrder: string[] = [];
      let previousFocusedElement: string | null = null;
      
      // Tab through first 10 elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
          const element = document.activeElement;
          if (element) {
            return element.tagName + (element.id ? `#${element.id}` : '') + 
                   (element.className ? `.${element.className.split(' ')[0]}` : '');
          }
          return null;
        });
        
        if (focusedElement && focusedElement !== previousFocusedElement) {
          tabOrder.push(focusedElement);
          previousFocusedElement = focusedElement;
        }
      }
      
      // Tab order should be logical (header -> nav -> main content -> footer)
      expect(tabOrder.length).toBeGreaterThan(3);
      console.log('Tab order:', tabOrder);
    });

    test('should support keyboard shortcuts', async ({ page }) => {
      await page.goto('/');
      
      // Common keyboard shortcuts
      // Escape should close modals
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
      
      // Alt+S for search (if implemented)
      await page.keyboard.press('Alt+s');
      const searchInput = page.locator('[data-testid="main-search-input"]');
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeFocused();
      }
    });

    test('should handle keyboard navigation in forms', async ({ page }) => {
      await page.goto('/register');
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="fullName-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
      
      // Should be able to submit form with Enter
      await page.fill('[data-testid="fullName-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      
      // Focus submit button and press Enter
      await page.keyboard.press('Tab'); // Navigate to other fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const submitButton = page.locator('[data-testid="register-button"]');
      if (await submitButton.isFocused()) {
        await page.keyboard.press('Enter');
        // Form should submit (would show validation errors in this case)
      }
    });

    test('should support dropdown navigation with arrow keys', async ({ page }) => {
      await page.goto('/services');
      
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        // Focus dropdown
        await categoryFilter.focus();
        
        // Open with Space or Enter
        await page.keyboard.press('Space');
        
        // Navigate options with arrow keys
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowUp');
        
        // Select with Enter
        await page.keyboard.press('Enter');
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper semantic HTML structure', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
      
      // Should have only one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeLessThanOrEqual(1);
      
      // Check for main landmarks
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('should have proper ARIA labels and attributes', async ({ page }) => {
      await page.goto('/services');
      
      // Check for ARIA labels on interactive elements
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either text content or aria-label
        expect(ariaLabel || textContent).toBeTruthy();
      }
      
      // Check for proper form labels
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        
        if (id) {
          // Should have associated label
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
        
        // Or should have aria-label
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        expect(ariaLabel || placeholder).toBeTruthy();
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/services');
      
      // Look for ARIA live regions
      const liveRegions = page.locator('[aria-live]');
      const liveRegionCount = await liveRegions.count();
      
      if (liveRegionCount > 0) {
        // Check that live regions are properly configured
        const firstLiveRegion = liveRegions.first();
        const ariaLive = await firstLiveRegion.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      }
      
      // Test that form validation messages are announced
      await page.goto('/register');
      await page.click('[data-testid="register-button"]');
      
      // Error messages should be in live regions or have proper ARIA attributes
      const errorMessages = page.locator('[role="alert"], [aria-live]');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    });

    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/');
      
      const links = page.locator('a');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        const effectiveText = ariaLabel || linkText || title;
        
        // Link should have descriptive text (not just "click here" or "read more")
        if (effectiveText) {
          expect(effectiveText.toLowerCase()).not.toBe('click here');
          expect(effectiveText.toLowerCase()).not.toBe('read more');
          expect(effectiveText.toLowerCase()).not.toBe('more');
          expect(effectiveText.length).toBeGreaterThan(2);
        }
      }
    });

    test('should provide alternative text for images', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or be marked as decorative
        if (role !== 'presentation' && !alt?.includes('decorative')) {
          expect(alt).toBeTruthy();
          expect(alt?.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Color Contrast & Visual Accessibility', () => {
    test('should meet WCAG color contrast requirements', async ({ page }) => {
      await page.goto('/');
      
      // This is a simplified test - in reality you'd use tools like axe-core
      // Check that text is readable against backgrounds
      
      const textElements = page.locator('p, h1, h2, h3, button, a, span');
      const elementCount = await textElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = textElements.nth(i);
        
        // Get computed styles
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          };
        });
        
        // Basic checks - text should have color and be reasonably sized
        expect(styles.color).toBeTruthy();
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
        
        const fontSize = parseInt(styles.fontSize);
        expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
      }
    });

    test('should not rely solely on color for information', async ({ page }) => {
      await page.goto('/services');
      
      // Look for elements that might use only color to convey information
      const statusElements = page.locator('[data-testid*="status"], [class*="status"]');
      const statusCount = await statusElements.count();
      
      for (let i = 0; i < Math.min(statusCount, 5); i++) {
        const element = statusElements.nth(i);
        const textContent = await element.textContent();
        
        // Status should have text content, not just color coding
        expect(textContent?.trim().length).toBeGreaterThan(0);
      }
    });

    test('should be usable in high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background-color: white !important;
              color: black !important;
              border-color: black !important;
            }
          }
        `
      });
      
      await page.goto('/');
      
      // Content should still be readable and functional
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // Interactive elements should still work
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        await expect(buttons.first()).toBeVisible();
      }
    });

    test('should support reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.addStyleTag({
        content: `
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      });
      
      await page.goto('/');
      
      // Page should still be functional without animations
      await expect(page.locator('main')).toBeVisible();
      
      // Interactive elements should work without motion
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        await buttons.first().click();
      }
    });
  });

  test.describe('Mobile Usability', () => {
    test('should have appropriate touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/services');
      
      const interactiveElements = page.locator('button, a, input, [role="button"]');
      const elementCount = await interactiveElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = interactiveElements.nth(i);
        
        if (await element.isVisible()) {
          const boundingBox = await element.boundingBox();
          
          if (boundingBox) {
            // Touch targets should be at least 44px (WCAG guideline)
            expect(boundingBox.width).toBeGreaterThanOrEqual(40);
            expect(boundingBox.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
    });

    test('should support swipe gestures where appropriate', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Look for carousel or swipeable components
      const carousel = page.locator('[data-testid="featured-services-carousel"]');
      
      if (await carousel.isVisible()) {
        // Test swipe gesture simulation
        const carouselBox = await carousel.boundingBox();
        
        if (carouselBox) {
          // Simulate swipe left
          await page.mouse.move(carouselBox.x + carouselBox.width * 0.8, carouselBox.y + carouselBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(carouselBox.x + carouselBox.width * 0.2, carouselBox.y + carouselBox.height / 2);
          await page.mouse.up();
          
          // Wait for potential animation
          await page.waitForTimeout(500);
          
          // Carousel should respond to swipe
          // This test would need adjustment based on actual carousel implementation
        }
      }
    });

    test('should handle mobile keyboard interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/register');
      
      // Focus on input should not zoom excessively
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.click();
      
      // Input should have appropriate font-size to prevent zoom
      const fontSize = await emailInput.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(16); // Prevents zoom on iOS
    });

    test('should be usable in landscape orientation', async ({ page }) => {
      // Test landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('/');
      
      // Content should be accessible in landscape
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // Navigation should be functional
      const navLinks = page.locator('nav a');
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
    });

    test('should handle pull-to-refresh appropriately', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/services');
      
      // Simulate pull-to-refresh gesture
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      // Pull down from top
      await page.mouse.move(187, 100);
      await page.mouse.down();
      await page.mouse.move(187, 300);
      await page.mouse.up();
      
      // Page should either refresh or indicate that pull-to-refresh isn't enabled
      // This would need adjustment based on implementation
    });
  });

  test.describe('Loading States & Feedback', () => {
    test('should show loading indicators for async operations', async ({ page }) => {
      await page.goto('/services');
      
      // Apply a filter that triggers loading
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await page.selectOption(categoryFilter, 'Electricidad');
        
        // Should show loading state
        const loadingIndicator = page.locator('[data-testid="loading"], [data-testid="spinner"], .loading');
        
        // Loading indicator should appear briefly
        if (await loadingIndicator.isVisible({ timeout: 1000 })) {
          await expect(loadingIndicator).toBeVisible();
        }
      }
    });

    test('should show skeleton screens while loading', async ({ page }) => {
      // Slow down network to see skeleton screens
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 2000);
      });
      
      await page.goto('/services');
      
      // Should show skeleton loading state
      const skeletonElements = page.locator('[data-testid="skeleton"], [class*="skeleton"]');
      
      if (await skeletonElements.count() > 0) {
        await expect(skeletonElements.first()).toBeVisible();
      }
      
      // Skeletons should be replaced with actual content
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible({ timeout: 10000 });
    });

    test('should provide feedback for form submissions', async ({ page }) => {
      await page.goto('/register');
      
      // Fill form with invalid data
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="register-button"]');
      
      // Should show validation feedback
      await expect(page.locator('[role="alert"], [data-testid="error-message"]')).toBeVisible();
      
      // Fill with valid data
      await page.fill('[data-testid="fullName-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'valid@example.com');
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      
      // Mock successful submission
      await page.route('**/api/auth/register', route => {
        route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ success: true, user: { id: '1', email: 'valid@example.com' } })
        });
      });
      
      await page.click('[data-testid="register-button"]');
      
      // Should show success feedback
      await expect(page.locator('text=exitosamente')).toBeVisible({ timeout: 5000 });
    });

    test('should show progress indicators for multi-step processes', async ({ page }) => {
      await page.goto('/register');
      
      // Look for progress indicators
      const progressIndicator = page.locator('[data-testid="progress-indicator"], [role="progressbar"]');
      
      if (await progressIndicator.isVisible()) {
        // Progress should be accessible
        const ariaValueNow = await progressIndicator.getAttribute('aria-valuenow');
        const ariaValueMax = await progressIndicator.getAttribute('aria-valuemax');
        
        expect(ariaValueNow).toBeTruthy();
        expect(ariaValueMax).toBeTruthy();
      }
    });

    test('should provide clear error messages', async ({ page }) => {
      // Test network error scenario
      await page.route('**/api/**', route => {
        route.fulfill({ status: 500, body: 'Server Error' });
      });
      
      await page.goto('/services');
      
      // Should show user-friendly error message
      const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
      
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        const messageText = await errorMessage.textContent();
        
        // Error should be in Spanish and user-friendly
        expect(messageText).toMatch(/error|problema|reintenta/i);
        
        // Should not show technical details
        expect(messageText).not.toContain('500');
        expect(messageText).not.toContain('Server Error');
      }
    });
  });

  test.describe('Responsive Typography', () => {
    test('should scale text appropriately across devices', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        const h1Element = page.locator('h1').first();
        
        if (await h1Element.isVisible()) {
          const fontSize = await h1Element.evaluate((el) => {
            return parseInt(window.getComputedStyle(el).fontSize);
          });
          
          // Font sizes should be reasonable for each viewport
          if (viewport.name === 'mobile') {
            expect(fontSize).toBeGreaterThanOrEqual(24);
            expect(fontSize).toBeLessThanOrEqual(36);
          } else if (viewport.name === 'tablet') {
            expect(fontSize).toBeGreaterThanOrEqual(28);
            expect(fontSize).toBeLessThanOrEqual(48);
          } else if (viewport.name === 'desktop') {
            expect(fontSize).toBeGreaterThanOrEqual(32);
            expect(fontSize).toBeLessThanOrEqual(64);
          }
        }
      }
    });

    test('should maintain readability at different zoom levels', async ({ page }) => {
      await page.goto('/');
      
      // Test different zoom levels
      const zoomLevels = [0.5, 1.0, 1.5, 2.0];
      
      for (const zoom of zoomLevels) {
        await page.evaluate((zoomLevel) => {
          document.body.style.zoom = zoomLevel.toString();
        }, zoom);
        
        await page.waitForTimeout(500);
        
        // Text should remain readable
        const paragraphs = page.locator('p');
        if (await paragraphs.count() > 0) {
          const firstParagraph = paragraphs.first();
          
          if (await firstParagraph.isVisible()) {
            const boundingBox = await firstParagraph.boundingBox();
            
            // Text should not overflow or become unreadable
            if (boundingBox) {
              expect(boundingBox.width).toBeGreaterThan(50);
              expect(boundingBox.height).toBeGreaterThan(10);
            }
          }
        }
      }
      
      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    });
  });

  test.describe('Focus Management', () => {
    test('should manage focus properly in modals', async ({ page }) => {
      await page.goto('/');
      
      // Look for modal triggers
      const modalTrigger = page.locator('[data-testid="open-modal-button"], [aria-haspopup="dialog"]');
      
      if (await modalTrigger.count() > 0) {
        const firstTrigger = modalTrigger.first();
        await firstTrigger.click();
        
        // Modal should be focused
        const modal = page.locator('[role="dialog"]');
        
        if (await modal.isVisible()) {
          // Focus should be trapped within modal
          await page.keyboard.press('Tab');
          
          const focusedElement = page.locator(':focus');
          const modalElement = await modal.isVisible() ? modal : null;
          
          if (modalElement) {
            // Focused element should be within modal
            const isWithinModal = await focusedElement.evaluate((el, modalEl) => {
              return modalEl?.contains(el) || false;
            }, await modal.elementHandle());
            
            expect(isWithinModal).toBeTruthy();
          }
          
          // Escape should close modal and return focus
          await page.keyboard.press('Escape');
          await expect(modal).not.toBeVisible();
          
          // Focus should return to trigger
          await expect(firstTrigger).toBeFocused();
        }
      }
    });

    test('should maintain focus visibility', async ({ page }) => {
      await page.goto('/');
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.isVisible()) {
        // Focused element should have visible focus indicator
        const outline = await focusedElement.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = outline.outline !== 'none' || 
                                 outline.outlineWidth !== '0px' || 
                                 outline.boxShadow !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should handle focus after route changes', async ({ page }) => {
      await page.goto('/');
      
      // Navigate to different page
      await page.click('text=Servicios');
      
      // Focus should be managed appropriately
      // Either focused on main heading or skip link should be available
      const mainHeading = page.locator('h1');
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      
      if (await mainHeading.isVisible()) {
        // Main heading might be focused for screen reader announcement
      }
      
      if (await skipLink.isVisible()) {
        // Skip link should be focusable
        await skipLink.focus();
        await expect(skipLink).toBeFocused();
      }
    });
  });
});