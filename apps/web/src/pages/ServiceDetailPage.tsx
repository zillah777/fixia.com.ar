import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, Star, Heart, Share2, Clock, DollarSign, Users, Award, 
  MessageSquare, Shield, CheckCircle, MapPin, Calendar, Zap, 
  ThumbsUp, Eye, ArrowRight, Play, Download, Flag, MoreHorizontal
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";

// Mock service detail data
const serviceDetail = {
  id: "srv_001",
  title: "Desarrollo de E-commerce Completo",
  description: "Tienda online responsive con panel administrativo, pasarela de pagos y sistema de inventario completo. Perfecto para empresas que quieren iniciar o mejorar su presencia de ventas online.",
  longDescription: `¿Necesitas una tienda online que realmente convierta visitantes en clientes? 

Mi servicio de desarrollo de e-commerce completo incluye todo lo que necesitas para empezar a vender online desde el primer día:

🚀 **Lo que incluye:**
• Diseño responsive optimizado para móviles y desktop
• Panel administrativo completo para gestionar productos
• Sistema de inventario en tiempo real
• Integración con pasarelas de pago (PayPal, Stripe, MercadoPago)
• Carrito de compras avanzado con descuentos
• Sistema de usuarios y perfiles
• Dashboard con analytics de ventas
• SEO optimizado para mejor posicionamiento
• Certificado SSL incluido
• 3 meses de hosting gratis

💡 **¿Por qué elegir este servicio?**
Con más de 5 años desarrollando e-commerce, he ayudado a más de 150 empresas a digitalizar sus ventas con un promedio de 40% de aumento en conversiones el primer mes.

⚡ **Proceso de trabajo:**
1. Consulta inicial para entender tu negocio
2. Wireframes y diseño de la interfaz
3. Desarrollo del frontend y backend
4. Integración de pasarelas de pago
5. Testing exhaustivo
6. Capacitación y entrega
7. 30 días de soporte post-entrega`,
  
  professional: {
    name: "Ana Martínez",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
    verified: true,
    level: "Top Rated Plus",
    memberSince: "2019",
    responseTime: "1 hora",
    languages: ["Español", "Inglés"],
    completedProjects: 156,
    totalEarnings: "$125,000+",
    rating: 4.9,
    reviews: 187,
    location: "Ciudad de México, MX",
    bio: "Desarrolladora Full Stack especializada en e-commerce con +5 años de experiencia. Apasionada por crear soluciones digitales que impulsen el crecimiento de las empresas."
  },
  
  images: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=800&h=600&fit=crop"
  ],
  
  packages: [
    {
      name: "Básico",
      price: 850,
      originalPrice: 1000,
      description: "E-commerce básico con funcionalidades esenciales",
      deliveryTime: "14 días",
      revisions: "2 revisiones",
      features: [
        "Hasta 50 productos",
        "Diseño responsive",
        "Pasarela de pago básica",
        "Panel admin básico",
        "1 mes soporte"
      ]
    },
    {
      name: "Estándar",
      price: 1250,
      originalPrice: 1500,
      description: "E-commerce completo con características avanzadas",
      deliveryTime: "21 días",
      revisions: "3 revisiones",
      features: [
        "Productos ilimitados",
        "Diseño personalizado",
        "Multiple pasarelas de pago",
        "Sistema de inventario",
        "Analytics básico",
        "3 meses soporte",
        "Hosting incluido"
      ],
      recommended: true
    },
    {
      name: "Premium",
      price: 1850,
      originalPrice: 2200,
      description: "Solución empresarial con todas las características",
      deliveryTime: "30 días",
      revisions: "Ilimitadas",
      features: [
        "Todo del paquete Estándar",
        "Multi-idioma",
        "Sistema de afiliados",
        "Analytics avanzado",
        "SEO optimización",
        "6 meses soporte",
        "Capacitación incluida",
        "Integraciones API"
      ]
    }
  ],
  
  faqs: [
    {
      question: "¿Qué tecnologías utilizas?",
      answer: "Trabajo principalmente con React.js, Node.js, MongoDB y tecnologías modernas que garantizan escalabilidad y rendimiento."
    },
    {
      question: "¿Incluyes el hosting?",
      answer: "Sí, incluyo 3 meses de hosting gratis con el paquete Estándar y Premium. Después puedes continuar con el mismo proveedor o migrar."
    },
    {
      question: "¿Puedo solicitar cambios después de la entrega?",
      answer: "Por supuesto. Incluyo revisiones según el paquete elegido, y ofrezco soporte post-entrega para cualquier ajuste menor."
    },
    {
      question: "¿El sitio será optimizado para móviles?",
      answer: "Absolutamente. Todos mis desarrollos son responsive y están optimizados para una excelente experiencia en móviles."
    }
  ],
  
  reviews: [
    {
      id: 1,
      user: {
        name: "Carlos Mendoza",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
        company: "TechStart Solutions"
      },
      rating: 5,
      date: "Hace 2 semanas",
      comment: "Excelente trabajo. Ana entregó exactamente lo que necesitábamos y más. La comunicación fue perfecta y el resultado superó nuestras expectativas. Definitivamente la recomiendo y volveremos a trabajar con ella.",
      helpful: 12
    },
    {
      id: 2,
      user: {
        name: "María García",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
        company: "Boutique Elena"
      },
      rating: 5,
      date: "Hace 1 mes",
      comment: "Ana desarrolló nuestra tienda online y los resultados han sido increíbles. En el primer mes aumentamos las ventas un 45%. Muy profesional y siempre disponible para resolver dudas.",
      helpful: 8
    },
    {
      id: 3,
      user: {
        name: "Roberto Silva",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
        company: "Deportes Silva"
      },
      rating: 4,
      date: "Hace 2 meses",
      comment: "Muy buen trabajo en general. La entrega fue puntual y el producto final cumplió con lo prometido. Solo tuve algunas dudas menores que se resolvieron rápidamente.",
      helpful: 5
    }
  ],
  
  relatedServices: [
    {
      id: "srv_007",
      title: "Mantenimiento Web Mensual",
      price: 150,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      rating: 4.8,
      professional: "Ana Martínez"
    },
    {
      id: "srv_008", 
      title: "Optimización SEO Completa",
      price: 400,
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=300&h=200&fit=crop",
      rating: 4.9,
      professional: "Ana Martínez"
    }
  ],
  
  stats: {
    viewsLastMonth: 2847,
    ordersInQueue: 3,
    avgResponseTime: "1 hora",
    completionRate: "98%"
  }
};

