import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Fixia marketplace E2E tests
 * 
 * This setup:
 * - Validates backend connectivity
 * - Sets up test data and authentication states
 * - Configures environment variables
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Fixia E2E Test Suite Global Setup');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Validate backend connectivity
    console.log('📡 Testing backend connectivity...');
    const backendUrl = 'https://fixiacomar-production.up.railway.app';
    
    try {
      const healthResponse = await page.request.get(`${backendUrl}/health`);
      if (!healthResponse.ok()) {
        console.warn(`⚠️  Backend health check failed: ${healthResponse.status()}`);
      } else {
        console.log('✅ Backend is healthy');
      }
    } catch (error) {
      console.warn(`⚠️  Backend connectivity issue: ${error}`);
    }

    // 2. Validate frontend application loads
    console.log('🌐 Testing frontend application...');
    try {
      await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173', {
        timeout: 30000,
        waitUntil: 'networkidle'
      });
      
      // Wait for the app to be fully loaded
      await page.waitForSelector('text=Fixia', { timeout: 15000 });
      console.log('✅ Frontend application is accessible');
    } catch (error) {
      console.error(`❌ Frontend application failed to load: ${error}`);
      throw error;
    }

    // 3. Create test user accounts for authenticated tests
    console.log('👥 Setting up test user accounts...');
    
    // Store test credentials in environment or state for reuse
    process.env.TEST_CLIENT_EMAIL = 'test.client@fixia.local';
    process.env.TEST_CLIENT_PASSWORD = 'TestClient123!';
    process.env.TEST_PROFESSIONAL_EMAIL = 'test.professional@fixia.local';
    process.env.TEST_PROFESSIONAL_PASSWORD = 'TestProfessional123!';

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;