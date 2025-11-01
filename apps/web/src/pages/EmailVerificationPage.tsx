import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Shield,
  Clock,
  Send
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { authService } from "../lib/services";
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";
import { FixiaNavigation } from "../components/FixiaNavigation";

// Email verification page component for user account activation
// Force Vercel redeploy to fix 404 routing issue

interface VerificationState {
  isVerifying: boolean;
  isVerified: boolean;
  isResending: boolean;
  error: string | null;
  email: string;
  canResend: boolean;
  resendCooldown: number;
}

function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();
  const { login } = useSecureAuth();
  
  const [state, setState] = useState<VerificationState>({
    isVerifying: false,
    isVerified: false,
    isResending: false,
    error: null,
    email: searchParams.get('email') || '',
    canResend: true,
    resendCooldown: 0
  });

  // Check for verification token in URL (both query params and path params)
  useEffect(() => {
    // Try to get token from query params first
    let token = searchParams.get('token');
    
    // If not found in query params, try to extract from path
    if (!token) {
      const pathSegments = location.pathname.split('/');
      const verifyIndex = pathSegments.findIndex(segment => segment === 'verify-email');
      if (verifyIndex !== -1 && pathSegments[verifyIndex + 1]) {
        token = pathSegments[verifyIndex + 1];
      }
    }
    
    const email = searchParams.get('email');
    
    if (email) {
      setState(prev => ({ ...prev, email }));
    }
    
    if (token) {
      handleVerification(token);
    }
  }, [searchParams, location.pathname]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.resendCooldown > 0) {
      timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1,
          canResend: prev.resendCooldown <= 1
        }));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.resendCooldown]);

  const handleVerification = async (token: string) => {
    setState(prev => ({ ...prev, isVerifying: true, error: null }));
    
    try {
      await authService.verifyEmail(token);
      
      setState(prev => ({ ...prev, isVerified: true, isVerifying: false }));
      toast.success('Email verificado exitosamente', {
        description: "¡Perfecto! Ya puedes iniciar sesión con tu cuenta"
      });
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Tu cuenta ha sido verificada. Puedes iniciar sesión ahora.',
            email: state.email 
          }
        });
      }, 3000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al verificar el email';
      setState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  };

  const handleResendVerification = async () => {
    if (!state.canResend || !state.email) {
      toast.error('⏰ Espera un momento', {
        description: "Debes esperar antes de poder reenviar el email de verificación"
      });
      return;
    }

    setState(prev => ({ ...prev, isResending: true, error: null }));

    try {
      await authService.resendVerificationEmail();
      
      toast.success('📧 Email reenviado', {
        description: "Revisa tu bandeja de entrada y spam. El enlace expira en 24 horas"
      });
      
      // Start cooldown
      setState(prev => ({
        ...prev,
        isResending: false,
        canResend: false,
        resendCooldown: 60 // 60 seconds cooldown
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al reenviar el email';
      setState(prev => ({ ...prev, isResending: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return 'tu email';
    const [local, domain] = email.split('@');
    if (local.length <= 3) return email;
    const masked = local.substring(0, 2) + '*'.repeat(local.length - 3) + local.slice(-1);
    return `${masked}@${domain}`;
  };

  if (state.isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        
        <div className="flex items-center justify-center p-6 pt-24">
          {/* Background */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-success to-emerald-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative w-full max-w-md z-10">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="glass border-white/10 shadow-2xl text-center">
                <CardHeader className="pb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-4"
                  >
                    <div className="relative">
                      <div className="h-20 w-20 bg-gradient-to-r from-success to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <CheckCircle2 className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-success to-emerald-500 rounded-full blur opacity-30 animate-pulse"></div>
                    </div>
                  </motion.div>
                  
                  <CardTitle className="text-2xl text-foreground">¡Email Verificado!</CardTitle>
                  <CardDescription>
                    Tu cuenta ha sido verificada exitosamente
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center space-x-3 glass-medium rounded-lg p-3"
                    >
                      <Shield className="h-5 w-5 text-success" />
                      <span className="text-sm text-muted-foreground">
                        Cuenta verificada y segura
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center space-x-3 glass-medium rounded-lg p-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-sm text-muted-foreground">
                        Acceso completo habilitado
                      </span>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button
                      onClick={() => navigate('/login', { state: { email: state.email } })}
                      className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg group"
                    >
                      Iniciar Sesión
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>

                  <p className="text-xs text-muted-foreground">
                    Serás redirigido automáticamente en unos segundos...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      
      <div className="flex items-center justify-center p-6 pt-24">
        {/* Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative w-full max-w-md z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-white/10 shadow-2xl">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <div className="relative">
                    <div className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -inset-2 liquid-gradient rounded-2xl blur opacity-30 animate-pulse"></div>
                  </div>
                </motion.div>
                
                <CardTitle className="text-2xl text-foreground">
                  {state.isVerifying ? 'Verificando Email...' : 'Verifica tu Email'}
                </CardTitle>
                <CardDescription>
                  {state.isVerifying 
                    ? 'Procesando tu verificación, por favor espera...'
                    : 'Te hemos enviado un enlace de verificación'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {state.isVerifying ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-8 w-8  text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Verificando tu email, esto solo tomará un momento...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-medium rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Email enviado a:</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {maskEmail(state.email)}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-3 text-sm">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="text-muted-foreground">
                            Revisa tu bandeja de entrada y haz clic en el enlace de verificación
                          </span>
                        </div>
                        
                        <div className="flex items-start space-x-3 text-sm">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="text-muted-foreground">
                            Si no lo encuentras, revisa tu carpeta de spam
                          </span>
                        </div>
                        
                        <div className="flex items-start space-x-3 text-sm">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="text-muted-foreground">
                            El enlace expira en 24 horas por seguridad
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Error Display */}
                    {state.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert className="border-destructive/50 bg-destructive/10">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {/* Resend Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            ¿No recibiste el email?
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleResendVerification}
                        disabled={state.isResending || !state.canResend || !state.email}
                        variant="outline"
                        className="w-full glass border-white/20 hover:bg-white/5 transition-all duration-300"
                      >
                        {state.isResending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : state.canResend ? (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Reenviar Email
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Reenviar en {state.resendCooldown}s
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Help Section */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="glass-medium rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">¿Necesitas ayuda?</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Si sigues teniendo problemas, contacta nuestro soporte en{" "}
                        <Link 
                          to="/contact" 
                          className="text-primary hover:underline"
                        >
                          soporte@fixia.app
                        </Link>
                      </p>
                    </motion.div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-between items-center mt-6"
          >
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al login
            </Link>
            
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Ir al inicio
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Export both named and default to ensure maximum compatibility
export { EmailVerificationPage };
export default EmailVerificationPage;