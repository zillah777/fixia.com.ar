import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, MapPin, Heart, Heart, Share2, Clock, DollarSign,
  Users, Heart, Zap, ChevronDown, SlidersHorizontal, Grid3X3,
  List, Map, ArrowRight, CheckCircle, Briefcase, Loader2, MessageCircle, X, Send
} from "lucide-react";
import { servicesService, type Service, type ServiceFilters } from "../lib/services/services.service";
import { favoritesService } from "../lib/services/favorites.service";
import { contactService } from "../lib/services/contact.service";
import { toast } from "sonner";
import { useSecureAuth } from "../context/SecureAuthContext";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";
import { SkipNavigation } from "../components/SkipNavigation";


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

function ContactProfessionalModal({
  service,
  open,
  onClose
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'platform' | 'whatsapp' | 'email' | 'phone'>('platform');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Por favor escribe un mensaje');
      return;
    }

    try {
      setSubmitting(true);
      await contactService.contactProfessional({
        professionalId: service.professional.id,
        serviceId: service.id,
        contactMethod,
        message,
      });
      toast.success('¡Mensaje enviado correctamente!', {
        description: 'El profesional recibirá tu mensaje pronto'
      });
      setMessage('');
      onClose();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error('Debes iniciar sesión para contactar profesionales');
      } else {
        toast.error('Error al enviar el mensaje');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar a {service.professional.name}</DialogTitle>
          <DialogDescription>
            Envía un mensaje sobre: {service.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Método de contacto preferido</label>
            <Select value={contactMethod} onValueChange={(value: any) => setContactMethod(value)}>
              <SelectTrigger className="glass border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Plataforma Fixia</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Teléfono</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensaje</label>
            <Textarea
              placeholder="Hola, me interesa tu servicio..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="glass border-white/20 min-h-[120px]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="glass border-white/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !message.trim()}
              className="liquid-gradient hover:opacity-90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ServiceCard({ service, viewMode }: { service: Service, viewMode: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [service.id]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await favoritesService.isServiceFavorite(service.id);
      setIsFavorite(result.is_favorite);
    } catch (error) {
      // Silently fail - user might not be logged in
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      if (isFavorite) {
        await favoritesService.removeServiceFromFavorites(service.id);
        setIsFavorite(false);
        toast.success('Servicio eliminado de favoritos');
      } else {
        await favoritesService.addServiceToFavorites(service.id);
        setIsFavorite(true);
        toast.success('Servicio agregado a favoritos');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      if (error?.response?.status === 401) {
        toast.error('Debes iniciar sesión para agregar favoritos');
      } else {
        toast.error('Error al actualizar favoritos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContactModal(true);
  };

  if (viewMode === "list") {
    return (
      <>
        <ContactProfessionalModal
          service={service}
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
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
                src={service.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"} 
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {service.featured && (
                <Badge className="absolute top-2 left-2 bg-warning/20 text-warning border-warning/30">
                  <Heart className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 glass"
                onClick={toggleFavorite}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                )}
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
                          {service.professional.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Responde rápido
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price and Rating */}
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    <Heart className="h-4 w-4 text-warning fill-current" />
                    <span className="font-medium">{service.averageRating}</span>
                    <span className="text-muted-foreground text-sm">({service.totalReviews})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{service.priceType === 'hourly' ? 'Por hora' : service.priceType === 'fixed' ? 'Precio fijo' : 'Negociable'}</p>
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass border-white/20 hover:glass-medium"
                    onClick={handleContactClick}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contactar
                  </Button>
                  <span className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Profesional verificado
                  </span>
                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                    {service.active ? 'Disponible' : 'No disponible'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      </>
    );
  }

  return (
    <>
      <ContactProfessionalModal
        service={service}
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
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
            src={service.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"} 
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {service.featured && (
            <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30">
              <Heart className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 glass opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={toggleFavorite}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            )}
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
                <Heart className="h-3 w-3 mr-1 text-warning fill-current" />
                {service.averageRating} ({service.totalReviews})
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {service.active ? 'Disponible' : 'No disponible'}
              </span>
            </div>
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {service.professional.location?.split(',')[0] || 'N/A'}
            </span>
          </div>
          
          {/* Price and Actions */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">${service.price}</span>
              <span className="text-xs text-muted-foreground">
                {service.priceType === 'hourly' ? 'Por hora' : service.priceType === 'fixed' ? 'Precio fijo' : 'Negociable'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="glass border-white/20 hover:glass-medium flex-1"
                onClick={handleContactClick}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Contactar
              </Button>
              <Link to={`/services/${service.id}`} className="flex-1">
                <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 w-full">
                  Ver Detalles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const filters: ServiceFilters = {
          page: currentPage,
          limit: 20
        };
        
        // Add search query
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        // Add category filter
        if (selectedCategory !== "Todos") {
          filters.category = selectedCategory;
        }
        
        // Add price range filter
        if (priceRange[0] > 0 || priceRange[1] < 3000) {
          filters.minPrice = priceRange[0];
          filters.maxPrice = priceRange[1];
        }
        
        // Add sorting
        switch (sortBy) {
          case "price_asc":
            filters.sortBy = "price";
            filters.sortOrder = "asc";
            break;
          case "price_desc":
            filters.sortBy = "price";
            filters.sortOrder = "desc";
            break;
          case "rating":
            filters.sortBy = "rating";
            filters.sortOrder = "desc";
            break;
          case "popular":
            filters.sortBy = "popular";
            filters.sortOrder = "desc";
            break;
          case "newest":
            filters.sortBy = "newest";
            filters.sortOrder = "desc";
            break;
          default:
            // Default relevance sorting
            break;
        }
        
        const response = await servicesService.getServices(filters);
        
        if (currentPage === 1) {
          setServices(response.data);
        } else {
          // Append to existing services for pagination
          setServices(prev => [...prev, ...response.data]);
        }
        
        setTotalServices(response.total);
      } catch (err) {
        setError('Error al cargar los servicios. Por favor, intenta nuevamente.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedCategory, searchQuery, priceRange, sortBy, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <SkipNavigation />
      <FixiaNavigation />
      
      <main id="main-content" role="main" aria-label="Servicios disponibles" className="container mx-auto px-6 py-8">
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
              {loading ? 'Cargando...' : `${totalServices} servicios encontrados`}
            </h2>
            {selectedCategory !== "Todos" && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {selectedCategory}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {loading ? 'Cargando servicios...' : `Mostrando ${services.length} de ${totalServices} servicios`}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && currentPage === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="glass rounded-2xl p-8 flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg">Cargando servicios...</span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
              <div className="h-16 w-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Error al cargar servicios</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="liquid-gradient hover:opacity-90"
              >
                Reintentar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Services Grid/List */}
        {!error && services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={viewMode === "grid" 
              ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-6"
            }
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index % 20) }}
              >
                <ServiceCard service={service} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More */}
        {!error && services.length > 0 && services.length < totalServices && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button 
              variant="outline" 
              className="glass border-white/20 hover:glass-medium"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  Cargar Más Servicios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
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
                  setCurrentPage(1);
                }}
                className="liquid-gradient hover:opacity-90"
              >
                Limpiar Filtros
              </Button>
            </div>
          </motion.div>
        )}
      </main>
      <MobileBottomNavigation />
    </div>
  );
}