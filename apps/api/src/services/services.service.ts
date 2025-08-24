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
    // Verify user is professional
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (!user || user.user_type !== 'professional') {
      throw new ForbiddenException('Only professionals can create services');
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
    const sortOrder = filters.sort_order || 'desc';
    
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
}