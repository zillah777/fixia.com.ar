import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Search, Filter, MapPin, Star, Heart, Share2, Clock, DollarSign, 
  Users, Award, Zap, ChevronDown, SlidersHorizontal, Grid3X3, 
  List, Map, ArrowRight, CheckCircle, Briefcase
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";

// Mock data for services
const mockServices = [
  {
    id: "srv_001",
    title: "Desarrollo de E-commerce Completo",
    description: "Tienda online responsive con panel administrativo, pasarela de pagos y sistema de inventario",
    professional: {
      name: "Ana Martínez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Top Rated Plus"
    },
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    price: 1250,
    originalPrice: 1500,
    duration: "3-4 semanas",
    rating: 4.9,
    reviews: 187,
    category: "Desarrollo Web",
    tags: ["React", "Node.js", "MongoDB"],
    deliveryTime: "21 días",
    revisions: "3 revisiones",
    featured: true,
    location: "Ciudad de México, MX",
    completedProjects: 156,
    responseTime: "1 hora",
    languages: ["Español", "Inglés"]
  },
  {
    id: "srv_002",
    title: "Diseño de Identidad Visual Premium",
    description: "Logo, paleta de colores, tipografías y guía de marca completa para empresas",
    professional: {
      name: "Carlos Ruiz",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Pro"
    },
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    price: 800,
    originalPrice: 1000,
    duration: "2-3 semanas",
    rating: 4.8,
    reviews: 143,
    category: "Diseño Gráfico",
    tags: ["Branding", "Illustrator", "Photoshop"],
    deliveryTime: "14 días",
    revisions: "5 revisiones",
    featured: false,
    location: "Barcelona, ES",
    completedProjects: 98,
    responseTime: "2 horas",
    languages: ["Español", "Catalán", "Inglés"]
  },
  {
    id: "srv_003",
    title: "App Móvil iOS y Android",
    description: "Aplicación nativa con diseño moderno, base de datos y notificaciones push",
    professional: {
      name: "María González",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Expert"
    },
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    price: 2100,
    originalPrice: 2500,
    duration: "6-8 semanas",
    rating: 5.0,
    reviews: 89,
    category: "Desarrollo Móvil",
    tags: ["Flutter", "Firebase", "iOS"],
    deliveryTime: "45 días",
    revisions: "2 revisiones",
    featured: true,
    location: "Buenos Aires, AR",
    completedProjects: 67,
    responseTime: "30 min",
    languages: ["Español", "Inglés"]
  },
  {
    id: "srv_004",
    title: "Marketing Digital Completo",
    description: "Estrategia SEO, Google Ads, redes sociales y análisis de métricas por 3 meses",
    professional: {
      name: "David López",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Pro"
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    price: 950,
    originalPrice: 1200,
    duration: "3 meses",
    rating: 4.7,
    reviews: 234,
    category: "Marketing Digital",
    tags: ["SEO", "Google Ads", "Analytics"],
    deliveryTime: "7 días inicio",
    revisions: "Ilimitadas",
    featured: false,
    location: "Madrid, ES",
    completedProjects: 312,
    responseTime: "1 hora",
    languages: ["Español", "Inglés", "Francés"]
  },
  {
    id: "srv_005",
    title: "Video Promocional Profesional",
    description: "Video animado 2D/3D para promocionar productos o servicios, incluye guión y música",
    professional: {
      name: "Sofia Chen",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Rising Talent"
    },
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
    price: 650,
    originalPrice: 800,
    duration: "2-3 semanas",
    rating: 4.9,
    reviews: 76,
    category: "Video y Animación",
    tags: ["After Effects", "Animación 2D", "Motion Graphics"],
    deliveryTime: "18 días",
    revisions: "3 revisiones",
    featured: false,
    location: "Lima, PE",
    completedProjects: 45,
    responseTime: "3 horas",
    languages: ["Español", "Inglés", "Mandarín"]
  },
  {
    id: "srv_006",
    title: "Consultoría en Ciberseguridad",
    description: "Auditoría completa de seguridad, análisis de vulnerabilidades y plan de mejoras",
    professional: {
      name: "Roberto Silva",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Expert"
    },
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
    price: 1850,
    originalPrice: 2200,
    duration: "4-5 semanas",
    rating: 4.8,
    reviews: 92,
    category: "Ciberseguridad",
    tags: ["Pentesting", "ISO 27001", "OWASP"],
    deliveryTime: "28 días",
    revisions: "2 revisiones",
    featured: true,
    location: "São Paulo, BR",
    completedProjects: 78,
    responseTime: "45 min",
    languages: ["Español", "Portugués", "Inglés"]
  }
];

const categories = [
  "Todos",
  "Desarrollo Web",
  "Diseño Gráfico", 
  "Desarrollo Móvil",
  "Marketing Digital",
  "Video y Animación",
  "Ciberseguridad",
  "Redacción",
  "Traducción",
  "Consultoría"
];

const sortOptions = [
  { label: "Más relevantes", value: "relevance" },
  { label: "Precio: menor a mayor", value: "price_asc" },
  { label: "Precio: mayor a menor", value: "price_desc" },
  { label: "Mejor valorados", value: "rating" },
  { label: "Más vendidos", value: "popular" },
  { label: "Más recientes", value: "newest" }
];

function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/services" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Explorar Servicios
          </Link>
          <Link to="/register?type=professional" className="text-foreground/80 hover:text-foreground transition-colors">
            Ofrecer Servicios
          </Link>
          <Link to="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
            Mi Dashboard
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/register">
            <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
              Únete Gratis
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function SearchAndFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode 
}: any) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <div className="relative">
        <div className="flex glass rounded-2xl p-2 border-white/20">
          <div className="flex-1 flex items-center">
            <Search className="h-5 w-5 text-muted-foreground ml-4 mr-3" />
            <Input
              placeholder="¿Qué servicio necesitas? Ej: Diseño de logo, desarrollo web..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
            Buscar
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
                  Personaliza tu búsqueda para encontrar el servicio perfecto
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="font-medium">Rango de Precio</label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={3000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Professional Level */}
                <div className="space-y-3">
                  <label className="font-medium">Nivel del Profesional</label>
                  <div className="space-y-2">
                    {["Rising Talent", "Pro", "Expert", "Top Rated", "Top Rated Plus"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={level} />
                        <label htmlFor={level} className="text-sm">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Delivery Time */}
                <div className="space-y-3">
                  <label className="font-medium">Tiempo de Entrega</label>
                  <Select>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-7">1-7 días</SelectItem>
                      <SelectItem value="8-14">1-2 semanas</SelectItem>
                      <SelectItem value="15-30">2-4 semanas</SelectItem>
                      <SelectItem value="30+">Más de 1 mes</SelectItem>
                    </SelectContent>
                  </Select>
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
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, viewMode }: { service: any, viewMode: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden">
          <div className="flex">
            {/* Image */}
            <div className="relative w-48 h-36 flex-shrink-0">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {service.featured && (
                <Badge className="absolute top-2 left-2 bg-warning/20 text-warning border-warning/30">
                  <Award className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 glass"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link to={`/services/${service.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer mb-2">
                      {service.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Professional Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={service.professional.avatar} />
                      <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{service.professional.name}</span>
                        {service.professional.verified && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {service.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Responde en {service.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price and Rating */}
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-4 w-4 text-warning fill-current" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground text-sm">({service.reviews})</span>
                  </div>
                  <div className="text-right">
                    {service.originalPrice > service.price && (
                      <span className="text-muted-foreground line-through text-sm mr-2">
                        ${service.originalPrice}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{service.duration}</p>
                </div>
              </div>
              
              {/* Tags and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {service.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="glass border-white/20 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {service.completedProjects} proyectos
                  </span>
                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                    {service.deliveryTime}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
      <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={service.image} 
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {service.featured && (
            <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30">
              <Award className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 glass opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-background/80 backdrop-blur-sm text-xs">
              {service.category}
            </Badge>
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Professional Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={service.professional.avatar} />
              <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium truncate">{service.professional.name}</span>
                {service.professional.verified && (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                )}
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                {service.professional.level}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Title and Description */}
          <Link to={`/services/${service.id}`}>
            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-2">
              {service.title}
            </h3>
          </Link>
          
          <p className="text-muted-foreground text-sm line-clamp-2">
            {service.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="glass border-white/20 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-warning fill-current" />
                {service.rating} ({service.reviews})
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {service.deliveryTime}
              </span>
            </div>
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {service.location.split(',')[0]}
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center space-x-2">
              {service.originalPrice > service.price && (
                <span className="text-muted-foreground line-through text-sm">
                  ${service.originalPrice}
                </span>
              )}
              <span className="text-xl font-bold text-primary">${service.price}</span>
            </div>
            <Link to={`/services/${service.id}`}>
              <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300">
                Ver Detalles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [filteredServices, setFilteredServices] = useState(mockServices);

  useEffect(() => {
    // Filter and sort services
    let filtered = mockServices;
    
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    filtered = filtered.filter(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );
    
    // Sort services
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.completedProjects - a.completedProjects);
        break;
      case "newest":
        // For demo purposes, shuffle array
        filtered.sort(() => Math.random() - 0.5);
        break;
      default:
        // Keep original order for relevance
        break;
    }
    
    setFilteredServices(filtered);
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

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
            Explora Servicios Profesionales
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre profesionales altamente calificados y servicios únicos. 
            Tu próximo proyecto está a un clic de distancia.
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
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
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
              {filteredServices.length} servicios encontrados
            </h2>
            {selectedCategory !== "Todos" && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {selectedCategory}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredServices.length} de {mockServices.length} servicios
          </div>
        </motion.div>

        {/* Services Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={viewMode === "grid" 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-6"
          }
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <ServiceCard service={service} viewMode={viewMode} />
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        {filteredServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button variant="outline" className="glass border-white/20 hover:glass-medium">
              Cargar Más Servicios
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredServices.length === 0 && (
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
              <h3 className="text-xl font-semibold mb-4">No encontramos servicios</h3>
              <p className="text-muted-foreground mb-6">
                Intenta ajustar tus filtros o buscar con términos diferentes
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                  setPriceRange([0, 3000]);
                }}
                className="liquid-gradient hover:opacity-90"
              >
                Limpiar Filtros
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}