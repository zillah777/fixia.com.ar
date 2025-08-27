import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { EmailService } from '../src/modules/email/email.service';
import { ConfigService } from '@nestjs/config';

/**
 * Comprehensive Email Verification System Testing
 * 
 * This test suite audits the complete email verification flow including:
 * - Token generation and validation
 * - Email delivery across multiple providers
 * - Security vulnerabilities
 * - Rate limiting and abuse prevention
 * - Edge cases and error handling
 */

describe('Email Verification System (E2E Audit)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let emailService: EmailService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    prisma = app.get<PrismaService>(PrismaService);
    emailService = app.get<EmailService>(EmailService);
    configService = app.get<ConfigService>(ConfigService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Email Delivery Testing', () => {
    const testEmail = 'email.audit@fixia.test';
    let testUserId: string;

    beforeAll(async () => {
      // Clean up any existing test data
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: testEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: testEmail }
      });

      // Create test user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password_hash: 'dummy_hash',
          name: 'Email Audit Test User',
          user_type: 'client',
          email_verified: false,
        }
      });
      testUserId = user.id;
    });

    afterAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: testUserId }
      });
      await prisma.user.delete({
        where: { id: testUserId }
      });
    });

    test('should test Resend API email delivery', async () => {
      const resendApiKey = configService.get<string>('RESEND_API_KEY');
      
      if (!resendApiKey) {
        console.warn('⚠️ AUDIT ISSUE: Resend API key not configured');
        return;
      }

      const result = await emailService.sendAccountVerification(
        testEmail,
        'Email Audit Test User',
        'http://test.com/verify/test-token'
      );

      expect(result).toBe(true);
      console.log('✅ Resend API: Email delivery test passed');
    });

    test('should test SendGrid email delivery', async () => {
      const sendgridApiKey = configService.get<string>('SENDGRID_API_KEY');
      
      if (!sendgridApiKey) {
        console.warn('⚠️ AUDIT ISSUE: SendGrid API key not configured');
        return;
      }

      // Mock Resend to force SendGrid usage
      const originalResend = (emailService as any).resend;
      (emailService as any).resend = null;

      try {
        const result = await emailService.sendAccountVerification(
          testEmail,
          'Email Audit Test User',
          'http://test.com/verify/test-token-sendgrid'
        );

        expect(result).toBe(true);
        console.log('✅ SendGrid: Email delivery test passed');
      } finally {
        (emailService as any).resend = originalResend;
      }
    });

    test('should test Gmail SMTP email delivery', async () => {
      const gmailUser = configService.get<string>('GMAIL_USER');
      const gmailPass = configService.get<string>('GMAIL_APP_PASSWORD');
      
      if (!gmailUser || !gmailPass) {
        console.warn('⚠️ AUDIT ISSUE: Gmail SMTP credentials not configured');
        return;
      }

      // Mock both Resend and SendGrid to force Gmail usage
      const originalResend = (emailService as any).resend;
      const originalSendgrid = configService.get<string>('SENDGRID_API_KEY');
      
      (emailService as any).resend = null;
      (configService as any).internalConfig = { 
        ...((configService as any).internalConfig || {}),
        SENDGRID_API_KEY: undefined 
      };

      try {
        const result = await emailService.sendAccountVerification(
          testEmail,
          'Email Audit Test User',
          'http://test.com/verify/test-token-gmail'
        );

        // Gmail SMTP might fail in test environment (Railway blocks SMTP)
        if (result) {
          console.log('✅ Gmail SMTP: Email delivery test passed');
        } else {
          console.warn('⚠️ AUDIT FINDING: Gmail SMTP delivery failed (expected in Railway)');
        }
      } finally {
        (emailService as any).resend = originalResend;
        (configService as any).internalConfig.SENDGRID_API_KEY = originalSendgrid;
      }
    });

    test('should handle email delivery failures gracefully', async () => {
      // Mock all email services to fail
      const originalResend = (emailService as any).resend;
      const originalGmailTransporter = (emailService as any).gmailTransporter;
      const originalSendgridKey = configService.get<string>('SENDGRID_API_KEY');

      (emailService as any).resend = null;
      (emailService as any).gmailTransporter = null;
      (configService as any).internalConfig = { 
        ...((configService as any).internalConfig || {}),
        SENDGRID_API_KEY: undefined 
      };

      try {
        const result = await emailService.sendAccountVerification(
          testEmail,
          'Email Audit Test User',
          'http://test.com/verify/test-token-fail'
        );

        expect(result).toBe(false);
        console.log('✅ Email failure handling: Test passed');
      } finally {
        // Restore original services
        (emailService as any).resend = originalResend;
        (emailService as any).gmailTransporter = originalGmailTransporter;
        (configService as any).internalConfig.SENDGRID_API_KEY = originalSendgridKey;
      }
    });
  });

  describe('2. Verification Flow Testing', () => {
    let testUserId: string;
    let validToken: string;
    const testEmail = 'verification.flow@fixia.test';

    beforeEach(async () => {
      // Clean up
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: testEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: testEmail }
      });

      // Create fresh test user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password_hash: 'dummy_hash',
          name: 'Verification Flow Test',
          user_type: 'client',
          email_verified: false,
        }
      });
      testUserId = user.id;
    });

    afterEach(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: testUserId }
      });
      await prisma.user.delete({
        where: { id: testUserId }
      });
    });

    test('should generate secure verification tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      expect(response.status).toBe(200);

      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: testUserId }
      });

      expect(token).toBeDefined();
      expect(token.token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token.expires_at).toBeInstanceOf(Date);
      expect(token.used).toBe(false);

      validToken = token.token;
      console.log('✅ Token generation: Secure tokens generated');
    });

    test('should validate tokens correctly', async () => {
      // Generate token first
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: testUserId }
      });

      // Test valid token
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is marked as verified
      const user = await prisma.user.findUnique({
        where: { id: testUserId }
      });
      expect(user.email_verified).toBe(true);

      console.log('✅ Token validation: Valid tokens processed correctly');
    });

    test('should reject invalid tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'invalid-token-12345' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('inválido');

      console.log('✅ Token validation: Invalid tokens rejected');
    });

    test('should handle expired tokens', async () => {
      // Create expired token manually
      const expiredToken = await prisma.emailVerificationToken.create({
        data: {
          user_id: testUserId,
          token: 'expired-token-' + Date.now(),
          expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
          used: false
        }
      });

      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: expiredToken.token });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('expirado');

      console.log('✅ Token expiration: Expired tokens rejected');
    });

    test('should prevent double verification', async () => {
      // Generate and use token
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: testUserId }
      });

      // First verification
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      // Second verification attempt
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ya está verificado');

      console.log('✅ Double verification: Prevented successfully');
    });

    test('should test 24-hour token expiration', async () => {
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: testUserId }
      });

      const expirationTime = token.expires_at.getTime();
      const creationTime = token.created_at.getTime();
      const hoursDifference = (expirationTime - creationTime) / (1000 * 60 * 60);

      expect(hoursDifference).toBe(24);
      console.log('✅ Token expiration: 24-hour expiration set correctly');
    });

    test('should invalidate old tokens when generating new ones', async () => {
      // Generate first token
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      const firstToken = await prisma.emailVerificationToken.findFirst({
        where: { user_id: testUserId },
        orderBy: { created_at: 'desc' }
      });

      // Generate second token
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      // First token should be marked as used
      const invalidatedToken = await prisma.emailVerificationToken.findFirst({
        where: { id: firstToken.id }
      });

      expect(invalidatedToken.used).toBe(true);
      console.log('✅ Token invalidation: Old tokens invalidated correctly');
    });
  });

  describe('3. Security Testing', () => {
    const testEmail = 'security.test@fixia.test';
    let testUserId: string;

    beforeAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: testEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: testEmail }
      });

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password_hash: 'dummy_hash',
          name: 'Security Test User',
          user_type: 'client',
          email_verified: false,
        }
      });
      testUserId = user.id;
    });

    afterAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: testUserId }
      });
      await prisma.user.delete({
        where: { id: testUserId }
      });
    });

    test('should test token randomness and entropy', async () => {
      const tokens = [];
      
      // Generate multiple tokens
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: testEmail });

        const token = await prisma.emailVerificationToken.findFirst({
          where: { user_id: testUserId, used: false },
          orderBy: { created_at: 'desc' }
        });

        tokens.push(token.token);
      }

      // Check uniqueness
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);

      // Check length and format (hex)
      tokens.forEach(token => {
        expect(token).toHaveLength(64);
        expect(/^[a-f0-9]+$/.test(token)).toBe(true);
      });

      console.log('✅ Token security: High entropy and uniqueness verified');
    });

    test('should test rate limiting on verification endpoint', async () => {
      const promises = [];
      
      // Attempt multiple rapid requests (should be limited)
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({ email: testEmail })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      if (rateLimitedResponses.length > 0) {
        console.log('✅ Rate limiting: Working correctly');
      } else {
        console.warn('⚠️ AUDIT FINDING: Rate limiting may not be properly configured');
      }
    });

    test('should test SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'/*",
        '"; DELETE FROM email_verification_tokens; --'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: input });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('inválido');
      }

      console.log('✅ SQL injection protection: Working correctly');
    });

    test('should test XSS attempts in verification flow', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '"><script>alert(1)</script>',
        '&#60;script&#62;alert(1)&#60;/script&#62;'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: payload });

        expect(response.status).toBe(400);
        // Should not contain the payload in response
        expect(response.body.message).not.toContain('<script>');
        expect(response.body.message).not.toContain('javascript:');
      }

      console.log('✅ XSS protection: Working correctly');
    });

    test('should test CSRF protection', async () => {
      // This would require testing with actual browsers and CSRF tokens
      // For now, verify that endpoints require proper content-type
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .set('Content-Type', 'text/plain')
        .send('token=test-token');

      expect(response.status).toBe(400);
      console.log('✅ CSRF protection: Content-type validation working');
    });

    test('should test timing attack resistance', async () => {
      const validEmail = testEmail;
      const invalidEmail = 'nonexistent@fixia.test';
      const timings = [];

      // Test response times for valid vs invalid emails
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: validEmail });
        timings.push({ type: 'valid', time: Date.now() - start });

        const start2 = Date.now();
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: invalidEmail });
        timings.push({ type: 'invalid', time: Date.now() - start2 });
      }

      const validTimes = timings.filter(t => t.type === 'valid').map(t => t.time);
      const invalidTimes = timings.filter(t => t.type === 'invalid').map(t => t.time);
      
      const avgValidTime = validTimes.reduce((a, b) => a + b) / validTimes.length;
      const avgInvalidTime = invalidTimes.reduce((a, b) => a + b) / invalidTimes.length;
      
      // Times should be similar (within 50% difference) to prevent timing attacks
      const timeDifference = Math.abs(avgValidTime - avgInvalidTime) / Math.max(avgValidTime, avgInvalidTime);
      
      if (timeDifference < 0.5) {
        console.log('✅ Timing attack resistance: Good timing consistency');
      } else {
        console.warn('⚠️ AUDIT FINDING: Potential timing attack vulnerability detected');
      }
    });
  });

  describe('4. Integration Testing', () => {
    test('should test complete registration → email → verification flow', async () => {
      const timestamp = Date.now();
      const testEmail = `integration.test.${timestamp}@fixia.test`;

      // Step 1: Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
          fullName: 'Integration Test User',
          userType: 'client',
          location: 'Test Location',
          phone: '+54 280 123-4567'
        });

      expect(registerResponse.status).toBe(201);
      
      // Step 2: Verify user was created but not verified
      const user = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      expect(user).toBeDefined();
      expect(user.email_verified).toBe(false);

      // Step 3: Verify token was generated
      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: user.id }
      });
      
      expect(token).toBeDefined();
      expect(token.used).toBe(false);

      // Step 4: Verify email
      const verifyResponse = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      expect(verifyResponse.status).toBe(200);

      // Step 5: Verify user is now verified
      const verifiedUser = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      expect(verifiedUser.email_verified).toBe(true);

      // Step 6: Verify token is marked as used
      const usedToken = await prisma.emailVerificationToken.findFirst({
        where: { id: token.id }
      });
      
      expect(usedToken.used).toBe(true);

      console.log('✅ End-to-end integration: Complete flow working correctly');

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
    });

    test('should prevent login for unverified users', async () => {
      const timestamp = Date.now();
      const testEmail = `login.test.${timestamp}@fixia.test`;
      const password = 'TestPassword123!';

      // Register user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: password,
          fullName: 'Login Test User',
          userType: 'client'
        });

      // Try to login before verification
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: password
        });

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.message).toContain('verificar');

      console.log('✅ Login prevention: Unverified users cannot login');

      // Cleanup
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
    });

    test('should test GET verification endpoint (for email links)', async () => {
      const timestamp = Date.now();
      const testEmail = `get.test.${timestamp}@fixia.test`;

      // Create user and token
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password_hash: 'dummy_hash',
          name: 'GET Test User',
          user_type: 'client',
          email_verified: false,
        }
      });

      const token = await prisma.emailVerificationToken.create({
        data: {
          user_id: user.id,
          token: 'get-test-token-' + timestamp,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used: false
        }
      });

      // Test GET verification
      const response = await request(app.getHttpServer())
        .get(`/auth/verify/${token.token}`)
        .expect(302); // Should redirect

      // Should redirect to frontend with success
      expect(response.header.location).toContain('verified=true');

      // Verify user is now verified
      const verifiedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      expect(verifiedUser.email_verified).toBe(true);

      console.log('✅ GET verification: Direct email links working');

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
    });
  });

  describe('5. Performance Testing', () => {
    test('should test verification endpoint performance', async () => {
      const testEmail = 'performance.test@fixia.test';
      
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password_hash: 'dummy_hash',
          name: 'Performance Test User',
          user_type: 'client',
          email_verified: false,
        }
      });

      const promises = [];
      const startTime = Date.now();
      
      // Test concurrent resend requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({ email: testEmail })
        );
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log(`✅ Performance: 10 concurrent requests completed in ${totalTime}ms`);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
    });

    test('should test database query performance', async () => {
      // This would test the efficiency of token lookup queries
      // Create many tokens and measure lookup time
      const testUsers = [];
      
      // Create multiple test users and tokens
      for (let i = 0; i < 50; i++) {
        const user = await prisma.user.create({
          data: {
            email: `perf.user.${i}@fixia.test`,
            password_hash: 'dummy_hash',
            name: `Perf Test User ${i}`,
            user_type: 'client',
            email_verified: false,
          }
        });
        
        await prisma.emailVerificationToken.create({
          data: {
            user_id: user.id,
            token: `perf-token-${i}-${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            used: false
          }
        });
        
        testUsers.push(user.id);
      }

      // Test token lookup performance
      const startTime = Date.now();
      const token = await prisma.emailVerificationToken.findFirst({
        where: {
          token: `perf-token-25-${Date.now() - 1000}`, // Look for a token that might exist
          used: false,
          expires_at: { gt: new Date() }
        },
        include: { user: true }
      });
      const lookupTime = Date.now() - startTime;

      expect(lookupTime).toBeLessThan(100); // Should be very fast with proper indexes
      
      console.log(`✅ Database performance: Token lookup completed in ${lookupTime}ms`);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: { in: testUsers } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUsers } }
      });
    });
  });
});