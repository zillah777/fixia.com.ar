import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    // Verify user is client
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (!user || user.user_type !== 'client') {
      throw new ForbiddenException('Only clients can create projects');
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

    // Clients see their own projects
    if (user.user_type === 'client') {
      return this.prisma.project.findMany({
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
                  professional_profile: {
                    select: {
                      description: true,
                      average_rating: true,
                      total_reviews: true,
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
    }

    // Professionals see open projects that match their skills/location
    // For now, return all open projects - could be improved with matching algorithm
    return this.prisma.project.findMany({
      where: { 
        status: 'open',
      },
      include: {
        client: {
          select: {
            name: true,
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
      orderBy: { created_at: 'desc' },
      take: 50, // Limit to prevent overwhelming professionals
    });
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

    // Don't allow deletion of projects with accepted proposals or in progress
    if (project.status === 'in_progress') {
      throw new ForbiddenException('Cannot delete projects in progress');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}