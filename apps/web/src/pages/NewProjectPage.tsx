import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, ArrowRight, Check, Upload, X, Plus, Minus, 
  Image, FileText, DollarSign, Clock, Tag, Settings, 
  Eye, Save, AlertCircle, Info, Star, Briefcase, Globe,
  Camera, Trash2, Edit3, Zap, Shield, Award
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const categories = [
  { value: "web-development", label: "Desarrollo Web", icon: Globe },
  { value: "mobile-development", label: "Desarrollo Móvil", icon: Camera },
  { value: "graphic-design", label: "Diseño Gráfico", icon: Image },
  { value: "digital-marketing", label: "Marketing Digital", icon: Star },
  { value: "writing", label: "Redacción y Contenido", icon: FileText },
  { value: "video-animation", label: "Video y Animación", icon: Eye },
  { value: "consulting", label: "Consultoría", icon: Briefcase },
  { value: "cybersecurity", label: "Ciberseguridad", icon: Shield }
];

const skillSuggestions = {
  "web-development": ["React", "Vue.js", "Angular", "Node.js", "Python", "PHP", "WordPress", "Shopify"],
  "mobile-development": ["Flutter", "React Native", "Swift", "Kotlin", "iOS", "Android"],
  "graphic-design": ["Photoshop", "Illustrator", "Figma", "InDesign", "After Effects"],
  "digital-marketing": ["SEO", "Google Ads", "Facebook Ads", "Analytics", "Social Media"],
  "writing": ["Blog Posts", "Copywriting", "Technical Writing", "SEO Content"],
  "video-animation": ["After Effects", "Premiere Pro", "Motion Graphics", "3D Animation"],
  "consulting": ["Strategy", "Business Plan", "Market Research", "Process Optimization"],
  "cybersecurity": ["Pentesting", "Security Audit", "ISO 27001", "GDPR Compliance"]
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
    basic: { name: string; price: number; description: string; deliveryTime: number; revisions: number; features: string[] };
    standard: { name: string; price: number; description: string; deliveryTime: number; revisions: number; features: string[] };
    premium: { name: string; price: number; description: string; deliveryTime: number; revisions: number; features: string[] };
  };
  
  // Media
  images: string[];
  gallery: string[];
  
  // Requirements
  requirements: string[];
  
  // FAQ
  faqs: { question: string; answer: string }[];
  
  // Settings
  isActive: boolean;
  allowRevisions: boolean;
  instantDelivery: boolean;
}

function Navigation() {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className="font-semibold">Fixia</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Previsualizar
          </Button>
          <Button variant="ghost" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
        </div>
      </div>
    </motion.header>
  );
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
        
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
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
              <ul className="mt-2 space-y-1 text-sm">
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

