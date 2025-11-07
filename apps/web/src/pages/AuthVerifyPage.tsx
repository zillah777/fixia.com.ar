import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../lib/services';
import { toast } from 'sonner';
import { FixiaNavigation } from '../components/FixiaNavigation';

/**
 * AuthVerifyPage - Handles email verification from direct URL in emails
 * When user clicks email link: fixia.app/auth/verify/:token
 * This component extracts the token and calls the verification endpoint,
 * then redirects to EmailVerificationPage for user feedback
 */
function AuthVerifyPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        toast.error('Token de verificación no encontrado');
        navigate('/login');
        return;
      }

      try {
        // Call the verify endpoint with the token
        await authService.verifyEmail(token);

        // If successful, redirect to verification success page
        navigate('/verify-email?verified=true', {
          state: {
            message: 'Tu email ha sido verificado exitosamente'
          }
        });
      } catch (error: any) {
        // If verification fails, redirect to verification page with error
        const errorMessage = error.response?.data?.message || 'Error al verificar tu email';
        navigate(`/verify-email?error=true&message=${encodeURIComponent(errorMessage)}`);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // Show loading state while processing
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
              >
                <div className="text-2xl">✓</div>
              </motion.div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Verificando tu email...
              </h1>
              <p className="text-muted-foreground">
                Por favor espera mientras confirmamos tu cuenta
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AuthVerifyPage;
