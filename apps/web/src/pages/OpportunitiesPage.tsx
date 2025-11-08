import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { 
  Search, Filter, MapPin, Clock, DollarSign, Users, Heart, Zap,
  ChevronDown, SlidersHorizontal, Grid3X3, List, Eye, ArrowRight,
  Calendar, CheckCircle, AlertCircle, Heart, Briefcase, Globe,
  FileText, MessageSquare, Heart, Share2, TrendingUp, Target,
  Send, Bookmark, RefreshCw, Settings
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";
import { opportunitiesService, Opportunity as OpportunityType } from "../lib/services/opportunities.service";
import { Skeleton } from "../components/ui/skeleton";

// Mock data as fallback
const mockOpportunitiesOld = [
  {
    id: "opp_001",
    title: "Desarrollo de App Móvil para Delivery",
    description: "Necesito desarrollar una aplicación móvil completa para un servicio de delivery de comida. La app debe incluir registro de usuarios, catálogo de restaurantes, carrito de compras, integración con pasarelas de pago, tracking en tiempo real y panel administrativo.",
    client: {
      name: "Restaurant Group SA",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      verified: true,
      rating: 4.8,
      projectsPosted: 12,
      memberSince: "2022"
    },
    budget: { min: 3000, max: 5000 },
    duration: "2-3 meses",
    category: "Desarrollo Móvil",
    skills: ["Flutter", "React Native", "Firebase", "Node.js", "MongoDB"],
    postedDate: "Hace 2 días",
    deadline: "15 días para aplicar",
    proposals: 8,
    location: "Remoto",
    urgency: "normal",
    status: "open",
    featured: true,
    requirements: [
      "Experiencia mínima de 3 años en desarrollo móvil",
      "Portfolio con apps de delivery o e-commerce",
      "Conocimiento en integración de pagos",
      "Disponibilidad para llamadas de seguimiento"
    ]
  },
  {
    id: "opp_002",
    title: "Rediseño Completo de Identidad Corporativa",
    description: "Startup tecnológica busca rediseño completo de identidad visual. Incluye logo, paleta de colores, tipografías, papelería, presentaciones corporativas y guía de marca. Buscamos un estilo moderno y profesional que transmita innovación y confianza.",
    client: {
      name: "TechVision Inc",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
      verified: true,
      rating: 4.9,
      projectsPosted: 5,
      memberSince: "2023"
    },
    budget: { min: 800, max: 1500 },
    duration: "3-4 semanas",
    category: "Diseño Gráfico",
    skills: ["Illustrator", "Photoshop", "Branding", "Figma", "InDesign"],
    postedDate: "Hace 1 día",
    deadline: "10 días para aplicar",
    proposals: 15,
    location: "Ciudad de México",
    urgency: "high",
    status: "open",
    featured: false,
    requirements: [
      "Portfolio con casos de branding corporativo",
      "Experiencia con startups tecnológicas",
      "Proceso de trabajo colaborativo",
      "Entrega de archivos fuente"
    ]
  },
  {
    id: "opp_003",
    title: "Desarrollo de Dashboard Analytics Avanzado",
    description: "Empresa de marketing digital necesita dashboard web para visualización de datos de campañas. Debe incluir gráficos interactivos, filtros avanzados, exportación de reportes, integración con APIs de Google Ads, Facebook Ads y Analytics.",
    client: {
      name: "Digital Growth Agency",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      verified: true,
      rating: 4.7,
      projectsPosted: 18,
      memberSince: "2021"
    },
    budget: { min: 2000, max: 3500 },
    duration: "6-8 semanas",
    category: "Desarrollo Web",
    skills: ["React", "D3.js", "Python", "API Integration", "PostgreSQL"],
    postedDate: "Hace 5 días",
    deadline: "20 días para aplicar",
    proposals: 12,
    location: "Remoto",
    urgency: "normal",
    status: "open",
    featured: false,
    requirements: [
      "Experiencia en visualización de datos",
      "Conocimiento de APIs de marketing",
      "Portfolio con dashboards similares",
      "Metodología ágil de desarrollo"
    ]
  },
  {
    id: "opp_004",
    title: "Consultoría en Ciberseguridad Empresarial",
    description: "PYME del sector financiero requiere auditoría completa de seguridad, implementación de políticas de ciberseguridad, capacitación del personal y plan de respuesta a incidentes. Proyecto crítico con timeline ajustado.",
    client: {
      name: "SecureFinance Corp",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
      verified: true,
      rating: 5.0,
      projectsPosted: 3,
      memberSince: "2024"
    },
    budget: { min: 4000, max: 7000 },
    duration: "1-2 meses",
    category: "Ciberseguridad",
    skills: ["ISO 27001", "Pentesting", "GDPR", "Risk Assessment", "Security Training"],
    postedDate: "Hace 1 hora",
    deadline: "5 días para aplicar",
    proposals: 3,
    location: "Barcelona, España",
    urgency: "urgent",
    status: "open",
    featured: true,
    requirements: [
      "Certificaciones en ciberseguridad",
      "Experiencia en sector financiero",
      "Disponibilidad inmediata",
      "Referencias verificables"
    ]
  },
  {
    id: "opp_005",
    title: "Video Promocional Animado para Producto",
    description: "Startup de tecnología educativa necesita video animado de 60-90 segundos para promocionar nueva plataforma de aprendizaje. Estilo moderno, colores vibrantes, explicación clara del producto y call-to-action convincente.",
    client: {
      name: "EduTech Solutions",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
      verified: false,
      rating: 4.6,
      projectsPosted: 2,
      memberSince: "2024"
    },
    budget: { min: 600, max: 1200 },
    duration: "2-3 semanas",
    category: "Video y Animación",
    skills: ["After Effects", "Motion Graphics", "2D Animation", "Video Editing", "Storytelling"],
    postedDate: "Hace 3 días",
    deadline: "12 días para aplicar",
    proposals: 22,
    location: "Remoto",
    urgency: "normal",
    status: "open",
    featured: false,
    requirements: [
      "Portfolio con videos explicativos",
      "Experiencia en sector educativo preferible",
      "Revisiones incluidas en el precio",
      "Entrega en múltiples formatos"
    ]
  }
];

const categories = [
  "Todos",
  "Plomería",
  "Electricidad",
  "Carpintería",
  "Pintura",
  "Jardinería",
  "Limpieza",
  "Reparación General",
  "Construcción",
  "Maestro de Obra"
];

const sortOptions = [
  { label: "Más recientes", value: "newest" },
  { label: "Mejor pagados", value: "budget_desc" },
  { label: "Menos propuestas", value: "proposals_asc" },
  { label: "Deadline próximo", value: "deadline" },
  { label: "Clientes mejor valorados", value: "client_rating" }
];

function SearchAndFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  budgetRange,
  setBudgetRange,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  urgencyFilter,
  setUrgencyFilter,
  locationFilter,
  setLocationFilter
}: any) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Search */}
      <div className="relative w-full">
        <div className="flex flex-col sm:flex-row glass rounded-2xl p-2 border-white/20 gap-2">
          <div className="flex-1 flex items-center">
            <Search className="h-5 w-5 text-muted-foreground ml-3 mr-2 sm:ml-4 sm:mr-3 flex-shrink-0" />
            <Input
              placeholder="Buscar oportunidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-4 sm:px-6 text-sm sm:text-base flex-shrink-0">
            Buscar
          </Button>
        </div>
      </div>

      {/* Quick Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "liquid-gradient hover:opacity-90" 
                : "glass border-white/20 hover:glass-medium"
              }
            >
              {category}
            </Button>
          ))}
          
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Más Filtros
              </Button>
            </SheetTrigger>
            <SheetContent className="glass border-white/10 w-80">
              <SheetHeader>
                <SheetTitle>Filtros Avanzados</SheetTitle>
                <SheetDescription>
                  Encuentra las oportunidades perfectas para tu perfil
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Budget Range */}
                <div className="space-y-3">
                  <label className="font-medium">Rango de Presupuesto (USD)</label>
                  <div className="space-y-3">
                    <Slider
                      value={budgetRange}
                      onValueChange={setBudgetRange}
                      max={10000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${budgetRange[0]}</span>
                      <span>${budgetRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Urgency */}
                <div className="space-y-3">
                  <label className="font-medium">Urgencia del Proyecto</label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "Todas las oportunidades" },
                      { value: "urgent", label: "Urgente (1-5 días)" },
                      { value: "high", label: "Alta prioridad" },
                      { value: "normal", label: "Prioridad normal" }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option.value}
                          checked={urgencyFilter.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setUrgencyFilter([...urgencyFilter, option.value]);
                            } else {
                              setUrgencyFilter(urgencyFilter.filter((u: string) => u !== option.value));
                            }
                          }}
                        />
                        <label htmlFor={option.value} className="text-sm">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Location */}
                <div className="space-y-3">
                  <label className="font-medium">Ubicación</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Seleccionar ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ubicaciones</SelectItem>
                      <SelectItem value="remote">Solo remoto</SelectItem>
                      <SelectItem value="local">Solo presencial</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                {/* Client Rating */}
                <div className="space-y-3">
                  <label className="font-medium">Rating Mínimo del Cliente</label>
                  <div className="flex items-center space-x-2">
                    {[1,2,3,4,5].map((rating) => (
                      <Button 
                        key={rating}
                        variant="outline"
                        size="sm"
                        className="glass border-white/20"
                      >
                        {rating}★+
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort and View Controls */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full xs:w-auto xs:min-w-40 glass border-white/20 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex glass rounded-lg p-1 border-white/20 w-full xs:w-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "liquid-gradient" : "hover:glass-medium flex-1 xs:flex-none"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "liquid-gradient" : "hover:glass-medium flex-1 xs:flex-none"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="glass border-white/20">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity, viewMode }: { opportunity: any, viewMode: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showProposal, setShowProposal] = useState(false);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'border-destructive/30 bg-destructive/10 text-destructive';
      case 'high': return 'border-warning/30 bg-warning/10 text-warning';
      default: return 'border-success/30 bg-success/10 text-success';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Prioridad Alta';
      default: return 'Normal';
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Client Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opportunity.client.avatar} />
                  <AvatarFallback>{opportunity.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer">
                        {opportunity.title}
                      </h3>
                      {opportunity.featured && (
                        <Badge className="bg-warning/20 text-warning border-warning/30">
                          <Heart className="h-3 w-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                      <Badge className={getUrgencyColor(opportunity.urgency)}>
                        {getUrgencyText(opportunity.urgency)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {opportunity.client.name}
                      </span>
                      {opportunity.client.verified && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1 text-warning" />
                        {opportunity.client.rating}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {opportunity.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">Presupuesto</div>
                      <div className="text-2xl font-bold text-success">
                        {opportunity.budget?.min && opportunity.budget?.max
                          ? `$${(opportunity.budget.min ?? 0).toLocaleString('es-AR')} - $${(opportunity.budget.max ?? 0).toLocaleString('es-AR')}`
                          : 'A convenir'
                        }
                      </div>
                    </div>
                    <div className="space-y-1 pt-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">Duración</div>
                      <div className="text-sm font-semibold text-foreground">{opportunity.duration}</div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground line-clamp-2">
                  {opportunity.description}
                </p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.slice(0, 5).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="glass border-white/20 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {opportunity.skills.length > 5 && (
                    <Badge variant="outline" className="glass border-white/20 text-xs">
                      +{opportunity.skills.length - 5} más
                    </Badge>
                  )}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {opportunity.postedDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {opportunity.deadline}
                    </span>
                    <span className="flex items-center">
                      <Send className="h-4 w-4 mr-1" />
                      {opportunity.proposals} propuestas
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-warning' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => setShowProposal(true)}
                      className="liquid-gradient hover:opacity-90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Proposal Modal */}
        <Dialog open={showProposal} onOpenChange={setShowProposal}>
          <DialogContent className="bg-slate-900/95 border-white/20 max-w-[90vw] sm:max-w-2xl fixed backdrop-blur-xl shadow-2xl">
            <DialogHeader className="border-b border-gradient-to-r from-primary/20 via-transparent to-transparent pb-6 mb-2">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">Enviar Tu Propuesta</DialogTitle>
              <DialogDescription className="text-base text-slate-300 font-medium mt-3">
                {opportunity.title}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <ProposalForm opportunity={opportunity} onClose={() => setShowProposal(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group h-full">
        <CardHeader className="space-y-4">
          {/* Client Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={opportunity.client.avatar} />
                <AvatarFallback>{opportunity.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{opportunity.client.name}</span>
                  {opportunity.client.verified && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3 text-warning" />
                  <span>{opportunity.client.rating}</span>
                  <span>•</span>
                  <span>{opportunity.client.projectsPosted} oportunidades publicadas</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {opportunity.featured && (
                <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon" className="h-9 w-9"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-warning' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Title and Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="glass border-white/20 text-xs">
                {opportunity.category}
              </Badge>
              <Badge className={getUrgencyColor(opportunity.urgency) + " text-xs"}>
                {getUrgencyText(opportunity.urgency)}
              </Badge>
            </div>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {opportunity.title}
            </h3>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-3">
            {opportunity.description}
          </p>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {opportunity.skills.slice(0, 4).map((skill: string) => (
              <Badge key={skill} variant="outline" className="glass border-white/20 text-xs">
                {skill}
              </Badge>
            ))}
            {opportunity.skills.length > 4 && (
              <Badge variant="outline" className="glass border-white/20 text-xs">
                +{opportunity.skills.length - 4}
              </Badge>
            )}
          </div>
          
          {/* Budget and Duration */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Presupuesto</span>
              <div className="flex items-baseline gap-1">
                {opportunity.budget?.min && opportunity.budget?.max ? (
                  <>
                    <span className="text-lg font-bold text-success">
                      ${(opportunity.budget.min ?? 0).toLocaleString('es-AR')}
                    </span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className="text-lg font-bold text-success">
                      ${(opportunity.budget.max ?? 0).toLocaleString('es-AR')}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">A convenir</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Duración</span>
              <p className="text-sm font-semibold text-foreground">{opportunity.duration}</p>
            </div>
          </div>
          
          {/* Footer Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {opportunity.postedDate}
              </span>
              <span className="flex items-center">
                <Send className="h-3 w-3 mr-1" />
                {opportunity.proposals}
              </span>
            </div>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {opportunity.deadline}
            </span>
          </div>
          
          {/* Apply Button */}
          <Button 
            onClick={() => setShowProposal(true)}
            className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 mt-4"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Propuesta
          </Button>
        </CardContent>
      </Card>
      
      {/* Proposal Modal - Responsive and properly centered */}
      <Dialog open={showProposal} onOpenChange={setShowProposal}>
        <DialogContent className="bg-slate-900/95 border-white/20 max-w-[95vw] sm:max-w-[85vw] md:max-w-2xl lg:max-w-3xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] backdrop-blur-xl shadow-2xl rounded-xl">
          <DialogHeader className="border-b border-white/10 pb-6 mb-4 space-y-2">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Enviar Tu Propuesta</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-slate-300 font-medium line-clamp-2">
              {opportunity.title}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] sm:max-h-[75vh] overflow-y-auto pr-2 md:pr-0">
            <ProposalForm opportunity={opportunity} onClose={() => setShowProposal(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function ProposalForm({ opportunity, onClose, onSuccess }: { opportunity: OpportunityType, onClose: () => void, onSuccess?: () => void }) {
  const [proposalData, setProposalData] = useState({
    message: '',
    proposedBudget: opportunity.budget || 0,
    estimatedDuration: '',
    portfolio: [] as string[],
    availableToStart: false,
    flexibleSchedule: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!proposalData.message || !proposalData.estimatedDuration) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);

      await opportunitiesService.applyToOpportunity(opportunity.id, proposalData);

      toast.success("¡Propuesta enviada correctamente!");
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
    <div className="space-y-6">
      {/* Opportunity Summary - Enhanced with full details */}
      <Card className="bg-slate-800/60 border-white/15 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <CardContent className="p-5 sm:p-6 relative">
          <div className="space-y-4">
            {/* Title and Proposals */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-white truncate">{opportunity.title}</h4>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap shadow-lg">
                <Target className="h-4 w-4 mr-1.5" />
                {opportunity.proposals}
              </Badge>
            </div>

            {/* Budget and Timeline */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-foreground/60 font-semibold uppercase">Presupuesto</p>
                <p className="text-base text-white font-bold mt-1">
                  💰 ${opportunity.budget?.min ? (opportunity.budget.min ?? 0).toLocaleString('es-AR') : '0'} - ${opportunity.budget?.max ? (opportunity.budget.max ?? 0).toLocaleString('es-AR') : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/60 font-semibold uppercase">Deadline</p>
                <p className="text-base text-white font-bold mt-1">📅 {opportunity.deadline || 'No especificado'}</p>
              </div>
            </div>

            {/* Client Info */}
            {opportunity.client && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarImage src={opportunity.client.avatar} alt={opportunity.client.name} />
                    <AvatarFallback>{opportunity.client.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{opportunity.client.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {opportunity.client.verified && <CheckCircle className="h-3 w-3 text-primary" />}
                      <span className="text-xs text-foreground/70">
                        ⭐ {opportunity.client.rating?.toFixed(1) || '0.0'} · {opportunity.client.verified ? 'Verificado' : 'No verificado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proposal Form */}
      <div className="space-y-6">
        {/* Cover Letter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1.5 rounded-full bg-gradient-to-r from-primary to-primary/60"></div>
            <Label className="text-white font-bold text-base">Carta de Presentación *</Label>
          </div>
          <Textarea
            placeholder="Cuéntale al cliente por qué eres el candidato perfecto. Destaca tus habilidades, experiencia relevante y por qué te apasiona este proyecto..."
            value={proposalData.message}
            onChange={(e) => setProposalData({ ...proposalData, message: e.target.value })}
            className="bg-slate-800/80 border-white/20 min-h-32 text-white placeholder:text-slate-400 focus:border-primary/50 rounded-lg focus:ring-1 focus:ring-primary/50"
            rows={6}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/60 font-medium">
              {proposalData.message.length}/1000 caracteres
            </span>
            <span className={`text-xs font-semibold ${proposalData.message.length >= 100 ? 'text-success' : 'text-warning/70'}`}>
              {proposalData.message.length >= 100 ? '✓ Bien' : 'Amplía tu mensaje'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1.5 rounded-full bg-gradient-to-r from-primary to-primary/60"></div>
              <Label htmlFor="budget" className="text-white font-bold text-base">Presupuesto (ARS) *</Label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary font-bold text-lg">$</span>
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                value={proposalData.proposedBudget === 0 ? '' : proposalData.proposedBudget}
                onChange={(e) => setProposalData({ ...proposalData, proposedBudget: parseInt(e.target.value) || 0 })}
                className="bg-slate-800/80 border-white/20 pl-10 text-white font-semibold text-lg placeholder:text-slate-400 focus:border-primary/50 rounded-lg"
                min="0"
                step="100"
              />
            </div>
            {proposalData.proposedBudget > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <span className="text-sm text-primary font-semibold">
                  💵 Tu propuesta: ARS ${(proposalData.proposedBudget ?? 0).toLocaleString('es-AR')}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1.5 rounded-full bg-gradient-to-r from-primary to-primary/60"></div>
              <Label htmlFor="delivery" className="text-white font-bold text-base">Tiempo de Entrega *</Label>
            </div>
            <Input
              id="delivery"
              type="text"
              placeholder="Ej: 7 días"
              value={proposalData.estimatedDuration}
              onChange={(e) => setProposalData({ ...proposalData, estimatedDuration: e.target.value })}
              className="bg-slate-800/80 border-white/20 text-white font-semibold text-lg placeholder:text-slate-400 focus:border-primary/50 rounded-lg"
            />
            <p className="text-xs text-foreground/60 font-medium">
              📅 Personaliza según tu disponibilidad
            </p>
          </div>
        </div>
      </div>

      {/* Availability & Flexibility Options */}
      <div className="space-y-4 p-4 bg-slate-800/40 border border-white/10 rounded-lg">
        <p className="text-sm font-semibold text-white">Disponibilidad y Flexibilidad</p>

        <div className="flex items-center space-x-3 p-3 bg-slate-800/60 rounded-lg border border-white/10 hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => setProposalData({ ...proposalData, availableToStart: !proposalData.availableToStart })}
        >
          <Checkbox
            checked={proposalData.availableToStart}
            onChange={(checked) => setProposalData({ ...proposalData, availableToStart: checked as boolean })}
            className="h-5 w-5 border-white/30"
          />
          <div className="flex-1">
            <Label className="text-white font-semibold cursor-pointer">Estoy disponible para empezar ahora</Label>
            <p className="text-xs text-foreground/60 mt-1">El cliente sabrá que puedes comenzar inmediatamente</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-slate-800/60 rounded-lg border border-white/10 hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => setProposalData({ ...proposalData, flexibleSchedule: !proposalData.flexibleSchedule })}
        >
          <Checkbox
            checked={proposalData.flexibleSchedule}
            onChange={(checked) => setProposalData({ ...proposalData, flexibleSchedule: checked as boolean })}
            className="h-5 w-5 border-white/30"
          />
          <div className="flex-1">
            <Label className="text-white font-semibold cursor-pointer">Horario y fecha de entrega flexible</Label>
            <p className="text-xs text-foreground/60 mt-1">Puedes ajustar los tiempos según las necesidades del cliente</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 pt-6 mt-2">
        <div className="text-xs text-slate-300 mb-5 p-4 bg-slate-800/60 rounded-lg border border-white/15">
          ✓ Al enviar esta propuesta, aceptas los <a href="/terms" className="text-primary font-semibold hover:underline">términos de servicio</a> de Fixia
        </div>
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-slate-800/60 border-white/20 text-white hover:bg-slate-800/80 text-sm font-semibold"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="liquid-gradient hover:opacity-95 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!proposalData.message || !proposalData.estimatedDuration || submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4 mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Enviar Propuesta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [budgetRange, setBudgetRange] = useState([100, 10000]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [urgencyFilter, setUrgencyFilter] = useState(["all"]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [opportunities, setOpportunities] = useState<OpportunityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {
          page: currentPage,
          limit: 12,
          sortBy: sortBy};

        if (selectedCategory !== "Todos") {
          filters.category = selectedCategory;
        }

        if (searchQuery) {
          filters.search = searchQuery;
        }

        if (budgetRange[0] > 100) {
          filters.budgetMin = budgetRange[0];
        }

        if (budgetRange[1] < 10000) {
          filters.budgetMax = budgetRange[1];
        }

        if (locationFilter === "remote") {
          filters.remote = true;
        }

        const response = await opportunitiesService.getOpportunities(filters);

        setOpportunities(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
      } catch (err: any) {
        console.error('Error fetching opportunities:', err);
        setError('Error al cargar oportunidades. Intenta nuevamente.');
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [selectedCategory, searchQuery, budgetRange, sortBy, urgencyFilter, locationFilter, currentPage]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FixiaNavigation />

      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-10 lg:mb-12 px-2"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Descubre Oportunidades
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Conecta con clientes y oportunidades que impulsen tu carrera
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <SearchAndFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            budgetRange={budgetRange}
            setBudgetRange={setBudgetRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            urgencyFilter={urgencyFilter}
            setUrgencyFilter={setUrgencyFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
          />
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
            <h2 className="text-base sm:text-lg font-semibold">
              {opportunities.length} encontradas
            </h2>
            {selectedCategory !== "Todos" && (
              <Badge className="bg-primary/20 text-primary border-primary/30 w-fit text-xs sm:text-sm">
                {selectedCategory}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-xs sm:text-sm text-muted-foreground">
            <span>{opportunities.filter(o => o.urgency === 'urgent').length} urgentes</span>
            <span>•</span>
            <span>{opportunities.filter(o => o.featured).length} destacadas</span>
          </div>
        </motion.div>

        {/* Opportunities Grid/List */}
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="glass border-white/10">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="glass border-white/10 p-6 sm:p-8 text-center mx-4">
            <AlertCircle className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-base sm:text-lg font-medium mb-2">Error al cargar oportunidades</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </Card>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              : "space-y-4 sm:space-y-6"
            }
          >
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <OpportunityCard opportunity={opportunity} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && opportunities.length > 0 && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12"
          >
            <Button
              variant="outline"
              className="glass border-white/20 w-full sm:w-auto text-sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              className="glass border-white/20 w-full sm:w-auto text-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && opportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12 sm:py-16 px-4"
          >
            <div className="glass rounded-2xl p-8 sm:p-12 max-w-lg mx-auto">
              <div className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">No encontramos oportunidades</h3>
              <p className="text-muted-foreground mb-6">
                Intenta ajustar tus filtros o buscar con términos diferentes
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todos");
                    setBudgetRange([100, 10000]);
                  }}
                  className="liquid-gradient hover:opacity-90 mr-4"
                >
                  Limpiar Filtros
                </Button>
                <Button variant="outline" className="glass border-white/20">
                  Crear Alerta de Proyecto
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}