import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, CheckCircle2, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { getClientPremiumPriceFormatted } from "../../lib/constants/pricing";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "announcements" | "proposals" | "feedback";
  limitReached: number;
}

export function UpgradeModal({ isOpen, onClose, limitType, limitReached }: UpgradeModalProps) {
  const getModalContent = () => {
    switch (limitType) {
      case "announcements":
        return {
          title: "Límite de Anuncios Alcanzado",
          description: `Has alcanzado el límite de ${limitReached} anuncios mensuales del plan gratuito.`,
          icon: Crown,
        };
      case "proposals":
        return {
          title: "Límite de Propuestas Alcanzado",
          description: `Has alcanzado el límite de ${limitReached} propuestas mensuales del plan gratuito.`,
          icon: Zap,
        };
      case "feedback":
        return {
          title: "Límite de Feedback Alcanzado",
          description: `Has alcanzado el límite de ${limitReached} feedbacks mensuales del plan gratuito.`,
          icon: CheckCircle2,
        };
      default:
        return {
          title: "Límite Alcanzado",
          description: "Has alcanzado el límite de tu plan gratuito.",
          icon: Crown,
        };
    }
  };

  const content = getModalContent();
  const Icon = content.icon;

  const premiumFeatures = [
    "Anuncios ilimitados por mes",
    "Propuestas ilimitadas",
    "Feedback ilimitado",
    "Mayor visibilidad en búsquedas",
    "Estadísticas detalladas",
    "Soporte prioritario",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-modal-content p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-[95%] sm:max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-glow border-primary/40 relative shadow-2xl">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>

                <CardContent className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg"
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-3">
                      {content.title}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                      {content.description}
                    </p>
                  </div>

                  {/* Premium Features */}
                  <div className="mb-8 bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="h-5 w-5 text-primary" />
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        Beneficios del Plan Premium
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {premiumFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.08 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 mb-7 text-center"
                  >
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-4xl font-bold text-white">${getClientPremiumPriceFormatted()}</span>
                      <span className="text-white/60">ARS/mes</span>
                    </div>
                    <Badge variant="secondary" className="mt-3">
                      Profesionales verificados
                    </Badge>
                  </motion.div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                    >
                      <Button
                        onClick={() => window.location.href = "/pricing"}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl"
                      >
                        <Crown className="h-5 w-5 mr-2" />
                        Actualizar a Premium
                      </Button>
                    </motion.div>
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      className="w-full h-11 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Continuar con Plan Gratuito
                    </Button>
                  </div>

                  {/* Footer note */}
                  <p className="text-xs text-center text-muted-foreground/70 mt-4">
                    El plan gratuito se reinicia cada mes. Vuelve el próximo mes para crear más anuncios.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
