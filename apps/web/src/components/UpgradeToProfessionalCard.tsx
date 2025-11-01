import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sparkles, Check, X, Plus, Loader2, Star, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { api } from "../lib/api";

interface UpgradeToProfessionalCardProps {
  userType: string;
  onUpgradeSuccess: () => void;
}

export function UpgradeToProfessionalCard({ userType, onUpgradeSuccess }: UpgradeToProfessionalCardProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    specialties: [] as string[],
    years_experience: 0,
    currentSpecialty: "", // Temporal para agregar especialidades
  });

  // Si ya es profesional o dual, no mostrar
  if (userType === 'professional' || userType === 'dual') {
    return null;
  }

  const handleAddSpecialty = () => {
    if (formData.currentSpecialty.trim() && formData.specialties.length < 10) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, formData.currentSpecialty.trim()],
        currentSpecialty: "",
      });
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    // Validación
    if (!formData.bio.trim()) {
      toast.error("La biografía es requerida");
      return;
    }

    if (formData.specialties.length === 0) {
      toast.error("Debes agregar al menos una especialidad");
      return;
    }

    if (formData.bio.length < 50) {
      toast.error("La biografía debe tener al menos 50 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/users/upgrade-to-professional', {
        bio: formData.bio,
        specialties: formData.specialties,
        years_experience: formData.years_experience || 0,
      });

      toast.success("¡Felicitaciones! Tu cuenta ha sido actualizada a Profesional DUAL", {
        description: "Ahora puedes publicar servicios y recibir propuestas",
        duration: 5000,
      });

      setShowUpgradeDialog(false);
      onUpgradeSuccess();

      // Recargar página para actualizar contexto
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error upgrading to professional:', error);
      toast.error(error.response?.data?.message || "Error al actualizar cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="glass border-primary/30 overflow-hidden relative">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

        <CardHeader className="relative p-3 sm:p-4 md:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary animate-pulse flex-shrink-0" />
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl truncate">Conviértete en Profesional</CardTitle>
              </div>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm line-clamp-2">
                Ofrece servicios y genera ingresos manteniendo tu cuenta
              </CardDescription>
            </div>
            <Badge variant="secondary" className="glass flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
              <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-0.5" />
              DUAL
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
          {/* Benefits grid - Show only 2 on mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-1.5 sm:space-x-2 md:space-x-3 p-2 sm:p-2.5 md:p-3 rounded-lg glass border border-white/10"
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-[10px] sm:text-xs md:text-sm truncate">Genera Ingresos</h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">Vende servicios</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-1.5 sm:space-x-2 md:space-x-3 p-2 sm:p-2.5 md:p-3 rounded-lg glass border border-white/10"
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-[10px] sm:text-xs md:text-sm truncate">Amplía tu Red</h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">Más clientes</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-1.5 sm:space-x-2 md:space-x-3 p-2 sm:p-2.5 md:p-3 rounded-lg glass border border-white/10"
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-[10px] sm:text-xs md:text-sm truncate">Cuenta DUAL</h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">2 en 1</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-1.5 sm:space-x-2 md:space-x-3 p-2 sm:p-2.5 md:p-3 rounded-lg glass border border-white/10"
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-success" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-[10px] sm:text-xs md:text-sm truncate">100% Gratis</h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">Sin costos</p>
              </div>
            </motion.div>
          </div>

          <Button
            onClick={() => setShowUpgradeDialog(true)}
            className="w-full liquid-gradient text-white font-medium shadow-lg hover:shadow-primary/50 transition-all text-[11px] sm:text-xs md:text-sm h-8 sm:h-9 md:h-10"
            size="sm"
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Actualizar a Profesional DUAL</span>
          </Button>

          <p className="text-[9px] sm:text-[10px] md:text-xs text-center text-muted-foreground px-1 sm:px-2 line-clamp-2">
            Mantén tu capacidad de contratar servicios + Ofrece tus propios servicios
          </p>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto glass">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>Actualizar a Profesional DUAL</span>
            </DialogTitle>
            <DialogDescription className="text-base">
              Completa tu perfil profesional para comenzar a ofrecer servicios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-medium">
                Biografía Profesional *
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe tu experiencia, habilidades y qué te hace único como profesional..."
                className="glass border-white/20 min-h-[120px] resize-none"
                maxLength={1000}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/1000 caracteres (mínimo 50)
              </p>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Especialidades * (máx. 10)
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={formData.currentSpecialty}
                  onChange={(e) => setFormData({ ...formData, currentSpecialty: e.target.value })}
                  placeholder="Ej: Desarrollo Web, Plomería, Diseño Gráfico"
                  className="glass border-white/20"
                  disabled={isSubmitting || formData.specialties.length >= 10}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddSpecialty}
                  disabled={!formData.currentSpecialty.trim() || formData.specialties.length >= 10 || isSubmitting}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Specialties chips */}
              <AnimatePresence mode="popLayout">
                {formData.specialties.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    {formData.specialties.map((specialty, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20"
                      >
                        <Check className="h-3 w-3" />
                        <span>{specialty}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(index)}
                          disabled={isSubmitting}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-xs text-muted-foreground">
                {formData.specialties.length}/10 especialidades
              </p>
            </div>

            {/* Years of experience */}
            <div className="space-y-2">
              <Label htmlFor="years_experience" className="text-base font-medium">
                Años de Experiencia (opcional)
              </Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_experience || ""}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                className="glass border-white/20"
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.bio.trim() || formData.specialties.length === 0}
                className="flex-1 liquid-gradient text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Confirmar Actualización
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
