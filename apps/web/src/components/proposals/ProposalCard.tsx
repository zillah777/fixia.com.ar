import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, MapPin, Clock, DollarSign, CheckCircle, AlertCircle, MessageSquare, Loader2, ClipboardCheck, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { VerificationBadge } from '../verification/VerificationBadge';
import { toast } from 'sonner';
import opportunitiesService from '../../lib/services/opportunities.service';
import { matchService } from '../../lib/services/match.service';
import { useSecureAuth } from '../context/SecureAuthContext';

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

interface Proposal {
  id: string;
  message: string;
  quoted_price: number;
  delivery_time_days: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  professional: Professional;
}

interface ProposalCardProps {
  proposal: Proposal;
  projectId: string;
  projectTitle: string;
  isNew: boolean;
  duplicateCount: number;
  onProposalUpdated?: (proposalId: string, status: 'accepted' | 'rejected') => void;
}

export function ProposalCard({
  proposal,
  projectId,
  projectTitle,
  isNew,
  duplicateCount,
  onProposalUpdated,
}: ProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const professional = proposal.professional;
  const { user } = useSecureAuth();

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-warning/20 text-warning border-warning/30', icon: AlertCircle },
    accepted: { label: 'Aceptada', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle },
    rejected: { label: 'Rechazada', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle },
  };

  const currentStatus = statusConfig[proposal.status];

  const handleAcceptProposal = async () => {
    setIsProcessing(true);
    try {
      await opportunitiesService.acceptProposal(projectId, proposal.id);
      toast.success('Propuesta aceptada exitosamente. Ya puedes contactar al profesional por WhatsApp.');
      onProposalUpdated?.(proposal.id, 'accepted');
      setShowWhatsApp(true);
      // Crear match SOLO si es pending y tienes todos los datos
      if (proposal.status === 'pending' && user && professional.id) {
        try {
          await matchService.createMatch({
            proposalId: proposal.id,
            projectId,
            clientId: user.id,
            professionalId: professional.id
          });
          toast.success('¡Match creado exitosamente! Ahora pueden avanzar al workflow de cierre y review.');
        } catch (err: any) {
          if (err?.response?.status === 409) {
            toast('El match ya existe para esta propuesta/trabajo.');
          } else {
            toast.error('Error al crear el match.');
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al aceptar la propuesta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProposal = async () => {
    setIsProcessing(true);
    try {
      await opportunitiesService.rejectProposal(projectId, proposal.id);
      toast.success('Propuesta rechazada');
      onProposalUpdated?.(proposal.id, 'rejected');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al rechazar la propuesta');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-white/8 via-white/6 to-white/4 backdrop-blur-md border border-white/15 hover:border-white/25 hover:bg-white/12 transition-all rounded-xl shadow-lg overflow-hidden">
        {/* Collapsed View */}
        <CardContent className="p-3 sm:p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <Avatar className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 border border-white/10 ring-2 ring-primary/40">
                  <AvatarImage src={professional.avatar || undefined} />
                  <AvatarFallback className="text-xs sm:text-sm font-bold bg-primary/20">
                    {professional.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Name and Price */}
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-white text-xs sm:text-sm truncate">
                        {professional.name}
                      </h4>
                      {professional.isVerified && (
                        <VerificationBadge level={professional.verificationLevel || 'basic'} />
                      )}
                    </div>
                    <span className="flex-shrink-0 text-primary border border-primary/30 bg-primary/10 text-xs px-2 py-0.5 whitespace-nowrap rounded-md font-bold shadow-sm">
                      ${proposal.quoted_price.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                    {isNew && (
                      <Badge className="bg-success/20 text-success border-success/30 text-xs px-2 py-0.5 rounded">
                        ✨ Nueva
                      </Badge>
                    )}
                    {duplicateCount > 1 && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-2 py-0.5 rounded">
                        🔄 {duplicateCount}
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {professional.professional_profile?.average_rating !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <span className="font-semibold">{professional.professional_profile.average_rating.toFixed(1)}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">({professional.professional_profile.total_reviews})</span>
                    </div>
                  )}

                  {/* Preview Message */}
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                    {proposal.message}
                  </p>
                </div>
              </div>

              {/* Status and Duration */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge className={`text-xs px-2 py-0.5 whitespace-nowrap rounded font-medium border ${currentStatus.color}`}>
                  <currentStatus.icon className="h-3 w-3 mr-1" />
                  {currentStatus.label}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">
                  {proposal.delivery_time_days}d
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
              </div>
            </div>
          </button>
        </CardContent>

        {/* Expanded View (solo contenido de la propuesta/detalles) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden border-t border-white/15"
            >
              <div className="p-3 sm:p-4 space-y-4 bg-gradient-to-b from-white/2 to-transparent">
                {/* Proposal Details (sin info profesional duplicada) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
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
                  transition={{ delay: 0.15 }}
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
                    transition={{ delay: 0.2 }}
                    className="flex gap-3 pt-2"
                  >
                    <Button
                      onClick={handleRejectProposal}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    >
                      Rechazar
                    </Button>
                    <Button
                      onClick={handleAcceptProposal}
                      disabled={isProcessing}
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
                {/* WhatsApp Contacto: Solo si aceptada */}
                {((proposal.status === 'accepted') || showWhatsApp) && professional.whatsapp_number && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-green-900/60 to-green-700/30 border border-success/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Phone className="h-6 w-6 text-success flex-shrink-0" />
                    <div className="flex-1">
                      <span className="block text-white font-semibold text-sm mb-1">¡Puedes contactar directamente a {professional.name} por WhatsApp!</span>
                      <span className="block text-lg font-mono tracking-wide bg-black/30 px-2 py-1 rounded text-success mb-2">{professional.whatsapp_number}</span>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(professional.whatsapp_number || '');
                            toast.success('Número de WhatsApp copiado');
                          }}
                          variant="outline"
                        >
                          <ClipboardCheck className="h-4 w-4 mr-1" /> Copiar número
                        </Button>
                        <Button
                          size="sm"
                          className="bg-success/70 hover:bg-success text-white shadow"
                          onClick={() => window.open(`https://wa.me/${professional.whatsapp_number}`,'_blank')}
                        >
                          <Phone className="h-4 w-4 mr-2" /> WhatsApp Directo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
