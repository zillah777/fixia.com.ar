import React, { memo, useCallback } from "react";
import { Search, Plus, Bell, User, Briefcase, Heart, Shield, Gift, Settings, HelpCircle, LogOut, MessageSquare } from "lucide-react";
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
import { ProfessionsTicker } from "./ProfessionsTicker";

// Navigation component - Heart icon removed to fix bundling issue
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
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-white/10 shadow-lg shadow-black/5"
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
              <img
                src="/logo.png"
                alt="Fixia Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-lg"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg sm:rounded-xl blur opacity-30 animate-pulse-slow"></div>
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">Fixia</span>
              <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-1">
            {user?.userType === 'client' ? (
              <>
                <Link to="/how-it-works" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Cómo Funciona</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <Link to="/about" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Acerca de</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <Link to="/help" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Ayuda</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/services" className="relative px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Explorar Servicios</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <Link to="/how-it-works" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Cómo Funciona</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <Link to="/about" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Acerca de</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <Link to="/help" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-white/5 group">
                  <span className="relative z-10">Ayuda</span>
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            // Authenticated User Menu
            <>
              {/* Search - Visible for clients */}
              {user?.userType === 'client' && (
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Buscar..."
                    className="w-40 h-8 pl-9 pr-3 text-sm glass border-white/20 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const searchValue = (e.target as HTMLInputElement).value;
                        if (searchValue.trim()) {
                          navigate(`/services?q=${encodeURIComponent(searchValue)}`);
                        } else {
                          navigate('/services');
                        }
                      }
                    }}
                  />
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* New Project/Announcement Button - Responsive */}
                <Link to={user?.userType === 'professional' ? "/new-project" : "/new-opportunity"}>
                  <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {user?.userType === 'professional' ? 'Nuevo Servicio' : 'Crear Anuncio'}
                    </span>
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
                  {user?.userType === 'client' && (
                    <>
                      <Link to="/my-announcements">
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                          <Briefcase className="mr-3 h-4 w-4" />
                          Mis Anuncios
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/favorites">
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                          <Heart className="mr-3 h-4 w-4" />
                          Favoritos
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/feedback">
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                          <MessageSquare className="mr-3 h-4 w-4" />
                          Mi Feedback
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  {user?.userType === 'professional' && (
                    <>
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
                      <Link to="/feedback">
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                          <MessageSquare className="mr-3 h-4 w-4" />
                          Mi Feedback
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/verification">
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                          <Shield className="mr-3 h-4 w-4" />
                          Verificación
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
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
      {/* Ticker LED de profesiones en demanda */}
      <ProfessionsTicker />
    </>
  );
});