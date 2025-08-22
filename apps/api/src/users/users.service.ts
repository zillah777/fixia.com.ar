import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DashboardStats } from '@fixia/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update user basic info
    const userUpdateData = {
      name: updateData.name,
      avatar: updateData.avatar,
      location: updateData.location,
    };

    // Remove undefined values
    Object.keys(userUpdateData).forEach(key => 
      userUpdateData[key] === undefined && delete userUpdateData[key]
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
      include: {
        professional_profile: true,
      },
    });

    // Update professional profile if user is professional and data provided
    if (existingUser.user_type === 'professional' && 
        (updateData.bio !== undefined || updateData.specialties !== undefined || updateData.whatsapp_number !== undefined)) {
      
      const professionalUpdateData = {
        bio: updateData.bio,
        specialties: updateData.specialties,
      };

      // Remove undefined values
      Object.keys(professionalUpdateData).forEach(key => 
        professionalUpdateData[key] === undefined && delete professionalUpdateData[key]
      );

      if (Object.keys(professionalUpdateData).length > 0) {
        if (existingUser.professional_profile) {
          await this.prisma.professionalProfile.update({
            where: { user_id: userId },
            data: professionalUpdateData,
          });
        } else {
          await this.prisma.professionalProfile.create({
            data: {
              user_id: userId,
              ...professionalUpdateData,
            },
          });
        }
      }

      // Update WhatsApp number in user table if provided
      if (updateData.whatsapp_number !== undefined) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { whatsapp_number: updateData.whatsapp_number },
        });
      }
    }

    // Fetch updated user data
    const finalUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true },
    });

    const { password_hash, ...userProfile } = finalUser;
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
    const servicesStats = await this.prisma.service.aggregate({
      where: { professional_id: userId },
      _count: { id: true },
    });

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
}