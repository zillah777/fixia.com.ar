import React from 'react';
import { motion } from 'motion/react';
import { LogoDisplay } from './LogoDisplay';
import { MobileMenu } from './MobileMenu';
import { cn } from '../ui/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface PremiumNavbarProps {
  logoSrc: string;
  logoAlt?: string;
  navItems?: NavItem[];
  onLogoClick?: () => void;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  sticky?: boolean;
  withBorder?: boolean;
}

/**
 * PremiumNavbar Component
 *
 * Beautiful premium navbar with animated logo display and smooth transitions.
 * Perfect for marketplace applications with high visual impact.
 *
 * @example
 * ```tsx
 * <PremiumNavbar
 *   logoSrc="/logo.png"
 *   navItems={[
 *     { label: 'Services', href: '/services' },
 *     { label: 'Professionals', href: '/professionals' },
 *   ]}
 * />
 * ```
 */
const PremiumNavbar = React.forwardRef<HTMLElement, PremiumNavbarProps>(
  ({
    logoSrc,
    logoAlt = 'Fixia',
    navItems = [],
    onLogoClick,
    className,
    variant = 'glass',
    sticky = true,
    withBorder = true,
  }, ref) => {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getVariantClasses = () => {
      switch (variant) {
        case 'glass':
          return 'bg-white/5 backdrop-blur-xl border-white/10';
        case 'gradient':
          return 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20';
        case 'default':
        default:
          return 'bg-background/80 backdrop-blur-md border-white/5';
      }
    };

    return (
      <motion.nav
        ref={ref}
        className={cn(
          'relative z-50',
          sticky && 'sticky top-0',
          'transition-all duration-300',
          className
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className={cn(
            'px-4 md:px-8 py-4 md:py-6',
            'flex items-center justify-between',
            'border-b',
            withBorder && getVariantClasses(),
            scrolled && 'shadow-lg shadow-black/10'
          )}
        >
          {/* Logo Section */}
          <motion.div
            className="flex items-center gap-4 cursor-pointer"
            onClick={onLogoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogoDisplay
              logoSrc={logoSrc}
              logoAlt={logoAlt}
              size="sm"
              variant="glow"
              animated
              withBackground={false}
            />

            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fixia
              </h1>
              <p className="text-xs text-muted-foreground">
                Marketplace de Servicios
              </p>
            </motion.div>
          </motion.div>

          {/* Navigation Items */}
          {navItems.length > 0 && (
            <motion.div
              className="hidden lg:flex items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2',
                    'text-sm font-medium',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors duration-300',
                    'relative'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{
                    color: 'hsl(var(--primary))',
                  }}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  {item.label}

                  {/* Hover underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </motion.div>
          )}

          {/* Right Section - Can be used for buttons/auth */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Mobile Menu - Same nav items as desktop */}
            {navItems.length > 0 && (
              <MobileMenu
                items={navItems}
                onItemClick={(href) => {
                  // Navigate to the href - can be integrated with router
                  window.location.href = href;
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Animated bottom gradient line */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-accent to-transparent"
          animate={{
            opacity: scrolled ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.nav>
    );
  }
);

PremiumNavbar.displayName = 'PremiumNavbar';

export { PremiumNavbar };
