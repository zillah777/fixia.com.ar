import { test as base, Page, BrowserContext } from '@playwright/test';

/**
 * Authentication fixtures for Fixia marketplace testing
 * 
 * This provides reusable authentication states for:
 * - Client users
 * - Professional users
 * - Unauthenticated users
 */

export interface AuthFixtures {
  authenticatedClientPage: Page;
  authenticatedProfessionalPage: Page;
  unauthenticatedPage: Page;
}

export const test = base.extend<AuthFixtures>({
  // Authenticated client user page
  authenticatedClientPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as client
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', process.env.TEST_CLIENT_EMAIL || 'test.client@fixia.local');
    await page.fill('[data-testid="password-input"]', process.env.TEST_CLIENT_PASSWORD || 'TestClient123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    await use(page);
    
    await context.close();
  },

  // Authenticated professional user page
  authenticatedProfessionalPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as professional
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', process.env.TEST_PROFESSIONAL_EMAIL || 'test.professional@fixia.local');
    await page.fill('[data-testid="password-input"]', process.env.TEST_PROFESSIONAL_PASSWORD || 'TestProfessional123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    await use(page);
    
    await context.close();
  },

  // Unauthenticated page
  unauthenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/');
    
    await use(page);
    
    await context.close();
  },
});

export { expect } from '@playwright/test';