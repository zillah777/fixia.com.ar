import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpgradeToProfessionalDto } from './dto/upgrade-to-professional.dto';

export interface DashboardStats {
  total_services: number;
  active_projects: number;
  total_earnings: number;
  average_rating: number;
  review_count: number;
  profile_views: number;
  messages_count: number;
  pending_proposals: number;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
        avatar: true,
        user_type: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
      include: {
        professional_profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deleted_at: null },
      select: {
        id: true,
        name: true,
        lastName: true,
        avatar: true,
        user_type: true,
        professional_profile: {
          select: {
            bio: true,
            specialties: true,
            years_experience: true,
            level: true,
            rating: true,
            review_count: true,
            availability_status: true,
            response_time_hours: true,
            verified: true,
            province: true,
            city: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateProfile(userId: string, updateData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Separate professional profile fields from user fields
    const {
      dni,
      matricula,
      cuitCuil,
      serviceCategories,
      availability,
      province,
      city,
      isMonotributista,
      ...userFields
    } = updateData;

    // Update user fields
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: userFields,
      include: { professional_profile: true },
    });

    // If user is a professional and has professional fields to update
    if (user.user_type === 'professional' || user.user_type === 'dual') {
      if (user.professional_profile) {
        // Update existing professional profile
        const professionalData: any = {};
        if (dni !== undefined) professionalData.dni = dni;
        if (matricula !== undefined) professionalData.matricula = matricula;
        if (cuitCuil !== undefined) professionalData.cuit_cuil = cuitCuil;
        if (serviceCategories !== undefined)
          professionalData.specialties = serviceCategories;
        if (availability !== undefined)
          professionalData.availability_status = availability;
        if (province !== undefined) professionalData.province = province;
        if (city !== undefined) professionalData.city = city;
        if (isMonotributista !== undefined)
          professionalData.is_monotributista = isMonotributista;

        if (Object.keys(professionalData).length > 0) {
          await this.prisma.professionalProfile.update({
            where: { user_id: userId },
            data: professionalData,
          });
        }
      }
    }

    // Return updated user with professional profile
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        professional_profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get service stats
    const serviceStats = await this.prisma.service.aggregate({
      where: { professional_id: userId },
      _count: { id: true },
      _avg: { price: true },
    });

    // Get review stats
    const reviewStats = await this.prisma.review.aggregate({
      where: { professional_id: userId },
      _count: { id: true },
      _avg: { rating: true },
    });

    return {
      total_services: serviceStats._count.id,
      average_price: serviceStats._avg.price || 0,
      total_reviews: reviewStats._count.id,
      average_rating: reviewStats._avg.rating || 0,
      profile_completeness: this.calculateProfileCompleteness(user),
    };
  }

  private calculateProfileCompleteness(user: any): number {
    let score = 0;
    const fields = [
      user.name,
      user.lastName,
      user.phone,
      user.avatar,
      user.professional_profile?.bio,
      user.professional_profile?.specialties?.length > 0,
      user.professional_profile?.years_experience,
    ];

    fields.forEach((field) => {
      if (field) score += 1;
    });

    return Math.round((score / fields.length) * 100);
  }

  async getDashboard(userId: string): Promise<DashboardStats> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.user_type === 'professional') {
      return this.getProfessionalDashboard(userId);
    } else {
      return this.getClientDashboard(userId);
    }
  }

  private async getProfessionalDashboard(userId: string): Promise<DashboardStats> {
    // Get services stats
    this.logger.debug('[DEBUG] Getting services for userId:', userId);
    const servicesStats = await this.prisma.service.aggregate({
      where: { professional_id: userId },
      _count: { id: true },
    });
    this.logger.debug('[DEBUG] Services found:', servicesStats._count.id);
    const activeServicesStats = await this.prisma.service.aggregate({
      where: {
        professional_id: userId,
        active: true
      },
      _count: { id: true },
    });

    // Get proposals stats
    const proposalsStats = await this.prisma.proposal.aggregate({
      where: { professional_id: userId },
      _count: { id: true },
    });

    const pendingProposalsStats = await this.prisma.proposal.aggregate({
      where: {
        professional_id: userId,
        status: 'pending'
      },
      _count: { id: true },
    });

    // Get reviews stats
    const reviewsStats = await this.prisma.review.aggregate({
      where: { professional_id: userId },
      _count: { id: true },
      _avg: { rating: true },
    });

    // Get service views (mock for now)
    const profileViews = await this.prisma.serviceView.aggregate({
      where: {
        service: {
          professional_id: userId,
        },
      },
      _count: { id: true },
    });

    return {
      total_services: servicesStats._count.id,
      active_projects: activeServicesStats._count.id,
      total_earnings: 0, // Would be calculated from completed orders
      average_rating: Number(reviewsStats._avg.rating) || 0,
      review_count: reviewsStats._count.id,
      profile_views: profileViews._count.id,
      messages_count: 0, // Would be from conversations
      pending_proposals: pendingProposalsStats._count.id,
    };
  }

  private async getClientDashboard(userId: string): Promise<DashboardStats> {
    // Get projects stats
    const projectsStats = await this.prisma.project.aggregate({
      where: { client_id: userId },
      _count: { id: true },
    });

    const activeProjectsStats = await this.prisma.project.aggregate({
      where: {
        client_id: userId,
        status: 'in_progress'
      },
      _count: { id: true },
    });

    return {
      total_services: projectsStats._count.id,
      active_projects: activeProjectsStats._count.id,
      total_earnings: 0, // Total spent on projects
      average_rating: 0,
      review_count: 0,
      profile_views: 0,
      messages_count: 0,
      pending_proposals: 0,
    };
  }

  async deleteUser(userId: string, requestUserId: string) {
    // Users can only delete their own accounts
    if (userId !== requestUserId) {
      throw new ForbiddenException('You can only delete your own account');
    }

    // Soft delete user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deleted_at: new Date(),
        email: `deleted_${userId}@fixia.local`, // Prevent email conflicts
      },
    });

    return { message: 'Account deleted successfully' };
  }

  async getTopRatedProfessionals(limit: number = 10) {
    return this.prisma.user.findMany({
      where: {
        user_type: { in: ['professional', 'dual'] },
        is_hidden: false,
        deleted_at: null,
        professional_profile: {
          isNot: null,
        },
      },
      take: limit,
      include: {
        professional_profile: true,
      },
      orderBy: {
        professional_profile: {
          rating: 'desc',
        },
      },
    });
  }

  async getPublicStats() {
    const [
      totalProfessionals,
      activeProfessionals,
      totalClients,
      totalServices,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          user_type: 'professional',
          deleted_at: null,
        },
      }),
      this.prisma.user.count({
        where: {
          user_type: 'professional',
          deleted_at: null,
          professional_profile: {
            isNot: null,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          user_type: 'client',
          deleted_at: null,
        },
      }),
      this.prisma.service.count({
        where: {
          active: true,
        },
      }),
    ]);

    return {
      totalProfessionals,
      activeProfessionals,
      totalClients,
      totalServices,
      totalUsers: totalProfessionals + totalClients,
    };
  }

  async getActiveProfessionalsCount() {
    const count = await this.prisma.user.count({
      where: {
        deleted_at: null,
        OR: [
          {
            user_type: 'professional',
          },
          {
            user_type: 'dual',
            is_professional_active: true,
          },
        ],
      },
    });

    return { count };
  }


  async upgradeToProfessional(userId: string, upgradeDto: UpgradeToProfessionalDto) {
    // Get current user with subscription info
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deleted_at: null },
      include: { professional_profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check if user already has professional features
    if (user.user_type === 'professional' || user.user_type === 'dual') {
      throw new ConflictException('El usuario ya tiene una cuenta profesional');
    }

    if (user.professional_profile) {
      throw new ConflictException('El usuario ya tiene un perfil profesional');
    }

    // SECURITY: Validate professional subscription requirement
    // Professionals must have an active premium subscription to use platform
    const hasProfessionalSubscription =
      user.subscription_type === 'premium' &&
      user.subscription_status === 'active' &&
      (!user.subscription_expires_at || user.subscription_expires_at > new Date());

    if (!hasProfessionalSubscription) {
      throw new ForbiddenException(
        'Se requiere una suscripción premium activa para convertirse en profesional. ' +
        'Los profesionales necesitan un plan de pago para acceder a todas las herramientas y recibir propuestas.'
      );
    }

    // Validate required fields
    if (!upgradeDto.bio || upgradeDto.bio.trim().length === 0) {
      throw new BadRequestException('La biografía es requerida');
    }

    if (!upgradeDto.specialties || upgradeDto.specialties.length === 0) {
      throw new BadRequestException('Debe especificar al menos una especialidad');
    }

    // Upgrade user to dual type and create professional profile
    const upgradedUser = await this.prisma.$transaction(async (tx) => {
      // Update user type to 'dual' - maintains client data, adds professional capabilities
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          user_type: 'dual',
          is_professional_active: true,
          professional_since: new Date(),
        },
      });

      // Create professional profile
      const professionalProfile = await tx.professionalProfile.create({
        data: {
          user_id: userId,
          bio: upgradeDto.bio,
          specialties: upgradeDto.specialties,
          years_experience: upgradeDto.years_experience || 0,
          level: 'Nuevo',
          rating: 0.0,
          review_count: 0,
          total_earnings: 0.0,
          availability_status: 'available',
          response_time_hours: 24,
        },
      });

      return {
        user: updatedUser,
        professional_profile: professionalProfile,
      };
    });

    return {
      message: '¡Felicitaciones! Tu cuenta ha sido actualizada a Profesional DUAL',
      description: 'Ahora puedes publicar servicios y recibir propuestas, manteniendo tu capacidad de contratar servicios como cliente.',
      user: {
        id: upgradedUser.user.id,
        email: upgradedUser.user.email,
        name: upgradedUser.user.name,
        user_type: upgradedUser.user.user_type,
        is_professional_active: upgradedUser.user.is_professional_active,
        professional_since: upgradedUser.user.professional_since,
      },
      professional_profile: upgradedUser.professional_profile,
    };
  }

  async getProfessionalsByCategory(categoryName: string, limit: number = 3) {
    // Find professionals who have services in the specified category
    const services = await this.prisma.service.findMany({
      where: {
        active: true,
        category: {
          name: categoryName,
        },
      },
      include: {
        professional: {
          include: {
            professional_profile: true,
          },
        },
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit * 3, // Get more to ensure we have enough unique professionals
    });

    // Extract unique professionals with their best service in this category
    const professionalsMap = new Map();

    services.forEach(service => {
      const professionalId = service.professional.id;

      if (!professionalsMap.has(professionalId) && professionalsMap.size < limit) {
        professionalsMap.set(professionalId, {
          id: service.professional.id,
          name: service.professional.name,
          lastName: service.professional.lastName,
          email: service.professional.email,
          avatar: service.professional.avatar,
          professional_profile: service.professional.professional_profile,
          service: {
            id: service.id,
            title: service.title,
            description: service.description,
            price_min: service.price,
            currency: 'ARS',
            delivery_time_days: service.delivery_time_days,
            category: service.category.name,
          },
        });
      }
    });

    return Array.from(professionalsMap.values());
  }
}