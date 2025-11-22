import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSecureAuth } from '../context/SecureAuthContext';
import { RegistrationWizard, type RegistrationFormData } from '../components/auth/RegistrationWizard';
import { useSuccessModal, SuccessModal } from '../components/modals/SuccessModal';
import { toast } from 'sonner';

/**
 * RegisterPage - New ELITE version using RegistrationWizard
 * Progressive disclosure for better UX and reduced abandonment
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, config, show, close } = useSuccessModal();

  const handleSubmit = async (formData: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Format data for API
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        ...(formData.userType === 'professional' && {
          businessName: formData.businessName,
          serviceCategories: formData.serviceCategories,
          description: formData.description,
          experience: formData.experience,
        }),
        agreeTerms: formData.agreeTerms,
        agreePrivacy: formData.agreePrivacy,
        agreeMarketing: formData.agreeMarketing,
      };

      // Call API to register
      const response = await authRegister(registrationData);

      if (response.success) {
        // Show success modal
        show({
          title: '¡Bienvenido a Fixia!',
          description: formData.userType === 'professional'
            ? 'Tu cuenta de profesional ha sido creada. Verifica tu email para continuar.'
            : 'Tu cuenta ha sido creada exitosamente. ¡Listo para encontrar profesionales!',
          actions: [
            {
              label: formData.userType === 'professional'
                ? 'Ir a Mi Perfil'
                : 'Explorar Profesionales',
              onClick: () => {
                close();
                navigate(formData.userType === 'professional' ? '/profile' : '/services');
              },
              primary: true,
            },
          ],
          showConfetti: true,
        });

        // Analytics
        console.log('User registered:', { userType: formData.userType, email: formData.email });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error durante el registro';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full glass border-b border-white/10 backdrop-blur-md"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-primary/20">
                <span className="font-bold text-primary">F</span>
              </div>
              <div className="absolute -inset-1 liquid-gradient rounded-lg blur opacity-30"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Fixia</span>
              <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
            </div>
          </motion.div>

          {/* Login Link */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿Ya tienes cuenta?{' '}
              <span className="text-primary font-semibold hover:underline">Inicia sesión</span>
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 w-full max-w-6xl mx-auto"
      >
        <RegistrationWizard
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error || undefined}
        />
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-12"
      >
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div className="space-y-2">
              <h4 className="font-semibold">Sobre Fixia</h4>
              <p className="text-sm text-muted-foreground">
                Plataforma de servicios confiable que conecta clientes con profesionales verificados.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <h4 className="font-semibold">Enlaces</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Comunidad
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-2">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground border-t border-border/40 pt-8">
            <p>© 2025 Fixia. Todos los derechos reservados.</p>
          </div>
        </div>
      </motion.footer>

      {/* Success Modal */}
      {isOpen && config && <SuccessModal {...config} />}
    </motion.div>
  );
}
