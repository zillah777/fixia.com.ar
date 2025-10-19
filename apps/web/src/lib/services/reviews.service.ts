import { api } from '../api';

export interface CreateReviewDto {
  professionalId: string;
  serviceId?: string;
  jobId?: string;
  rating: number;
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
}

export interface FlagReviewDto {
  reason: 'inappropriate_language' | 'fake_review' | 'spam' | 'harassment' | 'irrelevant' | 'personal_information' | 'other';
  description?: string;
}

export interface HelpfulVoteDto {
  isHelpful: boolean;
}

export interface ReviewFiltersDto {
  rating?: number;
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  page?: number;
  limit?: number;
}

export interface Review {
  id: string;
  serviceId?: string;
  jobId?: string;
  reviewerId: string;
  professionalId: string;
  rating: number;
  comment?: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  moderationStatus: string;
  moderatedBy?: string;
  moderatedAt?: string;
  flaggedCount: number;
  trustScore?: number;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  professional: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    title: string;
  };
  job?: {
    id: string;
    title: string;
  };
  helpfulVotes: Array<{
    id: string;
    userId: string;
    isHelpful: boolean;
  }>;
}

export interface ReviewStats {
  total: number;
  average: number;
  distribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

export interface PaginatedReviews {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ReviewsService {
  async createReview(reviewData: CreateReviewDto): Promise<Review> {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  }

  async getReviewsByProfessional(
    professionalId: string,
    filters?: ReviewFiltersDto
  ): Promise<PaginatedReviews> {
    const params = new URLSearchParams();
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.verifiedOnly) params.append('verifiedOnly', 'true');
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(
      `/reviews/professional/${professionalId}?${params.toString()}`
    );
    return response.data;
  }

  async getReviewsByClient(
    clientId: string,
    filters?: ReviewFiltersDto
  ): Promise<PaginatedReviews> {
    const params = new URLSearchParams();
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.verifiedOnly) params.append('verifiedOnly', 'true');
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(
      `/reviews/client/${clientId}?${params.toString()}`
    );
    return response.data;
  }

  async getMyReviews(filters?: ReviewFiltersDto): Promise<PaginatedReviews> {
    const params = new URLSearchParams();
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/reviews/my-reviews?${params.toString()}`);
    return response.data;
  }

  async updateReview(reviewId: string, updateData: UpdateReviewDto): Promise<Review> {
    const response = await api.put(`/reviews/${reviewId}`, updateData);
    return response.data;
  }

  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  }

  async flagReview(reviewId: string, flagData: FlagReviewDto): Promise<void> {
    await api.post(`/reviews/${reviewId}/flag`, flagData);
  }

  async voteHelpful(reviewId: string, voteData: HelpfulVoteDto): Promise<void> {
    await api.post(`/reviews/${reviewId}/helpful`, voteData);
  }

  async getProfessionalReviewStats(professionalId: string): Promise<ReviewStats> {
    const response = await api.get(`/reviews/professional/${professionalId}/stats`);
    return response.data;
  }

  // Admin endpoints
  async getReviewsForModeration(page = 1, limit = 20): Promise<PaginatedReviews> {
    const response = await api.get(
      `/reviews/admin/moderation?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected' | 'flagged' | 'spam',
    notes?: string
  ): Promise<Review> {
    const response = await api.post(`/reviews/admin/${reviewId}/moderate`, {
      status,
      notes
    });
    return response.data;
  }

  async resolveFlag(flagId: string, notes?: string): Promise<void> {
    await api.post(`/reviews/admin/flags/${flagId}/resolve`, { notes });
  }
}

export const reviewsService = new ReviewsService();