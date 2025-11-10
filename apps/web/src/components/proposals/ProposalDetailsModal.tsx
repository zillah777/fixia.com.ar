import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Star, MapPin, Clock, DollarSign, CheckCircle, AlertCircle,
  TrendingUp, MessageSquare, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { opportunitiesService } from '../../lib/services/opportunities.service';
import { VerificationBadge } from '../verification/VerificationBadge';
import { BaseModal } from '../modals/BaseModal';

interface Professional {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  location: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  isVerified?: boolean;
  verificationLevel?: string;
  userType?: 'professional' | 'client' | 'dual';
  created_at?: string;
  professional_profile?: {
    description: string;
    average_rating: number;
    total_reviews: number;
    bio?: string;
  };
}

interface ProposalDetailsModalProps {
  proposal: {
    id: string;
    message: string;
    quoted_price: number;
    delivery_time_days: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    professional: Professional;
  } | null;
  projectId: string;
  projectTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProposalUpdated?: (proposalId: string, status: 'accepted' | 'rejected') => void;
  isLoading?: boolean;
}

export function ProposalDetailsModal({
  proposal,
  projectId,
  projectTitle,
  open,
  onOpenChange,
  onProposalUpdated,
  isLoading = false,
}: ProposalDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!proposal) return null;

  const professional = proposal.professional;
  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-warning/20 text-warning border-warning/30', icon: AlertCircle },
    accepted: { label: 'Aceptada', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle },
    rejected: { label: 'Rechazada', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle },
  };

  const currentStatus = statusConfig[proposal.status];

  const handleAcceptProposal = async () => {
    setIsProcessing(true);
    try {
      await opportunitiesService.updateProposalStatus(
        projectId,
        proposal.id,
        'accepted'
      );
      toast.success('Propuesta aceptada exitosamente');
      onProposalUpdated?.(proposal.id, 'accepted');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al aceptar la propuesta'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProposal = async () => {
    setIsProcessing(true);
    try {
      await opportunitiesService.updateProposalStatus(
        projectId,
        proposal.id,
        'rejected'
      );
      toast.success('Propuesta rechazada');
      onProposalUpdated?.(proposal.id, 'rejected');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al rechazar la propuesta'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={professional.name}
      subtitle={projectTitle}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Professional Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 via-white/8 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4 space-y-3"
        >
          <div className="flex gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/40">
              <AvatarImage src={professional.avatar || undefined} />
              <AvatarFallback className="bg-primary/20">
                {professional.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white truncate">{professional.name}</p>
                {professional.isVerified && (
                  <VerificationBadge level={professional.verificationLevel || 'basic'} />
                )}
              </div>
              {professional.location && (
                <div className="flex items-center gap-1 text-sm text-white/60 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{professional.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating & Reviews */}
          {professional.professional_profile && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white">
                  {professional.professional_profile.average_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-white/60">
                ({professional.professional_profile.total_reviews} reseñas)
              </span>
            </div>
          )}
        </motion.div>

        {/* Proposal Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-white/10 via-white/8 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4 space-y-3"
        >
          {/* Price */}
          <div>
            <p className="text-xs text-white/60 mb-1">Precio Ofrecido</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${proposal.quoted_price.toLocaleString('es-AR')}
              </span>
              <span className="text-sm text-white/60">ARS</span>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Clock className="h-5 w-5 text-primary/80 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-white/60">Tiempo de Entrega</p>
              <p className="text-white font-semibold">
                {proposal.delivery_time_days} {proposal.delivery_time_days === 1 ? 'día' : 'días'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-white/60">Estado</p>
            <Badge className={`${currentStatus.color} border text-xs`}>
              <currentStatus.icon className="h-3 w-3 mr-1" />
              {currentStatus.label}
            </Badge>
          </div>
        </motion.div>

        {/* Proposal Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 via-white/8 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary/80 flex-shrink-0 mt-1" />
            <p className="text-xs text-white/60">Mensaje de la Propuesta</p>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            {proposal.message}
          </p>
        </motion.div>

        {/* Action Buttons */}
        {proposal.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-3 pt-2"
          >
            <Button
              onClick={handleRejectProposal}
              disabled={isProcessing || isLoading}
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            >
              Rechazar
            </Button>
            <Button
              onClick={handleAcceptProposal}
              disabled={isProcessing || isLoading}
              className="flex-1 bg-gradient-to-r from-success via-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceptar
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </BaseModal>
  );
}
