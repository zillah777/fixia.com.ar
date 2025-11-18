import React, { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { 
  Home, Search, Plus, User, Bell, Briefcase, Heart, TrendingUp 
} from 'lucide-react';
import { Badge } from './ui/badge';
import { useSecureAuth } from '../context/SecureAuthContext';
import { useNotifications } from '../context/NotificationContext';
import { cn } from './ui/utils';

interface MobileBottomNavigationProps {
  className?: string;
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  requiresAuth?: boolean;
  userType?: 'client' | 'professional' | 'both';
}

export const MobileBottomNavigation = memo<MobileBottomNavigationProps>(({ className }) => {
  const { user, isAuthenticated } = useSecureAuth();
  const { notifications } = useNotifications();
  const location = useLocation();

  // Calculate actual unread count from notifications to prevent phantom badges
  const actualUnreadCount = notifications.filter(n => !n.read).length;

  const navItems: NavItem[] = useMemo(() => [
    {
      href: '/',
      icon: <Home className="h-5 w-5" />,
      label: 'Inicio'
    },
    {
      href: '/services',
      icon: <Search className="h-5 w-5" />,
      label: 'Buscar'
    },
    ...(isAuthenticated ? [
      {
        href: user?.userType === 'professional' ? '/opportunities' : '/new-project',
        icon: user?.userType === 'professional'
          ? <Briefcase className="h-5 w-5" />
          : <Plus className="h-5 w-5" />,
        label: user?.userType === 'professional' ? 'Trabajos' : 'Crear',
        requiresAuth: true,
        userType: user?.userType === 'dual' ? 'both' : user?.userType
      },
      {
        href: '/notifications',
        icon: <Bell className="h-5 w-5" />,
        label: 'Avisos',
        badge: actualUnreadCount > 0 ? actualUnreadCount : undefined,
        requiresAuth: true
      },
      {
        href: '/dashboard',
        icon: <TrendingUp className="h-5 w-5" />,
        label: 'Panel',
        requiresAuth: true
      }
    ] : [
      {
        href: '/how-it-works',
        icon: <Briefcase className="h-5 w-5" />,
        label: 'Cómo'
      },
      {
        href: '/login',
        icon: <User className="h-5 w-5" />,
        label: 'Entrar'
      }
    ])
  ], [isAuthenticated, user?.userType, actualUnreadCount]);

  const isActivePath = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Don't show on desktop or when there are no items
  if (navItems.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-lg border-t border-border",
        "safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-3 pb-safe">
        {navItems.map((item, index) => (
          <MobileNavItem
            key={item.href}
            item={item}
            isActive={isActivePath(item.href)}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
});

interface MobileNavItemProps {
  item: NavItem;
  isActive: boolean;
  index: number;
}

const MobileNavItem = memo<MobileNavItemProps>(({ item, isActive, index }) => {
  return (
    <Link
      to={item.href}
      className={cn(
        "relative flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 rounded-lg transition-all duration-200 ",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Background highlight for active item */}
      {isActive && (
        <motion.div
          layoutId="mobile-nav-indicator"
          className="absolute inset-0 bg-primary/10 rounded-lg"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      
      <div className="relative flex flex-col items-center space-y-1">
        {/* Icon with badge */}
        <div className="relative">
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {item.icon}
          </motion.div>
          
          {item.badge && item.badge > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-[20px] animate-pulse"
            >
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </div>
        
        {/* Label */}
        <span className={cn(
          "text-xs font-medium truncate max-w-[60px] leading-tight",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {item.label}
        </span>
      </div>
    </Link>
  );
});

MobileBottomNavigation.displayName = 'MobileBottomNavigation';
MobileNavItem.displayName = 'MobileNavItem';