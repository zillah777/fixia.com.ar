import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MatchDetailCard } from './MatchDetailCard';
import { PhoneRevealModal } from '../modals/PhoneRevealModal';
import { CompletionModal } from '../modals/CompletionModal';
import { matchService, Match, CompletionStatus } from '@/lib/services/match.service';
import { useMatchesRefresh } from '@/hooks/useMatchesRefresh';

interface MatchesListSectionProps {
  userId: string;
  role?: 'client' | 'professional';
  limit?: number;
  onMatchSelect?: (matchId: string) => void;
}

export function MatchesListSection({
  userId,
  role,
  limit = 5,
  onMatchSelect,
}: MatchesListSectionProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [completionStatuses, setCompletionStatuses] = useState<Record<string, CompletionStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [phoneRevealModal, setPhoneRevealModal] = useState<{
    open: boolean;
    matchId?: string;
    partyName?: string;
  }>({ open: false });

  const [completionModal, setCompletionModal] = useState<{
    open: boolean;
    matchId?: string;
    mode?: 'request' | 'confirm';
    partyName?: string;
  }>({ open: false });

  // Define loadMatches with useCallback to avoid re-creating on every render
  const loadMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await matchService.getMyMatches(role);
      setMatches(data.slice(0, limit));

      // Load completion statuses
      const statuses: Record<string, CompletionStatus> = {};
      for (const match of data.slice(0, limit)) {
        statuses[match.id] = await matchService.getCompletionStatus(match.id);
      }
      setCompletionStatuses(statuses);

      setError('');
    } catch (err) {
      setError('Failed to load matches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [role, limit]);

  // Setup refresh listener for when matches are created
  useMatchesRefresh(loadMatches);

  // Load matches on mount and when role/userId changes
  useEffect(() => {
    loadMatches();
  }, [loadMatches, userId]);

  const handleRevealPhone = (matchId: string, partyName: string) => {
    setPhoneRevealModal({ open: true, matchId, partyName });
  };

  const handleRequestCompletion = (matchId: string, partyName: string) => {
    setCompletionModal({
      open: true,
      matchId,
      mode: 'request',
      partyName,
    });
  };

  const handleConfirmCompletion = (matchId: string, partyName: string) => {
    setCompletionModal({
      open: true,
      matchId,
      mode: 'confirm',
      partyName,
    });
  };

  const handleModalClose = () => {
    setPhoneRevealModal({ open: false });
    setCompletionModal({ open: false });
    // Reload completion status
    if (phoneRevealModal.matchId) {
      loadMatches();
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-glow border-primary/20">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-white/70">Cargando matches...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-glow border-destructive/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive mb-2">Error cargando matches</p>
              <p className="text-white/80 text-sm mb-4">{error}</p>
              <Button
                onClick={loadMatches}
                variant="outline"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Intentar de Nuevo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="glass-glow border-primary/20">
        <CardContent className="p-8 text-center">
          <p className="text-white/70 mb-4">
            {role === 'client'
              ? 'No tienes matches activos como cliente'
              : role === 'professional'
                ? 'No tienes matches activos como profesional'
                : 'No tienes matches activos'}
          </p>
          <p className="text-sm text-white/60">
            Los matches se crearán cuando una propuesta sea aceptada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-glow border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-white">Mis Matches Activos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div className="space-y-4" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} initial="hidden" animate="visible">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MatchDetailCard
                  match={match}
                  completionStatus={completionStatuses[match.id]}
                  currentUserId={userId}
                  onRevealPhone={() =>
                    handleRevealPhone(
                      match.id,
                      match.clientId === userId ? match.professional.name : match.client.name,
                    )
                  }
                  onRequestCompletion={() =>
                    handleRequestCompletion(
                      match.id,
                      match.clientId === userId ? match.professional.name : match.client.name,
                    )
                  }
                  onConfirmCompletion={() =>
                    handleConfirmCompletion(
                      match.id,
                      match.clientId === userId ? match.professional.name : match.client.name,
                    )
                  }
                  isLoading={isLoading}
                />
              </motion.div>
            ))}
          </motion.div>

          {limit && matches.length >= limit && (
            <Button
              variant="outline"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Ver Todos los Matches
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <PhoneRevealModal
        isOpen={phoneRevealModal.open}
        onClose={handleModalClose}
        matchId={phoneRevealModal.matchId || ''}
        oppositePartyName={phoneRevealModal.partyName || ''}
      />

      <CompletionModal
        isOpen={completionModal.open}
        onClose={handleModalClose}
        matchId={completionModal.matchId || ''}
        mode={completionModal.mode || 'request'}
        oppositePartyName={completionModal.partyName || ''}
      />
    </>
  );
}
