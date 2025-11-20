import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ReviewBlocker, Match, MatchReview } from '@/types/client-circuit';

/**
 * Fetch pending reviews for current user
 */
async function fetchPendingReviews(): Promise<ReviewBlocker[]> {
    try {
        // Get all completed matches without reviews
        const matches = await api.get<Match[]>('/matches?status=completed&needsReview=true');

        return matches.map(match => ({
            hasPendingReview: true,
            matchId: match.id,
            revieweeName: match.professional?.name || 'el profesional',
            projectTitle: match.proposal?.project?.title,
            completedAt: match.updated_at,
        }));
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return [];
    }
}

/**
 * useReviewBlocker Hook
 * 
 * Checks if user has pending reviews that block new project creation.
 * 
 * Business Rule:
 * - User must complete all pending reviews before creating new projects
 * - This ensures quality feedback loop in the marketplace
 * - Reviews are required after match completion
 * 
 * @returns Review blocker state
 * 
 * @example
 * ```tsx
 * const { hasPendingReview, blocker } = useReviewBlocker();
 * 
 * if (hasPendingReview) {
 *   return <ReviewBlockerModal blocker={blocker} />;
 * }
 * ```
 */
export function useReviewBlocker() {
    const {
        data: pendingReviews = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['pendingReviews'],
        queryFn: fetchPendingReviews,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true, // Refetch when user returns to tab
    });

    const hasPendingReview = pendingReviews.length > 0;
    const blocker = pendingReviews[0] || {
        hasPendingReview: false,
    };

    return {
        hasPendingReview,
        blocker,
        pendingCount: pendingReviews.length,
        allPendingReviews: pendingReviews,
        isLoading,
        error: error as Error | null,
        refetch,
    };
}

/**
 * useMatchReviewStatus Hook
 * 
 * Checks review status for a specific match.
 * 
 * @param matchId - Match ID to check
 * @returns Review status for the match
 * 
 * @example
 * ```tsx
 * const { hasReviewed, canReview } = useMatchReviewStatus('match-123');
 * 
 * if (canReview && !hasReviewed) {
 *   return <Button onClick={openReviewForm}>Dejar Calificación</Button>;
 * }
 * ```
 */
export function useMatchReviewStatus(matchId: string) {
    const { data: match, isLoading } = useQuery({
        queryKey: ['match', matchId],
        queryFn: () => api.get<Match>(`/matches/${matchId}`),
        enabled: !!matchId,
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['matchReviews', matchId],
        queryFn: () => api.get<MatchReview[]>(`/matches/${matchId}/reviews`),
        enabled: !!matchId,
    });

    // Check if current user has already reviewed
    const hasReviewed = reviews.some(review =>
        review.reviewer_id === match?.client_id ||
        review.reviewer_id === match?.professional_id
    );

    // Can review if match is completed and user hasn't reviewed yet
    const canReview = match?.status === 'completed' && !hasReviewed;

    return {
        hasReviewed,
        canReview,
        reviews,
        isLoading,
    };
}