function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link to="/services" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a servicios
        </Link>
        
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" /></div>
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
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    src={serviceDetail.images[currentImageIndex]}
                    alt={serviceDetail.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {serviceDetail.images.map((_, index) => (
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
                    
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{serviceDetail.title}</h1>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-warning fill-current" />
                        <span className="font-medium">{serviceDetail.professional.rating}</span>
                        <span>({serviceDetail.professional.reviews} reseñas)</span>
                      </div>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {serviceDetail.stats.viewsLastMonth} vistas este mes
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {serviceDetail.stats.ordersInQueue} en cola
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Descripción del Servicio</h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {serviceDetail.longDescription}
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
                <h3 className="font-semibold mb-6">Paquetes Disponibles</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {serviceDetail.packages.map((pkg, index) => (
                    <Card 
                      key={index}
                      className={`relative transition-all duration-300 cursor-pointer ${
                        selectedPackage === index 
                          ? 'ring-2 ring-primary glass-medium' 
                          : 'glass hover:glass-medium border-white/10'
                      }`}
                      onClick={() => setSelectedPackage(index)}
                    >
                      {pkg.recommended && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary/20 text-primary border-primary/30">
                          Recomendado
                        </Badge>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            {pkg.originalPrice > pkg.price && (
                              <span className="text-muted-foreground line-through">
                                ${pkg.originalPrice}
                              </span>
                            )}
                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                              ${pkg.price}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pkg.description}
                          </p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-success">
                            <Clock className="h-4 w-4 mr-1" />
                            {pkg.deliveryTime}
                          </span>
                          <span className="text-muted-foreground">
                            {pkg.revisions}
                          </span>
                        </div>
                        
                        <ul className="space-y-2 text-sm">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                    <TabsTrigger value="reviews">Reseñas ({serviceDetail.reviews.length})</TabsTrigger>
                    <TabsTrigger value="faqs">Preguntas Frecuentes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reviews" className="p-6">
                    <div className="space-y-6">
                      {/* Rating Overview */}
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{serviceDetail.professional.rating}</div>
                          <div className="flex items-center justify-center mt-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star 
                                key={star} 
                                className="h-4 w-4 text-warning fill-current" 
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {serviceDetail.professional.reviews} reseñas
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          {[5,4,3,2,1].map((stars) => (
                            <div key={stars} className="flex items-center space-x-3">
                              <span className="text-sm w-8">{stars}★</span>
                              <Progress value={stars === 5 ? 85 : stars === 4 ? 15 : 0} className="flex-1" />
                              <span className="text-sm text-muted-foreground w-8">
                                {stars === 5 ? '85%' : stars === 4 ? '15%' : '0%'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Reviews List */}
                      <div className="space-y-6">
                        {serviceDetail.reviews.map((review) => (
                          <div key={review.id} className="glass-medium rounded-lg p-4">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-medium">{review.user.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {review.user.company}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center space-x-1">
                                      {[1,2,3,4,5].map((star) => (
                                        <Star 
                                          key={star} 
                                          className={`h-4 w-4 ${
                                            star <= review.rating 
                                              ? 'text-warning fill-current' 
                                              : 'text-muted-foreground'
                                          }`} 
                                        />
                                      ))}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {review.date}
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-muted-foreground mb-3">
                                  {review.comment}
                                </p>
                                
                                <div className="flex items-center space-x-4 text-sm">
                                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Útil ({review.helpful})
                                  </Button>
                                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                                    <Flag className="h-4 w-4 mr-1" />
                                    Reportar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="faqs" className="p-6">
                    <div className="space-y-4">
                      {serviceDetail.faqs.map((faq, index) => (
                        <div key={index} className="glass-medium rounded-lg p-4">
                          <h4 className="font-medium mb-2">{faq.question}</h4>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      ))}
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
                      {serviceDetail.packages[selectedPackage].originalPrice > serviceDetail.packages[selectedPackage].price && (
                        <span className="text-muted-foreground line-through text-lg">
                          ${serviceDetail.packages[selectedPackage].originalPrice}
                        </span>
                      )}
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                        ${serviceDetail.packages[selectedPackage].price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Paquete {serviceDetail.packages[selectedPackage].name}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Entrega
                      </span>
                      <span className="font-medium">
                        {serviceDetail.packages[selectedPackage].deliveryTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground">
                        <Zap className="h-4 w-4 mr-2" />
                        Revisiones
                      </span>
                      <span className="font-medium">
                        {serviceDetail.packages[selectedPackage].revisions}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Continuar (${serviceDetail.packages[selectedPackage].price})
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full glass border-white/20 hover:glass-medium"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar Vendedor
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
                      <AvatarImage src={serviceDetail.professional.avatar} />
                      <AvatarFallback>{serviceDetail.professional.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{serviceDetail.professional.name}</h4>
                        {serviceDetail.professional.verified && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        {serviceDetail.professional.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {serviceDetail.professional.bio}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Miembro desde</div>
                      <div className="font-medium">{serviceDetail.professional.memberSince}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Responde en</div>
                      <div className="font-medium">{serviceDetail.professional.responseTime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Proyectos</div>
                      <div className="font-medium">{serviceDetail.professional.completedProjects}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Ganancias</div>
                      <div className="font-medium">{serviceDetail.professional.totalEarnings}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Idiomas:</span>
                    <div className="flex flex-wrap gap-1">
                      {serviceDetail.professional.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="glass border-white/20 text-xs">
                          {lang}
                        </Badge>
                      ))}
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
                  <CardTitle>Más servicios de {serviceDetail.professional.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {serviceDetail.relatedServices.map((service) => (
                    <Link key={service.id} to={`/services/${service.id}`}>
                      <div className="flex space-x-3 p-3 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
                        <img 
                          src={service.image}
                          alt={service.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{service.title}</h5>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-warning fill-current" />
                              <span className="text-xs">{service.rating}</span>
                            </div>
                            <span className="font-medium text-primary">${service.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
                    Ver Todos los Servicios
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}