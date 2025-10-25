import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Search, Users, MessageSquare, Heart,
  Crown, UserPlus, FileText, Heart, Shield, Clock,
  CheckCircle, Zap, HeadphonesIcon, Heart, Phone, Mail, Bell
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { FixiaNavigation } from "../components/FixiaNavigation";


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
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
              Cómo Funciona
            </span>{" "}
            <span className="text-gradient-rainbow inline-block">
              Fixia
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Simple, seguro y transparente.
            <span className="block mt-2 text-base sm:text-lg text-muted-foreground/70">
              Conectamos clientes con profesionales verificados en 4 pasos sencillos.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ClientProcessSection() {
  const steps = [
    {
      step: "Paso 1",
      title: "Busca el Servicio",
      description: "Explora categorías o usa nuestra búsqueda inteligente para encontrar exactamente lo que necesitas.",
      icon: Search,
      color: "text-primary"
    },
    {
      step: "Paso 2", 
      title: "Elige tu Profesional",
      description: "Compara perfiles, lee reseñas y selecciona al Profesional perfecto  que se adecue a tu necesidad.",
      icon: Users,
      color: "text-success"
    },
    {
      step: "Paso 3",
      title: "Conecta y Acuerda", 
      description: "Chatea directamente, define detalles del trabajo y acuerda términos transparentes.",
      icon: MessageSquare,
      color: "text-warning"
    },
    {
      step: "Paso 4",
      title: "Evalúa la Experiencia",
      description: "Recibe tu servicio completado, califica al profesional y contribuye a la comunidad de confianza.",
      icon: Heart,
      color: "text-purple-400"
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
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center">
              <UserPlus className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Para Clientes</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Encuentra y contrata profesionales verificados en 4 pasos simples
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 h-full card-hover group">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className={`h-16 w-16 bg-current/10 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color} group-hover:scale-110 transition-transform float`}>
                        <Icon className={`h-8 w-8 ${step.color}`} />
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 text-sm font-semibold">
                          {step.step}
                        </Badge>
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground/80 leading-relaxed text-base">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/register">
            <Button size="lg" className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50 px-10 py-6 text-lg font-semibold rounded-2xl group">
              <UserPlus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              Comenzar Ahora
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ProfessionalProcessSection() {
  const steps = [
    {
      step: "Paso 1",
      title: "Crea tu Perfil Profesional",
      description: "Regístrate como Agente de Servicios, completa tu información y verifica tus credenciales.",
      icon: Crown,
      color: "text-primary"
    },
    {
      step: "Paso 2",
      title: "Destaca tus Servicios", 
      description: "Publica tus especialidades, establece precios y muestra tu portafolio de trabajos.",
      icon: FileText,
      color: "text-success"
    },
    {
      step: "Paso 3",
      title: "Recibe Solicitudes",
      description: "Los clientes te encontrarán y contactarán para trabajos y tareas que coincidan con tu expertise.",
      icon: Bell,
      color: "text-warning"
    },
    {
      step: "Paso 4", 
      title: "Construye Reputación",
      description: "Completa el trabajo, recibe reseñas positivas y construye tu reputación profesional verificada.",
      icon: Heart,
      color: "text-purple-400"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-primary/5">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Crown className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">Para Profesionales</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Únete como Profesional y haz crecer tu negocio
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 h-full card-hover group">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className={`h-16 w-16 bg-current/10 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color} group-hover:scale-110 transition-transform float`}>
                        <Icon className={`h-8 w-8 ${step.color}`} />
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 text-sm font-semibold">
                          {step.step}
                        </Badge>
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground/80 leading-relaxed text-base">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/register?type=professional">
            <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-6">
              <Crown className="mr-2 h-5 w-5" />
              Ser Profesional - $4500/mes
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function WhyChooseFixiaSection() {
  const benefits = [
    {
      icon: Shield,
      title: "Verificación Total",
      description: "Todos los Profesionales pasan por un proceso de verificación riguroso para garantizar calidad y confianza.",
      color: "text-success"
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte 24/7", 
      description: "Nuestro equipo está disponible para ayudarte en cualquier momento durante el proceso.",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "Red de Confianza",
      description: "Sistema de reseñas bidireccional que construye una comunidad basada en confianza mutua y transparencia.",
      color: "text-warning"
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
          <h2 className="text-4xl font-bold mb-4 text-foreground">¿Por qué elegir Fixia?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La plataforma más confiable para servicios profesionales en Chubut
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full text-center">
                  <CardContent className="p-8">
                    <div className={`h-20 w-20 bg-current/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ${benefit.color}`}>
                      <Icon className={`h-10 w-10 ${benefit.color}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-4 ${benefit.color}`}>{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
                <h2 className="text-4xl font-bold mb-6 text-foreground">
                  ¿Listo para comenzar?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Únete a Fixia hoy y descubre la forma más fácil de conectar con profesionales 
                  o hacer crecer tu negocio de servicios.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-6">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Buscar Profesionales
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-6">
                      <Crown className="mr-2 h-5 w-5" />
                      Ser Profesional
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-success" />
                    Sin comisiones
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-success" />
                    Profesionales verificados
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-success" />
                    Soporte 24/7
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

function ContactSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h3 className="text-2xl font-bold mb-6 text-foreground">¿Tienes preguntas?</h3>
          <p className="text-muted-foreground mb-8">
            Nuestro equipo está aquí para ayudarte en cada paso del proceso
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:soporte@fixia.app">
              <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                <Mail className="mr-2 h-4 w-4" />
                soporte@fixia.app
              </Button>
            </a>
            <a href="tel:+542804567890">
              <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                <Phone className="mr-2 h-4 w-4" />
                +54 280 4567890
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      <HeroSection />
      <ClientProcessSection />
      <ProfessionalProcessSection />
      <WhyChooseFixiaSection />
      <CTASection />
      <ContactSection />
    </div>
  );
}