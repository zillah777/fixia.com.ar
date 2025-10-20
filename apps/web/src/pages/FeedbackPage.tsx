import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FeedbackList } from '../components/feedback/FeedbackList';
import { TrustBadge } from '../components/feedback/TrustBadge';
import { useSecureAuth } from '../context/SecureAuthContext';
import { feedbackService, Feedback, TrustScore } from '../lib/services/feedback.service';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl liquid-gradient flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mi Feedback</h1>
              <p className="text-muted-foreground">
                Comentarios y confiabilidad en la plataforma
              </p>
            </div>
          </div>

          {/* Trust Score Card */}
          {trustScore && (
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Tu Confiabilidad
                    </CardTitle>
                    <CardDescription>
                      Basado en {trustScore.totalFeedback} feedback recibidos
                    </CardDescription>
                  </div>
                  <TrustBadge trustScore={trustScore} size="lg" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 rounded-lg glass-medium">
                    <ThumbsUp className="h-8 w-8 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold">{trustScore.totalLikes}</p>
                    <p className="text-sm text-muted-foreground">Likes Positivos</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg glass-medium">
                    <MessageSquare className="h-8 w-8 text-purple-400 mb-2" />
                    <p className="text-2xl font-bold">{trustScore.totalFeedback}</p>
                    <p className="text-sm text-muted-foreground">Total Feedback</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg glass-medium">
                    <Shield className="h-8 w-8 text-green-400 mb-2" />
                    <p className="text-2xl font-bold">{trustScore.trustPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Confiabilidad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received' | 'given')}>
          <TabsList className="glass border-white/10">
            <TabsTrigger value="received" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Recibido ({feedbackReceived.length})
            </TabsTrigger>
            <TabsTrigger value="given" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Dado ({feedbackGiven.length})
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
    </div>
  );
};

export default FeedbackPage;
