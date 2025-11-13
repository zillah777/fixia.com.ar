import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSecureAuth } from '../context/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { jobsService, Job, JobStats, ConversionAnalytics } from '../lib/services/jobs.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { FixiaNavigation } from '../components/FixiaNavigation';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { ReviewCard } from '../components/modals/ReviewCard';
import { CompletionModal } from '../components/modals/CompletionModal';
import {
  Briefcase,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  Calendar,
  AlertTriangle,
  Sparkles,
  Star,
  CheckCheck
} from 'lucide-react';
import { MatchesListSection } from '../components/match/MatchesListSection';

const JobsPage: React.FC = () => {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [analytics, setAnalytics] = useState<ConversionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsData, statsData] = await Promise.all([
        jobsService.getMyJobs(),
        jobsService.getJobStats()
      ]);

      setJobs(jobsData);
      setStats(statsData);

      // Load analytics for professionals
      if (user?.userType === 'professional') {
        const analyticsData = await jobsService.getConversionAnalytics();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Error loading jobs data:', err);
      setError('Error cargando información de trabajos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId: string, status: string, message?: string) => {
    try {
      await jobsService.updateJobStatus(jobId, { 
        status: status as any, 
        message 
      });
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Error actualizando estado del trabajo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <main className="container mx-auto px-6 py-8 pb-24 lg:pb-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass border-white/10">
                <CardHeader>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </main>
        <MobileBottomNavigation />
      </div>
    );
  }

  const isProfessional = user?.userType === 'professional';

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <main className="container mx-auto px-6 py-8 pb-24 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Alert variant="destructive" className="glass border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        </main>
        <MobileBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8 pb-24 lg:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {isProfessional ? 'Mis Trabajos' : 'Trabajos Contratados'}
              </h1>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 leading-relaxed">
            {isProfessional
              ? 'Gestiona tus trabajos activos y historial de oportunidades'
              : 'Seguimiento de los trabajos que has contratado'
            }
          </p>
        </motion.div>

        {/* Active Matches Section (para ver el match recién creado) */}
        {user?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10"
          >
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Mis Matches Activos</h2>
              <p className="text-sm text-white/60">Aquí verás los trabajos conectados por una propuesta aceptada.</p>
            </div>
            <MatchesListSection
              userId={user.id}
              role={user.userType === 'client' ? 'client' : 'professional'}
              limit={5}
              onMatchSelect={(matchId) => {
                navigate(`/matches/${matchId}`);
              }}
            />
          </motion.div>
        )}

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-4 mb-8"
          >
            <Card className="glass-glow border-white/10 hover:glass-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trabajos</p>
                    <p className="text-3xl font-bold mt-2 text-gradient">{stats.totalJobs}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-glow border-white/10 hover:glass-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Activos</p>
                    <p className="text-3xl font-bold mt-2 text-gradient">
                      {(stats.jobsByStatus.in_progress || 0) + (stats.jobsByStatus.not_started || 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-warning/20 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-glow border-white/10 hover:glass-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completados</p>
                    <p className="text-3xl font-bold mt-2 text-gradient">{stats.jobsByStatus.completed || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-success/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {isProfessional && (
              <Card className="glass-glow border-white/10 hover:glass-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                      <p className="text-3xl font-bold mt-2 text-gradient">
                        {jobsService.formatCurrency(stats.totalEarnings)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-success/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Analytics for Professionals */}
        {isProfessional && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="glass border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Análisis de Conversión
                </CardTitle>
                <CardDescription className="text-muted-foreground/80">
                  Estadísticas de contactos y conversiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3">
                  <div className="text-center p-4 glass-medium rounded-lg">
                    <div className="text-3xl font-bold text-info mb-2">{analytics.totalContacts}</div>
                    <p className="text-sm text-muted-foreground">Total Contactos</p>
                  </div>
                  <div className="text-center p-4 glass-medium rounded-lg">
                    <div className="text-3xl font-bold text-success mb-2">{analytics.convertedContacts}</div>
                    <p className="text-sm text-muted-foreground">Convertidos</p>
                  </div>
                  <div className="text-center p-4 glass-medium rounded-lg">
                    <div className="text-3xl font-bold text-warning mb-2">{analytics.conversionRate}%</div>
                    <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Jobs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="glass w-full grid grid-cols-3 p-1">
                <TabsTrigger value="active" className="data-[state=active]:glass-medium">
                  Activos
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:glass-medium">
                  Completados
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:glass-medium">
                  Todos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4 mt-6">
                <JobsList
                  jobs={(jobs || []).filter(job => ['not_started', 'in_progress', 'milestone_review'].includes(job.status))}
                  onStatusUpdate={handleStatusUpdate}
                  isProfessional={isProfessional}
                />
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-6">
                <JobsList
                  jobs={(jobs || []).filter(job => job.status === 'completed')}
                  onStatusUpdate={handleStatusUpdate}
                  isProfessional={isProfessional}
                />
              </TabsContent>

              <TabsContent value="all" className="space-y-4 mt-6">
                <JobsList
                  jobs={jobs || []}
                  onStatusUpdate={handleStatusUpdate}
                  isProfessional={isProfessional}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
        <MobileBottomNavigation />
      </div>
    );
};

interface JobsListProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: string, message?: string) => void;
  isProfessional: boolean;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, onStatusUpdate, isProfessional }) => {
  if (jobs.length === 0) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No hay trabajos</h3>
          <p className="text-muted-foreground/80 text-center max-w-md">
            {isProfessional
              ? 'Cuando recibas propuestas aceptadas, aparecerán aquí'
              : 'Los trabajos que contrates aparecerán aquí'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {jobs.map((job, index) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <JobCard
            job={job}
            onStatusUpdate={onStatusUpdate}
            isProfessional={isProfessional}
          />
        </motion.div>
      ))}
    </div>
  );
};

