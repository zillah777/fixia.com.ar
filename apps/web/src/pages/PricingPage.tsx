import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Check, X, Crown, Users, Zap, Shield,
  Star, MessageSquare, Bell, Phone, Mail, Gift,
  TrendingUp, Award, Clock, HeadphonesIcon, Search,
  FileText, ChevronRight, AlertCircle, CheckCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useSecureAuth as useAuth } from "../context/SecureAuthContext";
import { PublicPageLayout } from "../components/layouts/PublicPageLayout";

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
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleFreePlan = () => {
    navigate('/register');
  };

  const handleProfessionalPlan = () => {
    if (user) {
      // Si ya está logueado, mostrar proceso de upgrade
      navigate('/profile?upgrade=professional');
    } else {
      // Si no está logueado, redirigir a registro profesional
      navigate('/register?type=professional');
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;

    setIsUpgrading(true);
    try {
      // Simular proceso de upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));

      // En implementación real, aquí se haría la llamada a la API
      // await updateUserPlan(user.id, 'professional');

      navigate('/profile?upgraded=true');
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan Gratis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-white/10 h-full relative">
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Users className="h-8 w-8 text-success" />
                  <CardTitle className="text-2xl">Plan Gratis</CardTitle>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">$0</div>
                  <div className="text-muted-foreground">Para siempre</div>
                </div>
                <p className="text-muted-foreground">
                  Perfecto para clientes que buscan profesionales ocasionalmente
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Publicar 3 solicitudes de servicios por mes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Reseñas a profesionales</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>3 solicitudes de contacto/mes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Alertas de servicio activa</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Soporte por email</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-50">
                    <X className="h-5 w-5 text-muted-foreground" />
                    <span>Perfil profesional</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-50">
                    <X className="h-5 w-5 text-muted-foreground" />
                    <span>Publicar servicios</span>
                  </div>
                </div>

                <Button
                  onClick={handleFreePlan}
                  className="w-full bg-success hover:bg-success/90 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Comenzar Gratis
                </Button>

                {user && user.accountType === 'client' && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">¿Quieres ofrecer servicios?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProfessionalPlan}
                      className="glass border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Actualizar a Profesional
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan Profesional */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="glass border-primary/30 bg-primary/5 h-full relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary/20 text-primary border-primary/50">
                  Recomendado
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Crown className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl">Plan Profesional</CardTitle>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">$3.900</div>
                  <div className="text-muted-foreground">ARS / mes</div>
                </div>
                <p className="text-muted-foreground">
                  Para profesionales que quieren hacer crecer su negocio
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-primary/50 bg-primary/10">
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    <strong>¡Oferta de lanzamiento!</strong> Los primeros 200 profesionales obtienen 1 mes completamente gratis.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Todo lo incluido en Plan Gratis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span className="font-medium">Contactos ilimitados por mes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span className="font-medium">Publicar servicios profesionales</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span className="font-medium">Perfil verificado con insignias</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Portfolio y galería de trabajos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Alertas de servicios activas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Estadísticas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Promoción en búsquedas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span className="font-medium">Algoritmo prioritario en búsquedas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success" />
                    <span>Soporte WhatsApp + Email 24hs</span>
                  </div>
                </div>

                {user && user.accountType === 'client' ? (
                  <Button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Actualizar mi Cuenta
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleProfessionalPlan}
                    className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Ser Profesional
                  </Button>
                )}
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
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
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
                              <Star className="h-4 w-4 text-warning" />
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
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
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
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
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
                    <Button size="lg" className="bg-success hover:bg-success/90 text-white px-8">
                      <Users className="mr-2 h-5 w-5" />
                      Comenzar Gratis
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-8">
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
    <PublicPageLayout>
      <HeroSection />
      <PricingCardsSection />
      <ComparisonTableSection />
      <FAQSection />
      <CTASection />
    </PublicPageLayout>
  );
}