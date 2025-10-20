import { apiClient } from './api';

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
    const response = await apiClient.post<Feedback>('/feedback', data);
    return response.data;
  },

  /**
   * Update existing feedback
   */
  async updateFeedback(
    feedbackId: string,
    data: UpdateFeedbackRequest,
  ): Promise<Feedback> {
    const response = await apiClient.put<Feedback>(`/feedback/${feedbackId}`, data);
    return response.data;
  },

  /**
   * Get all feedback received by current user
   */
  async getMyFeedbackReceived(): Promise<Feedback[]> {
    const response = await apiClient.get<Feedback[]>('/feedback/received');
    return response.data;
  },

  /**
   * Get all feedback received by a specific user (public)
   */
  async getFeedbackReceivedByUser(userId: string): Promise<Feedback[]> {
    const response = await apiClient.get<Feedback[]>(`/feedback/received/${userId}`);
    return response.data;
  },

  /**
   * Get all feedback given by current user
   */
  async getMyFeedbackGiven(): Promise<Feedback[]> {
    const response = await apiClient.get<Feedback[]>('/feedback/given');
    return response.data;
  },

  /**
   * Get all feedback for a specific job
   */
  async getFeedbackForJob(jobId: string): Promise<Feedback[]> {
    const response = await apiClient.get<Feedback[]>(`/feedback/job/${jobId}`);
    return response.data;
  },

  /**
   * Calculate trust score for a user
   */
  async getTrustScore(userId: string): Promise<TrustScore> {
    const response = await apiClient.get<TrustScore>(`/feedback/trust-score/${userId}`);
    return response.data;
  },

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    await apiClient.delete(`/feedback/${feedbackId}`);
  },
};
