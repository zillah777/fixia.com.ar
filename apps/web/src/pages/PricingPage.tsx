import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Check, X, Crown, Users, Zap, Shield,
  Heart, Gift, Clock, HeadphonesIcon, CheckCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useSecureAuth } from "../context/SecureAuthContext";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { subscriptionService, SUBSCRIPTION_PLANS } from "../lib/services/subscription.service";
import { toast } from "sonner";

interface PlanFeature {
  name: string;
  free: boolean | string;
  professional: boolean | string;
  highlight?: boolean;
}

const planFeatures: PlanFeature[] = [
  {
    name: "Crear anuncios por mes",
    free: "3 anuncios",
    professional: "Ilimitados",
    highlight: true
  },
  {
    name: "Recibir propuestas de servicios",
    free: "3 propuestas",
    professional: "Ilimitadas",
    highlight: true
  },
  {
    name: "Dar feedback a profesionales",
    free: "3 feedback",
    professional: "Ilimitado",
    highlight: true
  },
  {
    name: "Búsqueda de profesionales",
    free: true,
    professional: true
  },
  {
    name: "Visualización de perfiles",
    free: true,
    professional: true
  },
  {
    name: "Acceso a WhatsApp de profesionales",
    free: "Solo después de aceptación",
    professional: "Inmediato tras solicitud",
    highlight: true
  },
  {
    name: "Crear alertas de servicios",
    free: "1 alerta activa",
    professional: "5 alertas activas",
    highlight: true
  },
  {
    name: "Soporte técnico",
    free: "Email (48-72hs)",
    professional: "WhatsApp + Email (24hs)"
  },
  {
    name: "Publicar servicios",
    free: false,
    professional: true,
    highlight: true
  },
  {
    name: "Perfil profesional verificado",
    free: false,
    professional: true,
    highlight: true
  },
  {
    name: "Insignias de reputación",
    free: false,
    professional: true
  },
  {
    name: "Portfolio y galería de trabajos",
    free: false,
    professional: true,
    highlight: true
  },
  {
    name: "Estadísticas detalladas",
    free: false,
    professional: true
  },
  {
    name: "Promoción en búsquedas",
    free: false,
    professional: true,
    highlight: true
  },
  {
    name: "Gestión de oportunidades",
    free: false,
    professional: true
  },
  {
    name: "Sin comisiones por servicios",
    free: false,
    professional: true
  }
];


function HeroSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-4 sm:mb-6 bg-success/20 text-success border-success/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Promoción: 2 meses gratis</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Planes que se Adaptan
            </span>{" "}
            <span className="bg-gradient-to-r from-primary-solid to-purple-400 bg-clip-text text-transparent">
              a Ti
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Comienza gratis como cliente o impulsa tu negocio con nuestro Plan Profesional.
            Sin comisiones, sin límites.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center whitespace-nowrap">
              <Shield className="h-4 w-4 mr-2 text-success flex-shrink-0" />
              Sin permanencia
            </div>
            <div className="flex items-center whitespace-nowrap">
              <CheckCircle className="h-4 w-4 mr-2 text-success flex-shrink-0" />
              Cancelación gratuita
            </div>
            <div className="flex items-center whitespace-nowrap">
              <Clock className="h-4 w-4 mr-2 text-success flex-shrink-0" />
              Cambio instantáneo
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCardsSection() {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleFreePlan = () => {
    if (user && user.userType === 'client') {
      toast.info('Ya tienes una cuenta gratuita como cliente');
      return;
    }
    navigate('/register');
  };

  const handleSelectPlan = async (planType: 'basic' | 'premium') => {
    if (!user) {
      toast.info('Debes iniciar sesión para suscribirte');
      navigate('/login');
      return;
    }

    // Check if user is already a professional
    if (user.userType === 'professional') {
      toast.info('Ya tienes un perfil profesional activo');
      return;
    }

    setIsProcessing(planType);
    try {
      // Create payment preference in MercadoPago
      const preference = await subscriptionService.createPaymentPreference(planType);

      // Redirect to MercadoPago checkout
      subscriptionService.redirectToCheckout(preference);
    } catch (error: any) {
      console.error('Error creating payment preference:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar el pago. Intenta nuevamente.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Plan Gratis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass border-white/10 h-full">
              <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-success mx-auto mb-2" />
                <CardTitle className="text-lg sm:text-xl">Gratis</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold mt-2">$0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Solo Cliente</div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Crear 3 anuncios por mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Recibir 3 propuestas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Dar 3 feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Búsqueda de profesionales</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>Publicar servicios</span>
                  </div>
                </div>
                {user && user.userType === 'client' ? (
                  <Button
                    disabled
                    className="w-full bg-success/50 cursor-not-allowed"
                    size="sm"
                  >
                    Plan Actual
                  </Button>
                ) : (
                  <Button onClick={handleFreePlan} className="w-full bg-success hover:bg-success/90" size="sm">
                    Comenzar Gratis
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan Profesional - RECOMENDADO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass border-primary/50 bg-primary/10 h-full relative">
              <Badge className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 text-xs sm:text-sm px-2 sm:px-3 py-1">
                RECOMENDADO
              </Badge>
              <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
                <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg sm:text-xl">Profesional</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold mt-2 text-primary">$3,900</div>
                <div className="text-xs sm:text-sm text-muted-foreground">ARS/mes</div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6">
                <div className="space-y-2 text-xs sm:text-sm">
                  {SUBSCRIPTION_PLANS.basic.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleSelectPlan('basic')}
                  disabled={isProcessing === 'basic'}
                  className="w-full liquid-gradient hover:opacity-90"
                  size="sm"
                >
                  {isProcessing === 'basic' ? 'Procesando...' : 'Seleccionar Plan Profesional'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ComparisonTableSection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Comparación Detallada</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Todas las funcionalidades lado a lado para que elijas el plan perfecto
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 sm:p-4 md:p-6 font-semibold">Funcionalidad</th>
                      <th className="text-center p-3 sm:p-4 md:p-6 font-semibold">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                          <span className="hidden sm:inline">Gratis</span>
                        </div>
                      </th>
                      <th className="text-center p-3 sm:p-4 md:p-6 font-semibold">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          <span className="hidden sm:inline">Profesional</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {planFeatures.map((feature, index) => (
                      <tr
                        key={index}
                        className={`border-b border-white/5 ${feature.highlight ? 'bg-primary/5' : ''}`}
                      >
                        <td className="p-2 sm:p-3 md:p-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className={`text-xs sm:text-sm ${feature.highlight ? 'font-medium' : ''}`}>{feature.name}</span>
                            {feature.highlight && (
                              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 md:p-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success mx-auto" />
                            ) : (
                              <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-xs sm:text-sm break-words">{feature.free}</span>
                          )}
                        </td>
                        <td className="p-2 sm:p-3 md:p-4 text-center">
                          {typeof feature.professional === 'boolean' ? (
                            feature.professional ? (
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success mx-auto" />
                            ) : (
                              <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-xs sm:text-sm font-medium break-words">{feature.professional}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer: "Sí, puedes actualizar de Plan Gratis a Profesional instantáneamente. También puedes cancelar tu suscripción profesional cuando gustes sin penalizaciones."
    },
    {
      question: "¿Cómo funciona la promoción de 2 meses gratis?",
      answer: "Los primeros 200 profesionales que se registren obtienen 2 meses completamente gratis del Plan Profesional. Después se cobra la tarifa regular de $3,900 ARS/mes."
    },
    {
      question: "¿Cobran comisiones por los servicios?",
      answer: "No, Fixia jamás cobra comisiones. Los profesionales pagan una suscripción mensual fija y se quedan con el 100% de sus ganancias."
    },
    {
      question: "¿Qué pasa si actualizo mi cuenta gratuita?",
      answer: "Al actualizar, mantienes todos tus datos y contactos. Inmediatamente obtienes acceso a todas las funciones profesionales sin perder información."
    },
    {
      question: "¿Hay permanencia mínima?",
      answer: "No hay permanencia. Puedes cancelar tu suscripción cuando quieras y seguir usando las funciones básicas gratuitas."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos transferencias bancarias, Mercado Pago, tarjetas de crédito y débito. Todos los pagos son en pesos argentinos."
    }
  ];

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Preguntas Frecuentes</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestros planes
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="glass border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-sm sm:text-base">{faq.question}</h4>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <Zap className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary mx-auto mb-4 sm:mb-6" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  ¿Listo para comenzar?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
                  Únete a cientos de profesionales y clientes que ya confían en Fixia
                  para conectar y hacer crecer sus negocios.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-success hover:bg-success/90 text-white px-6 w-full sm:w-auto">
                      <Users className="mr-2 h-5 w-5" />
                      Comenzar Gratis
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-6 w-full sm:w-auto">
                      <Crown className="mr-2 h-5 w-5" />
                      Ser Profesional
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center whitespace-nowrap">
                    <Shield className="h-4 w-4 mr-2 text-success flex-shrink-0" />
                    Sin permanencia
                  </div>
                  <div className="flex items-center whitespace-nowrap">
                    <CheckCircle className="h-4 w-4 mr-2 text-success flex-shrink-0" />
                    Cambio instantáneo
                  </div>
                  <div className="flex items-center whitespace-nowrap">
                    <HeadphonesIcon className="h-4 w-4 mr-2 text-success flex-shrink-0" />
                    Soporte incluido
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      <HeroSection />
      <PricingCardsSection />
      <ComparisonTableSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}