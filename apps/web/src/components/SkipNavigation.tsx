import React, { memo } from 'react';
import { cn } from './ui/utils';

interface SkipNavigationProps {
  className?: string;
  links?: SkipLink[];
}

interface SkipLink {
  href: string;
  label: string;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { href: '#main-content', label: 'Ir al contenido principal' },
  { href: '#navigation', label: 'Ir a la navegación' },
  { href: '#footer', label: 'Ir al pie de página' },
];

/**
 * Skip Navigation Links for improved keyboard and screen reader accessibility
 * These links help users quickly navigate to key page sections
 */
export const SkipNavigation = memo<SkipNavigationProps>(({ 
  className, 
  links = DEFAULT_SKIP_LINKS 
}) => {
  if (!links || links.length === 0) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 z-[9999] bg-background border border-border shadow-lg",
        "transform -translate-y-full opacity-0",
        "focus-within:translate-y-0 focus-within:opacity-100",
        "transition-all duration-200 ease-in-out",
        className
      )}
      role="navigation"
      aria-label="Enlaces de navegación rápida"
    >
      <ul className="flex flex-col p-2 gap-1">
        {links.map((link, index) => (
          <li key={`${link.href}-${index}`}>
            <a
              href={link.href}
              className={cn(
                "block px-4 py-2 text-sm font-medium rounded-md",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 focus:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "transition-colors duration-200"
              )}
              onClick={(e) => {
                const target = document.querySelector(link.href);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                  // Focus the target element if it's focusable
                  if (target instanceof HTMLElement) {
                    // Make it focusable if it isn't already
                    if (!target.hasAttribute('tabindex')) {
                      target.setAttribute('tabindex', '-1');
                    }
                    target.focus();
                    // Remove the temporary tabindex after focusing
                    setTimeout(() => {
                      if (target.getAttribute('tabindex') === '-1') {
                        target.removeAttribute('tabindex');
                      }
                    }, 100);
                  }
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});

SkipNavigation.displayName = 'SkipNavigation';