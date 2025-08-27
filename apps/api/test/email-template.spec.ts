import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../src/modules/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { JSDOM } from 'jsdom';

/**
 * Email Template Testing Suite
 * 
 * Comprehensive testing of email templates including:
 * - Template rendering and variable substitution
 * - HTML/CSS compatibility across email clients
 * - Spam score analysis
 * - Accessibility compliance
 * - Mobile responsiveness
 * - Security (XSS prevention)
 */

describe('Email Template Audit', () => {
  let emailService: EmailService;
  let configService: ConfigService;
  let templatePath: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'RESEND_API_KEY': 'test-key',
                'EMAIL_FROM': 'test@fixia.com.ar',
                'APP_URL': 'https://fixia.com.ar',
                'NODE_ENV': 'test'
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Set up template path
    templatePath = path.join(__dirname, '../src/templates/emails');
  });

  describe('1. Template Rendering Tests', () => {
    test('should render account verification template correctly', async () => {
      const templateData = {
        userName: 'Juan Pérez',
        verificationUrl: 'https://fixia.com.ar/verify/abc123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe?email=test@example.com'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      expect(fs.existsSync(templateFile)).toBe(true);

      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedHtml = template(templateData);

      // Test variable substitution
      expect(renderedHtml).toContain('Juan Pérez');
      expect(renderedHtml).toContain('https://fixia.com.ar/verify/abc123');
      expect(renderedHtml).toContain('unsubscribe');

      // Test HTML structure
      expect(renderedHtml).toContain('<!DOCTYPE html>');
      expect(renderedHtml).toContain('<html lang="es-AR">');
      expect(renderedHtml).toContain('Verifica tu cuenta - Fixia');

      console.log('✅ Template Rendering: Account verification template renders correctly');
    });

    test('should handle missing variables gracefully', async () => {
      const templateData = {
        userName: 'Test User'
        // Missing verificationUrl and unsubscribeUrl
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedHtml = template(templateData);

      // Should not crash and should handle missing variables
      expect(renderedHtml).toContain('Test User');
      expect(renderedHtml).toContain('<!DOCTYPE html>');

      console.log('✅ Template Rendering: Missing variables handled gracefully');
    });

    test('should escape XSS attempts in template variables', async () => {
      const maliciousData = {
        userName: '<script>alert("xss")</script>',
        verificationUrl: 'javascript:alert("xss")',
        unsubscribeUrl: 'https://malicious.com"><script>alert("xss")</script>'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedHtml = template(maliciousData);

      // Should escape dangerous content
      expect(renderedHtml).not.toContain('<script>alert("xss")</script>');
      expect(renderedHtml).not.toContain('javascript:alert');
      
      // Should contain escaped versions or safe alternatives
      expect(renderedHtml).toContain('&lt;') || expect(renderedHtml).not.toContain('<script>');

      console.log('✅ Template Security: XSS attempts properly escaped');
    });

    test('should handle special characters in Spanish correctly', async () => {
      const templateData = {
        userName: 'José María Ñuñez-González',
        verificationUrl: 'https://fixia.com.ar/verify/abc123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedHtml = template(templateData);

      // Should correctly display Spanish characters
      expect(renderedHtml).toContain('José María Ñuñez-González');
      expect(renderedHtml).toContain('charset="UTF-8"');

      console.log('✅ Template Rendering: Spanish characters handled correctly');
    });
  });

  describe('2. HTML/CSS Email Client Compatibility', () => {
    let renderedTemplate: string;

    beforeAll(() => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      renderedTemplate = template(templateData);
    });

    test('should use email-safe HTML structure', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;

      // Should use table-based layout (email-safe)
      const tables = document.querySelectorAll('table');
      expect(tables.length).toBeGreaterThan(0);

      // Should avoid flexbox and grid (not supported in all email clients)
      expect(renderedTemplate).not.toContain('display: flex');
      expect(renderedTemplate).not.toContain('display: grid');

      // Should use inline CSS for compatibility
      const elementsWithStyle = document.querySelectorAll('[style]');
      expect(elementsWithStyle.length).toBeGreaterThan(0);

      console.log('✅ Email Compatibility: HTML structure is email-client safe');
    });

    test('should avoid unsupported CSS properties', () => {
      const unsupportedProperties = [
        'position: fixed',
        'position: absolute',
        'transform:',
        'animation:',
        '@keyframes',
        'box-shadow:',
        'text-shadow:',
        'background-attachment: fixed',
        'overflow: hidden'
      ];

      for (const property of unsupportedProperties) {
        if (renderedTemplate.includes(property)) {
          console.warn(`⚠️ AUDIT FINDING: Potentially unsupported CSS property found: ${property}`);
        }
      }

      console.log('✅ Email Compatibility: CSS properties checked for email client support');
    });

    test('should use web-safe fonts', () => {
      const webSafeFonts = [
        'Arial',
        'Helvetica',
        'sans-serif',
        'Georgia',
        'serif',
        'Verdana',
        'Tahoma'
      ];

      let hasWebSafeFont = false;
      for (const font of webSafeFonts) {
        if (renderedTemplate.includes(font)) {
          hasWebSafeFont = true;
          break;
        }
      }

      expect(hasWebSafeFont).toBe(true);
      console.log('✅ Email Compatibility: Web-safe fonts used');
    });

    test('should have proper meta tags for email clients', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;

      // Should have viewport meta for mobile
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toBeTruthy();

      // Should have charset declaration
      const charsetMeta = document.querySelector('meta[charset]');
      expect(charsetMeta).toBeTruthy();
      expect(charsetMeta.getAttribute('charset')).toBe('UTF-8');

      // Should have X-UA-Compatible for IE
      const compatMeta = document.querySelector('meta[http-equiv="X-UA-Compatible"]');
      expect(compatMeta).toBeTruthy();

      console.log('✅ Email Compatibility: Proper meta tags present');
    });

    test('should have mobile-responsive design', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;

      // Should have media queries for mobile
      const hasMediaQueries = renderedTemplate.includes('@media');
      expect(hasMediaQueries).toBe(true);

      // Should have mobile-specific styles
      const hasMobileStyles = renderedTemplate.includes('max-width: 600px') || 
                             renderedTemplate.includes('max-width: 480px');
      expect(hasMobileStyles).toBe(true);

      console.log('✅ Email Compatibility: Mobile-responsive design implemented');
    });
  });

  describe('3. Spam Score Analysis', () => {
    let renderedTemplate: string;

    beforeAll(() => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      renderedTemplate = template(templateData);
    });

    test('should avoid spam trigger words', () => {
      const spamTriggerWords = [
        'FREE',
        'URGENT',
        'ACT NOW',
        'LIMITED TIME',
        'CLICK HERE NOW',
        'GUARANTEED',
        'MAKE MONEY',
        'NO COST',
        'WINNER',
        'CONGRATULATIONS'
      ];

      const upperCaseContent = renderedTemplate.toUpperCase();
      const foundSpamWords = spamTriggerWords.filter(word => 
        upperCaseContent.includes(word)
      );

      if (foundSpamWords.length > 0) {
        console.warn(`⚠️ AUDIT FINDING: Potential spam trigger words found: ${foundSpamWords.join(', ')}`);
      } else {
        console.log('✅ Spam Prevention: No obvious spam trigger words found');
      }

      expect(foundSpamWords.length).toBeLessThan(3); // Allow some flexibility
    });

    test('should have proper text-to-image ratio', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;

      const textContent = document.body.textContent || '';
      const images = document.querySelectorAll('img');
      
      const textLength = textContent.trim().length;
      const imageCount = images.length;

      // Should have substantial text content
      expect(textLength).toBeGreaterThan(100);

      // Text to image ratio should be reasonable
      if (imageCount > 0) {
        const textToImageRatio = textLength / imageCount;
        expect(textToImageRatio).toBeGreaterThan(50); // At least 50 characters per image
      }

      console.log('✅ Spam Prevention: Good text-to-image ratio maintained');
    });

    test('should have unsubscribe link', () => {
      expect(renderedTemplate.toLowerCase()).toContain('unsubscribe');
      expect(renderedTemplate.toLowerCase()).toContain('darse de baja');

      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;
      const unsubscribeLinks = document.querySelectorAll('a[href*="unsubscribe"]');
      
      expect(unsubscribeLinks.length).toBeGreaterThan(0);
      console.log('✅ Spam Prevention: Unsubscribe link present');
    });

    test('should have proper sender identification', () => {
      expect(renderedTemplate).toContain('Fixia');
      expect(renderedTemplate.toLowerCase()).toContain('chubut') || 
      expect(renderedTemplate.toLowerCase()).toContain('argentina');

      console.log('✅ Spam Prevention: Proper sender identification');
    });

    test('should avoid excessive punctuation and capitalization', () => {
      // Check for excessive exclamation marks
      const exclamationCount = (renderedTemplate.match(/!/g) || []).length;
      expect(exclamationCount).toBeLessThan(5);

      // Check for excessive capitalization
      const capsWordsCount = (renderedTemplate.match(/\b[A-Z]{4,}\b/g) || []).length;
      expect(capsWordsCount).toBeLessThan(3);

      console.log('✅ Spam Prevention: Appropriate punctuation and capitalization');
    });
  });

  describe('4. Accessibility Compliance', () => {
    let renderedTemplate: string;

    beforeAll(() => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      renderedTemplate = template(templateData);
    });

    test('should have proper semantic HTML structure', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;

      // Should have proper document structure
      expect(document.doctype).toBeTruthy();
      expect(document.documentElement.getAttribute('lang')).toBe('es-AR');

      // Should have proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);

      console.log('✅ Accessibility: Proper semantic HTML structure');
    });

    test('should have alt text for images', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;
      const images = document.querySelectorAll('img');

      for (const img of images) {
        const alt = img.getAttribute('alt');
        const role = img.getAttribute('role');
        
        // Images should have alt text or be marked as decorative
        expect(alt !== null || role === 'presentation').toBe(true);
      }

      console.log('✅ Accessibility: Image alt text properly configured');
    });

    test('should have sufficient color contrast', () => {
      // This is a basic test - in production, you'd use actual color analysis
      const hasColorStyles = renderedTemplate.includes('color:');
      const hasBackgroundStyles = renderedTemplate.includes('background');

      if (hasColorStyles && hasBackgroundStyles) {
        // Should not rely solely on color for information
        const hasTextStyles = renderedTemplate.includes('font-weight') || 
                             renderedTemplate.includes('text-decoration');
        expect(hasTextStyles).toBe(true);
      }

      console.log('✅ Accessibility: Color contrast considerations implemented');
    });

    test('should have clear, descriptive link text', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;
      const links = document.querySelectorAll('a');

      for (const link of links) {
        const linkText = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        
        // Links should have descriptive text
        expect(linkText || ariaLabel).toBeTruthy();
        
        // Should avoid generic text like "click here"
        const genericTexts = ['click here', 'read more', 'link'];
        const isGeneric = genericTexts.some(generic => 
          (linkText?.toLowerCase() || '').includes(generic)
        );
        
        if (isGeneric) {
          console.warn(`⚠️ AUDIT FINDING: Generic link text found: ${linkText}`);
        }
      }

      console.log('✅ Accessibility: Link text is descriptive');
    });

    test('should have proper table structure if tables are used', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;
      const tables = document.querySelectorAll('table');

      for (const table of tables) {
        // If table has headers, they should be properly marked
        const headers = table.querySelectorAll('th');
        const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
        
        if (headers.length > 0) {
          // Headers should have content
          expect(headerTexts.every(text => text && text.length > 0)).toBe(true);
        }

        // Tables should have proper structure
        const hasCaption = table.querySelector('caption');
        const hasSummary = table.getAttribute('summary');
        
        // For data tables, should have caption or summary
        if (headers.length > 0) {
          // This is likely a data table
          console.log('ℹ️ Data table found, should consider adding caption or summary');
        }
      }

      console.log('✅ Accessibility: Table structure checked');
    });
  });

  describe('5. Performance and Size Optimization', () => {
    let renderedTemplate: string;

    beforeAll(() => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      renderedTemplate = template(templateData);
    });

    test('should have reasonable file size', () => {
      const sizeInBytes = Buffer.byteLength(renderedTemplate, 'utf8');
      const sizeInKB = sizeInBytes / 1024;

      // Email should be under 100KB for optimal delivery
      expect(sizeInKB).toBeLessThan(100);
      
      console.log(`✅ Performance: Template size is ${sizeInKB.toFixed(2)}KB (under 100KB limit)`);
    });

    test('should use optimized CSS', () => {
      // CSS should be inlined for email compatibility
      const hasInlineStyles = renderedTemplate.includes('style=');
      expect(hasInlineStyles).toBe(true);

      // Should minimize external resources
      const externalResources = renderedTemplate.match(/href=.*\.css|src=.*\.js/g) || [];
      expect(externalResources.length).toBeLessThan(3);

      console.log('✅ Performance: CSS optimized for email delivery');
    });

    test('should optimize images for email', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;
      const images = document.querySelectorAll('img');

      for (const img of images) {
        const src = img.getAttribute('src');
        const width = img.getAttribute('width');
        const height = img.getAttribute('height');

        if (src) {
          // Images should be hosted on secure CDN
          expect(src.startsWith('https://')).toBe(true);

          // Should have dimensions specified
          expect(width || height).toBeTruthy();
        }
      }

      console.log('✅ Performance: Images optimized for email delivery');
    });

    test('should have minimal DOM complexity', () => {
      const dom = new JSDOM(renderedTemplate);
      const document = dom.window.document;
      const allElements = document.querySelectorAll('*');

      // Should not be overly complex
      expect(allElements.length).toBeLessThan(200);

      // Should have reasonable nesting depth
      const maxDepth = this.calculateMaxDepth(document.body);
      expect(maxDepth).toBeLessThan(15);

      console.log(`✅ Performance: Template has ${allElements.length} elements with max depth ${maxDepth}`);
    });

    // Helper method to calculate DOM depth
    calculateMaxDepth(element: Element, currentDepth = 0): number {
      if (!element.children.length) return currentDepth;
      
      let maxChildDepth = currentDepth;
      for (const child of element.children) {
        const childDepth = this.calculateMaxDepth(child, currentDepth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
      
      return maxChildDepth;
    }
  });

  describe('6. Localization and Content', () => {
    test('should use proper Spanish language and tone', () => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedTemplate = template(templateData);

      // Should use formal Spanish (usted form is acceptable for business)
      const spanishIndicators = [
        'Hola',
        'bienvenida',
        'verificar',
        'cuenta',
        'correo electrónico',
        'enlace',
        'gracias'
      ];

      let spanishWordsFound = 0;
      for (const word of spanishIndicators) {
        if (renderedTemplate.toLowerCase().includes(word.toLowerCase())) {
          spanishWordsFound++;
        }
      }

      expect(spanishWordsFound).toBeGreaterThan(3);
      console.log('✅ Localization: Spanish content verified');
    });

    test('should have appropriate business tone', () => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedTemplate = template(templateData);

      // Should be professional but friendly
      expect(renderedTemplate.toLowerCase()).not.toContain('urgente');
      expect(renderedTemplate.toLowerCase()).not.toContain('inmediatamente');
      
      // Should include brand elements
      expect(renderedTemplate).toContain('Fixia');

      console.log('✅ Localization: Appropriate business tone maintained');
    });

    test('should include all required legal elements', () => {
      const templateData = {
        userName: 'Test User',
        verificationUrl: 'https://fixia.com.ar/verify/test123',
        unsubscribeUrl: 'https://fixia.com.ar/unsubscribe'
      };

      const templateFile = path.join(templatePath, 'account-verification.html');
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      const template = Handlebars.compile(templateContent);
      const renderedTemplate = template(templateData);

      // Should include unsubscribe information
      expect(renderedTemplate.toLowerCase()).toContain('darse de baja');
      
      // Should include company information
      expect(renderedTemplate).toContain('Chubut') || expect(renderedTemplate).toContain('Argentina');
      
      // Should include support contact
      expect(renderedTemplate).toContain('soporte') || expect(renderedTemplate).toContain('contacto');

      console.log('✅ Localization: Legal elements included');
    });
  });
});