import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { VerificationType, verificationService } from '../../lib/services/verification.service';
import { X, CheckCircle } from 'lucide-react';

interface InstantVerificationCardProps {
    type: VerificationType.PHONE | VerificationType.EMAIL;
    onClose: () => void;
    onSuccess: () => void;
}

export function InstantVerificationCard({ type, onClose, onSuccess }: InstantVerificationCardProps) {
    const [value, setValue] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isPhone = type === VerificationType.PHONE;
    const label = isPhone ? 'Teléfono' : 'Email';
    const placeholder = isPhone ? '+54 9 11 1234-5678' : 'tu@email.com';

    const handleSendCode = async () => {
        if (!value.trim()) {
            setError(`Por favor ingresa tu ${label.toLowerCase()}`);
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            if (isPhone) {
                await verificationService.sendPhoneVerification(value);
            } else {
                await verificationService.sendEmailVerification(value);
            }
            
            setCodeSent(true);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!code.trim()) {
            setError('Por favor ingresa el código');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            if (isPhone) {
                await verificationService.verifyPhone(value, code);
            } else {
                await verificationService.verifyEmail(value, code);
            }
            
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Código inválido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Verificación de {label}</CardTitle>
                        <CardDescription>
                            {codeSent 
                                ? `Ingresa el código enviado a tu ${label.toLowerCase()}`
                                : `Verificación instantánea por ${label.toLowerCase()}`
                            }
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!codeSent ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="value">{label}</Label>
                            <Input
                                id="value"
                                type={isPhone ? 'tel' : 'email'}
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button 
                            onClick={handleSendCode} 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Enviando...' : 'Enviar código'}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Código enviado</p>
                                <p className="text-sm text-muted-foreground">
                                    Revisa tu {label.toLowerCase()} e ingresa el código de 6 dígitos
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="code">Código de verificación</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={loading}
                                maxLength={6}
                            />
                        </div>
                        
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        
                        <div className="flex gap-2">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setCodeSent(false);
                                    setCode('');
                                    setError('');
                                }}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cambiar {label.toLowerCase()}
                            </Button>
                            <Button 
                                onClick={handleVerify} 
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Verificando...' : 'Verificar'}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default InstantVerificationCard;
