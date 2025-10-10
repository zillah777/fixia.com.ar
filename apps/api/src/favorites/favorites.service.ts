import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const [services, professionals] = await Promise.all([
      this.getFavoriteServices(userId),
      this.getFavoriteProfessionals(userId),
    ]);

    return {
      services,
      professionals,
    };
  }

  async getFavoriteServices(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        user_id: userId,
        favorite_type: 'service',
      },
      include: {
        service: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                average_rating: true,
              },
            },
            category: {
              select: {
                name: true,
                slug: true,
                icon: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      service: {
        id: fav.service.id,
        title: fav.service.title,
        description: fav.service.description,
        price_from: fav.service.price_from,
        price_to: fav.service.price_to,
        currency: fav.service.currency,
        category: fav.service.category,
        images: fav.service.images,
        is_active: fav.service.is_active,
        professional: {
          id: fav.service.user.id,
          name: fav.service.user.name,
          avatar: fav.service.user.avatar,
          rating: fav.service.user.average_rating,
        },
        reviews_count: fav.service._count.reviews,
      },
      added_at: fav.created_at,
    }));
  }

  async getFavoriteProfessionals(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        user_id: userId,
        favorite_type: 'professional',
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            location: true,
            average_rating: true,
            professional_profile: {
              select: {
                specialties: true,
                years_experience: true,
              },
            },
            _count: {
              select: {
                services: true,
                reviews_received: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      professional: {
        id: fav.professional.id,
        name: fav.professional.name,
        avatar: fav.professional.avatar,
        bio: fav.professional.bio,
        location: fav.professional.location,
        rating: fav.professional.average_rating,
        specialties: fav.professional.professional_profile?.specialties || [],
        years_experience: fav.professional.professional_profile?.years_experience,
        services_count: fav.professional._count.services,
        reviews_count: fav.professional._count.reviews_received,
      },
      added_at: fav.created_at,
    }));
  }

  async addServiceToFavorites(userId: string, serviceId: string) {
    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if already in favorites
    const existing = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        service_id: serviceId,
        favorite_type: 'service',
      },
    });

    if (existing) {
      throw new BadRequestException('Service is already in favorites');
    }

    // Add to favorites
    const favorite = await this.prisma.favorite.create({
      data: {
        user_id: userId,
        service_id: serviceId,
        favorite_type: 'service',
      },
    });

    return {
      success: true,
      favorite: {
        id: favorite.id,
        added_at: favorite.created_at,
      },
    };
  }

  async removeServiceFromFavorites(userId: string, serviceId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        service_id: serviceId,
        favorite_type: 'service',
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
    // Check if professional exists
    const professional = await this.prisma.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional || professional.user_type !== 'professional') {
      throw new NotFoundException('Professional not found');
    }

    // Check if already in favorites
    const existing = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        professional_id: professionalId,
        favorite_type: 'professional',
      },
    });

    if (existing) {
      throw new BadRequestException('Professional is already in favorites');
    }

    // Add to favorites
    const favorite = await this.prisma.favorite.create({
      data: {
        user_id: userId,
        professional_id: professionalId,
        favorite_type: 'professional',
      },
    });

    return {
      success: true,
      favorite: {
        id: favorite.id,
        added_at: favorite.created_at,
      },
    };
  }

  async removeProfessionalFromFavorites(userId: string, professionalId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        professional_id: professionalId,
        favorite_type: 'professional',
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
        favorite_type: 'service',
      },
    });

    return {
      is_favorite: !!favorite,
      favorite_id: favorite?.id,
    };
  }
}
