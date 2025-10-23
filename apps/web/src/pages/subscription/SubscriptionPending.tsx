import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { FixiaNavigation } from "../../components/FixiaNavigation";

export default function SubscriptionPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

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
          <Card className="glass border-warning/30 bg-warning/5">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <Clock className="h-20 w-20 text-warning mx-auto" />
              </motion.div>
              <CardTitle className="text-3xl">Pago Pendiente</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="border-warning/30 bg-warning/5">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Tu pago está siendo procesado. Recibirás una notificación cuando se complete.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  ¿Qué sucede ahora?
                </h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Procesamiento del pago</p>
                      <p className="text-xs mt-1">
                        Tu pago está siendo verificado por MercadoPago. Esto puede tomar algunos minutos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Notificación por email</p>
                      <p className="text-xs mt-1">
                        Te enviaremos un email cuando tu pago sea aprobado o rechazado.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Activación automática</p>
                      <p className="text-xs mt-1">
                        Una vez aprobado, tu perfil profesional se activará automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentId && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">ID de Transacción:</span> {paymentId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Guarda este número para futuras consultas
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 liquid-gradient"
                >
                  Ir al Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ver Planes
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Los pagos pendientes generalmente se procesan en 24-48 horas. Si tienes dudas, contacta a soporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
