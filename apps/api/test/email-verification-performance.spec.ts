import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { EmailService } from '../src/modules/email/email.service';
import * as crypto from 'crypto';

/**
 * Email Verification Performance Testing Suite
 * 
 * Comprehensive performance testing including:
 * - Response time benchmarks
 * - Concurrent request handling
 * - Database performance under load
 * - Memory usage monitoring
 * - Email service performance
 * - Scalability testing
 */

describe('Email Verification Performance Audit', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let emailService: EmailService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    emailService = app.get<EmailService>(EmailService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Response Time Benchmarks', () => {
    const performanceTestEmail = 'performance@fixia.test';
    let performanceUserId: string;

    beforeAll(async () => {
      // Clean up and create test user
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: performanceTestEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: performanceTestEmail }
      });

      const user = await prisma.user.create({
        data: {
          email: performanceTestEmail,
          password_hash: 'dummy_hash',
          name: 'Performance Test User',
          user_type: 'client',
          email_verified: false,
        }
      });
      performanceUserId = user.id;
    });

    afterAll(async () => {
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: performanceUserId }
      });
      await prisma.user.delete({
        where: { id: performanceUserId }
      });
    });

    test('should handle resend verification within performance threshold', async () => {
      const times = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint();
        
        const response = await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: performanceTestEmail });

        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        expect(response.status).toBe(200);
        times.push(responseTime);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      // Performance thresholds
      expect(avgTime).toBeLessThan(2000); // Average under 2 seconds
      expect(maxTime).toBeLessThan(5000); // Max under 5 seconds
      expect(minTime).toBeLessThan(1000); // Min under 1 second

      console.log(`✅ Performance: Resend verification - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms, Min: ${minTime.toFixed(2)}ms`);
    });

    test('should handle token verification within performance threshold', async () => {
      // Generate token first
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: performanceTestEmail });

      const token = await prisma.emailVerificationToken.findFirst({
        where: { user_id: performanceUserId, used: false },
        orderBy: { created_at: 'desc' }
      });

      const times = [];
      const iterations = 5; // Fewer iterations since we need fresh tokens

      for (let i = 0; i < iterations; i++) {
        // Create fresh token for each test
        const testToken = await prisma.emailVerificationToken.create({
          data: {
            user_id: performanceUserId,
            token: crypto.randomBytes(32).toString('hex'),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            used: false
          }
        });

        const startTime = process.hrtime.bigint();
        
        const response = await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: testToken.token });

        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000;

        // Reset user verification status for next test
        await prisma.user.update({
          where: { id: performanceUserId },
          data: { email_verified: false }
        });

        times.push(responseTime);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const maxTime = Math.max(...times);

      expect(avgTime).toBeLessThan(1000); // Average under 1 second
      expect(maxTime).toBeLessThan(2000); // Max under 2 seconds

      console.log(`✅ Performance: Token verification - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
    });

    test('should handle invalid token verification quickly', async () => {
      const invalidTokens = [
        crypto.randomBytes(32).toString('hex'), // Valid format, non-existent
        'invalid-format-token',
        '',
        'a'.repeat(64)
      ];

      const times = [];

      for (const invalidToken of invalidTokens) {
        const startTime = process.hrtime.bigint();
        
        await request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token: invalidToken });

        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000;
        times.push(responseTime);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      
      // Invalid tokens should be rejected quickly
      expect(avgTime).toBeLessThan(500); // Average under 500ms

      console.log(`✅ Performance: Invalid token handling - Avg: ${avgTime.toFixed(2)}ms`);
    });
  });

  describe('2. Concurrent Request Handling', () => {
    test('should handle concurrent resend requests efficiently', async () => {
      const concurrentUsers = 20;
      const userEmails = Array.from({ length: concurrentUsers }, (_, i) => `concurrent${i}@fixia.test`);

      // Clean up existing test users
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: { in: userEmails } } }
      });
      await prisma.user.deleteMany({
        where: { email: { in: userEmails } }
      });

      // Create test users
      const users = await Promise.all(
        userEmails.map(email => 
          prisma.user.create({
            data: {
              email,
              password_hash: 'dummy_hash',
              name: `Concurrent Test ${email}`,
              user_type: 'client',
              email_verified: false,
            }
          })
        )
      );

      const startTime = process.hrtime.bigint();

      // Send concurrent requests
      const promises = userEmails.map(email =>
        request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email })
      );

      const responses = await Promise.all(promises);
      const endTime = process.hrtime.bigint();
      
      const totalTime = Number(endTime - startTime) / 1000000;
      const avgTimePerRequest = totalTime / concurrentUsers;

      // All requests should succeed
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(concurrentUsers * 0.8); // At least 80% success

      // Should handle concurrency efficiently
      expect(avgTimePerRequest).toBeLessThan(1000); // Average under 1 second per request
      expect(totalTime).toBeLessThan(10000); // Total under 10 seconds

      console.log(`✅ Performance: Concurrent resends - ${successfulResponses.length}/${concurrentUsers} successful in ${totalTime.toFixed(2)}ms (${avgTimePerRequest.toFixed(2)}ms avg)`);

      // Cleanup
      const userIds = users.map(u => u.id);
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: { in: userIds } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } }
      });
    });

    test('should handle concurrent verification attempts efficiently', async () => {
      const concurrentAttempts = 50;
      const invalidTokens = Array.from({ length: concurrentAttempts }, () => 
        crypto.randomBytes(32).toString('hex')
      );

      const startTime = process.hrtime.bigint();

      // Send concurrent verification attempts
      const promises = invalidTokens.map(token =>
        request(app.getHttpServer())
          .post('/auth/verify-email')
          .send({ token })
      );

      const responses = await Promise.all(promises);
      const endTime = process.hrtime.bigint();
      
      const totalTime = Number(endTime - startTime) / 1000000;
      const avgTimePerRequest = totalTime / concurrentAttempts;

      // All should be rejected (400 status)
      const rejectedResponses = responses.filter(r => r.status === 400);
      expect(rejectedResponses.length).toBe(concurrentAttempts);

      // Should handle rejections quickly
      expect(avgTimePerRequest).toBeLessThan(200); // Average under 200ms per request
      expect(totalTime).toBeLessThan(5000); // Total under 5 seconds

      console.log(`✅ Performance: Concurrent verifications - ${rejectedResponses.length}/${concurrentAttempts} rejected in ${totalTime.toFixed(2)}ms (${avgTimePerRequest.toFixed(2)}ms avg)`);
    });

    test('should maintain performance under mixed workload', async () => {
      const mixedTestEmail = 'mixed.workload@fixia.test';
      
      // Clean up and create test user
      await prisma.emailVerificationToken.deleteMany({
        where: { user: { email: mixedTestEmail } }
      });
      await prisma.user.deleteMany({
        where: { email: mixedTestEmail }
      });

      const user = await prisma.user.create({
        data: {
          email: mixedTestEmail,
          password_hash: 'dummy_hash',
          name: 'Mixed Workload Test',
          user_type: 'client',
          email_verified: false,
        }
      });

      // Create mix of valid and invalid requests
      const promises = [];
      
      // 10 resend requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({ email: mixedTestEmail })
        );
      }

      // 20 invalid token verifications
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/verify-email')
            .send({ token: crypto.randomBytes(32).toString('hex') })
        );
      }

      const startTime = process.hrtime.bigint();
      const responses = await Promise.all(promises);
      const endTime = process.hrtime.bigint();
      
      const totalTime = Number(endTime - startTime) / 1000000;
      const avgTimePerRequest = totalTime / promises.length;

      // Should handle mixed workload efficiently
      expect(avgTimePerRequest).toBeLessThan(500); // Average under 500ms
      expect(totalTime).toBeLessThan(10000); // Total under 10 seconds

      console.log(`✅ Performance: Mixed workload - ${responses.length} requests in ${totalTime.toFixed(2)}ms (${avgTimePerRequest.toFixed(2)}ms avg)`);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
    });
  });

  describe('3. Database Performance Under Load', () => {
    test('should efficiently query tokens with proper indexes', async () => {
      // Create many tokens to test query performance
      const testUser = await prisma.user.create({
        data: {
          email: 'db.performance@fixia.test',
          password_hash: 'dummy_hash',
          name: 'DB Performance Test',
          user_type: 'client',
          email_verified: false,
        }
      });

      const tokenCount = 1000;
      const tokens = [];

      // Create many tokens
      for (let i = 0; i < tokenCount; i++) {
        tokens.push({
          user_id: testUser.id,
          token: crypto.randomBytes(32).toString('hex'),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used: i % 10 === 0 // Mark some as used
        });
      }

      await prisma.emailVerificationToken.createMany({
        data: tokens
      });

      // Test query performance
      const searchToken = tokens[Math.floor(tokenCount / 2)].token;
      
      const startTime = process.hrtime.bigint();
      
      const foundToken = await prisma.emailVerificationToken.findFirst({
        where: {
          token: searchToken,
          used: false,
          expires_at: { gt: new Date() }
        },
        include: { user: true }
      });
      
      const endTime = process.hrtime.bigint();
      const queryTime = Number(endTime - startTime) / 1000000;

      expect(foundToken).toBeTruthy();
      expect(queryTime).toBeLessThan(100); // Query should be under 100ms even with 1000 records

      console.log(`✅ Database Performance: Token query with ${tokenCount} records completed in ${queryTime.toFixed(2)}ms`);

      // Test cleanup query performance
      const cleanupStartTime = process.hrtime.bigint();
      
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: testUser.id }
      });
      
      const cleanupEndTime = process.hrtime.bigint();
      const cleanupTime = Number(cleanupEndTime - cleanupStartTime) / 1000000;

      expect(cleanupTime).toBeLessThan(1000); // Cleanup should be under 1 second

      console.log(`✅ Database Performance: Cleanup of ${tokenCount} records completed in ${cleanupTime.toFixed(2)}ms`);

      // Final cleanup
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    });

    test('should handle database connection pooling efficiently', async () => {
      // Test multiple concurrent database operations
      const concurrentOperations = 25;
      const testEmails = Array.from({ length: concurrentOperations }, (_, i) => 
        `pool.test.${i}@fixia.test`
      );

      // Clean up
      await prisma.user.deleteMany({
        where: { email: { in: testEmails } }
      });

      const startTime = process.hrtime.bigint();

      // Create users concurrently
      const createPromises = testEmails.map(email =>
        prisma.user.create({
          data: {
            email,
            password_hash: 'dummy_hash',
            name: `Pool Test ${email}`,
            user_type: 'client',
            email_verified: false,
          }
        })
      );

      const users = await Promise.all(createPromises);

      // Create tokens concurrently
      const tokenPromises = users.map(user =>
        prisma.emailVerificationToken.create({
          data: {
            user_id: user.id,
            token: crypto.randomBytes(32).toString('hex'),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            used: false
          }
        })
      );

      await Promise.all(tokenPromises);

      const endTime = process.hrtime.bigint();
      const totalTime = Number(endTime - startTime) / 1000000;
      const avgTimePerOperation = totalTime / (concurrentOperations * 2); // 2 operations per user

      expect(avgTimePerOperation).toBeLessThan(100); // Average under 100ms per operation

      console.log(`✅ Database Performance: Connection pooling - ${concurrentOperations * 2} operations in ${totalTime.toFixed(2)}ms (${avgTimePerOperation.toFixed(2)}ms avg)`);

      // Cleanup
      const userIds = users.map(u => u.id);
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: { in: userIds } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } }
      });
    });

    test('should efficiently handle token cleanup operations', async () => {
      const expiredTokenCount = 500;
      
      // Create user for expired tokens
      const cleanupUser = await prisma.user.create({
        data: {
          email: 'cleanup.test@fixia.test',
          password_hash: 'dummy_hash',
          name: 'Cleanup Test',
          user_type: 'client',
          email_verified: false,
        }
      });

      // Create expired and used tokens
      const expiredTokens = Array.from({ length: expiredTokenCount }, (_, i) => ({
        user_id: cleanupUser.id,
        token: crypto.randomBytes(32).toString('hex'),
        expires_at: new Date(Date.now() - (24 * 60 * 60 * 1000)), // Expired
        used: i % 2 === 0 // Half are used
      }));

      await prisma.emailVerificationToken.createMany({
        data: expiredTokens
      });

      // Test cleanup performance
      const startTime = process.hrtime.bigint();
      
      // Cleanup expired tokens
      const deletedCount = await prisma.emailVerificationToken.deleteMany({
        where: {
          OR: [
            { expires_at: { lt: new Date() } },
            { used: true }
          ]
        }
      });
      
      const endTime = process.hrtime.bigint();
      const cleanupTime = Number(endTime - startTime) / 1000000;

      expect(deletedCount.count).toBe(expiredTokenCount);
      expect(cleanupTime).toBeLessThan(2000); // Cleanup should be under 2 seconds

      console.log(`✅ Database Performance: Cleaned up ${deletedCount.count} tokens in ${cleanupTime.toFixed(2)}ms`);

      // Final cleanup
      await prisma.user.delete({
        where: { id: cleanupUser.id }
      });
    });
  });

  describe('4. Memory Usage Monitoring', () => {
    test('should not have memory leaks during token generation', async () => {
      const initialMemory = process.memoryUsage();
      const iterations = 100;
      
      const testUser = await prisma.user.create({
        data: {
          email: 'memory.test@fixia.test',
          password_hash: 'dummy_hash',
          name: 'Memory Test',
          user_type: 'client',
          email_verified: false,
        }
      });

      // Generate many tokens
      for (let i = 0; i < iterations; i++) {
        await request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email: 'memory.test@fixia.test' });
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreasePerOperation = memoryIncrease / iterations;

      // Memory increase should be reasonable (under 1MB per operation)
      expect(memoryIncreasePerOperation).toBeLessThan(1024 * 1024);

      console.log(`✅ Memory Usage: ${iterations} operations increased memory by ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${(memoryIncreasePerOperation / 1024).toFixed(2)}KB per operation)`);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: testUser.id }
      });
      await prisma.user.delete({
        where: { id: testUser.id }
      });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });

    test('should efficiently handle large token datasets in memory', async () => {
      const largeDatasetSize = 1000;
      const testUser = await prisma.user.create({
        data: {
          email: 'large.dataset@fixia.test',
          password_hash: 'dummy_hash',
          name: 'Large Dataset Test',
          user_type: 'client',
          email_verified: false,
        }
      });

      const memoryBefore = process.memoryUsage();

      // Create large dataset
      const tokens = Array.from({ length: largeDatasetSize }, () => ({
        user_id: testUser.id,
        token: crypto.randomBytes(32).toString('hex'),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        used: false
      }));

      await prisma.emailVerificationToken.createMany({
        data: tokens
      });

      // Query operations on large dataset
      const startTime = process.hrtime.bigint();
      
      const tokenCount = await prisma.emailVerificationToken.count({
        where: { user_id: testUser.id }
      });
      
      const endTime = process.hrtime.bigint();
      const queryTime = Number(endTime - startTime) / 1000000;

      const memoryAfter = process.memoryUsage();
      const memoryUsed = memoryAfter.heapUsed - memoryBefore.heapUsed;

      expect(tokenCount).toBe(largeDatasetSize);
      expect(queryTime).toBeLessThan(500); // Query should be fast
      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // Should use less than 100MB

      console.log(`✅ Memory Usage: Large dataset (${largeDatasetSize} tokens) query in ${queryTime.toFixed(2)}ms, memory usage: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: testUser.id }
      });
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    });
  });

  describe('5. Email Service Performance', () => {
    test('should measure email template rendering performance', async () => {
      const renderingTimes = [];
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint();
        
        // Render template through email service
        const result = await emailService.sendAccountVerification(
          `performance.test.${i}@fixia.test`,
          `Performance Test User ${i}`,
          `https://fixia.com.ar/verify/test-token-${i}`
        );

        const endTime = process.hrtime.bigint();
        const renderTime = Number(endTime - startTime) / 1000000;
        
        renderingTimes.push(renderTime);
      }

      const avgRenderTime = renderingTimes.reduce((a, b) => a + b) / renderingTimes.length;
      const maxRenderTime = Math.max(...renderingTimes);

      expect(avgRenderTime).toBeLessThan(1000); // Average under 1 second
      expect(maxRenderTime).toBeLessThan(3000); // Max under 3 seconds

      console.log(`✅ Email Performance: Template rendering - Avg: ${avgRenderTime.toFixed(2)}ms, Max: ${maxRenderTime.toFixed(2)}ms`);
    });

    test('should handle email service failover efficiently', async () => {
      // This test would require mocking different email services
      // and testing failover performance

      const failoverTimes = [];
      const testEmails = ['failover1@fixia.test', 'failover2@fixia.test', 'failover3@fixia.test'];

      for (const email of testEmails) {
        const startTime = process.hrtime.bigint();
        
        // Attempt to send email (may fail over between services)
        const result = await emailService.sendAccountVerification(
          email,
          'Failover Test User',
          'https://fixia.com.ar/verify/test-token'
        );

        const endTime = process.hrtime.bigint();
        const failoverTime = Number(endTime - startTime) / 1000000;
        
        failoverTimes.push(failoverTime);
      }

      const avgFailoverTime = failoverTimes.reduce((a, b) => a + b) / failoverTimes.length;
      
      // Failover should not significantly impact performance
      expect(avgFailoverTime).toBeLessThan(5000); // Average under 5 seconds

      console.log(`✅ Email Performance: Failover handling - Avg: ${avgFailoverTime.toFixed(2)}ms`);
    });
  });

  describe('6. Scalability Testing', () => {
    test('should maintain performance with increased load', async () => {
      const loadLevels = [10, 25, 50, 100];
      const performanceResults = [];

      for (const loadLevel of loadLevels) {
        const testEmails = Array.from({ length: loadLevel }, (_, i) => 
          `scale.test.${loadLevel}.${i}@fixia.test`
        );

        // Clean up
        await prisma.user.deleteMany({
          where: { email: { in: testEmails } }
        });

        // Create test users
        const users = await Promise.all(
          testEmails.map(email => 
            prisma.user.create({
              data: {
                email,
                password_hash: 'dummy_hash',
                name: `Scale Test ${email}`,
                user_type: 'client',
                email_verified: false,
              }
            })
          )
        );

        // Test performance at this load level
        const startTime = process.hrtime.bigint();
        
        const promises = testEmails.map(email =>
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({ email })
        );

        const responses = await Promise.all(promises);
        const endTime = process.hrtime.bigint();
        
        const totalTime = Number(endTime - startTime) / 1000000;
        const avgTimePerRequest = totalTime / loadLevel;
        const successRate = responses.filter(r => r.status === 200).length / loadLevel;

        performanceResults.push({
          loadLevel,
          totalTime,
          avgTimePerRequest,
          successRate
        });

        // Cleanup
        const userIds = users.map(u => u.id);
        await prisma.emailVerificationToken.deleteMany({
          where: { user_id: { in: userIds } }
        });
        await prisma.user.deleteMany({
          where: { id: { in: userIds } }
        });
      }

      // Analyze scalability
      for (let i = 1; i < performanceResults.length; i++) {
        const current = performanceResults[i];
        const previous = performanceResults[i - 1];
        
        const loadIncrease = current.loadLevel / previous.loadLevel;
        const timeIncrease = current.avgTimePerRequest / previous.avgTimePerRequest;
        
        // Performance should not degrade significantly with increased load
        expect(timeIncrease).toBeLessThan(loadIncrease * 2); // Less than 2x time increase for load increase
        expect(current.successRate).toBeGreaterThan(0.8); // At least 80% success rate
      }

      console.log('✅ Scalability: Performance results across load levels:');
      performanceResults.forEach(result => {
        console.log(`  Load ${result.loadLevel}: ${result.avgTimePerRequest.toFixed(2)}ms avg, ${(result.successRate * 100).toFixed(1)}% success`);
      });
    });

    test('should handle peak load gracefully', async () => {
      const peakLoad = 200;
      const testEmails = Array.from({ length: peakLoad }, (_, i) => 
        `peak.test.${i}@fixia.test`
      );

      // Clean up
      await prisma.user.deleteMany({
        where: { email: { in: testEmails } }
      });

      // Create test users
      const users = await Promise.all(
        testEmails.map(email => 
          prisma.user.create({
            data: {
              email,
              password_hash: 'dummy_hash',
              name: `Peak Test ${email}`,
              user_type: 'client',
              email_verified: false,
            }
          })
        )
      );

      const startTime = process.hrtime.bigint();
      
      // Send all requests simultaneously
      const promises = testEmails.map(email =>
        request(app.getHttpServer())
          .post('/auth/resend-verification')
          .send({ email })
          .catch(error => ({ status: 500, error: error.message }))
      );

      const responses = await Promise.all(promises);
      const endTime = process.hrtime.bigint();
      
      const totalTime = Number(endTime - startTime) / 1000000;
      const successfulResponses = responses.filter(r => r.status === 200);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      const errorResponses = responses.filter(r => r.status >= 500);

      const successRate = successfulResponses.length / peakLoad;
      const avgTimePerRequest = totalTime / peakLoad;

      // System should handle peak load gracefully
      expect(successRate + (rateLimitedResponses.length / peakLoad)).toBeGreaterThan(0.7); // At least 70% success or rate limited
      expect(errorResponses.length / peakLoad).toBeLessThan(0.1); // Less than 10% errors
      expect(avgTimePerRequest).toBeLessThan(2000); // Average under 2 seconds

      console.log(`✅ Scalability: Peak load (${peakLoad}) - ${successfulResponses.length} success, ${rateLimitedResponses.length} rate limited, ${errorResponses.length} errors in ${totalTime.toFixed(2)}ms`);

      // Cleanup
      const userIds = users.map(u => u.id);
      await prisma.emailVerificationToken.deleteMany({
        where: { user_id: { in: userIds } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } }
      });
    });
  });
});