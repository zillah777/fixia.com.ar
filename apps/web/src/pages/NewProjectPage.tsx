import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FixiaNavigation } from "../components/FixiaNavigation";
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Plus,
  Image, FileText, DollarSign, Tag, Settings,
  Eye, Save, AlertCircle, Info, Heart, Briefcase, Globe,
  Camera, Trash2, Zap, Shield, Loader2, Search, CheckCircle,
  HelpCircle, Lightbulb, Package, Calendar, Clock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";
import { servicesService, ServiceCategory } from "../lib/services/services.service";
import { uploadService } from "../lib/services/upload.service";

// Icon mapping for categories
const getIconComponent = (iconName: string) => {
  if (!iconName || typeof iconName !== 'string') {
    return Heart; // Safe fallback
  }
  
  const iconMap: Record<string, any> = {
    Globe,
    Camera, 
    Image,
    Heart,
    FileText,
    Eye,
    Briefcase,
    Shield,
    Palette: Image, // fallback for design
    Users: Briefcase, // fallback for team services
    HeadphonesIcon: Heart, // fallback for support
    PenTool: FileText, // fallback for writing
    TrendingUp: Heart, // fallback for marketing
  };
  
  const IconComponent = iconMap[iconName];
  
  // Ensure we always return a valid React component
  if (!IconComponent || typeof IconComponent !== 'function') {
    return Heart;
  }
  
  return IconComponent;
};

const skillSuggestions = {
  "peluqueria": ["Corte de Cabello", "Maquillaje", "Peinado", "Coloración", "Tratamientos", "A Domicilio", "Alisado", "Permanente"],
  "belleza": ["Manicura", "Pedicura", "Depilación", "Masajes", "Tratamientos Faciales", "Cejas y Pestañas", "A Domicilio"],
  "mascotas": ["Peluquería Canina", "Paseo de Perros", "Adiestramiento", "Cuidado a Domicilio", "Veterinaria", "Grooming"],
  "construccion": ["Albañilería", "Pintura", "Electricidad", "Plomería", "Reparaciones", "Refacciones", "Presupuesto Gratis"],
  "limpieza": ["Limpieza de Hogar", "Limpieza Profunda", "A Domicilio", "Post Obra", "Oficinas", "Alfombras"],
  "cocina": ["Comida a Domicilio", "Catering", "Eventos", "Repostería", "Viandas", "Menú Semanal"],
  "jardineria": ["Corte de Césped", "Poda", "Mantenimiento", "Diseño de Jardines", "Riego", "Fumigación"],
  "mecanica": ["Mecánica General", "Electricidad Automotriz", "Diagnóstico", "A Domicilio", "Cambio de Aceite", "Frenos"]
};

interface ProjectData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  
  // Pricing
  packages: {
    basic: { name: string; price: number; description: string; deliveryTime: number; features: string[]; immediateAvailability: boolean; scheduledAvailability: boolean };
    standard: { name: string; price: number; description: string; deliveryTime: number; features: string[]; immediateAvailability: boolean; scheduledAvailability: boolean };
    premium: { name: string; price: number; description: string; deliveryTime: number; features: string[]; immediateAvailability: boolean; scheduledAvailability: boolean };
  };

  // Media
  images: string[];
  gallery: string[];
  videoUrl: string;

  // Requirements
  requirements: string[];

  // FAQ
  faqs: { question: string; answer: string }[];

  // Settings
  isActive: boolean;
  instantDelivery: boolean;
}

