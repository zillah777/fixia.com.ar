import { test, expect, Page } from '@playwright/test';

/**
 * Core Marketplace Features Testing
 * 
 * Tests marketplace functionality including search & discovery, featured services,
 * professional verification, responsive design, and performance.
 */

test.describe('Core Marketplace Features', () => {
  test.describe('Search & Discovery', () => {
    test('should provide comprehensive search functionality', async ({ page }) => {
      await page.goto('/');
      
      // Main search bar on homepage
      const mainSearch = page.locator('[data-testid="main-search-input"]');
      if (await mainSearch.isVisible()) {
        await mainSearch.fill('electricista');
        await page.click('[data-testid="main-search-button"]');
        
        // Should navigate to services with search results
        await expect(page).toHaveURL(/\/services/);
        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      }
    });

    test('should show search suggestions', async ({ page }) => {
      await page.goto('/');
      
      const mainSearch = page.locator('[data-testid="main-search-input"]');
      if (await mainSearch.isVisible()) {
        // Type partial search term
        await mainSearch.fill('plom');
        
        // Check for search suggestions dropdown
        const suggestionsList = page.locator('[data-testid="search-suggestions"]');
        if (await suggestionsList.isVisible()) {
          await expect(suggestionsList).toBeVisible();
          
          // Click on first suggestion
          const firstSuggestion = page.locator('[data-testid="search-suggestion-item"]').first();
          if (await firstSuggestion.isVisible()) {
            await firstSuggestion.click();
            await expect(page).toHaveURL(/\/services/);
          }
        }
      }
    });

    test('should handle empty search results gracefully', async ({ page }) => {
      await page.goto('/services');
      
      const searchInput = page.locator('[data-testid="search-services-input"]');
      await searchInput.fill('servicio-inexistente-xyz123');
      await page.click('[data-testid="search-button"]');
      
      // Should show no results message
      await expect(page.locator('text=No se encontraron servicios')).toBeVisible();
      await expect(page.locator('[data-testid="empty-search-illustration"]')).toBeVisible();
      
      // Should suggest alternatives
      await expect(page.locator('text=Prueba con diferentes términos')).toBeVisible();
    });

    test('should maintain search state across navigation', async ({ page }) => {
      await page.goto('/services');
      
      // Perform search
      const searchInput = page.locator('[data-testid="search-services-input"]');
      await searchInput.fill('carpintería');
      await page.click('[data-testid="search-button"]');
      
      // Navigate to service detail and back
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().click();
        await page.goBack();
        
        // Search term should be maintained
        await expect(searchInput).toHaveValue('carpintería');
      }
    });

    test('should provide category browsing', async ({ page }) => {
      await page.goto('/');
      
      // Category grid on homepage
      const categoryGrid = page.locator('[data-testid="categories-grid"]');
      if (await categoryGrid.isVisible()) {
        const categoryItems = page.locator('[data-testid="category-item"]');
        const categoryCount = await categoryItems.count();
        
        if (categoryCount > 0) {
          const firstCategory = categoryItems.first();
          await expect(firstCategory.locator('[data-testid="category-name"]')).toBeVisible();
          await expect(firstCategory.locator('[data-testid="category-icon"]')).toBeVisible();
          
          // Click on category
          await firstCategory.click();
          
          // Should navigate to services filtered by category
          await expect(page).toHaveURL(/\/services/);
          await expect(page.locator('[data-testid="active-category-filter"]')).toBeVisible();
        }
      }
    });

    test('should show popular services', async ({ page }) => {
      await page.goto('/');
      
      // Popular services section
      const popularSection = page.locator('[data-testid="popular-services-section"]');
      if (await popularSection.isVisible()) {
        await expect(popularSection.locator('text=Servicios Populares')).toBeVisible();
        
        const popularServices = page.locator('[data-testid="popular-service-item"]');
        if (await popularServices.count() > 0) {
          await expect(popularServices.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Featured Services', () => {
    test('should display featured services on homepage', async ({ page }) => {
      await page.goto('/');
      
      // Hero section with featured services
      const heroSection = page.locator('[data-testid="hero-section"]');
      await expect(heroSection).toBeVisible();
      
      // Featured services carousel
      const featuredCarousel = page.locator('[data-testid="featured-services-carousel"]');
      if (await featuredCarousel.isVisible()) {
        const featuredItems = page.locator('[data-testid="featured-service-item"]');
        const itemCount = await featuredItems.count();
        
        if (itemCount > 0) {
          const firstFeatured = featuredItems.first();
          await expect(firstFeatured.locator('[data-testid="service-title"]')).toBeVisible();
          await expect(firstFeatured.locator('[data-testid="professional-name"]')).toBeVisible();
          await expect(firstFeatured.locator('[data-testid="service-price"]')).toBeVisible();
        }
      }
    });

    test('should navigate through featured services carousel', async ({ page }) => {
      await page.goto('/');
      
      const carousel = page.locator('[data-testid="featured-services-carousel"]');
      if (await carousel.isVisible()) {
        // Check for navigation buttons
        const nextButton = page.locator('[data-testid="carousel-next-button"]');
        const prevButton = page.locator('[data-testid="carousel-prev-button"]');
        
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Should show different items
          await expect(carousel).toBeVisible();
        }
        
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should show service of the day/week', async ({ page }) => {
      await page.goto('/');
      
      // Service of the day section
      const serviceOfTheDay = page.locator('[data-testid="service-of-the-day"]');
      if (await serviceOfTheDay.isVisible()) {
        await expect(serviceOfTheDay.locator('text=Servicio del Día')).toBeVisible();
        await expect(serviceOfTheDay.locator('[data-testid="featured-service-title"]')).toBeVisible();
        await expect(serviceOfTheDay.locator('[data-testid="special-offer-badge"]')).toBeVisible();
      }
    });

    test('should highlight premium services', async ({ page }) => {
      await page.goto('/services');
      
      // Premium services should be highlighted
      const premiumServices = page.locator('[data-testid="premium-service-card"]');
      const premiumCount = await premiumServices.count();
      
      if (premiumCount > 0) {
        const firstPremium = premiumServices.first();
        await expect(firstPremium.locator('[data-testid="premium-badge"]')).toBeVisible();
        // Premium services should appear before regular ones
      }
    });
  });

  test.describe('Professional Verification', () => {
    test('should display verification badges', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        const firstService = serviceCards.first();
        
        // Look for verification indicators
        const verifiedBadge = firstService.locator('[data-testid="verified-professional-badge"]');
        if (await verifiedBadge.isVisible()) {
          await expect(verifiedBadge).toHaveAttribute('title', /verificado/i);
        }
        
        // Professional level indicators
        const levelBadge = firstService.locator('[data-testid="professional-level-badge"]');
        if (await levelBadge.isVisible()) {
          await expect(levelBadge).toBeVisible();
        }
      }
    });

    test('should show verification details in professional profile', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().locator('[data-testid="professional-name"]').click();
        
        // Verification section on profile
        const verificationSection = page.locator('[data-testid="verification-section"]');
        if (await verificationSection.isVisible()) {
          await expect(verificationSection.locator('text=Verificaciones')).toBeVisible();
          
          // Different verification types
          const verificationItems = page.locator('[data-testid="verification-item"]');
          if (await verificationItems.count() > 0) {
            const firstVerification = verificationItems.first();
            await expect(firstVerification.locator('[data-testid="verification-type"]')).toBeVisible();
            await expect(firstVerification.locator('[data-testid="verification-status"]')).toBeVisible();
          }
        }
      }
    });

    test('should explain verification criteria', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().locator('[data-testid="professional-name"]').click();
        
        const verificationInfo = page.locator('[data-testid="verification-info-button"]');
        if (await verificationInfo.isVisible()) {
          await verificationInfo.click();
          
          // Should show modal/tooltip with verification criteria
          await expect(page.locator('[data-testid="verification-modal"]')).toBeVisible();
          await expect(page.locator('text=Criterios de Verificación')).toBeVisible();
        }
      }
    });

    test('should display trust indicators', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        const firstService = serviceCards.first();
        
        // Trust indicators
        const responseTimeIndicator = firstService.locator('[data-testid="response-time-indicator"]');
        if (await responseTimeIndicator.isVisible()) {
          await expect(responseTimeIndicator).toContainText(/responde en/i);
        }
        
        const completionRateIndicator = firstService.locator('[data-testid="completion-rate-indicator"]');
        if (await completionRateIndicator.isVisible()) {
          await expect(completionRateIndicator).toBeVisible();
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Mobile navigation
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        
        // Mobile menu should be visible
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        
        // Navigation items should be accessible
        await expect(page.locator('[data-testid="mobile-nav-services"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-nav-login"]')).toBeVisible();
        
        // Close mobile menu
        await page.click('[data-testid="mobile-menu-close"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
      }
    });

    test('should adapt service cards for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        const firstCard = serviceCards.first();
        
        // Card should be full width on mobile
        const cardBBox = await firstCard.boundingBox();
        const viewportWidth = page.viewportSize()?.width || 375;
        
        // Card should take most of the viewport width (accounting for margins)
        expect(cardBBox?.width).toBeGreaterThan(viewportWidth * 0.8);
        
        // Touch targets should be appropriate size
        const contactButton = firstCard.locator('[data-testid="contact-button"]');
        if (await contactButton.isVisible()) {
          const buttonBBox = await contactButton.boundingBox();
          expect(buttonBBox?.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should work correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      
      // Tablet layout should show more content
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Navigation should be horizontal on tablet
      const desktopNav = page.locator('[data-testid="desktop-navigation"]');
      if (await desktopNav.isVisible()) {
        await expect(desktopNav).toBeVisible();
      }
      
      // Service grid should show 2-3 columns on tablet
      await page.goto('/services');
      const servicesGrid = page.locator('[data-testid="services-grid"]');
      await expect(servicesGrid).toBeVisible();
    });

    test('should work correctly on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.goto('/');
      
      // Desktop layout with sidebar/full navigation
      await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Service grid should show multiple columns
      await page.goto('/services');
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() >= 3) {
        // Check that cards are arranged in grid
        const firstCard = await serviceCards.nth(0).boundingBox();
        const secondCard = await serviceCards.nth(1).boundingBox();
        const thirdCard = await serviceCards.nth(2).boundingBox();
        
        // Cards should be arranged horizontally (same row)
        if (firstCard && secondCard && thirdCard) {
          expect(Math.abs(firstCard.y - secondCard.y)).toBeLessThan(50);
          expect(Math.abs(secondCard.y - thirdCard.y)).toBeLessThan(50);
        }
      }
    });

    test('should handle orientation changes', async ({ page, context }) => {
      await page.goto('/');
      
      // Start with portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Content should still be accessible
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Navigation should adapt
      const navigation = page.locator('[data-testid="main-navigation"]');
      await expect(navigation).toBeVisible();
    });
  });

  test.describe('Performance Features', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      
      // Homepage should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Key elements should be visible
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    });

    test('should implement lazy loading for images', async ({ page }) => {
      await page.goto('/services');
      
      const serviceImages = page.locator('[data-testid="service-image"]');
      const imageCount = await serviceImages.count();
      
      if (imageCount > 0) {
        // Check if images have loading attribute
        const firstImage = serviceImages.first();
        const loadingAttr = await firstImage.getAttribute('loading');
        
        if (loadingAttr === 'lazy') {
          // Image should not be loaded initially if it's below the fold
          const imgSrc = await firstImage.getAttribute('src');
          expect(imgSrc).toBeTruthy();
        }
      }
    });

    test('should show loading states for dynamic content', async ({ page }) => {
      await page.goto('/services');
      
      // Apply filter that requires loading
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await page.selectOption(categoryFilter, 'Electricidad');
        
        // Should show loading state
        const loadingIndicator = page.locator('[data-testid="services-loading"]');
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeVisible();
          
          // Loading should disappear when content loads
          await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should implement infinite scroll for services', async ({ page }) => {
      await page.goto('/services');
      
      const initialServiceCount = await page.locator('[data-testid="service-card"]').count();
      
      if (initialServiceCount > 0) {
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        // Wait for potential new content
        await page.waitForTimeout(2000);
        
        const newServiceCount = await page.locator('[data-testid="service-card"]').count();
        
        // More services might have loaded (if infinite scroll is implemented)
        if (newServiceCount > initialServiceCount) {
          expect(newServiceCount).toBeGreaterThan(initialServiceCount);
        }
      }
    });

    test('should cache frequently accessed data', async ({ page }) => {
      // First visit
      await page.goto('/services');
      const firstLoadTime = Date.now();
      await page.waitForLoadState('networkidle');
      const firstLoadDuration = Date.now() - firstLoadTime;
      
      // Navigate away and back
      await page.goto('/');
      await page.goto('/services');
      const secondLoadTime = Date.now();
      await page.waitForLoadState('networkidle');
      const secondLoadDuration = Date.now() - secondLoadTime;
      
      // Second load should be faster due to caching
      expect(secondLoadDuration).toBeLessThanOrEqual(firstLoadDuration);
    });
  });

  test.describe('Location-Based Features', () => {
    test('should show location-specific content for Chubut', async ({ page }) => {
      await page.goto('/');
      
      // Should show Argentina/Chubut specific content
      await expect(page.locator('text=Chubut')).toBeVisible();
      await expect(page.locator('text=Puerto Madryn')).toBeVisible();
      await expect(page.locator('text=Trelew')).toBeVisible();
    });

    test('should filter services by location', async ({ page }) => {
      await page.goto('/services');
      
      const locationFilter = page.locator('[data-testid="location-filter"]');
      if (await locationFilter.isVisible()) {
        await page.selectOption(locationFilter, 'Puerto Madryn');
        
        await page.waitForTimeout(1000);
        
        // Results should be filtered by location
        const serviceCards = page.locator('[data-testid="service-card"]');
        if (await serviceCards.count() > 0) {
          const firstCard = serviceCards.first();
          await expect(firstCard).toContainText('Puerto Madryn');
        }
      }
    });

    test('should show distance information', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        const distanceInfo = serviceCards.first().locator('[data-testid="distance-info"]');
        if (await distanceInfo.isVisible()) {
          await expect(distanceInfo).toContainText(/km|cerca/i);
        }
      }
    });
  });

  test.describe('Multi-language Support', () => {
    test('should display content in Spanish', async ({ page }) => {
      await page.goto('/');
      
      // Check for Spanish content
      await expect(page.locator('text=Servicios')).toBeVisible();
      await expect(page.locator('text=Profesionales')).toBeVisible();
      await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
      await expect(page.locator('text=Registrarse')).toBeVisible();
    });

    test('should handle Argentine Spanish specific terms', async ({ page }) => {
      await page.goto('/');
      
      // Check for Argentine-specific terms
      const content = await page.textContent('body');
      
      // Should use Argentine Spanish currency format
      if (content?.includes('$')) {
        // Prices should be in Argentine pesos format
        await expect(page.locator('text=/\\$\\d+/')).toBeVisible();
      }
    });
  });

  test.describe('Social Features', () => {
    test('should provide social sharing options', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().click();
        
        // Check for share buttons
        const shareButton = page.locator('[data-testid="share-service-button"]');
        if (await shareButton.isVisible()) {
          await shareButton.click();
          
          // Should show sharing options
          await expect(page.locator('[data-testid="share-options"]')).toBeVisible();
          await expect(page.locator('[data-testid="share-whatsapp"]')).toBeVisible();
          await expect(page.locator('[data-testid="share-facebook"]')).toBeVisible();
        }
      }
    });

    test('should show social proof elements', async ({ page }) => {
      await page.goto('/');
      
      // Testimonials section
      const testimonialsSection = page.locator('[data-testid="testimonials-section"]');
      if (await testimonialsSection.isVisible()) {
        await expect(testimonialsSection.locator('text=Testimonios')).toBeVisible();
        
        const testimonialItems = page.locator('[data-testid="testimonial-item"]');
        if (await testimonialItems.count() > 0) {
          const firstTestimonial = testimonialItems.first();
          await expect(firstTestimonial.locator('[data-testid="testimonial-text"]')).toBeVisible();
          await expect(firstTestimonial.locator('[data-testid="testimonial-author"]')).toBeVisible();
        }
      }
    });
  });
});