import { api } from '../api';

export interface MatchReview {
  id: string;
  match_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  overall_rating: number;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;
  comment?: string;
  verified_match: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  reviewed_user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  total_reviews: number;
  average_overall_rating: number;
  average_communication_rating: number;
  average_quality_rating: number;
  average_professionalism_rating: number;
  average_timeliness_rating: number;
  rating_distribution: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
}

export interface ReviewStatus {
  match_id: string;
  client_reviewed: boolean;
  professional_reviewed: boolean;
  both_reviewed: boolean;
  client_review?: {
    reviewer_id: string;
    reviewed_user_id: string;
    overall_rating: number;
    created_at: string;
  } | null;
  professional_review?: {
    reviewer_id: string;
    reviewed_user_id: string;
    overall_rating: number;
    created_at: string;
  } | null;
}

export interface CreateReviewPayload {
  overall_rating: number;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  overall_rating?: number;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;
  comment?: string;
}

export const reviewService = {
  /**
   * Create a review for a match
   */
  async createReview(matchId: string, payload: CreateReviewPayload): Promise<MatchReview> {
    return api.post<MatchReview>(`/matches/${matchId}/reviews`, payload);
  },

  /**
   * Get all reviews for a match
   */
  async getMatchReviews(matchId: string): Promise<MatchReview[]> {
    return api.get<MatchReview[]>(`/matches/${matchId}/reviews`);
  },

  /**
   * Get review status for a match (who has reviewed)
   */
  async getReviewStatus(matchId: string): Promise<ReviewStatus> {
    return api.get<ReviewStatus>(`/matches/${matchId}/reviews/status`);
  },

  /**
   * Check if current user can leave a review for a match
   */
  async canLeaveReview(matchId: string): Promise<{ can_review: boolean }> {
    return api.get<{ can_review: boolean }>(`/matches/${matchId}/reviews/can-review`);
  },

  /**
   * Update a review
   */
  async updateReview(reviewId: string, payload: UpdateReviewPayload): Promise<MatchReview> {
    return api.put<MatchReview>(`/matches/reviews/${reviewId}`, payload);
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/matches/reviews/${reviewId}`);
  },

  /**
   * Get all reviews for a specific user
   */
  async getUserReviews(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<{ reviews: MatchReview[]; total: number; limit: number; offset: number }> {
    return api.get(`/matches/users/${userId}/reviews?limit=${limit}&offset=${offset}`);
  },

  /**
   * Get review statistics for a user
   */
  async getReviewStats(userId: string): Promise<ReviewStats> {
    return api.get<ReviewStats>(`/matches/users/${userId}/reviews/stats`);
  },
};
