import React, { memo, useCallback } from "react";
import { Search, Plus, Bell, User, Briefcase, Heart, Shield, Gift, Settings, HelpCircle, LogOut, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { useSecureAuth } from "../context/SecureAuthContext";
import { MobileNavigation } from "./MobileNavigation";
import { NotificationBell } from "./notifications/NotificationBell";

export const FixiaNavigation = memo(function FixiaNavigation() {
  const { user, isAuthenticated, logout } = useSecureAuth();
  const navigate = useNavigate();
  
  // Handle logout with navigation - memoized to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if logout fails
      navigate('/');
    }
  }, [logout, navigate]);
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        {/* Logo and Navigation Links */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 liquid-gradient rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base sm:text-lg">F</span>
              </div>
              <div className="absolute -inset-1 liquid-gradient rounded-lg sm:rounded-xl blur opacity-20 animate-pulse-slow"></div>
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">Fixia</span>
              <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/services" className="text-foreground hover:text-primary transition-colors font-medium">
              Explorar Servicios
            </Link>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
              Cómo Funciona
            </Link>
            <Link to="/help" className="text-foreground hover:text-primary transition-colors font-medium">
              Ayuda
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contacto
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            // Authenticated User Menu
            <>
              {/* Search - Hidden on mobile */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar profesionales o servicios..."
                  className="w-64 xl:w-80 pl-12 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* New Project Button - Responsive */}
                <Link to="/new-project">
                  <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Nuevo Proyecto</span>
                  </Button>
                </Link>

                {/* Notifications */}
                <NotificationBell className="hover:bg-white/10 transition-all duration-300" />

                {/* Favorites - Hidden on small screens */}
                <Link to="/favorites" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="hover:bg-white/10 transition-all duration-300">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:glass-medium transition-all duration-300">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-primary/20">
                      <AvatarImage src={user?.avatar} alt={user?.name || 'Usuario'} />
                      <AvatarFallback className="glass text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 glass border-white/20" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatar} alt={user?.name || 'Usuario'} />
                          <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.name || 'Usuario'}</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.userType === 'professional' 
                              ? (user?.professionalProfile?.description || 'Profesional') 
                              : user?.planType === 'premium' 
                                ? 'Cliente Premium' 
                                : 'Cliente'
                            }
                          </p>
                          {user?.userType === 'professional' && user?.professionalProfile && (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="flex text-yellow-400">
                                {'★'.repeat(Math.floor(user.professionalProfile.averageRating || 0))}
                                {'☆'.repeat(5 - Math.floor(user.professionalProfile.averageRating || 0))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {user.professionalProfile.averageRating?.toFixed(1) || '0.0'} 
                                ({user.professionalProfile.totalReviews || 0} reseñas)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <Link to="/profile">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <User className="mr-3 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <Briefcase className="mr-3 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/opportunities">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <Briefcase className="mr-3 h-4 w-4" />
                      Oportunidades
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/jobs">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <Shield className="mr-3 h-4 w-4" />
                      Mis Trabajos
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/reviews">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <Star className="mr-3 h-4 w-4" />
                      Mis Reseñas
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/verification">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <Shield className="mr-3 h-4 w-4" />
                      Verificación
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <Link to="/settings">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/help">
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                      <HelpCircle className="mr-3 h-4 w-4" />
                      Centro de Ayuda
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="hover:glass-medium text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Public/Not Authenticated Menu
            <>
              <Link to="/login">
                <Button variant="ghost" className="hover:glass-medium transition-all duration-300 text-sm sm:text-base">
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg text-sm">
                  <Gift className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Únete Gratis</span>
                  <span className="sm:hidden">Únete</span>
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Navigation */}
          <MobileNavigation />
        </div>
      </div>
    </motion.header>
  );
});