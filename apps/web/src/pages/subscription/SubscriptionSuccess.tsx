import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, Crown, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FixiaNavigation } from "../../components/FixiaNavigation";
import { useSecureAuth } from "../../context/SecureAuthContext";
import { toast } from "sonner";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUserData } = useSecureAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [planType, setPlanType] = useState<string>('');

  useEffect(() => {
    // Extract payment info from URL params
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    if (externalReference) {
      try {
        const refData = JSON.parse(externalReference);
        setPlanType(refData.subscriptionType);
      } catch (e) {
        console.error('Error parsing external reference:', e);
      }
    }

    // Refresh user data after a delay to get updated subscription status
    const timer = setTimeout(async () => {
      try {
        await refreshUserData();
        setIsProcessing(false);
        toast.success('¡Suscripción activada exitosamente!');
      } catch (error) {
        console.error('Error refreshing user:', error);
        setIsProcessing(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, refreshUserData]);

  const getPlanIcon = () => {
    if (planType === 'premium') {
      return <Crown className="h-16 w-16 text-primary" />;
    }
    return <Zap className="h-16 w-16 text-blue-400" />;
  };

  const getPlanName = () => {
    if (planType === 'premium') return 'Plan Premium';
    if (planType === 'basic') return 'Plan Basic';
    return 'Plan Profesional';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <FixiaNavigation />

      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass border-success/30 bg-success/5">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <CheckCircle className="h-20 w-20 text-success mx-auto" />
              </motion.div>
              <CardTitle className="text-3xl">¡Pago Exitoso!</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {isProcessing ? (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Activando tu suscripción...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-4"
                    >
                      {getPlanIcon()}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">
                      ¡Bienvenido a {getPlanName()}!
                    </h3>
                    <p className="text-muted-foreground">
                      Tu cuenta ha sido actualizada exitosamente. Ahora puedes disfrutar de todos los beneficios profesionales.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                    <h4 className="font-semibold mb-3">¿Qué sigue?</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span>Completa tu perfil profesional con tu experiencia y portfolio</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span>Publica tus primeros servicios para que los clientes te encuentren</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span>Responde a proyectos publicados por clientes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span>Construye tu reputación con el Trust Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 liquid-gradient"
                    >
                      Ir al Dashboard
                    </Button>
                    <Button
                      onClick={() => navigate('/services/new')}
                      variant="outline"
                      className="flex-1"
                    >
                      Publicar Servicio
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