function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { id: 1, title: "Información Básica", description: "Título y descripción" },
    { id: 2, title: "Categoría y Tags", description: "Clasificación del servicio" },
    { id: 3, title: "Precios y Paquetes", description: "Configuración de precios" },
    { id: 4, title: "Imágenes y Media", description: "Galería de imágenes" },
    { id: 5, title: "Requisitos y FAQ", description: "Información adicional" },
    { id: 6, title: "Configuración Final", description: "Ajustes y publicación" }
  ];

  return (
    <Card className="glass border-white/10 mb-8">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% completado</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`text-center p-3 rounded-lg transition-all ${
                step.id === currentStep 
                  ? 'glass-medium border border-primary/20' 
                  : step.id < currentStep 
                    ? 'glass-light border border-success/20' 
                    : 'glass border border-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                step.id === currentStep 
                  ? 'liquid-gradient text-white' 
                  : step.id < currentStep 
                    ? 'bg-success/20 text-success' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="text-xs font-medium mb-1">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BasicInfoStep({ data, setData }: { data: ProjectData; setData: (data: ProjectData) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Información Básica del Servicio</span>
          </CardTitle>
          <CardDescription>
            Define el título y descripción que verán los clientes potenciales
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Título del Servicio *</Label>
            <Input
              placeholder="Ej: Desarrollo de E-commerce Completo con Panel Administrativo"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="glass border-white/20"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Sé específico y descriptivo</span>
              <span>{data.title.length}/80</span>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción Detallada *</Label>
            <Textarea
              placeholder="Describe tu servicio en detalle. Incluye qué obtendrá el cliente, tu proceso de trabajo, y por qué deberían elegirte..."
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="glass border-white/20 min-h-32"
              rows={8}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Mínimo 200 caracteres recomendados</span>
              <span>{data.description.length}/2000</span>
            </div>
          </div>
          
          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips para una buena descripción:</strong>
              <ul className="mt-2 space-y-2 text-sm">
                <li>• Explica claramente qué incluye tu servicio</li>
                <li>• Menciona tu experiencia y habilidades</li>
                <li>• Describe tu proceso de trabajo</li>
                <li>• Incluye ejemplos de trabajos anteriores</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CategoryStep({
  data,
  setData,
  categories,
  loadingCategories
}: {
  data: ProjectData;
  setData: (data: ProjectData) => void;
  categories: ServiceCategory[];
  loadingCategories: boolean;
}) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data.tags);
  const [categorySearch, setCategorySearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  const handleSkillToggle = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    setData({ ...data, tags: updated });
  };

  const handleAddCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < 8) {
      handleSkillToggle(skill);
      setCustomSkill('');
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat?.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat?.description?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* CARD PRINCIPAL CON MEJOR DISEÑO */}
      <Card className="glass-glow border-white/20 shadow-xl overflow-hidden">
        <CardHeader className="space-y-4 bg-gradient-to-r from-primary/5 to-transparent pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <span>Categoría y Especialización</span>
            </CardTitle>
            <Badge className="bg-secondary/20 text-secondary border-secondary/30 px-3 py-1">
              2 de 6
            </Badge>
          </div>
          <CardDescription className="text-base text-muted-foreground/90 leading-relaxed">
            💡 <strong>Cómo funciona:</strong> Primero selecciona la <strong className="text-primary">categoría general</strong> de tu servicio (ej: Desarrollo Web).
            Luego agrega <strong className="text-success">habilidades específicas</strong> que te hacen único (ej: React, Node.js).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* ========== CATEGORÍA PRINCIPAL ========== */}
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Categoría Principal *
              </Label>
              <Badge variant="outline" className="glass border-primary/30 text-primary">
                Paso 1 de 2
              </Badge>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative group">
              <Input
                placeholder="🔍 Busca tu categoría... (ej: Desarrollo, Diseño, Plomería, Electricista)"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="glass-glow border-white/30 px-4 py-6 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {categorySearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setCategorySearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* ALERT INFORMATIVO */}
            <Alert className="glass-medium border-secondary/30 bg-gradient-to-r from-secondary/10 to-transparent">
              <Info className="h-5 w-5 text-secondary" />
              <AlertDescription className="text-sm text-secondary/90 leading-relaxed">
                <strong>¿Qué es la categoría?</strong> Es la clasificación general de tu servicio que ayuda a los clientes a encontrarte.
                <br />
                <strong className="text-secondary/80">Ejemplo:</strong> "Desarrollo Web" es una categoría. "React" y "Node.js" son habilidades que agregarás después.
              </AlertDescription>
            </Alert>

            {/* GRID DE CATEGORÍAS CON LOADING */}
            {loadingCategories ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="glass border-white/10 animate-pulse">
                    <CardContent className="p-5 text-center space-y-2">
                      <div className="h-12 w-12 bg-muted/50 rounded-xl mx-auto"></div>
                      <div className="h-5 bg-muted/50 rounded"></div>
                      <div className="h-3 bg-muted/30 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <Card className="glass-medium border-white/20 p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No se encontraron categorías con "<strong>{categorySearch}</strong>"
                </p>
                <Button
                  variant="outline"
                  className="glass border-white/20"
                  onClick={() => setCategorySearch('')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar búsqueda
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.map((category) => {
                  if (!category || !category.id || !category.name) return null;

                  const Icon = getIconComponent(category.icon);
                  const isSelected = data.category === category.id;

                  return (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'ring-2 ring-primary glass-glow shadow-lg shadow-primary/20 scale-[1.02]'
                          : 'glass hover:glass-medium border-white/20 hover:border-primary/40 hover:shadow-md'
                      }`}
                      onClick={() => setData({ ...data, category: category.id })}
                    >
                      <CardContent className="p-5 text-center relative">
                        {/* ICON CON GRADIENTE */}
                        <div className={`h-14 w-14 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-primary via-primary to-primary/70 shadow-lg shadow-primary/30'
                            : 'bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20'
                        }`}>
                          <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : 'text-primary'}`} />
                        </div>

                        {/* NOMBRE */}
                        <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {category.name}
                        </div>

                        {/* DESCRIPCIÓN */}
                        {category.description && (
                          <div className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                            {category.description}
                          </div>
                        )}

                        {/* CHECKMARK */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========== HABILIDADES Y TAGS (Solo si hay categoría seleccionada) ========== */}
          {data.category && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 pt-6 border-t border-white/10"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-success" />
                  Habilidades y Tecnologías *
                </Label>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="glass border-success/30 text-success">
                    Paso 2 de 2
                  </Badge>
                  <Badge className={`${
                    selectedSkills.length === 8
                      ? 'bg-success/20 text-success border-success/30'
                      : 'bg-primary/20 text-primary border-primary/30'
                  }`}>
                    {selectedSkills.length}/8 tags
                  </Badge>
                </div>
              </div>

              {/* ALERT EXPLICATIVO DE TAGS */}
              <Alert className="glass-medium border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
                <Lightbulb className="h-5 w-5 text-primary" />
                <AlertDescription className="text-sm text-primary/90 space-y-2">
                  <p className="font-semibold">¿Cómo agregar tags?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                    <li>Haz clic en los tags sugeridos abajo</li>
                    <li>O escribe uno personalizado y presiona <kbd className="px-1.5 py-0.5 bg-primary/20 rounded text-xs">ENTER</kbd></li>
                    <li>Los tags ayudan a que los clientes te encuentren en búsquedas específicas</li>
                    <li>Ejemplo: Si sabes "React", agrégalo para que aparezcas cuando busquen "desarrollador React"</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* TAGS SUGERIDOS */}
              {skillSuggestions[data.category as keyof typeof skillSuggestions]?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Tags sugeridos (haz clic para agregar)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {skillSuggestions[data.category as keyof typeof skillSuggestions]?.map((skill) => (
                      <Button
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSkillToggle(skill)}
                        className={`transition-all ${
                          selectedSkills.includes(skill)
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md shadow-primary/20"
                            : "glass border-white/20 hover:glass-medium hover:border-primary/40"
                        }`}
                        disabled={selectedSkills.length >= 8 && !selectedSkills.includes(skill)}
                      >
                        {selectedSkills.includes(skill) && <Check className="h-3.5 w-3.5 mr-1.5" />}
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT PARA TAG PERSONALIZADO */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  O agrega un tag personalizado
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Escribe y presiona ENTER (ej: WordPress, Figma, Python)"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      className="glass border-white/20 pr-24"
                      disabled={selectedSkills.length >= 8}
                      maxLength={30}
                    />
                    <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/30">
                      ENTER
                    </kbd>
                  </div>
                  <Button
                    onClick={handleAddCustomSkill}
                    className="liquid-gradient"
                    disabled={!customSkill.trim() || selectedSkills.length >= 8}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* TAGS SELECCIONADOS */}
              {selectedSkills.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Tags Seleccionados ({selectedSkills.length}/8)
                  </Label>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1.5">
                    <Progress value={(selectedSkills.length / 8) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {8 - selectedSkills.length === 0
                        ? '¡Máximo alcanzado!'
                        : `Puedes agregar ${8 - selectedSkills.length} tag${8 - selectedSkills.length !== 1 ? 's' : ''} más`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 px-3 py-1.5 pr-1.5 text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillToggle(skill)}
                          className="ml-2 hover:bg-primary/30 rounded-full p-1 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PricingStep({ data, setData }: { data: ProjectData; setData: (data: ProjectData) => void }) {
  const updatePackage = (packageType: 'basic' | 'standard' | 'premium', field: string, value: any) => {
    setData({
      ...data,
      packages: {
        ...data.packages,
        [packageType]: {
          ...data.packages[packageType],
          [field]: value
        }
      }
    });
  };

  const addFeature = (packageType: 'basic' | 'standard' | 'premium') => {
    const features = [...data.packages[packageType].features, ''];
    updatePackage(packageType, 'features', features);
  };

  const updateFeature = (packageType: 'basic' | 'standard' | 'premium', index: number, value: string) => {
    const features = [...data.packages[packageType].features];
    features[index] = value;
    updatePackage(packageType, 'features', features);
  };

  const removeFeature = (packageType: 'basic' | 'standard' | 'premium', index: number) => {
    const features = data.packages[packageType].features.filter((_, i) => i !== index);
    updatePackage(packageType, 'features', features);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Paquetes y Precios</span>
          </CardTitle>
          <CardDescription>
            Crea diferentes opciones de servicio para atraer más clientes
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {(['basic', 'standard', 'premium'] as const).map((packageType, index) => (
              <Card 
                key={packageType}
                className={`glass border-white/10 ${
                  packageType === 'standard' ? 'ring-2 ring-primary/30' : ''
                }`}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <CardTitle className="capitalize">
                      {packageType === 'basic' ? 'Básico' : packageType === 'standard' ? 'Estándar' : 'Premium'}
                    </CardTitle>
                    {packageType === 'standard' && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Package Name */}
                  <div className="space-y-2">
                    <Label>Nombre del Paquete</Label>
                    <Input
                      placeholder={`Paquete ${packageType}`}
                      value={data.packages[packageType].name}
                      onChange={(e) => updatePackage(packageType, 'name', e.target.value)}
                      className="glass border-white/20"
                    />
                  </div>
                  
                  {/* Price */}
                  <div className="space-y-2">
                    <Label>Precio (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0"
                        value={data.packages[packageType].price}
                        onChange={(e) => updatePackage(packageType, 'price', parseInt(e.target.value) || 0)}
                        className="glass border-white/20 pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      placeholder="Breve descripción del paquete"
                      value={data.packages[packageType].description}
                      onChange={(e) => updatePackage(packageType, 'description', e.target.value)}
                      className="glass border-white/20"
                      rows={2}
                    />
                  </div>
                  
                  {/* Delivery Time */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Días de Entrega</Label>
                      <Input
                        type="number"
                        placeholder="7"
                        value={data.packages[packageType].deliveryTime}
                        onChange={(e) => updatePackage(packageType, 'deliveryTime', parseInt(e.target.value) || 0)}
                        className="glass border-white/20"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Disponibilidad</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`immediate-${packageType}`}
                          checked={data.packages[packageType].immediateAvailability}
                          onChange={(e) => updatePackage(packageType, 'immediateAvailability', e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-2 focus:ring-primary"
                        />
                        <Label htmlFor={`immediate-${packageType}`} className="text-sm font-normal cursor-pointer">
                          Disponibilidad Inmediata
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`scheduled-${packageType}`}
                          checked={data.packages[packageType].scheduledAvailability}
                          onChange={(e) => updatePackage(packageType, 'scheduledAvailability', e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-2 focus:ring-primary"
                        />
                        <Label htmlFor={`scheduled-${packageType}`} className="text-sm font-normal cursor-pointer">
                          Disponibilidad de Acuerdo a Agenda
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Características Incluidas</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addFeature(packageType)}
                        className="glass border-white/20 hover:glass-medium"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {data.packages[packageType].features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <Input
                            placeholder="Ej: Diseño responsive"
                            value={feature}
                            onChange={(e) => updateFeature(packageType, featureIndex, e.target.value)}
                            className="glass border-white/20"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => removeFeature(packageType, featureIndex)}
                            className="glass border-white/20 hover:border-destructive/20 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Tip de precios:</strong> El paquete Estándar suele ser el más popular. 
              Asegúrate de que ofrezca un buen balance entre precio y valor.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MediaStep({ data, setData }: { data: ProjectData; setData: (data: ProjectData) => void }) {
  const [draggedOver, setDraggedOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleMainImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);

      // Use functional update to avoid stale state issues
      setData(prevData => ({
        ...prevData,
        images: [result.url]
      }));

      toast.success('Imagen principal cargada exitosamente');
    } catch (error: any) {
      console.error('Error uploading main image:', error);
      toast.error(error.message || 'Error al cargar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (file: File) => {
    if (!file) return;
    if (data.gallery.length >= 5) {
      toast.error('Máximo 5 imágenes en la galería');
      return;
    }

    setUploadingGallery(true);
    try {
      const result = await uploadService.uploadImage(file);

      // Use functional update to avoid stale state issues
      setData(prevData => ({
        ...prevData,
        gallery: [...prevData.gallery, result.url]
      }));

      toast.success('Imagen agregada a la galería');
    } catch (error: any) {
      console.error('Error uploading gallery image:', error);
      toast.error(error.message || 'Error al cargar la imagen');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = data.gallery.filter((_, i) => i !== index);
    setData({ ...data, gallery: newGallery });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Imágenes y Media</span>
          </CardTitle>
          <CardDescription>
            Las imágenes de calidad aumentan las conversiones hasta un 40%
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Image Upload */}
          <div className="space-y-4">
            <Label>Imagen Principal del Servicio *</Label>

            {data.images[0] ? (
              <div className="relative">
                <img
                  src={data.images[0]}
                  alt="Main service"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setData({ ...data, images: [] })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  draggedOver
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-white/20 glass hover:glass-medium'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedOver(true);
                }}
                onDragLeave={() => setDraggedOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleMainImageUpload(file);
                }}
                onClick={() => document.getElementById('main-image-input')?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                )}
                <div className="space-y-2">
                  <div className="font-medium">
                    {uploading ? 'Subiendo imagen...' : 'Arrastra una imagen aquí o haz clic para seleccionar'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    PNG, JPG hasta 5MB. Tamaño recomendado: 1280x720px
                  </div>
                </div>
                <input
                  id="main-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMainImageUpload(file);
                  }}
                  disabled={uploading}
                />
              </div>
            )}
          </div>
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Galería de Imágenes (Opcional)</Label>
              <span className="text-sm text-muted-foreground">
                {data.gallery.length}/5 imágenes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {/* Existing images */}
              {data.gallery.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeGalleryImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Upload slots */}
              {data.gallery.length < 5 && (
                <div
                  className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center glass hover:glass-medium cursor-pointer transition-all"
                  onClick={() => document.getElementById('gallery-image-input')?.click()}
                >
                  {uploadingGallery ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <div className="text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-xs text-muted-foreground">Agregar</div>
                    </div>
                  )}
                </div>
              )}

              <input
                id="gallery-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGalleryImageUpload(file);
                }}
                disabled={uploadingGallery || data.gallery.length >= 5}
              />
            </div>
          </div>
          
          {/* Video URL */}
          <div className="space-y-2">
            <Label>Video Demostrativo (Opcional)</Label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              className="glass border-white/20"
            />
            <div className="text-sm text-muted-foreground">
              Los servicios con video tienen 3x más conversiones
            </div>
          </div>
          
          {/* Tips */}
          <Alert>
            <Camera className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips para mejores imágenes:</strong>
              <ul className="mt-2 space-y-2 text-sm">
                <li>• Usa imágenes de alta calidad y buena iluminación</li>
                <li>• Muestra ejemplos reales de tu trabajo</li>
                <li>• Incluye antes/después si es aplicable</li>
                <li>• Evita imágenes genéricas de stock</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RequirementsStep({ data, setData }: { data: ProjectData; setData: (data: ProjectData) => void }) {
  const addRequirement = () => {
    setData({ ...data, requirements: [...data.requirements, ''] });
  };

  const updateRequirement = (index: number, value: string) => {
    const requirements = [...data.requirements];
    requirements[index] = value;
    setData({ ...data, requirements });
  };

  const removeRequirement = (index: number) => {
    const requirements = data.requirements.filter((_, i) => i !== index);
    setData({ ...data, requirements });
  };

  const addFAQ = () => {
    setData({ ...data, faqs: [...data.faqs, { question: '', answer: '' }] });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const faqs = [...data.faqs];
    faqs[index][field] = value;
    setData({ ...data, faqs });
  };

  const removeFAQ = (index: number) => {
    const faqs = data.faqs.filter((_, i) => i !== index);
    setData({ ...data, faqs });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Requirements */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Requisitos del Cliente</span>
          </CardTitle>
          <CardDescription>
            Define qué información necesitas del cliente para comenzar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Lista de Requisitos</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addRequirement}
              className="glass border-white/20 hover:glass-medium"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Ej: Proporcionar logo y colores de marca"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="glass border-white/20"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => removeRequirement(index)}
                  className="glass border-white/20 hover:border-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {data.requirements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>No hay requisitos definidos</div>
                <div className="text-sm">Agrega requisitos para que los clientes sepan qué preparar</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Preguntas Frecuentes</span>
          </CardTitle>
          <CardDescription>
            Responde las dudas más comunes para reducir consultas
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>FAQs</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addFAQ}
              className="glass border-white/20 hover:glass-medium"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar FAQ
            </Button>
          </div>
          
          <div className="space-y-4">
            {data.faqs.map((faq, index) => (
              <Card key={index} className="glass border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Pregunta {index + 1}</Label>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => removeFAQ(index)}
                      className="glass border-white/20 hover:border-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Ej: ¿Incluyes el hosting del sitio web?"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    className="glass border-white/20"
                  />
                  <Textarea
                    placeholder="Escribe la respuesta detallada..."
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    className="glass border-white/20"
                    rows={3}
                  />
                </CardContent>
              </Card>
            ))}
            
            {data.faqs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>No hay preguntas frecuentes</div>
                <div className="text-sm">Las FAQs ayudan a generar confianza y reducir dudas</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FinalStep({ data, setData }: { data: ProjectData; setData: (data: ProjectData) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración Final</span>
          </CardTitle>
          <CardDescription>
            Últimos ajustes antes de publicar tu servicio
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Service Settings */}
          <div className="space-y-4">
            <Label>Configuración del Servicio</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Activar servicio inmediatamente</div>
                  <div className="text-sm text-muted-foreground">
                    El servicio estará visible para los clientes
                  </div>
                </div>
                <Switch
                  checked={data.isActive}
                  onCheckedChange={(checked) => setData({ ...data, isActive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Entrega instantánea</div>
                  <div className="text-sm text-muted-foreground">
                    Para servicios que se entregan inmediatamente
                  </div>
                </div>
                <Switch
                  checked={data.instantDelivery}
                  onCheckedChange={(checked) => setData({ ...data, instantDelivery: checked })}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Service Preview */}
          <div className="space-y-4">
            <Label>Vista Previa del Servicio</Label>
            
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Imagen Principal */}
                  {data.images.length > 0 && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={data.images[0]}
                        alt={data.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{data.title || 'Título del servicio'}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {data.description || 'Descripción del servicio aparecerá aquí...'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary">
                        ${data.packages.standard.price || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Paquete Estándar
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="glass border-white/20 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Entrega: {data.packages.standard.deliveryTime || 0} días</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.packages.standard.immediateAvailability && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Disponibilidad Inmediata
                        </Badge>
                      )}
                      {data.packages.standard.scheduledAvailability && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Según Agenda
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>¡Casi listo!</strong> Revisa toda la información antes de publicar. 
              Podrás editar tu servicio después de publicarlo, pero es mejor que esté completo desde el inicio.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NewProjectPage() {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    packages: {
      basic: { name: 'Básico', price: 0, description: '', deliveryTime: 7, features: [], immediateAvailability: false, scheduledAvailability: true },
      standard: { name: 'Estándar', price: 0, description: '', deliveryTime: 14, features: [], immediateAvailability: false, scheduledAvailability: true },
      premium: { name: 'Premium', price: 0, description: '', deliveryTime: 21, features: [], immediateAvailability: false, scheduledAvailability: true }
    },
    images: [],
    gallery: [],
    videoUrl: '',
    requirements: [],
    faqs: [],
    isActive: false,
    instantDelivery: false
  });

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const backendCategories = await servicesService.getCategories();
        
        // Validate categories data
        if (Array.isArray(backendCategories)) {
          const validCategories = backendCategories.filter(cat => 
            cat && typeof cat === 'object' && cat.id && cat.name
          );
          setCategories(validCategories);
        } else {
          console.error('Invalid categories data received:', backendCategories);
          setCategories([]);
          toast.error('Error al cargar las categorías - formato inválido');
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectData.title.length > 10 && projectData.description.length > 50;
      case 2:
        return projectData.category && projectData.tags.length > 0;
      case 3:
        // Al menos UN paquete debe tener precio configurado
        return projectData.packages.basic.price > 0 ||
               projectData.packages.standard.price > 0 ||
               projectData.packages.premium.price > 0;
      case 4:
        return true; // Media is optional
      case 5:
        return true; // Requirements and FAQ are optional
      case 6:
        return true; // Final step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = async () => {
    try {
      // Determinar qué paquete usar (prioridad: standard > basic > premium)
      let selectedPackage = projectData.packages.standard;
      if (selectedPackage.price === 0) {
        selectedPackage = projectData.packages.basic.price > 0
          ? projectData.packages.basic
          : projectData.packages.premium;
      }

      // Transform frontend data to backend format
      // IMPORTANT: Only send fields that are EXACTLY in CreateServiceDto
      // Do NOT send any extra fields - the backend forbidNonWhitelisted will reject them
      const serviceData = {
        title: projectData.title,
        description: projectData.description,
        price: selectedPackage.price,
        category_id: projectData.category,
      } as const;

      // Only add optional fields if they have values (conditionally add each one)
      const finalServiceData: any = { ...serviceData };

      if (projectData.images && projectData.images[0] &&
          (projectData.images[0].startsWith('http://') || projectData.images[0].startsWith('https://'))) {
        finalServiceData.main_image = projectData.images[0];
      }

      if (projectData.gallery && projectData.gallery.length > 0) {
        // Filter out any invalid URLs (only include strings that start with http/https)
        const validGalleryUrls = projectData.gallery.filter((url: any) =>
          typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
        );
        if (validGalleryUrls.length > 0) {
          finalServiceData.gallery = validGalleryUrls;
        }
      }

      if (projectData.tags && Array.isArray(projectData.tags) && projectData.tags.length > 0) {
        finalServiceData.tags = projectData.tags;
      }

      if (selectedPackage.deliveryTime && selectedPackage.deliveryTime > 0) {
        finalServiceData.delivery_time_days = selectedPackage.deliveryTime;
      }

      // DEBUG: Log exactly what we're sending
      console.log('[DEBUG] Exact serviceData being sent:', JSON.stringify(finalServiceData, null, 2));
      console.log('[DEBUG] serviceData keys:', Object.keys(finalServiceData));
      console.log('[DEBUG] Checking for forbidden fields:');
      console.log('[DEBUG]   - has "active"?', 'active' in finalServiceData);
      console.log('[DEBUG]   - has "immediate_availability"?', 'immediate_availability' in finalServiceData);
      console.log('[DEBUG]   - has "scheduled_availability"?', 'scheduled_availability' in finalServiceData);
      console.log('[DEBUG]   - has "isActive"?', 'isActive' in finalServiceData);
      console.log('[DEBUG]   - has "instantDelivery"?', 'instantDelivery' in finalServiceData);

      const createdService = await servicesService.createService(finalServiceData);

      toast.success("¡Servicio publicado correctamente!");

      // Redirect to dashboard or service page
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error publishing service:', error);

      // Better error handling
      let errorMessage = "Error al publicar el servicio";

      if (error?.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error('Detailed error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: errorMessage
      });

      toast.error(errorMessage);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un servicio');
      navigate('/login');
    }
  }, [user, navigate]);

  // Redirect if not professional
  useEffect(() => {
    if (user && user.userType !== 'professional') {
      toast.error('Solo los profesionales pueden crear servicios');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={projectData} setData={setProjectData} />;
      case 2:
        return <CategoryStep 
          data={projectData} 
          setData={setProjectData} 
          categories={categories}
          loadingCategories={loadingCategories}
        />;
      case 3:
        return <PricingStep data={projectData} setData={setProjectData} />;
      case 4:
        return <MediaStep data={projectData} setData={setProjectData} />;
      case 5:
        return <RequirementsStep data={projectData} setData={setProjectData} />;
      case 6:
        return <FinalStep data={projectData} setData={setProjectData} />;
      default:
        return null;
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

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Crear Nuevo Servicio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comparte tu expertise con miles de clientes. 
            Configura tu servicio paso a paso y comienza a generar ingresos.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="glass border-white/20 hover:glass-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-muted-foreground">
              Guardar Borrador
            </Button>
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handlePublish}
                className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-6"
                disabled={!canProceed()}
              >
                <Zap className="h-4 w-4 mr-2" />
                Publicar Servicio
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Helper Text */}
        {!canProceed() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {currentStep === 1 && "Completa el título (min. 10 caracteres) y descripción (min. 50 caracteres)"}
                {currentStep === 2 && "Selecciona una categoría y al menos un tag"}
                {currentStep === 3 && "Define precio para al menos UN paquete (Básico, Estándar o Premium)"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </main>
    </div>
  );
}