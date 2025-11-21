import api from '../api';

/**
 * Portfolio Item Interface
 */
export interface PortfolioItem {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    image_url: string;
    project_url?: string;
    category?: string;
    tags?: string[];
    featured: boolean;
    display_order: number;
    likes_count: number;
    views_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * Create Portfolio Item DTO
 */
export interface CreatePortfolioItemDto {
    title: string;
    description?: string;
    image_url: string;
    project_url?: string;
    category?: string;
    tags?: string[];
    featured?: boolean;
}

/**
 * Update Portfolio Item DTO
 */
export interface UpdatePortfolioItemDto {
    title?: string;
    description?: string;
    image_url?: string;
    project_url?: string;
    category?: string;
    tags?: string[];
    featured?: boolean;
}

/**
 * Reorder Items DTO
 */
export interface ReorderItemsDto {
    items: Array<{
        id: string;
        display_order: number;
    }>;
}

/**
 * Portfolio Service
 */
export const portfolioService = {
    /**
     * Get all portfolio items for a user (public)
     */
    async getUserPortfolio(
        userId: string,
        featured?: boolean,
        limit?: number
    ): Promise<PortfolioItem[]> {
        const params = new URLSearchParams();
        if (featured !== undefined) params.append('featured', String(featured));
        if (limit !== undefined) params.append('limit', String(limit));

        const queryString = params.toString();
        const url = `/portfolio/user/${userId}${queryString ? `?${queryString}` : ''}`;

        const response = await api.get(url);
        return response.data;
    },

    /**
     * Get a single portfolio item by ID (public)
     */
    async getPortfolioItem(id: string): Promise<PortfolioItem> {
        const response = await api.get(`/portfolio/${id}`);
        return response.data;
    },

    /**
     * Create a new portfolio item (authenticated)
     */
    async createPortfolioItem(data: CreatePortfolioItemDto): Promise<PortfolioItem> {
        const response = await api.post('/portfolio', data);
        return response.data;
    },

    /**
     * Update a portfolio item (authenticated, owner only)
     */
    async updatePortfolioItem(
        id: string,
        data: UpdatePortfolioItemDto
    ): Promise<PortfolioItem> {
        const response = await api.put(`/portfolio/${id}`, data);
        return response.data;
    },

    /**
     * Delete a portfolio item (authenticated, owner only)
     */
    async deletePortfolioItem(id: string): Promise<void> {
        await api.delete(`/portfolio/${id}`);
    },

    /**
     * Reorder portfolio items (authenticated, owner only)
     */
    async reorderPortfolioItems(data: ReorderItemsDto): Promise<void> {
        await api.patch('/portfolio/reorder', data);
    },
};
