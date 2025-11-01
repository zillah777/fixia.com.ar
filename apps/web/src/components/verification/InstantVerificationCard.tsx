import React, { useState, memo } from 'react';
import { Phone, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { verificationService, VerificationType } from '../../lib/services/verification.service';

interface InstantVerificationCardProps {
  type: VerificationType.PHONE | VerificationType.EMAIL;
  title: string;
  description: string;
  isVerified: boolean;
  onSuccess: () => void;
}

export const InstantVerificationCard = memo<InstantVerificationCardProps>(({
  type,
  title,
  description,
  isVerified,
  onSuccess
}) => {
  const [step, setStep] = useState<'input' | 'verify' | 'completed'>('input');
  const [inputValue, setInputValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPhone = type === VerificationType.PHONE;

  const handleInitiate = async () => {
    if (!inputValue.trim()) {
      setError(isPhone ? 'Por favor ingresa tu número de teléfono' : 'Verifica tu email registrado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isPhone) {
        const result = await verificationService.initiatePhoneVerification(inputValue);
        setSuccessMessage(result.message);
        setStep('verify');
      } else {
        const result = await verificationService.sendEmailVerification();
        setSuccessMessage(result.message);
        setStep('verify');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al enviar verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (isPhone) {
        result = await verificationService.verifyPhone(inputValue, verificationCode);
      } else {
        result = await verificationService.verifyEmail(verificationCode);
      }

      if (result.verified) {
        setStep('completed');
        setSuccessMessage(result.message);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError('Código de verificación inválido');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('input');
    setInputValue('');
    setVerificationCode('');
    setError(null);
    setSuccessMessage(null);
  };

  const renderIcon = () => {
    if (isVerified) {
      return <CheckCircle className="h-6 w-6 text-success" />;
    }
    
    if (step === 'completed') {
      return <CheckCircle className="h-6 w-6 text-success" />;
    }

    return isPhone ? 
      <Phone className="h-6 w-6 text-primary" /> : 
      <Mail className="h-6 w-6 text-primary" />;
  };

  if (isVerified) {
    return (
      <Card className="glass border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">Verificado exitosamente</p>
            </div>
          </div>
          <Badge className="mt-4 bg-success/10 text-success">
            Verificado
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {renderIcon()}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && !error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {step === 'input' && (
          <div className="space-y-3">
            <Input
              type={isPhone ? 'tel' : 'email'}
              placeholder={isPhone ? 'Ej: +54 9 11 1234-5678' : 'tu-email@ejemplo.com'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={handleInitiate} 
              disabled={isLoading || !inputValue.trim()}
              className="w-full"
            >
              {isLoading && <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />}
              {isPhone ? 'Enviar SMS' : 'Enviar Email'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="text-sm text-muted-foreground">
              {isPhone 
                ? `Código enviado a ${inputValue}` 
                : 'Revisa tu bandeja de entrada y spam'
              }
            </div>
            <Input
              type="text"
              placeholder={isPhone ? 'Código de 6 dígitos' : 'Token de verificación'}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isLoading}
              maxLength={isPhone ? 6 : undefined}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleVerify} 
                disabled={isLoading || !verificationCode.trim()}
                className="flex-1"
              >
                {isLoading && <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />}
                Verificar
              </Button>
              <Button 
                variant="outline" 
                onClick={reset}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3"
          >
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <div>
              <h4 className="font-medium text-foreground">¡Verificación Exitosa!</h4>
              <p className="text-sm text-muted-foreground">
                Tu {isPhone ? 'teléfono' : 'email'} ha sido verificado correctamente
              </p>
            </div>
            <Badge className="bg-success/10 text-success">
              Completado
            </Badge>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});

InstantVerificationCard.displayName = 'InstantVerificationCard';