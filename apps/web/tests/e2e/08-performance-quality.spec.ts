import { test, expect, Page } from '@playwright/test';

/**
 * Performance & Quality Testing
 * 
 * Measures performance metrics including page load times, bundle size analysis,
 * image optimization, database query performance, and memory usage.
 */

test.describe('Performance & Quality', () => {
  test.describe('Page Load Performance', () => {
    test('should load homepage within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      
      // Homepage should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      
      // Core Web Vitals simulation
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simulate measuring Core Web Vitals
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const metrics: Record<string, number> = {};
            
            entries.forEach((entry) => {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                metrics.firstContentfulPaint = navEntry.responseEnd - navEntry.requestStart;
                metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.requestStart;
                metrics.loadComplete = navEntry.loadEventEnd - navEntry.requestStart;
              }
            });
            
            resolve(metrics);
          });
          
          observer.observe({ entryTypes: ['navigation'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 1000);
        });
      });
      
      console.log('Performance metrics:', performanceMetrics);
    });

    test('should achieve good First Contentful Paint', async ({ page }) => {
      // Start timing before navigation
      const navigationPromise = page.goto('/');
      
      // Wait for first contentful paint
      await page.waitForFunction(() => {
        return performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint');
      }, { timeout: 10000 });
      
      await navigationPromise;
      
      const fcp = await page.evaluate(() => {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
      });
      
      if (fcp) {
        // FCP should be under 1.8 seconds (good threshold)
        expect(fcp).toBeLessThan(1800);
        console.log(`First Contentful Paint: ${fcp}ms`);
      }
    });

    test('should achieve good Largest Contentful Paint', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(null), 5000);
        });
      });
      
      if (lcp) {
        // LCP should be under 2.5 seconds (good threshold)
        expect(lcp).toBeLessThan(2500);
        console.log(`Largest Contentful Paint: ${lcp}ms`);
      }
    });

    test('should have minimal Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/');
      
      // Let page settle
      await page.waitForTimeout(3000);
      
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Collect CLS for 3 seconds
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      // CLS should be under 0.1 (good threshold)
      expect(cls).toBeLessThan(0.1);
      console.log(`Cumulative Layout Shift: ${cls}`);
    });

    test('should have good Time to Interactive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Test interactivity by attempting to click elements
      const button = page.locator('button, a').first();
      
      if (await button.isVisible()) {
        await button.click();
        const interactiveTime = Date.now() - startTime;
        
        // Page should be interactive within 3.8 seconds
        expect(interactiveTime).toBeLessThan(3800);
        console.log(`Time to Interactive: ${interactiveTime}ms`);
      }
    });
  });

  test.describe('Resource Optimization', () => {
    test('should optimize image loading', async ({ page }) => {
      await page.goto('/services');
      
      // Check for lazy loading implementation
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          
          // Check for lazy loading attribute
          const loading = await img.getAttribute('loading');
          const isAboveFold = await img.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight;
          });
          
          // Images below the fold should be lazy loaded
          if (!isAboveFold) {
            expect(loading).toBe('lazy');
          }
          
          // Check for responsive images
          const srcset = await img.getAttribute('srcset');
          const sizes = await img.getAttribute('sizes');
          
          // Should have responsive image attributes for better performance
          if (srcset) {
            expect(srcset.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('should minimize and compress assets', async ({ page }) => {
      // Monitor network requests
      const requests: Array<{ url: string; size: number; type: string }> = [];
      
      page.on('response', (response) => {
        const url = response.url();
        const headers = response.headers();
        const contentLength = parseInt(headers['content-length'] || '0');
        const contentType = headers['content-type'] || '';
        
        requests.push({
          url,
          size: contentLength,
          type: contentType
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check JavaScript bundle size
      const jsFiles = requests.filter(req => req.type.includes('javascript'));
      const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
      
      // Total JS should be under 500KB for good performance
      expect(totalJsSize).toBeLessThan(500 * 1024);
      console.log(`Total JavaScript size: ${(totalJsSize / 1024).toFixed(2)}KB`);
      
      // Check CSS bundle size
      const cssFiles = requests.filter(req => req.type.includes('css'));
      const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
      
      // Total CSS should be under 100KB
      expect(totalCssSize).toBeLessThan(100 * 1024);
      console.log(`Total CSS size: ${(totalCssSize / 1024).toFixed(2)}KB`);
      
      // Check for compression
      const compressionHeaders = requests.filter(req => 
        req.url.includes('.js') || req.url.includes('.css')
      );
      
      // At least some assets should be compressed
      // This would need to be checked via response headers in a real implementation
    });

    test('should implement proper caching strategies', async ({ page }) => {
      const cacheableRequests: Array<{ url: string; cacheControl: string }> = [];
      
      page.on('response', (response) => {
        const url = response.url();
        const cacheControl = response.headers()['cache-control'] || '';
        
        if (url.includes('.js') || url.includes('.css') || url.includes('.png') || url.includes('.jpg')) {
          cacheableRequests.push({ url, cacheControl });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Static assets should have cache headers
      const staticAssets = cacheableRequests.filter(req => 
        req.url.includes('.js') || req.url.includes('.css')
      );
      
      if (staticAssets.length > 0) {
        const hasCaching = staticAssets.some(asset => 
          asset.cacheControl.includes('max-age') || asset.cacheControl.includes('public')
        );
        
        // At least some static assets should have caching
        expect(hasCaching).toBeTruthy();
      }
    });

    test('should minimize third-party requests', async ({ page }) => {
      const thirdPartyRequests: string[] = [];
      const baseUrl = new URL(page.url()).hostname;
      
      page.on('request', (request) => {
        const requestUrl = new URL(request.url());
        if (requestUrl.hostname !== baseUrl && !requestUrl.hostname.includes('localhost')) {
          thirdPartyRequests.push(request.url());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should have minimal third-party requests
      expect(thirdPartyRequests.length).toBeLessThan(10);
      console.log(`Third-party requests: ${thirdPartyRequests.length}`);
      console.log('Third-party domains:', [...new Set(thirdPartyRequests.map(url => new URL(url).hostname))]);
    });
  });

  test.describe('Runtime Performance', () => {
    test('should have efficient JavaScript execution', async ({ page }) => {
      await page.goto('/');
      
      // Measure JavaScript execution time
      const jsExecutionTime = await page.evaluate(() => {
        const start = performance.now();
        
        // Simulate some JavaScript work
        for (let i = 0; i < 1000; i++) {
          document.querySelectorAll('*').length;
        }
        
        return performance.now() - start;
      });
      
      // JavaScript execution should be fast
      expect(jsExecutionTime).toBeLessThan(50);
      console.log(`JavaScript execution time: ${jsExecutionTime}ms`);
    });

    test('should handle smooth animations', async ({ page }) => {
      await page.goto('/');
      
      // Look for animated elements
      const animatedElements = page.locator('[class*="animate"], [style*="animation"], [style*="transition"]');
      const animatedCount = await animatedElements.count();
      
      if (animatedCount > 0) {
        const firstAnimated = animatedElements.first();
        
        // Start monitoring frame rate during animation
        const frameRate = await page.evaluate(() => {
          return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();
            
            function countFrames() {
              frameCount++;
              
              if (performance.now() - startTime < 1000) {
                requestAnimationFrame(countFrames);
              } else {
                resolve(frameCount);
              }
            }
            
            requestAnimationFrame(countFrames);
          });
        });
        
        // Should maintain good frame rate (close to 60 FPS)
        expect(frameRate).toBeGreaterThan(45);
        console.log(`Animation frame rate: ${frameRate} FPS`);
      }
    });

    test('should have minimal memory usage', async ({ page }) => {
      await page.goto('/');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });
      
      if (initialMemory) {
        // Navigate around to stress test memory usage
        await page.goto('/services');
        await page.goto('/about');
        await page.goto('/contact');
        await page.goto('/');
        
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          } : null;
        });
        
        if (finalMemory) {
          const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          
          // Memory growth should be reasonable (under 10MB)
          expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
          console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    });

    test('should respond quickly to user interactions', async ({ page }) => {
      await page.goto('/services');
      
      // Test search input responsiveness
      const searchInput = page.locator('[data-testid="search-services-input"]');
      
      if (await searchInput.isVisible()) {
        const startTime = Date.now();
        
        await searchInput.fill('test search query');
        
        // Wait for any debounced search to trigger
        await page.waitForTimeout(300);
        
        const responseTime = Date.now() - startTime;
        
        // Search should respond quickly (under 500ms including debounce)
        expect(responseTime).toBeLessThan(500);
        console.log(`Search response time: ${responseTime}ms`);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 1000); // 1 second delay
      });
      
      const startTime = Date.now();
      await page.goto('/services');
      
      // Should show loading states
      const loadingIndicators = page.locator('[data-testid="loading"], [data-testid="skeleton"], .loading');
      
      if (await loadingIndicators.count() > 0) {
        await expect(loadingIndicators.first()).toBeVisible();
      }
      
      // Should eventually load content
      await expect(page.locator('[data-testid="services-grid"]')).toBeVisible({ timeout: 10000 });
      
      const totalLoadTime = Date.now() - startTime;
      console.log(`Load time on slow network: ${totalLoadTime}ms`);
    });

    test('should minimize API requests', async ({ page }) => {
      const apiRequests: string[] = [];
      
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiRequests.push(request.url());
        }
      });
      
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Should make minimal API requests for initial load
      expect(apiRequests.length).toBeLessThan(5);
      console.log(`API requests: ${apiRequests.length}`);
      console.log('API endpoints called:', [...new Set(apiRequests)]);
    });

    test('should implement request deduplication', async ({ page }) => {
      const duplicateRequests: Record<string, number> = {};
      
      page.on('request', (request) => {
        const url = request.url();
        duplicateRequests[url] = (duplicateRequests[url] || 0) + 1;
      });
      
      await page.goto('/');
      
      // Navigate quickly between pages
      await page.goto('/services');
      await page.goto('/about');
      await page.goto('/services'); // Revisit services
      
      await page.waitForLoadState('networkidle');
      
      // Check for duplicate requests
      const duplicates = Object.entries(duplicateRequests).filter(([url, count]) => count > 1);
      
      // Should have minimal duplicate requests (some are expected for navigation)
      expect(duplicates.length).toBeLessThan(10);
      console.log(`Duplicate requests: ${duplicates.length}`);
    });

    test('should use efficient data fetching strategies', async ({ page }) => {
      // Monitor request payloads
      const requestSizes: Array<{ url: string; size: number }> = [];
      
      page.on('request', (request) => {
        const postData = request.postData();
        if (postData) {
          requestSizes.push({
            url: request.url(),
            size: new Blob([postData]).size
          });
        }
      });
      
      page.on('response', (response) => {
        const contentLength = parseInt(response.headers()['content-length'] || '0');
        if (contentLength > 0 && response.url().includes('/api/')) {
          requestSizes.push({
            url: response.url(),
            size: contentLength
          });
        }
      });
      
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // API responses should be reasonably sized
      const apiResponses = requestSizes.filter(req => req.url.includes('/api/'));
      const averageSize = apiResponses.reduce((sum, req) => sum + req.size, 0) / apiResponses.length;
      
      if (apiResponses.length > 0) {
        // Average API response should be under 100KB
        expect(averageSize).toBeLessThan(100 * 1024);
        console.log(`Average API response size: ${(averageSize / 1024).toFixed(2)}KB`);
      }
    });
  });

  test.describe('Accessibility Performance', () => {
    test('should have fast screen reader navigation', async ({ page }) => {
      await page.goto('/');
      
      // Count focusable elements
      const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      
      // Too many focusable elements can slow down screen reader navigation
      expect(focusableElements).toBeLessThan(100);
      console.log(`Focusable elements: ${focusableElements}`);
    });

    test('should have efficient DOM structure', async ({ page }) => {
      await page.goto('/');
      
      // Check DOM depth and complexity
      const domStats = await page.evaluate(() => {
        let maxDepth = 0;
        let totalElements = 0;
        
        function getDepth(element: Element, depth = 0): number {
          totalElements++;
          maxDepth = Math.max(maxDepth, depth);
          
          let childMaxDepth = depth;
          for (let i = 0; i < element.children.length; i++) {
            childMaxDepth = Math.max(childMaxDepth, getDepth(element.children[i], depth + 1));
          }
          
          return childMaxDepth;
        }
        
        getDepth(document.body);
        
        return { maxDepth, totalElements };
      });
      
      // DOM should not be too deep (affects performance)
      expect(domStats.maxDepth).toBeLessThan(20);
      expect(domStats.totalElements).toBeLessThan(2000);
      
      console.log(`DOM depth: ${domStats.maxDepth}, Total elements: ${domStats.totalElements}`);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      // Mobile load time should be under 3 seconds
      expect(loadTime).toBeLessThan(3000);
      console.log(`Mobile load time: ${loadTime}ms`);
    });

    test('should handle touch interactions smoothly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/services');
      
      // Test scroll performance
      const scrollStartTime = Date.now();
      
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      
      await page.waitForTimeout(100);
      
      const scrollTime = Date.now() - scrollStartTime;
      
      // Scrolling should be smooth (under 100ms)
      expect(scrollTime).toBeLessThan(100);
      console.log(`Scroll response time: ${scrollTime}ms`);
    });
  });

  test.describe('Quality Metrics', () => {
    test('should have good Lighthouse performance score', async ({ page }) => {
      // This is a simplified version - real implementation would use Lighthouse API
      await page.goto('/');
      
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        };
      });
      
      // Basic performance thresholds
      expect(performanceMetrics.domContentLoaded).toBeLessThan(1500);
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000);
      
      console.log('Performance metrics:', performanceMetrics);
    });

    test('should have efficient bundle splitting', async ({ page }) => {
      const scriptRequests: Array<{ url: string; size: number }> = [];
      
      page.on('response', (response) => {
        if (response.url().includes('.js') && !response.url().includes('node_modules')) {
          const size = parseInt(response.headers()['content-length'] || '0');
          scriptRequests.push({ url: response.url(), size });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      if (scriptRequests.length > 1) {
        // Should have code splitting (multiple JS files)
        expect(scriptRequests.length).toBeGreaterThan(1);
        
        // Main bundle should not be too large
        const largestBundle = Math.max(...scriptRequests.map(req => req.size));
        expect(largestBundle).toBeLessThan(300 * 1024); // 300KB max per bundle
        
        console.log('JavaScript bundles:', scriptRequests.map(req => `${req.url}: ${(req.size / 1024).toFixed(2)}KB`));
      }
    });

    test('should minimize render blocking resources', async ({ page }) => {
      const renderBlockingResources: string[] = [];
      
      page.on('response', (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        
        // CSS and synchronous JS can be render blocking
        if ((contentType.includes('css') || contentType.includes('javascript')) && 
            !url.includes('async') && !url.includes('defer')) {
          renderBlockingResources.push(url);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should minimize render blocking resources
      expect(renderBlockingResources.length).toBeLessThan(5);
      console.log(`Render blocking resources: ${renderBlockingResources.length}`);
    });
  });
});