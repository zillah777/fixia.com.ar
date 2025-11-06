import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SecureInput } from "../components/SecureInput";
import { PasswordInput } from "../components/forms/PasswordInput";
import { PasswordToggleButton } from "../components/inputs/PasswordToggleButton";
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
            duration: 10000}
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
                  <Alert className="border-success/50 bg-success/10">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success/70 dark:text-success/80">
                      {welcomeMessage}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mobile-space-y">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-14 glass border-white/40 focus:border-primary/50 focus:ring-primary/30 h-11 text-base placeholder:text-muted-foreground/75"
                      maxLength={200}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 pointer-events-none z-10" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-14 pr-12 glass border-white/40 focus:border-primary/50 focus:ring-primary/30 h-11 text-base placeholder:text-muted-foreground/75"
                      required
                    />
                    <PasswordToggleButton
                      showPassword={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors inline-block"
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
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            onClick={handleResendVerification}
                            disabled={isResendingVerification}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-warning/50 text-warning hover:bg-warning/10 h-9"
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
                            className="flex-1 border-primary/50 text-primary hover:bg-primary/10 h-9"
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
                  className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg h-11 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full border-2 border-current border-t-transparent mr-2 h-4 w-4" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Únete gratis
            </Link>
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-4"
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
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