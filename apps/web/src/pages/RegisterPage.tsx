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
  const { register: authRegister } = useSecureAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, config, show, close } = useSuccessModal();

  const handleSubmit = async (formData: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate userType is selected
      if (!formData.userType) {
        setError('Por favor selecciona un tipo de cuenta');
        setIsLoading(false);
        return;
      }

      // Format data for API
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType as 'professional' | 'client',
        birthdate: formData.birthdate,
        dni: formData.dni,
        gender: formData.gender as 'masculino' | 'femenino' | 'prefiero_no_decirlo',
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
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col overflow-hidden"
    >
      {/* Premium Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 -left-40 w-80 h-80 liquid-gradient rounded-full blur-3xl opacity-15"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header - Enhanced */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
        className="sticky top-0 z-50 w-full glass border-b border-white/10 backdrop-blur-md"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 relative z-10">
          {/* Logo - Enhanced */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <motion.div
              className="relative"
              animate={{ rotateZ: [0, 360, 0] }}
              transition={{ duration: 30, repeat: Infinity }}
            >
              <motion.div
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center overflow-hidden bg-primary/20 shadow-lg shadow-primary/20"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(var(--primary), 0.3)",
                    "0 0 30px rgba(var(--primary), 0.5)",
                    "0 0 15px rgba(var(--primary), 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <img 
                  src="/logo.png" 
                  alt="Fixia Logo" 
                  className="h-full w-full object-contain p-1"
                />
              </motion.div>
              <motion.div
                className="absolute -inset-1 liquid-gradient rounded-lg blur opacity-30 group-hover:opacity-50"
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <div className="flex flex-col min-w-0">
              <motion.span
                className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                Fixia
              </motion.span>
              <span className="text-xs text-muted-foreground -mt-0.5 group-hover:text-foreground/70 transition-colors">Conecta. Confía. Resuelve.</span>
            </div>
          </motion.div>

          {/* Login Link - Enhanced */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => navigate('/login')}
              className="relative text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿Ya tienes cuenta?{' '}
              <span className="text-primary font-semibold group relative inline-block">
                Inicia sesión
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </span>
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10"
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
        className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-8 sm:mt-12 relative z-10"
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
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