function CategoryStep({ data, setData }: { data: ProjectData; setData: (data: ProjectData) => void }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data.tags);
  
  const handleSkillToggle = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    setData({ ...data, tags: updated });
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
            <Tag className="h-5 w-5" />
            <span>Categoría y Especialización</span>
          </CardTitle>
          <CardDescription>
            Ayuda a los clientes a encontrar tu servicio más fácilmente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-4">
            <Label>Categoría Principal *</Label>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.value}
                    className={`cursor-pointer transition-all ${
                      data.category === category.value
                        ? 'ring-2 ring-primary glass-medium'
                        : 'glass hover:glass-medium border-white/10'
                    }`}
                    onClick={() => setData({ ...data, category: category.value })}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium text-sm">{category.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Skills/Tags */}
          {data.category && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Habilidades y Tecnologías *</Label>
                <span className="text-sm text-muted-foreground">
                  Selecciona máximo 8 tags
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions[data.category as keyof typeof skillSuggestions]?.map((skill) => (
                    <Button
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSkillToggle(skill)}
                      className={selectedSkills.includes(skill)
                        ? "liquid-gradient hover:opacity-90"
                        : "glass border-white/20 hover:glass-medium"
                      }
                      disabled={selectedSkills.length >= 8 && !selectedSkills.includes(skill)}
                    >
                      {selectedSkills.includes(skill) && <Check className="h-3 w-3 mr-1" />}
                      {skill}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Agregar habilidad personalizada"
                    className="glass border-white/20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value && !selectedSkills.includes(value) && selectedSkills.length < 8) {
                          handleSkillToggle(value);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <Button variant="outline" className="glass border-white/20">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Selected Tags */}
              {selectedSkills.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags Seleccionados ({selectedSkills.length}/8)</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge 
                        key={skill}
                        className="bg-primary/20 text-primary border-primary/30 pr-1"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillToggle(skill)}
                          className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="space-y-2">
                      <Label>Revisiones</Label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={data.packages[packageType].revisions}
                        onChange={(e) => updatePackage(packageType, 'revisions', parseInt(e.target.value) || 0)}
                        className="glass border-white/20"
                      />
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
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
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
                // Handle file drop
              }}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <div className="font-medium">Arrastra una imagen aquí o haz clic para seleccionar</div>
                <div className="text-sm text-muted-foreground">
                  PNG, JPG hasta 10MB. Tamaño recomendado: 1280x720px
                </div>
              </div>
              <Button className="mt-4 liquid-gradient">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
            </div>
          </div>
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Galería de Imágenes (Opcional)</Label>
              <span className="text-sm text-muted-foreground">Hasta 5 imágenes adicionales</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Upload slots */}
              {[...Array(5)].map((_, index) => (
                <div 
                  key={index}
                  className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center glass hover:glass-medium cursor-pointer transition-all"
                >
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">Imagen {index + 1}</div>
                  </div>
                </div>
              ))}
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
              <ul className="mt-2 space-y-1 text-sm">
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
                  onCheckedChange={(checked: boolean) => setData({ ...data, isActive: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Permitir revisiones</div>
                  <div className="text-sm text-muted-foreground">
                    Los clientes pueden solicitar cambios según el paquete
                  </div>
                </div>
                <Switch
                  checked={data.allowRevisions}
                  onCheckedChange={(checked: boolean) => setData({ ...data, allowRevisions: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Entrega instantánea</div>
                  <div className="text-sm text-muted-foreground">
                    Para servicios digitales que se entregan inmediatamente
                  </div>
                </div>
                <Switch
                  checked={data.instantDelivery}
                  onCheckedChange={(checked: boolean) => setData({ ...data, instantDelivery: checked })}
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{data.title || 'Título del servicio'}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {data.description || 'Descripción del servicio aparecerá aquí...'}
                      </p>
                    </div>
                    <div className="text-right">
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
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Entrega: {data.packages.standard.deliveryTime || 0} días</span>
                    <span>Revisiones: {data.packages.standard.revisions || 0}</span>
                    <Badge className={data.isActive ? "bg-success/20 text-success" : "bg-muted"}>
                      {data.isActive ? 'Activo' : 'Borrador'}
                    </Badge>
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    packages: {
      basic: { name: 'Básico', price: 0, description: '', deliveryTime: 7, revisions: 1, features: [] },
      standard: { name: 'Estándar', price: 0, description: '', deliveryTime: 14, revisions: 2, features: [] },
      premium: { name: 'Premium', price: 0, description: '', deliveryTime: 21, revisions: 3, features: [] }
    },
    images: [],
    gallery: [],
    requirements: [],
    faqs: [],
    isActive: false,
    allowRevisions: true,
    instantDelivery: false
  });

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectData.title.length > 10 && projectData.description.length > 50;
      case 2:
        return projectData.category && projectData.tags.length > 0;
      case 3:
        return projectData.packages.basic.price > 0 && projectData.packages.standard.price > 0;
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
      // Here you would typically send the data to your backend
      console.log('Publishing project:', projectData);
      
      toast.success("¡Servicio publicado correctamente!");
      
      // Redirect to dashboard or service page
      navigate('/dashboard');
    } catch (error) {
      toast.error("Error al publicar el servicio");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={projectData} setData={setProjectData} />;
      case 2:
        return <CategoryStep data={projectData} setData={setProjectData} />;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
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
                className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8"
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
                {currentStep === 3 && "Define precios para los paquetes Básico y Estándar"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </main>
    </div>
  );
}