import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';

@Injectable()
export class PortfolioService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all portfolio items for a user
     */
    async findByUserId(userId: string, featured?: boolean, limit?: number) {
        const where: any = { user_id: userId };

        if (featured !== undefined) {
            where.featured = featured;
        }

        return this.prisma.portfolioItem.findMany({
            where,
            orderBy: [
                { featured: 'desc' },
                { display_order: 'asc' },
                { created_at: 'desc' },
            ],
            take: limit,
        });
    }

    /**
     * Get a single portfolio item by ID
     */
    async findOne(id: string) {
        const item = await this.prisma.portfolioItem.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!item) {
            throw new NotFoundException('Portfolio item not found');
        }

        return item;
    }

    /**
     * Create a new portfolio item
     */
    async create(userId: string, dto: CreatePortfolioItemDto) {
        // Get the current max display_order for this user
        const maxOrder = await this.prisma.portfolioItem.aggregate({
            where: { user_id: userId },
            _max: { display_order: true },
        });

        const nextOrder = (maxOrder._max.display_order ?? -1) + 1;

        return this.prisma.portfolioItem.create({
            data: {
                user_id: userId,
                title: dto.title,
                description: dto.description,
                image_url: dto.image_url,
                project_url: dto.project_url,
                category: dto.category,
                tags: dto.tags || [],
                featured: dto.featured || false,
                display_order: nextOrder,
            },
        });
    }

    /**
     * Update a portfolio item
     */
    async update(id: string, userId: string, dto: UpdatePortfolioItemDto) {
        // Check if item exists and belongs to user
        const item = await this.prisma.portfolioItem.findUnique({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException('Portfolio item not found');
        }

        if (item.user_id !== userId) {
            throw new ForbiddenException('You can only update your own portfolio items');
        }

        return this.prisma.portfolioItem.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.image_url && { image_url: dto.image_url }),
                ...(dto.project_url !== undefined && { project_url: dto.project_url }),
                ...(dto.category !== undefined && { category: dto.category }),
                ...(dto.tags !== undefined && { tags: dto.tags }),
                ...(dto.featured !== undefined && { featured: dto.featured }),
            },
        });
    }

    /**
     * Delete a portfolio item
     */
    async delete(id: string, userId: string) {
        // Check if item exists and belongs to user
        const item = await this.prisma.portfolioItem.findUnique({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException('Portfolio item not found');
        }

        if (item.user_id !== userId) {
            throw new ForbiddenException('You can only delete your own portfolio items');
        }

        await this.prisma.portfolioItem.delete({
            where: { id },
        });

        return { message: 'Portfolio item deleted successfully' };
    }

    /**
     * Reorder portfolio items
     */
    async reorder(userId: string, items: Array<{ id: string; display_order: number }>) {
        // Verify all items belong to the user
        const itemIds = items.map((i) => i.id);
        const existingItems = await this.prisma.portfolioItem.findMany({
            where: {
                id: { in: itemIds },
                user_id: userId,
            },
        });

        if (existingItems.length !== items.length) {
            throw new ForbiddenException('You can only reorder your own portfolio items');
        }

        // Update display_order for each item
        await Promise.all(
            items.map((item) =>
                this.prisma.portfolioItem.update({
                    where: { id: item.id },
                    data: { display_order: item.display_order },
                }),
            ),
        );

        return { message: 'Portfolio items reordered successfully' };
    }

    /**
     * Increment views count
     */
    async incrementViews(id: string) {
        await this.prisma.portfolioItem.update({
            where: { id },
            data: {
                views_count: {
                    increment: 1,
                },
            },
        });
    }
}
