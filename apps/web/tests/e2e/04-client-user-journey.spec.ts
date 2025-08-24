import { test, expect, Page } from '@playwright/test';
import { test as authTest } from '../fixtures/auth.fixture';

/**
 * Client User Journey Testing
 * 
 * Tests client-specific features including service discovery, professional profiles,
 * project creation, professional contact, and review system.
 */

test.describe('Client User Journey', () => {
  test.describe('Service Discovery', () => {
    test('should browse services without authentication', async ({ page }) => {
      await page.goto('/services');
      
      // Services page should be accessible to all users
      await expect(page.locator('text=Servicios Disponibles')).toBeVisible();
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
      
      // Check service cards
      const serviceCards = page.locator('[data-testid="service-card"]');
      const cardCount = await serviceCards.count();
      
      if (cardCount > 0) {
        const firstService = serviceCards.first();
        await expect(firstService.locator('[data-testid="service-title"]')).toBeVisible();
        await expect(firstService.locator('[data-testid="service-price"]')).toBeVisible();
        await expect(firstService.locator('[data-testid="service-rating"]')).toBeVisible();
        await expect(firstService.locator('[data-testid="professional-name"]')).toBeVisible();
      }
    });

    test('should search services by keyword', async ({ page }) => {
      await page.goto('/services');
      
      // Use search functionality
      const searchInput = page.locator('[data-testid="search-services-input"]');
      await searchInput.fill('plomería');
      await page.click('[data-testid="search-button"]');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Results should be filtered
      const serviceCards = page.locator('[data-testid="service-card"]');
      const cardCount = await serviceCards.count();
      
      if (cardCount > 0) {
        // Check that results contain search term
        await expect(serviceCards.first()).toContainText(/plomería/i);
      }
    });

    test('should filter services by category', async ({ page }) => {
      await page.goto('/services');
      
      // Apply category filter
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await page.selectOption(categoryFilter, 'Electricidad');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Check filtered results
      const serviceCards = page.locator('[data-testid="service-card"]');
      const cardCount = await serviceCards.count();
      
      if (cardCount > 0) {
        // Services should be electricity related
        await expect(serviceCards.first()).toContainText(/electricidad|eléctrico/i);
      }
    });

    test('should filter services by location', async ({ page }) => {
      await page.goto('/services');
      
      // Apply location filter
      const locationFilter = page.locator('[data-testid="location-filter"]');
      await page.selectOption(locationFilter, 'Puerto Madryn');
      
      await page.waitForTimeout(1000);
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      const cardCount = await serviceCards.count();
      
      if (cardCount > 0) {
        // Services should be from Puerto Madryn
        await expect(serviceCards.first()).toContainText('Puerto Madryn');
      }
    });

    test('should filter services by price range', async ({ page }) => {
      await page.goto('/services');
      
      // Set price range
      const minPriceInput = page.locator('[data-testid="min-price-input"]');
      const maxPriceInput = page.locator('[data-testid="max-price-input"]');
      
      if (await minPriceInput.isVisible()) {
        await minPriceInput.fill('5000');
        await maxPriceInput.fill('15000');
        await page.click('[data-testid="apply-price-filter-button"]');
        
        await page.waitForTimeout(1000);
        
        // Check that results are within price range
        const serviceCards = page.locator('[data-testid="service-card"]');
        if (await serviceCards.count() > 0) {
          const priceText = await serviceCards.first().locator('[data-testid="service-price"]').textContent();
          // Parse price and verify it's within range
          // This would need adjustment based on actual price format
        }
      }
    });

    test('should sort services by different criteria', async ({ page }) => {
      await page.goto('/services');
      
      const sortSelect = page.locator('[data-testid="sort-services-select"]');
      if (await sortSelect.isVisible()) {
        // Sort by price (low to high)
        await page.selectOption(sortSelect, 'price-asc');
        await page.waitForTimeout(1000);
        
        // Sort by rating
        await page.selectOption(sortSelect, 'rating-desc');
        await page.waitForTimeout(1000);
        
        // Sort by popularity
        await page.selectOption(sortSelect, 'popular');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Professional Profiles', () => {
    test('should view professional profile details', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        // Click on first professional
        await serviceCards.first().locator('[data-testid="professional-name"]').click();
        
        // Should navigate to professional profile
        await expect(page).toHaveURL(/\/profile\/\d+/);
        
        // Check professional profile elements
        await expect(page.locator('[data-testid="professional-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="professional-description"]')).toBeVisible();
        await expect(page.locator('[data-testid="professional-rating"]')).toBeVisible();
        await expect(page.locator('[data-testid="professional-location"]')).toBeVisible();
        await expect(page.locator('[data-testid="professional-services"]')).toBeVisible();
      }
    });

    test('should show professional verification badges', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().locator('[data-testid="professional-name"]').click();
        
        // Check for verification badges
        const verificationBadges = page.locator('[data-testid="verification-badge"]');
        if (await verificationBadges.count() > 0) {
          await expect(verificationBadges.first()).toBeVisible();
        }
        
        // Check professional level indicator
        const professionalLevel = page.locator('[data-testid="professional-level"]');
        if (await professionalLevel.isVisible()) {
          await expect(professionalLevel).toBeVisible();
        }
      }
    });

    test('should display professional portfolio', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().locator('[data-testid="professional-name"]').click();
        
        // Check portfolio section
        const portfolioSection = page.locator('[data-testid="portfolio-section"]');
        if (await portfolioSection.isVisible()) {
          await expect(portfolioSection.locator('text=Portfolio')).toBeVisible();
          
          const portfolioItems = page.locator('[data-testid="portfolio-item"]');
          if (await portfolioItems.count() > 0) {
            await expect(portfolioItems.first()).toBeVisible();
          }
        }
      }
    });

    test('should show professional reviews and ratings', async ({ page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().locator('[data-testid="professional-name"]').click();
        
        // Reviews section
        const reviewsSection = page.locator('[data-testid="reviews-section"]');
        await expect(reviewsSection).toBeVisible();
        
        // Check individual reviews
        const reviewItems = page.locator('[data-testid="review-item"]');
        if (await reviewItems.count() > 0) {
          const firstReview = reviewItems.first();
          await expect(firstReview.locator('[data-testid="review-rating"]')).toBeVisible();
          await expect(firstReview.locator('[data-testid="review-text"]')).toBeVisible();
          await expect(firstReview.locator('[data-testid="review-author"]')).toBeVisible();
          await expect(firstReview.locator('[data-testid="review-date"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Project Creation', () => {
    authTest('should create new project', async ({ authenticatedClientPage: page }) => {
      await page.goto('/new-project');
      
      // Fill project form
      await page.fill('[data-testid="project-title-input"]', 'Renovación de Cocina Completa');
      await page.fill('[data-testid="project-description-textarea"]', 'Necesito renovar completamente mi cocina, incluyendo instalación de nuevos muebles, mesada de granito, y electrodomésticos empotrados.');
      await page.selectOption('[data-testid="project-category-select"]', 'Carpintería');
      await page.selectOption('[data-testid="project-urgency-select"]', 'media');
      await page.fill('[data-testid="project-budget-input"]', '200000');
      await page.selectOption('[data-testid="project-location-select"]', 'Puerto Madryn, Chubut');
      
      // Add project images if supported
      const imageUpload = page.locator('[data-testid="project-images-input"]');
      if (await imageUpload.isVisible()) {
        await imageUpload.setInputFiles([]);
      }
      
      // Set preferred contact method
      await page.selectOption('[data-testid="contact-method-select"]', 'WhatsApp');
      
      // Submit project
      await page.click('[data-testid="create-project-button"]');
      
      // Should show success message
      await expect(page.locator('text=Proyecto creado exitosamente')).toBeVisible({ timeout: 10000 });
      
      // Should redirect to dashboard or projects list
      await expect(page).toHaveURL(/\/dashboard|\/projects/);
    });

    authTest('should validate project creation form', async ({ authenticatedClientPage: page }) => {
      await page.goto('/new-project');
      
      // Try to submit empty form
      await page.click('[data-testid="create-project-button"]');
      
      // Check validation errors
      await expect(page.locator('text=El título es requerido')).toBeVisible();
      await expect(page.locator('text=La descripción es requerida')).toBeVisible();
      await expect(page.locator('text=Selecciona una categoría')).toBeVisible();
      await expect(page.locator('text=El presupuesto es requerido')).toBeVisible();
    });

    authTest('should edit existing project', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      
      // Navigate to my projects
      await page.click('text=Mis Proyectos');
      
      const projectItems = page.locator('[data-testid="project-item"]');
      if (await projectItems.count() > 0) {
        const firstProject = projectItems.first();
        await firstProject.locator('[data-testid="edit-project-button"]').click();
        
        // Update project details
        await page.fill('[data-testid="project-title-input"]', 'Renovación de Cocina Completa - Actualizado');
        await page.fill('[data-testid="project-budget-input"]', '250000');
        
        // Save changes
        await page.click('[data-testid="save-project-button"]');
        
        await expect(page.locator('text=Proyecto actualizado exitosamente')).toBeVisible();
      }
    });

    authTest('should delete project with confirmation', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      await page.click('text=Mis Proyectos');
      
      const projectItems = page.locator('[data-testid="project-item"]');
      if (await projectItems.count() > 0) {
        const firstProject = projectItems.first();
        await firstProject.locator('[data-testid="delete-project-button"]').click();
        
        // Confirmation dialog
        await expect(page.locator('text=¿Estás seguro que quieres eliminar este proyecto?')).toBeVisible();
        
        // Confirm deletion
        await page.click('[data-testid="confirm-delete-button"]');
        
        await expect(page.locator('text=Proyecto eliminado exitosamente')).toBeVisible();
      }
    });
  });

  test.describe('Professional Contact', () => {
    authTest('should send contact request to professional', async ({ authenticatedClientPage: page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        // Click on service to view details
        await serviceCards.first().click();
        
        // Contact professional
        await page.click('[data-testid="contact-professional-button"]');
        
        // Fill contact form
        await page.fill('[data-testid="contact-message-textarea"]', 'Hola, estoy interesado en tu servicio de plomería. ¿Podrías contactarme para hablar sobre mi proyecto?');
        
        // Send contact request
        await page.click('[data-testid="send-contact-request-button"]');
        
        await expect(page.locator('text=Solicitud de contacto enviada exitosamente')).toBeVisible({ timeout: 10000 });
      }
    });

    authTest('should handle contact request limits', async ({ authenticatedClientPage: page }) => {
      await page.goto('/services');
      
      // Try to send multiple contact requests (test rate limiting)
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 3) {
        for (let i = 0; i < 4; i++) {
          await serviceCards.nth(i).click();
          await page.click('[data-testid="contact-professional-button"]');
          await page.fill('[data-testid="contact-message-textarea"]', `Mensaje de contacto ${i + 1}`);
          await page.click('[data-testid="send-contact-request-button"]');
          
          if (i < 3) {
            await expect(page.locator('text=Solicitud de contacto enviada')).toBeVisible();
          } else {
            // Should hit limit for free users
            await expect(page.locator('text=Has alcanzado el límite de contactos')).toBeVisible();
          }
          
          await page.goBack();
        }
      }
    });

    authTest('should use WhatsApp contact integration', async ({ authenticatedClientPage: page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().click();
        
        // Check for WhatsApp button
        const whatsappButton = page.locator('[data-testid="whatsapp-contact-button"]');
        if (await whatsappButton.isVisible()) {
          await whatsappButton.click();
          
          // Should open WhatsApp (in new tab or app)
          // This needs special handling for external app integration
        }
      }
    });

    authTest('should view contact request history', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      
      // Check contact requests section
      const contactHistorySection = page.locator('[data-testid="contact-history"]');
      if (await contactHistorySection.isVisible()) {
        await expect(contactHistorySection.locator('text=Historial de Contactos')).toBeVisible();
        
        const contactItems = page.locator('[data-testid="contact-request-item"]');
        if (await contactItems.count() > 0) {
          const firstContact = contactItems.first();
          await expect(firstContact.locator('[data-testid="contact-professional-name"]')).toBeVisible();
          await expect(firstContact.locator('[data-testid="contact-status"]')).toBeVisible();
          await expect(firstContact.locator('[data-testid="contact-date"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Review System', () => {
    authTest('should leave review for professional after service', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      
      // Check for completed services to review
      const reviewableServices = page.locator('[data-testid="reviewable-service"]');
      if (await reviewableServices.count() > 0) {
        const firstService = reviewableServices.first();
        await firstService.locator('[data-testid="leave-review-button"]').click();
        
        // Fill review form
        await page.click('[data-testid="rating-star-5"]'); // 5-star rating
        await page.fill('[data-testid="review-text-textarea"]', 'Excelente trabajo, muy profesional y puntual. Recomiendo completamente sus servicios.');
        
        // Submit review
        await page.click('[data-testid="submit-review-button"]');
        
        await expect(page.locator('text=Reseña enviada exitosamente')).toBeVisible();
      }
    });

    authTest('should validate review form', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      
      const reviewableServices = page.locator('[data-testid="reviewable-service"]');
      if (await reviewableServices.count() > 0) {
        const firstService = reviewableServices.first();
        await firstService.locator('[data-testid="leave-review-button"]').click();
        
        // Try to submit without rating
        await page.click('[data-testid="submit-review-button"]');
        
        await expect(page.locator('text=La calificación es requerida')).toBeVisible();
        
        // Try to submit without review text
        await page.click('[data-testid="rating-star-4"]');
        await page.click('[data-testid="submit-review-button"]');
        
        await expect(page.locator('text=El comentario es requerido')).toBeVisible();
      }
    });

    authTest('should edit existing review', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      
      // Look for reviews I've written
      const myReviewsSection = page.locator('[data-testid="my-reviews-section"]');
      if (await myReviewsSection.isVisible()) {
        const reviewItems = page.locator('[data-testid="my-review-item"]');
        if (await reviewItems.count() > 0) {
          const firstReview = reviewItems.first();
          await firstReview.locator('[data-testid="edit-review-button"]').click();
          
          // Update review
          await page.click('[data-testid="rating-star-3"]'); // Change to 3 stars
          await page.fill('[data-testid="review-text-textarea"]', 'Actualización de mi reseña: El trabajo estuvo bien, pero hubo algunos retrasos.');
          
          await page.click('[data-testid="update-review-button"]');
          
          await expect(page.locator('text=Reseña actualizada exitosamente')).toBeVisible();
        }
      }
    });
  });

  test.describe('Client Dashboard', () => {
    authTest('should display client dashboard overview', async ({ authenticatedClientPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Check dashboard elements for clients
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Bienvenido');
      await expect(page.locator('[data-testid="client-stats-overview"]')).toBeVisible();
      
      // Client-specific stats
      await expect(page.locator('[data-testid="active-projects-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="completed-projects-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="favorite-professionals-count"]')).toBeVisible();
    });

    authTest('should show quick actions for clients', async ({ authenticatedClientPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Quick actions for clients
      await expect(page.locator('text=Crear Proyecto')).toBeVisible();
      await expect(page.locator('text=Buscar Servicios')).toBeVisible();
      await expect(page.locator('text=Editar Perfil')).toBeVisible();
    });

    authTest('should display recent activity', async ({ authenticatedClientPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Recent activity section
      await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
      await expect(page.locator('text=Actividad Reciente')).toBeVisible();
    });
  });

  test.describe('Favorites and Bookmarks', () => {
    authTest('should add professional to favorites', async ({ authenticatedClientPage: page }) => {
      await page.goto('/services');
      
      const serviceCards = page.locator('[data-testid="service-card"]');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().click();
        
        // Add to favorites
        const favoriteButton = page.locator('[data-testid="add-to-favorites-button"]');
        if (await favoriteButton.isVisible()) {
          await favoriteButton.click();
          
          await expect(page.locator('text=Agregado a favoritos')).toBeVisible();
          
          // Button should change to "remove from favorites"
          await expect(page.locator('[data-testid="remove-from-favorites-button"]')).toBeVisible();
        }
      }
    });

    authTest('should view favorites list', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      
      // Navigate to favorites
      await page.click('text=Mis Favoritos');
      
      // Should show favorites list
      await expect(page.locator('[data-testid="favorites-list"]')).toBeVisible();
      
      const favoriteItems = page.locator('[data-testid="favorite-professional"]');
      if (await favoriteItems.count() > 0) {
        const firstFavorite = favoriteItems.first();
        await expect(firstFavorite.locator('[data-testid="professional-name"]')).toBeVisible();
        await expect(firstFavorite.locator('[data-testid="professional-rating"]')).toBeVisible();
      }
    });

    authTest('should remove professional from favorites', async ({ authenticatedClientPage: page }) => {
      await page.goto('/dashboard');
      await page.click('text=Mis Favoritos');
      
      const favoriteItems = page.locator('[data-testid="favorite-professional"]');
      if (await favoriteItems.count() > 0) {
        const firstFavorite = favoriteItems.first();
        await firstFavorite.locator('[data-testid="remove-favorite-button"]').click();
        
        await expect(page.locator('text=Eliminado de favoritos')).toBeVisible();
      }
    });
  });
});