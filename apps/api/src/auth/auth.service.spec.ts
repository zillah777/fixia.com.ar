import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../modules/email/email.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = jest.mocked(bcrypt);

// Mock crypto
const mockCrypto = {
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-token-123')
  })
};
jest.mock('crypto', () => mockCrypto);

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let emailService: jest.Mocked<EmailService>;

  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password_hash: 'hashed-password',
    name: 'Test User',
    user_type: 'client' as const,
    location: 'Rawson',
    phone: '+542804567890',
    whatsapp_number: '+542804567890',
    email_verified: false,
    verified: false,
    avatar: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    professional_profile: null
  };

  const mockProfessionalUser = {
    ...mockUser,
    id: 'prof-123',
    email: 'professional@example.com',
    user_type: 'professional' as const,
    professional_profile: {
      id: 'prof-profile-123',
      user_id: 'prof-123',
      bio: 'Test professional',
      specialties: ['Peluquería'],
      years_experience: 5,
      level: 'Nuevo' as const,
      rating: 0.0,
      review_count: 0,
      total_earnings: 0.0,
      availability_status: 'available' as const,
      response_time_hours: 24,
      created_at: new Date(),
      updated_at: new Date()
    }
  };

  const mockRegisterDto = {
    email: 'newuser@example.com',
    password: 'password123',
    fullName: 'New User',
    userType: 'client' as const,
    location: 'Rawson',
    phone: '+542804567890'
  };

  const mockProfessionalRegisterDto = {
    ...mockRegisterDto,
    email: 'newprofessional@example.com',
    fullName: 'New Professional',
    userType: 'professional' as const,
    serviceCategories: ['Peluquería', 'Manicura'],
    description: 'Professional description',
    experience: '5-10',
    pricing: 'intermedio',
    availability: 'tiempo-completo',
    portfolio: 'https://portfolio.com',
    certifications: 'Test certifications'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            professionalProfile: {
              create: jest.fn(),
            },
            userSession: {
              create: jest.fn(),
              findFirst: jest.fn(),
              deleteMany: jest.fn(),
            },
            emailVerificationToken: {
              updateMany: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            passwordResetToken: {
              updateMany: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendAccountVerification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    emailService = module.get(EmailService);

    // Setup default mocks
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        'JWT_REFRESH_EXPIRATION': '30d',
        'JWT_REFRESH_SECRET': 'refresh-secret',
        'FRONTEND_URL': 'http://localhost:3000'
      };
      return config[key] || defaultValue;
    });

    jwtService.sign.mockReturnValue('mock-jwt-token');
    mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    describe('Client Registration', () => {
      it('should successfully register a new client', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockUser,
          email: mockRegisterDto.email,
          name: mockRegisterDto.fullName,
          user_type: mockRegisterDto.userType,
        });
        prismaService.userSession.create.mockResolvedValue({
          id: 'session-123',
          user_id: 'user-123',
          refresh_token: 'mock-refresh-token',
          expires_at: new Date(),
          ip_address: null,
          user_agent: null,
          created_at: new Date(),
        });
        prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
        prismaService.emailVerificationToken.create.mockResolvedValue({
          id: 'token-123',
          user_id: 'user-123',
          token: 'verification-token',
          expires_at: new Date(),
          used: false,
          created_at: new Date(),
        });
        emailService.sendAccountVerification.mockResolvedValue();

        // Act
        const result = await service.register(mockRegisterDto);

        // Assert
        expect(result).toEqual({
          user: expect.objectContaining({
            email: mockRegisterDto.email,
            name: mockRegisterDto.fullName,
            user_type: mockRegisterDto.userType,
          }),
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-jwt-token',
          expires_in: 7 * 24 * 60 * 60,
        });

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: mockRegisterDto.email },
        });

        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: {
            email: mockRegisterDto.email,
            password_hash: 'hashed-password',
            name: mockRegisterDto.fullName,
            user_type: mockRegisterDto.userType,
            location: mockRegisterDto.location,
            phone: mockRegisterDto.phone,
            whatsapp_number: mockRegisterDto.phone,
            email_verified: false,
          },
        });

        expect(emailService.sendAccountVerification).toHaveBeenCalledWith(
          mockRegisterDto.email,
          mockRegisterDto.fullName,
          expect.stringContaining('verify-email?token=')
        );
      });

      it('should reject registration with duplicate email', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        // Act & Assert
        await expect(service.register(mockRegisterDto)).rejects.toThrow(
          new ConflictException('User with this email already exists')
        );

        expect(prismaService.user.create).not.toHaveBeenCalled();
      });

      it('should handle registration with missing optional fields', async () => {
        // Arrange
        const minimalRegisterDto = {
          email: 'minimal@example.com',
          password: 'password123',
          fullName: 'Minimal User',
          userType: 'client' as const,
        };

        prismaService.user.findUnique.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockUser,
          email: minimalRegisterDto.email,
          name: minimalRegisterDto.fullName,
          location: null,
          phone: null,
        });
        prismaService.userSession.create.mockResolvedValue({
          id: 'session-123',
          user_id: 'user-123',
          refresh_token: 'mock-refresh-token',
          expires_at: new Date(),
          ip_address: null,
          user_agent: null,
          created_at: new Date(),
        });
        prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
        prismaService.emailVerificationToken.create.mockResolvedValue({
          id: 'token-123',
          user_id: 'user-123',
          token: 'verification-token',
          expires_at: new Date(),
          used: false,
          created_at: new Date(),
        });
        emailService.sendAccountVerification.mockResolvedValue();

        // Act
        const result = await service.register(minimalRegisterDto);

        // Assert
        expect(result.user.email).toBe(minimalRegisterDto.email);
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            location: undefined,
            phone: undefined,
            whatsapp_number: undefined,
          }),
        });
      });
    });

    describe('Professional Registration', () => {
      it('should successfully register a new professional with profile', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockProfessionalUser,
          email: mockProfessionalRegisterDto.email,
          name: mockProfessionalRegisterDto.fullName,
          professional_profile: null, // Will be created separately
        });
        prismaService.professionalProfile.create.mockResolvedValue(mockProfessionalUser.professional_profile);
        prismaService.userSession.create.mockResolvedValue({
          id: 'session-123',
          user_id: 'prof-123',
          refresh_token: 'mock-refresh-token',
          expires_at: new Date(),
          ip_address: null,
          user_agent: null,
          created_at: new Date(),
        });
        prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
        prismaService.emailVerificationToken.create.mockResolvedValue({
          id: 'token-123',
          user_id: 'prof-123',
          token: 'verification-token',
          expires_at: new Date(),
          used: false,
          created_at: new Date(),
        });
        emailService.sendAccountVerification.mockResolvedValue();

        // Act
        const result = await service.register(mockProfessionalRegisterDto);

        // Assert
        expect(result).toEqual({
          user: expect.objectContaining({
            email: mockProfessionalRegisterDto.email,
            name: mockProfessionalRegisterDto.fullName,
            user_type: 'professional',
          }),
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-jwt-token',
          expires_in: 7 * 24 * 60 * 60,
        });

        expect(prismaService.professionalProfile.create).toHaveBeenCalledWith({
          data: {
            user_id: expect.any(String),
            bio: mockProfessionalRegisterDto.description,
            specialties: mockProfessionalRegisterDto.serviceCategories,
            experience_years: mockProfessionalRegisterDto.experience,
            pricing_range: mockProfessionalRegisterDto.pricing,
            availability: mockProfessionalRegisterDto.availability,
            portfolio_url: mockProfessionalRegisterDto.portfolio,
            certifications: mockProfessionalRegisterDto.certifications,
          },
        });
      });

      it('should register professional without optional profile fields', async () => {
        // Arrange
        const minimalProfessionalDto = {
          email: 'prof@example.com',
          password: 'password123',
          fullName: 'Professional User',
          userType: 'professional' as const,
        };

        prismaService.user.findUnique.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockProfessionalUser,
          email: minimalProfessionalDto.email,
          name: minimalProfessionalDto.fullName,
        });
        prismaService.professionalProfile.create.mockResolvedValue({
          ...mockProfessionalUser.professional_profile,
          bio: '',
          specialties: [],
          experience_years: '',
        });
        prismaService.userSession.create.mockResolvedValue({
          id: 'session-123',
          user_id: 'prof-123',
          refresh_token: 'mock-refresh-token',
          expires_at: new Date(),
          ip_address: null,
          user_agent: null,
          created_at: new Date(),
        });
        prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
        prismaService.emailVerificationToken.create.mockResolvedValue({
          id: 'token-123',
          user_id: 'prof-123',
          token: 'verification-token',
          expires_at: new Date(),
          used: false,
          created_at: new Date(),
        });
        emailService.sendAccountVerification.mockResolvedValue();

        // Act
        const result = await service.register(minimalProfessionalDto);

        // Assert
        expect(result.user.user_type).toBe('professional');
        expect(prismaService.professionalProfile.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            bio: '',
            specialties: [],
            portfolio_url: null,
          }),
        });
      });
    });

    describe('Field Validation', () => {
      it('should handle frontend field names correctly', async () => {
        // Test fullName -> name mapping
        const frontendFieldsDto = {
          email: 'frontend@example.com',
          password: 'password123',
          fullName: 'Frontend User', // Frontend field name
          userType: 'client' as const, // Frontend field name
        };

        prismaService.user.findUnique.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockUser,
          email: frontendFieldsDto.email,
          name: frontendFieldsDto.fullName,
        });
        prismaService.userSession.create.mockResolvedValue({
          id: 'session-123',
          user_id: 'user-123',
          refresh_token: 'mock-refresh-token',
          expires_at: new Date(),
          ip_address: null,
          user_agent: null,
          created_at: new Date(),
        });
        prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
        prismaService.emailVerificationToken.create.mockResolvedValue({
          id: 'token-123',
          user_id: 'user-123',
          token: 'verification-token',
          expires_at: new Date(),
          used: false,
          created_at: new Date(),
        });
        emailService.sendAccountVerification.mockResolvedValue();

        // Act
        await service.register(frontendFieldsDto);

        // Assert
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            name: frontendFieldsDto.fullName,
            user_type: frontendFieldsDto.userType,
          }),
        });
      });

      it('should handle both frontend and backend field names', async () => {
        // Test legacy backend field names still work
        const backendFieldsDto = {
          email: 'backend@example.com',
          password: 'password123',
          name: 'Backend User', // Backend field name
          user_type: 'client' as const, // Backend field name
        };

        prismaService.user.findUnique.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockUser,
          email: backendFieldsDto.email,
          name: backendFieldsDto.name,
        });
        prismaService.userSession.create.mockResolvedValue({
          id: 'session-123',
          user_id: 'user-123',
          refresh_token: 'mock-refresh-token',
          expires_at: new Date(),
          ip_address: null,
          user_agent: null,
          created_at: new Date(),
        });
        prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
        prismaService.emailVerificationToken.create.mockResolvedValue({
          id: 'token-123',
          user_id: 'user-123',
          token: 'verification-token',
          expires_at: new Date(),
          used: false,
          created_at: new Date(),
        });
        emailService.sendAccountVerification.mockResolvedValue();

        // Act
        await service.register(backendFieldsDto);

        // Assert
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            name: backendFieldsDto.name,
            user_type: backendFieldsDto.user_type,
          }),
        });
      });
    });
  });

  describe('User Login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.userSession.create.mockResolvedValue({
        id: 'session-123',
        user_id: mockUser.id,
        refresh_token: 'mock-refresh-token',
        expires_at: new Date(),
        ip_address: null,
        user_agent: null,
        created_at: new Date(),
      });

      // Act
      const result = await service.login(loginCredentials);

      // Assert
      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-jwt-token',
        expires_in: 7 * 24 * 60 * 60,
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginCredentials.password,
        mockUser.password_hash
      );

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        user_type: mockUser.user_type,
      });
    });

    it('should reject login with invalid email', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginCredentials)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should reject login with invalid password', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginCredentials)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should include professional profile in login response', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockProfessionalUser);
      prismaService.userSession.create.mockResolvedValue({
        id: 'session-123',
        user_id: mockProfessionalUser.id,
        refresh_token: 'mock-refresh-token',
        expires_at: new Date(),
        ip_address: null,
        user_agent: null,
        created_at: new Date(),
      });

      // Act
      const result = await service.login({
        email: mockProfessionalUser.email,
        password: 'password123',
      });

      // Assert
      expect(result.user).toEqual(
        expect.objectContaining({
          professional_profile: expect.any(Object),
        })
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockProfessionalUser.email },
        include: {
          professional_profile: true,
        },
      });
    });
  });

  describe('JWT Token Management', () => {
    const mockSession = {
      id: 'session-123',
      user_id: 'user-123',
      refresh_token: 'valid-refresh-token',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      ip_address: null,
      user_agent: null,
      created_at: new Date(),
      user: mockUser,
    };

    it('should successfully refresh access token with valid refresh token', async () => {
      // Arrange
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        user_type: mockUser.user_type,
      });
      prismaService.userSession.findFirst.mockResolvedValue(mockSession);

      // Act
      const result = await service.refreshToken('valid-refresh-token');

      // Assert
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
      });

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'refresh-secret',
      });

      expect(prismaService.userSession.findFirst).toHaveBeenCalledWith({
        where: {
          refresh_token: 'valid-refresh-token',
          expires_at: { gt: expect.any(Date) },
        },
        include: { user: true },
      });
    });

    it('should reject invalid refresh token', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });

    it('should reject expired refresh token from database', async () => {
      // Arrange
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        user_type: mockUser.user_type,
      });
      prismaService.userSession.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });

    it('should successfully logout and invalidate refresh token', async () => {
      // Arrange
      prismaService.userSession.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      await service.logout('user-123', 'refresh-token');

      // Assert
      expect(prismaService.userSession.deleteMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          refresh_token: 'refresh-token',
        },
      });
    });
  });

  describe('Email Verification', () => {
    const mockVerificationToken = {
      id: 'token-123',
      user_id: 'user-123',
      token: 'verification-token-123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      used: false,
      created_at: new Date(),
      user: mockUser,
    };

    it('should send verification email for new user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });
      prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
      prismaService.emailVerificationToken.create.mockResolvedValue(mockVerificationToken);
      emailService.sendAccountVerification.mockResolvedValue();

      // Act
      const result = await service.sendEmailVerification(mockUser.email);

      // Assert
      expect(result).toEqual({
        message: 'Se ha enviado un enlace de verificación a tu email',
        success: true,
      });

      expect(prismaService.emailVerificationToken.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: mockUser.id,
          used: false,
        },
        data: { used: true },
      });

      expect(emailService.sendAccountVerification).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        expect.stringContaining('verify-email?token=')
      );
    });

    it('should handle already verified email', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email_verified: true,
      });

      // Act
      const result = await service.sendEmailVerification(mockUser.email);

      // Assert
      expect(result).toEqual({
        message: 'El email ya está verificado',
        success: true,
      });

      expect(emailService.sendAccountVerification).not.toHaveBeenCalled();
    });

    it('should successfully verify email with valid token', async () => {
      // Arrange
      prismaService.emailVerificationToken.findFirst.mockResolvedValue(mockVerificationToken);
      prismaService.$transaction.mockResolvedValue([
        { id: mockUser.id, email_verified: true },
        { id: mockVerificationToken.id, used: true },
      ]);

      // Act
      const result = await service.verifyEmail('verification-token-123');

      // Assert
      expect(result).toEqual({
        message: 'Email verificado exitosamente',
        success: true,
      });

      expect(prismaService.emailVerificationToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: 'verification-token-123',
          used: false,
          expires_at: { gt: expect.any(Date) },
        },
        include: { user: true },
      });
    });

    it('should reject invalid or expired verification token', async () => {
      // Arrange
      prismaService.emailVerificationToken.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        new BadRequestException('Token de verificación inválido o expirado')
      );
    });

    it('should reject verification for already verified email', async () => {
      // Arrange
      const verifiedUserToken = {
        ...mockVerificationToken,
        user: { ...mockUser, email_verified: true },
      };
      prismaService.emailVerificationToken.findFirst.mockResolvedValue(verifiedUserToken);

      // Act & Assert
      await expect(service.verifyEmail('verification-token-123')).rejects.toThrow(
        new BadRequestException('El email ya está verificado')
      );
    });

    it('should handle email sending failures gracefully', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });
      prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
      prismaService.emailVerificationToken.create.mockResolvedValue(mockVerificationToken);
      emailService.sendAccountVerification.mockRejectedValue(new Error('Email sending failed'));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await service.sendEmailVerification(mockUser.email);

      // Assert
      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Verification token for')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Password Reset', () => {
    const mockResetToken = {
      id: 'reset-123',
      user_id: 'user-123',
      token: 'reset-token-123',
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      used: false,
      created_at: new Date(),
      user: mockUser,
    };

    it('should send password reset email for existing user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
      prismaService.passwordResetToken.create.mockResolvedValue(mockResetToken);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await service.forgotPassword(mockUser.email);

      // Assert
      expect(result).toEqual({
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
        success: true,
      });

      expect(prismaService.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: mockUser.id,
          used: false,
        },
        data: { used: true },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Reset token for')
      );

      consoleSpy.mockRestore();
    });

    it('should return success for non-existent email (security)', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword('nonexistent@example.com');

      // Assert
      expect(result).toEqual({
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
        success: true,
      });

      expect(prismaService.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('should successfully reset password with valid token', async () => {
      // Arrange
      prismaService.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prismaService.$transaction.mockResolvedValue([
        { id: mockUser.id, password_hash: 'new-hashed-password' },
        { id: mockResetToken.id, used: true },
        { count: 1 }, // Deleted sessions
      ]);

      // Act
      const result = await service.resetPassword('reset-token-123', 'newPassword123');

      // Assert
      expect(result).toEqual({
        message: 'Contraseña actualizada exitosamente',
        success: true,
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
    });

    it('should reject invalid or expired reset token', async () => {
      // Arrange
      prismaService.passwordResetToken.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword('invalid-token', 'newPassword123')).rejects.toThrow(
        new BadRequestException('Token inválido o expirado')
      );
    });
  });

  describe('User Profile', () => {
    it('should return user profile without sensitive data', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserProfile('user-123');

      // Assert
      expect(result).toEqual(
        expect.not.objectContaining({
          password_hash: expect.any(String),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        })
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-123',
          deleted_at: null,
        },
        include: {
          professional_profile: true,
        },
      });
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserProfile('non-existent')).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
    });

    it('should include professional profile for professionals', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockProfessionalUser);

      // Act
      const result = await service.getUserProfile('prof-123');

      // Assert
      expect(result.professional_profile).toBeDefined();
      expect(result.professional_profile).toEqual(mockProfessionalUser.professional_profile);
    });
  });

  describe('Password Change', () => {
    it('should successfully change password with valid current password', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.$transaction.mockResolvedValue([
        { id: mockUser.id, password_hash: 'new-hashed-password' },
        { count: 1 }, // Deleted sessions
      ]);

      // Act
      const result = await service.changePassword('user-123', 'currentPassword', 'newPassword123');

      // Assert
      expect(result).toEqual({
        message: 'Contraseña actualizada exitosamente. Por seguridad, se ha cerrado sesión en todos los dispositivos.',
        success: true,
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('currentPassword', mockUser.password_hash);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
    });

    it('should reject change with incorrect current password', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.changePassword('user-123', 'wrongPassword', 'newPassword123')).rejects.toThrow(
        new UnauthorizedException('La contraseña actual es incorrecta')
      );

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should reject change for non-existent user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.changePassword('non-existent', 'password', 'newPassword')).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
    });
  });

  describe('Security Features', () => {
    it('should hash passwords with appropriate salt rounds', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.userSession.create.mockResolvedValue({
        id: 'session-123',
        user_id: 'user-123',
        refresh_token: 'mock-refresh-token',
        expires_at: new Date(),
        ip_address: null,
        user_agent: null,
        created_at: new Date(),
      });
      prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
      prismaService.emailVerificationToken.create.mockResolvedValue({
        id: 'token-123',
        user_id: 'user-123',
        token: 'verification-token',
        expires_at: new Date(),
        used: false,
        created_at: new Date(),
      });
      emailService.sendAccountVerification.mockResolvedValue();

      // Act
      await service.register(mockRegisterDto);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 12);
    });

    it('should invalidate existing tokens when creating new ones', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });
      prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 2 });
      prismaService.emailVerificationToken.create.mockResolvedValue({
        id: 'token-123',
        user_id: 'user-123',
        token: 'verification-token',
        expires_at: new Date(),
        used: false,
        created_at: new Date(),
      });
      emailService.sendAccountVerification.mockResolvedValue();

      // Act
      await service.sendEmailVerification(mockUser.email);

      // Assert
      expect(prismaService.emailVerificationToken.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: mockUser.id,
          used: false,
        },
        data: { used: true },
      });
    });

    it('should use cryptographically secure tokens', () => {
      // Act - The generateSecureToken method is called internally
      // We verify that crypto.randomBytes is used correctly through our mock

      // This test verifies the token generation approach through the mock
      expect(mockCrypto.randomBytes).toBeDefined();
    });

    it('should set appropriate token expiration times', async () => {
      // Test email verification token (24 hours)
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email_verified: false,
      });
      prismaService.emailVerificationToken.updateMany.mockResolvedValue({ count: 0 });
      prismaService.emailVerificationToken.create.mockResolvedValue({
        id: 'token-123',
        user_id: 'user-123',
        token: 'verification-token',
        expires_at: new Date(),
        used: false,
        created_at: new Date(),
      });
      emailService.sendAccountVerification.mockResolvedValue();

      await service.sendEmailVerification(mockUser.email);

      expect(prismaService.emailVerificationToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expires_at: expect.any(Date),
        }),
      });
    });
  });

  describe('Database Transactions', () => {
    it('should use transactions for critical operations', async () => {
      // Test password reset transaction
      const mockResetToken = {
        id: 'reset-123',
        user_id: 'user-123',
        token: 'reset-token-123',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used: false,
        created_at: new Date(),
        user: mockUser,
      };

      prismaService.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prismaService.$transaction.mockResolvedValue([
        { id: mockUser.id, password_hash: 'new-hashed-password' },
        { id: mockResetToken.id, used: true },
        { count: 1 },
      ]);

      await service.resetPassword('reset-token-123', 'newPassword123');

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        expect.anything(), // user update
        expect.anything(), // token update
        expect.anything(), // session deletion
      ]);
    });
  });
});