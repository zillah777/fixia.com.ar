import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, ArrowLeft, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { authService } from "../lib/services/auth.service";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Token de restablecimiento inválido o faltante");
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (!token) return;

        setLoading(true);

        try {
            await authService.resetPassword(token, newPassword);
            setSuccess(true);
            toast.success("Contraseña restablecida exitosamente");
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error("Error al restablecer la contraseña. El enlace puede haber expirado.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-background">
                    <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
                    <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-md z-10"
                >
                    <Card className="glass border-white/10 shadow-2xl">
                        <CardContent className="pt-6 text-center space-y-6">
                            <div className="mx-auto w-16 h-16 liquid-gradient rounded-full flex items-center justify-center">
                                <Check className="h-8 w-8 text-white" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">¡Contraseña Actualizada!</h2>
                                <p className="text-muted-foreground">
                                    Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva credencial.
                                </p>
                            </div>

                            <Button
                                className="w-full liquid-gradient"
                                onClick={() => navigate("/login")}
                            >
                                Ir a Iniciar Sesión
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            {/* Background */}
            <div className="absolute inset-0 bg-background">
                <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
                <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center space-x-3 mb-6">
                        <div className="relative">
                            <div className="h-12 w-12 liquid-gradient rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">F</span>
                            </div>
                            <div className="absolute -inset-1 liquid-gradient rounded-2xl blur opacity-30"></div>
                        </div>
                        <div className="text-left">
                            <div className="text-xl font-semibold">Fixia</div>
                            <div className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</div>
                        </div>
                    </Link>
                </motion.div>

                {/* Reset Password Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Card className="glass border-white/10 shadow-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
                            <CardDescription>
                                Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="pl-10 pr-10 glass border-white/20"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-10 glass border-white/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Restableciendo...
                                        </>
                                    ) : (
                                        "Restablecer Contraseña"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Navigation Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center mt-6"
                >
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio de sesión
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
