import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Search, Filter, MapPin, Clock, DollarSign, Users, Award, Zap,
  ChevronDown, SlidersHorizontal, Grid3X3, List, Eye, ArrowRight,
  Calendar, CheckCircle, AlertCircle, Star, Briefcase, Globe,
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
import { useAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";
import { useOpportunities } from "../hooks/useOpportunities";

import { useSubmitProposal } from "../hooks/useSubmitProposal";
// Mock data for opportunities
export const mockOpportunities = [
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
  "Desarrollo Web",
  "Desarrollo Móvil",
  "Diseño Gráfico",
  "Marketing Digital",
  "Video y Animación",
  "Ciberseguridad",
  "Redacción",
  "Traducción",
  "Consultoría"
];

const sortOptions = [
  { label: "Más recientes", value: "newest" },
  { label: "Mejor pagados", value: "budget_desc" },
  { label: "Menos propuestas", value: "proposals_asc" },
  { label: "Deadline próximo", value: "deadline" },
  { label: "Clientes mejor valorados", value: "client_rating" }
];

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className="font-semibold">Fixia</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/opportunities" className="text-primary font-medium">
            Oportunidades
          </Link>
          <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
            Explorar
          </Link>
          <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
            Mi Perfil
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="relative">
            <Bookmark className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </Button>
          <Button variant="outline" className="glass border-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Alertas
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  budgetRange: number[];
  setBudgetRange: (range: number[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  urgencyFilter: string[];
  setUrgencyFilter: (filter: string[]) => void;
  locationFilter: string;
  setLocationFilter: (filter: string) => void;
}

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
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <div className="relative">
        <div className="flex glass rounded-2xl p-2 border-white/20">
          <div className="flex-1 flex items-center">
            <Search className="h-5 w-5 text-muted-foreground ml-4 mr-3" />
            <Input
              placeholder="Buscar proyectos: desarrollo web, diseño, marketing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
            Buscar Oportunidades
          </Button>
        </div>
      </div>

      {/* Quick Filters and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
                      { value: "all", label: "Todos los proyectos" },
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
        <div className="flex items-center space-x-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 glass border-white/20">
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
          
          <div className="flex glass rounded-lg p-1 border-white/20">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "liquid-gradient" : "hover:glass-medium"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "liquid-gradient" : "hover:glass-medium"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" size="sm" className="glass border-white/20"
            onClick={() => refetch()}
          >
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
                          <Award className="h-3 w-3 mr-1" />
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
                        <Star className="h-4 w-4 mr-1 text-warning" />
                        {opportunity.client.rating}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {opportunity.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold text-success">
                      ${opportunity.budget.min} - ${opportunity.budget.max}
                    </div>
                    <div className="text-sm text-muted-foreground">{opportunity.duration}</div>
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
          <DialogContent className="glass border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Propuesta</DialogTitle>
              <DialogDescription>
                {opportunity.title}
              </DialogDescription>
            </DialogHeader>
            <ProposalForm opportunity={opportunity} onClose={() => setShowProposal(false)} />
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
                  <Star className="h-3 w-3 text-warning" />
                  <span>{opportunity.client.rating}</span>
                  <span>•</span>
                  <span>{opportunity.client.projectsPosted} proyectos</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {opportunity.featured && (
                <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
          <div className="flex flex-wrap gap-1">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Presupuesto</span>
              <span className="font-semibold text-success">
                ${opportunity.budget.min} - ${opportunity.budget.max}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duración</span>
              <span className="text-sm">{opportunity.duration}</span>
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
      
      {/* Proposal Modal */}
      <Dialog open={showProposal} onOpenChange={setShowProposal}>
        <DialogContent className="glass border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Propuesta</DialogTitle>
            <DialogDescription>
              {opportunity.title}
            </DialogDescription>
          </DialogHeader>
          <ProposalForm opportunity={opportunity} onClose={() => setShowProposal(false)} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function ProposalForm({ opportunity, onClose }: { opportunity: any, onClose: () => void }) {
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    proposedBudget: opportunity.budget.min,
    // Aseguramos que el valor inicial sea un string válido para el Select
    deliveryTime: '',
    questions: ''
  });
  const { mutate: submitProposal, isPending } = useSubmitProposal();

  const handleSubmit = async () => {
    submitProposal(
      { ...proposalData, opportunityId: opportunity.id },
      {
        onSuccess: () => {
          // Cierra el modal solo si la mutación es exitosa
          onClose();
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Opportunity Summary */}
      <Card className="glass-medium border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{opportunity.title}</h4>
              <p className="text-sm text-muted-foreground">
                Presupuesto: ${opportunity.budget.min} - ${opportunity.budget.max}
              </p>
            </div>
            <Badge variant="outline" className="glass border-white/20">
              {opportunity.proposals} propuestas
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Proposal Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Carta de Presentación *</Label>
          <Textarea
            placeholder="Explica por qué eres el candidato ideal para este proyecto..."
            value={proposalData.coverLetter}
            onChange={(e) => setProposalData({ ...proposalData, coverLetter: e.target.value })}
            className="glass border-white/20 min-h-32"
            rows={6}
          />
          <div className="text-sm text-muted-foreground">
            {proposalData.coverLetter.length}/1000 caracteres
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Presupuesto Propuesto (USD) *</Label>
            <Input
              type="number"
              value={proposalData.proposedBudget}
              onChange={(e) => setProposalData({ ...proposalData, proposedBudget: parseInt(e.target.value) })}
              className="glass border-white/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Tiempo de Entrega *</Label>
            <Select
              value={proposalData.deliveryTime}
              onValueChange={(value) => setProposalData({ ...proposalData, deliveryTime: value })}
            >
              <SelectTrigger className="glass border-white/20">
                <SelectValue placeholder="Seleccionar tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-week">1 semana</SelectItem>
                <SelectItem value="2-weeks">2 semanas</SelectItem>
                <SelectItem value="1-month">1 mes</SelectItem>
                <SelectItem value="2-months">2 meses</SelectItem>
                <SelectItem value="3-months">3+ meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Preguntas para el Cliente (Opcional)</Label>
          <Textarea
            placeholder="¿Tienes alguna pregunta específica sobre el proyecto?"
            value={proposalData.questions}
            onChange={(e) => setProposalData({ ...proposalData, questions: e.target.value })}
            className="glass border-white/20"
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foregoing">
          Al enviar esta propuesta, aceptas los términos de servicio de Fixia
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onClose} className="glass border-white/20">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="liquid-gradient hover:opacity-90 w-48"
            disabled={isPending || !proposalData.coverLetter || !proposalData.deliveryTime}
          >
            {isPending ? (
              <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </motion.div>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Enviar Propuesta</>
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

  const { 
    data: filteredOpportunities, 
    isLoading, 
    isError 
  } = useOpportunities({
    searchQuery,
    selectedCategory,
    budgetRange,
    sortBy,
    urgencyFilter,
    locationFilter,
  });

  const opportunities = filteredOpportunities ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Descubre Oportunidades Extraordinarias
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conecta con clientes que necesitan exactamente tus habilidades. 
            Encuentra proyectos que impulsen tu carrera al siguiente nivel.
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">250+</div>
              <div className="text-sm text-muted-foreground">Proyectos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">$2.5M+</div>
              <div className="text-sm text-muted-foreground">Pagados Este Mes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">4.9★</div>
              <div className="text-sm text-muted-foreground">Rating Promedio</div>
            </div>
          </div>
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              {isLoading ? "Buscando..." : `${opportunities.length} oportunidades encontradas`}
            </h2>
            {selectedCategory !== "Todos" && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {selectedCategory}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground min-h-[20px]">
            <span>{filteredOpportunities.filter(o => o.urgency === 'urgent').length} urgentes</span>
            <span>•</span>
            <span>{filteredOpportunities.filter(o => o.featured).length} destacadas</span>
          </div>
        </motion.div>

        {/* Opportunities Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={viewMode === "grid" 
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-6"
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

        {/* Load More */}
        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button 
              variant="outline" className="glass border-white/20 hover:glass-medium"
              onClick={() => toast.info('Funcionalidad de paginación en desarrollo.')}
            >
              Cargar Más Oportunidades
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && opportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
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