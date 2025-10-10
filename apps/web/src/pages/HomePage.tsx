import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { 
  ArrowRight, Star, Shield, Clock, Users, CheckCircle, 
  Search, Zap, Award, TrendingUp, Globe, Smartphone,
  Palette, Code, PenTool, Camera, Briefcase, HeadphonesIcon,
  Play, ChevronRight, MessageSquare, Heart, Bell, MapPin,
  Crown, Phone, Mail, Gift, CreditCard, Building, User,
  GraduationCap
} from "lucide-react";
import { servicesService, Service } from "../lib/services";
import { toast } from "sonner";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";
import { SkipNavigation } from "../components/SkipNavigation";

const featuredServices = [
  {
    id: 1,
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
    category: "Desarrollo Web"
  },
  {
    id: 2,
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
    category: "Diseño Gráfico"
  },
  {
    id: 3,
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
    category: "Reparaciones"
  }
];

const categories = [
  { name: "Desarrollo Web", icon: Globe, count: "120+ servicios", popular: true },
  { name: "Diseño Gráfico", icon: Palette, count: "95+ servicios", popular: true },
  { name: "Reparaciones", icon: Building, count: "180+ servicios", popular: true },
  { name: "Marketing Digital", icon: TrendingUp, count: "75+ servicios", popular: false },
  { name: "Consultoría", icon: HeadphonesIcon, count: "65+ servicios", popular: false },
  { name: "Limpieza", icon: User, count: "210+ servicios", popular: true },
  { name: "Jardinería", icon: Camera, count: "85+ servicios", popular: false },
  { name: "Educación", icon: GraduationCap, count: "45+ servicios", popular: false }
];

