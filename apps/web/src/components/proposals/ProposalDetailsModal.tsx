import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Star, MapPin, Clock, DollarSign, CheckCircle, AlertCircle,
  TrendingUp, MessageSquare, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { opportunitiesService } from '../../lib/services/opportunities.service';
import { VerificationBadge } from '../verification/VerificationBadge';

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
  isLoading = false
}: ProposalDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!proposal) return null;

  const professional = proposal.professional;
  const profileCreatedDate = professional.created_at ? new Date(professional.created_at) : null;
  const monthsActive = profileCreatedDate
    ? Math.floor((Date.now() - profileCreatedDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  const compatibilityScore = proposal.professional.professional_profile?.average_rating
    ? Math.round((proposal.professional.professional_profile.average_rating / 5) * 100)
    : 0;

  const handleAcceptProposal = async () => {
    try {
      setIsProcessing(true);
      await opportunitiesService.acceptProposal(projectId, proposal.id);
      toast.success('¡Propuesta aceptada! Ahora puedes contactar al profesional por WhatsApp');
      onProposalUpdated?.(proposal.id, 'accepted');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      toast.error(error?.response?.data?.message || 'Error al aceptar la propuesta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProposal = async () => {
    try {
      setIsProcessing(true);
      await opportunitiesService.rejectProposal(projectId, proposal.id);
      toast.success('Propuesta rechazada');
      onProposalUpdated?.(proposal.id, 'rejected');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      toast.error(error?.response?.data?.message || 'Error al rechazar la propuesta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactWhatsApp = () => {
    const phone = professional.whatsapp_number || professional.phone;
    if (phone) {
      const message = encodeURIComponent(
        `Hola ${professional.name}, vi tu propuesta para "${projectTitle}" en Fixia. Me gustaría conversar contigo.`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      toast.error('Este profesional no tiene WhatsApp registrado');
    }
  };

  const statusConfig = {
    pending: {
      color: 'bg-warning/15 border-warning/40 text-warning',
      label: 'Pendiente',
      icon: AlertCircle
    },
    accepted: {
      color: 'bg-success/15 border-success/40 text-success',
      label: 'Aceptada ✓',
      icon: CheckCircle
    },
    rejected: {
      color: 'bg-destructive/15 border-destructive/40 text-destructive',
      label: 'Rechazada',
      icon: AlertCircle
    }
  };

  const currentStatus = statusConfig[proposal.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[95vh] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-800 border-white/15 overflow-y-auto rounded-2xl p-0 gap-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {professional.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 truncate">
                Propuesta para: {projectTitle}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={`${currentStatus.color} border whitespace-nowrap`}>
                <currentStatus.icon className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{currentStatus.label}</span>
                <span className="sm:hidden text-xs">{currentStatus.label.split(' ')[0]}</span>
              </Badge>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
          {/* Professional Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 border border-white/10 rounded-xl p-4 sm:p-5"
          >
            <div className="flex gap-4 sm:gap-5">
              {/* Avatar */}
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 border-2 border-primary/40 ring-2 ring-primary/20">
                <AvatarImage src={professional.avatar || undefined} />
                <AvatarFallback className="text-lg sm:text-xl font-bold bg-primary/20">
                  {professional.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Verification */}
                <div className="flex items-center gap-2 flex-wrap">
                  {professional.isVerified ? (
                    <VerificationBadge
                      isVerified={true}
                      verificationLevel={professional.verificationLevel}
                      userType={professional.userType}
                      size="sm"
                      showLabel={true}
                    />
                  ) : (
                    <Badge variant="outline" className="border-warning/40 text-warning/80 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No verificado
                    </Badge>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Rating */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {(professional.professional_profile?.average_rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Calificación</p>
                  </div>

                  {/* Reviews */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                      {professional.professional_profile?.total_reviews ?? 0}
                    </div>
                    <p className="text-xs text-slate-500">Reseñas</p>
                  </div>

                  {/* Compatibility */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
                      <span className="text-xs sm:text-sm font-bold text-success">{compatibilityScore}%</span>
                    </div>
                    <p className="text-xs text-slate-500">Compatibilidad</p>
                  </div>

                  {/* Tenure */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                      {monthsActive}m
                    </div>
                    <p className="text-xs text-slate-500">Antigüedad</p>
                  </div>
                </div>

                {/* Location */}
                {professional.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 pt-1">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{professional.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {professional.professional_profile?.bio && (
              <p className="text-xs sm:text-sm text-slate-300 mt-3 p-3 bg-white/5 rounded-lg border border-white/5 italic">
                "{professional.professional_profile.bio}"
              </p>
            )}
          </motion.div>

          {/* Price Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-success/20 via-success/15 to-transparent border border-success/30 rounded-xl p-4 sm:p-5"
          >
            <p className="text-xs sm:text-sm text-slate-400 mb-2">Presupuesto Propuesto</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-success">
                ${proposal.quoted_price.toLocaleString('es-AR')}
              </span>
              <span className="text-xs sm:text-sm text-slate-400">ARS</span>
            </div>
          </motion.div>

          {/* Delivery Time */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-500/15 to-blue-500/5 border border-blue-500/30 rounded-xl"
          >
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Tiempo de Entrega</p>
              <p className="font-semibold text-white text-sm sm:text-base">
                {proposal.delivery_time_days} {proposal.delivery_time_days === 1 ? 'día' : 'días'}
              </p>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl"
          >
            <p className="text-xs sm:text-sm text-slate-500 mb-2.5 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensaje del Profesional
            </p>
            <p className="text-sm sm:text-base text-white leading-relaxed break-words">
              {proposal.message}
            </p>
          </motion.div>

          {/* Date */}
          <p className="text-xs text-slate-500 text-center py-1">
            Propuesta enviada el {new Date(proposal.created_at).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/80 border-t border-white/10 px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 backdrop-blur-sm"
        >
          {proposal.status === 'pending' && (
            <>
              <div className="bg-gradient-to-r from-primary/15 to-transparent border border-primary/20 rounded-lg p-3 text-xs sm:text-sm text-white/70">
                ✨ Aceptar te permitirá obtener el contacto del profesional y comenzar a colaborar.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleAcceptProposal}
                  disabled={isProcessing || isLoading}
                  className="h-11 sm:h-12 bg-gradient-to-r from-success via-success to-success/80 hover:from-success/90 hover:via-success/90 hover:to-success/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Aceptando...</span>
                      <span className="sm:hidden">Aceptar...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">Aceptar Propuesta</span>
                      <span className="sm:hidden">Aceptar</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRejectProposal}
                  disabled={isProcessing || isLoading}
                  variant="outline"
                  className="h-11 sm:h-12 border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Rechazando...</span>
                      <span className="sm:hidden">Rechazar...</span>
                    </>
                  ) : (
                    <span>Rechazar</span>
                  )}
                </Button>
              </div>
            </>
          )}

          {proposal.status === 'accepted' && (
            <>
              <div className="bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-lg p-3 sm:p-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-success text-sm sm:text-base">¡Propuesta Aceptada!</p>
                    <p className="text-xs sm:text-sm text-success/80 mt-0.5">
                      Contacta al profesional por WhatsApp para coordinar los detalles.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContactWhatsApp}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-500 via-green-500 to-green-600 hover:from-green-600 hover:via-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Contactar por WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </Button>
            </>
          )}

          {proposal.status === 'rejected' && (
            <div className="bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/30 rounded-lg p-3 sm:p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive text-sm sm:text-base">Propuesta Rechazada</p>
                  <p className="text-xs sm:text-sm text-destructive/80 mt-0.5">
                    Seleccionaste otra propuesta para este proyecto.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
