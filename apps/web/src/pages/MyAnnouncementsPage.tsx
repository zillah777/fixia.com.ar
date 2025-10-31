import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Eye, Edit, Trash2, Clock, Users, DollarSign,
  MapPin, Calendar, Tag, AlertCircle, CheckCircle2, XCircle,
  MessageSquare, Heart, TrendingUp, Filter, Search
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";
import { opportunitiesService } from "../lib/services/opportunities.service";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";

interface Project {
  id: string;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  location: string | null;
  skills_required: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  category: {
    name: string;
    slug: string;
    icon: string;
  } | null;
  _count: {
    proposals: number;
  };
  proposals?: Proposal[];
}

interface Proposal {
  id: string;
  message: string;
  quoted_price: number;
  delivery_time_days: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  professional: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    location: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    professional_profile?: {
      description: string;
      average_rating: number;
      total_reviews: number;
    };
  };
}

export default function MyAnnouncementsPage() {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProposals, setShowProposals] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Redirect if not authenticated (professionals with dual role can access as clients)
  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await opportunitiesService.getMyProjects();
      setProjects(data);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast.error('Error al cargar tus anuncios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setDeleteProjectId(projectId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteProjectId) return;

    try {
      await opportunitiesService.deleteProject(deleteProjectId);
      toast.success('Anuncio eliminado correctamente');
      setShowDeleteDialog(false);
      setDeleteProjectId(null);
      loadProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el anuncio');
    }
  };

  const handleEdit = (projectId: string) => {
    navigate(`/new-opportunity?edit=${projectId}`);
  };

  const handleViewProposals = async (project: Project) => {
    setSelectedProject(project);
    setShowProposals(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-success/20 text-success border-success/30';
      case 'in_progress': return 'bg-primary/20 text-primary border-primary/30';
      case 'completed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'cancelled': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'A convenir';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `Desde $${min.toLocaleString()}`;
    if (max) return `Hasta $${max.toLocaleString()}`;
    return 'A convenir';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Anuncios de Servicios</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus solicitudes de servicios y revisa las propuestas de profesionales
            </p>
          </div>
          <Link to="/new-opportunity">
            <Button className="liquid-gradient hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo Anuncio
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Anuncios</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Abiertos</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Propuestas Recibidas</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + (p._count?.proposals || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Progreso</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="open">
                Abiertos ({projects.filter(p => p.status === 'open').length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                En Progreso ({projects.filter(p => p.status === 'in_progress').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completados ({projects.filter(p => p.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Todos ({projects.length})
              </TabsTrigger>
            </TabsList>

            {['open', 'in_progress', 'completed', 'all'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="glass border-white/10">
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-3/4 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {projects
                      .filter(p => tab === 'all' || p.status === tab)
                      .map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className="glass border-white/10 hover:glass-medium transition-all duration-300">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <CardTitle className="text-xl">{project.title}</CardTitle>
                                    <Badge className={getStatusColor(project.status)}>
                                      {getStatusLabel(project.status)}
                                    </Badge>
                                    {project._count.proposals > 0 && (
                                      <Badge variant="outline" className="glass border-primary/30 text-primary">
                                        <Users className="h-3 w-3 mr-1" />
                                        {project._count.proposals} propuesta{project._count.proposals !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                  {project.category && (
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      {project.category.icon && <span>{project.category.icon}</span>}
                                      <span>{project.category.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <p className="text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>

                              {/* Skills */}
                              {project.skills_required && project.skills_required.length > 0 && (
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {project.skills_required.slice(0, 4).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs px-2 py-1 whitespace-nowrap">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {project.skills_required.length > 4 && (
                                    <Badge variant="outline" className="text-xs px-2 py-1">
                                      +{project.skills_required.length - 4} más
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Project Details */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{formatBudget(project.budget_min, project.budget_max)}</span>
                                </div>
                                {project.location && (
                                  <div className="flex items-center space-x-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{project.location}</span>
                                  </div>
                                )}
                                {project.deadline && (
                                  <div className="flex items-center space-x-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(project.deadline)}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Publicado {formatDate(project.created_at)}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <div className="flex items-center space-x-2">
                                  {project._count.proposals > 0 && (
                                    <Button
                                      onClick={() => handleViewProposals(project)}
                                      variant="default"
                                      className="liquid-gradient"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver Propuestas ({project._count.proposals})
                                    </Button>
                                  )}
                                  {project._count.proposals === 0 && project.status === 'open' && (
                                    <Alert className="border-warning/20 bg-warning/5 py-2">
                                      <AlertCircle className="h-4 w-4 text-warning" />
                                      <AlertDescription className="text-sm">
                                        Aún no has recibido propuestas para este anuncio
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {project.status === 'open' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(project.id)}
                                      title="Editar anuncio"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {project.status === 'open' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteClick(project.id)}
                                      title="Eliminar anuncio"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                    {projects.filter(p => tab === 'all' || p.status === tab).length === 0 && (
                      <Card className="glass border-white/10">
                        <CardContent className="p-12 text-center">
                          <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">
                            No tienes anuncios {tab !== 'all' ? getStatusLabel(tab).toLowerCase() : ''}
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            {tab === 'open'
                              ? 'Crea tu primer anuncio para encontrar profesionales'
                              : 'Los anuncios aparecerán aquí cuando cambien de estado'
                            }
                          </p>
                          {tab === 'open' && (
                            <Link to="/new-opportunity">
                              <Button className="liquid-gradient">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Primer Anuncio
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </main>

      {/* Proposals Modal */}
      <ProposalsDialog
        project={selectedProject}
        open={showProposals}
        onOpenChange={setShowProposals}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Eliminar Anuncio</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El anuncio será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Eliminar Anuncio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProposalsDialog({
  project,
  open,
  onOpenChange
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!project) return null;

  const handleContactProfessional = (professional: Proposal['professional']) => {
    const phone = professional.whatsapp_number || professional.phone;
    if (phone) {
      const message = encodeURIComponent(
        `Hola ${professional.name}, vi tu propuesta para mi anuncio "${project.title}" en Fixia. Me gustaría conversar contigo.`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      toast.error('Este profesional no tiene WhatsApp registrado');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Propuestas Recibidas</DialogTitle>
          <DialogDescription>{project.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {project.proposals && project.proposals.length > 0 ? (
            project.proposals.map((proposal) => (
              <Card key={proposal.id} className="glass-medium border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={proposal.professional.avatar || undefined} />
                      <AvatarFallback>
                        {proposal.professional.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{proposal.professional.name}</h4>
                          {proposal.professional.professional_profile && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 text-warning mr-1" />
                                <span>{proposal.professional.professional_profile.average_rating.toFixed(1)}</span>
                              </div>
                              <span>•</span>
                              <span>{proposal.professional.professional_profile.total_reviews} reseñas</span>
                            </div>
                          )}
                          {proposal.professional.location && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{proposal.professional.location}</span>
                            </div>
                          )}
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          ${proposal.quoted_price.toLocaleString()}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{proposal.message}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{proposal.delivery_time_days} días de entrega</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Enviado {new Date(proposal.created_at).toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleContactProfessional(proposal.professional)}
                          className="liquid-gradient"
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contactar por WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aún no has recibido propuestas para este anuncio
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
