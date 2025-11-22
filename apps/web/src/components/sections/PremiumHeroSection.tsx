import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { AnimatedOrbes } from '../effects/AnimatedOrbes';
import { FloatingParticles } from '../effects/FloatingParticles';
import { GlassEffect } from '../ui/glass-effect';
import { Button } from '../ui/button';

interface PremiumHeroSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  backgroundVariant?: 'orbes' | 'particles' | 'both' | 'none';
  imageUrl?: string;
  imagePosition?: 'right' | 'bottom' | 'left';
}

/**
 * PremiumHeroSection Component
 *
 * High-impact hero section with animated backgrounds, glass morphism effects,
 * and premium typography. Perfect for landing pages and featured sections.
 *
 * @example
 * ```tsx
 * <PremiumHeroSection
 *   title="Welcome to Fixia"
 *   subtitle="The future of marketplace"
 *   backgroundVariant="both"
 *   primaryAction={{ label: "Get Started", onClick: handleClick }}
 * />
 * ```
 */
const PremiumHeroSection: React.FC<PremiumHeroSectionProps> = ({
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  backgroundVariant = 'both',
  imageUrl,
  imagePosition = 'right',
}) => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20 md:pt-0">
      {/* Background Effects */}
      {(backgroundVariant === 'orbes' || backgroundVariant === 'both') && (
        <AnimatedOrbes count={5} blur />
      )}
      {(backgroundVariant === 'particles' || backgroundVariant === 'both') && (
        <FloatingParticles count={25} color="rgba(168, 85, 247, 0.4)" speed="slow" />
      )}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                {title}
              </h1>
            </motion.div>

            {/* Subtitle */}
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  {subtitle}
                </p>
              </motion.div>
            )}

            {/* Additional content */}
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {children}
              </motion.div>
            )}

            {/* Action Buttons */}
            {(primaryAction || secondaryAction) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {primaryAction && (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={primaryAction.onClick}
                    className="text-lg px-8 py-6"
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={secondaryAction.onClick}
                    className="text-lg px-8 py-6"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Image Content (if provided) */}
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <GlassEffect
                intensity="strong"
                color="primary"
                glow
                animated
                className="overflow-hidden"
              >
                <img
                  src={imageUrl}
                  alt="Hero"
                  className="w-full h-auto rounded-xl object-cover"
                />
              </GlassEffect>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-sm">Scroll to explore</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

PremiumHeroSection.displayName = 'PremiumHeroSection';

export { PremiumHeroSection };
