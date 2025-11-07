import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Search, Filter, Heart, MapPin,
  Crown, CheckCircle, Trash2, Grid, List, SortAsc,
  Clock, Users, Briefcase, MoreHorizontal, Share2,
  MessageSquare, Phone, Mail, AlertCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { useSecureAuth } from "../context/SecureAuthContext";
import { favoritesService, FavoriteService, FavoriteProfessional } from "../lib/services/favorites.service";
import { toast } from "sonner";

interface FavoriteService {
  id: string;
  title: string;
  description: string;
  professional: {
    name: string;
    avatar?: string;
    verified: boolean;
    level: string;
    location: string;
  };
  image: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  dateAdded: string;
  lastUpdated: string;
}

interface FavoriteProfessional {
  id: string;
  name: string;
  avatar?: string;
  businessName: string;
  specialties: string[];
  location: string;
  verified: boolean;
  level: string;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  responseTime: string;
  dateAdded: string;
  lastActive: string;
  availability: string;
}

const favoriteServices: FavoriteService[] = [
  {
    id: "1",
    title: "Desarrollo Web Completo",
    description: "Sitios web profesionales y e-commerce con tecnologías modernas",
    professional: {
      name: "Carlos Rodríguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Top Rated Plus",
      location: "Rawson, Chubut"
    },
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    price: 25000,
    rating: 4.9,
    reviews: 187,
    category: "Desarrollo Web",
    dateAdded: "2024-01-15",
    lastUpdated: "2024-01-20"
  },
  {
    id: "2",
    title: "Identidad Visual Premium",
    description: "Logo, branding completo y diseño gráfico para tu empresa",
    professional: {
      name: "Ana Martínez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Profesional Verificado",
      location: "Puerto Madryn, Chubut"
    },
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    price: 15000,
    rating: 4.8,
    reviews: 143,
    category: "Diseño Gráfico",
    dateAdded: "2024-01-10",
    lastUpdated: "2024-01-18"
  }
];

const favoriteProfessionals: FavoriteProfessional[] = [
  {
    id: "1",
    name: "Miguel Torres",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face",
    businessName: "Torres Reparaciones",
    specialties: ["Plomería", "Electricidad", "Carpintería"],
    location: "Comodoro Rivadavia, Chubut",
    verified: true,
    level: "Técnico Certificado",
    rating: 4.7,
    reviewsCount: 89,
    completedJobs: 156,
    responseTime: "2 horas",
    dateAdded: "2024-01-12",
    lastActive: "hace 1 hora",
    availability: "available"
  }
];

function ServiceCard({ service }: { service: FavoriteService }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass border-white/10 overflow-hidden hover:bg-white/5 transition-all duration-300 group">
        <div className="relative">
          <img 
            src={service.image} 
            alt={service.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3">
            <Button
              variant="secondary"
              size="icon" className="h-9 w-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <Heart className="h-4 w-4 fill-destructive text-destructive" />
            </Button>
          </div>
          <Badge className="absolute top-3 left-3 bg-primary/90 text-white">
            {service.category}
          </Badge>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link to={`/services/${service.id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors group-hover:text-primary">
                  {service.title}
                </h3>
              </Link>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {service.description}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/20">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar de favoritos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={service.professional.avatar} />
              <AvatarFallback>{service.professional.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{service.professional.name}</span>
                {service.professional.verified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{service.professional.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{service.rating}</span>
              <span className="text-sm text-muted-foreground">({service.reviews})</span>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {service.professional.level}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                ${service.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1">ARS</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="glass border-white/20">
                <MessageSquare className="h-4 w-4 mr-1" />
                Contactar
              </Button>
              <Link to={`/services/${service.id}`}>
                <Button size="sm" className="liquid-gradient">
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-white/10">
            Agregado el {new Date(service.dateAdded).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProfessionalCard({ professional }: { professional: FavoriteProfessional }) {
  const statusColors = {
    available: "text-success",
    busy: "text-warning",
    offline: "text-muted-foreground"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass border-white/10 hover:bg-white/5 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={professional.avatar} />
                <AvatarFallback className="text-lg">
                  {professional.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Link to={`/professionals/${professional.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors group-hover:text-primary">
                      {professional.name}
                    </h3>
                  </Link>
                  {professional.verified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{professional.businessName}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{professional.location}</span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/20">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar de favoritos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {professional.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{professional.rating} ({professional.reviewsCount} reseñas)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{professional.completedJobs} trabajos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Responde en {professional.responseTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${
                professional.availability === 'available' ? 'bg-success' :
                professional.availability === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
              }`} />
              <span className={statusColors[professional.availability as keyof typeof statusColors]}>
                {professional.availability === 'available' ? 'Disponible' :
                 professional.availability === 'busy' ? 'Ocupado' : 'No disponible'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {professional.level}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Activo {professional.lastActive}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass border-white/20 flex-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Mensaje
            </Button>
            <Button variant="outline" size="sm" className="glass border-white/20">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="glass border-white/20">
              <Mail className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-white/10">
            Agregado el {new Date(professional.dateAdded).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FavoritesPage() {
  const { user } = useSecureAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteServices, setFavoriteServices] = useState<FavoriteService[]>([]);
  const [favoriteProfessionals, setFavoriteProfessionals] = useState<FavoriteProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await favoritesService.getAllFavorites();

      // Validar que data tenga la estructura correcta
      setFavoriteServices(data?.services || []);
      setFavoriteProfessionals(data?.professionals || []);
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      setError('Error al cargar favoritos');
      setFavoriteServices([]);
      setFavoriteProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      setRemovingId(serviceId);
      await favoritesService.removeServiceFromFavorites(serviceId);

      setFavoriteServices(prev => prev.filter(fav => fav.id !== serviceId));
      toast.success('Servicio eliminado de favoritos');
    } catch (err: any) {
      console.error('Error removing service:', err);
      toast.error('Error al eliminar servicio de favoritos');
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveProfessional = async (professionalId: string) => {
    try {
      setRemovingId(professionalId);
      await favoritesService.removeProfessionalFromFavorites(professionalId);

      setFavoriteProfessionals(prev => prev.filter(fav => fav.id !== professionalId));
      toast.success('Profesional eliminado de favoritos');
    } catch (err: any) {
      console.error('Error removing professional:', err);
      toast.error('Error al eliminar profesional de favoritos');
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <Card className="glass border-white/10 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Inicia Sesión</h2>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para ver tus favoritos
              </p>
              <Link to="/login">
                <Button className="liquid-gradient">Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-foreground">Mis Favoritos</h1>
          <p className="text-xl text-muted-foreground">
            Servicios y profesionales que has guardado
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Buscar en favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/20"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 glass border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-white/20">
              <SelectItem value="dateAdded">Fecha agregado</SelectItem>
              <SelectItem value="rating">Mejor valorado</SelectItem>
              <SelectItem value="price">Precio</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'liquid-gradient' : 'glass border-white/20'}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'liquid-gradient' : 'glass border-white/20'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="glass border-white/10 mb-8">
            <TabsTrigger value="services">
              Servicios ({favoriteServices.length})
            </TabsTrigger>
            <TabsTrigger value="professionals">
              Profesionales ({favoriteProfessionals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {favoriteServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="professionals">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {favoriteProfessionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {favoriteServices.length === 0 && favoriteProfessionals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-foreground">No tienes favoritos aún</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cuando encuentres servicios o profesionales que te interesen, 
              guárdalos aquí haciendo clic en el ícono de corazón.
            </p>
            <Link to="/services">
              <Button className="liquid-gradient">
                Explorar Servicios
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}