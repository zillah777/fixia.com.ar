import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Heart, Search, Filter, Star, MapPin, 
  Crown, CheckCircle, Trash2, Grid, List, SortAsc,
  Clock, Users, Briefcase, MoreHorizontal, Share2,
  MessageSquare, Phone, Mail, Calendar
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useSecureAuth as useAuth } from "../context/SecureAuthContext";
import { ServiceCard } from "../components/services/ServiceCard"; // Importar el componente reutilizable
import { Service as FavoriteService } from "../types"; // Importar el tipo centralizado

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
  },
  {
    id: "3",
    title: "Reparación de Electrodomésticos",
    description: "Servicio técnico especializado con garantía incluida",
    professional: {
      name: "Miguel Santos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      verified: true,
      level: "Técnico Certificado",
      location: "Comodoro Rivadavia, Chubut"
    },
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    price: 3500,
    rating: 5.0,
    reviews: 89,
    category: "Reparaciones",
    dateAdded: "2024-01-05",
    lastUpdated: "2024-01-16"
  }
];

const favoriteProfessionals: FavoriteProfessional[] = [
  {
    id: "1",
    name: "Laura Fernández",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
    businessName: "LF Marketing Digital",
    specialties: ["Marketing Digital", "Redes Sociales", "SEO"],
    location: "Trelew, Chubut",
    verified: true,
    level: "Top Rated Plus",
    rating: 4.9,
    reviewsCount: 156,
    completedJobs: 89,
    responseTime: "2 horas",
    dateAdded: "2024-01-12",
    lastActive: "En línea ahora",
    availability: "Disponible"
  },
  {
    id: "2",
    name: "Roberto Paz",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face",
    businessName: "Construcciones RP",
    specialties: ["Construcción", "Reformas", "Albañilería"],
    location: "Esquel, Chubut",
    verified: true,
    level: "Profesional Verificado",
    rating: 4.7,
    reviewsCount: 203,
    completedJobs: 145,
    responseTime: "4 horas",
    dateAdded: "2024-01-08",
    lastActive: "Hace 2 horas",
    availability: "Ocupado hasta Feb 5"
  }
];

function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Favoritos</span>
          </div>
        </Link>
        
        <Link to="/dashboard">
          <Button variant="ghost" className="hover:glass-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}

function FavoriteProfessionalCard({ professional, onRemove }: { 
  professional: FavoriteProfessional; 
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="glass hover:glass-medium transition-all duration-300 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={professional.avatar} />
                <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold">{professional.name}</h3>
                  {professional.verified && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{professional.businessName}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{professional.location}</span>
                </div>
                <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                  {professional.level}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:glass-medium">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/20">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemove(professional.id)}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Quitar de favoritos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Especialidades</h4>
              <div className="flex flex-wrap gap-1">
                {professional.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-warning" />
                <span>{professional.rating} ({professional.reviewsCount} reseñas)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{professional.completedJobs} trabajos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-success" />
                <span>Responde en {professional.responseTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{professional.availability}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/10">
              <span>Agregado: {new Date(professional.dateAdded).toLocaleDateString()}</span>
              <span>Última vez activo: {professional.lastActive}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyFavorites({ type }: { type: 'services' | 'professionals' }) {
  return (
    <Card className="glass border-white/10 text-center py-16">
      <CardContent>
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          No tienes {type === 'services' ? 'servicios' : 'profesionales'} favoritos
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Cuando encuentres {type === 'services' ? 'servicios' : 'profesionales'} que te interesen, 
          haz clic en el corazón para guardarlos aquí.
        </p>
        <Link to="/services">
          <Button className="liquid-gradient">
            <Search className="h-4 w-4 mr-2" />
            Explorar {type === 'services' ? 'Servicios' : 'Profesionales'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<FavoriteService[]>(favoriteServices);
  const [professionals, setProfessionals] = useState<FavoriteProfessional[]>(favoriteProfessionals);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleRemoveService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleRemoveProfessional = (id: string) => {
    setProfessionals(professionals.filter(professional => professional.id !== id));
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professional.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professional.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Mis Favoritos</h1>
                <p className="text-muted-foreground">
                  Servicios y profesionales que has guardado para consultar más tarde
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar en favoritos..."
                    className="pl-10 w-80 glass border-white/20"
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 glass border-white/20">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    <SelectItem value="dateAdded">Fecha agregado</SelectItem>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="rating">Calificación</SelectItem>
                    <SelectItem value="price">Precio</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border glass rounded-lg border-white/20">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "liquid-gradient" : ""}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "liquid-gradient" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="services" className="space-y-8">
              <TabsList className="glass border-white/10 p-1">
                <TabsTrigger value="services" className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Servicios</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {filteredServices.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="professionals" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Profesionales</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {filteredProfessionals.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services">
                {filteredServices.length > 0 ? (
                  <div className={`grid gap-6 ${
                    viewMode === "grid" 
                      ? "md:grid-cols-2 lg:grid-cols-3" 
                      : "grid-cols-1 max-w-4xl"
                  }`}>
                    {filteredServices.map((service: any) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        viewMode={viewMode}
                        isFavorite={true} // En esta página, todos los servicios son favoritos
                        onToggleFavorite={() => handleRemoveService(service.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyFavorites type="services" />
                )}
              </TabsContent>

              <TabsContent value="professionals">
                {filteredProfessionals.length > 0 ? (
                  <div className={`grid gap-6 ${
                    viewMode === "grid" 
                      ? "md:grid-cols-2 lg:grid-cols-3" 
                      : "grid-cols-1 max-w-4xl"
                  }`}>
                    {filteredProfessionals.map((professional) => (
                      <FavoriteProfessionalCard
                        key={professional.id}
                        professional={professional}
                        onRemove={handleRemoveProfessional}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyFavorites type="professionals" />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}