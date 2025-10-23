import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Check, X, Crown, Users, Zap, Shield,
  Heart, MessageSquare, Bell, Phone, Mail, Gift,
  TrendingUp, Clock, HeadphonesIcon, Search,
  FileText, ChevronRight, AlertCircle, CheckCircle, Rocket, Building2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
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
    name: "Solicitudes de contacto por mes",
    free: "3 profesionales",
    professional: "Ilimitadas",
    highlight: true
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
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-6 bg-success/20 text-success border-success/30 px-4 py-2">
            <Gift className="h-4 w-4 mr-2" />
            Promoción: 2 meses gratis para primeros 200 profesionales
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Planes que se Adaptan
            </span>{" "}
            <span className="bg-gradient-to-r from-primary-solid to-purple-400 bg-clip-text text-transparent">
              a Ti
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Comienza gratis como cliente o impulsa tu negocio con nuestro Plan Profesional. 
            Sin comisiones, sin límites.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-success" />
              Sin permanencia
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-success" />
              Cancelación gratuita
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-success" />
              Cambio de plan instantáneo
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
      console.log('Creating payment preference for plan:', planType);
      const preference = await subscriptionService.createPaymentPreference(planType);

      console.log('✅ Preference received from backend:', preference);
      console.log('Init point:', preference.init_point);
      console.log('Sandbox init point:', preference.sandbox_init_point);

      // Redirect to MercadoPago checkout
      subscriptionService.redirectToCheckout(preference);
    } catch (error: any) {
      console.error('❌ Error creating payment preference:', error);
      console.error('Error response:', error.response?.data);
      console.error('Full error:', JSON.stringify(error, null, 2));
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar el pago. Intenta nuevamente.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Plan Gratis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass border-white/10 h-full">
              <CardHeader className="text-center pb-4">
                <Users className="h-10 w-10 text-success mx-auto mb-2" />
                <CardTitle className="text-xl">Gratis</CardTitle>
                <div className="text-3xl font-bold mt-2">$0</div>
                <div className="text-sm text-muted-foreground">Solo Cliente</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Crear proyectos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Contratar servicios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Dar feedback</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>Publicar servicios</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>Perfil profesional</span>
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

          {/* Plan Basic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass border-blue-500/30 bg-blue-500/5 h-full">
              <CardHeader className="text-center pb-4">
                <Zap className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                <CardTitle className="text-xl">Basic</CardTitle>
                <div className="text-3xl font-bold mt-2 text-blue-400">$2,999</div>
                <div className="text-sm text-muted-foreground">ARS/mes</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isProcessing === 'basic' ? 'Procesando...' : 'Seleccionar Basic'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan Premium - RECOMENDADO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass border-primary/50 bg-primary/10 h-full relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0">
                RECOMENDADO
              </Badge>
              <CardHeader className="text-center pb-4 pt-6">
                <Crown className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-xl">Premium</CardTitle>
                <div className="text-3xl font-bold mt-2 text-primary">$5,999</div>
                <div className="text-sm text-muted-foreground">ARS/mes</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {SUBSCRIPTION_PLANS.premium.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleSelectPlan('premium')}
                  disabled={isProcessing === 'premium'}
                  className="w-full liquid-gradient hover:opacity-90"
                  size="sm"
                >
                  {isProcessing === 'premium' ? 'Procesando...' : 'Seleccionar Premium'}
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
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Comparación Detallada</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-6 font-semibold">Funcionalidad</th>
                      <th className="text-center p-6 font-semibold">
                        <div className="flex items-center justify-center space-x-2">
                          <Users className="h-5 w-5 text-success" />
                          <span>Gratis</span>
                        </div>
                      </th>
                      <th className="text-center p-6 font-semibold">
                        <div className="flex items-center justify-center space-x-2">
                          <Crown className="h-5 w-5 text-primary" />
                          <span>Profesional</span>
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
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={feature.highlight ? 'font-medium' : ''}>{feature.name}</span>
                            {feature.highlight && (
                              <Heart className="h-4 w-4 text-warning" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="h-5 w-5 text-success mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.free}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.professional === 'boolean' ? (
                            feature.professional ? (
                              <Check className="h-5 w-5 text-success mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.professional}</span>
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
      answer: "Los primeros 200 profesionales que se registren obtienen 2 meses completamente gratis del Plan Profesional. Después se cobra la tarifa regular de $4500 ARS/mes."
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
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestros planes
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="glass border-white/10">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3 text-primary">{faq.question}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-4xl font-bold mb-6">
                  ¿Listo para comenzar?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Únete a cientos de profesionales y clientes que ya confían en Fixia 
                  para conectar y hacer crecer sus negocios.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-success hover:bg-success/90 text-white px-6">
                      <Users className="mr-2 h-5 w-5" />
                      Comenzar Gratis
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-6">
                      <Crown className="mr-2 h-5 w-5" />
                      Ser Profesional
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-success" />
                    Sin permanencia
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-success" />
                    Cambio instantáneo
                  </div>
                  <div className="flex items-center">
                    <HeadphonesIcon className="h-4 w-4 mr-2 text-success" />
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