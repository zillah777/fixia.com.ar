import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import {
  ArrowRight, Heart, Shield, Clock, Users, CheckCircle,
  Search, Zap, TrendingUp, Globe,
  Palette, PenTool, Briefcase, HeadphonesIcon,
  ChevronRight, MessageSquare, MapPin,
  Crown, Phone, Mail, Gift, CreditCard, Building, User,
  GraduationCap, Scissors, Leaf, Truck, Flame, Star
} from "lucide-react";
import { servicesService, Service } from "../lib/services";
import { toast } from "sonner";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";
import { SkipNavigation } from "../components/SkipNavigation";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { SEOHelmet } from "../components/SEOHelmet";
import { getPublicStats, PublicStats } from "../lib/api";

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
  { name: "Albañil / Construcción", icon: Building, count: "150+ servicios", popular: true },
  { name: "Peluquería a domicilio", icon: Scissors, count: "85+ servicios", popular: true },
  { name: "Jardinería", icon: Leaf, count: "120+ servicios", popular: true },
  { name: "Mudanza / fletes", icon: Truck, count: "95+ servicios", popular: true },
  { name: "Niñera", icon: User, count: "110+ servicios", popular: true },
  { name: "Electricista", icon: Zap, count: "75+ servicios", popular: true }
];


