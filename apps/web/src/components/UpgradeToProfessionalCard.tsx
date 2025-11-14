import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sparkles, Check, X, Plus, Loader2, Star, TrendingUp, Users, Zap, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { api } from "../lib/api";
import { extractErrorMessage } from "../utils/errorHandler";

interface UpgradeToProfessionalCardProps {
  userType: string;
  onUpgradeSuccess: () => void;
}

export function UpgradeToProfessionalCard({ userType, onUpgradeSuccess }: UpgradeToProfessionalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
      await api.post('/users/upgrade-to-professional', {
        bio: formData.bio,
        specialties: formData.specialties,
        years_experience: formData.years_experience || 0,
      });

      toast.success("¡Felicitaciones! Tu cuenta ha sido actualizada a Profesional DUAL", {
        description: "Ahora puedes publicar servicios y recibir propuestas",
        duration: 5000,
      });

      setIsExpanded(false);
      onUpgradeSuccess();

      // Recargar página para actualizar contexto
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: unknown) {
      console.error('Error upgrading to professional:', error);
      const errorMessage = extractErrorMessage(error, 'Error al actualizar cuenta');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
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
          {/* Benefits grid */}
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
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-[10px] sm:text-xs md:text-sm truncate">Desde $3.900/mes</h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">Suscripción Premium</p>
              </div>
            </motion.div>
          </div>

          {/* Toggle Button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full liquid-gradient text-white font-medium shadow-lg hover:shadow-primary/50 transition-all text-[11px] sm:text-xs md:text-sm h-8 sm:h-9 md:h-10"
            size="sm"
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{isExpanded ? 'Cancelar' : 'Actualizar a Profesional DUAL'}</span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ml-1.5 sm:ml-2 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ml-1.5 sm:ml-2 flex-shrink-0" />
            )}
          </Button>

          {!isExpanded && (
            <p className="text-[9px] sm:text-[10px] md:text-xs text-center text-muted-foreground px-1 sm:px-2 line-clamp-2">
              Mantén tu capacidad de contratar servicios + Ofrece tus propios servicios
            </p>
          )}

          {/* Expandable Form Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-4 sm:space-y-5 md:space-y-6 pt-4 border-t border-white/10">
                  {/* Form Header */}
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Completa tu Perfil Profesional
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Proporciona información sobre tu experiencia y especialidades para atraer más clientes
                    </p>

                    {/* Subscription Alert */}
                    <div className="p-3 sm:p-4 rounded-lg glass border border-warning/30 bg-warning/5">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-warning">Suscripción Premium Requerida</h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                            Para convertirte en profesional DUAL necesitas una <span className="font-medium text-foreground">suscripción Premium activa de $3.900/mes</span>.
                            Esta suscripción te permite publicar servicios, recibir propuestas y acceder a todas las herramientas profesionales de la plataforma.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm sm:text-base font-medium flex items-center gap-1">
                      Biografía Profesional
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Describe tu experiencia, habilidades y qué te hace único como profesional..."
                      className="glass border-white/20 min-h-[100px] sm:min-h-[120px] resize-none text-sm focus:border-primary/50 transition-colors"
                      maxLength={1000}
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Mínimo 50 caracteres
                      </p>
                      <p className={`text-[10px] sm:text-xs font-medium ${
                        formData.bio.length < 50 ? 'text-muted-foreground' :
                        formData.bio.length < 100 ? 'text-warning' : 'text-success'
                      }`}>
                        {formData.bio.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-1">
                      Especialidades
                      <span className="text-destructive">*</span>
                      <span className="text-xs text-muted-foreground font-normal">(máx. 10)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.currentSpecialty}
                        onChange={(e) => setFormData({ ...formData, currentSpecialty: e.target.value })}
                        placeholder="Ej: Desarrollo Web, Plomería, Diseño Gráfico"
                        className="glass border-white/20 text-sm focus:border-primary/50 transition-colors"
                        disabled={isSubmitting || formData.specialties.length >= 10}
                        onKeyDown={(e) => {
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
                        className="flex-shrink-0 liquid-gradient"
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
                          className="flex flex-wrap gap-2 pt-2"
                        >
                          {formData.specialties.map((specialty, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border border-primary/20 glass"
                            >
                              <Check className="h-3 w-3" />
                              <span>{specialty}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecialty(index)}
                                disabled={isSubmitting}
                                className="ml-1 hover:text-destructive transition-colors"
                                aria-label={`Eliminar ${specialty}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className={`text-[10px] sm:text-xs font-medium ${
                      formData.specialties.length === 0 ? 'text-muted-foreground' :
                      formData.specialties.length >= 10 ? 'text-warning' : 'text-success'
                    }`}>
                      {formData.specialties.length}/10 especialidades agregadas
                    </p>
                  </div>

                  {/* Years of experience */}
                  <div className="space-y-2">
                    <Label htmlFor="years_experience" className="text-sm sm:text-base font-medium">
                      Años de Experiencia
                      <span className="text-xs text-muted-foreground font-normal ml-1">(opcional)</span>
                    </Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.years_experience || ""}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                      className="glass border-white/20 text-sm focus:border-primary/50 transition-colors"
                      placeholder="Ej: 5"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2 p-3 sm:p-4 rounded-lg glass border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium">Completitud del perfil</span>
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {Math.round(((formData.bio.length >= 50 ? 1 : 0) + (formData.specialties.length > 0 ? 1 : 0)) / 2 * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-blue-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((formData.bio.length >= 50 ? 1 : 0) + (formData.specialties.length > 0 ? 1 : 0)) / 2 * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                      <div className={`flex items-center gap-1 ${formData.bio.length >= 50 ? 'text-success' : 'text-muted-foreground'}`}>
                        {formData.bio.length >= 50 ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        <span>Biografía completa</span>
                      </div>
                      <div className={`flex items-center gap-1 ${formData.specialties.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        {formData.specialties.length > 0 ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        <span>Especialidades agregadas</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.bio.trim() || formData.bio.length < 50 || formData.specialties.length === 0}
                    className="w-full liquid-gradient text-white font-bold text-sm sm:text-base h-10 sm:h-11 shadow-xl hover:shadow-primary/50 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Confirmar Actualización
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Import missing icons
import { CheckCircle2, Circle } from "lucide-react";
