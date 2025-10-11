import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Award, Award, MapPin, Calendar, Globe, MessageSquare, Heart, 
  Share2, CheckCircle, Eye, ExternalLink, ArrowLeft, Flag,
  Clock, Users, TrendingUp, Shield, Briefcase, Mail, Phone,
  Linkedin, Twitter, Github, Instagram, ThumbsUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";

// Mock data for public profile
const publicProfile = {
  id: "prof_001",
  name: "Ana Martínez",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=200&h=200&fit=crop&crop=face",
  role: "professional",
  verified: true,
  level: "Top Rated Plus",
  bio: "Desarrolladora Full Stack especializada en e-commerce con +5 años de experiencia. Apasionada por crear soluciones digitales que impulsen el crecimiento de las empresas.",
  location: "Ciudad de México, MX",
  memberSince: "2019",
  website: "https://anamartinez.dev",
  responseTime: "1 hora",
  languages: ["Español", "Inglés"],
  completedProjects: 156,
  totalEarnings: "$125,000+",
  rating: 4.9,
  reviews: 187,
  skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS", "Figma"],
  socialLinks: {
    linkedin: "https://linkedin.com/in/anamartinez",
    github: "https://github.com/anamartinez",
    twitter: "https://twitter.com/anamartinez"
  },
  stats: {
    completionRate: 98,
    onTimeDelivery: 96,
    repeatClients: 75,
    avgProjectValue: 1250
  }
};

const publicPortfolio = [
  {
    id: 1,
    title: "E-commerce ModaStyle",
    description: "Tienda online completa con más de 1000 productos y sistema de pagos integrado",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    category: "Desarrollo Web",
    date: "Nov 2024",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    url: "https://modastyle.com",
    featured: true,
    likes: 23,
    views: 1200
  },
  {
    id: 2,
    title: "App Móvil FitTracker",
    description: "Aplicación de seguimiento fitness con integración de wearables",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    category: "Desarrollo Móvil",
    date: "Oct 2024",
    technologies: ["Flutter", "Firebase", "HealthKit"],
    featured: false,
    likes: 18,
    views: 890
  },
  {
    id: 3,
    title: "Dashboard Analytics Pro",
    description: "Panel de control avanzado para análisis de datos empresariales",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Desarrollo Web",
    date: "Sep 2024",
    technologies: ["Vue.js", "D3.js", "Python"],
    featured: true,
    likes: 31,
    views: 1450
  }
];

const publicReviews = [
  {
    id: 1,
    serviceTitle: "Desarrollo E-commerce Completo",
    client: {
      name: "Carlos Mendoza",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      company: "TechStart Solutions"
    },
    rating: 5,
    comment: "Excelente trabajo. Ana entregó exactamente lo que necesitábamos y más. La comunicación fue perfecta y el resultado superó nuestras expectativas. Definitivamente la recomiendo y volveremos a trabajar con ella.",
    date: "Hace 2 semanas",
    helpful: 12,
    response: "¡Gracias Carlos! Fue un placer trabajar contigo. Espero que el e-commerce siga creciendo."
  },
  {
    id: 2,
    serviceTitle: "App Móvil iOS/Android",
    client: {
      name: "María García",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      company: "Boutique Elena"
    },
    rating: 5,
    comment: "Ana desarrolló nuestra app móvil y los resultados han sido increíbles. En el primer mes aumentamos las ventas un 45%. Muy profesional y siempre disponible para resolver dudas.",
    date: "Hace 1 mes",
    helpful: 8
  },
  {
    id: 3,
    serviceTitle: "Sistema de Gestión Web",
    client: {
      name: "Roberto Silva",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      company: "Deportes Silva"
    },
    rating: 4,
    comment: "Muy buen trabajo en general. La entrega fue puntual y el producto final cumplió con lo prometido. Solo tuve algunas dudas menores que se resolvieron rápidamente.",
    date: "Hace 2 meses",
    helpful: 5
  }
];

const activeServices = [
  {
    id: "srv_001",
    title: "Desarrollo de E-commerce Completo",
    price: 1250,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop",
    rating: 4.9,
    orders: 127,
    featured: true
  },
  {
    id: "srv_002",
    title: "App Móvil iOS y Android",
    price: 2100,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop",
    rating: 5.0,
    orders: 89,
    featured: false
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
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function ProfileHeader() {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <Card className="glass border-white/10">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
              <AvatarImage src={publicProfile.avatar} alt={publicProfile.name} />
              <AvatarFallback className="text-2xl">{publicProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {publicProfile.verified && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-success/20 text-success border-success/30 text-xs px-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{publicProfile.name}</h1>
                
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {publicProfile.level}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-warning fill-current" />
                    <span className="font-medium">{publicProfile.rating}</span>
                    <span className="text-muted-foreground">({publicProfile.reviews} reseñas)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "glass border-white/20" : "liquid-gradient"}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
                <Button className="liquid-gradient">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </div>
            
            {/* Bio */}
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {publicProfile.bio}
            </p>
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{publicProfile.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {publicProfile.memberSince}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Responde en {publicProfile.responseTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <a href={publicProfile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  {publicProfile.website}
                </a>
              </div>
            </div>
            
            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {publicProfile.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="glass border-white/20 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {publicProfile.socialLinks.linkedin && (
                <a href={publicProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Linkedin className="h-4 w-4 text-blue-500" />
                  </Button>
                </a>
              )}
              {publicProfile.socialLinks.github && (
                <a href={publicProfile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {publicProfile.socialLinks.twitter && (
                <a href={publicProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Twitter className="h-4 w-4 text-blue-400" />
                  </Button>
                </a>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex space-x-8 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{publicProfile.completedProjects}</div>
                <div className="text-sm text-muted-foreground">Proyectos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{publicProfile.stats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{publicProfile.rating}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{publicProfile.responseTime}</div>
                <div className="text-sm text-muted-foreground">Respuesta</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServicesSection() {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Servicios Activos</CardTitle>
        <CardDescription>Servicios disponibles de este profesional</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {activeServices.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
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
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold line-clamp-2">{service.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-warning fill-current" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-muted-foreground">({service.orders})</span>
                    </div>
                    <span className="text-xl font-bold text-primary">${service.price}</span>
                  </div>
                  
                  <Link to={`/services/${service.id}`}>
                    <Button className="w-full liquid-gradient hover:opacity-90 transition-all duration-300">
                      Ver Servicio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/services">
            <Button variant="outline" className="glass border-white/20 hover:glass-medium">
              Ver Todos los Servicios
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function PortfolioSection() {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Portafolio</CardTitle>
        <CardDescription>Trabajos destacados y proyectos realizados</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicPortfolio.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.featured && (
                    <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30">
                      <Award className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button size="sm" className="liquid-gradient">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {item.url && (
                        <Button size="sm" variant="outline" className="glass border-white/20">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="glass border-white/20 text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  
                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="glass border-white/20 text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {item.likes}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsSection() {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-warning" />
              <span>Reseñas y Valoraciones</span>
            </CardTitle>
            <CardDescription>Lo que dicen los clientes</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{publicProfile.rating}</div>
            <div className="text-sm text-muted-foreground">{publicProfile.reviews} reseñas</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating Overview */}
        <div className="flex items-center space-x-8 p-4 glass-medium rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold">{publicProfile.rating}</div>
            <div className="flex items-center justify-center mt-1">
              {[1,2,3,4,5].map((star) => (
                <Award key={star} className="h-4 w-4 text-warning fill-current" />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{publicProfile.reviews} reseñas</div>
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
        
        {/* Reviews List */}
        <div className="space-y-4">
          {publicReviews.map((review) => (
            <div key={review.id} className="glass-medium rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={review.client.avatar} />
                  <AvatarFallback>{review.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.client.name}</div>
                      <div className="text-sm text-muted-foreground">{review.client.company}</div>
                      <div className="text-sm text-muted-foreground">{review.serviceTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <Award 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= review.rating 
                                ? 'text-warning fill-current' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{review.date}</div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  
                  {review.response && (
                    <div className="bg-primary/10 border-l-4 border-primary pl-4 py-2 mt-3">
                      <div className="font-medium text-sm text-primary mb-1">Respuesta del profesional:</div>
                      <p className="text-sm">{review.response}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm mt-3">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Útil ({review.helpful})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="outline" className="glass border-white/20 hover:glass-medium">
            Ver Todas las Reseñas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSection() {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Estadísticas del Profesional</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center glass-medium rounded-lg p-4">
            <Shield className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">{publicProfile.stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Tasa de finalización</div>
          </div>
          
          <div className="text-center glass-medium rounded-lg p-4">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{publicProfile.stats.onTimeDelivery}%</div>
            <div className="text-sm text-muted-foreground">Entregas a tiempo</div>
          </div>
          
          <div className="text-center glass-medium rounded-lg p-4">
            <Users className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">{publicProfile.stats.repeatClients}%</div>
            <div className="text-sm text-muted-foreground">Clientes recurrentes</div>
          </div>
          
          <div className="text-center glass-medium rounded-lg p-4">
            <Briefcase className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">${publicProfile.stats.avgProjectValue}</div>
            <div className="text-sm text-muted-foreground">Valor promedio proyecto</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PublicProfilePage() {
  const { userId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileHeader />
          </motion.div>

          {/* Profile Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="glass w-full md:w-auto">
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="mt-6">
                <ServicesSection />
              </TabsContent>
              
              <TabsContent value="portfolio" className="mt-6">
                <PortfolioSection />
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <ReviewsSection />
              </TabsContent>
              
              <TabsContent value="stats" className="mt-6">
                <StatsSection />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}