import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, Clock, CheckCircle2, AlertCircle, Sparkles, Calendar, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';
import { opportunitiesService, Opportunity } from '@/lib/services/opportunities.service';
import { formatDeadlineDate } from '@/lib/utils/date';

interface ProposalSubmissionCardProps {
  opportunity: Opportunity;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProposalSubmissionCard({ opportunity, onClose, onSuccess }: ProposalSubmissionCardProps) {
  const [proposalData, setProposalData] = useState({
    message: '',
    quotedPrice: opportunity.budget || 0,
    deliveryTimeDays: 7,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!proposalData.message || proposalData.message.length < 50) {
      toast.error("Por favor escribe una propuesta más detallada (mínimo 50 caracteres)");
      return;
    }

    if (!proposalData.quotedPrice || proposalData.quotedPrice <= 0) {
      toast.error("Por favor ingresa un presupuesto válido");
      return;
    }

    if (!proposalData.deliveryTimeDays || proposalData.deliveryTimeDays <= 0) {
      toast.error("Por favor ingresa un tiempo de entrega válido");
      return;
    }

    try {
      setSubmitting(true);

      await opportunitiesService.applyToOpportunity(opportunity.id, {
        message: proposalData.message,
        proposedBudget: proposalData.quotedPrice,
        estimatedDuration: `${proposalData.deliveryTimeDays} días`,
        portfolio: [],
        availableToStart: true,
        flexibleSchedule: true,
      });

      toast.success("¡Propuesta enviada exitosamente!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error sending proposal:', error);
      toast.error(error?.response?.data?.message || "Error al enviar la propuesta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12"
        onClick={onClose}
        style={{ isolation: 'isolate' }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full max-h-[90vh] lg:max-h-[85vh] xl:max-h-[80vh] border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient accent - FIXED */}
          <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-white/10 flex-shrink-0">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full z-10"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="pr-12">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-white">Enviar Propuesta</h2>
              </div>
              <p className="text-sm text-white/60 line-clamp-1">{opportunity.title}</p>
            </div>
          </div>

          {/* Scrollable content - FLEX GROW */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Project Summary Card */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-5 border border-white/5 space-y-4">
              {/* Client Info */}
              {opportunity.client && (
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                    <AvatarImage src={opportunity.client.avatar || undefined} alt={opportunity.client.name} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {opportunity.client.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{opportunity.client.name}</p>
                    <div className="flex items-center gap-2">
                      {opportunity.client.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="text-xs text-white/60">
                        {opportunity.client.verified ? 'Verificado' : 'No verificado'} · ⭐ {opportunity.client.averageRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                  {opportunity.myProposals !== undefined && opportunity.myProposals > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      {opportunity.myProposals === 1 ? '1 propuesta enviada' : '2 propuestas'}
                    </Badge>
                  )}
                </div>
              )}

              {/* Budget & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Presupuesto Cliente</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                      ${typeof opportunity.budget === 'number' ? opportunity.budget.toLocaleString('es-AR') : '0'}
                    </span>
                    <span className="text-sm text-white/60">ARS</span>
                  </div>
                  <p className="text-xs text-white/40">Monto que el cliente está dispuesto a pagar</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Vencimiento</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-warning" />
                    <span className="text-sm font-semibold text-white">
                      {formatDeadlineDate(opportunity.deadline)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">Fecha límite para aplicar</p>
                </div>
              </div>

              {/* Compatibility Badge */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Compatibilidad con tu perfil</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success via-primary to-primary rounded-full"
                        style={{ width: `${opportunity.matchScore || 80}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-primary">{opportunity.matchScore || 80}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Form */}
            <div className="space-y-5">
              {/* Message */}
              <div className="space-y-2">
                <Label className="text-white font-semibold text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Describe tu propuesta *
                </Label>
                <Textarea
                  placeholder="Explica por qué eres el candidato ideal para este proyecto. Menciona tu experiencia, enfoque y lo que te diferencia..."
                  value={proposalData.message}
                  onChange={(e) => setProposalData({ ...proposalData, message: e.target.value })}
                  className="bg-slate-800/80 border-white/10 min-h-32 text-white placeholder:text-white/40 focus:border-primary/50 rounded-lg resize-none"
                  rows={5}
                  maxLength={500}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className={proposalData.message.length >= 50 ? 'text-success' : 'text-warning'}>
                    {proposalData.message.length >= 50 ? '✓ Suficiente detalle' : '⚠ Mínimo 50 caracteres'}
                  </span>
                  <span className="text-white/40">{proposalData.message.length}/500</span>
                </div>
              </div>

              {/* Price & Delivery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                {/* Price */}
                <div className="space-y-2">
                  <Label className="text-white font-semibold text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Presupuesto Ofrecido *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">
                      ARS $
                    </span>
                    <Input
                      type="number"
                      placeholder="30000"
                      value={proposalData.quotedPrice === 0 ? '' : proposalData.quotedPrice}
                      onChange={(e) => setProposalData({ ...proposalData, quotedPrice: parseInt(e.target.value) || 0 })}
                      className="bg-slate-800/80 border-white/10 pl-20 pr-4 h-12 text-white font-bold text-lg placeholder:text-white/30 focus:border-primary/50 rounded-lg"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {proposalData.quotedPrice > 0 && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ${(proposalData.quotedPrice || 0).toLocaleString('es-AR')} ARS
                    </p>
                  )}
                </div>

                {/* Delivery Time */}
                <div className="space-y-2">
                  <Label className="text-white font-semibold text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    Tiempo de Entrega *
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="7"
                      value={proposalData.deliveryTimeDays === 0 ? '' : proposalData.deliveryTimeDays}
                      onChange={(e) => setProposalData({ ...proposalData, deliveryTimeDays: parseInt(e.target.value) || 0 })}
                      className="bg-slate-800/80 border-white/10 pr-16 h-12 text-white font-bold text-lg placeholder:text-white/30 focus:border-primary/50 rounded-lg"
                      min="1"
                      max="365"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-semibold">
                      días
                    </span>
                  </div>
                  {proposalData.deliveryTimeDays > 0 && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {proposalData.deliveryTimeDays} {proposalData.deliveryTimeDays === 1 ? 'día' : 'días'} de entrega
                    </p>
                  )}
                </div>
              </div>

              {/* Priority Badge */}
              {opportunity.priority && (
                <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <Zap className="h-4 w-4 text-warning flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-warning">
                      Prioridad: {opportunity.priority === 'urgent' ? 'Urgente' : opportunity.priority === 'high' ? 'Alta' : 'Normal'}
                    </p>
                    {opportunity.priority === 'urgent' && (
                      <p className="text-xs text-warning/80">El cliente necesita una respuesta rápida</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - FIXED */}
          <div className="border-t border-white/10 p-6 bg-slate-900/50 space-y-4 flex-shrink-0">
            <div className="flex items-start gap-2 text-xs text-white/50">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                Al enviar esta propuesta aceptas los{' '}
                <a href="/terms" className="text-primary hover:underline font-semibold">
                  términos de servicio
                </a>{' '}
                de Fixia
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/5"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !proposalData.message || proposalData.quotedPrice <= 0 || proposalData.deliveryTimeDays <= 0}
                className="flex-1 liquid-gradient text-white font-bold shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Propuesta
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
