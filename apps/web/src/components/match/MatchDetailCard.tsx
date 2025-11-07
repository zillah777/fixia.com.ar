import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Match, CompletionStatus } from '@/lib/services/match.service';

interface MatchDetailCardProps {
  match: Match;
  completionStatus?: CompletionStatus;
  currentUserId: string;
  onRevealPhone?: () => void;
  onRequestCompletion?: () => void;
  onConfirmCompletion?: () => void;
  onLeaveReview?: () => void;
  isLoading?: boolean;
}

export function MatchDetailCard({
  match,
  completionStatus,
  currentUserId,
  onRevealPhone,
  onRequestCompletion,
  onConfirmCompletion,
  onLeaveReview,
  isLoading = false,
}: MatchDetailCardProps) {
  const isClient = match.clientId === currentUserId;
  const oppositeParty = isClient ? match.professional : match.client;

  const getStatusBadge = () => {
    const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
      active: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        icon: '🔵',
      },
      completed: {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        icon: '✅',
      },
      disputed: {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        icon: '⚠️',
      },
      cancelled: {
        bg: 'bg-gray-500/20',
        text: 'text-gray-300',
        icon: '❌',
      },
    };

    const style = statusStyles[match.status] || statusStyles.active;

    return (
      <Badge className={`${style.bg} ${style.text} border-0`}>
        {style.icon} {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
      </Badge>
    );
  };

  const getCompletionUI = () => {
    if (!completionStatus) return null;

    if (completionStatus.isCompleted) {
      return (
        <div className="bg-success/20 border border-success/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-semibold text-white">Servicio Completado</span>
          </div>
          <p className="text-sm text-white/80">
            Ambas partes confirmaron que el servicio está completo. Ya puedes dejar calificaciones.
          </p>
        </div>
      );
    }

    if (completionStatus.completionRequestedBy) {
      const isCurrentUserRequester = completionStatus.completionRequestedBy === currentUserId;

      return (
        <div className="bg-warning/20 border border-warning/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="font-semibold text-white">Pendiente Confirmación</span>
          </div>
          <p className="text-sm text-white/80 mb-4">
            {isCurrentUserRequester
              ? 'Espera la confirmación de la otra parte'
              : 'Tienes una solicitud de completación pendiente'}
          </p>

          {!isCurrentUserRequester && (
            <Button
              onClick={onConfirmCompletion}
              disabled={isLoading}
              className="w-full bg-success hover:bg-success/90 text-white"
              size="sm"
            >
              Confirmar Completación
            </Button>
          )}
        </div>
      );
    }

    return (
      <Button
        onClick={onRequestCompletion}
        disabled={isLoading}
        variant="outline"
        className="w-full text-white/70 hover:text-white hover:bg-white/10"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Marcar como Completado
      </Button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="glass-glow border-primary/20 overflow-hidden">
        <CardContent className="p-6">
          {/* Header with Status */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {match.proposal.message.substring(0, 100)}
                {match.proposal.message.length > 100 ? '...' : ''}
              </h3>
              <p className="text-sm text-white/60">
                Propuesta del {isClient ? 'Profesional' : 'Cliente'} •{' '}
                {new Date(match.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Opposite Party Info */}
          <div className="bg-white/5 border border-primary/10 rounded-xl p-4 mb-6">
            <p className="text-xs text-white/60 mb-3">
              {isClient ? 'Profesional Asignado' : 'Cliente Asignado'}
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={oppositeParty.avatar} />
                <AvatarFallback>{oppositeParty.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{oppositeParty.name}</span>
                  {oppositeParty.verified && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      ✓ Verificado
                    </Badge>
                  )}
                </div>
                {oppositeParty.rating !== undefined && (
                  <p className="text-xs text-white/60">
                    Rating: {oppositeParty.rating?.toFixed(1)} ⭐
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-1">Precio Acordado</p>
              <p className="text-lg font-semibold text-primary">
                ${match.proposal.quotedPrice.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-1">Plazo Entrega</p>
              <p className="text-lg font-semibold text-white">
                {match.proposal.deliveryTimeDays} días
              </p>
            </div>
          </div>

          {/* Completion Status */}
          <div className="mb-6">{getCompletionUI()}</div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onRevealPhone}
              disabled={isLoading || match.status !== 'active'}
              variant="outline"
              className="text-white/70 hover:text-white hover:bg-white/10"
              size="sm"
            >
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>

            <Button
              asChild
              variant="outline"
              className="text-white/70 hover:text-white hover:bg-white/10"
              size="sm"
            >
              <a
                href={`/messages?matchId=${match.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </a>
            </Button>
          </div>

          {/* Review Button (if completed) */}
          {completionStatus?.canLeaveReview && (
            <Button
              onClick={onLeaveReview}
              disabled={isLoading}
              className="w-full mt-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="sm"
            >
              Dejar Calificación
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
