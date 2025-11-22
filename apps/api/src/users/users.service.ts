import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpgradeToProfessionalDto } from './dto/upgrade-to-professional.dto';
import { DashboardStats } from '@fixia/types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) { }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        deleted_at: null
      },
      include: {
        professional_profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { password_hash, ...userProfile } = user;
    return userProfile;
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        verified: true,
        user_type: true,
        created_at: true,
        professional_profile: {
          select: {
            bio: true,
            specialties: true,
            rating: true,
            review_count: true,
            level: true,
            years_experience: true,
            availability_status: true,
            response_time_hours: true,
          },
        },
        services: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            main_image: true,
            view_count: true,
            created_at: true,
            category: {
              select: {
                name: true,
                slug: true,
                icon: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 6,
        },
        reviews_received: {
          select: {
            id: true,
            rating: true,
            comment: true,
            created_at: true,
            reviewer: {
              select: {
                name: true,
                avatar: true,
                verified: true,
              },
            },
            service: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    // First check user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Log update attempt
    this.logger.debug(`[updateProfile] Updating profile for user: ${userId}`, {
      fieldsToUpdate: Object.keys(updateData).filter(k => updateData[k] !== undefined)
    });

    // Build complete user update data with all supported fields
    const userUpdateData: any = {
      // Basic fields
      name: updateData.name,
      avatar: updateData.avatar,
      location: updateData.location,
      bio: updateData.bio,
      phone: updateData.phone,
      whatsapp_number: updateData.whatsapp_number,

      // Social networks
      social_linkedin: updateData.social_linkedin,
      social_twitter: updateData.social_twitter,
      social_facebook: updateData.social_facebook,
      social_instagram: updateData.social_instagram,

      // Notification preferences
      notifications_messages: updateData.notifications_messages,
      notifications_orders: updateData.notifications_orders,
      notifications_projects: updateData.notifications_projects,
      notifications_newsletter: updateData.notifications_newsletter,

      // Settings
      timezone: updateData.timezone,
    };

    // Remove undefined values to only update provided fields
    Object.keys(userUpdateData).forEach(key =>
      userUpdateData[key] === undefined && delete userUpdateData[key]
    );

    // ATOMIC TRANSACTION: Update user and professional profile together
    // If either fails, both rollback. Prevents data inconsistency.
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user record with all provided fields
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
        include: {
          professional_profile: true,
        },
      });

      // Update professional profile if user is professional/dual and specialties provided
      if ((existingUser.user_type === 'professional' || existingUser.user_type === 'dual') && updateData.specialties !== undefined) {
        const professionalUpdateData = {
          specialties: updateData.specialties,
        };

        if (existingUser.professional_profile) {
          await tx.professionalProfile.update({
            where: { user_id: userId },
            data: professionalUpdateData,
          });
        } else {
          await tx.professionalProfile.create({
            data: {
              user_id: userId,
              ...professionalUpdateData,
            },
          });
        }
      }

      return updatedUser;
    });

    console.log(`[updateProfile] Profile updated successfully for user: ${userId}`);

    const { password_hash, ...userProfile } = result;
    return userProfile;
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
        'Se requiere una suscripci├│n premium activa para convertirse en profesional. ' +
        'Los profesionales necesitan un plan de pago para acceder a todas las herramientas y recibir propuestas.'
      );
    }

    // Validate required fields
    if (!upgradeDto.bio || upgradeDto.bio.trim().length === 0) {
      throw new BadRequestException('La biograf├¡a es requerida');
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
      message: '┬íFelicitaciones! Tu cuenta ha sido actualizada a Profesional DUAL',
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
