import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ThumbsUp, MessageSquare, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FeedbackList } from '../components/feedback/FeedbackList';
import { TrustBadge } from '../components/feedback/TrustBadge';
import { useSecureAuth } from '../context/SecureAuthContext';
import { feedbackService, Feedback, TrustScore } from '../lib/services/feedback.service';
import { toast } from 'sonner';
import { FixiaNavigation } from '../components/FixiaNavigation';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';

export const FeedbackPage: React.FC = () => {
  const { user } = useSecureAuth();
  const [feedbackReceived, setFeedbackReceived] = useState<Feedback[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState<Feedback[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  useEffect(() => {
    loadFeedbackData();
  }, [user]);

  const loadFeedbackData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [received, given, score] = await Promise.all([
        feedbackService.getMyFeedbackReceived(),
        feedbackService.getMyFeedbackGiven(),
        feedbackService.getTrustScore(user.id),
      ]);

      // Ensure arrays are always arrays (defensive programming)
      setFeedbackReceived(Array.isArray(received) ? received : []);
      setFeedbackGiven(Array.isArray(given) ? given : []);
      setTrustScore(score);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Error al cargar feedback');
      // Reset to empty arrays on error
      setFeedbackReceived([]);
      setFeedbackGiven([]);
      setTrustScore(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await feedbackService.deleteFeedback(feedbackId);
      toast.success('Feedback eliminado');

      // Remove from local state
      setFeedbackGiven((prev) => prev.filter((f) => f.id !== feedbackId));

      // Reload if it was in received (to update trust score)
      if (feedbackReceived.some((f) => f.id === feedbackId)) {
        loadFeedbackData();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Error al eliminar feedback');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          Debes iniciar sesión para ver tu feedback
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <div className="container mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Back Button */}
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al Dashboard</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl liquid-gradient flex items-center justify-center">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Feedback</h1>
              <p className="text-sm sm:text-lg text-foreground/80">
                Comentarios y confiabilidad en la plataforma
              </p>
            </div>
          </div>

          {/* Trust Score Card */}
          {trustScore && (
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Tu Confiabilidad
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Basado en {trustScore.totalFeedback} feedback recibidos
                    </CardDescription>
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <TrustBadge trustScore={trustScore} size="lg" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex flex-col items-center p-4 rounded-lg glass-medium border border-blue-500/20">
                    <ThumbsUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-2" />
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{trustScore.totalLikes}</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground/70">Likes Positivos</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg glass-medium border border-purple-500/20">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mb-2" />
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{trustScore.totalFeedback}</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground/70">Total Feedback</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg glass-medium border border-green-500/20">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mb-2" />
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{trustScore.trustPercentage}%</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground/70">Confiabilidad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received' | 'given')}>
          <TabsList className="glass border-white/10 grid w-full grid-cols-2">
            <TabsTrigger value="received" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Recibido</span>
              <span className="xs:hidden">Recib.</span>
              <span>({feedbackReceived.length})</span>
            </TabsTrigger>
            <TabsTrigger value="given" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Dado ({feedbackGiven.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <FeedbackList
                feedbacks={feedbackReceived}
                currentUserId={user.id}
                variant="received"
                emptyMessage="No has recibido feedback todavía"
              />
            )}
          </TabsContent>

          <TabsContent value="given" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <FeedbackList
                feedbacks={feedbackGiven}
                currentUserId={user.id}
                variant="given"
                onDelete={handleDeleteFeedback}
                emptyMessage="No has dado feedback todavía"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNavigation />
    </div>
  );
};

export default FeedbackPage;
