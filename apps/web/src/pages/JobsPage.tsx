import React, { useState, useEffect } from 'react';
import { useSecureAuth } from '../context/SecureAuthContext';
import { jobsService, Job, JobStats, ConversionAnalytics } from '../lib/services/jobs.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
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
  AlertTriangle
} from 'lucide-react';

const JobsPage: React.FC = () => {
  const { user } = useSecureAuth();
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isProfessional = user?.userType === 'professional';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isProfessional ? 'Mis Trabajos' : 'Trabajos Contratados'}
        </h1>
        <p className="text-gray-600">
          {isProfessional 
            ? 'Gestiona tus trabajos activos y historial de proyectos' 
            : 'Seguimiento de los trabajos que has contratado'
          }
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trabajos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.jobsByStatus.in_progress || 0) + (stats.jobsByStatus.not_started || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobsByStatus.completed || 0}</div>
            </CardContent>
          </Card>

          {isProfessional && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {jobsService.formatCurrency(stats.totalEarnings)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Analytics for Professionals */}
      {isProfessional && analytics && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análisis de Conversión
            </CardTitle>
            <CardDescription>
              Estadísticas de contactos y conversiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalContacts}</div>
                <p className="text-sm text-gray-600">Total Contactos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.convertedContacts}</div>
                <p className="text-sm text-gray-600">Convertidos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.conversionRate}%</div>
                <p className="text-sm text-gray-600">Tasa de Conversión</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <JobsList 
            jobs={jobs.filter(job => ['not_started', 'in_progress', 'milestone_review'].includes(job.status))}
            onStatusUpdate={handleStatusUpdate}
            isProfessional={isProfessional}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <JobsList 
            jobs={jobs.filter(job => job.status === 'completed')}
            onStatusUpdate={handleStatusUpdate}
            isProfessional={isProfessional}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <JobsList 
            jobs={jobs}
            onStatusUpdate={handleStatusUpdate}
            isProfessional={isProfessional}
          />
        </TabsContent>
      </Tabs>
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-11 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos</h3>
          <p className="text-gray-500 text-center">
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
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          onStatusUpdate={onStatusUpdate}
          isProfessional={isProfessional}
        />
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
  const progress = jobsService.calculateProgress(job.milestones);

  const getStatusActions = () => {
    if (!isProfessional) return null;

    switch (job.status) {
      case 'not_started':
        return (
          <Button 
            onClick={() => onStatusUpdate(job.id, 'in_progress', 'Trabajo iniciado')}
            size="sm"
          >
            Iniciar Trabajo
          </Button>
        );
      case 'in_progress':
        return (
          <Button 
            onClick={() => onStatusUpdate(job.id, 'milestone_review', 'Solicitar revisión')}
            size="sm"
            variant="outline"
          >
            Solicitar Revisión
          </Button>
        );
      case 'milestone_review':
        return (
          <Badge variant="outline" className="text-yellow-600">
            Esperando revisión del cliente
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription>
              {isProfessional ? `Cliente: ${job.client.name}` : `Profesional: ${job.professional.name}`}
            </CardDescription>
          </div>
          <Badge className={jobsService.getJobStatusColor(job.status)}>
            {jobsService.getJobStatusLabel(job.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 line-clamp-2">{job.description}</p>

        {/* Progress Bar */}
        {job.milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-gray-500">
              {job.milestones.filter(m => m.completed).length} de {job.milestones.length} hitos completados
            </p>
          </div>
        )}

        {/* Job Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Precio acordado:</span>
            <p className="text-green-600 font-medium">
              {jobsService.formatCurrency(job.agreed_price)}
            </p>
          </div>
          <div>
            <span className="font-medium">Fecha de entrega:</span>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {job.delivery_date ? new Date(job.delivery_date).toLocaleDateString() : 'Sin fecha'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {getStatusActions()}
            <Button variant="outline" size="sm">
              Ver Detalles
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Contact Button */}
          {isProfessional ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`https://wa.me/${job.client.whatsapp_number}`, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Contactar Cliente
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`https://wa.me/${job.professional.whatsapp_number}`, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Contactar Profesional
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobsPage;