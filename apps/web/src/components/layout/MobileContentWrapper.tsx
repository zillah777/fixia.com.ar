import React from 'react';
import { cn } from '../ui/utils';

interface MobileContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

/**
 * MobileContentWrapper - Ensures content doesn't overlap with mobile bottom navigation
 * Automatically adds bottom padding when bottom nav is present
 */
export function MobileContentWrapper({
  children,
  className,
  withBottomNav = true,
}: MobileContentWrapperProps) {
  return (
    <div
      className={cn(
        'relative flex-1',
        // pb-20 = 80px (approximately 64px nav + 16px safe area)
        // On lg+ screens: no padding needed (nav is hidden)
        withBottomNav && 'pb-20 lg:pb-0',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * PageLayout - Combined layout component for pages with top header and bottom nav
 */
interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
  header?: React.ReactNode;
}

export function PageLayout({
  children,
  className,
  withBottomNav = true,
  header,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <div>{header}</div>}
      <MobileContentWrapper
        withBottomNav={withBottomNav}
        className={className}
      >
        {children}
      </MobileContentWrapper>
    </div>
  );
}
