import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSecureAuth } from '../context/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { jobsService, Job, JobStats, ConversionAnalytics } from '../lib/services/jobs.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { FixiaNavigation } from '../components/FixiaNavigation';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import {
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { MatchesListSection } from '../components/match/MatchesListSection';
import { ActiveJobCard } from '../components/jobs/ActiveJobCard';

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
  const navigate = useNavigate();

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <ActiveJobCard
          key={job.id}
          job={job}
          userRole={isProfessional ? 'professional' : 'client'}
          onViewDetails={() => navigate(`/jobs/${job.id}`)}
          onSendMessage={() => {
            const otherParty = isProfessional ? job.client : job.professional;
            window.open(`https://wa.me/${otherParty.whatsapp_number}`, '_blank');
          }}
          onMarkComplete={() => {
            onStatusUpdate(job.id, 'completed', 'Trabajo completado');
          }}
          onReview={() => navigate(`/jobs/${job.id}/review`)}
        />
      ))}
    </div>
  );
};

export default JobsPage;