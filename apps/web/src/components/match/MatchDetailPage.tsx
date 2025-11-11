'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { MatchDetailCard } from './MatchDetailCard';
import { ReviewsSection } from './ReviewsSection';
import { PhoneRevealModal } from '../modals/PhoneRevealModal';
import { CompletionModal } from '../modals/CompletionModal';
import { matchService, Match, CompletionStatus } from '@/lib/services/match.service';
import { useToast } from '@/lib/hooks/use-toast';

interface MatchDetailPageProps {
  matchId: string;
  currentUserId: string;
  onBack?: () => void;
}

export function MatchDetailPage({
  matchId,
  currentUserId,
  onBack,
}: MatchDetailPageProps) {
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
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

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [matchData, statusData] = await Promise.all([
        matchService.getMatch(matchId),
        matchService.getCompletionStatus(matchId),
      ]);

      setMatch(matchData);
      setCompletionStatus(statusData);
    } catch (err) {
      setError('No se pudo cargar el match');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleFinalizeUnsuccessful = async (matchId: string) => {
    const ok = window.confirm('¿Confirmas que este trabajo se finalizó sin éxito?');
    if (!ok) return;
    try {
      setIsLoading(true);
      await matchService.updateMatchStatus(matchId, 'unsuccessful');
      toast({ title: 'Match finalizado sin éxito', description: 'Se registró el cierre. Puedes dejar tu comentario/feedback.' });
      await loadMatch();
    } catch (e: any) {
      toast({ title: 'No se pudo finalizar', description: e?.message || 'Intenta nuevamente', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setPhoneRevealModal({ open: false });
    setCompletionModal({ open: false });
    loadMatch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}
        <Card className="glass-glow border-primary/20">
          <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-white/70">Cargando detalles del match...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}
        <Card className="glass-glow border-destructive/20">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-destructive mb-2">Error</p>
                <p className="text-white/80 text-sm mb-4">{error}</p>
                <Button
                  onClick={loadMatch}
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
      </div>
    );
  }

  const isClient = match.clientId === currentUserId;
  const oppositeParty = isClient ? match.professional : match.client;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back Button */}
      {onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      )}

      {/* Match Details Card */}
      <MatchDetailCard
        match={match}
        completionStatus={completionStatus}
        currentUserId={currentUserId}
        onRevealPhone={() =>
          handleRevealPhone(
            match.id,
            isClient ? match.professional.name : match.client.name,
          )
        }
        onRequestCompletion={() =>
          handleRequestCompletion(
            match.id,
            isClient ? match.professional.name : match.client.name,
          )
        }
        onConfirmCompletion={() =>
          handleConfirmCompletion(
            match.id,
            isClient ? match.professional.name : match.client.name,
          )
        }
        onFinalizeUnsuccessful={() => handleFinalizeUnsuccessful(match.id)}
        isLoading={false}
      />

      {/* Reviews Section */}
      {completionStatus && (
        <ReviewsSection
          matchId={match.id}
          currentUserId={currentUserId}
          reviewedUserName={oppositeParty.name}
          reviewedUserId={oppositeParty.id}
          isMatchCompleted={completionStatus.isCompleted}
        />
      )}

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
    </motion.div>
  );
}
