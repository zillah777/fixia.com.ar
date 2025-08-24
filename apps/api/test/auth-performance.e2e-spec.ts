import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Authentication Performance E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    // Clean up performance test data
    await prismaService.user.deleteMany({
      where: {
        email: {
          contains: 'perf-test',
        },
      },
    });
    await app.close();
  });

  describe('Registration Performance', () => {
    it('should handle concurrent client registrations within acceptable time', async () => {
      const startTime = Date.now();
      const concurrentUsers = 10;
      const registrationPromises = [];

      for (let i = 0; i < concurrentUsers; i++) {
        const userData = {
          email: `perf-test-client-${i}-${Date.now()}@fixia.test`,
          password: 'TestPassword123!',
          fullName: `Performance Test Client ${i}`,
          userType: 'client',
          location: 'Rawson',
          phone: `+54280456789${i}`,
        };

        registrationPromises.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send(userData)
            .expect(201)
        );
      }

      const responses = await Promise.all(registrationPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All registrations should succeed
      responses.forEach(response => {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user).toHaveProperty('email');
      });

      // Performance assertion: should complete within 10 seconds for 10 concurrent users
      expect(totalTime).toBeLessThan(10000);
      console.log(`Concurrent registrations completed in ${totalTime}ms`);
    }, 15000);

    it('should handle concurrent professional registrations with profile creation', async () => {
      const startTime = Date.now();
      const concurrentProfessionals = 5;
      const registrationPromises = [];

      for (let i = 0; i < concurrentProfessionals; i++) {
        const professionalData = {
          email: `perf-test-professional-${i}-${Date.now()}@fixia.test`,
          password: 'TestPassword123!',
          fullName: `Performance Test Professional ${i}`,
          userType: 'professional',
          location: 'Rawson',
          phone: `+54280456788${i}`,
          serviceCategories: ['Peluquería', 'Manicura'],
          description: `Professional description ${i}`,
          experience: '5-10',
          pricing: 'intermedio',
          availability: 'tiempo-completo',
        };

        registrationPromises.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send(professionalData)
            .expect(201)
        );
      }

      const responses = await Promise.all(registrationPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All registrations should succeed
      responses.forEach(response => {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user.user_type).toBe('professional');
      });

      // Performance assertion: should complete within 15 seconds for 5 concurrent professionals
      expect(totalTime).toBeLessThan(15000);
      console.log(`Concurrent professional registrations completed in ${totalTime}ms`);

      // Verify professional profiles were created
      for (const response of responses) {
        const user = await prismaService.user.findUnique({
          where: { email: response.body.user.email },
          include: { professional_profile: true },
        });
        expect(user.professional_profile).toBeDefined();
      }
    }, 20000);

    it('should maintain performance under sequential load', async () => {
      const startTime = Date.now();
      const sequentialUsers = 20;
      const registrationTimes = [];

      for (let i = 0; i < sequentialUsers; i++) {
        const userStartTime = Date.now();
        const userData = {
          email: `perf-test-sequential-${i}-${Date.now()}@fixia.test`,
          password: 'TestPassword123!',
          fullName: `Sequential Test User ${i}`,
          userType: 'client',
          location: 'Rawson',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(201);

        const userEndTime = Date.now();
        registrationTimes.push(userEndTime - userStartTime);

        expect(response.body).toHaveProperty('access_token');
      }

      const totalTime = Date.now() - startTime;
      const averageTime = registrationTimes.reduce((a, b) => a + b, 0) / registrationTimes.length;
      const maxTime = Math.max(...registrationTimes);

      console.log(`Sequential registrations: Total: ${totalTime}ms, Average: ${averageTime}ms, Max: ${maxTime}ms`);

      // Performance assertions
      expect(averageTime).toBeLessThan(2000); // Average should be under 2 seconds
      expect(maxTime).toBeLessThan(5000); // No single registration should take more than 5 seconds
    }, 60000);
  });

  describe('Login Performance', () => {
    let testUsers: Array<{ email: string; password: string }> = [];

    beforeAll(async () => {
      // Create test users for login performance testing
      const userCreationPromises = [];
      for (let i = 0; i < 10; i++) {
        const userData = {
          email: `perf-login-test-${i}-${Date.now()}@fixia.test`,
          password: 'TestPassword123!',
          fullName: `Login Performance Test User ${i}`,
          userType: 'client',
        };

        testUsers.push({
          email: userData.email,
          password: userData.password,
        });

        userCreationPromises.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send(userData)
        );
      }

      await Promise.all(userCreationPromises);
    });

    it('should handle concurrent login requests efficiently', async () => {
      const startTime = Date.now();
      const loginPromises = testUsers.map(user =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: user.email,
            password: user.password,
          })
          .expect(200)
      );

      const responses = await Promise.all(loginPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All logins should succeed
      responses.forEach(response => {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('refresh_token');
      });

      // Performance assertion: should complete within 5 seconds for 10 concurrent logins
      expect(totalTime).toBeLessThan(5000);
      console.log(`Concurrent logins completed in ${totalTime}ms`);
    }, 10000);

    it('should maintain consistent login performance over time', async () => {
      const iterations = 50;
      const loginTimes = [];
      const user = testUsers[0];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: user.email,
            password: user.password,
          })
          .expect(200);

        const endTime = Date.now();
        loginTimes.push(endTime - startTime);

        expect(response.body).toHaveProperty('access_token');
      }

      const averageTime = loginTimes.reduce((a, b) => a + b, 0) / loginTimes.length;
      const maxTime = Math.max(...loginTimes);
      const minTime = Math.min(...loginTimes);

      console.log(`Login performance over ${iterations} iterations: Avg: ${averageTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);

      // Performance assertions
      expect(averageTime).toBeLessThan(1000); // Average should be under 1 second
      expect(maxTime).toBeLessThan(3000); // No login should take more than 3 seconds
    }, 60000);
  });

  describe('JWT Token Performance', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      // Create a test user and get tokens
      const userData = {
        email: `jwt-perf-test-${Date.now()}@fixia.test`,
        password: 'TestPassword123!',
        fullName: 'JWT Performance Test User',
        userType: 'client',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      accessToken = registerResponse.body.access_token;
      refreshToken = registerResponse.body.refresh_token;
    });

    it('should handle concurrent token refresh requests', async () => {
      const startTime = Date.now();
      const concurrentRefreshes = 10;
      const refreshPromises = [];

      for (let i = 0; i < concurrentRefreshes; i++) {
        refreshPromises.push(
          request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refresh_token: refreshToken })
            .expect(200)
        );
      }

      const responses = await Promise.all(refreshPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All refreshes should succeed
      responses.forEach(response => {
        expect(response.body).toHaveProperty('access_token');
      });

      // Performance assertion: should complete within 3 seconds
      expect(totalTime).toBeLessThan(3000);
      console.log(`Concurrent token refreshes completed in ${totalTime}ms`);
    }, 10000);

    it('should handle concurrent authenticated requests', async () => {
      const startTime = Date.now();
      const concurrentRequests = 15;
      const profilePromises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        profilePromises.push(
          request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
        );
      }

      const responses = await Promise.all(profilePromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All profile requests should succeed
      responses.forEach(response => {
        expect(response.body).toHaveProperty('email');
      });

      // Performance assertion: should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
      console.log(`Concurrent authenticated requests completed in ${totalTime}ms`);
    }, 10000);
  });

  describe('Database Performance Under Load', () => {
    it('should maintain database performance with concurrent operations', async () => {
      const startTime = Date.now();
      const operations = [];

      // Mix of different operations
      for (let i = 0; i < 5; i++) {
        // Registration
        operations.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send({
              email: `db-perf-register-${i}-${Date.now()}@fixia.test`,
              password: 'TestPassword123!',
              fullName: `DB Perf Test ${i}`,
              userType: 'client',
            })
        );

        // Email verification requests
        operations.push(
          request(app.getHttpServer())
            .post('/auth/resend-verification')
            .send({
              email: `db-perf-register-${i}-${Date.now()}@fixia.test`,
            })
        );

        // Password reset requests
        operations.push(
          request(app.getHttpServer())
            .post('/auth/forgot-password')
            .send({
              email: `nonexistent-${i}@fixia.test`,
            })
        );
      }

      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Mixed database operations completed in ${totalTime}ms`);

      // Performance assertion: should complete within 15 seconds
      expect(totalTime).toBeLessThan(15000);

      // Verify operations completed successfully
      expect(responses.filter(r => r.status >= 200 && r.status < 300).length).toBeGreaterThan(0);
    }, 20000);

    it('should handle database connection pooling efficiently', async () => {
      // This test simulates high load to test connection pooling
      const startTime = Date.now();
      const heavyLoad = 25;
      const operations = [];

      for (let i = 0; i < heavyLoad; i++) {
        operations.push(
          request(app.getHttpServer())
            .post('/auth/forgot-password')
            .send({
              email: `load-test-${i}@fixia.test`,
            })
        );
      }

      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Database connection pooling test completed in ${totalTime}ms`);

      // All requests should complete successfully
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Performance assertion: should handle high load within reasonable time
      expect(totalTime).toBeLessThan(10000);
    }, 15000);
  });

  describe('Memory Usage and Cleanup', () => {
    it('should not have memory leaks during repeated operations', async () => {
      const iterations = 100;
      const initialMemory = process.memoryUsage();

      for (let i = 0; i < iterations; i++) {
        await request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({
            email: `memory-test-${i}@fixia.test`,
          });

        // Force garbage collection every 20 iterations if available
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`Memory usage - Initial: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB, Final: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);

      // Memory increase should be reasonable (less than 50MB for 100 operations)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, 30000);
  });

  describe('Rate Limiting Performance', () => {
    it('should efficiently handle rate-limited requests', async () => {
      const startTime = Date.now();
      const rapidRequests = 20;
      const requests = [];

      for (let i = 0; i < rapidRequests; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'rate-limit-perf-test@fixia.test',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulResponses = responses.filter(r => r.status === 401).length;
      const rateLimitedResponses = responses.filter(r => r.status === 429).length;

      console.log(`Rate limiting test: ${successfulResponses} processed, ${rateLimitedResponses} rate-limited in ${totalTime}ms`);

      // Should have both processed and rate-limited responses
      expect(successfulResponses).toBeGreaterThan(0);
      expect(rateLimitedResponses).toBeGreaterThan(0);
      
      // Rate limiting should not significantly impact performance
      expect(totalTime).toBeLessThan(5000);
    }, 10000);
  });

  describe('Error Handling Performance', () => {
    it('should handle validation errors efficiently', async () => {
      const startTime = Date.now();
      const invalidRequests = 50;
      const requests = [];

      for (let i = 0; i < invalidRequests; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send({
              email: 'invalid-email', // Invalid format
              password: '123', // Too weak
              // Missing required fields
            })
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All should return validation errors
      responses.forEach(response => {
        expect(response.status).toBe(400);
      });

      console.log(`Validation error handling completed in ${totalTime}ms`);

      // Should handle errors quickly
      expect(totalTime).toBeLessThan(3000);
    }, 10000);

    it('should handle authentication errors efficiently', async () => {
      const startTime = Date.now();
      const authErrors = 30;
      const requests = [];

      for (let i = 0; i < authErrors; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer invalid-token-${i}`)
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All should return authentication errors
      responses.forEach(response => {
        expect(response.status).toBe(401);
      });

      console.log(`Authentication error handling completed in ${totalTime}ms`);

      // Should handle auth errors quickly
      expect(totalTime).toBeLessThan(2000);
    }, 10000);
  });
});