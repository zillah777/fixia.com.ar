import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Share2, Clock, CheckCircle, MapPin,
  Star, MessageCircle, Shield, Eye, X, ChevronLeft, ChevronRight,
  Award, ThumbsUp, Flag, Package
} from "lucide-react";
import { servicesService, type Service } from "../lib/services/services.service";
import { favoritesService } from "../lib/services/favorites.service";
import { feedbackService, type Feedback, type TrustScore } from "../lib/services/feedback.service";
import { openWhatsAppChat } from "../lib/whatsapp";
import { toast } from "sonner";
import { useSecureAuth } from "../context/SecureAuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";
import { SEOHelmet } from "../components/SEOHelmet";

// Suppress unused imports for later use
const _unused = { useNavigate };

// Helper function to get category name
const getCategoryName = (category: string | { id: string; name: string; slug: string; icon?: string }): string => {
  return typeof category === 'string' ? category : category.name;
};

// Package interface matching NewProjectPage structure
interface ServicePackage {
  name: string;
  price: number;
  description: string;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

// Lightbox for images
function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-white/10">
        <DialogTitle className="sr-only">Galería de imágenes</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Image */}
          <img
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-lg"
          />

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background"
              onClick={onNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { user } = useSecureAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const serviceData = await servicesService.getServiceById(id);
        setService(serviceData);

        // Track view after successfully loading service
        // Do this asynchronously without blocking the UI
        servicesService.trackView(id).catch((err) => {
          console.log('View tracking failed:', err);
          // Silently fail - don't show error to user
        });
      } catch (err) {
        setError('Error al cargar el servicio');
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Fetch feedback for professional
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!service?.professional?.id) return;

      setFeedbackLoading(true);
      try {
        const [feedbackData, scoreData] = await Promise.all([
          feedbackService.getFeedbackReceivedByUser(service.professional.id),
          feedbackService.getTrustScore(service.professional.id)
        ]);
        setFeedback(feedbackData);
        setTrustScore(scoreData);
      } catch (error) {
        console.error('Error loading feedback:', error);
        // Silently fail - don't show error to user
        setFeedback([]);
        setTrustScore(null);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedback();
  }, [service?.professional?.id]);

  // Check favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      if (!service || !user) return;

      try {
        const result = await favoritesService.isServiceFavorite(service.id);
        setIsFavorite(result.is_favorite);
      } catch (error) {
        setIsFavorite(false);
      }
    };

    checkFavorite();
  }, [service, user]);

  const toggleFavorite = async () => {
    if (!service) return;
    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await favoritesService.removeServiceFromFavorites(service.id);
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        await favoritesService.addServiceToFavorites(service.id);
        setIsFavorite(true);
        toast.success('Agregado a favoritos');
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error('Debes iniciar sesión para agregar favoritos');
      } else {
        toast.error('Error al actualizar favoritos');
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContactWhatsApp = () => {
    if (!service?.professional?.whatsapp_number) {
      toast.error('El profesional no tiene WhatsApp configurado');
      return;
    }

    openWhatsAppChat({
      phone: service.professional.whatsapp_number,
      name: service.professional.name,
      service: {
        title: service.title,
        price: getCurrentPackage().price,
        id: service.id
      }
    });
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: service?.title,
          text: service?.description,
          url: url
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado al portapapeles');
    }
  };

  const getCurrentPackage = (): ServicePackage => {
    // Default packages based on service price
    const basePrice = service?.price || 0;

    const packages = {
      basic: {
        name: 'Básico',
        price: Math.floor(basePrice * 0.7),
        description: 'Opción básica con características esenciales',
        deliveryTime: service?.delivery_time_days || 7,
        revisions: 1,
        features: [
          'Entrega en tiempo estimado',
          '1 revisión incluida',
          'Soporte por email',
          'Archivos finales'
        ]
      },
      standard: {
        name: 'Estándar',
        price: basePrice,
        description: 'La opción más popular con excelente valor',
        deliveryTime: Math.floor((service?.delivery_time_days || 7) * 0.8),
        revisions: service?.revisions_included || 2,
        features: [
          'Entrega más rápida',
          `${service?.revisions_included || 2} revisiones incluidas`,
          'Soporte prioritario',
          'Archivos fuente',
          'Optimización incluida'
        ]
      },
      premium: {
        name: 'Premium',
        price: Math.floor(basePrice * 1.5),
        description: 'Servicio completo con todas las características',
        deliveryTime: Math.floor((service?.delivery_time_days || 7) * 0.5),
        revisions: 5,
        features: [
          'Entrega express',
          'Revisiones ilimitadas',
          'Soporte 24/7',
          'Archivos fuente premium',
          'Optimización avanzada',
          'Consultoría incluida'
        ]
      }
    };

    return packages[selectedPackage];
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const previousImage = () => {
    const images = service?.gallery || [];
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    const images = service?.gallery || [];
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="glass rounded-2xl p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full border-4 border-current border-t-transparent h-12 w-12 text-primary" />
            <span className="text-lg font-medium">Cargando servicio...</span>
          </div>
        </div>
        <MobileBottomNavigation />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-16">
            <Card className="glass border-white/10 p-12 max-w-lg mx-auto">
              <div className="h-16 w-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Servicio no encontrado</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link to="/services">
                <Button className="liquid-gradient hover:opacity-90">
                  Volver a Servicios
                </Button>
              </Link>
            </Card>
          </div>
        </div>
        <MobileBottomNavigation />
      </div>
    );
  }

  const currentPackage = getCurrentPackage();
  const images = service.gallery || [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHelmet
        title={`${service.title} - ${getCategoryName(service.category)}`}
        description={service.description.substring(0, 160)}
        keywords={`${getCategoryName(service.category)}, ${service.tags?.join(', ')}, servicios profesionales, ${service.professional.name}`}
        image={service.main_image || service.gallery?.[0]}
        type="article"
        author={service.professional.name}
      />
      <FixiaNavigation />

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrevious={previousImage}
          onNext={nextImage}
        />
      )}

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/services" className="hover:text-primary transition-colors">
              Servicios
            </Link>
            <span>/</span>
            <Link to={`/services?category=${getCategoryName(service.category)}`} className="hover:text-primary transition-colors">
              {getCategoryName(service.category)}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{service.title}</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="frosted border-white/10 overflow-hidden shimmer">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={service.main_image || images[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"}
                    alt={service.title}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => images.length > 0 && openLightbox(0)}
                  />

                  {/* Action buttons overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/80 hover:bg-background backdrop-blur-sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/80 hover:bg-background backdrop-blur-sm"
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                    >
                      {favoriteLoading ? (
                        <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4" />
                      ) : (
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      )}
                    </Button>
                  </div>

                  {/* Gallery thumbnails */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {images.slice(0, 5).map((img, index) => (
                          <button
                            key={index}
                            onClick={() => openLightbox(index)}
                            className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-white/20 hover:border-primary/50 transition-colors"
                          >
                            <img src={img} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {images.length > 5 && (
                          <button
                            onClick={() => openLightbox(5)}
                            className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-background/80 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-sm font-medium hover:border-primary/50 transition-colors"
                          >
                            +{images.length - 5}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Service Title & Professional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass border-white/10 p-4 sm:p-6">
                {/* Category & Featured badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                    {getCategoryName(service.category)}
                  </Badge>
                  {service.featured && (
                    <Badge className="bg-warning/20 text-warning border-warning/30">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Destacado
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {service.title}
                </h1>

                {/* Professional Info */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <Link
                    to={`/profile/${service.professional.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="h-12 w-12 border-2 border-white/20">
                      <AvatarImage src={service.professional.avatar} />
                      <AvatarFallback className="bg-primary/10">
                        {service.professional.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {service.professional.name}
                        </span>
                        {service.professional.verified && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                          {service.professional.professional_profile?.rating?.toFixed(1) || 'Nuevo'}
                        </span>
                        <span>
                          ({service.professional.professional_profile?.review_count || 0} reseñas)
                        </span>
                        {service.professional.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {service.professional.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {service.view_count || 0} vistas
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {service._count?.favorites || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tabs Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="glass w-full justify-start overflow-x-auto">
                  <TabsTrigger value="about">Descripción</TabsTrigger>
                  <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                  <TabsTrigger value="faq">Preguntas</TabsTrigger>
                </TabsList>

                {/* About Tab */}
                <TabsContent value="about" className="mt-6">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Sobre este servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="prose prose-sm sm:prose max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <Separator />

                      {/* Tags */}
                      {service.tags && service.tags.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Tecnologías y habilidades</h3>
                          <div className="flex flex-wrap gap-2">
                            {service.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="bg-muted">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Service highlights */}
                      <div>
                        <h3 className="font-semibold mb-4">Características destacadas</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">Entrega rápida</div>
                              <div className="text-sm text-muted-foreground">
                                {service.delivery_time_days || 7} días promedio
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                              <Shield className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <div className="font-medium">Profesional verificado</div>
                              <div className="text-sm text-muted-foreground">
                                Identidad confirmada
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                              <Award className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                              <div className="font-medium">Calidad garantizada</div>
                              <div className="text-sm text-muted-foreground">
                                {service.revisions_included || 2} revisiones incluidas
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">Comunicación directa</div>
                              <div className="text-sm text-muted-foreground">
                                Contacto via WhatsApp
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Packages Tab */}
                <TabsContent value="packages" className="mt-6">
                  <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                    {(['basic', 'standard', 'premium'] as const).map((pkg) => {
                      const packageData = {
                        basic: {
                          name: 'Básico',
                          price: Math.floor((service.price || 0) * 0.7),
                          description: 'Opción básica con características esenciales',
                          deliveryTime: service.delivery_time_days || 7,
                          revisions: 1,
                          features: [
                            'Entrega en tiempo estimado',
                            '1 revisión incluida',
                            'Soporte por email',
                            'Archivos finales'
                          ]
                        },
                        standard: {
                          name: 'Estándar',
                          price: service.price || 0,
                          description: 'La opción más popular',
                          deliveryTime: Math.floor((service.delivery_time_days || 7) * 0.8),
                          revisions: service.revisions_included || 2,
                          features: [
                            'Entrega más rápida',
                            `${service.revisions_included || 2} revisiones`,
                            'Soporte prioritario',
                            'Archivos fuente',
                            'Optimización incluida'
                          ]
                        },
                        premium: {
                          name: 'Premium',
                          price: Math.floor((service.price || 0) * 1.5),
                          description: 'Servicio completo',
                          deliveryTime: Math.floor((service.delivery_time_days || 7) * 0.5),
                          revisions: 5,
                          features: [
                            'Entrega express',
                            'Revisiones ilimitadas',
                            'Soporte 24/7',
                            'Archivos fuente premium',
                            'Optimización avanzada',
                            'Consultoría incluida'
                          ]
                        }
                      }[pkg];

                      const isPopular = pkg === 'standard';

                      return (
                        <motion.div
                          key={pkg}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className={`glass-glow border-white/10 relative overflow-hidden card-hover ${
                            isPopular ? 'ring-2 ring-primary/30 neon-border' : ''
                          }`}>
                            {isPopular && (
                              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg pulse-glow">
                                Más popular
                              </div>
                            )}

                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-lg">{packageData.name}</CardTitle>
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <CardDescription className="text-sm">
                                {packageData.description}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {/* Price */}
                              <div>
                                <div className="text-3xl font-bold text-primary">
                                  ${packageData.price.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Precio total
                                </div>
                              </div>

                              <Separator />

                              {/* Delivery & Revisions */}
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Entrega</span>
                                  <span className="font-medium">{packageData.deliveryTime} días</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Revisiones</span>
                                  <span className="font-medium">
                                    {packageData.revisions === 5 ? 'Ilimitadas' : packageData.revisions}
                                  </span>
                                </div>
                              </div>

                              <Separator />

                              {/* Features */}
                              <div className="space-y-2">
                                {packageData.features.map((feature, index) => (
                                  <div key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Contact button */}
                              <Button
                                className={`w-full ${isPopular ? 'liquid-gradient' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}
                                onClick={() => {
                                  setSelectedPackage(pkg);
                                  handleContactWhatsApp();
                                }}
                              >
                                Contactar
                                <MessageCircle className="ml-2 h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Feedback del profesional</CardTitle>
                      <CardDescription>
                        Lo que otros usuarios dicen sobre {service.professional.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Trust Score Summary */}
                      {trustScore && (
                        <div className="flex items-center gap-8 mb-8 flex-wrap">
                          <div className="text-center">
                            <div className="text-5xl font-bold mb-2">
                              {trustScore.trustPercentage}%
                            </div>
                            <div className="flex items-center gap-1 justify-center mb-1">
                              <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Confiabilidad
                            </div>
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[200px]">
                            <div className="flex flex-col items-center p-4 glass-medium rounded-lg border border-blue-500/20">
                              <ThumbsUp className="h-6 w-6 text-blue-400 mb-2" />
                              <p className="text-2xl font-bold">{trustScore.totalLikes}</p>
                              <p className="text-xs text-muted-foreground">Likes positivos</p>
                            </div>
                            <div className="flex flex-col items-center p-4 glass-medium rounded-lg border border-purple-500/20">
                              <MessageCircle className="h-6 w-6 text-purple-400 mb-2" />
                              <p className="text-2xl font-bold">{trustScore.totalFeedback}</p>
                              <p className="text-xs text-muted-foreground">Total feedback</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator className="my-6" />

                      {/* Feedback list */}
                      {feedbackLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : feedback.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Aún no hay feedback para este profesional</p>
                          <p className="text-sm">Sé el primero en dejar feedback</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {feedback.map((fb) => (
                            <motion.div
                              key={fb.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 glass-medium rounded-lg"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                                  <AvatarImage src={fb.fromUser.avatar} alt={fb.fromUser.name} />
                                  <AvatarFallback className="glass">
                                    {fb.fromUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold">{fb.fromUser.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {fb.fromUser.userType === 'professional' ? 'Profesional' : 'Cliente'}
                                    </Badge>
                                    {fb.hasLike && (
                                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        Like
                                      </Badge>
                                    )}
                                  </div>

                                  {fb.comment && (
                                    <div className="flex items-start gap-2 text-sm text-foreground/90">
                                      <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                      <p className="leading-relaxed">{fb.comment}</p>
                                    </div>
                                  )}

                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(fb.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {feedback.length > 5 && (
                            <div className="text-center pt-4">
                              <Link to={`/profile/${service.professional.id}`}>
                                <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                                  Ver todo el feedback ({feedback.length})
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="mt-6">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Preguntas frecuentes</CardTitle>
                      <CardDescription>
                        Respuestas a las dudas más comunes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* FAQ Placeholder */}
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No hay preguntas frecuentes configuradas</p>
                          <p className="text-sm">Contacta al profesional para más información</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* About Professional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Sobre el profesional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white/20">
                      <AvatarImage src={service.professional.avatar} />
                      <AvatarFallback className="bg-primary/10 text-lg">
                        {service.professional.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{service.professional.name}</h3>
                        {service.professional.verified && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          {service.professional.professional_profile?.rating?.toFixed(1) || 'Nuevo'}
                        </span>
                        <span>•</span>
                        <span>{service.professional.professional_profile?.review_count || 0} reseñas</span>
                        {service.professional.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {service.professional.location}
                            </span>
                          </>
                        )}
                      </div>
                      {service.professional.professional_profile?.bio && (
                        <p className="text-sm text-muted-foreground">
                          {service.professional.professional_profile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 glass-light rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {service.professional.professional_profile?.completed_orders || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Proyectos</div>
                    </div>
                    <div className="text-center p-3 glass-light rounded-lg">
                      <div className="text-2xl font-bold text-success mb-1">
                        {service.professional.professional_profile?.response_time_hours || 2}h
                      </div>
                      <div className="text-xs text-muted-foreground">Respuesta</div>
                    </div>
                    <div className="text-center p-3 glass-light rounded-lg">
                      <div className="text-2xl font-bold text-warning mb-1">
                        {service.professional.professional_profile?.rating?.toFixed(1) || 'Nuevo'}
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center p-3 glass-light rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {service.professional.professional_profile?.review_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Reseñas</div>
                    </div>
                  </div>

                  <Link to={`/profile/${service.professional.id}`}>
                    <Button variant="outline" className="w-full glass border-white/20">
                      Ver perfil completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sticky Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24 space-y-6"
            >
              {/* Price & Contact Card */}
              <Card className="glass border-white/10">
                <CardContent className="p-6 space-y-6">
                  {/* Selected package info */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Paquete seleccionado</span>
                      <Badge variant="outline" className="capitalize">
                        {currentPackage.name}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-primary">
                        ${currentPackage.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Precio total del servicio</div>
                  </div>

                  <Separator />

                  {/* Package quick info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Tiempo de entrega
                      </span>
                      <span className="font-medium">{currentPackage.deliveryTime} días</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        Revisiones
                      </span>
                      <span className="font-medium">
                        {currentPackage.revisions === 5 ? 'Ilimitadas' : currentPackage.revisions}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact button */}
                  <Button
                    className="w-full liquid-gradient hover:opacity-90 h-12 text-base font-semibold"
                    size="lg"
                    onClick={handleContactWhatsApp}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contactar via WhatsApp
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    Comunícate directamente con el profesional
                  </div>
                </CardContent>
              </Card>

              {/* Trust indicators */}
              <Card className="glass border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Pago seguro</div>
                      <div className="text-xs text-muted-foreground">
                        Acuerda el pago directamente con el profesional
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Comunicación directa</div>
                      <div className="text-xs text-muted-foreground">
                        Habla con el profesional por WhatsApp
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <ThumbsUp className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Satisfacción garantizada</div>
                      <div className="text-xs text-muted-foreground">
                        Revisiones incluidas en tu paquete
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report button */}
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                size="sm"
              >
                <Flag className="h-4 w-4 mr-2" />
                Reportar servicio
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <MobileBottomNavigation />
    </div>
  );
}
