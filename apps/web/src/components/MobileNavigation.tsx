import React, { memo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Home, Search, Briefcase, User, Bell, Settings,
  LogOut, Heart, Gift, Shield, HelpCircle, Plus, Crown,
  MessageSquare, Target, TrendingUp, Info, DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useSecureAuth } from '../context/SecureAuthContext';
import { useNotifications } from '../context/NotificationContext';
import { cn } from './ui/utils';

interface MobileNavigationProps {
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  requiresAuth?: boolean;
  userType?: 'client' | 'professional' | 'both';
}

export const MobileNavigation = memo<MobileNavigationProps>(({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useSecureAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [logout, handleClose]);

  // Navigation items configuration - Optimized for mobile
  const publicNavigation: NavigationItem[] = [
    { label: 'Inicio', href: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Planes', href: '/pricing', icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Servicios', href: '/services', icon: <Search className="h-5 w-5" /> },
    { label: 'Sobre Nosotros', href: '/about', icon: <Info className="h-5 w-5" /> },
    { label: 'Ayuda', href: '/help', icon: <HelpCircle className="h-5 w-5" /> }
  ];

  const authenticatedNavigation: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <TrendingUp className="h-5 w-5" />,
      requiresAuth: true
    },
    {
      label: 'Mi Perfil',
      href: '/profile',
      icon: <User className="h-5 w-5" />,
      requiresAuth: true
    },
    {
      label: 'Crear Anuncio',
      href: '/new-opportunity',
      icon: <Plus className="h-5 w-5" />,
      requiresAuth: true,
      userType: 'client'
    },
    {
      label: 'Mis Anuncios',
      href: '/my-announcements',
      icon: <Briefcase className="h-5 w-5" />,
      requiresAuth: true,
      userType: 'client'
    },
    {
      label: 'Nuevo Servicio',
      href: '/new-project',
      icon: <Plus className="h-5 w-5" />,
      requiresAuth: true,
      userType: 'professional'
    },
    {
      label: 'Oportunidades',
      href: '/opportunities',
      icon: <Target className="h-5 w-5" />,
      requiresAuth: true,
      userType: 'professional'
    },
    {
      label: 'Favoritos',
      href: '/favorites',
      icon: <Heart className="h-5 w-5" />,
      requiresAuth: true,
      userType: 'client'
    },
    {
      label: 'Notificaciones',
      href: '/notifications',
      icon: <Bell className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      requiresAuth: true
    },
    {
      label: 'Configuración',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      requiresAuth: true
    }
  ];

  const shouldShowItem = useCallback((item: NavigationItem) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.userType && item.userType !== 'both') {
      return user?.userType === item.userType;
    }
    return true;
  }, [isAuthenticated, user?.userType]);

  const isActivePath = useCallback((href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("lg:hidden", className)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[80vw] sm:w-72 max-w-xs p-0 overflow-y-auto max-h-screen">
        <div className="flex flex-col h-full">
          {/* Header - Ultra Compact */}
          <SheetHeader className="p-2 sm:p-3 pb-1 sm:pb-2 flex-shrink-0 border-b border-border/50">
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            <Link to="/" onClick={handleClose} className="flex items-center gap-1.5 flex-shrink-0">
              <motion.div
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src="/logo.png"
                  alt="Fixia Logo"
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-lg relative z-10"
                />
              </motion.div>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">Fixia</span>
            </Link>
          </SheetHeader>

          {/* User Info - Ultra Compact */}
          {isAuthenticated && user && (
            <div className="px-2 sm:px-3 py-2 sm:py-2.5 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] sm:text-xs font-medium text-foreground truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
                    <Badge
                      className={cn(
                        "text-[8px] px-2 py-0.5 h-auto font-semibold whitespace-nowrap",
                        user.userType === 'professional'
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md'
                          : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md'
                      )}
                    >
                      {user.userType === 'professional' ? 'Pro' : 'Cliente'}
                    </Badge>
                    {user.isVerified && (
                      <Shield className="h-2.5 w-2.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-1 sm:py-2">
            <div className="space-y-0 px-1.5 sm:px-2">
              {/* Public Navigation - Hidden when authenticated */}
              {!isAuthenticated && (
                <div className="space-y-0.5">
                  {publicNavigation.map((item) => (
                    <NavigationLink
                      key={item.href}
                      item={item}
                      isActive={isActivePath(item.href)}
                      onClick={handleClose}
                    />
                  ))}
                </div>
              )}

              {/* Authenticated Navigation */}
              {isAuthenticated && (
                <>
                  <Separator className="my-1 sm:my-2" />
                  <div className="space-y-0.5">
                    {authenticatedNavigation
                      .filter(shouldShowItem)
                      .map((item) => (
                        <NavigationLink
                          key={item.href}
                          item={item}
                          isActive={isActivePath(item.href)}
                          onClick={handleClose}
                        />
                      ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Auth Actions */}
          <div className="p-1.5 sm:p-2 border-t border-border/50 flex-shrink-0 space-y-1 sm:space-y-1.5">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full justify-start text-[11px] sm:text-xs h-8 sm:h-9"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={handleClose} className="block">
                  <Button variant="outline" className="w-full text-[11px] sm:text-xs h-8 sm:h-9">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register" onClick={handleClose} className="block">
                  <Button className="w-full liquid-gradient text-[11px] sm:text-xs h-8 sm:h-9">
                    <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">Únete Gratis</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

// Navigation Link Component
interface NavigationLinkProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}

const NavigationLink = memo<NavigationLinkProps>(({ item, isActive, onClick }) => {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-medium transition-colors min-h-8 sm:min-h-9",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
      )}
    >
      <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 flex items-center justify-center">
        {item.icon}
      </span>
      <span className="flex-1 truncate text-left">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="text-[7px] sm:text-[8px] px-0.5 py-0 h-3 sm:h-3.5 flex-shrink-0">
          {item.badge > 99 ? '99+' : item.badge}
        </Badge>
      )}
    </Link>
  );
});

MobileNavigation.displayName = 'MobileNavigation';
NavigationLink.displayName = 'NavigationLink';