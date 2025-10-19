import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getAllFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { user_id: userId },
      include: {
        service: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
                icon: true,
              },
            },
            professional: {
              select: {
                id: true,
                name: true,
                avatar: true,
                professional_profile: {
                  select: {
                    rating: true,
                  },
                },
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            professional_profile: {
              select: {
                bio: true,
                rating: true,
                review_count: true,
                specialties: true,
                years_experience: true,
              },
            },
            services: {
              where: { active: true },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const services = favorites
      .filter((f) => f.service_id)
      .map((f) => ({
        id: f.id,
        service: {
          id: f.service.id,
          title: f.service.title,
          description: f.service.description,
          price_from: f.service.price,
          price_to: f.service.price,
          currency: 'ARS',
          category: f.service.category,
          images: f.service.gallery || [],
          is_active: f.service.active,
          professional: {
            id: f.service.professional.id,
            name: f.service.professional.name,
            avatar: f.service.professional.avatar,
            rating: f.service.professional.professional_profile?.rating || 0,
          },
          reviews_count: 0, // TODO: Add actual count
        },
        added_at: f.created_at.toISOString(),
      }));

    const professionals = favorites
      .filter((f) => f.professional_id && !f.service_id)
      .map((f) => ({
        id: f.id,
        professional: {
          id: f.professional.id,
          name: f.professional.name,
          avatar: f.professional.avatar,
          bio: f.professional.professional_profile?.bio || '',
          location: f.professional.location || '',
          rating: f.professional.professional_profile?.rating || 0,
          specialties: f.professional.professional_profile?.specialties || [],
          years_experience: f.professional.professional_profile?.years_experience || 0,
          services_count: f.professional.services?.length || 0,
          reviews_count: f.professional.professional_profile?.review_count || 0,
        },
        added_at: f.created_at.toISOString(),
      }));

    return { services, professionals };
  }

  async getFavoriteServices(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        user_id: userId,
        service_id: { not: null },
      },
      include: {
        service: {
          include: {
            category: true,
            professional: {
              select: {
                id: true,
                name: true,
                avatar: true,
                professional_profile: {
                  select: { rating: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return favorites.map((f) => ({
      id: f.id,
      service: {
        id: f.service.id,
        title: f.service.title,
        description: f.service.description,
        price_from: f.service.price,
        price_to: f.service.price,
        currency: 'ARS',
        category: f.service.category,
        images: f.service.gallery || [],
        is_active: f.service.active,
        professional: {
          id: f.service.professional.id,
          name: f.service.professional.name,
          avatar: f.service.professional.avatar,
          rating: f.service.professional.professional_profile?.rating || 0,
        },
        reviews_count: 0,
      },
      added_at: f.created_at.toISOString(),
    }));
  }

  async getFavoriteProfessionals(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        user_id: userId,
        professional_id: { not: null },
        service_id: null,
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            professional_profile: {
              select: {
                bio: true,
                rating: true,
                review_count: true,
                specialties: true,
                years_experience: true,
              },
            },
            services: {
              where: { active: true },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return favorites.map((f) => ({
      id: f.id,
      professional: {
        id: f.professional.id,
        name: f.professional.name,
        avatar: f.professional.avatar,
        bio: f.professional.professional_profile?.bio || '',
        location: f.professional.location || '',
        rating: f.professional.professional_profile?.rating || 0,
        specialties: f.professional.professional_profile?.specialties || [],
        years_experience: f.professional.professional_profile?.years_experience || 0,
        services_count: f.professional.services?.length || 0,
        reviews_count: f.professional.professional_profile?.review_count || 0,
      },
      added_at: f.created_at.toISOString(),
    }));
  }

  async addServiceToFavorites(userId: string, serviceId: string) {
    // Check if already exists
    const existing = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        service_id: serviceId,
      },
    });

    if (existing) {
      throw new ConflictException('Service already in favorites');
    }

    // Verify service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        user_id: userId,
        service_id: serviceId,
        professional_id: service.professional_id,
      },
    });

    return {
      success: true,
      favorite: {
        id: favorite.id,
        added_at: favorite.created_at.toISOString(),
      },
    };
  }

  async removeServiceFromFavorites(userId: string, serviceId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        service_id: serviceId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return {
      success: true,
      message: 'Service removed from favorites',
    };
  }

  async addProfessionalToFavorites(userId: string, professionalId: string) {
    // Check if already exists
    const existing = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        professional_id: professionalId,
        service_id: null,
      },
    });

    if (existing) {
      throw new ConflictException('Professional already in favorites');
    }

    // Verify professional exists
    const professional = await this.prisma.user.findFirst({
      where: {
        id: professionalId,
        user_type: 'professional',
      },
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        user_id: userId,
        professional_id: professionalId,
      },
    });

    return {
      success: true,
      favorite: {
        id: favorite.id,
        added_at: favorite.created_at.toISOString(),
      },
    };
  }

  async removeProfessionalFromFavorites(userId: string, professionalId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        professional_id: professionalId,
        service_id: null,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return {
      success: true,
      message: 'Professional removed from favorites',
    };
  }

  async isServiceFavorite(userId: string, serviceId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        service_id: serviceId,
      },
      select: { id: true },
    });

    return {
      is_favorite: !!favorite,
      favorite_id: favorite?.id,
    };
  }
}
