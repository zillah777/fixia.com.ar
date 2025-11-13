import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook that listens for match creation events and provides a refresh callback
 * Allows components to reload matches when a proposal is accepted elsewhere
 */
export function useMatchesRefresh(
  onRefresh?: () => void | Promise<void>
) {
  const refreshCallbackRef = useRef(onRefresh);

  // Update ref when callback changes
  useEffect(() => {
    refreshCallbackRef.current = onRefresh;
  }, [onRefresh]);

  const triggerRefresh = useCallback(async () => {
    if (refreshCallbackRef.current) {
      try {
        await refreshCallbackRef.current();
      } catch (error) {
        console.error('Error refreshing matches:', error);
      }
    }
  }, []);

  // Listen for match creation events
  useEffect(() => {
    const handleMatchCreated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Match created event received:', customEvent.detail);
      triggerRefresh();
    };

    window.addEventListener('matchCreated', handleMatchCreated);

    return () => {
      window.removeEventListener('matchCreated', handleMatchCreated);
    };
  }, [triggerRefresh]);

  return {
    triggerRefresh,
  };
}

/**
 * Emit a global event when a match is created
 * This should be called after a proposal is successfully accepted
 */
export function emitMatchCreatedEvent(matchData: {
  matchId: string;
  projectId: string;
  clientId: string;
  professionalId: string;
  status: string;
}) {
  const event = new CustomEvent('matchCreated', {
    detail: matchData,
    bubbles: true,
  });
  window.dispatchEvent(event);
  console.log('Match created event emitted:', matchData);
}
