import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { paymentsService, CreatePreferenceDto } from '../../lib/services/payments.service';

interface PaymentButtonProps {
  amount: number;
  title: string;
  description: string;
  serviceId?: string;
  jobId?: string;
  professionalId?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export function PaymentButton({
  amount,
  title,
  description,
  serviceId,
  jobId,
  professionalId,
  onSuccess,
  onError,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handlePayment = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      setPaymentStatus('processing');

      // Get user email from auth context or localStorage
      const userEmail = getUserEmail(); // You'll need to implement this
      
      if (!userEmail) {
        throw new Error('Email de usuario requerido para procesar el pago');
      }

      const preferenceData: CreatePreferenceDto = {
        amount,
        title,
        description,
        payerEmail: userEmail,
        serviceId,
        jobId,
        professionalId,
        successUrl: `${window.location.origin}/payments/success`,
        failureUrl: `${window.location.origin}/payments/failure`,
        pendingUrl: `${window.location.origin}/payments/pending`,
      };

      // Validate payment data
      const validationErrors = paymentsService.validatePreferenceData(preferenceData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Create payment preference
      const preference = await paymentsService.createPreference(preferenceData);
      
      // Redirect to MercadoPago checkout
      if (preference.initPoint) {
        // Save payment context for when user returns
        localStorage.setItem('fixia_payment_context', JSON.stringify({
          preferenceId: preference.id,
          serviceId,
          jobId,
          professionalId,
          amount,
          title,
        }));

        // Redirect to MercadoPago
        window.location.href = preference.initPoint;
      } else {
        throw new Error('No se pudo generar el enlace de pago');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
      
      setPaymentStatus('error');
      toast({
        title: 'Error en el pago',
        description: errorMessage,
        variant: 'destructive',
      });
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserEmail = (): string | null => {
    // Get from auth context or localStorage
    // This is a placeholder - implement based on your auth system
    const userStr = localStorage.getItem('fixia_user_basic');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email;
      } catch {
        return null;
      }
    }
    return null;
  };

  const getButtonText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Procesando...';
      case 'success':
        return 'Pago Exitoso';
      case 'error':
        return 'Reintentar Pago';
      default:
        return `Pagar ${paymentsService.formatAmount(amount)}`;
    }
  };

  const getButtonIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className=\"h-4 w-4 animate-spin\" />;
      case 'success':
        return <CheckCircle className=\"h-4 w-4\" />;
      case 'error':
        return <XCircle className=\"h-4 w-4\" />;
      default:
        return <CreditCard className=\"h-4 w-4\" />;
    }
  };

  const getButtonVariant = () => {
    if (paymentStatus === 'success') return 'default';
    if (paymentStatus === 'error') return 'destructive';
    return variant;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading || paymentStatus === 'success'}
        variant={getButtonVariant()}
        size={size}
        className=\"w-full font-semibold\"
      >
        {getButtonIcon()}
        <span className=\"ml-2\">{getButtonText()}</span>
      </Button>
    </motion.div>
  );
}

interface PaymentCardProps {
  amount: number;
  title: string;
  description: string;
  serviceId?: string;
  jobId?: string;
  professionalId?: string;
  features?: string[];
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PaymentCard({
  amount,
  title,
  description,
  serviceId,
  jobId,
  professionalId,
  features = [],
  onSuccess,
  onError,
  className,
}: PaymentCardProps) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className=\"text-center\">{title}</CardTitle>
        <div className=\"text-center\">
          <div className=\"text-3xl font-bold text-primary\">
            {paymentsService.formatAmount(amount)}
          </div>
          <Badge variant=\"secondary\" className=\"mt-2\">
            Pago seguro con MercadoPago
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className=\"space-y-4\">
        <p className=\"text-sm text-muted-foreground text-center\">
          {description}
        </p>
        
        {features.length > 0 && (
          <div className=\"space-y-2\">
            <h4 className=\"font-medium text-sm\">Incluye:</h4>
            <ul className=\"space-y-1\">
              {features.map((feature, index) => (
                <li key={index} className=\"text-sm text-muted-foreground flex items-center\">
                  <CheckCircle className=\"h-3 w-3 text-green-500 mr-2 flex-shrink-0\" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <PaymentButton
          amount={amount}
          title={title}
          description={description}
          serviceId={serviceId}
          jobId={jobId}
          professionalId={professionalId}
          onSuccess={onSuccess}
          onError={onError}
          size=\"lg\"
        />
        
        <div className=\"text-xs text-muted-foreground text-center\">
          <p>🔒 Transacción segura y encriptada</p>
          <p>💳 Aceptamos todas las tarjetas</p>
        </div>
      </CardContent>
    </Card>
  );
}