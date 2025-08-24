import { defineConfig, devices } from '@playwright/test';

/**
 * Fixia Marketplace E2E Testing Configuration
 * 
 * This configuration sets up comprehensive end-to-end testing for the Fixia marketplace
 * covering user registration, authentication, marketplace features, and cross-platform compatibility.
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Maximum time one test can run for
  timeout: 60_000,
  
  // Maximum time expect() should wait for the condition to be met
  expect: {
    timeout: 10_000,
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:5173',
    
    // Global test timeout
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshots on failure
    screenshot: 'only-on-failure',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Emulate timezone
    timezoneId: 'America/Argentina/Buenos_Aires',
    locale: 'es-AR',
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet devices
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  // Web server configuration (start dev server before tests)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});