import { apiClient } from './api.service';

export interface TrustScore {
  id: string;
  userId: string;
  overallScore: number;
  reviewScore: number;
  completionScore: number;
  communicationScore: number;
  reliabilityScore: number;
  verificationScore: number;
  totalJobsCompleted: number;
  totalReviewsReceived: number;
  averageRating: number;
  responseTimeHours: number;
  completionRate: number;
  verifiedIdentity: boolean;
  verifiedSkills: boolean;
  verifiedBusiness: boolean;
  backgroundChecked: boolean;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
  trustBadge?: string;
  badgeColor?: string;
  scoreBreakdown?: {
    reviewScore: number;
    completionScore: number;
    communicationScore: number;
    reliabilityScore: number;
    verificationScore: number;
  };
}

export interface TrustBadgeInfo {
  name: string;
  minScore: number;
  color: string;
  description: string;
}

export interface TrustBadgesResponse {
  badges: TrustBadgeInfo[];
  scoreComponents: {
    [key: string]: {
      weight: number;
      description: string;
    };
  };
}

class TrustService {
  async getTrustScore(userId: string): Promise<TrustScore> {
    const response = await apiClient.get(`/trust/score/${userId}`);
    return response.data;
  }

  async getMyTrustScore(): Promise<TrustScore> {
    const response = await apiClient.get('/trust/my-score');
    return response.data;
  }

  async calculateTrustScore(userId?: string): Promise<TrustScore> {
    const endpoint = userId ? `/trust/calculate/${userId}` : '/trust/calculate/me';
    const response = await apiClient.post(endpoint);
    return response.data;
  }

  async recalculateAllTrustScores(): Promise<{ message: string }> {
    const response = await apiClient.post('/trust/recalculate-all');
    return response.data;
  }

  async getTrustLeaderboard(
    limit = 50,
    userType?: 'professional' | 'client'
  ): Promise<{
    message: string;
    limit: number;
    userType: string;
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (userType) params.append('userType', userType);

    const response = await apiClient.get(`/trust/leaderboard?${params.toString()}`);
    return response.data;
  }

  async getBadgeInformation(): Promise<TrustBadgesResponse> {
    const response = await apiClient.get('/trust/badges');
    return response.data;
  }

  // Helper methods for client-side calculations and display
  getBadgeFromScore(score: number): string {
    if (score >= 95) return 'Top Rated Plus';
    if (score >= 85) return 'Highly Trusted';
    if (score >= 75) return 'Trusted Professional';
    if (score >= 65) return 'Verified Professional';
    if (score >= 50) return 'Professional';
    return 'New Professional';
  }

  getBadgeColorFromScore(score: number): string {
    if (score >= 95) return 'text-purple-600 bg-purple-100';
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 65) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-gray-600 bg-gray-100';
    return 'text-slate-600 bg-slate-100';
  }

  getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' | 'new' {
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'average';
    if (score >= 40) return 'poor';
    return 'new';
  }

  formatTrustScore(score: number, decimals = 1): string {
    return score.toFixed(decimals);
  }

  getVerificationCount(trustScore: TrustScore): number {
    let count = 0;
    if (trustScore.verifiedIdentity) count++;
    if (trustScore.verifiedSkills) count++;
    if (trustScore.verifiedBusiness) count++;
    if (trustScore.backgroundChecked) count++;
    return count;
  }

  getVerificationPercentage(trustScore: TrustScore): number {
    const totalVerifications = 4; // identity, skills, business, background
    const completedVerifications = this.getVerificationCount(trustScore);
    return (completedVerifications / totalVerifications) * 100;
  }

  isHighlyTrusted(score: number): boolean {
    return score >= 85;
  }

  isVerifiedProfessional(trustScore: TrustScore): boolean {
    return trustScore.verifiedIdentity || trustScore.verifiedSkills;
  }

  shouldDisplayTrustBadge(score: number): boolean {
    return score >= 50; // Only show badge for professionals with decent scores
  }

  getScoreImprovement(currentScore: number, previousScore?: number): {
    hasImproved: boolean;
    improvement: number;
    improvementPercentage: number;
  } {
    if (!previousScore) {
      return {
        hasImproved: false,
        improvement: 0,
        improvementPercentage: 0
      };
    }

    const improvement = currentScore - previousScore;
    const improvementPercentage = previousScore > 0 
      ? (improvement / previousScore) * 100 
      : 0;

    return {
      hasImproved: improvement > 0,
      improvement,
      improvementPercentage
    };
  }

  getNextBadgeRequirement(score: number): {
    nextBadge: string;
    pointsNeeded: number;
    currentProgress: number;
  } | null {
    const badges = [
      { name: 'Professional', minScore: 50 },
      { name: 'Verified Professional', minScore: 65 },
      { name: 'Trusted Professional', minScore: 75 },
      { name: 'Highly Trusted', minScore: 85 },
      { name: 'Top Rated Plus', minScore: 95 }
    ];

    const nextBadge = badges.find(badge => score < badge.minScore);
    
    if (!nextBadge) {
      return null; // Already at highest level
    }

    const previousBadge = badges.find(badge => score >= badge.minScore);
    const currentProgress = previousBadge 
      ? ((score - previousBadge.minScore) / (nextBadge.minScore - previousBadge.minScore)) * 100
      : (score / nextBadge.minScore) * 100;

    return {
      nextBadge: nextBadge.name,
      pointsNeeded: nextBadge.minScore - score,
      currentProgress: Math.min(currentProgress, 100)
    };
  }
}

export const trustService = new TrustService();