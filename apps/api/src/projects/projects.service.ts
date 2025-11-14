import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { checkProjectLimit } from '../config/project-limits.config';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    // Verify user can create projects (client or professional or dual) and get subscription info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        user_type: true,
        subscription_type: true,
        subscription_status: true
      },
    });

    if (!user || (user.user_type !== 'client' && user.user_type !== 'professional' && user.user_type !== 'dual')) {
      throw new ForbiddenException('Only clients and professionals can create projects');
    }

    // Check monthly project limit based on subscription
    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count projects created this month
    const projectsThisMonth = await this.prisma.project.count({
      where: {
        client_id: userId,
        created_at: {
          gte: startOfMonth,
        },
      },
    });

    // Check if user has exceeded their limit (from configurable config)
    const limitCheck = checkProjectLimit(
      projectsThisMonth,
      user.subscription_type,
      user.subscription_status
    );

    if (limitCheck.exceeded) {
      const planName = user.subscription_type === 'professional'
        ? 'Professional'
        : user.subscription_type === 'premium'
          ? 'Premium'
          : 'Free';

      throw new ForbiddenException(
        `Has alcanzado el límite de ${limitCheck.limit} anuncios mensuales del plan ${planName}. Actualiza tu plan para publicar más anuncios.`
      );
    }

    // Verify category exists if provided
    if (createProjectDto.category_id) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProjectDto.category_id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Convert deadline string to Date if provided
    let deadline: Date | undefined;
    if (createProjectDto.deadline) {
      deadline = new Date(createProjectDto.deadline);
    }

    const project = await this.prisma.project.create({
      data: {
        client_id: userId,
        category_id: createProjectDto.category_id,
        title: createProjectDto.title,
        description: createProjectDto.description,
        budget_min: createProjectDto.budget_min,
        budget_max: createProjectDto.budget_max,
        deadline,
        location: createProjectDto.location,
        skills_required: createProjectDto.skills_required || [],
        // @ts-ignore - Field exists in DB, Prisma types need regeneration
        main_image_url: createProjectDto.main_image_url,
        // @ts-ignore - Field exists in DB, Prisma types need regeneration
        gallery_urls: createProjectDto.gallery_urls || [],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
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

    return project;
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users who can create projects should see their own projects with proposals
    // This includes: clients, professionals (who can now create projects), and dual role users
    if (user.user_type === 'client' || user.user_type === 'professional' || user.user_type === 'dual') {
      const projects = await this.prisma.project.findMany({
        where: { client_id: userId },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
              icon: true,
            },
          },
          _count: {
            select: {
              proposals: true,
            },
          },
          proposals: {
            include: {
              professional: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  location: true,
                  phone: true,
                  whatsapp_number: true,
                  verified: true,
                  user_type: true,
                  created_at: true,
                  professional_profile: {
                    select: {
                      bio: true,
                      rating: true,
                      review_count: true,
                      level: true,
                    },
                  },
                },
              },
            },
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      // DEBUG: Log what Prisma returned
      console.log('🔍 Backend findAll - Prisma returned:', {
        projectCount: projects.length,
        firstProject: projects[0] ? {
          id: projects[0].id,
          title: projects[0].title,
          hasProposals: 'proposals' in projects[0],
          proposalsType: Array.isArray(projects[0].proposals) ? 'array' : typeof projects[0].proposals,
          proposalsLength: projects[0].proposals?.length,
        } : null,
      });

      return projects;
    }

    // Default: return empty array for unknown user types
    return [];
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
        proposals: {
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
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check permissions: owner can see everything, professionals can see if project is open
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (project.client_id !== userId && 
        user?.user_type === 'professional' && 
        project.status !== 'open') {
      throw new ForbiddenException('You can only view open projects');
    }

    return project;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { client_id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.client_id !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    // Convert deadline string to Date if provided
    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.deadline) {
      updateData.deadline = new Date(updateProjectDto.deadline);
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            verified: true,
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
            proposals: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { client_id: true, status: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.client_id !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}