import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Target, Zap, Shield, Clock, Users, 
  CheckCircle, Search, Bell, Star, TrendingUp,
  Globe, Heart, Award, Lightbulb, Compass, 
  Crown, UserPlus, ArrowRight, MapPin, Sparkles,
  MessageSquare, Phone, Mail, Gift
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" /></div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
          </div>
        </Link>
        
        <Link to="/">
          <Button variant="ghost" className="hover:glass-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}

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
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
            <MapPin className="h-4 w-4 mr-2" />
            Las páginas amarillas del futuro
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Acerca de
            </span>{" "}
            <span className="bg-gradient-to-r from-primary-solid to-purple-400 bg-clip-text text-transparent">
              Fixia
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Somos las páginas amarillas del futuro, los clasificados de la nueva era digital. 
            Conectamos profesionales con clientes de manera inteligente y moderna.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Chubut, Argentina
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-success" />
              +500 profesionales
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-warning" />
              Sin comisiones
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nuestra Misión</h2>
            <div className="w-24 h-1 liquid-gradient mx-auto mb-6"></div>
          </div>

          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <Target className="h-16 w-16 text-primary mx-auto mb-6" />
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Revolucionar la forma en que las personas encuentran y contratan servicios profesionales 
                  en Chubut, creando un ecosistema digital que beneficie tanto a profesionales como a clientes.
                </p>
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-lg italic">
                    "Somos el puente que conecta talento con necesidad, facilitando encuentros 
                    que generan valor y confianza en nuestra comunidad."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function WhatIsFixiaSection() {
  const features = [
    {
      icon: Globe,
      title: "Las páginas amarillas del futuro",
      description: "Un directorio inteligente y moderno"
    },
    {
      icon: Search,
      title: "Un buscador inteligente de servicios",
      description: "Encuentra exactamente lo que necesitas"
    },
    {
      icon: Users,
      title: "Un sistema de matchmaking profesional",
      description: "Conectamos talento con necesidad"
    },
    {
      icon: Shield,
      title: "Un puente entre oferentes y demandantes",
      description: "Facilitamos conexiones de valor"
    },
    {
      icon: Zap,
      title: "El 'Uber' de los servicios profesionales",
      description: "Velocidad y conveniencia en cada solicitud"
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
          <h2 className="text-4xl font-bold mb-4">¿Qué es Fixia?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Somos mucho más que una simple plataforma de servicios
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
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

function ApproachSection() {
  const approaches = [
    {
      icon: Zap,
      title: "Simplicidad",
      description: "Encontrar un profesional debe ser tan fácil como pedir un taxi.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Confianza",
      description: "Verificamos identidades y fomentamos un sistema de reseñas transparente.",
      color: "text-success"
    },
    {
      icon: Clock,
      title: "Velocidad",
      description: "Los clientes llegan a ti mil veces más rápido que en métodos tradicionales.",
      color: "text-warning"
    },
    {
      icon: Heart,
      title: "Justicia",
      description: "No cobramos comisiones. El dinero va directamente al profesional.",
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
          <h2 className="text-4xl font-bold mb-4">Nuestro Enfoque</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cuatro pilares fundamentales que guían todo lo que hacemos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approaches.map((approach, index) => {
            const Icon = approach.icon;
            return (
              <motion.div
                key={approach.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`h-16 w-16 bg-current/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ${approach.color}`}>
                      <Icon className={`h-8 w-8 ${approach.color}`} />
                    </div>
                    <h3 className={`font-semibold mb-3 ${approach.color}`}>{approach.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{approach.description}</p>
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

function HowItWorksSection() {
  const steps = [
    {
      title: "Para Profesionales (AS)",
      description: "Registrate, verifica tu identidad, crea tu perfil profesional y recibe solicitudes de clientes automáticamente.",
      icon: Crown,
      features: [
        "Registro y verificación",
        "Perfil profesional completo",
        "Solicitudes automáticas",
        "Sistema de reputación"
      ]
    },
    {
      title: "Para Clientes (Exploradores)",
      description: "Busca el servicio que necesitas, compara profesionales verificados y contrata directamente con quien más te convenga.",
      icon: Search,
      features: [
        "Búsqueda inteligente",
        "Comparación transparente",
        "Profesionales verificados",
        "Contratación directa"
      ]
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
          <h2 className="text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un proceso simple y eficiente para cada tipo de usuario
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 * index }}
              >
                <Card className="glass border-white/10 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>
                    <div className="space-y-2">
                      {step.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
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
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Conexión Instantánea</h4>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nuestro algoritmo inteligente conecta automáticamente la demanda con la oferta más adecuada 
                en tiempo real, optimizando cada match para el beneficio de ambas partes.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function WhyChooseFixiaSection() {
  const professionalBenefits = [
    "Sin comisiones sobre tus servicios",
    "Mayor visibilidad que Facebook o clasificados tradicionales",
    "Sistema de verificación que genera confianza",
    "Herramientas profesionales de gestión",
    "Ranking que premia la calidad"
  ];

  const clientBenefits = [
    "Profesionales verificados y calificados",
    "Comparación transparente de servicios",
    "Sistema de reseñas confiable",
    "Búsqueda inteligente por ubicación",
    "Chat directo con profesionales"
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
          <h2 className="text-4xl font-bold mb-4">¿Por Qué Elegir Fixia?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beneficios únicos para profesionales y clientes
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-primary/30 bg-primary/5 h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <span>Para Profesionales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {professionalBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass border-success/30 bg-success/5 h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <UserPlus className="h-6 w-6 text-success" />
                  <span>Para Clientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clientBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    {
      icon: Shield,
      title: "Confianza",
      description: "Construimos relaciones basadas en transparencia y verificación",
      color: "text-success"
    },
    {
      icon: Lightbulb,
      title: "Innovación",
      description: "Utilizamos tecnología de vanguardia para conectar personas",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "Precisión",
      description: "Conectamos exactamente lo que necesitas con quien lo puede hacer",
      color: "text-warning"
    },
    {
      icon: TrendingUp,
      title: "Crecimiento",
      description: "Apoyamos el crecimiento de profesionales y empresas locales",
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
          <h2 className="text-4xl font-bold mb-4">Nuestros Valores</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Los principios que nos definen y nos impulsan cada día
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full text-center">
                  <CardContent className="p-6">
                    <div className={`h-16 w-16 bg-current/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ${value.color}`}>
                      <Icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <h3 className={`font-semibold mb-3 ${value.color}`}>{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
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

function CommitmentSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-12 text-center">
              <Compass className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Nuestro Compromiso</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  En Fixia creemos que cada profesional merece una oportunidad justa de mostrar su talento, 
                  y cada cliente merece acceso a servicios de calidad con total transparencia.
                </p>
                <p>
                  Somos un equipo apasionado por la tecnología y comprometido con el desarrollo económico 
                  local de Chubut. Trabajamos incansablemente para que nuestra plataforma sea la herramienta 
                  que impulse el crecimiento de profesionales y la satisfacción de clientes.
                </p>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mt-8">
                <p className="text-xl italic font-medium">
                  "No somos solo una app, somos el futuro de cómo las personas se conectan para crear valor juntas"
                </p>
                <p className="text-sm text-muted-foreground mt-3">- Equipo Fixia</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                <Gift className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-4xl font-bold mb-6">
                  ¿Listo para ser parte del futuro?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Únete a la revolución del marketplace local. Sin comisiones, 
                  con profesionales verificados y contacto directo.
                </p>
                
                <Badge className="bg-warning/20 text-warning border-warning/30 mb-6">
                  🎉 Promoción: Primeros 200 usuarios obtienen 2 meses gratis
                </Badge>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-8">
                      <Users className="mr-2 h-5 w-5" />
                      Buscar Profesionales
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8">
                      <Crown className="mr-2 h-5 w-5" />
                      Ser Profesional
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
                  <span>✨ Sin comisiones</span>
                  <span>🛡️ Profesionales verificados</span>
                  <span>📱 Contacto directo WhatsApp</span>
                  <span>🎯 Matchmaking inteligente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <MissionSection />
      <WhatIsFixiaSection />
      <ApproachSection />
      <HowItWorksSection />
      <WhyChooseFixiaSection />
      <ValuesSection />
      <CommitmentSection />
      <CTASection />
    </div>
  );
}