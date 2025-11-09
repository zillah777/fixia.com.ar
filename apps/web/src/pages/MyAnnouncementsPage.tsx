import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Eye, Edit, Trash2, Clock, Users, DollarSign,
  MapPin, Calendar, Tag, AlertCircle, CheckCircle2, XCircle,
  MessageSquare, Heart, TrendingUp, Filter, Search, ThumbsUp, ThumbsDown, Loader2, Star
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
import { ProposalDetailsModal } from "../components/proposals/ProposalDetailsModal";

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
    isVerified?: boolean;
    userType?: 'client' | 'professional' | 'dual';
    created_at?: string;
    professional_profile?: {
      bio?: string;
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
    navigate(`/edit-opportunity/${projectId}`);
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
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8"
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
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-1 h-auto">
              <TabsTrigger value="open" className="text-xs sm:text-sm">
                Abiertos ({projects.filter(p => p.status === 'open').length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs sm:text-sm">
                En Progreso ({projects.filter(p => p.status === 'in_progress').length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completados ({projects.filter(p => p.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs sm:text-sm">
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
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(project.id)}
                                    aria-label="Editar anuncio"
                                  >
                                    <Edit className="h-4 w-4" aria-hidden="true" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(project.id)}
                                    aria-label="Eliminar anuncio"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                  </Button>
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
        <DialogContent className="bg-slate-900/95 border-white/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Anuncio</DialogTitle>
            <DialogDescription className="text-slate-300">
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
  const [localProposals, setLocalProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Update local proposals when project changes
  useEffect(() => {
    if (project?.proposals) {
      setLocalProposals(project.proposals);
    }
  }, [project]);

  if (!project) return null;

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetailModal(true);
    // Close the list modal when opening detail modal
    onOpenChange(false);
  };

  const handleProposalUpdated = (proposalId: string, status: 'accepted' | 'rejected') => {
    // Update local state
    setLocalProposals(prev =>
      prev.map(p =>
        p.id === proposalId ? { ...p, status } : p
      )
    );
    setShowDetailModal(false);
    // Keep the list modal closed after update
    onOpenChange(false);
  };

  // Get badge info for proposal (new, duplicate, etc)
  const getProposalBadgeInfo = (proposal: Proposal) => {
    const isNew = (createdAt: string) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince <= 1; // Less than 1 day old
    };

    const isDuplicate = (proposalId: string) => {
      const professionalId = localProposals.find(p => p.id === proposalId)?.professional.id;
      return localProposals.filter(p => p.professional.id === professionalId).length > 1;
    };

    return {
      isNew: isNew(proposal.created_at),
      isDuplicate: isDuplicate(proposal.id),
      duplicateCount: localProposals.filter(p => p.professional.id === proposal.professional.id).length
    };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900/95 border-white/20 w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-auto lg:max-w-2xl max-h-[90vh] overflow-hidden backdrop-blur-xl rounded-xl sm:rounded-2xl p-0 gap-0 flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 border-b border-white/10 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 backdrop-blur-sm flex-shrink-0">
            <DialogTitle className="text-white text-base sm:text-lg md:text-xl font-bold leading-tight">Propuestas Recibidas</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm mt-1 truncate">
              {project.title}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-2.5 md:space-y-3 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
            {localProposals && localProposals.length > 0 ? (
              localProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="bg-slate-800/50 border-white/15 hover:border-primary/40 hover:bg-slate-800/70 transition-all cursor-pointer rounded-lg md:rounded-xl active:bg-slate-800/80 touch-target"
                    onClick={() => handleProposalClick(proposal)}
                    role="button"
                    tabIndex={0}
                  >
                    <CardContent className="p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <Avatar className="h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 flex-shrink-0 border border-white/10">
                            <AvatarImage src={proposal.professional.avatar || undefined} />
                            <AvatarFallback className="text-xs sm:text-sm font-bold">
                              {proposal.professional.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <h4 className="font-semibold text-white text-xs sm:text-sm md:text-base truncate">
                                {proposal.professional.name}
                              </h4>
                              <Badge className="flex-shrink-0 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-0.5 whitespace-nowrap rounded">
                                ${proposal.quoted_price.toLocaleString()}
                              </Badge>
                            </div>

                            {/* Badge indicators for new or duplicate proposals */}
                            {(() => {
                              const badgeInfo = getProposalBadgeInfo(proposal);
                              return (
                                <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                                  {badgeInfo.isNew && (
                                    <Badge className="bg-success/20 text-success border-success/30 text-xs px-2 py-0.5 rounded">
                                      ✨ Nueva
                                    </Badge>
                                  )}
                                  {badgeInfo.isDuplicate && (
                                    <Badge className="bg-info/20 text-info border-info/30 text-xs px-2 py-0.5 rounded">
                                      🔄 {badgeInfo.duplicateCount} propuestas
                                    </Badge>
                                  )}
                                </div>
                              );
                            })()}

                            {proposal.professional.professional_profile?.average_rating !== undefined && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1.5">
                                <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                                <span className="font-semibold">{proposal.professional.professional_profile.average_rating.toFixed(1)}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">{proposal.professional.professional_profile.total_reviews} reseñas</span>
                              </div>
                            )}

                            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-snug">
                              {proposal.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <Badge
                            className={`text-xs px-2.5 py-1 whitespace-nowrap rounded font-medium ${
                              proposal.status === 'accepted'
                                ? 'bg-success/20 text-success border-success/30'
                                : proposal.status === 'rejected'
                                ? 'bg-destructive/20 text-destructive border-destructive/30'
                                : 'bg-warning/20 text-warning border-warning/30'
                            }`}
                          >
                            {proposal.status === 'accepted'
                              ? 'Aceptada ✓'
                              : proposal.status === 'rejected'
                              ? 'Rechazada'
                              : 'Pendiente'}
                          </Badge>
                          <span className="text-xs text-slate-400 font-medium">
                            {proposal.delivery_time_days}d
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 md:py-20 flex flex-col items-center justify-center">
                <Users className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 text-slate-500" />
                <p className="text-slate-300 text-xs sm:text-sm md:text-base">
                  Aún no has recibido propuestas para este anuncio
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <ProposalDetailsModal
          proposal={selectedProposal}
          projectId={project.id}
          projectTitle={project.title}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onProposalUpdated={handleProposalUpdated}
        />
      )}
    </>
  );
}