interface JobCardProps {
  job: Job;
  onStatusUpdate: (jobId: string, status: string, message?: string) => void;
  isProfessional: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onStatusUpdate, isProfessional }) => {
  const [showReviewCard, setShowReviewCard] = React.useState(false);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [completionMode, setCompletionMode] = React.useState<'request' | 'confirm'>('request');
  const progress = jobsService.calculateProgress(job.milestones);

  const getStatusActions = () => {
    switch (job.status) {
      case 'not_started':
        if (isProfessional) {
          return (
            <Button
              onClick={() => onStatusUpdate(job.id, 'in_progress', 'Trabajo iniciado')}
              size="sm"
              className="liquid-gradient hover:opacity-90"
            >
              Iniciar Trabajo
            </Button>
          );
        }
        return null;
      case 'in_progress':
        return (
          <Button
            onClick={() => {
              setCompletionMode('request');
              setShowCompletionModal(true);
            }}
            size="sm"
            className="liquid-gradient hover:opacity-90 flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            {isProfessional ? 'Marcar Completado' : 'Confirmar Completado'}
          </Button>
        );
      case 'milestone_review':
        return (
          <Badge className="bg-warning/20 text-warning border-warning/40">
            Esperando revisión del cliente
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="glass-glow border-white/10 hover:glass-medium transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl text-white mb-2">{job.title}</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {isProfessional ? `Cliente: ${job.client.name}` : `Profesional: ${job.professional.name}`}
            </CardDescription>
          </div>
          <Badge className={`${jobsService.getJobStatusColor(job.status)} flex-shrink-0`}>
            {jobsService.getJobStatusLabel(job.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground/90 line-clamp-2">{job.description}</p>

        {/* Progress Bar */}
        {job.milestones && job.milestones.length > 0 && (
          <div className="space-y-2 p-4 glass-medium rounded-lg">
            <div className="flex justify-between text-sm text-white">
              <span className="font-medium">Progreso</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <p className="text-xs text-muted-foreground/80">
              {job.milestones.filter(m => m.completed).length} de {job.milestones.length} hitos completados
            </p>
          </div>
        )}

        {/* Job Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 glass-medium rounded-lg">
            <span className="text-sm text-muted-foreground/80 block mb-1">Precio acordado</span>
            <p className="text-lg font-bold text-success">
              {jobsService.formatCurrency(job.agreed_price)}
            </p>
          </div>
          <div className="p-4 glass-medium rounded-lg">
            <span className="text-sm text-muted-foreground/80 block mb-1">Fecha de entrega</span>
            <p className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {job.delivery_date ? new Date(job.delivery_date).toLocaleDateString('es-AR') : 'Sin fecha'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/10">
          <div className="flex gap-2 flex-wrap">
            {getStatusActions()}
            {/* Leave a Review Button - For Both Clients and Professionals on Completed Jobs */}
            {job.status === 'completed' && (
              <Button
                onClick={() => setShowReviewCard(!showReviewCard)}
                size="sm"
                className="glass border-white/20 hover:glass-medium bg-gradient-to-r from-primary/20 to-primary/10 border-primary/40 hover:border-primary/60"
              >
                <Star className="h-4 w-4 mr-2 text-primary" />
                {showReviewCard ? 'Cerrar Reseña' : `Calificar ${isProfessional ? 'Cliente' : 'Profesional'}`}
              </Button>
            )}
            <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
              Ver Detalles
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Contact Button */}
          {isProfessional ? (
            <Button
              variant="ghost"
              size="sm"
              className="hover:glass-medium"
              onClick={() => window.open(`https://wa.me/${job.client.whatsapp_number}`, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2 text-success" />
              <span className="text-white">Contactar Cliente</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hover:glass-medium"
              onClick={() => window.open(`https://wa.me/${job.professional.whatsapp_number}`, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2 text-success" />
              <span className="text-white">Contactar Profesional</span>
            </Button>
          )}
        </div>
      </CardContent>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        matchId={job.id}
        mode={completionMode}
        oppositePartyName={isProfessional ? job.client.name : job.professional.name}
        onCompleted={() => {
          setShowCompletionModal(false);
          // Reload data after completion
          onStatusUpdate(job.id, job.status, 'Trabajo completado');
        }}
      />

      {/* Review Card - For Both Clients and Professionals on Completed Jobs */}
      {job.status === 'completed' && (
        <ReviewCard
          isOpen={showReviewCard}
          onClose={() => setShowReviewCard(false)}
          professionalName={isProfessional ? job.client.name : job.professional.name}
          jobId={job.id}
          professionalId={isProfessional ? job.client.id : job.professional.id}
          onSuccess={() => {
            setShowReviewCard(false);
          }}
        />
      )}
    </Card>
  );
};

export default JobsPage;