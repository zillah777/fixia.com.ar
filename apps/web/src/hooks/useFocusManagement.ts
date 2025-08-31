import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for managing focus during route transitions
 * Ensures proper focus management for accessibility and keyboard navigation
 */
export const useFocusManagement = () => {
  const location = useLocation();
  const previousLocationRef = useRef(location.pathname);
  const focusTimeoutRef = useRef<NodeJS.Timeout>();

  const focusMainContent = useCallback(() => {
    // Clear any existing timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    // Set focus after a brief delay to ensure DOM is updated
    focusTimeoutRef.current = setTimeout(() => {
      // Try to focus the main content area
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        // Make it focusable if it isn't already
        if (!mainContent.hasAttribute('tabindex')) {
          mainContent.setAttribute('tabindex', '-1');
        }
        mainContent.focus();
        
        // Remove the temporary tabindex after focusing
        setTimeout(() => {
          if (mainContent.getAttribute('tabindex') === '-1') {
            mainContent.removeAttribute('tabindex');
          }
        }, 100);
        return;
      }

      // Fallback: focus the first heading
      const firstHeading = document.querySelector('h1, h2, h3');
      if (firstHeading instanceof HTMLElement) {
        if (!firstHeading.hasAttribute('tabindex')) {
          firstHeading.setAttribute('tabindex', '-1');
        }
        firstHeading.focus();
        setTimeout(() => {
          if (firstHeading.getAttribute('tabindex') === '-1') {
            firstHeading.removeAttribute('tabindex');
          }
        }, 100);
        return;
      }

      // Last fallback: focus the body
      document.body.focus();
    }, 100);
  }, []);

  const announcePage = useCallback((pathname: string) => {
    // Create or update the live region for screen reader announcements
    let liveRegion = document.getElementById('route-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'route-announcer';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Generate page announcement based on pathname
    let pageAnnouncement = 'Página cargada';
    
    const routeNames: Record<string, string> = {
      '/': 'Inicio - Fixia Marketplace',
      '/services': 'Servicios disponibles',
      '/dashboard': 'Panel de usuario',
      '/login': 'Iniciar sesión',
      '/register': 'Registro de usuario',
      '/profile': 'Mi perfil',
      '/settings': 'Configuración',
      '/notifications': 'Notificaciones',
      '/favorites': 'Favoritos',
      '/help': 'Centro de ayuda',
      '/contact': 'Contacto',
      '/about': 'Acerca de nosotros',
      '/how-it-works': 'Cómo funciona',
      '/pricing': 'Precios',
      '/terms': 'Términos y condiciones',
      '/privacy': 'Política de privacidad',
    };

    if (routeNames[pathname]) {
      pageAnnouncement = `Navegando a ${routeNames[pathname]}`;
    } else if (pathname.startsWith('/services/')) {
      pageAnnouncement = 'Navegando a detalle de servicio';
    } else if (pathname.startsWith('/profile/')) {
      pageAnnouncement = 'Navegando a perfil público';
    } else {
      pageAnnouncement = `Navegando a nueva página`;
    }

    liveRegion.textContent = pageAnnouncement;
  }, []);

  const handleRouteChange = useCallback(() => {
    const currentPathname = location.pathname;
    
    // Only handle focus if the route actually changed
    if (previousLocationRef.current !== currentPathname) {
      // Announce the page change to screen readers
      announcePage(currentPathname);
      
      // Manage focus for keyboard users
      focusMainContent();
      
      // Update the previous location
      previousLocationRef.current = currentPathname;
    }
  }, [location.pathname, announcePage, focusMainContent]);

  // Handle route changes
  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return {
    focusMainContent,
    announcePage,
  };
};

/**
 * Skip to main content function for programmatic use
 */
export const skipToMainContent = () => {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    if (!mainContent.hasAttribute('tabindex')) {
      mainContent.setAttribute('tabindex', '-1');
    }
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
      if (mainContent.getAttribute('tabindex') === '-1') {
        mainContent.removeAttribute('tabindex');
      }
    }, 100);
  }
};