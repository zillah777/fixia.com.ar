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
      
      <SheetContent side="left" className="w-[90vw] xs:w-[80vw] sm:w-80 max-w-sm p-0 overflow-y-auto max-h-screen">
        <div className="flex flex-col min-h-full">
          {/* Header - Compact */}
          <SheetHeader className="p-3 xs:p-4 pb-2 xs:pb-3 flex-shrink-0">
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            <div className="flex items-center justify-between gap-2">
              <Link to="/" onClick={handleClose} className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img
                    src="/logo.png"
                    alt="Fixia Logo"
                    className="h-9 w-9 xs:h-11 xs:w-11 object-contain drop-shadow-lg relative z-10"
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-30 animate-pulse-slow"></div>
                </motion.div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-base xs:text-lg font-semibold tracking-tight text-foreground truncate">Fixia</span>
                  <span className="text-[10px] xs:text-xs text-muted-foreground -mt-0.5 line-clamp-1">
                    Conecta. Confía.
                  </span>
                </div>
              </Link>
            </div>
          </SheetHeader>

          {/* User Info - Compact */}
          {isAuthenticated && user && (
            <div className="px-3 xs:px-4 py-2.5 xs:py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 xs:h-10 xs:w-10 flex-shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs xs:text-sm font-medium text-foreground truncate">
                      {user.name}
                    </h3>
                    {user.isVerified && (
                      <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <Badge
                      variant={user.userType === 'professional' ? 'default' : 'secondary'}
                      className="text-[9px] xs:text-[10px] px-1 xs:px-1.5 py-0 h-4 xs:h-5"
                    >
                      {user.userType === 'professional' ? 'Pro' : 'Cli'}
                    </Badge>
                    {user.planType === 'premium' && (
                      <Badge variant="outline" className="text-[9px] xs:text-[10px] px-1 xs:px-1.5 py-0 h-4 xs:h-5 gap-0.5">
                        <Crown className="h-2 w-2 xs:h-2.5 xs:w-2.5" />
                        Prem
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-2 xs:py-4">
            <div className="space-y-0.5 xs:space-y-1 px-2 xs:px-3">
              {/* Public Navigation - Hidden when authenticated */}
              {!isAuthenticated && (
                <div className="space-y-0.5 xs:space-y-1">
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
                  <Separator className="my-2 xs:my-4" />
                  <div className="space-y-0.5 xs:space-y-1">
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
          <div className="p-3 xs:p-4 xs:pt-3 pt-2 border-t border-border flex-shrink-0">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full justify-start text-xs xs:text-sm h-9 xs:h-10"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 flex-shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
              </Button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={handleClose} className="block">
                  <Button variant="outline" className="w-full text-xs xs:text-sm h-9 xs:h-10">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register" onClick={handleClose} className="block">
                  <Button className="w-full liquid-gradient text-xs xs:text-sm h-9 xs:h-10">
                    <Gift className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1 xs:mr-2 flex-shrink-0" />
                    <span className="truncate">Únete Gratis</span>
                  </Button>
                </Link>
              </div>
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
        "flex items-center gap-2 xs:gap-3 px-2.5 xs:px-4 py-2 xs:py-3 rounded-md text-xs xs:text-sm font-medium transition-colors min-h-10 xs:min-h-12",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span className="h-4 w-4 xs:h-5 xs:w-5 flex-shrink-0 flex items-center justify-center">
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="text-[9px] xs:text-xs px-1 xs:px-1.5 py-0 h-4 xs:h-5 flex-shrink-0">
          {item.badge > 99 ? '99+' : item.badge}
        </Badge>
      )}
    </Link>
  );
});

MobileNavigation.displayName = 'MobileNavigation';
NavigationLink.displayName = 'NavigationLink';