/**
 * FIXIA ENTERPRISE DESIGN SYSTEM
 * Version: 2.0.0
 *
 * A world-class responsive design system for the Fixia marketplace.
 *
 * This module exports all design system components, utilities, and tokens
 * for building consistent, accessible, and beautiful user interfaces.
 */

// ============================================
// RESPONSIVE COMPONENTS
// ============================================

// Button System
export {
  ResponsiveButton,
  ResponsiveButtonGroup,
  ResponsiveIconButton,
  responsiveButtonVariants,
  type ResponsiveButtonProps,
} from './ResponsiveButton';

// Card System
export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
  ResponsiveCardFooter,
  ResponsiveCardAction,
  ResponsiveCardImage,
  responsiveCardVariants,
  type ResponsiveCardProps,
} from './ResponsiveCard';

// Modal System
export {
  ResponsiveModal,
  ResponsiveModalOverlay,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTrigger,
  useModal,
} from './ResponsiveModal';

// Grid System
export {
  ResponsiveGrid,
  ResponsiveGridItem,
  ResponsiveCardGrid,
  ResponsiveMasonryGrid,
  ResponsiveMasonryItem,
  ResponsiveFormGrid,
  ResponsiveFormField,
  ResponsiveSidebarLayout,
  ResponsiveSidebar,
  responsiveGridVariants,
  gridItemVariants,
  type ResponsiveGridProps,
  type GridItemProps,
} from './ResponsiveGrid';

// Table System
export {
  ResponsiveTable,
  TableElement,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
  TableEmptyState,
  TableLoadingState,
  useTableContext,
} from './ResponsiveTable';

// Navigation System
export {
  ResponsiveNavigation,
  NavLink,
  NavGroup,
  NavActions,
  NavDivider,
  NavMenuButton,
  useNav,
} from './ResponsiveNavigation';

// Hero System
export {
  ResponsiveHero,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroBadge,
  HeroContent,
  HeroMedia,
  HeroGradientBackground,
  HeroOrbs,
  HeroGrid,
  heroVariants,
} from './ResponsiveHero';

// ============================================
// TYPE EXPORTS
// ============================================

export type { VariantProps } from 'class-variance-authority';
