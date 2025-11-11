import { api } from '../api';

export interface Match {
  id: string;
  proposalId: string;
  clientId: string;
  professionalId: string;
  projectId: string;
  jobId?: string;
  status: 'active' | 'completed' | 'disputed' | 'cancelled' | 'unsuccessful';
  phoneRevealedAt?: string;
  phoneRevealCount: number;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  professional: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    rating?: number;
    reviewCount?: number;
  };
  proposal: {
    id: string;
    message: string;
    quotedPrice: number;
    deliveryTimeDays: number;
    status: string;
    acceptedAt?: string;
  };
}

export interface CompletionStatus {
  matchId: string;
  matchStatus: string;
  jobId?: string;
  completionRequestedBy?: string;
  completionRequestedAt?: string;
  completionConfirmedBy?: string;
  completionConfirmedAt?: string;
  isCompleted: boolean;
  canLeaveReview: boolean;
}

export interface PhoneRevealToken {
  token: string;
  expiresAt: string;
  message: string;
}

export interface PhoneMasked {
  maskedNumber: string;
  revealed: boolean;
}

export interface PhoneRevealed {
  phoneNumber: string;
  maskedNumber: string;
}

export const matchService = {
  // Helper: transform backend match (snake_case) to frontend Match (camelCase)
  _toCamel(match: any): Match {
    return {
      id: match.id,
      proposalId: match.proposal_id ?? match.proposalId,
      clientId: match.client_id ?? match.clientId,
      professionalId: match.professional_id ?? match.professionalId,
      projectId: match.project_id ?? match.projectId,
      jobId: match.job_id ?? match.jobId,
      status: match.status,
      phoneRevealedAt: match.phone_revealed_at ?? match.phoneRevealedAt,
      phoneRevealCount: match.phone_reveal_count ?? match.phoneRevealCount ?? 0,
      createdAt: match.created_at ?? match.createdAt,
      updatedAt: match.updated_at ?? match.updatedAt,
      client: match.client,
      professional: match.professional,
      proposal: match.proposal ? {
        id: match.proposal.id,
        message: match.proposal.message,
        quotedPrice: match.proposal.quoted_price ?? match.proposal.quotedPrice,
        deliveryTimeDays: match.proposal.delivery_time_days ?? match.proposal.deliveryTimeDays,
        status: match.proposal.status,
        acceptedAt: match.proposal.accepted_at ?? match.proposal.acceptedAt,
      } : match.proposal,
    } as Match;
  },
  /**
   * Get all matches for current user
   */
  async getMyMatches(role?: 'client' | 'professional'): Promise<Match[]> {
    const params = role ? `?role=${role}` : '';
    const data = await api.get<any[]>(`/matches${params}`);
    return (data || []).map(m => matchService._toCamel(m));
  },

  /**
   * Get a specific match by ID
   */
  async getMatch(matchId: string): Promise<Match> {
    const data = await api.get<any>(`/matches/${matchId}`);
    return matchService._toCamel(data);
  },

  /**
   * Update match status
   */
  async updateMatchStatus(
    matchId: string,
    status: 'active' | 'completed' | 'disputed' | 'cancelled' | 'unsuccessful',
    reason?: string,
  ): Promise<Match> {
    return api.put<Match>(`/matches/${matchId}/status`, {
      status,
      reason,
    });
  },

  /**
   * Request completion of service
   */
  async requestCompletion(matchId: string, comment?: string): Promise<void> {
    return api.post<void>(`/matches/${matchId}/request-completion`, {
      comment,
    });
  },

  /**
   * Confirm completion by opposite party
   */
  async confirmCompletion(matchId: string, comment?: string): Promise<Match> {
    return api.put<Match>(`/matches/${matchId}/confirm-completion`, {
      comment,
    });
  },

  /**
   * Get completion status
   */
  async getCompletionStatus(matchId: string): Promise<CompletionStatus> {
    return api.get<CompletionStatus>(`/matches/${matchId}/completion-status`);
  },

  /**
   * Generate one-time token for phone reveal
   */
  async generatePhoneRevealToken(
    matchId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PhoneRevealToken> {
    return api.post<PhoneRevealToken>(
      `/matches/${matchId}/request-phone-reveal`,
      {
        ipAddress,
        userAgent,
      },
    );
  },

  /**
   * Get masked phone number (always available)
   */
  async getMaskedPhoneNumber(matchId: string): Promise<PhoneMasked> {
    return api.get<PhoneMasked>(`/matches/${matchId}/phone-masked`);
  },

  /**
   * Reveal phone using one-time token
   */
  async revealPhone(matchId: string, token: string): Promise<PhoneRevealed> {
    return api.get<PhoneRevealed>(`/matches/${matchId}/reveal-phone?token=${encodeURIComponent(token)}`);
  },

  /**
   * Get phone reveal history (admin)
   */
  async getRevealHistory(matchId: string): Promise<any[]> {
    return api.get<any[]>(`/matches/${matchId}/reveal-history`);
  },

  /**
   * Crear nuevo match al aceptar propuesta
   */
  async createMatch(payload: { proposalId: string, projectId: string, clientId: string, professionalId: string }) {
    return api.post<Match>(`/matches`, payload);
  },
};
