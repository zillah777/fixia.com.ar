import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Authentication E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let verificationToken: string;
  let resetToken: string;

  // Test user data
  const testClient = {
    email: 'e2e-client@fixia.test',
    password: 'TestPassword123!',
    fullName: 'E2E Test Client',
    userType: 'client',
    location: 'Rawson',
    phone: '+542804567890',
  };

  const testProfessional = {
    email: 'e2e-professional@fixia.test',
    password: 'TestPassword123!',
    fullName: 'E2E Test Professional',
    userType: 'professional',
    location: 'Rawson',
    phone: '+542804567891',
    serviceCategories: ['Peluquería', 'Manicura'],
    description: 'Especialista en cortes modernos y tratamientos capilares',
    experience: '5-10',
    pricing: 'intermedio',
    availability: 'tiempo-completo',
    portfolio: 'https://mi-portfolio.com',
    certifications: 'Técnico en Peluquería, Certificado ANMAT',
  };

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

    // Clean up test data before starting
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data after completion
    await cleanupTestData();
    await app.close();
  });

  async function cleanupTestData() {
    // Delete in correct order to respect foreign key constraints
    await prismaService.userSession.deleteMany({
      where: {
        user: {
          email: {
            in: [testClient.email, testProfessional.email],
          },
        },
      },
    });

    await prismaService.emailVerificationToken.deleteMany({
      where: {
        user: {
          email: {
            in: [testClient.email, testProfessional.email],
          },
        },
      },
    });

    await prismaService.passwordResetToken.deleteMany({
      where: {
        user: {
          email: {
            in: [testClient.email, testProfessional.email],
          },
        },
      },
    });

    await prismaService.professionalProfile.deleteMany({
      where: {
        user: {
          email: {
            in: [testClient.email, testProfessional.email],
          },
        },
      },
    });

    await prismaService.user.deleteMany({
      where: {
        email: {
          in: [testClient.email, testProfessional.email],
        },
      },
    });
  }

  describe('Client Registration Flow', () => {
    it('should successfully register a new client', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testClient)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            user: {
              email: testClient.email,
              name: testClient.fullName,
              user_type: testClient.userType,
              location: testClient.location,
              phone: testClient.phone,
              email_verified: false,
            },
            access_token: expect.any(String),
            refresh_token: expect.any(String),
            expires_in: expect.any(Number),
          });

          // Store tokens for later tests
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;

          // Verify no professional profile is created
          expect(res.body.user.professional_profile).toBeNull();
        });
    });

    it('should reject duplicate email registration', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testClient)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should validate required fields', () => {
      const incompleteData = {
        email: 'incomplete@test.com',
        // Missing password, fullName, userType
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });

    it('should validate email format', () => {
      const invalidEmailData = {
        ...testClient,
        email: 'invalid-email-format',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidEmailData)
        .expect(400);
    });

    it('should validate password strength', () => {
      const weakPasswordData = {
        ...testClient,
        email: 'weak-password@test.com',
        password: '123', // Too weak
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400);
    });
  });

  describe('Professional Registration Flow', () => {
    it('should successfully register a new professional with profile', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testProfessional)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            user: {
              email: testProfessional.email,
              name: testProfessional.fullName,
              user_type: testProfessional.userType,
              location: testProfessional.location,
              phone: testProfessional.phone,
              email_verified: false,
            },
            access_token: expect.any(String),
            refresh_token: expect.any(String),
            expires_in: expect.any(Number),
          });
        });
    });

    it('should create professional profile with service details', async () => {
      // Get the user to verify professional profile creation
      const user = await prismaService.user.findUnique({
        where: { email: testProfessional.email },
        include: { professional_profile: true },
      });

      expect(user).toBeDefined();
      expect(user.professional_profile).toMatchObject({
        bio: testProfessional.description,
        specialties: testProfessional.serviceCategories,
        experience_years: testProfessional.experience,
        pricing_range: testProfessional.pricing,
        availability: testProfessional.availability,
        portfolio_url: testProfessional.portfolio,
        certifications: testProfessional.certifications,
      });
    });
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testClient.email,
          password: testClient.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            user: {
              email: testClient.email,
              name: testClient.fullName,
            },
            access_token: expect.any(String),
            refresh_token: expect.any(String),
            expires_in: expect.any(Number),
          });

          // Update tokens for subsequent tests
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: testClient.password,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testClient.email,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should include professional profile for professionals', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testProfessional.email,
          password: testProfessional.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user).toHaveProperty('professional_profile');
          expect(res.body.user.professional_profile).toMatchObject({
            bio: testProfessional.description,
            specialties: testProfessional.serviceCategories,
          });
        });
    });
  });

  describe('JWT Token Management', () => {
    it('should successfully refresh access token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          
          // Update access token for subsequent tests
          accessToken = res.body.access_token;
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: 'invalid-refresh-token',
        })
        .expect(401);
    });

    it('should access protected profile endpoint with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            email: testClient.email,
            name: testClient.fullName,
            user_type: testClient.userType,
          });
          
          // Verify no sensitive data is returned
          expect(res.body).not.toHaveProperty('password_hash');
        });
    });

    it('should reject access to protected endpoint without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject access to protected endpoint with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should successfully logout and invalidate refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refresh_token: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Logout successful');
        });
    });

    it('should reject refresh token after logout', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(401);
    });
  });

  describe('Email Verification Flow', () => {
    beforeAll(async () => {
      // Re-login to get fresh tokens after logout test
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testClient.email,
          password: testClient.password,
        });
      
      accessToken = loginResponse.body.access_token;
      refreshToken = loginResponse.body.refresh_token;
    });

    it('should send verification email', () => {
      return request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: testClient.email,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            message: 'Se ha enviado un enlace de verificación a tu email',
            success: true,
          });
        });
    });

    it('should retrieve verification token from database', async () => {
      const user = await prismaService.user.findUnique({
        where: { email: testClient.email },
      });

      const tokenRecord = await prismaService.emailVerificationToken.findFirst({
        where: {
          user_id: user.id,
          used: false,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      expect(tokenRecord).toBeDefined();
      verificationToken = tokenRecord.token;
    });

    it('should successfully verify email with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          token: verificationToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            message: 'Email verificado exitosamente',
            success: true,
          });
        });
    });

    it('should update email_verified status in database', async () => {
      const user = await prismaService.user.findUnique({
        where: { email: testClient.email },
      });

      expect(user.email_verified).toBe(true);
    });

    it('should reject already used verification token', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          token: verificationToken,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('ya está verificado');
        });
    });

    it('should reject invalid verification token', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          token: 'invalid-verification-token',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('inválido o expirado');
        });
    });
  });

  describe('Password Reset Flow', () => {
    it('should send password reset email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: testClient.email,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            message: 'Si el email existe, se ha enviado un enlace de recuperación',
            success: true,
          });
        });
    });

    it('should retrieve reset token from database', async () => {
      const user = await prismaService.user.findUnique({
        where: { email: testClient.email },
      });

      const tokenRecord = await prismaService.passwordResetToken.findFirst({
        where: {
          user_id: user.id,
          used: false,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      expect(tokenRecord).toBeDefined();
      resetToken = tokenRecord.token;
    });

    it('should successfully reset password with valid token', () => {
      const newPassword = 'NewTestPassword123!';
      
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: newPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            message: 'Contraseña actualizada exitosamente',
            success: true,
          });
        });
    });

    it('should allow login with new password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testClient.email,
          password: 'NewTestPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          accessToken = res.body.access_token;
        });
    });

    it('should reject login with old password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testClient.email,
          password: testClient.password, // Old password
        })
        .expect(401);
    });

    it('should reject already used reset token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: 'AnotherNewPassword123!',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('inválido o expirado');
        });
    });

    it('should return success for non-existent email (security)', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Password Change Flow', () => {
    it('should successfully change password for authenticated user', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: 'NewTestPassword123!',
          new_password: 'FinalTestPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            message: expect.stringContaining('Contraseña actualizada exitosamente'),
            success: true,
          });
        });
    });

    it('should allow login with newest password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testClient.email,
          password: 'FinalTestPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('should reject password change with incorrect current password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: 'WrongCurrentPassword',
          new_password: 'SomeNewPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('incorrecta');
        });
    });

    it('should require authentication for password change', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          current_password: 'FinalTestPassword123!',
          new_password: 'SomeNewPassword123!',
        })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      const loginAttempts = [];
      
      // Make multiple login attempts rapidly
      for (let i = 0; i < 6; i++) {
        loginAttempts.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'rate-limit-test@test.com',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(loginAttempts);
      
      // Should have some 429 (Too Many Requests) responses
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000); // Extended timeout for rate limiting test

    it('should apply rate limiting to registration endpoint', async () => {
      const registerAttempts = [];
      
      // Make multiple registration attempts rapidly
      for (let i = 0; i < 4; i++) {
        registerAttempts.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send({
              email: `rate-limit-${i}@test.com`,
              password: 'TestPassword123!',
              fullName: `Rate Limit Test ${i}`,
              userType: 'client',
            })
        );
      }

      const responses = await Promise.all(registerAttempts);
      
      // Should have some 429 (Too Many Requests) responses
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000); // Extended timeout for rate limiting test
  });

  describe('Database Integration', () => {
    it('should properly store user data in database', async () => {
      const user = await prismaService.user.findUnique({
        where: { email: testClient.email },
        include: { professional_profile: true },
      });

      expect(user).toMatchObject({
        email: testClient.email,
        name: testClient.fullName,
        user_type: testClient.userType,
        location: testClient.location,
        phone: testClient.phone,
        email_verified: true, // Should be true after verification test
      });

      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(testClient.password); // Should be hashed
    });

    it('should properly store professional profile data', async () => {
      const user = await prismaService.user.findUnique({
        where: { email: testProfessional.email },
        include: { professional_profile: true },
      });

      expect(user.professional_profile).toMatchObject({
        bio: testProfessional.description,
        specialties: testProfessional.serviceCategories,
        experience_years: testProfessional.experience,
        pricing_range: testProfessional.pricing,
        availability: testProfessional.availability,
        portfolio_url: testProfessional.portfolio,
        certifications: testProfessional.certifications,
      });
    });

    it('should maintain referential integrity', async () => {
      const user = await prismaService.user.findUnique({
        where: { email: testClient.email },
      });

      // Check that user sessions reference the correct user
      const sessions = await prismaService.userSession.findMany({
        where: { user_id: user.id },
      });

      sessions.forEach(session => {
        expect(session.user_id).toBe(user.id);
      });

      // Check that tokens reference the correct user
      const emailTokens = await prismaService.emailVerificationToken.findMany({
        where: { user_id: user.id },
      });

      emailTokens.forEach(token => {
        expect(token.user_id).toBe(user.id);
      });
    });
  });
});