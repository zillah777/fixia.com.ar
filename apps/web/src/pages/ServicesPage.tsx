import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, MapPin, Heart, Share2, Clock, DollarSign,
  Users, Zap, ChevronDown, SlidersHorizontal, Grid3X3,
  List, Map, ArrowRight, CheckCircle, Briefcase, MessageCircle, X, Send
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
  "Albañilería",
  "Peluquería",
  "Jardinería",
  "Electricidad",
  "Plomería",
  "Carpintería",
  "Mecánica",
  "Limpieza",
  "Gasista",
  "Pintura",
  "Niñera",
  "Mudanzas"
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
        <div className="flex glass-glow rounded-2xl p-3 border-white/20">
          <div className="flex-1 flex items-center">
            <Search className="h-5 w-5 text-muted-foreground ml-4 mr-3" />
            <Input
              placeholder="¿Qué servicio necesitas? Ej: Diseño de logo, desarrollo web..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <Button className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg px-8 py-6 text-base font-semibold rounded-xl">
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
                ? "liquid-gradient hover:opacity-90 hover:scale-105 transition-all font-semibold"
                : "glass-glow border-white/20 hover:glass-medium hover:scale-105 transition-all font-medium"
              }
            >
              {category}
            </Button>
          ))}
          
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass-glow border-white/20 hover:glass-medium hover:scale-105 transition-all font-medium">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Más Filtros
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-glow border-white/10 w-80">
              <SheetHeader>
                <SheetTitle>Filtros Avanzados</SheetTitle>
                <SheetDescription>
                  Personaliza tu búsqueda para encontrar el servicio perfecto
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="font-medium text-foreground">Rango de Precio</label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000000}
                      min={0}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-foreground/70">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Professional Level */}
                <div className="space-y-3">
                  <label className="font-medium text-foreground">Nivel del Profesional (Sistema de Reviews Fixia)</label>
                  <div className="space-y-2">
                    {[
                      { level: "Rising Talent", description: "0 - 2 reviews" },
                      { level: "Verified", description: "3 - 9 reviews" },
                      { level: "Pro", description: "10+ reviews, 4.5+ estrellas" },
                      { level: "Expert", description: "20+ reviews, 4.7+ estrellas" },
                      { level: "Top Rated", description: "50+ reviews, 4.8+ estrellas" }
                    ].map((item) => (
                      <div key={item.level} className="flex items-start space-x-2">
                        <Checkbox id={item.level} />
                        <div className="flex-1">
                          <label htmlFor={item.level} className="text-sm text-foreground cursor-pointer block font-medium">{item.level}</label>
                          <p className="text-xs text-muted-foreground/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Delivery Time */}
                <div className="space-y-3">
                  <label className="font-medium text-foreground">Tiempo de Entrega</label>
                  <Select>
                    <SelectTrigger className="glass border-white/20 text-foreground">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10">
                      <SelectItem value="1-7" className="text-foreground">1-7 días</SelectItem>
                      <SelectItem value="8-14" className="text-foreground">1-2 semanas</SelectItem>
                      <SelectItem value="15-30" className="text-foreground">2-4 semanas</SelectItem>
                      <SelectItem value="30+" className="text-foreground">Más de 1 mes</SelectItem>
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
        message});
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
      <DialogContent className="bg-slate-900/95 border-white/20 sm:max-w-md backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Contactar a {service.professional.name}</DialogTitle>
          <DialogDescription className="text-slate-300">
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
                  <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />
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
  const { user } = useSecureAuth();

  useEffect(() => {
    if (user?.id) {
      checkFavoriteStatus();
    }
  }, [service.id, user?.id]);

  const checkFavoriteStatus = async () => {
    if (!user?.id) return;

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

    if (!user?.id) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return;
    }

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
          <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden card-hover">
          <div className="flex">
            {/* Image */}
            <div className="relative w-48 h-36 flex-shrink-0">
              <img
                src={service.main_image || service.images?.[0] || service.gallery?.[0] || "/placeholder-service.jpg"}
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
                size="icon" className="absolute top-2 right-2 h-9 w-9 glass"
                onClick={toggleFavorite}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4  text-white" />
                ) : (
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : 'text-white'}`} />
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
                    <span className="font-medium">{service.professional?.professional_profile?.rating?.toFixed(1) || 'Nuevo'}</span>
                    <span className="text-muted-foreground text-sm">({service.professional?.professional_profile?.review_count || 0})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{service.price_type === 'hourly' ? 'Por hora' : service.price_type === 'fixed' ? 'Precio fijo' : 'Negociable'}</p>
                </div>
              </div>
              
              {/* Tags and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
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

  // Fiverr-style card (grid view)
  return (
    <>
      <ContactProfessionalModal
        service={service}
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
      <Link to={`/services/${service.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-glow hover:glass-medium transition-all duration-300 border border-white/10 hover:border-white/20 overflow-hidden group cursor-pointer card-hover">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={service.main_image || service.images?.[0] || service.gallery?.[0] || "/placeholder-service.jpg"}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Destacado Badge - Top Left */}
              {service.featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground border-0 text-xs font-medium px-2 py-1">
                    Destacado
                  </Badge>
                </div>
              )}

              {/* Favorite Button - Top Right */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={toggleFavorite}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4" />
                ) : (
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                )}
              </Button>

              {/* Category Badge - Bottom Right */}
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-background/90 text-foreground border-0 text-xs font-medium px-2 py-1 backdrop-blur-sm">
                  {service.category?.name || 'Desarrollo Web'}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-4">
              {/* Professional Info */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-6 w-6 border border-white/20">
                  <AvatarImage src={service.professional?.avatar} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {service.professional?.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {service.professional?.name || 'Profesional'}
                  </span>
                  {service.professional?.verified && (
                    <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  )}
                </div>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5 px-1.5 py-0">
                  Pro
                </Badge>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-2 leading-tight hover:text-primary transition-colors">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {service.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(service.tags || []).slice(0, 3).map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs font-normal bg-muted hover:bg-muted/80 border-0 px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-warning fill-warning" />
                  <span className="text-sm font-semibold text-foreground">
                    {service.professional?.professional_profile?.rating?.toFixed(1) || 'Nuevo'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({service.professional?.professional_profile?.review_count || 0})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.delivery_time_days || 'A consultar'} {service.delivery_time_days ? 'días' : ''}
                </span>
              </div>

              {/* Price Section */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    {/* Show strikethrough price if there's a discount */}
                    <span className="text-xs text-muted-foreground line-through">
                      ${Math.floor(service.price * 1.3)}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      ${service.price}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-1.5 h-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    Ver Detalles →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
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
        
        // Handle pagination response structure
        if (response.pagination?.total) {
          setTotalServices(response.pagination.total);
        } else if (response.total) {
          setTotalServices(response.total);
        } else {
          // Fallback: use current data length if total not available
          setTotalServices(response.data?.length || 0);
        }
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
      
      <main id="main-content" role="main" aria-label="Servicios disponibles" className="container mx-auto px-6 py-8 pb-24 lg:pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-8 bg-primary/20 text-primary border-primary/30 px-5 py-2.5 text-base pulse-glow">
            <Search className="h-5 w-5 mr-2" />
            Más de {totalServices || 0} servicios disponibles
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
              Explora Servicios
            </span>{" "}
            <span className="text-gradient-rainbow inline-block">
              Profesionales
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Descubre profesionales altamente calificados y servicios únicos.
            <span className="block mt-2 text-base sm:text-lg text-muted-foreground/70">
              Tu próximo proyecto está a un clic de distancia
            </span>
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {loading ? 'Cargando...' : `${totalServices || 0} servicios encontrados`}
            </h2>
            {selectedCategory !== "Todos" && (
              <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-sm font-semibold">
                {selectedCategory}
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {loading ? 'Cargando servicios...' : `Mostrando ${services.length} de ${totalServices || 0} servicios`}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && currentPage === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="glass-glow rounded-3xl p-10 flex items-center space-x-4">
              <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-8 w-8 text-primary" />
              <span className="text-xl font-semibold">Cargando servicios...</span>
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
            <div className="glass-glow rounded-3xl p-12 max-w-lg mx-auto card-hover">
              <div className="h-20 w-20 bg-destructive/20 rounded-3xl flex items-center justify-center mx-auto mb-8 float">
                <Search className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 text-foreground">Error al cargar servicios</h3>
              <p className="text-lg text-muted-foreground/80 mb-8 leading-relaxed">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all px-8 py-6 text-base font-semibold rounded-xl"
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
              className="glass-glow border-white/20 hover:glass-medium hover:scale-105 transition-all px-8 py-6 text-base font-semibold rounded-xl"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-5 w-5 mr-2" />
                  Cargando...
                </>
              ) : (
                <>
                  Cargar Más Servicios
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
            <div className="glass-glow rounded-3xl p-12 max-w-lg mx-auto card-hover">
              <div className="h-20 w-20 liquid-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 float">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 text-foreground">No encontramos servicios</h3>
              <p className="text-lg text-muted-foreground/80 mb-8 leading-relaxed">
                Intenta ajustar tus filtros o buscar con términos diferentes
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                  setPriceRange([0, 3000]);
                  setCurrentPage(1);
                }}
                className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all px-8 py-6 text-base font-semibold rounded-xl"
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