function HeroSection() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative mobile-section overflow-hidden gradient-mesh">
      <div className="container mx-auto mobile-container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Badge className="mb-4 sm:mb-6 bg-success/20 text-success border-success/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {loadingStats ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Chubut, Argentina • {stats?.activeProfessionals || 0}+ profesionales activos
                  </span>
                  <span className="sm:hidden">
                    +{stats?.activeProfessionals || 0} profesionales
                  </span>
                </>
              )}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
                Conecta.
              </span>{" "}
              <span className="text-gradient-rainbow inline-block">
                Confía.
              </span>{" "}
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
                Resuelve.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              El primer marketplace de servicios profesionales de Chubut.
              <span className="block mt-2 text-base sm:text-lg md:text-xl text-muted-foreground/70">
                Conecta con profesionales verificados o promociona tus servicios sin comisiones.
              </span>
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
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-10 sm:mb-14 w-full px-4 sm:px-0">
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-white/30 hover:glass-medium hover:border-white/50 hover:scale-105 px-6 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold w-full sm:w-auto neon-border rounded-2xl transition-all duration-300 group"
                >
                  <Search className="mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Ver Proceso Completo</span>
                  <span className="sm:hidden">Cómo Funciona</span>
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50 px-6 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold w-full sm:w-auto glow-hover rounded-2xl group"
                >
                  <Gift className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Comenzar Ahora Gratis</span>
                  <span className="sm:hidden">Únete Gratis</span>
                  <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 text-sm sm:text-base mb-8">
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <span className="font-medium text-white/90">Sin comisiones</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-white/90 hidden sm:inline">Profesionales verificados</span>
                <span className="font-medium text-white/90 sm:hidden">Verificados</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="h-5 w-5 text-success" />
                </div>
                <span className="font-medium text-white/90 hidden sm:inline">Contacto directo</span>
                <span className="font-medium text-white/90 sm:hidden">Directo</span>
              </div>
            </div>
            
            <Link to="/pricing">
              <Button variant="outline" className="glass border-white/20 hover:glass-medium mobile-text-base ">
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
    count: cat.count ? `${cat.count}+ servicios` : '0 servicios',
    popular: cat.popular
  })) : categories;

  function getIconForCategory(categoryName: string) {
    const iconMap: { [key: string]: any } = {
      'Albañil / Construcción': Building,
      'Peluquería a domicilio': Scissors,
      'Jardinería': Leaf,
      'Mudanza / fletes': Truck,
      'Niñera': User,
      'Electricista': Zap,
      // Legacy categories (in case API returns old ones)
      'Fletes / Mudanzas': Truck,
      'Carga ligera': Truck,
      'Animadores / Payasos': User,
      'Asistente virtual': Users,
      'Clases particulares': GraduationCap,
      'Instalación de gas': Flame,
      'Desarrollo Web': Globe,
      'Diseño Gráfico': Palette,
      'Reparaciones': Briefcase,
      'Marketing Digital': TrendingUp,
      'Consultoría': HeadphonesIcon,
      'Limpieza': Users,
      'Educación': PenTool
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
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-foreground tracking-tight">
            Servicios Más Solicitados
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Descubre los profesionales más valorados en cada categoría de Chubut
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mobile-gap">
          {displayCategories.slice(0, 6).map((category, index) => {
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
                  <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full relative bg-card/50 backdrop-blur-xl mobile-card card-hover">
                    {category.popular && (
                      <Badge className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs px-2 py-0.5 font-medium pulse-glow">
                        Popular
                      </Badge>
                    )}
                    <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 border border-blue-400/20 float">
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
            <Button variant="outline" className="glass border-white/20 hover:glass-medium px-6">
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

function PremiumBenefitsSection() {
  const benefits = [
    {
      icon: Shield,
      title: "Profesionales Verificados",
      description: "Todos nuestros profesionales pasan por un proceso riguroso de verificación para garantizar calidad y confianza.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Clock,
      title: "Entrega a Tiempo",
      description: "Plazos de entrega garantizados. Si no se cumplen, recupera tu dinero sin preguntas.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Heart,
      title: "Soporte 24/7",
      description: "Nuestro equipo está siempre disponible para resolver cualquier duda o inconveniente que surja.",
      color: "from-red-500/20 to-orange-500/20"
    },
    {
      icon: TrendingUp,
      title: "Sin Comisiones Ocultas",
      description: "Transparencia total en precios. Lo que ves es lo que pagas, sin sorpresas adicionales.",
      color: "from-yellow-500/20 to-amber-500/20"
    },
    {
      icon: Users,
      title: "Comunidad Verificada",
      description: "Únete a miles de usuarios satisfechos que ya confían en Fixia para sus necesidades.",
      color: "from-indigo-500/20 to-blue-500/20"
    },
    {
      icon: Globe,
      title: "Conecta Localmente",
      description: "Encuentra profesionales y clientes en tu zona. Apoya la economía local de Chubut.",
      color: "from-green-500/20 to-emerald-500/20"
    }
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Beneficios Premium
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-foreground tracking-tight">
            Por qué elegir Fixia
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            La plataforma más confiable de servicios profesionales con protección garantizada
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-glow border-2 border-white/10 hover:border-primary/40 transition-all duration-300 h-full">
                  <CardContent className="pt-8 sm:pt-10 pb-6 px-6 sm:px-8">
                    <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 sm:mb-6`}>
                      <Icon className="h-6 sm:h-7 w-6 sm:w-7 text-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12">
            <Link to="/register">
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedServicesSection() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProfessionals = async () => {
      try {
        setLoading(true);
        const topProfessionals = await servicesService.getTopRatedProfessionals(6);
        setProfessionals(topProfessionals);
      } catch (error: any) {
        console.error('Error fetching top professionals:', error);
        setError('No se pudieron cargar los profesionales destacados');
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProfessionals();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-foreground tracking-tight">
            Profesionales Destacados
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Conoce a los mejores profesionales verificados de Chubut
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {loading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 6 }).map((_, index) => (
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
            Array.isArray(professionals) && professionals.map((professional, index) => {
              const rating = professional.professional_profile?.rating || 0;
              const reviewCount = professional.professional_profile?.review_count || 0;
              const service = professional.services?.[0];
              const serviceImage = service?.main_image || professional.avatar || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop";
              const category = service?.category?.name || professional.professional_profile?.specialties?.[0] || "Profesional";

              return (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/profile/${professional.id}`}>
                    <Card className="glass-glow hover:border-primary/40 transition-all duration-300 border-2 border-white/10 overflow-hidden group cursor-pointer relative">
                      <CardContent className="pt-8 pb-6 px-6 text-center">
                        {/* Avatar prominente en el centro superior */}
                        <div className="mb-6">
                          <Avatar className="h-24 w-24 ring-4 ring-primary/30 shadow-2xl border-4 border-background mx-auto group-hover:scale-110 transition-transform duration-300">
                            <AvatarImage src={professional.avatar} />
                            <AvatarFallback className="text-2xl font-bold">{professional.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Badges superiores */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Badge className="bg-primary text-white border-0 shadow-lg font-semibold">
                            {category}
                          </Badge>
                          <Badge className="bg-success text-white border-0 shadow-lg font-semibold">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>
                        {/* Nombre y ubicación */}
                        <div className="mb-4">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{professional.name}</h3>
                            {professional.verified && (
                              <CheckCircle className="h-5 w-5 text-success" />
                            )}
                          </div>
                          <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{professional.location || "Chubut, Argentina"}</span>
                          </div>
                        </div>

                        {/* Especialidades en chips */}
                        {professional.professional_profile?.specialties && professional.professional_profile.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {professional.professional_profile.specialties.slice(0, 3).map((specialty, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Descripción */}
                        {service && (
                          <>
                            <h4 className="font-semibold mb-2 line-clamp-1 text-foreground">{service.title}</h4>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                          </>
                        )}

                        {professional.professional_profile?.bio && !service && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{professional.professional_profile.bio}</p>
                        )}

                        {/* Rating y Precio */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-1">
                            <Star className="h-5 w-5 text-warning fill-warning" />
                            <span className="font-bold text-lg">{rating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({reviewCount})</span>
                          </div>
                          {service?.price && (
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Desde</div>
                              <span className="text-xl font-bold text-primary">${service.price.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <Button className="w-full mt-4 liquid-gradient text-white font-semibold shadow-lg hover:shadow-primary/50 transition-all">
                          Ver Perfil Completo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
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
            <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-6">
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
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-foreground tracking-tight">
            Cómo Funciona Fixia
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Simple, seguro y sin comisiones
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
                <Card className="glass-glow border-white/10 text-center h-full card-hover">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 liquid-gradient rounded-2xl flex items-center justify-center mx-auto glow-primary">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
            <Link to="/how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-6 w-full sm:w-auto">
                Ver Proceso Completo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-6 w-full sm:w-auto">
                Comenzar Ahora Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
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
          <Card className="glass-glow border-white/10 overflow-hidden neon-border">
            <CardContent className="p-8 sm:p-12 md:p-16 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-foreground tracking-tight leading-tight">
                  ¿Listo para conectar con los mejores profesionales?
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/80 mb-10 sm:mb-12 leading-relaxed">
                  Únete al marketplace local líder de Chubut.
                  <span className="block mt-2 text-base sm:text-lg text-muted-foreground/60">
                    Sin comisiones • Profesionales verificados • Contacto directo
                  </span>
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50 px-10 py-6 text-lg font-semibold w-full sm:w-auto rounded-2xl group"
                    >
                      <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                      Comenzar Ahora
                    </Button>
                  </Link>
                  <Link to="/register?type=professional" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass border-white/30 hover:glass-medium hover:border-white/50 hover:scale-105 px-10 py-6 text-lg font-semibold w-full sm:w-auto rounded-2xl transition-all duration-300 group"
                    >
                      <Crown className="mr-3 h-6 w-6 text-warning group-hover:text-warning/80 transition-colors" />
                      Ofrecer Servicios
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 text-sm sm:text-base text-muted-foreground/60">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Sin comisiones
                  </span>
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Verificados
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-success" />
                    Contacto directo
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    Respuesta rápida
                  </span>
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
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src="/logo.png"
                  alt="Fixia Logo"
                  className="h-14 w-14 object-contain drop-shadow-lg"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-30 animate-pulse-slow"></div>
              </motion.div>
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-semibold text-foreground">Fixia</span>
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

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Soporte</h4>
            <div className="space-y-2">
              <Link to="/help" className="block text-muted-foreground hover:text-primary transition-colors">
                Centro de Ayuda
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contacto
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
                <a href="tel:+5492804874166" className="hover:text-primary transition-colors">
                  +54 9 2804874166
                </a>
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
      <SEOHelmet
        title="Marketplace de Servicios Profesionales en Argentina"
        description="Conecta con profesionales verificados en Argentina. Encuentra servicios de calidad en diseño, desarrollo, marketing, consultoría y más. Pago seguro y garantía de satisfacción."
        keywords="servicios profesionales, marketplace, freelancers Argentina, diseño web, desarrollo software, marketing digital, consultoria"
        type="website"
      />
      <SkipNavigation />
      <FixiaNavigation />
      <main id="main-content" role="main" aria-label="Contenido principal" className="pb-24 lg:pb-0">
        <HeroSection />
        <CategoriesSection />
        <PremiumBenefitsSection />
        <FeaturedServicesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
      <MobileBottomNavigation />
    </div>
  );
}