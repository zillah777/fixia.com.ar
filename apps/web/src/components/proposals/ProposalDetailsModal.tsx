import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Star, MapPin, Clock, DollarSign, CheckCircle, AlertCircle,
  TrendingUp, Shield, MessageSquare, Send
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

  const statusColor = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    accepted: 'bg-success/20 text-success border-success/30',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30'
  };

  const statusLabel = {
    pending: 'Pendiente',
    accepted: 'Aceptada ✓',
    rejected: 'Rechazada'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-transparent border-b border-white/10 px-6 py-6">
          <DialogHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <DialogTitle className="text-white text-2xl font-bold">{professional.name}</DialogTitle>
                <DialogDescription className="text-slate-300 mt-1">
                  Propuesta para: {projectTitle}
                </DialogDescription>
              </div>
              <Badge className={`${statusColor[proposal.status]} border`}>
                {statusLabel[proposal.status]}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Professional Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Avatar */}
                  <Avatar className="h-24 w-24 flex-shrink-0 border-2 border-primary/30">
                    <AvatarImage src={professional.avatar || undefined} />
                    <AvatarFallback className="text-lg font-bold">
                      {professional.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Professional Details Grid */}
                  <div className="flex-1 space-y-4">
                    {/* Verification Badge & Status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {professional.isVerified && (
                        <VerificationBadge
                          isVerified={true}
                          verificationLevel={professional.verificationLevel}
                          userType={professional.userType}
                          size="md"
                          showLabel={true}
                        />
                      )}
                      {!professional.isVerified && (
                        <Badge variant="outline" className="border-warning/30 text-warning/80">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No verificado
                        </Badge>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Rating */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-white">
                            {(professional.professional_profile?.average_rating ?? 0).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Calificación</p>
                      </div>

                      {/* Reviews */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="text-sm font-bold text-white mb-1">
                          {professional.professional_profile?.total_reviews ?? 0}
                        </div>
                        <p className="text-xs text-slate-400">Reseñas</p>
                      </div>

                      {/* Compatibility */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-sm font-bold text-success">{compatibilityScore}%</span>
                        </div>
                        <p className="text-xs text-slate-400">Compatibilidad</p>
                      </div>

                      {/* Tenure */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="text-sm font-bold text-white mb-1">
                          {monthsActive}m
                        </div>
                        <p className="text-xs text-slate-400">En la plataforma</p>
                      </div>
                    </div>

                    {/* Location */}
                    {professional.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{professional.location}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {professional.professional_profile?.bio && (
                      <p className="text-sm text-slate-300 line-clamp-2">
                        "{professional.professional_profile.bio}"
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Proposal Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Detalles de la Propuesta
                </h3>

                <div className="space-y-4">
                  {/* Price Section */}
                  <div className="bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-lg p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-300 text-sm">Presupuesto Propuesto</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-success">
                          ${proposal.quoted_price.toLocaleString('es-AR')}
                        </span>
                        <span className="text-sm text-slate-400">ARS</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Time */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-300">Tiempo de Entrega</p>
                      <p className="font-semibold text-white">
                        {proposal.delivery_time_days} {proposal.delivery_time_days === 1 ? 'día' : 'días'}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Mensaje del Profesional</p>
                    <p className="text-white text-sm leading-relaxed">
                      {proposal.message}
                    </p>
                  </div>

                  {/* Submitted Date */}
                  <p className="text-xs text-slate-400 text-center">
                    Propuesta enviada el {new Date(proposal.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 border-t border-white/10 pt-6"
          >
            {proposal.status === 'pending' ? (
              <>
                {/* Pending - Accept/Reject */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-white/70 mb-3">
                    ✨ Aceptar esta propuesta te permitirá obtener el contacto WhatsApp del profesional y comenzar a colaborar inmediatamente.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleAcceptProposal}
                    disabled={isProcessing || isLoading}
                    className="h-12 bg-gradient-to-r from-success via-success to-success/80 hover:from-success/90 hover:via-success/90 hover:to-success/70 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Aceptando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Aceptar Propuesta
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleRejectProposal}
                    disabled={isProcessing || isLoading}
                    variant="outline"
                    className="h-12 border-destructive/30 text-destructive hover:bg-destructive/10 font-bold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin mr-2" />
                        Rechazando...
                      </>
                    ) : (
                      'Rechazar'
                    )}
                  </Button>
                </div>
              </>
            ) : proposal.status === 'accepted' ? (
              <>
                {/* Accepted - Show success and WhatsApp button */}
                <div className="bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-success mb-1">¡Propuesta Aceptada!</p>
                      <p className="text-xs text-success/80">
                        Ahora puedes contactar al profesional por WhatsApp para coordinar los detalles.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleContactWhatsApp}
                  className="w-full h-12 bg-gradient-to-r from-green-500 via-green-500 to-green-600 hover:from-green-600 hover:via-green-600 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  Contactar por WhatsApp
                </Button>
              </>
            ) : (
              <>
                {/* Rejected - Show info */}
                <div className="bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-destructive mb-1">Propuesta Rechazada</p>
                      <p className="text-xs text-destructive/80">
                        Seleccionaste otra propuesta para este proyecto.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
