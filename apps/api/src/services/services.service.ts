import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { PaginatedResponse } from '@fixia/types';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createServiceDto: CreateServiceDto) {
    // Verify user is professional and get subscription info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        user_type: true,
        subscription_type: true,
      },
    });

    if (!user || user.user_type !== 'professional') {
      throw new ForbiddenException('Only professionals can create services');
    }

    // Check service limit for Basic users (5 services max)
    if (user.subscription_type === 'basic') {
      const activeServicesCount = await this.prisma.service.count({
        where: {
          professional_id: userId,
          active: true,
        },
      });

      if (activeServicesCount >= 5) {
        throw new ForbiddenException(
          'Has alcanzado el límite de 5 servicios para el plan Basic. Actualiza a Premium para publicar servicios ilimitados.'
        );
      }
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createServiceDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const service = await this.prisma.service.create({
      data: {
        professional_id: userId,
        category_id: createServiceDto.category_id,
        title: createServiceDto.title,
        description: createServiceDto.description,
        price: createServiceDto.price,
        main_image: createServiceDto.main_image,
        gallery: createServiceDto.gallery || [],
        tags: createServiceDto.tags || [],
        delivery_time_days: createServiceDto.delivery_time_days,
        revisions_included: createServiceDto.revisions_included || 1,
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
            professional_profile: {
              select: {
                rating: true,
                review_count: true,
                level: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });

    // Update category service count
    await this.prisma.category.update({
      where: { id: createServiceDto.category_id },
      data: {
        service_count: {
          increment: 1,
        },
      },
    });

    return service;
  }

  async findAll(filters: ServiceFiltersDto): Promise<PaginatedResponse<any>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      active: true,
      professional: {
        deleted_at: null,
      },
    };

    // Handle category filtering - support both ID and name
    if (filters.category_id) {
      where.category_id = filters.category_id;
    } else if (filters.category) {
      // Find category by name
      const category = await this.prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: filters.category, mode: 'insensitive' } },
            { slug: { equals: filters.category.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } }
          ]
        }
      });
      if (category) {
        where.category_id = category.id;
      }
    }

    if (filters.location) {
      where.professional = {
        ...where.professional,
        location: {
          contains: filters.location,
          mode: 'insensitive',
        },
      };
    }

    // Handle price filtering - support both formats
    const minPrice = filters.min_price || filters.minPrice;
    const maxPrice = filters.max_price || filters.maxPrice;
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (filters.verified) {
      where.professional = {
        ...where.professional,
        verified: true,
      };
    }

    if (filters.professional_level) {
      where.professional = {
        ...where.professional,
        professional_profile: {
          level: filters.professional_level,
        },
      };
    }

    if (filters.rating_min) {
      where.professional = {
        ...where.professional,
        professional_profile: {
          ...where.professional?.professional_profile,
          rating: {
            gte: filters.rating_min,
          },
        },
      };
    }

    // Handle featured filter
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            hasSome: [filters.search],
          },
        },
      ];
    }

    // Build orderBy clause - handle both parameter formats
    let orderBy: any = {};
    const sortBy = filters.sort_by || filters.sortBy;
    const sortOrder = filters.sort_order || filters.sortOrder || 'desc';
    
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'rating':
        orderBy.professional = {
          professional_profile: {
            rating: sortOrder,
          },
        };
        break;
      case 'reviews':
        orderBy.professional = {
          professional_profile: {
            review_count: sortOrder,
          },
        };
        break;
      case 'view_count':
      case 'popular':
        orderBy.view_count = sortOrder;
        break;
      case 'newest':
      case 'created_at':
        orderBy.created_at = sortOrder;
        break;
      default:
        orderBy.created_at = 'desc';
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          professional: {
            select: {
              id: true,
              name: true,
              avatar: true,
              location: true,
              verified: true,
              professional_profile: {
                select: {
                  rating: true,
                  review_count: true,
                  level: true,
                },
              },
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
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async findOne(id: string, viewerId?: string) {
    const service = await this.prisma.service.findUnique({
      where: { 
        id,
        active: true 
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
            whatsapp_number: true,
            professional_profile: {
              select: {
                bio: true,
                rating: true,
                review_count: true,
                level: true,
                specialties: true,
                response_time_hours: true,
                availability_status: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Record view if viewer provided and different from professional
    if (viewerId && viewerId !== service.professional.id) {
      await this.prisma.serviceView.create({
        data: {
          service_id: id,
          viewer_id: viewerId,
        },
      });

      // Update view count
      await this.prisma.service.update({
        where: { id },
        data: {
          view_count: {
            increment: 1,
          },
        },
      });
    }

    return service;
  }

  async update(id: string, userId: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: { professional_id: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.professional_id !== userId) {
      throw new ForbiddenException('You can only update your own services');
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
            professional_profile: {
              select: {
                rating: true,
                review_count: true,
                level: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });
  }

  async toggleActive(id: string, userId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: {
        professional_id: true,
        active: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.professional_id !== userId) {
      throw new ForbiddenException('You can only modify your own services');
    }

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: {
        active: !service.active,
      },
      select: {
        id: true,
        active: true,
        title: true,
      },
    });

    return {
      message: `Service ${updatedService.active ? 'activated' : 'paused'} successfully`,
      service: updatedService,
    };
  }

  async remove(id: string, userId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: {
        professional_id: true,
        category_id: true
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.professional_id !== userId) {
      throw new ForbiddenException('You can only delete your own services');
    }

    await this.prisma.service.delete({
      where: { id },
    });

    // Update category service count
    if (service.category_id) {
      await this.prisma.category.update({
        where: { id: service.category_id },
        data: {
          service_count: {
            decrement: 1,
          },
        },
      });
    }

    return { message: 'Service deleted successfully' };
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: [
        { popular: 'desc' },
        { service_count: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async getFeaturedServices(limit: number = 6) {
    return this.prisma.service.findMany({
      where: {
        active: true,
        featured: true,
        professional: {
          deleted_at: null,
          verified: true,
        },
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
            professional_profile: {
              select: {
                rating: true,
                review_count: true,
                level: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { view_count: 'desc' },
        { created_at: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Track a view for a service
   */
  async trackView(
    serviceId: string,
    viewerId: string | null,
    ipAddress: string,
    userAgent: string,
  ) {
    // Verify service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, professional_id: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Don't track if viewer is the service owner
    if (viewerId === service.professional_id) {
      return { message: 'View not tracked (own service)' };
    }

    // Create view record
    await this.prisma.serviceView.create({
      data: {
        service_id: serviceId,
        viewer_id: viewerId,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    // Increment view count
    await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    return { message: 'View tracked successfully' };
  }

  /**
   * Get analytics for a specific service (only owner can access)
   */
  async getServiceAnalytics(serviceId: string, userId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        professional_id: true,
        title: true,
        view_count: true,
        created_at: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.professional_id !== userId) {
      throw new ForbiddenException('You can only view analytics for your own services');
    }

    // Get view statistics
    const views = await this.prisma.serviceView.findMany({
      where: { service_id: serviceId },
      orderBy: { viewed_at: 'desc' },
      take: 100, // Last 100 views
    });

    // Get view counts by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsByDate = await this.prisma.serviceView.groupBy({
      by: ['viewed_at'],
      where: {
        service_id: serviceId,
        viewed_at: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get unique visitors count
    const uniqueViewers = await this.prisma.serviceView.groupBy({
      by: ['viewer_id'],
      where: {
        service_id: serviceId,
        viewer_id: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get anonymous views count
    const anonymousViews = await this.prisma.serviceView.count({
      where: {
        service_id: serviceId,
        viewer_id: null,
      },
    });

    return {
      service: {
        id: service.id,
        title: service.title,
        total_views: service.view_count,
        created_at: service.created_at,
      },
      analytics: {
        total_views: service.view_count,
        unique_viewers: uniqueViewers.length,
        anonymous_views: anonymousViews,
        registered_views: service.view_count - anonymousViews,
        recent_views: views.length,
        views_last_30_days: viewsByDate.reduce((sum, v) => sum + v._count.id, 0),
      },
      recent_views: views.slice(0, 20).map((v) => ({
        viewed_at: v.viewed_at,
        viewer_id: v.viewer_id,
        ip_address: v.viewer_id ? null : v.ip_address?.substring(0, 10) + '...', // Hide full IP for privacy
      })),
      views_by_date: viewsByDate.map((v) => ({
        date: v.viewed_at,
        count: v._count.id,
      })),
    };
  }

  /**
   * Get analytics for all services of a professional
   */
  async getMyServicesAnalytics(userId: string) {
    const services = await this.prisma.service.findMany({
      where: {
        professional_id: userId,
      },
      select: {
        id: true,
        title: true,
        active: true,
        view_count: true,
        created_at: true,
        price: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            service_views: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        view_count: 'desc',
      },
    });

    // Get total views across all services
    const totalViews = services.reduce((sum, s) => sum + s.view_count, 0);

    // Get views for last 30 days across all services
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentViews = await this.prisma.serviceView.count({
      where: {
        service: {
          professional_id: userId,
        },
        viewed_at: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      summary: {
        total_services: services.length,
        total_views: totalViews,
        views_last_30_days: recentViews,
        average_views_per_service: services.length > 0 ? Math.round(totalViews / services.length) : 0,
      },
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        active: s.active,
        category: s.category.name,
        price: s.price,
        views: s.view_count,
        reviews: s._count.reviews,
        created_at: s.created_at,
      })),
    };
  }
}