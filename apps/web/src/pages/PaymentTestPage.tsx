import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PaymentButton, PaymentCard } from '../components/payments/PaymentButton';
import { paymentsService } from '../lib/services/payments.service';

export default function PaymentTestPage() {
  const [testMode, setTestMode] = useState<'button' | 'card' | 'custom'>('button');
  const [amount, setAmount] = useState(10000);
  const [title, setTitle] = useState('Servicio de Plomería');
  const [description, setDescription] = useState('Reparación de tubería en baño principal');
  const [serviceId] = useState('test-service-123');
  const [professionalId] = useState('test-professional-456');

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    alert(`¡Pago exitoso! ID: ${paymentId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Error en el pago: ${error}`);
  };

  const testPaymentMethods = async () => {
    try {
      const methods = await paymentsService.getPaymentMethods();
      console.log('Available payment methods:', methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8\">
      <div className=\"container mx-auto px-4 max-w-6xl\">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"text-center mb-8\"
        >
          <h1 className=\"text-4xl font-bold text-gray-800 mb-4\">
            <CreditCard className=\"inline-block mr-3 h-10 w-10 text-blue-600\" />
            Sistema de Pagos - Test
          </h1>
          <p className=\"text-lg text-gray-600\">
            Prueba la integración con MercadoPago
          </p>
        </motion.div>

        {/* Mode Selection */}
        <Card className=\"mb-8\">
          <CardHeader>
            <CardTitle className=\"flex items-center\">
              <DollarSign className=\"mr-2 h-5 w-5\" />
              Configuración de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
              <div>
                <Label htmlFor=\"mode\">Modo de Prueba</Label>
                <Select value={testMode} onValueChange={(value: any) => setTestMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"button\">PaymentButton</SelectItem>
                    <SelectItem value=\"card\">PaymentCard</SelectItem>
                    <SelectItem value=\"custom\">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor=\"amount\">Monto (ARS)</Label>
                <Input
                  id=\"amount\"
                  type=\"number\"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min=\"100\"
                  step=\"100\"
                />
              </div>

              <div>
                <Label htmlFor=\"title\">Título del Servicio</Label>
                <Input
                  id=\"title\"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor=\"description\">Descripción</Label>
              <Input
                id=\"description\"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button
              onClick={testPaymentMethods}
              variant=\"outline\"
              className=\"w-full md:w-auto\"
            >
              Probar Métodos de Pago Disponibles
            </Button>
          </CardContent>
        </Card>

        {/* Payment Components */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
          {/* Payment Button Test */}
          {testMode === 'button' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center\">
                    <CheckCircle2 className=\"mr-2 h-5 w-5 text-green-600\" />
                    PaymentButton Component
                  </CardTitle>
                </CardHeader>
                <CardContent className=\"space-y-4\">
                  <p className=\"text-sm text-gray-600\">
                    Botón de pago simple que redirige a MercadoPago Checkout Pro
                  </p>
                  
                  <div className=\"bg-gray-50 p-4 rounded-lg\">
                    <p className=\"text-sm font-medium mb-2\">Detalles del Pago:</p>
                    <ul className=\"text-sm text-gray-600 space-y-1\">
                      <li>• Monto: {paymentsService.formatAmount(amount)}</li>
                      <li>• Servicio: {title}</li>
                      <li>• ID: {serviceId}</li>
                    </ul>
                  </div>

                  <PaymentButton
                    amount={amount}
                    title={title}
                    description={description}
                    serviceId={serviceId}
                    professionalId={professionalId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    size=\"lg\"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Card Test */}
          {testMode === 'card' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className=\"lg:col-span-2 flex justify-center\"
            >
              <PaymentCard
                amount={amount}
                title={title}
                description={description}
                serviceId={serviceId}
                professionalId={professionalId}
                features={[
                  'Pago seguro con MercadoPago',
                  'Todas las tarjetas aceptadas',
                  'Cuotas sin interés disponibles',
                  'Garantía de devolución'
                ]}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </motion.div>
          )}

          {/* Custom Test */}
          {testMode === 'custom' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className=\"lg:col-span-2\"
            >
              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center\">
                    <AlertCircle className=\"mr-2 h-5 w-5 text-orange-600\" />
                    Prueba Personalizada
                  </CardTitle>
                </CardHeader>
                <CardContent className=\"space-y-4\">
                  <p className=\"text-sm text-gray-600\">
                    Prueba la integración directa con el servicio de pagos
                  </p>

                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <Button
                      onClick={async () => {
                        try {
                          const preference = await paymentsService.createPreference({
                            amount,
                            title,
                            description,
                            payerEmail: 'test@fixia.com.ar',
                            serviceId,
                            professionalId,
                          });
                          console.log('Preference created:', preference);
                          alert('Preference creada exitosamente! Ver consola.');
                        } catch (error) {
                          console.error('Error:', error);
                          alert('Error creando preference');
                        }
                      }}
                      className=\"w-full\"
                    >
                      Crear Preference
                    </Button>

                    <Button
                      onClick={testPaymentMethods}
                      variant=\"outline\"
                      className=\"w-full\"
                    >
                      Listar Métodos de Pago
                    </Button>
                  </div>

                  <div className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-4\">
                    <h4 className=\"font-medium text-yellow-800 mb-2\">Nota de Desarrollo:</h4>
                    <p className=\"text-sm text-yellow-700\">
                      Para probar pagos reales, necesitas configurar las credenciales de MercadoPago
                      en las variables de entorno del backend.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Status Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className=\"mt-8\"
        >
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                <div className=\"flex items-center space-x-2\">
                  <CheckCircle2 className=\"h-5 w-5 text-green-600\" />
                  <span className=\"text-sm\">Frontend Integrado</span>
                </div>
                <div className=\"flex items-center space-x-2\">
                  <CheckCircle2 className=\"h-5 w-5 text-green-600\" />
                  <span className=\"text-sm\">Backend Configurado</span>
                </div>
                <div className=\"flex items-center space-x-2\">
                  <AlertCircle className=\"h-5 w-5 text-orange-600\" />
                  <span className=\"text-sm\">Credenciales Pendientes</span>
                </div>
              </div>

              <div className=\"mt-4 text-sm text-gray-600\">
                <p className=\"mb-2\">
                  <strong>Próximos pasos para producción:</strong>
                </p>
                <ul className=\"list-disc list-inside space-y-1\">
                  <li>Configurar credenciales de MercadoPago en variables de entorno</li>
                  <li>Ejecutar migración de base de datos para modelos de Payment</li>
                  <li>Configurar webhook de MercadoPago para notificaciones</li>
                  <li>Probar flujo completo con credenciales de sandbox</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}