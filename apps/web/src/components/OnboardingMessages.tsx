import { useState, useEffect } from 'react';
import { X, Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingMessage {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  condition: (user: any, stats: any) => boolean;
  priority: number;
}

export function OnboardingMessages({ user, dashboardData, clientStats }: any) {
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Load dismissed messages from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedOnboarding');
    if (dismissed) {
      setDismissedMessages(JSON.parse(dismissed));
    }
  }, []);

  const messages: OnboardingMessage[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a tu Dashboard!',
      description: 'Aquí puedes ver tus estadísticas, gestionar servicios y revisar propuestas.',
      icon: Zap,
      color: 'from-blue-500 to-purple-500',
      condition: (user, stats) => !stats || (stats.open_announcements === 0 && stats.proposals_received === 0),
      priority: 1
    },
    {
      id: 'create_first_service',
      title: 'Crea tu primer servicio',
      description: 'Los profesionales que publican servicios reciben 3x más contactos.',
      icon: Target,
      color: 'from-green-500 to-teal-500',
      condition: (user, stats) => user?.userType === 'professional' && (!stats?.total_services || stats.total_services === 0),
      priority: 2
    },
    {
      id: 'create_announcement',
      title: 'Publica tu primer anuncio',
      description: 'Los clientes que publican anuncios reciben propuestas en menos de 24 horas.',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      condition: (user, stats) => stats?.open_announcements === 0,
      priority: 2
    },
    {
      id: 'inactive_user',
      title: '¿Necesitas ayuda?',
      description: 'Parece que llevas tiempo inactivo. Explora oportunidades o crea un servicio.',
      icon: TrendingUp,
      color: 'from-pink-500 to-red-500',
      condition: (user, stats) => {
        // Check if user has been inactive (no activity in last 7 days)
        // This would need actual activity tracking
        return false; // Placeholder
      },
      priority: 3
    }
  ];

  const activeMessages = messages
    .filter(msg => !dismissedMessages.includes(msg.id))
    .filter(msg => msg.condition(user, { ...dashboardData, ...clientStats }))
    .sort((a, b) => a.priority - b.priority);

  const handleDismiss = (messageId: string) => {
    const updated = [...dismissedMessages, messageId];
    setDismissedMessages(updated);
    localStorage.setItem('dismissedOnboarding', JSON.stringify(updated));

    if (currentMessageIndex < activeMessages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const handleDismissAll = () => {
    const allIds = activeMessages.map(m => m.id);
    setDismissedMessages(allIds);
    localStorage.setItem('dismissedOnboarding', JSON.stringify(allIds));
  };

  if (activeMessages.length === 0) return null;

  const currentMessage = activeMessages[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMessage.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={`glass border-white/20 bg-gradient-to-r ${currentMessage.color} bg-opacity-10 overflow-hidden`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${currentMessage.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 text-white">{currentMessage.title}</h3>
                <p className="text-sm text-white/80 mb-3">{currentMessage.description}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDismiss(currentMessage.id)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Entendido
                  </Button>
                  {activeMessages.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismissAll}
                      className="text-white/60 hover:text-white/80 hover:bg-white/10"
                    >
                      Cerrar todos ({activeMessages.length})
                    </Button>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDismiss(currentMessage.id)}
                className="h-8 w-8 text-white/60 hover:text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {activeMessages.length > 1 && (
              <div className="flex gap-1 mt-3 justify-center">
                {activeMessages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentMessageIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
