import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, MapPin, Calendar, DollarSign, Users, Briefcase,
  Check, X, Clock, AlertCircle, Shield
} from 'lucide-react';
import { FixiaNavigation } from '../components/FixiaNavigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import { useSecureAuth } from '../context/SecureAuthContext';
import { opportunitiesService } from '../lib/services/opportunities.service';
import { toast } from 'sonner';

interface Proposal {
  id: string;
  professional_id: string;
  professional: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    memberSince?: string;
    completedProjects?: number;
    responseTime?: string;
    description?: string;
  };
  message: string;
  proposed_budget: number;
  estimated_duration: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  availableToStart?: boolean;
  flexibleSchedule?: boolean;
}

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  location?: string;
  skills_required: string[];
  client: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    memberSince: string;
  };
  proposals: Proposal[];
  status: 'open' | 'in_progress' | 'completed';
  created_at: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSecureAuth();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'professional' | 'unknown'>('unknown');
  const [ownProposal, setOwnProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('ID de proyecto no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch project details from opportunities endpoint
        const response = await opportunitiesService.getOpportunityById(id);

        if (!response) {
          setError('Oportunidad no encontrada');
          setLoading(false);
          return;
        }

        setProject(response as unknown as ProjectDetail);

        // Determine user role
        if (user?.id === response.client.id) {
          setUserRole('client');
        } else {
          setUserRole('professional');
          // Note: proposals is a number (count), not an array in this response
          // const userProposal = response.proposals?.find(p => p.professional_id === user?.id);
          // if (userProposal) {
          //   setOwnProposal(userProposal);
          // }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Error al cargar la oportunidad. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error || 'Oportunidad no encontrada'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusBadgeConfig = {
    open: { color: 'bg-green-500/20 text-green-700 border-green-500/30', label: 'Abierto' },
    in_progress: { color: 'bg-blue-500/20 text-blue-700 border-blue-500/30', label: 'En Progreso' },
    completed: { color: 'bg-gray-500/20 text-gray-700 border-gray-500/30', label: 'Completado' }
  };

  const statusConfig = statusBadgeConfig[project.status as keyof typeof statusBadgeConfig] || statusBadgeConfig.open;

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 break-words">
                {project.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Detalle de Oportunidad
              </p>
            </div>
            <Badge
              className={`h-fit whitespace-nowrap border ${statusConfig.color}`}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunity Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Detalles de la Oportunidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Descripción</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Budget */}
                    {(project.budget_min || project.budget_max) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">Presupuesto</span>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {project.budget_min ? `ARS $${project.budget_min.toLocaleString('es-AR')}` : 'No especificado'}
                          {project.budget_max ? ` - ARS $${project.budget_max.toLocaleString('es-AR')}` : ''}
                        </p>
                      </div>
                    )}

                    {/* Deadline */}
                    {project.deadline && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-warning" />
                          <span className="font-semibold text-sm text-muted-foreground">Vencimiento</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {new Date(project.deadline).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    {/* Location */}
                    {project.location && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-success" />
                          <span className="font-semibold text-sm text-muted-foreground">Ubicación</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{project.location}</p>
                      </div>
                    )}

                    {/* Category */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-secondary" />
                        <span className="font-semibold text-sm text-muted-foreground">Categoría</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{project.category.name}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {project.skills_required && project.skills_required.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Habilidades Requeridas</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.skills_required.map((skill) => (
                            <Badge key={skill} variant="outline" className="border-primary/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={project.client.avatar}
                      alt={project.client.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">{project.client.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-semibold text-foreground">
                            {project.client.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({project.client.totalReviews} {project.client.totalReviews === 1 ? 'reseña' : 'reseñas'})
                        </span>
                        {project.client.isVerified && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Miembro desde {new Date(project.client.memberSince).toLocaleDateString('es-AR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Proposals Section - Only show for client viewing own project */}
            {userRole === 'client' && project.proposals && project.proposals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Propuestas Recibidas ({project.proposals.length})
                    </CardTitle>
                    <CardDescription>
                      Revisa los perfiles completos de los profesionales interesados. Cada uno ha sido evaluado por otros clientes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.proposals.map((proposal, index) => (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-primary/30 hover:bg-white/10 transition-all duration-300"
                      >
                        {/* Header with Professional Info and Status */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Avatar with verification badge */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={proposal.professional.avatar}
                                alt={proposal.professional.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-primary/30"
                              />
                              {proposal.professional.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1.5 border-2 border-background">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Professional Details */}
                            <div className="flex-1 min-w-0">
                              {/* Name and Verified Badge */}
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h4 className="font-bold text-foreground text-lg">{proposal.professional.name}</h4>
                                {proposal.professional.isVerified && (
                                  <Badge variant="outline" className="border-success/50 bg-success/10 text-success gap-1 text-xs">
                                    <Shield className="h-3 w-3" />
                                    Verificado
                                  </Badge>
                                )}
                              </div>

                              {/* Location and Response Time */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                {proposal.professional.responseTime && (
                                  <>
                                    <Clock className="h-3 w-3" />
                                    <span>{proposal.professional.responseTime}</span>
                                  </>
                                )}
                              </div>

                              {/* Trust Indicators - Rating and Reviews */}
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3.5 w-3.5 ${
                                          i < Math.floor(proposal.professional.rating)
                                            ? 'fill-warning text-warning'
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-semibold text-sm">{proposal.professional.rating.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({proposal.professional.totalReviews} {proposal.professional.totalReviews === 1 ? 'reseña' : 'reseñas'})
                                  </span>
                                </div>
                              </div>

                              {/* Member Since and Completed Projects */}
                              {(proposal.professional.memberSince || proposal.professional.completedProjects) && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                  {proposal.professional.memberSince && (
                                    <span>📅 Miembro desde {new Date(proposal.professional.memberSince).toLocaleDateString('es-AR', {
                                      month: 'short',
                                      year: 'numeric'
                                    })}</span>
                                  )}
                                  {proposal.professional.completedProjects && proposal.professional.completedProjects > 0 && (
                                    <span>✓ {proposal.professional.completedProjects} trabajos completados</span>
                                  )}
                                </div>
                              )}

                              {/* Professional Description/Specialty */}
                              {proposal.professional.description && (
                                <p className="text-xs text-muted-foreground italic mb-2">
                                  "{proposal.professional.description}"
                                </p>
                              )}

                              {/* Trust Badges */}
                              <div className="flex flex-wrap gap-1.5">
                                {proposal.availableToStart && (
                                  <Badge className="bg-success/20 text-success text-xs gap-1 border-success/30">
                                    <Clock className="h-3 w-3" />
                                    Disponible ahora
                                  </Badge>
                                )}
                                {proposal.flexibleSchedule && (
                                  <Badge className="bg-blue-500/20 text-blue-400 text-xs gap-1 border-blue-500/30">
                                    ⏱️
                                    Horarios flexibles
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge
                            variant={
                              proposal.status === 'accepted'
                                ? 'default'
                                : proposal.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="flex-shrink-0 whitespace-nowrap"
                          >
                            {proposal.status === 'pending' && '⏳ Pendiente'}
                            {proposal.status === 'accepted' && '✅ Aceptada'}
                            {proposal.status === 'rejected' && '❌ Rechazada'}
                          </Badge>
                        </div>

                        <Separator className="my-4" />

                        {/* Proposal Message */}
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">"</span>
                            {proposal.message}
                            <span className="font-semibold text-foreground">"</span>
                          </p>
                        </div>

                        {/* Budget and Timeline */}
                        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold block mb-1">💰 PRESUPUESTO</span>
                            <p className="font-bold text-primary text-lg">
                              ARS ${proposal.proposed_budget.toLocaleString('es-AR')}
                            </p>
                            {proposal.proposed_budget < (project.budget_min || 0) && (
                              <p className="text-xs text-success mt-1">✓ Dentro del presupuesto</p>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold block mb-1">⏳ ENTREGA</span>
                            <p className="font-bold text-foreground">{proposal.estimated_duration}</p>
                            {project.deadline && (
                              <p className="text-xs text-muted-foreground mt-1">Antes del vencimiento</p>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold block mb-1">📍 PROPUESTA</span>
                            <p className="font-bold text-foreground text-sm">Hace {formatTimeAgo(new Date(proposal.created_at))}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 glass border-white/20 hover:border-primary/50 text-xs sm:text-sm"
                          >
                            Ver Perfil
                          </Button>
                          {proposal.status === 'pending' && (
                            <Button
                              size="sm"
                              className="flex-1 liquid-gradient text-xs sm:text-sm"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aceptar
                            </Button>
                          )}
                          <FavoriteButton
                            userId={proposal.professional.id}
                            userName={proposal.professional.name}
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - For professionals to submit proposal */}
          {userRole === 'professional' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-white/10 sticky top-32">
                <CardHeader>
                  <CardTitle className="text-lg">Tu Propuesta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ownProposal ? (
                    <>
                      <Alert className="border-success/30 bg-success/10">
                        <Check className="h-4 w-4 text-success" />
                        <AlertDescription className="text-success">
                          Ya has enviado una propuesta
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Tu Presupuesto</span>
                          <p className="font-semibold text-primary text-lg">
                            ARS ${ownProposal.proposed_budget.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Tiempo de Entrega</span>
                          <p className="font-semibold text-foreground">{ownProposal.estimated_duration}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Estado</span>
                          <Badge
                            variant={
                              ownProposal.status === 'accepted'
                                ? 'default'
                                : ownProposal.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="mt-1"
                          >
                            {ownProposal.status === 'pending' && 'Pendiente'}
                            {ownProposal.status === 'accepted' && 'Aceptada'}
                            {ownProposal.status === 'rejected' && 'Rechazada'}
                          </Badge>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Envía tu propuesta para esta oportunidad y el cliente podrá revisarla.
                      </p>
                      <Button className="w-full liquid-gradient">
                        Enviar Propuesta
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 30) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-AR');
}
