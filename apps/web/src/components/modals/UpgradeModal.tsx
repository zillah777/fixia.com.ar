import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, CheckCircle2, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

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
          <div className="fixed inset-0 flex items-center justify-center z-modal-content p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-glow border-primary/30 relative">
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
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {content.title}
                    </h2>
                    <p className="text-muted-foreground/90 text-base">
                      {content.description}
                    </p>
                  </div>

                  {/* Premium Features */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-white">
                        Beneficios del Plan Premium
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {premiumFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          <span className="text-sm text-muted-foreground/90">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="glass border-white/10 rounded-lg p-4 mb-6 text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-bold text-white">$2.500</span>
                      <span className="text-muted-foreground/80">ARS/mes</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      Profesionales verificados
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => window.location.href = "/pricing"}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Actualizar a Premium
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      className="w-full h-11 text-muted-foreground hover:text-white"
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
