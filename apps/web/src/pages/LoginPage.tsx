import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useSecureAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      // The login function in SecureAuthContext now handles success toast and invalidates queries.
      // We can redirect on success.
      navigate("/dashboard");
    } catch (error) {
      // The login function now throws an error and the api interceptor shows a detailed toast.
      // We just need to catch it to prevent the app from crashing.
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl opacity-15"
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-6 sm:mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center overflow-hidden"
                animate={{ rotateY: [0, 360, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
              >
                <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
              </motion.div>
              <motion.div
                className="absolute -inset-1 liquid-gradient rounded-2xl blur opacity-30 group-hover:opacity-50"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(var(--primary), 0.3)",
                    "0 0 40px rgba(var(--primary), 0.5)",
                    "0 0 20px rgba(var(--primary), 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            <div className="text-left">
              <motion.div
                className="text-lg sm:text-xl font-semibold text-white"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Fixia
              </motion.div>
              <div className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">Conecta. Confía. Resuelve.</div>
            </div>
          </Link>
        </motion.div>

        {/* Login Form - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="glass border-white/20 hover:border-white/30 shadow-2xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
            {/* Animated card border */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/10 to-transparent opacity-0 pointer-events-none"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <CardHeader className="text-center relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Iniciar Sesión</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Bienvenido de vuelta. Ingresa tus credenciales para continuar.
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Email Field - Enhanced */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Correo Electrónico</Label>
                  <div className="relative group">
                    <motion.div
                      animate={{ x: email ? [0, 4, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </motion.div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 glass border-white/20 hover:border-white/30 focus:border-primary/50 focus:ring-primary/30 focus:ring-2 transition-all"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Field - Enhanced */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Tu contraseña</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 glass border-white/20 hover:border-white/30 focus:border-primary/50 focus:ring-primary/30 focus:ring-2 transition-all"
                      required
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <motion.div
                          animate={{ rotate: showPassword ? 10 : -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                    <input
                      id="remember"
                      type="checkbox"
                      disabled
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Submit Button - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="pt-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 text-sm sm:text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="flex items-center"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </motion.div>
                      ) : (
                        <motion.span
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Iniciar Sesión
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Register Link - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-4 sm:mt-6"
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="relative font-medium text-primary hover:text-primary/80 transition-colors group">
              Únete gratis
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
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
  );
}