import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Target, Zap, Shield, Clock, Users,
  CheckCircle, Search, Bell, Heart, TrendingUp,
  Globe, Lightbulb, Compass,
  Crown, UserPlus, ArrowRight, MapPin, Sparkles,
  MessageSquare, Phone, Mail, Gift
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { api } from "../lib/api";


interface Stats {
  totalProfessionals: number;
  activeProfessionals: number;
  totalClients: number;
  totalServices: number;
  totalUsers?: number;
  isLoading: boolean;
}

interface HeroSectionProps {
  stats: Stats;
}

function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-8 bg-primary/20 text-primary border-primary/30 px-5 py-2.5 text-base pulse-glow">
            <MapPin className="h-5 w-5 mr-2" />
            Las páginas amarillas del futuro
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
              Acerca de
            </span>{" "}
            <span className="text-gradient-rainbow inline-block">
              Fixia
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Somos las páginas amarillas del futuro, los clasificados de la nueva era digital.
            <span className="block mt-2 text-base sm:text-lg text-muted-foreground/70">
              Conectamos profesionales con clientes de manera inteligente y moderna
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 text-sm sm:text-base">
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-white/90">Chubut, Argentina</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-success" />
              </div>
              <span className="font-medium text-white/90">
                {stats.isLoading ? "Cargando..." : `+${stats.totalProfessionals} profesionales`}
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-5 w-5 text-warning" />
              </div>
              <span className="font-medium text-white/90">Sin comisiones</span>
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center float">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Nuestra Misión</h2>
            </div>
          </div>

          <Card className="glass-glow border-white/10 overflow-hidden card-hover">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-8 float">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <p className="text-xl sm:text-2xl text-muted-foreground/90 mb-8 leading-relaxed font-medium">
                  Revolucionar la forma en que las personas encuentran y contratan servicios profesionales 
                  en Chubut, creando un ecosistema digital que beneficie tanto a profesionales como a clientes.
                </p>
                <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20 glass-glow">
                  <p className="text-xl sm:text-2xl italic font-medium leading-relaxed">
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-info/20 flex items-center justify-center float">
              <Globe className="h-7 w-7 text-info" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">¿Qué es Fixia?</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
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
                <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 h-full card-hover">
                  <CardContent className="p-8 text-center">
                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 float">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-base text-muted-foreground/80 leading-relaxed">{feature.description}</p>
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center float">
              <Compass className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Nuestro Enfoque</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
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
                <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 h-full card-hover">
                  <CardContent className="p-8 text-center">
                    <div className={`h-20 w-20 bg-current/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ${approach.color} float`}>
                      <Icon className={`h-10 w-10 ${approach.color}`} />
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${approach.color}`}>{approach.title}</h3>
                    <p className="text-base text-muted-foreground/80 leading-relaxed">{approach.description}</p>
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-warning/20 flex items-center justify-center float">
              <Zap className="h-7 w-7 text-warning" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">¿Cómo Funciona?</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
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
                <Card className="glass-glow border-white/10 h-full card-hover">
                  <CardContent className="p-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold">{step.title}</h3>
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
          <Card className="glass-glow border-primary/30 bg-primary/5 card-hover">
            <CardContent className="p-10 text-center">
              <div className="h-16 w-16 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-6 float">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">Conexión Instantánea</h4>
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center float">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">¿Por Qué Elegir Fixia?</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
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
            <Card className="glass-glow border-primary/30 bg-primary/5 h-full card-hover">
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
            <Card className="glass-glow border-success/30 bg-success/5 h-full card-hover">
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center float">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Nuestros Valores</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
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
                <Card className="glass-glow hover:glass-medium transition-all duration-300 border-white/10 h-full text-center card-hover">
                  <CardContent className="p-8">
                    <div className={`h-20 w-20 bg-current/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ${value.color} float`}>
                      <Icon className={`h-10 w-10 ${value.color}`} />
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${value.color}`}>{value.title}</h3>
                    <p className="text-base text-muted-foreground/80 leading-relaxed">{value.description}</p>
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass-glow border-white/10 overflow-hidden card-hover">
            <CardContent className="p-12 text-center">
              <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-8 float">
                <Compass className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 text-foreground tracking-tight">Nuestro Compromiso</h2>
              <div className="space-y-6 text-muted-foreground/90 leading-relaxed">
                <p className="text-xl sm:text-2xl font-medium">
                  En Fixia creemos que cada profesional merece una oportunidad justa de mostrar su talento, 
                  y cada cliente merece acceso a servicios de calidad con total transparencia.
                </p>
                <p className="text-lg">
                  Somos un equipo apasionado por la tecnología y comprometido con el desarrollo económico 
                  local de Chubut. Trabajamos incansablemente para que nuestra plataforma sea la herramienta 
                  que impulse el crecimiento de profesionales y la satisfacción de clientes.
                </p>
              </div>
              <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20 mt-8 glass-glow">
                <p className="text-xl sm:text-2xl italic font-bold leading-relaxed">
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
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-glow border-white/10 overflow-hidden card-hover">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-8 float">
                  <Gift className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 text-foreground tracking-tight">
                  ¿Listo para ser parte del futuro?
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-10 font-medium leading-relaxed">
                  Únete a la revolución del marketplace local. Sin comisiones, 
                  con profesionales verificados y contacto directo.
                </p>
                
                <Badge className="bg-warning/20 text-warning border-warning/30 mb-8 px-5 py-2.5 text-base pulse-glow">
                  🎉 Promoción: Primeros 200 usuarios obtienen 2 meses gratis
                </Badge>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-xl px-10 py-7 text-lg font-semibold rounded-2xl">
                      <Users className="mr-3 h-6 w-6" />
                      Buscar Profesionales
                    </Button>
                  </Link>
                  <Link to="/register?type=professional">
                    <Button size="lg" variant="outline" className="glass-glow border-white/20 hover:glass-medium hover:scale-105 transition-all px-10 py-7 text-lg font-semibold rounded-2xl">
                      <Crown className="mr-3 h-6 w-6" />
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
  const [stats, setStats] = useState<Stats>({
    totalProfessionals: 0,
    activeProfessionals: 0,
    totalClients: 0,
    totalServices: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/public');
        setStats({
          ...response.data,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set fallback values if API fails
        setStats(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      <HeroSection stats={stats} />
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