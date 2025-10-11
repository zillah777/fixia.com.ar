import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Award, Heart, Share2, Clock, DollarSign, Users, Award, 
  MessageSquare, Shield, CheckCircle, MapPin, Calendar, Zap, 
  ThumbsUp, Eye, ArrowRight, Play, Download, Flag, MoreHorizontal, Loader2, AlertTriangle
} from "lucide-react";
import { servicesService, type Service } from "../lib/services/services.service";
import { openWhatsAppChat } from "../lib/whatsapp";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";


function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/services" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a servicios
        </Link>
        
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className="font-semibold">Fixia</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button variant="ghost" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch service details from API
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const serviceData = await servicesService.getServiceById(id);
        setService(serviceData);
      } catch (err) {
        setError('Error al cargar el servicio. Por favor, intenta nuevamente.');
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg">Cargando servicio...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
              <div className="h-16 w-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Error al cargar el servicio</h3>
              <p className="text-muted-foreground mb-6">{error || 'Servicio no encontrado'}</p>
              <Link to="/services">
                <Button className="liquid-gradient hover:opacity-90">
                  Volver a Servicios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass border-white/10 overflow-hidden">
                <div className="relative aspect-video">
                  <img 
                    src={service.images?.[currentImageIndex] || service.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {service.images && service.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex space-x-2">
                      {service.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-primary' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-4 right-4 glass"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ver demo
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Service Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass border-white/10 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        Desarrollo Web
                      </Badge>
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        <Award className="h-3 w-3 mr-1" />
                        Destacado
                      </Badge>
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-warning fill-current" />
                        <span className="font-medium">{service.averageRating}</span>
                        <span>({service.totalReviews} reseñas)</span>
                      </div>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        Popular
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {service.active ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Descripción del Servicio</h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Packages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass border-white/10 p-6">
                <h3 className="font-semibold mb-6">Información del Servicio</h3>
                
                <Card className="glass hover:glass-medium border-white/10">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">Servicio</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          ${service.price}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.priceType === 'hourly' ? 'Por hora' : service.priceType === 'fixed' ? 'Precio fijo' : 'Negociable'}
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-success">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.active ? 'Disponible' : 'No disponible'}
                      </span>
                      <span className="text-muted-foreground">
                        Categoría: {service.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Características:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span>Servicio profesional verificado</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span>Comunicación directa con el profesional</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span>Garantía de calidad</span>
                        </li>
                        {service.featured && (
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                            <span>Servicio destacado</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {service.tags && service.tags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Tecnologías:</h4>
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="glass border-white/20 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="glass border-white/10">
                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList className="glass w-full justify-start">
                    <TabsTrigger value="reviews">Información del Servicio</TabsTrigger>
                    <TabsTrigger value="professional">Sobre el Profesional</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reviews" className="p-6">
                    <div className="space-y-6">
                      {/* Service Rating */}
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{service.averageRating}</div>
                          <div className="flex items-center justify-center mt-1">
                            {[1,2,3,4,5].map((star) => (
                              <Award 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= Math.round(service.averageRating)
                                    ? 'text-warning fill-current' 
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {service.totalReviews} reseñas
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Service Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass-medium rounded-lg p-4">
                            <h4 className="font-medium mb-2">Categoría</h4>
                            <p className="text-muted-foreground">{service.category}</p>
                          </div>
                          <div className="glass-medium rounded-lg p-4">
                            <h4 className="font-medium mb-2">Subcategoría</h4>
                            <p className="text-muted-foreground">{service.subcategory || 'N/A'}</p>
                          </div>
                          <div className="glass-medium rounded-lg p-4">
                            <h4 className="font-medium mb-2">Tipo de Precio</h4>
                            <p className="text-muted-foreground">
                              {service.priceType === 'hourly' ? 'Por hora' : 
                               service.priceType === 'fixed' ? 'Precio fijo' : 'Negociable'}
                            </p>
                          </div>
                          <div className="glass-medium rounded-lg p-4">
                            <h4 className="font-medium mb-2">Estado</h4>
                            <p className="text-muted-foreground">
                              {service.active ? 'Activo' : 'Inactivo'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="professional" className="p-6">
                    <div className="space-y-6">
                      {/* Professional Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={service.professional.avatar} />
                          <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold">{service.professional.name} {service.professional.lastName}</h3>
                            {service.professional.verified && (
                              <CheckCircle className="h-5 w-5 text-success" />
                            )}
                          </div>
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            {service.professional.level}
                          </Badge>
                          <p className="text-muted-foreground mt-2">{service.professional.location}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Professional Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-medium rounded-lg p-4">
                          <h4 className="font-medium mb-2">Calificación Promedio</h4>
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-warning fill-current" />
                            <span className="font-bold">{service.professional.averageRating}</span>
                          </div>
                        </div>
                        <div className="glass-medium rounded-lg p-4">
                          <h4 className="font-medium mb-2">Total de Reseñas</h4>
                          <p className="font-bold">{service.professional.totalReviews}</p>
                        </div>
                      </div>
                      
                      {/* Professional Badges */}
                      {service.professional.badges && service.professional.badges.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Insignias y Certificaciones</h4>
                          <div className="grid gap-3">
                            {service.professional.badges.map((badge) => (
                              <div key={badge.id} className="glass-medium rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                    <Award className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium">{badge.name}</h5>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                    <Badge className="mt-1 text-xs" variant="outline">{badge.category}</Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass border-white/10 sticky top-24">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hacer Pedido</CardTitle>
                    <Badge className="bg-success/20 text-success border-success/30">
                      Disponible
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-3xl font-bold text-primary">
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.priceType === 'hourly' ? 'Por hora' : service.priceType === 'fixed' ? 'Precio fijo' : 'Negociable'}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Estado
                      </span>
                      <span className="font-medium">
                        {service.active ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground">
                        <Zap className="h-4 w-4 mr-2" />
                        Categoría
                      </span>
                      <span className="font-medium">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Continuar (${service.price})
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full glass border-white/20 hover:glass-medium"
                      onClick={() => openWhatsAppChat({
                        phone: "542804123456", // Default WhatsApp number
                        name: service.professional.name,
                        service: {
                          title: service.title,
                          price: service.price,
                          id: service.id
                        }
                      })}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar por WhatsApp
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Pago seguro
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Garantía 30 días
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Sobre el Profesional</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={service.professional.avatar} />
                      <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{service.professional.name} {service.professional.lastName}</h4>
                        {service.professional.verified && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        {service.professional.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Profesional verificado especializado en {service.category}. Ubicado en {service.professional.location}.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Calificación</div>
                      <div className="font-medium flex items-center space-x-1">
                        <Award className="h-3 w-3 text-warning fill-current" />
                        <span>{service.professional.averageRating}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Reseñas</div>
                      <div className="font-medium">{service.professional.totalReviews}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Nivel</div>
                      <div className="font-medium">{service.professional.level}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Verificado</div>
                      <div className="font-medium">{service.professional.verified ? 'Sí' : 'No'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Ubicación:</span>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="glass border-white/20 text-xs">
                        {service.professional.location}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
                    Ver Perfil Completo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Services */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Más servicios de {service.professional.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay servicios relacionados disponibles en este momento.</p>
                  </div>
                  
                  <Link to="/services">
                    <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
                      Ver Todos los Servicios
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}