import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

export interface MobileMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

// Compatible with PremiumNavbar NavItem
export type NavItemCompat = Omit<MobileMenuItem, 'badge'>;

interface MobileMenuProps {
  items: MobileMenuItem[];
  onItemClick?: (href: string) => void;
  className?: string;
}

/**
 * MobileMenu Component
 *
 * Beautiful mobile hamburger menu with smooth animations.
 * Automatically syncs with desktop navbar items.
 *
 * @example
 * ```tsx
 * <MobileMenu
 *   items={navItems}
 *   onItemClick={(href) => navigate(href)}
 * />
 * ```
 */
const MobileMenu = React.forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ items, onItemClick, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

    const handleItemClick = (href: string) => {
      onItemClick?.(href);
      setIsOpen(false); // Auto-close menu after clicking
    };

    return (
      <div ref={ref} className={cn('relative lg:hidden', className)}>
        {/* Hamburger Button */}
        <motion.button
          onClick={toggleMenu}
          className={cn(
            'p-3 rounded-lg',
            'hover:bg-white/10 transition-colors duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary/50'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={isOpen ? 'open' : 'closed'}
            variants={{
              open: { rotate: 90 },
              closed: { rotate: 0 },
            }}
            transition={{ duration: 0.3 }}
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </motion.svg>
        </motion.button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ zIndex: 40 }}
              />

              {/* Menu Panel */}
              <motion.div
                className={cn(
                  'absolute right-0 top-full mt-2 w-64',
                  'rounded-2xl',
                  'bg-gradient-to-br from-white/10 to-white/5',
                  'backdrop-blur-xl border border-white/20',
                  'shadow-2xl shadow-black/40',
                  'z-50'
                )}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -10,
                }}
                transition={{
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                <div className="p-2">
                  {/* Menu Items */}
                  <motion.div
                    className="space-y-1"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    }}
                  >
                    {items.map((item, index) => (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(item.href);
                        }}
                        className={cn(
                          'flex items-center gap-3',
                          'px-4 py-3 rounded-xl',
                          'text-sm font-medium',
                          'text-foreground/80 hover:text-foreground',
                          'hover:bg-white/10',
                          'transition-all duration-200',
                          'cursor-pointer',
                          'relative group'
                        )}
                        variants={{
                          hidden: {
                            opacity: 0,
                            x: -20,
                          },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: {
                              duration: 0.3,
                              ease: 'easeOut',
                            },
                          },
                        }}
                        whileHover={{
                          x: 4,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                      >
                        {/* Icon */}
                        {item.icon && (
                          <motion.span
                            className="text-lg flex-shrink-0"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                          >
                            {item.icon}
                          </motion.span>
                        )}

                        {/* Label */}
                        <span className="flex-1">{item.label}</span>

                        {/* Badge */}
                        {item.badge && (
                          <motion.span
                            className={cn(
                              'px-2 py-1 rounded-full',
                              'text-xs font-semibold',
                              'bg-primary/20 text-primary',
                              'border border-primary/30'
                            )}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 20,
                              delay: 0.2 + index * 0.05,
                            }}
                          >
                            {item.badge}
                          </motion.span>
                        )}

                        {/* Hover underline */}
                        <motion.div
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.a>
                    ))}
                  </motion.div>

                  {/* Divider */}
                  {items.length > 0 && (
                    <motion.div
                      className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    />
                  )}

                  {/* Bottom Actions */}
                  <motion.div
                    className="pt-2 space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.3,
                        },
                      },
                    }}
                  >
                    {/* Close Button */}
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'text-sm font-medium',
                        'bg-primary/10 hover:bg-primary/20',
                        'text-primary',
                        'transition-colors duration-200',
                        'border border-primary/20'
                      )}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Close Menu
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

export { MobileMenu };
