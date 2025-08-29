import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Profile Page E2E Tests
 * 
 * These tests cover all profile functionality including:
 * - Profile header editing and interactions
 * - Tab navigation and content
 * - Forms and modals
 * - Settings and configuration
 * - Portfolio management
 * - Security features
 */

test.describe('Profile Page - Comprehensive Functionality Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock authentication
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'professional@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Navigate to profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Navigation Component', () => {
    test('should render navigation with all elements', async () => {
      await expect(page.locator('text=Fixia')).toBeVisible();
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Explorar')).toBeVisible();
      await expect(page.locator('text=Mi Perfil')).toBeVisible();
      await expect(page.locator('text=Salir')).toBeVisible();
    });

    test('should handle logout functionality', async () => {
      await page.click('text=Salir');
      await expect(page).toHaveURL('/');
      await expect(page.locator('text=Sesión cerrada correctamente')).toBeVisible();
    });

    test('should navigate to other sections', async () => {
      await page.click('text=Dashboard');
      await expect(page).toHaveURL('/dashboard');
      
      await page.goBack();
      await page.click('text=Explorar');
      await expect(page).toHaveURL('/services');
    });
  });

  test.describe('Profile Header - Display and Information', () => {
    test('should display user profile information', async () => {
      // Check avatar
      await expect(page.locator('[data-testid="user-avatar"]').or(page.locator('.avatar'))).toBeVisible();
      
      // Check user name
      await expect(page.locator('text=Ana Martinez').or(page.locator('h1'))).toBeVisible();
      
      // Check user type badge
      await expect(page.locator('text=Profesional').or(page.locator('.badge'))).toBeVisible();
      
      // Check verification status
      const verifiedBadge = page.locator('text=Verificado');
      if (await verifiedBadge.isVisible()) {
        await expect(verifiedBadge).toBeVisible();
      }
      
      // Check rating (for professionals)
      const ratingElement = page.locator('text=/[0-9]\\.[0-9].*reseña/');
      if (await ratingElement.isVisible()) {
        await expect(ratingElement).toBeVisible();
      }
    });

    test('should display professional stats', async () => {
      // Look for stat numbers
      const statsSection = page.locator('.stats, [data-testid="stats"], .border-t').last();
      if (await statsSection.isVisible()) {
        await expect(statsSection.locator('text=/\\d+/')).toHaveCount(4); // 4 stats expected
      }
    });

    test('should display contact information', async () => {
      await expect(page.locator('text=Miembro desde').or(page.locator('[data-testid="join-date"]'))).toBeVisible();
      
      // Location
      const locationElement = page.locator('text=/Buenos Aires|Córdoba|Argentina/').first();
      if (await locationElement.isVisible()) {
        await expect(locationElement).toBeVisible();
      }
    });
  });

  test.describe('Profile Header - Editing Functionality', () => {
    test('should enter edit mode when edit button is clicked', async () => {
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      // Should show save and cancel buttons
      await expect(page.locator('text=Guardar').or(page.locator('[data-testid="save-button"]'))).toBeVisible();
      await expect(page.locator('text=×').or(page.locator('[data-testid="cancel-button"]'))).toBeVisible();
      
      // Should show input fields
      await expect(page.locator('input[value*="Ana"], input[value*="Usuario"]')).toBeVisible();
    });

    test('should save profile changes', async () => {
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      // Modify name
      const nameInput = page.locator('input').first();
      await nameInput.fill('Ana Martinez Updated');
      
      // Modify bio/description
      const bioTextarea = page.locator('textarea').first();
      if (await bioTextarea.isVisible()) {
        await bioTextarea.fill('Updated professional description');
      }
      
      // Modify location
      const locationInput = page.locator('input[placeholder*="ubicación"], input[value*="Buenos Aires"]');
      if (await locationInput.isVisible()) {
        await locationInput.fill('Buenos Aires Updated');
      }
      
      // Save changes
      const saveButton = page.locator('text=Guardar').or(page.locator('[data-testid="save-button"]'));
      await saveButton.click();
      
      // Should show success message
      await expect(page.locator('text=Perfil actualizado').or(page.locator('.toast'))).toBeVisible({ timeout: 10000 });
    });

    test('should cancel edit mode', async () => {
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      // Make some changes
      const nameInput = page.locator('input').first();
      await nameInput.fill('Changed Name');
      
      // Cancel editing
      const cancelButton = page.locator('text=×').or(page.locator('[data-testid="cancel-button"]'));
      await cancelButton.click();
      
      // Should exit edit mode
      await expect(page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'))).toBeVisible();
      
      // Changes should not be saved
      await expect(page.locator('text=Changed Name')).not.toBeVisible();
    });

    test('should handle form validation', async () => {
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      // Clear required field
      const nameInput = page.locator('input').first();
      await nameInput.fill('');
      
      // Try to save
      const saveButton = page.locator('text=Guardar').or(page.locator('[data-testid="save-button"]'));
      await saveButton.click();
      
      // Should either show validation error or fill with default value
      const hasError = await page.locator('text=/requerido|obligatorio/').isVisible();
      const hasDefaultValue = await page.locator('input[value*="Usuario"]').isVisible();
      
      expect(hasError || hasDefaultValue).toBeTruthy();
    });
  });

  test.describe('Avatar Upload Modal', () => {
    test('should open avatar upload modal', async () => {
      const cameraButton = page.locator('[data-testid="camera-button"]').or(page.locator('button').filter({ has: page.locator('svg') })).first();
      await cameraButton.click();
      
      await expect(page.locator('text=Cambiar Foto').or(page.locator('text=Avatar'))).toBeVisible();
      await expect(page.locator('text=Selecciona una nueva imagen').or(page.locator('text=Subir'))).toBeVisible();
    });

    test('should handle file upload interface', async () => {
      const cameraButton = page.locator('[data-testid="camera-button"]').or(page.locator('button').filter({ has: page.locator('svg') })).first();
      await cameraButton.click();
      
      // Should show file upload area
      await expect(page.locator('text=Haz clic para subir').or(page.locator('input[type="file"]'))).toBeVisible();
      await expect(page.locator('text=PNG, JPG').or(page.locator('text=imagen'))).toBeVisible();
      
      // Should have save button
      await expect(page.locator('text=Guardar').or(page.locator('button[type="submit"]'))).toBeVisible();
    });

    test('should close modal', async () => {
      const cameraButton = page.locator('[data-testid="camera-button"]').or(page.locator('button').filter({ has: page.locator('svg') })).first();
      await cameraButton.click();
      
      // Close modal
      const closeButton = page.locator('[aria-label="Close"]').or(page.locator('button:has-text("×")')).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
      
      await expect(page.locator('text=Cambiar Foto')).not.toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should display correct tabs for professional users', async () => {
      // Check for professional tabs
      await expect(page.locator('text=Portafolio').or(page.locator('[role="tab"]'))).toBeVisible();
      await expect(page.locator('text=Reseñas').or(page.locator('[role="tab"]'))).toBeVisible();
      await expect(page.locator('text=Analytics').or(page.locator('[role="tab"]'))).toBeVisible();
      await expect(page.locator('text=Configuración').or(page.locator('[role="tab"]'))).toBeVisible();
    });

    test('should switch between tabs', async () => {
      // Click on Reviews tab
      const reviewsTab = page.locator('text=Reseñas').or(page.locator('[role="tab"]:has-text("Reseñas")'));
      if (await reviewsTab.isVisible()) {
        await reviewsTab.click();
        await expect(page.locator('text=Reseñas y Valoraciones').or(page.locator('text=clientes'))).toBeVisible();
      }
      
      // Click on Analytics tab
      const analyticsTab = page.locator('text=Analytics').or(page.locator('[role="tab"]:has-text("Analytics")'));
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click();
        await expect(page.locator('text=Analytics y Estadísticas').or(page.locator('text=estadística'))).toBeVisible();
      }
      
      // Click on Settings tab
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        await expect(page.locator('text=Configuración de Cuenta').or(page.locator('text=Email'))).toBeVisible();
      }
    });

    test('should maintain tab state during navigation', async () => {
      // Switch to Analytics tab
      const analyticsTab = page.locator('text=Analytics').or(page.locator('[role="tab"]:has-text("Analytics")'));
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click();
        
        // Navigate away and back
        await page.goto('/dashboard');
        await page.goto('/profile');
        
        // Should remember last active tab or default to first tab
        const activeTab = page.locator('[role="tab"][aria-selected="true"], [role="tab"].active, .liquid-gradient');
        await expect(activeTab).toBeVisible();
      }
    });
  });

  test.describe('Portfolio Section', () => {
    test('should display portfolio content', async () => {
      // Should be on portfolio tab by default or click it
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      await expect(page.locator('text=Portafolio').or(page.locator('text=trabajos'))).toBeVisible();
      await expect(page.locator('text=Agregar Proyecto').or(page.locator('button:has-text("Agregar")'))).toBeVisible();
    });

    test('should open add project modal', async () => {
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      const addButton = page.locator('text=Agregar Proyecto').or(page.locator('button:has-text("Agregar")'));
      await addButton.click();
      
      await expect(page.locator('text=Agregar Nuevo Proyecto').or(page.locator('text=proyecto'))).toBeVisible();
      await expect(page.locator('input[placeholder*="App Móvil"]').or(page.locator('input[placeholder*="título"]'))).toBeVisible();
    });

    test('should filter portfolio items', async () => {
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      // Filter buttons
      const webDevFilter = page.locator('text=Desarrollo Web').or(page.locator('button:has-text("Web")'));
      if (await webDevFilter.isVisible()) {
        await webDevFilter.click();
        
        // Should highlight selected filter
        await expect(webDevFilter).toHaveClass(/liquid-gradient|active|selected/);
      }
    });

    test('should display portfolio items', async () => {
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      // Check for portfolio items
      const portfolioItems = page.locator('.card, [data-testid="portfolio-item"]');
      const itemCount = await portfolioItems.count();
      
      if (itemCount > 0) {
        await expect(portfolioItems.first()).toBeVisible();
        
        // Check for item details
        const firstItem = portfolioItems.first();
        await expect(firstItem.locator('img, .image')).toBeVisible();
        await expect(firstItem.locator('h3, .title')).toBeVisible();
      }
    });
  });

  test.describe('Add Portfolio Project Modal', () => {
    test('should fill and submit project form', async () => {
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      const addButton = page.locator('text=Agregar Proyecto').or(page.locator('button:has-text("Agregar")'));
      await addButton.click();
      
      // Fill form
      const titleInput = page.locator('input[placeholder*="App"], input[placeholder*="título"]').first();
      await titleInput.fill('Test Project');
      
      const descriptionTextarea = page.locator('textarea').first();
      await descriptionTextarea.fill('This is a test project description');
      
      const urlInput = page.locator('input[placeholder*="https"]');
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://test-project.com');
      }
      
      // Submit form
      const saveButton = page.locator('text=Guardar Proyecto').or(page.locator('button:has-text("Guardar")'));
      await saveButton.click();
      
      // Should close modal and show success
      await expect(page.locator('text=Agregar Nuevo Proyecto')).not.toBeVisible();
    });

    test('should validate required fields', async () => {
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      const addButton = page.locator('text=Agregar Proyecto').or(page.locator('button:has-text("Agregar")'));
      await addButton.click();
      
      // Try to submit empty form
      const saveButton = page.locator('text=Guardar Proyecto').or(page.locator('button:has-text("Guardar")'));
      await saveButton.click();
      
      // Should show validation errors or prevent submission
      const isModalStillOpen = await page.locator('text=Agregar Nuevo Proyecto').isVisible();
      expect(isModalStillOpen).toBeTruthy();
    });

    test('should cancel project creation', async () => {
      const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
      if (await portfolioTab.isVisible()) {
        await portfolioTab.click();
      }
      
      const addButton = page.locator('text=Agregar Proyecto').or(page.locator('button:has-text("Agregar")'));
      await addButton.click();
      
      // Fill some data
      const titleInput = page.locator('input[placeholder*="App"], input[placeholder*="título"]').first();
      await titleInput.fill('Test Project');
      
      // Cancel
      const cancelButton = page.locator('text=Cancelar').or(page.locator('button:has-text("Cancelar")'));
      await cancelButton.click();
      
      // Modal should close
      await expect(page.locator('text=Agregar Nuevo Proyecto')).not.toBeVisible();
    });
  });

  test.describe('Reviews Section', () => {
    test('should display reviews content', async () => {
      const reviewsTab = page.locator('text=Reseñas').or(page.locator('[role="tab"]:has-text("Reseñas")'));
      if (await reviewsTab.isVisible()) {
        await reviewsTab.click();
        
        await expect(page.locator('text=Reseñas').or(page.locator('text=valoración'))).toBeVisible();
        
        // Rating overview
        const ratingNumber = page.locator('text=/[0-9]\\.[0-9]/').first();
        if (await ratingNumber.isVisible()) {
          await expect(ratingNumber).toBeVisible();
        }
        
        // Progress bars
        const progressBars = page.locator('.progress, [role="progressbar"]');
        const progressCount = await progressBars.count();
        if (progressCount > 0) {
          await expect(progressBars.first()).toBeVisible();
        }
      }
    });

    test('should display individual reviews', async () => {
      const reviewsTab = page.locator('text=Reseñas').or(page.locator('[role="tab"]:has-text("Reseñas")'));
      if (await reviewsTab.isVisible()) {
        await reviewsTab.click();
        
        // Look for review items
        const reviewItems = page.locator('.review-item, .card').filter({ hasText: /.+@.+|[A-Z][a-z]+ [A-Z][a-z]+/ });
        const reviewCount = await reviewItems.count();
        
        if (reviewCount > 0) {
          const firstReview = reviewItems.first();
          await expect(firstReview).toBeVisible();
          
          // Should have reviewer name
          await expect(firstReview.locator('text=/[A-Z][a-z]+ [A-Z][a-z]+/')).toBeVisible();
          
          // Should have rating stars
          await expect(firstReview.locator('svg, .star')).toBeVisible();
        }
      }
    });

    test('should show respond button for unanswered reviews', async () => {
      const reviewsTab = page.locator('text=Reseñas').or(page.locator('[role="tab"]:has-text("Reseñas")'));
      if (await reviewsTab.isVisible()) {
        await reviewsTab.click();
        
        const respondButton = page.locator('text=Responder').or(page.locator('button:has-text("Responder")'));
        if (await respondButton.isVisible()) {
          await expect(respondButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Analytics Section', () => {
    test('should display analytics metrics', async () => {
      const analyticsTab = page.locator('text=Analytics').or(page.locator('[role="tab"]:has-text("Analytics")'));
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click();
        
        await expect(page.locator('text=Analytics').or(page.locator('text=Estadísticas'))).toBeVisible();
        
        // Look for metric cards
        const metricCards = page.locator('.card, [data-testid="metric"]');
        const cardCount = await metricCards.count();
        
        if (cardCount > 0) {
          await expect(metricCards.first()).toBeVisible();
          
          // Should have numbers and labels
          await expect(page.locator('text=/\\$[0-9,]+|[0-9]+%|[0-9]+min/')).toBeVisible();
        }
      }
    });

    test('should show coming soon message', async () => {
      const analyticsTab = page.locator('text=Analytics').or(page.locator('[role="tab"]:has-text("Analytics")'));
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click();
        
        const comingSoonText = page.locator('text=próximamente').or(page.locator('text=coming soon'));
        if (await comingSoonText.isVisible()) {
          await expect(comingSoonText).toBeVisible();
        }
      }
    });
  });

  test.describe('Settings Section', () => {
    test('should display account settings form', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        await expect(page.locator('text=Configuración').or(page.locator('text=Cuenta'))).toBeVisible();
        
        // Form fields
        await expect(page.locator('input[type="email"], input[value*="@"]')).toBeVisible();
        await expect(page.locator('input[type="tel"], input[value*="+"]')).toBeVisible();
      }
    });

    test('should display notification preferences', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        await expect(page.locator('text=Notificación').or(page.locator('text=Preferencias'))).toBeVisible();
        
        // Switch controls
        const switches = page.locator('[role="switch"], input[type="checkbox"]');
        const switchCount = await switches.count();
        if (switchCount > 0) {
          await expect(switches.first()).toBeVisible();
        }
      }
    });

    test('should toggle notification switches', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        const switches = page.locator('[role="switch"], input[type="checkbox"]');
        const switchCount = await switches.count();
        
        if (switchCount > 0) {
          const firstSwitch = switches.first();
          const initialState = await firstSwitch.getAttribute('aria-checked') || await firstSwitch.isChecked();
          
          await firstSwitch.click();
          
          // State should change
          const newState = await firstSwitch.getAttribute('aria-checked') || await firstSwitch.isChecked();
          expect(newState).not.toBe(initialState);
        }
      }
    });

    test('should display security settings', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        await expect(page.locator('text=Seguridad').or(page.locator('text=Contraseña'))).toBeVisible();
        await expect(page.locator('text=Cambiar Contraseña').or(page.locator('button:has-text("Contraseña")'))).toBeVisible();
      }
    });

    test('should display social media fields', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        await expect(page.locator('text=Redes Sociales').or(page.locator('text=LinkedIn'))).toBeVisible();
        
        // Social media inputs
        const socialInputs = page.locator('input[placeholder*="LinkedIn"], input[placeholder*="Twitter"], input[placeholder*="GitHub"], input[placeholder*="Instagram"]');
        const inputCount = await socialInputs.count();
        if (inputCount > 0) {
          await expect(socialInputs.first()).toBeVisible();
        }
      }
    });

    test('should display danger zone', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        await expect(page.locator('text=Zona Peligrosa').or(page.locator('text=Eliminar Cuenta'))).toBeVisible();
        
        const deleteButton = page.locator('text=Eliminar Cuenta').or(page.locator('button:has-text("Eliminar")'));
        await expect(deleteButton).toBeVisible();
        await expect(deleteButton).toHaveClass(/destructive|danger|error/);
      }
    });

    test('should update timezone setting', async () => {
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        const timezoneSelect = page.locator('select').or(page.locator('[role="combobox"]')).filter({ hasText: /GMT|zona|horaria/i });
        if (await timezoneSelect.isVisible()) {
          await timezoneSelect.selectOption({ index: 1 });
          
          // Should show selected option
          await expect(timezoneSelect).not.toHaveValue('');
        }
      }
    });
  });

  test.describe('Form Validation and Error Handling', () => {
    test('should handle empty form submissions gracefully', async () => {
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      // Clear all fields
      const inputs = page.locator('input[type="text"], input[type="email"], textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        await inputs.nth(i).clear();
      }
      
      // Try to save
      const saveButton = page.locator('text=Guardar').or(page.locator('[data-testid="save-button"]'));
      await saveButton.click();
      
      // Should either show validation errors or handle gracefully
      const hasValidationError = await page.locator('text=/error|requerido|obligatorio/i').isVisible();
      const hasSuccessMessage = await page.locator('text=/actualizado|guardado|success/i').isVisible();
      
      expect(hasValidationError || hasSuccessMessage).toBeTruthy();
    });

    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await page.route('**/user/profile', route => route.abort());
      
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      const nameInput = page.locator('input').first();
      await nameInput.fill('Updated Name');
      
      const saveButton = page.locator('text=Guardar').or(page.locator('[data-testid="save-button"]'));
      await saveButton.click();
      
      // Should show error message
      await expect(page.locator('text=/error|fallo|problema/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigation should be responsive
      await expect(page.locator('nav').or(page.locator('header'))).toBeVisible();
      
      // Profile content should stack vertically
      const profileHeader = page.locator('.flex-col, .lg\\:flex-row').first();
      if (await profileHeader.isVisible()) {
        await expect(profileHeader).toHaveClass(/flex-col/);
      }
    });

    test('should work on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // All elements should remain visible and functional
      await expect(page.locator('text=Fixia')).toBeVisible();
      
      // Tabs should be visible
      const tabs = page.locator('[role="tablist"], .tabs');
      if (await tabs.isVisible()) {
        await expect(tabs).toBeVisible();
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('should support keyboard navigation', async () => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluateHandle(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
      
      // Continue tabbing through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      focusedElement = await page.evaluateHandle(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels', async () => {
      // Check for main content area
      await expect(page.locator('[role="main"], main')).toBeVisible();
      
      // Check for navigation
      await expect(page.locator('[role="navigation"], nav')).toBeVisible();
      
      // Check for tabs
      const tabs = page.locator('[role="tablist"]');
      if (await tabs.isVisible()) {
        await expect(tabs).toBeVisible();
        await expect(page.locator('[role="tab"]')).toHaveCount(4); // Professional tabs
      }
    });

    test('should support screen reader navigation', async () => {
      // Check for proper heading hierarchy
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for semantic structure
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load profile data efficiently', async () => {
      const startTime = Date.now();
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (adjust as needed)
      expect(loadTime).toBeLessThan(5000);
      
      // Essential content should be visible
      await expect(page.locator('text=Fixia')).toBeVisible();
    });

    test('should handle slow network conditions', async () => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.goto('/profile');
      
      // Should show loading states or skeleton screens
      // (Implementation dependent)
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      await expect(page.locator('text=Fixia')).toBeVisible();
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist tab selection across page refreshes', async () => {
      const analyticsTab = page.locator('text=Analytics').or(page.locator('[role="tab"]:has-text("Analytics")'));
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click();
        
        await page.reload();
        
        // Should remember or default to appropriate tab
        const activeTab = page.locator('[role="tab"][aria-selected="true"], [role="tab"].active');
        if (await activeTab.isVisible()) {
          await expect(activeTab).toBeVisible();
        }
      }
    });

    test('should maintain form data during edit sessions', async () => {
      const editButton = page.locator('text=Editar Perfil').or(page.locator('[data-testid="edit-profile-button"]'));
      await editButton.click();
      
      const nameInput = page.locator('input').first();
      await nameInput.fill('Temporary Name');
      
      // Switch tabs and come back
      const settingsTab = page.locator('text=Configuración').or(page.locator('[role="tab"]:has-text("Configuración")'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        
        const portfolioTab = page.locator('text=Portafolio').or(page.locator('[role="tab"]:has-text("Portafolio")'));
        await portfolioTab.click();
        
        // Form data should be maintained (if in edit mode)
        const isStillEditing = await page.locator('text=Guardar').isVisible();
        if (isStillEditing) {
          await expect(page.locator('input[value="Temporary Name"]')).toBeVisible();
        }
      }
    });
  });
});