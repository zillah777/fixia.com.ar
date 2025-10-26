import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, TrendingUp, Users, Heart, MessageSquare,
  Calendar, Clock, DollarSign, ArrowRight, Briefcase, Target,
  Zap, CheckCircle, AlertCircle, Search, Settings, Bell, Crown,
  Eye, BarChart3, TrendingDown, Star, Pause, Play, Edit, Trash2, MoreVertical
} from "lucide-react";
import { userService, DashboardStats } from "../lib/services";
import { dashboardService } from "../lib/services/dashboard.service";
import { servicesService } from "../lib/services/services.service";
import type { RecentActivity, CurrentProject } from "../lib/services/dashboard.service";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSecureAuth } from "../context/SecureAuthContext";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { OnboardingMessages } from "../components/OnboardingMessages";

function QuickActions({ user }: { user: any }) {
  const isProfessional = user?.userType === 'professional';

  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-${isProfessional ? '3' : '4'} gap-4`}>
      {/* Professional Actions - Show for professionals with dual role */}
      {isProfessional && (
        <>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link to="/new-project">
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Crear Servicio</h3>
                  <p className="text-sm text-muted-foreground">
                    Publica un nuevo servicio y empieza a generar ingresos
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link to="/opportunities">
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-success/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Ver Oportunidades</h3>
                  <p className="text-sm text-muted-foreground">
                    Encuentra proyectos que se ajusten a tus habilidades
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </>
      )}

      {/* Client Actions - Show for everyone (dual role + pure clients) */}
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Link to="/new-opportunity">
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Crear Anuncio</h3>
              <p className="text-sm text-muted-foreground">
                Publica lo que necesitas y conecta con profesionales
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Link to="/my-announcements">
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-info/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-6 w-6 text-info" />
              </div>
              <h3 className="font-semibold mb-2">Mis Anuncios</h3>
              <p className="text-sm text-muted-foreground">
                Revisa tus anuncios y las propuestas recibidas
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Common Actions */}
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Link to="/services">
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-warning/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Explorar</h3>
              <p className="text-sm text-muted-foreground">
                Descubre servicios y profesionales destacados
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Link to="/profile">
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Mi Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Gestiona tu información y configuración
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}

function RecentActivity({
  activities,
  loading
}: {
  activities: RecentActivity[];
  loading: boolean;
}) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    const icons = {
      order: DollarSign,
      message: MessageSquare,
      review: Heart,
      proposal: Target,
      payment: DollarSign,
      service_created: Plus,
      profile_view: Users
    };
    return icons[type] || Bell;
  };

  const getActivityColor = (type: RecentActivity['type']): string => {
    const colors = {
      order: 'text-success',
      message: 'text-primary',
      review: 'text-warning',
      proposal: 'text-info',
      payment: 'text-success',
      service_created: 'text-primary',
      profile_view: 'text-muted-foreground'
    };
    return colors[type] || 'text-muted-foreground';
  };

  function getActivityTitle(type: string): string {
    const titles: { [key: string]: string } = {
      service_created: 'Nuevo servicio creado',
      service_completed: 'Servicio completado',
      review_received: 'Nueva reseña recibida',
      contact_request: 'Nueva solicitud de contacto'
    };
    return titles[type] || 'Actividad reciente';
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-4 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-3 opacity-50">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-medium mb-2">Sin actividad reciente</h3>
            <p className="text-sm text-muted-foreground">
              Tu actividad aparecerá aquí cuando comiences a usar la plataforma.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 3).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const timeFormatted = dashboardService.formatActivityTime(activity.created_at);

              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <span className="text-xs text-muted-foreground">{timeFormatted}</span>
                  </div>
                  {activity.status === 'new' && (
                    <Badge className="bg-success/20 text-success border-success/30">Nuevo</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {activities.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
              Ver Todo el Historial
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="glass border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCards({ dashboardData, loading, userType, clientStats, planType }: {
  dashboardData: DashboardStats | null;
  loading: boolean;
  userType?: string;
  planType?: 'free' | 'basic' | 'premium';
  clientStats?: {
    open_announcements: number;
    proposals_received: number;
    in_progress: number;
    client_rating: number;
  } | null;
}) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <StatCardSkeleton />
          </motion.div>
        ))}
      </div>
    );
  }

  // Stats for CLIENTS
  const clientStatsCards = [
    {
      title: "Anuncios Abiertos",
      value: clientStats?.open_announcements?.toString() || "0",
      change: "",
      changeType: "neutral",
      icon: Briefcase,
      description: "solicitudes activas"
    },
    {
      title: "Propuestas Recibidas",
      value: clientStats?.proposals_received?.toString() || "0",
      change: "",
      changeType: "neutral",
      icon: Users,
      description: "ofertas de profesionales"
    },
    {
      title: "En Progreso",
      value: clientStats?.in_progress?.toString() || "0",
      change: "",
      changeType: "neutral",
      icon: TrendingUp,
      description: "trabajos activos"
    },
    {
      title: "Mi Calificación",
      value: clientStats?.client_rating?.toFixed(1) || "0.0",
      change: "",
      changeType: "neutral",
      icon: Heart,
      description: "de profesionales"
    }
  ];

  // Stats for PROFESSIONALS
  const professionalStatsCards = [
    {
      title: "Ingresos Totales",
      value: dashboardData?.total_earnings ? `$${dashboardData.total_earnings.toLocaleString()}` : "$0",
      change: "+12.3%",
      changeType: "positive",
      icon: TrendingUp,
      description: "acumulados"
    },
    {
      title: "Servicios Totales",
      value: planType === 'basic'
        ? `${dashboardData?.total_services || 0}/5`
        : dashboardData?.total_services?.toString() || "0",
      change: planType === 'basic' ? '' : '+2',
      changeType: "positive",
      icon: Briefcase,
      description: planType === 'basic' ? 'límite plan Basic' : planType === 'premium' ? 'ilimitados' : 'servicios creados'
    },
    {
      title: "Proyectos Activos",
      value: dashboardData?.active_projects?.toString() || "0",
      change: "+8",
      changeType: "positive",
      icon: Users,
      description: "en progreso"
    },
    {
      title: "Rating Promedio",
      value: dashboardData?.average_rating?.toFixed(1) || "0.0",
      change: "+0.2",
      changeType: "positive",
      icon: Heart,
      description: `de ${dashboardData?.review_count || 0} reseñas`
    }
  ];

  // For professionals (dual role), show both professional and client stats
  const showBothStats = userType === 'professional';

  return (
    <div className="space-y-6">
      {/* Professional Stats - Only for professionals */}
      {showBothStats && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Estadísticas Profesionales</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionalStatsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold mt-2 text-gradient">{stat.value}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`text-sm ${
                              stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                            }`}>
                              {stat.change}
                            </span>
                            <span className="text-xs text-muted-foreground">{stat.description}</span>
                          </div>
                        </div>
                        <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center float">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Client Stats - For everyone (both pure clients and dual role professionals) */}
      <div>
        {showBothStats && (
          <div className="flex items-center gap-2 mb-4 mt-8">
            <Users className="h-5 w-5 text-info" />
            <h3 className="text-lg font-semibold">Estadísticas de Cliente</h3>
          </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientStatsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: showBothStats ? 0.4 + 0.1 * index : 0.1 * index }}
              >
                <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold mt-2 text-gradient">{stat.value}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`text-sm ${
                            stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-muted-foreground">{stat.description}</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-info/20 rounded-xl flex items-center justify-center float">
                        <Icon className="h-6 w-6 text-info" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Component for CLIENTS - Shows their announcements
function ClientAnnouncements({
  clientProjects,
  loading
}: {
  clientProjects: any[];
  loading: boolean;
}) {
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  };

  // Prioritize announcements with proposals
  const announcementsWithProposals = clientProjects.filter(p => p._count?.proposals > 0);
  const announcementsWithoutProposals = clientProjects.filter(p => p._count?.proposals === 0);
  const displayProjects = [...announcementsWithProposals, ...announcementsWithoutProposals].slice(0, 5);

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="mb-2">Mis Solicitudes Activas</CardTitle>
            <p className="text-sm text-muted-foreground/80">
              Anuncios y propuestas recibidas
            </p>
          </div>
          <Link to="/my-announcements">
            <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
              Ver Todos
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 glass-medium rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tienes anuncios activos</h3>
            <p className="text-muted-foreground mb-4">
              Publica tu primer anuncio para conectar con profesionales verificados
            </p>
            <Link to="/new-opportunity">
              <Button className="liquid-gradient hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Anuncio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProjects.map((project) => {
              const hasProposals = project._count?.proposals > 0;
              const proposalCount = project._count?.proposals || 0;

              return (
                <Link key={project.id} to="/my-announcements">
                  <div className="p-5 glass-glow rounded-xl hover:glass-medium transition-all duration-300 cursor-pointer border border-white/10 hover:border-primary/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-base truncate">{project.title}</h4>
                          {project.status === 'open' && (
                            <Badge className="bg-success/20 text-success border-success/40 text-xs font-medium flex-shrink-0">
                              Abierto
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground/90 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      {hasProposals ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="text-primary">
                                {proposalCount} {proposalCount === 1 ? 'propuesta' : 'propuestas'}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground/70">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTimeAgo(project.created_at)}
                            </div>
                          </div>
                          <Button size="sm" className="liquid-gradient text-white font-medium">
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Ver Propuestas
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <span>Esperando propuestas</span>
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTimeAgo(project.created_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Summary */}
        {displayProjects.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {announcementsWithProposals.length}
                </p>
                <p className="text-xs text-muted-foreground">Con propuestas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {announcementsWithoutProposals.length}
                </p>
                <p className="text-xs text-muted-foreground">Esperando</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component for PROFESSIONALS - Service Analytics
function ServiceAnalytics({
  loading,
  user
}: {
  loading: boolean;
  user: any;
}) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    // Critical check: Ensure user is fully loaded with valid ID
    if (!user || !user.id || user.userType !== 'professional') {
      setAnalyticsLoading(false);
      setAnalyticsData(null);
      return;
    }

    try {
      setAnalyticsLoading(true);
      const data = await servicesService.getMyServicesAnalytics();
      setAnalyticsData(data);
    } catch (error: any) {
      console.warn('Failed to fetch service analytics:', error);
      // Only log detailed error in development
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        console.warn('Authentication or validation error - user may need to re-login');
      }
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    // Only run effect if user object has been loaded with ID
    if (user && user.id) {
      fetchAnalytics();
    } else {
      setAnalyticsLoading(false);
      setAnalyticsData(null);
    }
  }, [user?.id, user?.userType]); // Depend on specific properties to avoid infinite loops

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const handleToggleActive = async (serviceId: string, currentTitle: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setActionLoading(serviceId);
    try {
      const result = await servicesService.toggleServiceActive(serviceId);
      toast.success(result.message);
      // Refresh analytics data
      await fetchAnalytics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado del servicio');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (serviceId: string, serviceTitle: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm(`¿Estás seguro de eliminar "${serviceTitle}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setActionLoading(serviceId);
    try {
      await servicesService.deleteService(serviceId);
      toast.success('Servicio eliminado exitosamente');
      // Refresh analytics data
      await fetchAnalytics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar servicio');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Rendimiento de Servicios
            </CardTitle>
            <CardDescription className="mt-1">
              Analíticas detalladas de tus servicios activos
            </CardDescription>
          </div>
          <Link to="/services">
            <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
              Gestionar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {analyticsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 glass-medium rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !analyticsData || analyticsData.services.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tienes servicios activos</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer servicio para comenzar a ver estadísticas detalladas y atraer clientes.
            </p>
            <Link to="/new-project">
              <Button className="liquid-gradient hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Servicio
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 glass-medium rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {analyticsData.summary.total_services}
                </p>
                <p className="text-xs text-muted-foreground">Servicios Activos</p>
              </div>
              <div className="p-4 glass-medium rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-5 w-5 text-info" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatViews(analyticsData.summary.total_views)}
                </p>
                <p className="text-xs text-muted-foreground">Vistas Totales</p>
              </div>
              <div className="p-4 glass-medium rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatViews(analyticsData.summary.views_last_30_days)}
                </p>
                <p className="text-xs text-muted-foreground">Últimos 30 Días</p>
              </div>
              <div className="p-4 glass-medium rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {analyticsData.summary.average_views_per_service}
                </p>
                <p className="text-xs text-muted-foreground">Promedio/Servicio</p>
              </div>
            </div>

            {/* Top 5 Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Servicios Más Vistos
              </h4>
              {analyticsData.services.slice(0, 5).map((service: any, index: number) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 glass-medium rounded-lg hover:glass-strong transition-all group relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link to={`/service/${service.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium group-hover:text-primary transition-colors">
                          {service.title}
                        </h5>
                        {index === 0 && (
                          <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                            Top
                          </Badge>
                        )}
                        {!service.active && (
                          <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted/30 text-xs">
                            Pausado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {service.category}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-primary">
                        ${service.price.toLocaleString('es-AR')}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={actionLoading === service.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-white/20">
                          <DropdownMenuItem
                            onClick={(e) => handleToggleActive(service.id, service.title, e)}
                            className="hover:bg-white/10 cursor-pointer"
                          >
                            {service.active ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pausar servicio
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activar servicio
                              </>
                            )}
                          </DropdownMenuItem>
                          <Link to={`/services/${service.id}/edit`}>
                            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Editar servicio
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteService(service.id, service.title, e)}
                            className="hover:bg-white/10 cursor-pointer text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar servicio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-info/20 flex items-center justify-center">
                          <Eye className="h-4 w-4 text-info" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {formatViews(service.views)}
                          </p>
                          <p className="text-xs text-muted-foreground">vistas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center">
                          <Star className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {service.reviews || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">reseñas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {new Date(service.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                          </p>
                          <p className="text-xs text-muted-foreground">creado</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance indicator */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Rendimiento</span>
                        {service.views > analyticsData.summary.average_views_per_service ? (
                          <span className="flex items-center gap-1 text-success">
                            <TrendingUp className="h-3 w-3" />
                            Por encima del promedio
                          </span>
                        ) : service.views === analyticsData.summary.average_views_per_service ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            En el promedio
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-warning">
                            <TrendingDown className="h-3 w-3" />
                            Por debajo del promedio
                          </span>
                        )}
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>

            {analyticsData.services.length > 5 && (
              <div className="mt-4">
                <Link to="/services">
                  <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
                    Ver Todos los Servicios ({analyticsData.services.length})
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Component for PROFESSIONALS - Shows their projects
function CurrentProjects({
  projects,
  loading
}: {
  projects: CurrentProject[];
  loading: boolean;
}) {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Proyectos Actuales</CardTitle>
          <Link to="/jobs">
            <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
              Ver Todos
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 glass-medium rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tienes proyectos actuales</h3>
            <p className="text-muted-foreground mb-4">
              Cuando tengas proyectos activos, aparecerán aquí para que puedas hacer seguimiento de su progreso.
            </p>
            <Link to="/opportunities">
              <Button className="liquid-gradient hover:opacity-90">
                <Target className="h-4 w-4 mr-2" />
                Ver Oportunidades
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-muted-foreground">Cliente: {project.client_name}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${dashboardService.getProjectStatusColor(project.status)} text-white`}
                    >
                      {dashboardService.getProjectStatusLabel(project.status)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(project.deadline).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {dashboardService.formatCurrency(project.price, project.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useSecureAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [clientStats, setClientStats] = useState<{
    open_announcements: number;
    proposals_received: number;
    in_progress: number;
    client_rating: number;
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [currentProjects, setCurrentProjects] = useState<CurrentProject[]>([]);
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Add delay to ensure authentication is fully established after login
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Load data - professionals with dual role load BOTH client and professional data
        // Always load client stats (everyone can be a client)
        const { opportunitiesService } = await import('../lib/services/opportunities.service');
        const projects = await opportunitiesService.getMyProjects();

        const open_announcements = projects.filter((p: any) => p.status === 'open').length;
        const proposals_received = projects.reduce((sum: number, p: any) => sum + (p._count?.proposals || 0), 0);
        const in_progress = projects.filter((p: any) => p.status === 'in_progress').length;

        setClientStats({
          open_announcements,
          proposals_received,
          in_progress,
          client_rating: 0 // TODO: Implement client rating from professionals
        });

        // Store client projects for the ClientAnnouncements component
        setClientProjects(projects);

        // Additionally load professional stats if user is professional
        if (user.userType === 'professional') {
          const data = await userService.getDashboard();
          setDashboardData(data);
        }
      } catch (error: any) {
        console.warn('Dashboard stats fetch failed, using defaults:', error?.message);

        // Check if it's a UUID validation error suggesting stale session
        const errorMessage = error?.response?.data?.message || error?.message || '';
        if (errorMessage.includes('uuid') || errorMessage.includes('Validation failed')) {
          toast.error('Tu sesión necesita actualizarse. Por favor, cierra sesión y vuelve a iniciar sesión.', {
            duration: 6000,
          });
        }

        // Set fallback data instead of error - always set client stats (dual role)
        setClientStats({
          open_announcements: 0,
          proposals_received: 0,
          in_progress: 0,
          client_rating: 0
        });

        // Set professional stats fallback if user is professional
        if (user.userType === 'professional') {
          setDashboardData({
            total_services: 0,
            active_projects: 0,
            total_earnings: 0,
            average_rating: 0,
            review_count: 0,
            profile_views: 0,
            messages_count: 0,
            pending_proposals: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      if (!user) return;

      try {
        setActivityLoading(true);

        // Generate activity from user's actual data - load both client AND professional activities (dual role)
        const activities: RecentActivity[] = [];

        // Always load client activities (everyone can be a client)
        const { opportunitiesService } = await import('../lib/services/opportunities.service');
        const projects = await opportunitiesService.getMyProjects();

        // Add project creation activities
        projects.forEach((project: any) => {
          activities.push({
            id: `project-${project.id}`,
            type: 'service_created',
            title: 'Anuncio publicado',
            description: `Creaste el anuncio "${project.title}"`,
            created_at: project.created_at,
            status: 'completed'
          });

          // Add proposal received activities
          if (project.proposals && project.proposals.length > 0) {
            project.proposals.forEach((proposal: any) => {
              activities.push({
                id: `proposal-${proposal.id}`,
                type: 'proposal',
                title: 'Propuesta recibida',
                description: `${proposal.professional.name} envió una propuesta para "${project.title}"`,
                created_at: proposal.created_at,
                status: 'new'
              });
            });
          }
        });

        // Additionally load professional activities if user is professional
        if (user.userType === 'professional') {
          const professionalActivities = await dashboardService.getRecentActivity(10);
          activities.push(...professionalActivities);
        }

        // Sort by timestamp (most recent first) and limit to 10
        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentActivity(activities.slice(0, 10));
      } catch (error) {
        console.warn('Recent activity fetch failed:', error);
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    const fetchCurrentProjects = async () => {
      if (!user) return;

      try {
        setProjectsLoading(true);
        const projects = await dashboardService.getCurrentProjects(5);
        setCurrentProjects(projects);
      } catch (error) {
        console.warn('Current projects fetch failed:', error);
        setCurrentProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchDashboardData();
    fetchRecentActivity();
    fetchCurrentProjects();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 text-white tracking-tight">
            ¡Hola {user?.name}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground/80 leading-relaxed">
            Gestiona todo desde tu panel de control
          </p>
        </motion.div>

        {/* Onboarding Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <OnboardingMessages
            user={user}
            dashboardData={dashboardData}
            clientStats={clientStats}
          />
        </motion.div>

        {/* Upgrade to Professional Banner - Only for Clients */}
        {/* Show "Become Professional" banner only for free clients */}
        {user?.userType === 'client' && user?.planType === 'free' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Link to="/pricing">
              <Card className="glass border-white/10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl liquid-gradient flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">
                            🚀 Conviértete en Profesional
                          </h3>
                          <Badge className="liquid-gradient text-white border-0">
                            NUEVO
                          </Badge>
                        </div>
                        <p className="text-white/90 text-lg mb-2">
                          Ofrece tus servicios y gana dinero en Fixia
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white/80">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Doble rol: Cliente + Profesional</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Trust Scores separados</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Desde $2,999/mes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button className="liquid-gradient hover:opacity-90 transition-all group-hover:scale-105 px-8">
                      Ver Planes
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Service limit warning for Basic users approaching limit */}
        {user?.userType === 'professional' && user?.planType === 'basic' && dashboardData && dashboardData.total_services >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="glass border-warning/20 bg-gradient-to-r from-warning/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {dashboardData.total_services === 5
                        ? '¡Has alcanzado el límite de servicios!'
                        : '¡Casi alcanzas el límite de servicios!'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.total_services === 5
                        ? 'Tienes 5/5 servicios activos. Actualiza a Premium para servicios ilimitados.'
                        : `Tienes ${dashboardData.total_services}/5 servicios activos. Actualiza a Premium para no tener límites.`}
                    </p>
                  </div>
                  <Link to="/pricing">
                    <Button size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground">
                      Actualizar a Premium
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Subtle Premium upgrade suggestion for Basic users */}
        {user?.userType === 'professional' && user?.planType === 'basic' && (!dashboardData || dashboardData.total_services < 4) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <Link to="/pricing">
              <Card className="glass border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Desbloquea servicios ilimitados con <span className="text-primary font-bold">Premium</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Badge destacado, prioridad en búsquedas y estadísticas avanzadas
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/90 group-hover:translate-x-1 transition-transform"
                    >
                      Mejorar
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <QuickActions user={user} />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <StatCards
            dashboardData={dashboardData}
            loading={loading}
            userType={user?.userType}
            planType={user?.planType}
            clientStats={clientStats}
          />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Projects Section - Show both for professionals (dual role) */}
          <div className="lg:col-span-2 space-y-8">
            {user?.userType === 'professional' && user?.id && !loading && (
              <>
                {/* Service Analytics Section */}
                <ServiceAnalytics loading={loading} user={user} />

                {/* Professional Projects Section */}
                <CurrentProjects projects={currentProjects} loading={projectsLoading} />

                {/* Client Section (dual role) */}
                <ClientAnnouncements clientProjects={clientProjects} loading={loading} />
              </>
            )}

            {user?.userType === 'client' && (
              <ClientAnnouncements clientProjects={clientProjects} loading={loading} />
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity activities={recentActivity} loading={activityLoading} />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="glass border-white/10 text-center">
            <CardContent className="p-8">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  ¿Listo para crecer en Fixia?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crea nuevos servicios, explora oportunidades y conecta con más clientes. 
                  Tu próximo proyecto te está esperando.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Link to="/new-project">
                    <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nuevo Servicio
                    </Button>
                  </Link>
                  <Link to="/opportunities">
                    <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                      <Target className="h-4 w-4 mr-2" />
                      Ver Oportunidades
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <MobileBottomNavigation />
    </div>
  );
}