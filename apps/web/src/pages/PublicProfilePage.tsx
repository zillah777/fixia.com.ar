import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FixiaNavigation } from "../components/FixiaNavigation";
import {
  Heart, MapPin, Calendar, MessageSquare,
  Share2, CheckCircle, ArrowLeft, Flag,
  Clock, Users, TrendingUp, Shield, Briefcase,
  Star, Loader2
} from "lucide-react";
import { Linkedin, Twitter, Github } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { FavoriteButton } from "../components/ui/FavoriteButton";
import { userService } from "../lib/services";
import { servicesService, Service } from "../lib/services/services.service";
import { User } from "../context/SecureAuthContext";

interface ProfileHeaderProps {
  profile: User;
}

function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  // Extract professional profile data
  const professionalProfile = profile.professionalProfile;
  const rating = professionalProfile?.averageRating || profile.averageRating || 0;
  const reviews = professionalProfile?.totalReviews || profile.totalReviews || 0;
  const completedProjects = professionalProfile?.completedServices || profile.completedServices || 0;
  const bio = profile.bio || professionalProfile?.description || "Profesional en Fixia";
  const skills = professionalProfile?.serviceCategories || [];
  const verified = profile.isVerified || professionalProfile?.verified || false;
  const level = professionalProfile?.availability || "Disponible";

  // Calculate member since year
  const memberSince = new Date(profile.createdAt || profile.joinDate).getFullYear();

  // Calculate response time (default to 24 hours)
  const responseTime = "24 horas";

  return (
    <Card className="glass border-white/10">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {verified && (
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
                <h1 className="text-3xl font-bold">
                  {profile.name} {profile.lastName || ''}
                </h1>

                <div className="flex items-center space-x-3 mt-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {level}
                  </Badge>
                  {rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-warning fill-current" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({reviews} reseñas)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FavoriteButton
                  userId={profile.id}
                  userName={profile.name}
                  size="md"
                  variant="ghost"
                  className="h-10 w-10 p-0"
                  title="Agregar a favoritos"
                />
                <Button className="liquid-gradient">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {bio}
            </p>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {memberSince}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Responde en {responseTime}</span>
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="glass border-white/20 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Social Links */}
            <div className="flex space-x-3">
              {profile.social_linkedin && (
                <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Linkedin className="h-4 w-4 text-blue-500" />
                  </Button>
                </a>
              )}
              {profile.social_github && (
                <a href={profile.social_github} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {profile.social_twitter && (
                <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Twitter className="h-4 w-4 text-blue-400" />
                  </Button>
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex space-x-8 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedProjects}</div>
                <div className="text-sm text-muted-foreground">Oportunidades Completadas</div>
              </div>
              {rating > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{rating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold">{responseTime}</div>
                <div className="text-sm text-muted-foreground">Respuesta</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ServicesSectionProps {
  services: Service[];
  loading: boolean;
}

function ServicesSection({ services, loading }: ServicesSectionProps) {
  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Servicios Activos</CardTitle>
          <CardDescription>Servicios disponibles de este profesional</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Servicios Activos</CardTitle>
          <CardDescription>Servicios disponibles de este profesional</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Este profesional no tiene servicios activos en este momento.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Servicios Activos</CardTitle>
        <CardDescription>Servicios disponibles de este profesional</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => {
            const serviceImage = service.main_image || service.images?.[0] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop";
            const serviceRating = service.averageRating || 0;
            const serviceReviews = service.totalReviews || service._count?.reviews || 0;

            return (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={serviceImage}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {service.featured && (
                      <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30">
                        <Star className="h-3 w-3 mr-1" />
                        Destacado
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-2">{service.title}</h3>

                    <div className="flex items-center justify-between text-sm">
                      {serviceRating > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-warning fill-current" />
                          <span className="font-medium">{serviceRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({serviceReviews})</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin reseñas</span>
                      )}
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
            );
          })}
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
        <div className="text-center py-12 text-muted-foreground">
          No hay proyectos de portafolio disponibles en este momento.
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsSection({ profile }: { profile: User }) {
  const rating = profile.professionalProfile?.averageRating || profile.averageRating || 0;
  const reviews = profile.professionalProfile?.totalReviews || profile.totalReviews || 0;

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-warning" />
              <span>Reseñas y Valoraciones</span>
            </CardTitle>
            <CardDescription>Lo que dicen los clientes</CardDescription>
          </div>
          {rating > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold">{rating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">{reviews} reseñas</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          No hay reseñas disponibles en este momento.
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSection({ profile }: { profile: User }) {
  const professionalProfile = profile.professionalProfile;
  const completedServices = professionalProfile?.completedServices || profile.completedServices || 0;
  const totalServices = professionalProfile?.totalServices || profile.totalServices || 0;
  const completionRate = totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0;

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
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-sm text-muted-foreground">Tasa de finalización</div>
          </div>

          <div className="text-center glass-medium rounded-lg p-4">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedServices}</div>
            <div className="text-sm text-muted-foreground">Servicios completados</div>
          </div>

          <div className="text-center glass-medium rounded-lg p-4">
            <Users className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.totalReviews || 0}</div>
            <div className="text-sm text-muted-foreground">Reseñas totales</div>
          </div>

          <div className="text-center glass-medium rounded-lg p-4">
            <Briefcase className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalServices}</div>
            <div className="text-sm text-muted-foreground">Servicios totales</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <Card className="glass border-white/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Cargando perfil...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <Card className="glass border-white/10">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Flag className="h-10 w-10 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Perfil no encontrado</h2>
                  <p className="text-muted-foreground max-w-md">{message}</p>
                </div>
                <Button onClick={() => navigate('/services')} className="liquid-gradient">
                  Volver a Servicios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        setError("ID de usuario no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileData = await userService.getPublicProfile(userId);

        // Validate that user is a professional
        if (profileData.userType !== 'professional') {
          setError("Este perfil no pertenece a un profesional");
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setLoading(false);

        // Fetch services in parallel
        fetchServices(userId);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        const errorMessage = err?.response?.status === 404
          ? "El perfil que buscas no existe o ha sido eliminado"
          : err?.message || "Ocurrió un error al cargar el perfil. Por favor, intenta nuevamente.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    const fetchServices = async (professionalId: string) => {
      try {
        setServicesLoading(true);

        // Fetch services for this professional
        const response = await servicesService.getServices({
          professionalId: professionalId,
          active: true
        });

        setServices(response.data || []);
      } catch (err: any) {
        console.error("Error fetching services:", err);
        // Don't set error state for services - just show empty state
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !profile) {
    return <ErrorState message={error || "Perfil no encontrado"} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileHeader profile={profile} />
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
                <ServicesSection services={services} loading={servicesLoading} />
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                <PortfolioSection />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ReviewsSection profile={profile} />
              </TabsContent>

              <TabsContent value="stats" className="mt-6">
                <StatsSection profile={profile} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
