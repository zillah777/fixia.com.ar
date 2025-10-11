import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, TrendingUp, Users, Heart, Heart, Eye, MessageSquare,
  Calendar, Clock, DollarSign, ArrowRight, Briefcase, Target,
  Zap, CheckCircle, AlertCircle, Search, Settings, Bell, LogOut, Heart, User
} from "lucide-react";
import { userService, DashboardStats } from "../lib/services";
import { dashboardService } from "../lib/services/dashboard.service";
import type { RecentActivity, CurrentProject } from "../lib/services/dashboard.service";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSecureAuth } from "../context/SecureAuthContext";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

function Navigation() {
  const { user, logout } = useSecureAuth();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
          </motion.div>
          <span className="text-xl font-semibold tracking-tight text-white">Fixia</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-primary font-medium">
            Dashboard
          </Link>
          <Link to="/opportunities" className="text-muted-foreground hover:text-primary transition-colors">
            Oportunidades
          </Link>
          <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
            Explorar
          </Link>
          <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
            Mi Perfil
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          {/* Nuevo Anuncio Button */}
          <Link to={user?.userType === 'professional' ? "/new-project" : "/new-opportunity"}>
            <Button className="hidden sm:flex liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              + Nuevo Anuncio
            </Button>
          </Link>
          
          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative" title="Notificaciones">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </Button>
          
          {/* Favoritos */}
          <Link to="/favorites">
            <Button variant="ghost" size="icon" title="Favoritos">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* Avatar con Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.userType === 'professional' ? 'Profesional' : 'Cliente'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}

function QuickActions({ user }: { user: any }) {
  const isProfessional = user?.userType === 'professional';
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={isProfessional ? "/new-project" : "/new-opportunity"}>
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">
                {isProfessional ? "Crear Servicio" : "Crear Anuncio"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isProfessional 
                  ? "Publica un nuevo servicio y empieza a generar ingresos"
                  : "Publica lo que necesitas y conecta con profesionales"
                }
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
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

      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
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

      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
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

function StatCards({ dashboardData, loading }: { dashboardData: DashboardStats | null; loading: boolean }) {
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

  const stats = [
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
      value: dashboardData?.total_services?.toString() || "0",
      change: "+2",
      changeType: "positive", 
      icon: Briefcase,
      description: "servicios creados"
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

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Card className="glass hover:glass-medium transition-all duration-300 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

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
            <Link to="/new-project">
              <Button className="liquid-gradient hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer servicio
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [currentProjects, setCurrentProjects] = useState<CurrentProject[]>([]);
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

        const data = await userService.getDashboard();
        setDashboardData(data);
      } catch (error: any) {
        console.warn('Dashboard stats fetch failed, using defaults:', error?.message);

        // Set fallback data instead of error
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
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      if (!user) return;

      try {
        setActivityLoading(true);
        const activities = await dashboardService.getRecentActivity(10);
        setRecentActivity(activities);
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
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-white">
            Bienvenido de vuelta, {user?.name} 👋
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus servicios, proyectos y aprovecha nuevas oportunidades en Fixia
          </p>
        </motion.div>

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
          <StatCards dashboardData={dashboardData} loading={loading} />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Current Projects */}
          <div className="lg:col-span-2">
            <CurrentProjects projects={currentProjects} loading={projectsLoading} />
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