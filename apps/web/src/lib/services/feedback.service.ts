import { apiClient, api } from '../api';

/**
 * Frontend types for Feedback system
 * Using completely new names (not "Review")
 */

export interface FeedbackUser {
  id: string;
  name: string;
  avatar?: string;
  userType: 'client' | 'professional';
}

export interface Feedback {
  id: string;
  fromUser: FeedbackUser;
  toUser: FeedbackUser;
  comment?: string;
  hasLike: boolean;
  jobId?: string;
  serviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrustScore {
  userId: string;
  totalLikes: number;
  totalFeedback: number;
  trustPercentage: number;
}

export interface CreateFeedbackRequest {
  toUserId: string;
  comment?: string;
  hasLike: boolean;
  jobId?: string;
  serviceId?: string;
}

export interface UpdateFeedbackRequest {
  comment?: string;
  hasLike?: boolean;
}

/**
 * Feedback Service - Handles all feedback-related API calls
 * NEW SYSTEM: Mutual comments and likes (Trust Score)
 */
export const feedbackService = {
  /**
   * Give feedback to another user
   */
  async giveFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
    return api.post<Feedback>('/feedback', data);
  },

  /**
   * Update existing feedback
   */
  async updateFeedback(
    feedbackId: string,
    data: UpdateFeedbackRequest,
  ): Promise<Feedback> {
    return api.put<Feedback>(`/feedback/${feedbackId}`, data);
  },

  /**
   * Get all feedback received by current user
   */
  async getMyFeedbackReceived(): Promise<Feedback[]> {
    return api.get<Feedback[]>('/feedback/received');
  },

  /**
   * Get all feedback received by a specific user (public)
   */
  async getFeedbackReceivedByUser(userId: string): Promise<Feedback[]> {
    return api.get<Feedback[]>(`/feedback/received/${userId}`);
  },

  /**
   * Get all feedback given by current user
   */
  async getMyFeedbackGiven(): Promise<Feedback[]> {
    return api.get<Feedback[]>('/feedback/given');
  },

  /**
   * Get all feedback for a specific job
   */
  async getFeedbackForJob(jobId: string): Promise<Feedback[]> {
    return api.get<Feedback[]>(`/feedback/job/${jobId}`);
  },

  /**
   * Calculate trust score for a user
   */
  async getTrustScore(userId: string): Promise<TrustScore> {
    return api.get<TrustScore>(`/feedback/trust-score/${userId}`);
  },

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    await apiClient.delete(`/feedback/${feedbackId}`);
  },
};
