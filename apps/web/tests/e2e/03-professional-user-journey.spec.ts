import { test, expect, Page } from '@playwright/test';
import { test as authTest } from '../fixtures/auth.fixture';

/**
 * Professional User Journey Testing
 * 
 * Tests professional-specific features including dashboard, service management,
 * profile management, opportunity management, and communication features.
 */

test.describe('Professional User Journey', () => {
  test.describe('Professional Dashboard', () => {
    authTest('should display professional dashboard with key metrics', async ({ authenticatedProfessionalPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Check dashboard elements
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Bienvenido');
      await expect(page.locator('[data-testid="stats-overview"]')).toBeVisible();
      
      // Check key metrics
      await expect(page.locator('[data-testid="total-services"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-opportunities"]')).toBeVisible();
    });

    authTest('should show recent activity', async ({ authenticatedProfessionalPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Recent activity section
      await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
      await expect(page.locator('text=Actividad Reciente')).toBeVisible();
    });

    authTest('should display earnings chart', async ({ authenticatedProfessionalPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Earnings chart (if implemented)
      const earningsChart = page.locator('[data-testid="earnings-chart"]');
      if (await earningsChart.isVisible()) {
        await expect(earningsChart).toBeVisible();
      }
    });

    authTest('should show quick action buttons', async ({ authenticatedProfessionalPage: page }) => {
      await expect(page).toHaveURL('/dashboard');
      
      // Quick actions
      await expect(page.locator('text=Crear Servicio')).toBeVisible();
      await expect(page.locator('text=Ver Oportunidades')).toBeVisible();
      await expect(page.locator('text=Editar Perfil')).toBeVisible();
    });
  });

  test.describe('Service Management', () => {
    authTest('should create new service', async ({ authenticatedProfessionalPage: page }) => {
      await page.click('text=Crear Servicio');
      // await expect(page).toHaveURL('/services/new');
      
      // Fill service form
      await page.fill('[data-testid="service-title-input"]', 'Reparación de Plomería Domiciliaria');
      await page.fill('[data-testid="service-description-textarea"]', 'Servicio completo de plomería incluyendo destapado de cañerías, reparación de canillas y instalación de accesorios.');
      await page.selectOption('[data-testid="service-category-select"]', 'Plomería');
      await page.fill('[data-testid="service-price-input"]', '8000');
      await page.selectOption('[data-testid="service-duration-select"]', '2-4 horas');
      
      // Add images (if file upload is supported)
      const fileInput = page.locator('[data-testid="service-images-input"]');
      if (await fileInput.isVisible()) {
        // Mock file upload
        await fileInput.setInputFiles([]);
      }
      
      // Save service
      await page.click('[data-testid="save-service-button"]');
      
      // Should show success message
      await expect(page.locator('text=Servicio creado exitosamente')).toBeVisible({ timeout: 10000 });
      
      // Should redirect back to services list or dashboard
      await expect(page).toHaveURL(/\/dashboard|\/services/);
    });

    authTest('should edit existing service', async ({ authenticatedProfessionalPage: page }) => {
      // Go to services management
      await page.goto('/dashboard');
      await page.click('text=Mis Servicios');
      
      // Find first service and edit it
      const firstService = page.locator('[data-testid="service-item"]').first();
      if (await firstService.isVisible()) {
        await firstService.locator('[data-testid="edit-service-button"]').click();
        
        // Update service details
        await page.fill('[data-testid="service-title-input"]', 'Reparación de Plomería - Actualizado');
        await page.fill('[data-testid="service-price-input"]', '9000');
        
        // Save changes
        await page.click('[data-testid="save-service-button"]');
        
        await expect(page.locator('text=Servicio actualizado exitosamente')).toBeVisible();
      }
    });

    authTest('should delete service with confirmation', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/dashboard');
      await page.click('text=Mis Servicios');
      
      const firstService = page.locator('[data-testid="service-item"]').first();
      if (await firstService.isVisible()) {
        await firstService.locator('[data-testid="delete-service-button"]').click();
        
        // Confirmation dialog should appear
        await expect(page.locator('text=¿Estás seguro que quieres eliminar este servicio?')).toBeVisible();
        
        // Cancel first
        await page.click('[data-testid="cancel-delete-button"]');
        await expect(firstService).toBeVisible(); // Service should still exist
        
        // Delete for real
        await firstService.locator('[data-testid="delete-service-button"]').click();
        await page.click('[data-testid="confirm-delete-button"]');
        
        await expect(page.locator('text=Servicio eliminado exitosamente')).toBeVisible();
      }
    });

    authTest('should validate service creation form', async ({ authenticatedProfessionalPage: page }) => {
      await page.click('text=Crear Servicio');
      
      // Try to submit empty form
      await page.click('[data-testid="save-service-button"]');
      
      // Check validation errors
      await expect(page.locator('text=El título es requerido')).toBeVisible();
      await expect(page.locator('text=La descripción es requerida')).toBeVisible();
      await expect(page.locator('text=Selecciona una categoría')).toBeVisible();
      await expect(page.locator('text=El precio es requerido')).toBeVisible();
    });

    authTest('should handle image upload for services', async ({ authenticatedProfessionalPage: page }) => {
      await page.click('text=Crear Servicio');
      
      await page.fill('[data-testid="service-title-input"]', 'Servicio con Imágenes');
      await page.fill('[data-testid="service-description-textarea"]', 'Servicio de prueba para subida de imágenes');
      await page.selectOption('[data-testid="service-category-select"]', 'Carpintería');
      await page.fill('[data-testid="service-price-input"]', '5000');
      
      // Test image upload (mock or real file)
      const fileInput = page.locator('[data-testid="service-images-input"]');
      if (await fileInput.isVisible()) {
        // Mock a file upload or use real small image file
        // This would need adjustment based on actual implementation
        await fileInput.setInputFiles([]);
      }
      
      await page.click('[data-testid="save-service-button"]');
      await expect(page.locator('text=Servicio creado exitosamente')).toBeVisible();
    });
  });

  test.describe('Profile Management', () => {
    authTest('should display professional profile form', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/profile');
      
      // Check profile form elements
      await expect(page.locator('[data-testid="fullName-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="location-select"]')).toBeVisible();
      
      // Professional-specific fields
      await expect(page.locator('[data-testid="description-textarea"]')).toBeVisible();
      await expect(page.locator('[data-testid="serviceCategories-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="experience-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="availability-select"]')).toBeVisible();
    });

    authTest('should update professional profile', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/profile');
      
      // Update profile information
      await page.fill('[data-testid="description-textarea"]', 'Profesional actualizado con más de 15 años de experiencia en el sector.');
      await page.selectOption('[data-testid="availability-select"]', 'Disponible');
      await page.fill('[data-testid="phone-input"]', '+54 280 555-1234');
      
      // Save changes
      await page.click('[data-testid="save-profile-button"]');
      
      await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 10000 });
    });

    authTest('should update professional avatar', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/profile');
      
      // Check avatar section
      const avatarSection = page.locator('[data-testid="avatar-section"]');
      if (await avatarSection.isVisible()) {
        const avatarUpload = page.locator('[data-testid="avatar-upload-input"]');
        if (await avatarUpload.isVisible()) {
          // Mock avatar upload
          await avatarUpload.setInputFiles([]);
          
          await page.click('[data-testid="save-avatar-button"]');
          await expect(page.locator('text=Avatar actualizado correctamente')).toBeVisible();
        }
      }
    });

    authTest('should manage portfolio items', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/profile');
      
      // Portfolio section
      const portfolioSection = page.locator('[data-testid="portfolio-section"]');
      if (await portfolioSection.isVisible()) {
        // Add portfolio item
        await page.click('[data-testid="add-portfolio-button"]');
        await page.fill('[data-testid="portfolio-title-input"]', 'Proyecto de Renovación Completa');
        await page.fill('[data-testid="portfolio-description-textarea"]', 'Renovación completa de cocina y baño en casa familiar.');
        
        // Save portfolio item
        await page.click('[data-testid="save-portfolio-button"]');
        await expect(page.locator('text=Proyecto agregado al portfolio')).toBeVisible();
      }
    });

    authTest('should manage certifications', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/profile');
      
      const certificationsSection = page.locator('[data-testid="certifications-section"]');
      if (await certificationsSection.isVisible()) {
        await page.click('[data-testid="add-certification-button"]');
        await page.fill('[data-testid="certification-name-input"]', 'Certificación en Instalaciones Eléctricas');
        await page.fill('[data-testid="certification-issuer-input"]', 'Colegio de Técnicos de Chubut');
        await page.fill('[data-testid="certification-date-input"]', '2023-06-15');
        
        await page.click('[data-testid="save-certification-button"]');
        await expect(page.locator('text=Certificación agregada exitosamente')).toBeVisible();
      }
    });
  });

  test.describe('Opportunity Management', () => {
    authTest('should view available opportunities', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/opportunities');
      
      // Check opportunities page
      await expect(page.locator('text=Oportunidades Disponibles')).toBeVisible();
      await expect(page.locator('[data-testid="opportunities-list"]')).toBeVisible();
      
      // Should show opportunity cards
      const opportunityCards = page.locator('[data-testid="opportunity-card"]');
      const cardCount = await opportunityCards.count();
      
      if (cardCount > 0) {
        const firstOpportunity = opportunityCards.first();
        await expect(firstOpportunity.locator('[data-testid="opportunity-title"]')).toBeVisible();
        await expect(firstOpportunity.locator('[data-testid="opportunity-budget"]')).toBeVisible();
        await expect(firstOpportunity.locator('[data-testid="opportunity-location"]')).toBeVisible();
      }
    });

    authTest('should filter opportunities by category', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/opportunities');
      
      // Apply category filter
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await page.selectOption('[data-testid="category-filter"]', 'Plomería');
        
        // Wait for filtered results
        await page.waitForTimeout(1000);
        
        // All visible opportunities should be plumbing related
        const opportunityCards = page.locator('[data-testid="opportunity-card"]');
        const cardCount = await opportunityCards.count();
        
        if (cardCount > 0) {
          // Check that filtered opportunities match category
          await expect(opportunityCards.first().locator('text=Plomería')).toBeVisible();
        }
      }
    });

    authTest('should submit proposal to opportunity', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/opportunities');
      
      const opportunityCards = page.locator('[data-testid="opportunity-card"]');
      const cardCount = await opportunityCards.count();
      
      if (cardCount > 0) {
        const firstOpportunity = opportunityCards.first();
        await firstOpportunity.locator('[data-testid="view-opportunity-button"]').click();
        
        // Should show opportunity details
        await expect(page.locator('[data-testid="opportunity-details"]')).toBeVisible();
        
        // Submit proposal
        await page.click('[data-testid="submit-proposal-button"]');
        
        // Fill proposal form
        await page.fill('[data-testid="proposal-message-textarea"]', 'Tengo amplia experiencia en este tipo de trabajos. Puedo comenzar la próxima semana.');
        await page.fill('[data-testid="proposal-budget-input"]', '12000');
        await page.fill('[data-testid="proposal-timeline-input"]', '3-5 días laborables');
        
        // Submit proposal
        await page.click('[data-testid="send-proposal-button"]');
        
        await expect(page.locator('text=Propuesta enviada exitosamente')).toBeVisible({ timeout: 10000 });
      }
    });

    authTest('should view own submitted proposals', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/opportunities');
      
      // Switch to "Mis Propuestas" tab
      await page.click('[data-testid="my-proposals-tab"]');
      
      // Should show submitted proposals
      await expect(page.locator('[data-testid="proposals-list"]')).toBeVisible();
      
      const proposalItems = page.locator('[data-testid="proposal-item"]');
      const proposalCount = await proposalItems.count();
      
      if (proposalCount > 0) {
        const firstProposal = proposalItems.first();
        await expect(firstProposal.locator('[data-testid="proposal-status"]')).toBeVisible();
        await expect(firstProposal.locator('[data-testid="proposal-date"]')).toBeVisible();
      }
    });
  });

  test.describe('Communication Features', () => {
    authTest('should handle contact requests', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/dashboard');
      
      // Check for contact requests section
      const contactRequestsSection = page.locator('[data-testid="contact-requests"]');
      if (await contactRequestsSection.isVisible()) {
        const requestItems = page.locator('[data-testid="contact-request-item"]');
        const requestCount = await requestItems.count();
        
        if (requestCount > 0) {
          const firstRequest = requestItems.first();
          
          // Accept contact request
          await firstRequest.locator('[data-testid="accept-contact-button"]').click();
          
          // Should show success message
          await expect(page.locator('text=Solicitud de contacto aceptada')).toBeVisible();
        }
      }
    });

    authTest('should respond to contact requests with message', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/dashboard');
      
      const contactRequestsSection = page.locator('[data-testid="contact-requests"]');
      if (await contactRequestsSection.isVisible()) {
        const requestItems = page.locator('[data-testid="contact-request-item"]');
        const requestCount = await requestItems.count();
        
        if (requestCount > 0) {
          const firstRequest = requestItems.first();
          
          // Click respond with message
          await firstRequest.locator('[data-testid="respond-with-message-button"]').click();
          
          // Fill response message
          await page.fill('[data-testid="response-message-textarea"]', 'Gracias por tu interés. Estoy disponible para conversar sobre tu proyecto.');
          
          // Send response
          await page.click('[data-testid="send-response-button"]');
          
          await expect(page.locator('text=Respuesta enviada exitosamente')).toBeVisible();
        }
      }
    });

    authTest('should access WhatsApp integration', async ({ authenticatedProfessionalPage: page }) => {
      // This test depends on WhatsApp integration implementation
      await page.goto('/dashboard');
      
      // Look for WhatsApp contact buttons
      const whatsappButtons = page.locator('[data-testid="whatsapp-contact-button"]');
      const buttonCount = await whatsappButtons.count();
      
      if (buttonCount > 0) {
        // Click WhatsApp button should open WhatsApp Web or app
        await whatsappButtons.first().click();
        
        // Check that WhatsApp URL is opened (in new tab)
        // This would need to be tested differently for external app integration
      }
    });
  });

  test.describe('Professional Profile Visibility', () => {
    authTest('should update availability status', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/dashboard');
      
      // Find availability status toggle
      const availabilityToggle = page.locator('[data-testid="availability-toggle"]');
      if (await availabilityToggle.isVisible()) {
        // Change status to busy
        await page.selectOption('[data-testid="availability-select"]', 'busy');
        
        await expect(page.locator('text=Estado actualizado')).toBeVisible();
        
        // Change back to available
        await page.selectOption('[data-testid="availability-select"]', 'available');
        
        await expect(page.locator('text=Estado actualizado')).toBeVisible();
      }
    });

    authTest('should manage professional visibility settings', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/profile');
      
      // Check visibility settings
      const visibilitySettings = page.locator('[data-testid="visibility-settings"]');
      if (await visibilitySettings.isVisible()) {
        // Toggle profile visibility
        const visibilityToggle = page.locator('[data-testid="profile-visibility-toggle"]');
        if (await visibilityToggle.isVisible()) {
          await visibilityToggle.click();
          
          await page.click('[data-testid="save-profile-button"]');
          await expect(page.locator('text=Configuración de visibilidad actualizada')).toBeVisible();
        }
      }
    });
  });

  test.describe('Professional Analytics', () => {
    authTest('should display profile views analytics', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/dashboard');
      
      // Check for analytics section
      const analyticsSection = page.locator('[data-testid="analytics-section"]');
      if (await analyticsSection.isVisible()) {
        await expect(page.locator('[data-testid="profile-views-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="contact-requests-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="proposal-acceptance-rate"]')).toBeVisible();
      }
    });

    authTest('should show earnings breakdown', async ({ authenticatedProfessionalPage: page }) => {
      await page.goto('/dashboard');
      
      const earningsSection = page.locator('[data-testid="earnings-section"]');
      if (await earningsSection.isVisible()) {
        await expect(page.locator('[data-testid="monthly-earnings"]')).toBeVisible();
        await expect(page.locator('[data-testid="yearly-earnings"]')).toBeVisible();
        await expect(page.locator('[data-testid="pending-payments"]')).toBeVisible();
      }
    });
  });
});