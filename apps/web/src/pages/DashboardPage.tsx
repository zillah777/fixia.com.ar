import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Plus, TrendingUp, Users, Award, Star, Eye, MessageSquare,
  Calendar, Clock, DollarSign, ArrowRight, Briefcase, Target,
  Zap, CheckCircle, AlertCircle, Search, Settings, Bell, LogOut
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSecureAuth } from "../context/SecureAuthContext";
import { useRecentActivity } from "../hooks/useRecentActivity";

function Navigation() {
  const { user, logout } = useSecureAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" /></div>
            <div className="absolute -inset-1 liquid-gradient rounded-lg blur opacity-20 animate-pulse-slow"></div>
          </motion.div>
          <span className="font-semibold">Fixia</span>
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </Button>
          <Link to="/profile">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link to="/create-request">
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center flex flex-col h-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 liquid-gradient rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">Publicar</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block flex-1">
                Describe tu proyecto
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link to="/new-project">
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center flex flex-col h-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">Crear</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block flex-1">
                Nuevo servicio
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
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center flex flex-col h-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">Oportunidades</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block flex-1">
                Proyectos
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
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center flex flex-col h-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-warning/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">Explorar</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block flex-1">
                Servicios
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
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center flex flex-col h-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">Perfil</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block flex-1">
                Tu perfil
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}

function StatCards() {
  const stats = [
    {
      title: "Vistas del Perfil",
      value: "2,543",
      change: "+12.5%",
      icon: Eye,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Proyectos Activos",
      value: "8",
      change: "+2",
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      title: "Calificación",
      value: "4.9",
      change: "+0.2",
      icon: Star,
      color: "text-warning",
      bgColor: "bg-warning/20"
    },
    {
      title: "Ingresos del Mes",
      value: "$45,231",
      change: "+18.2%",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30 text-xs sm:text-sm">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate">{stat.value}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function CurrentProjects() {
  const projects = [
    {
      id: "1",
      title: "Desarrollo de App Móvil",
      client: "TechStart Inc.",
      progress: 75,
      deadline: "15 Nov 2024",
      status: "En Progreso",
      budget: "$8,500"
    },
    {
      id: "2",
      title: "Diseño de Sitio Web",
      client: "Creative Agency",
      progress: 45,
      deadline: "22 Nov 2024",
      status: "En Progreso",
      budget: "$3,200"
    },
    {
      id: "3",
      title: "Consultoría SEO",
      client: "Marketing Pro",
      progress: 90,
      deadline: "10 Nov 2024",
      status: "Por Completar",
      budget: "$1,800"
    }
  ];

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Proyectos Actuales</CardTitle>
        <CardDescription>Gestiona tus proyectos en curso</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1">{project.title}</h4>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {project.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm pt-2">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {project.deadline}
                  </div>
                  <div className="font-semibold text-success">
                    {project.budget}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
            Ver Todos los Proyectos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-3 glass-medium rounded-lg animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  {activity.status === 'new' && (
                    <Badge className="bg-success/20 text-success border-success/30">Nuevo</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4">
          <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
            Ver Todo el Historial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading: isLoading, isAuthenticated } = useSecureAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="h-9 w-1/2 bg-slate-700/50 rounded-md animate-pulse mb-2"></div>
            <div className="h-6 w-3/4 bg-slate-700/50 rounded-md animate-pulse"></div>
          </motion.div>
        ) : isAuthenticated && user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Bienvenido de vuelta, {user?.name} 👋
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Gestiona tus servicios, proyectos y aprovecha nuevas oportunidades en Fixia
            </p>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">Redirigiendo a la página de inicio de sesión...</div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <QuickActions />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <StatCards />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {/* Current Projects */}
          <div className="lg:col-span-2">
            <CurrentProjects />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 sm:mt-12"
        >
          <Card className="glass border-white/10 text-center">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
                  ¿Listo para crecer en Fixia?
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
                  Crea nuevos servicios, explora oportunidades y conecta con más clientes.
                  Tu próximo proyecto te está esperando.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-4">
                  <Link to="/new-project" className="flex-1 sm:flex-none">
                    <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg w-full sm:w-auto text-sm sm:text-base">
                      <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Crear Nuevo Servicio</span>
                      <span className="sm:hidden">Crear</span>
                    </Button>
                  </Link>
                  <Link to="/opportunities" className="flex-1 sm:flex-none">
                    <Button variant="outline" className="glass border-white/20 hover:glass-medium w-full sm:w-auto text-sm sm:text-base">
                      <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Ver Oportunidades</span>
                      <span className="sm:hidden">Oportunidades</span>
                      <ArrowRight className="h-4 w-4 ml-2 hidden sm:inline flex-shrink-0" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}