function Navigation() {
  return (
    <motion.header 
      id="navigation"
      role="banner"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 liquid-gradient rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base sm:text-lg">F</span>
            </div>
            <div className="absolute -inset-1 liquid-gradient rounded-lg sm:rounded-xl blur opacity-20 animate-pulse-slow"></div>
          </motion.div>
          <div className="hidden sm:flex flex-col">
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/services" className="text-foreground hover:text-primary transition-colors font-medium">
            Explorar Servicios
          </Link>
          <Link to="/how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
            Cómo Funciona
          </Link>
          <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
            Contacto
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="hover:glass-medium transition-all duration-300 text-sm sm:text-base">
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Entrar</span>
            </Button>
          </Link>
          <Link to="/register">
            <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg text-sm">
              <Gift className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Únete Gratis</span>
              <span className="sm:hidden">Únete</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function HeroSection() {
  return (
    <section className="relative mobile-section overflow-hidden">
      <div className="container mx-auto mobile-container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Badge className="mb-4 sm:mb-6 bg-success/20 text-success border-success/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Chubut, Argentina • +500 profesionales activos</span>
              <span className="sm:hidden">+500 profesionales</span>
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Conecta.
              </span>{" "}
              <span className="text-gradient-primary text-gradient-fallback">
                Confía.
              </span>{" "}
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Resuelve.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              El primer marketplace de microservicios de la Provincia del Chubut. 
              Conecta con profesionales locales verificados o promociona tus servicios.
            </p>
            
            {/* Launch Promotion Alert */}
            <Card className="glass border-warning/30 bg-warning/5 mb-6 sm:mb-8 max-w-2xl mx-auto mobile-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  <span className="font-semibold text-warning mobile-text-base">¡Promoción de Lanzamiento!</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Primeros 200 usuarios obtienen 2 meses gratis de funcionalidades premium
                </p>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link to="/services">
                <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-6 py-3 sm:px-8 sm:py-6 mobile-text-lg w-full sm:w-auto touch-target">
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Buscar Profesionales
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/register?type=professional">
                <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-6 py-3 sm:px-8 sm:py-6 mobile-text-lg w-full sm:w-auto touch-target">
                  <Crown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ser Profesional
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-success" />
                Sin comisiones
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-success" />
                <span className="hidden sm:inline">Profesionales verificados</span>
                <span className="sm:hidden">Verificados</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-success" />
                <span className="hidden sm:inline">Contacto directo WhatsApp</span>
                <span className="sm:hidden">WhatsApp directo</span>
              </div>
            </div>
            
            <Link to="/pricing">
              <Button variant="outline" className="glass border-white/20 hover:glass-medium mobile-text-base touch-target">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Ver Planes y Precios</span>
                <span className="sm:hidden">Ver Precios</span>
                <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await servicesService.getCategories();
        setApiCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep using static categories on error
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Use API categories if available, otherwise fallback to static
  const displayCategories = (Array.isArray(apiCategories) && apiCategories.length > 0) ? apiCategories.map(cat => ({
    name: cat.name,
    icon: getIconForCategory(cat.name),
    count: `${cat.count}+ servicios`,
    popular: cat.popular
  })) : categories;

  function getIconForCategory(categoryName: string) {
    const iconMap: { [key: string]: any } = {
      'Desarrollo Web': Globe,
      'Diseño Gráfico': Palette,
      'Reparaciones': Briefcase,
      'Marketing Digital': TrendingUp,
      'Consultoría': HeadphonesIcon,
      'Limpieza': Users,
      'Jardinería': Camera,
      'Educación': PenTool,
    };
    return iconMap[categoryName] || Briefcase;
  }

  return (
    <section className="mobile-section">
      <div className="container mx-auto mobile-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="mobile-text-3xl font-bold mb-3 sm:mb-4 text-foreground">Servicios Más Solicitados</h2>
          <p className="mobile-text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los profesionales más valorados en cada categoría de Chubut
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mobile-gap">
          {displayCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/services?category=${encodeURIComponent(category.name)}`}>
                  <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full relative bg-card/50 backdrop-blur-xl mobile-card touch-target">
                    {category.popular && (
                      <Badge className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs px-2 py-0.5 font-medium">
                        Popular
                      </Badge>
                    )}
                    <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 border border-blue-400/20">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </div>
                      <h3 className="font-semibold mb-1 sm:mb-2 text-white text-xs sm:text-sm md:text-base leading-tight">{category.name}</h3>
                      <p className="text-xs text-gray-400">{category.count}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/services">
            <Button variant="outline" className="glass border-white/20 hover:glass-medium px-8">
              Ver Todas las Categorías
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCardSkeleton() {
  return (
    <Card className="glass border-white/10 overflow-hidden">
      <div className="relative aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturedServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        setLoading(true);
        const featuredServices = await servicesService.getFeaturedServices(3);
        setServices(featuredServices);
      } catch (error: any) {
        console.error('Error fetching featured services:', error);
        setError('No se pudieron cargar los servicios destacados');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-foreground">Profesionales Destacados</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conoce a algunos de los mejores profesionales verificados de Chubut
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {loading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <ServiceCardSkeleton />
              </motion.div>
            ))
          ) : (
            Array.isArray(services) && services.map((service, index) => {
              const fullName = `${service.professional.name} ${service.professional.lastName}`;
              const serviceImage = service.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop";
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/services/${service.id}`}>
                    <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group cursor-pointer">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={serviceImage} 
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop";
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            {service.category}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8 glass">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={service.professional.avatar} />
                            <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{fullName}</span>
                              {service.professional.verified && (
                                <CheckCircle className="h-4 w-4 text-success" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{service.professional.location}</span>
                            </div>
                            <Badge className="bg-warning/20 text-warning border-warning/30 text-xs mt-1">
                              {service.professional.level}
                            </Badge>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2">{service.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-warning fill-current" />
                            <span className="font-medium">{service.averageRating}</span>
                            <span className="text-muted-foreground text-sm">({service.totalReviews})</span>
                          </div>
                          <span className="text-xl font-bold text-primary">${service.price.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/services">
            <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
              Ver Más Profesionales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Busca lo que necesitas",
      description: "Explora profesionales por categoría o crea una alerta para que te contacten",
      icon: Search
    },
    {
      number: "02", 
      title: "Conecta de forma segura",
      description: "Revisa perfiles verificados con insignias de calidad y reputación comprobada",
      icon: Users
    },
    {
      number: "03",
      title: "Contacta por WhatsApp",
      description: "Acuerda directamente con el profesional sin intermediarios ni comisiones",
      icon: MessageSquare
    }
  ];

  return (
    <section id="como-funciona" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-foreground">Cómo Funciona Fixia</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un proceso simple, seguro y sin comisiones para conectar con los mejores
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="glass border-white/10 text-center h-full">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 liquid-gradient rounded-2xl flex items-center justify-center mx-auto">
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-background rounded-full border-2 border-primary/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{step.number}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/how-it-works">
            <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8 mr-4">
              Ver Proceso Completo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
              Comenzar Ahora Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-6 text-foreground">
                  ¿Listo para conectar con los mejores profesionales de Chubut?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Únete a la revolución del marketplace local. Sin comisiones, 
                  con profesionales verificados y contacto directo.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-8">
                      <Users className="mr-2 h-5 w-5" />
                      Buscar Profesionales
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8">
                      <Crown className="mr-2 h-5 w-5" />
                      Ser Profesional
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
                  <span>✨ Sin comisiones</span>
                  <span>🛡️ Profesionales verificados</span>
                  <span>📱 Contacto directo WhatsApp</span>
                  <span>🎯 Matchmaking inteligente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" role="contentinfo" className="py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-foreground">Fixia</span>
                <span className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</span>
              </div>
            </Link>
            <p className="text-muted-foreground">
              El marketplace #1 de microservicios profesionales de la Provincia del Chubut.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Chubut, Argentina</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Plataforma</h4>
            <div className="space-y-2">
              <Link to="/services" className="block text-muted-foreground hover:text-primary transition-colors">
                Buscar Profesionales
              </Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                Planes y Precios
              </Link>
              <Link to="/register?type=professional" className="block text-muted-foreground hover:text-primary transition-colors">
                Ser Profesional
              </Link>
              <Link to="/register" className="block text-muted-foreground hover:text-primary transition-colors">
                Registrarse Gratis
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                Sobre Nosotros
              </Link>
              <Link to="/how-it-works" className="block text-muted-foreground hover:text-primary transition-colors">
                Cómo Funciona
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Categorías Populares</h4>
            <div className="space-y-2">
              <Link to="/services?category=Desarrollo Web" className="block text-muted-foreground hover:text-primary transition-colors">
                Desarrollo Web
              </Link>
              <Link to="/services?category=Reparaciones" className="block text-muted-foreground hover:text-primary transition-colors">
                Reparaciones
              </Link>
              <Link to="/services?category=Limpieza" className="block text-muted-foreground hover:text-primary transition-colors">
                Limpieza
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contacto</h4>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>soporte@fixia.app</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+54 280 4567890</span>
              </div>
              <p className="text-sm">Disponible Lun-Vie 9-18hs</p>
              <Link to="/contact" className="text-primary hover:underline text-sm">
                Página de Contacto →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-muted-foreground text-center md:text-left">
            <p>&copy; 2025 Fixia. Todos los derechos reservados. Hecho en Chubut, Argentina 🇦🇷</p>
            <p className="text-xs opacity-30 mt-1">mmata</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacidad
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SkipNavigation />
      <Navigation />
      <main id="main-content" role="main" aria-label="Contenido principal">
        <HeroSection />
        <CategoriesSection />
        <FeaturedServicesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
      <MobileBottomNavigation />
    </div>
  );
}