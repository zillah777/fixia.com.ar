import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Send, DollarSign, Calendar, MapPin, Target,
  Clock, Heart, Tag, AlertCircle, CheckCircle2, Users
} from "lucide-react";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { UpgradeModal } from "../components/modals/UpgradeModal";
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";
import { opportunitiesService, CreateOpportunityData } from "../lib/services/opportunities.service";
import { servicesService, ServiceCategory } from "../lib/services/services.service";

interface OpportunityFormData {
  title: string;
  description: string;
  category_id: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  location: string;
  skills_required: string[];
}

export default function NewOpportunityPage() {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    category_id: '',
    budget_min: 0,
    budget_max: 0,
    deadline: '',
    location: user?.location || '',
    skills_required: []
  });

  const [currentSkill, setCurrentSkill] = useState('');

  // Redirect if not authenticated (professionals with dual role can create announcements as clients)
  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un anuncio');
      navigate('/login');
    }
  }, [user, navigate]);

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const backendCategories = await servicesService.getCategories();
        if (Array.isArray(backendCategories)) {
          const validCategories = backendCategories.filter(cat => 
            cat && typeof cat === 'object' && cat.id && cat.name
          );
          setCategories(validCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
        toast.error('Error al cargar las categorías');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const updateFormData = (field: keyof OpportunityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills_required.includes(currentSkill.trim())) {
      updateFormData('skills_required', [...formData.skills_required, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateFormData('skills_required', formData.skills_required.filter(skill => skill !== skillToRemove));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('El título del anuncio es obligatorio');
      return false;
    }
    
    if (formData.title.trim().length < 10) {
      toast.error('El título debe tener al menos 10 caracteres');
      return false;
    }
    
    if (formData.title.trim().length > 100) {
      toast.error('El título no puede exceder 100 caracteres');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('La descripción del servicio es obligatoria');
      return false;
    }
    
    if (formData.description.trim().length < 50) {
      toast.error('La descripción debe tener al menos 50 caracteres para dar más detalles a los profesionales');
      return false;
    }
    
    if (formData.description.trim().length > 2000) {
      toast.error('La descripción no puede exceder 2000 caracteres');
      return false;
    }

    if (!formData.category_id) {
      toast.error('Debes seleccionar una categoría para tu anuncio');
      return false;
    }

    if (formData.budget_min > 0 && formData.budget_max > 0 && formData.budget_min >= formData.budget_max) {
      toast.error('El presupuesto mínimo debe ser menor al máximo');
      return false;
    }

    if (formData.budget_min > 0 && formData.budget_min < 1000) {
      toast.error('El presupuesto mínimo debe ser de al menos $1.000 ARS');
      return false;
    }

    if (formData.budget_max > 0 && formData.budget_max > 10000000) {
      toast.error('El presupuesto máximo no puede exceder $10.000.000 ARS');
      return false;
    }

    // Validar fecha límite si se proporciona
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        toast.error('La fecha límite debe ser posterior a hoy');
        return false;
      }
    }

    return true;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setPublishing(true);
    try {
      const opportunityData: CreateOpportunityData = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        budget_min: formData.budget_min > 0 ? formData.budget_min : undefined,
        budget_max: formData.budget_max > 0 ? formData.budget_max : undefined,
        deadline: formData.deadline || undefined,
        location: formData.location || undefined,
        skills_required: formData.skills_required.length > 0 ? formData.skills_required : undefined};

      await opportunitiesService.createOpportunity(opportunityData);
      
      toast.success('¡Anuncio publicado correctamente!', {
        description: 'Los profesionales podrán ver tu proyecto y contactarte'
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error publishing opportunity:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error al publicar el anuncio";

      // Check if error is due to free plan limit reached
      if (errorMessage.includes('límite') || errorMessage.includes('limit')) {
        setShowUpgradeModal(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setPublishing(false);
    }
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Crear Anuncio del Servicio que Necesitas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe lo que necesitas y conecta con profesionales especializados
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Información del Anuncio</span>
              </CardTitle>
              <CardDescription>
                Completa los detalles para que los profesionales entiendan tus necesidades
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label>Título del Anuncio *</Label>
                <Input
                  placeholder="Ej: Necesito peluquería profesional para evento especial"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="glass border-white/20"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Sé específico sobre el servicio que necesitas</span>
                  <span>{formData.title.length}/100</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label>Descripción Detallada *</Label>
                <Textarea
                  placeholder="Describe el servicio que necesitas en detalle: qué tipo de trabajo buscas, características específicas, plazos esperados, etc."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="glass border-white/20 min-h-32"
                  rows={6}
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mínimo 50 caracteres recomendados</span>
                  <span>{formData.description.length}/2000</span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoría *</Label>
                {loadingCategories ? (
                  <div className="h-10 glass border-white/20 rounded-md animate-pulse" />
                ) : (
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => updateFormData('category_id', value)}
                  >
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Selecciona la categoría del servicio que necesitas" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Budget Range */}
              <div className="space-y-4">
                <Label>Presupuesto (ARS)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Mínimo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="10.000"
                        min="1000"
                        max="10000000"
                        value={formData.budget_min || ''}
                        onChange={(e) => updateFormData('budget_min', parseInt(e.target.value) || 0)}
                        className="glass border-white/20 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Máximo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="50.000"
                        min="1000"
                        max="10000000"
                        value={formData.budget_max || ''}
                        onChange={(e) => updateFormData('budget_max', parseInt(e.target.value) || 0)}
                        className="glass border-white/20 pl-10"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Opcional: Ayuda a los profesionales a saber si tu presupuesto se ajusta a sus servicios
                </p>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label>Fecha Límite (Opcional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => updateFormData('deadline', e.target.value)}
                    className="glass border-white/20 pl-10"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Ej: Trelew, Chubut, Buenos Aires, o 'Remoto'"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="glass border-white/20 pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Opcional: Especifica dónde necesitas el servicio o si puede ser remoto
                </p>
              </div>

              {/* Skills Required */}
              <div className="space-y-4">
                <Label>Habilidades Requeridas</Label>
                <p className="text-sm text-muted-foreground">Escribe una habilidad y presiona Enter para añadirla</p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ej: Peluquería, Desarrollo Web, Diseño Gráfico"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    className="glass border-white/20 flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addSkill}
                    variant="outline" 
                    className="glass border-white/20 hover:bg-primary/10"
                    disabled={!currentSkill.trim()}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.skills_required.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Habilidades agregadas ({formData.skills_required.length})
                      </span>
                      {formData.skills_required.length > 0 && (
                        <button
                          onClick={() => updateFormData('skills_required', [])}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Limpiar todo
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map((skill, index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Badge 
                            className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/40 pr-1 hover:from-primary/30 hover:to-primary/40 transition-all duration-200 cursor-default"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:bg-primary/30 rounded-full p-0.5 transition-colors duration-200"
                              title={`Eliminar ${skill}`}
                            >
                              ×
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info Alert */}
              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <strong className="text-primary">¿Cómo funciona?</strong> Una vez publicado, los profesionales podrán ver tu anuncio
                  en la sección "Oportunidades" y contactarte directamente con propuestas para tu servicio.
                </AlertDescription>
              </Alert>

              {/* Publish Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="glass border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-6"
                >
                  {publishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar Anuncio
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="announcements"
        limitReached={3}
      />
    </div>
  );
}