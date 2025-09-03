import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SecureInput } from "../components/SecureInput";
import { PasswordInput } from "../components/forms/PasswordInput";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useSecureAuth } from "../context/SecureAuthContext";
import { authService } from "../lib/services";
import { toast } from "sonner";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { validateEmailFormat, FormSanitizers } from "../utils/sanitization";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  
  const { login } = useSecureAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle state from navigation (from verification page or registration)
  useEffect(() => {
    const state = location.state as any;
    if (state?.email) {
      setEmail(state.email);
    }
    if (state?.message) {
      setWelcomeMessage(state.message);
      toast.success(state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    // Validate email format on submit
    if (!validateEmailFormat(email)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    setEmailVerificationError(false);
    
    try {
      // Sanitize form data before submission
      const sanitizedData = FormSanitizers.LOGIN({ email, password });
      await login(sanitizedData.email, sanitizedData.password);
      // If login succeeds, navigate to dashboard
      // Success toast is already shown in AuthContext
      navigate("/dashboard");
    } catch (error: any) {
      // Check if it's an email verification error
      const errorMessage = error.message || '';
      if (errorMessage.includes('verify your email') || 
          errorMessage.includes('verifica tu email') || 
          errorMessage.includes('not verified') || 
          errorMessage.includes('email verification required')) {
        setEmailVerificationError(true);
        toast.error(
          '📧 Email no verificado - Acción requerida',
          {
            description: `Revisa tu bandeja de entrada en ${email} o usa el botón "Reenviar Email" que aparece abajo.`,
            duration: 10000,
          }
        );
      }
      // For other errors, AuthContext already handles the toast
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Por favor ingresa tu email primero");
      return;
    }

    setIsResendingVerification(true);
    try {
      await authService.resendVerificationEmail();
      toast.success("Email de verificación reenviado. Revisa tu bandeja de entrada.");
      // Redirect to verification page
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al reenviar el email';
      toast.error(errorMessage);
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      
      <div className="flex items-center justify-center mobile-container mobile-section min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
        {/* Background */}
        <div className="fixed inset-0 bg-background -z-10">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative w-full max-w-sm sm:max-w-md z-10">

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass border-white/10 shadow-2xl mobile-card">
            <CardHeader className="text-center space-y-2 sm:space-y-3">
              <CardTitle className="mobile-text-2xl text-foreground">Iniciar Sesión</CardTitle>
              <CardDescription className="mobile-text-base">
                Bienvenido de vuelta. Ingresa tus credenciales para continuar.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Welcome Message */}
              {welcomeMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      {welcomeMessage}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mobile-space-y">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="mobile-text-base">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 h-12 touch-target text-base"
                      maxLength={200}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <PasswordInput
                    id="password"
                    label="Contraseña"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 h-12 touch-target text-base"
                    showToggle={true}
                    required
                  />
                </div>

                {/* Options */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="touch-target"
                    />
                    <Label htmlFor="remember" className="mobile-text-base text-muted-foreground">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="mobile-text-base text-primary hover:text-primary/80 transition-colors touch-target"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Email Verification Error */}
                {emailVerificationError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="border-warning/50 bg-warning/10 space-y-3">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <div className="space-y-3">
                        <AlertDescription className="text-warning-foreground">
                          <strong>Email no verificado</strong><br />
                          Necesitas verificar tu dirección de email antes de iniciar sesión.
                        </AlertDescription>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                          <Button
                            onClick={handleResendVerification}
                            disabled={isResendingVerification}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-warning/50 text-warning hover:bg-warning/10 h-10 touch-target"
                          >
                            {isResendingVerification ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reenviar Email
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => navigate(`/verify-email?email=${encodeURIComponent(email)}`)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-primary/50 text-primary hover:bg-primary/10 h-10 touch-target"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Ir a Verificación
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg h-12 touch-target text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>

                {/* Demo Credentials */}
                <div className="glass-medium mobile-card p-3 sm:p-4 mobile-space-y">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Credenciales de demostración:</p>
                  <div className="text-xs sm:text-sm text-muted-foreground mobile-space-y">
                    <p>Email: demo@fixia.com</p>
                    <p>Contraseña: cualquier_texto</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-4 sm:mt-6"
        >
          <p className="mobile-text-base text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-medium touch-target">
              Únete gratis
            </Link>
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-3 sm:mt-4"
        >
          <Link
            to="/"
            className="inline-flex items-center mobile-text-base text-muted-foreground hover:text-primary transition-colors touch-target"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>
        </div>
      </div>
    </div>
  );
}