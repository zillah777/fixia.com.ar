import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { FixiaNavigation } from "../../components/FixiaNavigation";

export default function SubscriptionFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

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
          <Card className="glass border-destructive/30 bg-destructive/5">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <XCircle className="h-20 w-20 text-destructive mx-auto" />
              </motion.div>
              <CardTitle className="text-3xl">Pago Rechazado</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  Tu pago no pudo ser procesado. Por favor, verifica tu información de pago e intenta nuevamente.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold mb-3">Posibles causas:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>Fondos insuficientes en tu cuenta</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>Datos de tarjeta incorrectos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>Límite de compra excedido</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>Problema temporal con el procesador de pagos</span>
                  </div>
                </div>
              </div>

              {paymentId && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">ID de Transacción:</span> {paymentId}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold">Estado:</span> {status || 'rejected'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => navigate('/pricing')}
                  className="flex-1 liquid-gradient"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar Nuevamente
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  ¿Necesitas ayuda?
                </p>
                <Button
                  onClick={() => navigate('/contact')}
                  variant="link"
                  className="text-primary"
                >
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
