/**
 * FIXIA RESPONSIVE NAVIGATION COMPONENT
 * World-class navigation with mobile hamburger menu
 *
 * Features:
 * - Desktop horizontal nav with dropdowns
 * - Mobile hamburger with slide-out menu
 * - Safe area support
 * - Scroll-aware behavior
 * - Focus management
 * - WCAG AA accessible
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

/* ============================================
   NAVIGATION CONTEXT
   ============================================ */

interface NavContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  isScrolled: boolean;
}

const NavContext = React.createContext<NavContextValue | null>(null);

const useNav = () => {
  const context = React.useContext(NavContext);
  if (!context) {
    throw new Error('Nav components must be used within ResponsiveNavigation');
  }
  return context;
};

/* ============================================
   NAVIGATION ROOT
   ============================================ */

interface ResponsiveNavigationProps {
  children: React.ReactNode;
  /** Logo element */
  logo?: React.ReactNode;
  /** Show/hide based on scroll direction */
  hideOnScroll?: boolean;
  /** Blur background when scrolled */
  blurOnScroll?: boolean;
  /** Mobile breakpoint */
  mobileBreakpoint?: number;
  /** Fixed position */
  fixed?: boolean;
  /** Custom className */
  className?: string;
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  children,
  logo,
  hideOnScroll = false,
  blurOnScroll = true,
  mobileBreakpoint = 1024,
  fixed = true,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  // Check mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Handle scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if scrolled
      setIsScrolled(currentScrollY > 20);

      // Hide on scroll down, show on scroll up
      if (hideOnScroll) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  // Close mobile menu on resize to desktop
  React.useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const contextValue = React.useMemo(
    () => ({ isOpen, setIsOpen, isMobile, isScrolled }),
    [isOpen, isMobile, isScrolled]
  );

  return (
    <NavContext.Provider value={contextValue}>
      <motion.header
        className={cn(
          'w-full z-[var(--z-fixed)]',
          fixed && 'fixed top-0 left-0 right-0',
          'transition-all duration-300',
          className
        )}
        initial={false}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <nav
          className={cn(
            'flex items-center justify-between',
            'h-14 sm:h-16',
            'px-4 sm:px-6 lg:px-8',
            'pt-[env(safe-area-inset-top)]',
            'transition-all duration-300',
            // Glass effect when scrolled
            blurOnScroll && isScrolled
              ? 'glass-medium shadow-lg border-b border-white/10'
              : 'bg-transparent',
          )}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {children}
          </div>

          {/* Mobile Menu Button */}
          <NavMenuButton />
        </nav>

        {/* Mobile Menu */}
        <NavMobileMenu>{children}</NavMobileMenu>
      </motion.header>

      {/* Spacer to prevent content jump */}
      {fixed && (
        <div className="h-14 sm:h-16 pt-[env(safe-area-inset-top)]" />
      )}
    </NavContext.Provider>
  );
};

/* ============================================
   MOBILE MENU BUTTON
   ============================================ */

const NavMenuButton: React.FC = () => {
  const { isOpen, setIsOpen, isMobile } = useNav();

  if (!isMobile) return null;

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'lg:hidden',
        'flex items-center justify-center',
        'w-11 h-11 -mr-2',
        'rounded-xl',
        'hover:bg-white/10',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <motion.div
        className="relative w-6 h-5"
        initial={false}
      >
        {/* Top bar */}
        <motion.span
          className="absolute left-0 w-6 h-0.5 bg-current rounded-full"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 9 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Middle bar */}
        <motion.span
          className="absolute left-0 top-[9px] w-6 h-0.5 bg-current rounded-full"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Bottom bar */}
        <motion.span
          className="absolute left-0 bottom-0 w-6 h-0.5 bg-current rounded-full"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -9 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </button>
  );
};

/* ============================================
   MOBILE MENU
   ============================================ */

interface NavMobileMenuProps {
  children: React.ReactNode;
}

const NavMobileMenu: React.FC<NavMobileMenuProps> = ({ children }) => {
  const { isOpen, setIsOpen, isMobile } = useNav();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Focus trap
  React.useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            className={cn(
              'fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] sm:top-[calc(4rem+env(safe-area-inset-top))]',
              'bottom-0',
              'bg-background',
              'overflow-y-auto overscroll-contain',
              'lg:hidden',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col p-4 pb-[env(safe-area-inset-bottom)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================
   NAV LINK
   ============================================ */

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Active state */
  isActive?: boolean;
  /** Icon */
  icon?: React.ReactNode;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, isActive = false, icon, children, onClick, ...props }, ref) => {
    const { isMobile, setIsOpen } = useNav();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isMobile) {
        setIsOpen(false);
      }
      onClick?.(e);
    };

    return (
      <a
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          'font-medium',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-lg',

          // Desktop styles
          'lg:gap-2 lg:px-3 lg:py-2 lg:rounded-lg',
          'lg:text-sm',
          isActive
            ? 'lg:text-primary lg:bg-white/10'
            : 'lg:text-foreground/80 lg:hover:text-foreground lg:hover:bg-white/5',

          // Mobile styles
          'px-4 py-3.5 rounded-xl',
          'text-base',
          isActive
            ? 'text-primary bg-white/10'
            : 'text-foreground hover:bg-white/5',

          className
        )}
        onClick={handleClick}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {icon && (
          <span className="w-5 h-5 lg:w-4 lg:h-4 flex-shrink-0">{icon}</span>
        )}
        {children}
      </a>
    );
  }
);

NavLink.displayName = 'NavLink';

/* ============================================
   NAV GROUP (For grouping links in mobile)
   ============================================ */

interface NavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group title */
  title?: string;
}

const NavGroup = React.forwardRef<HTMLDivElement, NavGroupProps>(
  ({ className, title, children, ...props }, ref) => {
    const { isMobile } = useNav();

    if (!isMobile) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        className={cn('py-2', className)}
        {...props}
      >
        {title && (
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </div>
        )}
        <div className="flex flex-col">{children}</div>
      </div>
    );
  }
);

NavGroup.displayName = 'NavGroup';

/* ============================================
   NAV ACTIONS (Right-side actions)
   ============================================ */

interface NavActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavActions = React.forwardRef<HTMLDivElement, NavActionsProps>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useNav();

    return (
      <div
        ref={ref}
        className={cn(
          isMobile
            ? 'flex flex-col gap-2 pt-4 mt-4 border-t border-white/10'
            : 'hidden lg:flex lg:items-center lg:gap-2 lg:ml-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavActions.displayName = 'NavActions';

/* ============================================
   NAV DIVIDER
   ============================================ */

const NavDivider: React.FC<{ className?: string }> = ({ className }) => {
  const { isMobile } = useNav();

  if (!isMobile) {
    return <div className={cn('w-px h-6 bg-white/10 mx-2', className)} />;
  }

  return <div className={cn('h-px bg-white/10 my-2', className)} />;
};

export {
  ResponsiveNavigation,
  NavLink,
  NavGroup,
  NavActions,
  NavDivider,
  NavMenuButton,
  useNav,
};
