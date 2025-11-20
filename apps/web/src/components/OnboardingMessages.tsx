import { useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../context/SecureAuthContext';
import { DashboardStats } from '../lib/services/dashboard.service';
import { onboardingMessages, ClientStats, OnboardingMessage } from '../config/onboardingMessages.config';
import { useNavigate } from 'react-router-dom';

interface OnboardingMessagesProps {
  user: User | null | undefined;
  dashboardData?: DashboardStats | null;
  clientStats?: ClientStats;
}

/**
 * Enhanced Onboarding Messages Component
 * 
 * Features:
 * - Session-based persistence (resets on login)
 * - 40+ contextual messages
 * - Category-based organization
 * - Action buttons for quick navigation
 * - Smooth animations
 * - Mobile responsive
 * 
 * @version 2.0.0 - 2025 Best Practices
 */
export function OnboardingMessages({ user, dashboardData, clientStats }: OnboardingMessagesProps): ReactNode {
  const navigate = useNavigate();
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);
  const [sessionDismissed, setSessionDismissed] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Load dismissed messages from storage
  useEffect(() => {
    try {
      // Session-based dismissals (reset on login)
      const sessionDismissed = sessionStorage.getItem('onboarding_dismissed_session');
      if (sessionDismissed) {
        setSessionDismissed(JSON.parse(sessionDismissed));
      }

      // Permanent dismissals (never show again)
      const permanentDismissed = localStorage.getItem('onboarding_never_show');
      if (permanentDismissed) {
        setDismissedMessages(JSON.parse(permanentDismissed));
      }
    } catch (error) {
      console.warn('Failed to load dismissed messages:', error);
    }
  }, []);

  // Merge stats
  const mergedStats: DashboardStats & ClientStats = {
    total_services: 0,
    active_projects: 0,
    total_earnings: 0,
    average_rating: 0,
    review_count: 0,
    profile_views: 0,
    messages_count: 0,
    pending_proposals: 0,
    open_announcements: 0,
    proposals_received: 0,
    in_progress: 0,
    client_rating: 0,
    total_reviews: 0,
    has_switched_role: false,
    ...dashboardData,
    ...clientStats
  };

  // Filter active messages
  const allDismissed = [...dismissedMessages, ...sessionDismissed];
  const activeMessages = onboardingMessages
    .filter(msg => !allDismissed.includes(msg.id))
    .filter(msg => msg.condition(user, mergedStats))
    .sort((a, b) => a.priority - b.priority);

  // Handle dismiss (session-based by default)
  const handleDismiss = (messageId: string, permanent: boolean = false) => {
    if (permanent) {
      // Never show again
      const updatedPermanent = [...dismissedMessages, messageId];
      setDismissedMessages(updatedPermanent);
      try {
        localStorage.setItem('onboarding_never_show', JSON.stringify(updatedPermanent));
      } catch (error) {
        console.warn('Failed to save permanent dismissal:', error);
      }
    } else {
      // Dismiss for this session only
      const updatedSession = [...sessionDismissed, messageId];
      setSessionDismissed(updatedSession);
      try {
        sessionStorage.setItem('onboarding_dismissed_session', JSON.stringify(updatedSession));
      } catch (error) {
        console.warn('Failed to save session dismissal:', error);
      }
    }
  };

  // Handle dismiss all
  const handleDismissAll = () => {
    const allIds = activeMessages.map(m => m.id);
    const updatedSession = [...sessionDismissed, ...allIds];
    const uniqueIds = Array.from(new Set(updatedSession));

    setSessionDismissed(uniqueIds);
    try {
      sessionStorage.setItem('onboarding_dismissed_session', JSON.stringify(uniqueIds));
    } catch (error) {
      console.warn('Failed to save session dismissals:', error);
    }

    setCurrentMessageIndex(0);
  };

  // Handle action button click
  const handleAction = (message: OnboardingMessage) => {
    if (message.action?.href) {
      navigate(message.action.href);
    }
    // Auto-dismiss after action
    handleDismiss(message.id, false);
  };

  // No active messages
  if (activeMessages.length === 0) {
    return null;
  }

  // Ensure index is valid
  const safeIndex = Math.min(Math.max(currentMessageIndex, 0), activeMessages.length - 1);
  const currentMessage = activeMessages[safeIndex];

  if (!currentMessage) {
    return null;
  }

  const Icon = currentMessage.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMessage.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        <Card className={`glass border-white/20 bg-gradient-to-r ${currentMessage.color} bg-opacity-10 overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300`}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <motion.div
                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${currentMessage.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1 text-white leading-tight">
                  {currentMessage.title}
                </h3>
                <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed">
                  {currentMessage.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {currentMessage.action && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(currentMessage)}
                      className="bg-white/90 hover:bg-white text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {currentMessage.action.label}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => handleDismiss(currentMessage.id, false)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-medium"
                  >
                    Entendido
                  </Button>

                  {activeMessages.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismissAll}
                      className="text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                    >
                      Cerrar todos ({activeMessages.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDismiss(currentMessage.id, false)}
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Indicators */}
            {activeMessages.length > 1 && (
              <motion.div
                className="flex gap-1.5 mt-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {activeMessages.slice(0, 5).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === safeIndex
                        ? 'w-8 bg-white shadow-md'
                        : 'w-1.5 bg-white/40'
                      }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
                {activeMessages.length > 5 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                )}
              </motion.div>
            )}

            {/* Category Badge */}
            <motion.div
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-xs font-medium text-white/80 capitalize">
                {currentMessage.category}
              </span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
