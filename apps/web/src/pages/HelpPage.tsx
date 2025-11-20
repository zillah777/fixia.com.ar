import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Search, HelpCircle, MessageSquare, Phone,
  Mail, FileText, Users, Crown, ChevronDown, ChevronRight,
  ExternalLink, BookOpen, Play, Lightbulb, AlertCircle,
  CheckCircle, Clock, Star, Shield, CreditCard
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  popular?: boolean;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  icon: React.ComponentType<any>;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "¿Cómo funciona Fixia exactamente?",
    answer: "Fixia es un marketplace que conecta clientes con profesionales verificados. Los clientes pueden buscar servicios, revisar perfiles y contactar directamente por WhatsApp. Los profesionales pagan una suscripción mensual sin comisiones por servicios.",
    category: "general",
    popular: true
  },
  {
    id: "2",
    question: "¿Cuánto cuesta usar Fixia?",
    answer: "Para clientes es completamente gratis. Los profesionales pagan $3900 ARS/mes para acceder a todas las funciones profesionales. Los primeros 100 profesionales obtienen 1 mes gratis.",
    category: "pricing",
    popular: true
  },
  {
    id: "3",
    question: "¿Cómo verifican a los profesionales?",
    answer: "Verificamos identidad con documentos oficiales, revisamos experiencia y certificaciones, y monitoreamos reseñas y calificaciones. Los profesionales verificados reciben insignias especiales.",
    category: "verification",
    popular: true
  },
  {
    id: "4",
    question: "¿Puedo cancelar mi suscripción cuando quiera?",
    answer: "Sí, puedes cancelar tu suscripción profesional en cualquier momento sin penalizaciones. Seguirás teniendo acceso hasta el final del período pagado.",
    category: "pricing"
  },
  {
    id: "5",
    question: "¿Qué pasa si tengo un problema con un profesional?",
    answer: "Contamos con un sistema de reportes y mediación. Puedes reportar problemas desde tu perfil y nuestro equipo investigará. También tenemos un sistema de reembolsos para casos justificados.",
    category: "support"
  },
  {
    id: "6",
    question: "¿Cómo cambio de plan gratuito a profesional?",
    answer: "Ve a Configuración > Suscripción y haz clic en 'Actualizar a Profesional'. Mantienes todos tus datos y obtienes acceso inmediato a funciones premium.",
    category: "account"
  },
  {
    id: "7",
    question: "¿Puedo ofrecer servicios fuera de Chubut?",
    answer: "Actualmente Fixia opera solo en la Provincia del Chubut. Estamos evaluando expandirnos a otras provincias argentinas en el futuro.",
    category: "general"
  },
  {
    id: "8",
    question: "¿Cómo aparezco más arriba en las búsquedas?",
    answer: "Los profesionales con suscripción activa, mejores reseñas, perfiles completos y respuesta rápida aparecen primero. Mantén tu perfil actualizado y responde rápido a contactos.",
    category: "professional"
  },
  {
    id: "9",
    question: "¿Fixia cobra comisiones por mis servicios?",
    answer: "No, jamás cobramos comisiones. Solo pagas la suscripción mensual y te quedas con el 100% de tus ganancias. Esto nos diferencia de otros marketplaces.",
    category: "pricing",
    popular: true
  },
  {
    id: "10",
    question: "¿Cómo reporto un usuario problemático?",
    answer: "Puedes reportar usuarios desde su perfil o contactarnos directamente. Investigamos todos los reportes y tomamos medidas apropiadas para mantener la comunidad segura.",
    category: "support"
  }
];

const helpArticles: HelpArticle[] = [
  {
    id: "1",
    title: "Guía para nuevos clientes",
    description: "Todo lo que necesitas saber para encontrar el profesional perfecto",
    category: "getting-started",
    readTime: "5 min",
    icon: Users
  },
  {
    id: "2",
    title: "Cómo crear un perfil profesional exitoso",
    description: "Tips para destacar y atraer más clientes",
    category: "professional",
    readTime: "8 min",
    icon: Crown
  },
  {
    id: "3",
    title: "Sistema de verificación paso a paso",
    description: "Proceso completo para obtener tu insignia verificada",
    category: "verification",
    readTime: "6 min",
    icon: Shield
  },
  {
    id: "4",
    title: "Gestión de pagos y facturación",
    description: "Cómo manejar tu suscripción y métodos de pago",
    category: "billing",
    readTime: "4 min",
    icon: CreditCard
  },
  {
    id: "5",
    title: "Optimizar tu perfil para más visibilidad",
    description: "Estrategias para aparecer en los primeros resultados",
    category: "professional",
    readTime: "7 min",
    icon: Star
  },
  {
    id: "6",
    title: "Protocolo de seguridad y reportes",
    description: "Cómo mantener interacciones seguras y reportar problemas",
    category: "safety",
    readTime: "5 min",
    icon: AlertCircle
  }
];

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
            <span className="text-xs text-muted-foreground -mt-1">Centro de Ayuda</span>
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log("Searching:", searchQuery);
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />

          <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              ¿En qué podemos
            </span>{" "}
            <span className="bg-gradient-to-r from-primary-solid to-purple-400 bg-clip-text text-transparent">
              ayudarte?
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Encuentra respuestas rápidas, guías detalladas y soporte personalizado
            para sacar el máximo provecho de Fixia.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca tu pregunta... ej: ¿cómo cambio mi plan?"
                className="pl-12 pr-4 py-6 text-lg glass border-white/20"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 liquid-gradient"
              >
                Buscar
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Búsquedas populares:</span>
            <Button variant="outline" size="sm" className="glass border-white/20 h-8">
              Cambiar plan
            </Button>
            <Button variant="outline" size="sm" className="glass border-white/20 h-8">
              Verificación
            </Button>
            <Button variant="outline" size="sm" className="glass border-white/20 h-8">
              Cancelar suscripción
            </Button>
            <Button variant="outline" size="sm" className="glass border-white/20 h-8">
              Reportar problema
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function QuickHelpSection() {
  const quickActions = [
    {
      title: "Contactar Soporte",
      description: "Habla directamente con nuestro equipo",
      icon: MessageSquare,
      action: "WhatsApp",
      href: "https://wa.me/5492804874166"
    },
    {
      title: "Guías de Inicio",
      description: "Aprende a usar Fixia paso a paso",
      icon: BookOpen,
      action: "Ver Guías",
      href: "#articles"
    },
    {
      title: "Estado del Sistema",
      description: "Verifica si hay incidencias técnicas",
      icon: Clock,
      action: "Ver Estado",
      href: "/status"
    },
    {
      title: "Videos Tutoriales",
      description: "Aprende visualmente cómo usar la plataforma",
      icon: Play,
      action: "Ver Videos",
      href: "/tutorials"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Ayuda Rápida</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accede a los recursos más solicitados para resolver tu consulta al instante
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <a href={action.href} className="block">
                  <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                      <Button variant="outline" size="sm" className="glass border-white/20">
                        {action.action}
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Todas", count: faqData.length },
    { id: "general", name: "General", count: faqData.filter(f => f.category === "general").length },
    { id: "pricing", name: "Precios", count: faqData.filter(f => f.category === "pricing").length },
    { id: "professional", name: "Profesionales", count: faqData.filter(f => f.category === "professional").length },
    { id: "account", name: "Cuenta", count: faqData.filter(f => f.category === "account").length },
    { id: "support", name: "Soporte", count: faqData.filter(f => f.category === "support").length }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = faqData.filter(faq => faq.popular);

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas a las dudas más comunes sobre Fixia
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <TabsList className="glass border-white/10 p-1 flex-wrap h-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-sm whitespace-nowrap">
                    {category.name}
                    <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en FAQ..."
                  className="pl-10 glass border-white/20"
                />
              </div>
            </div>

            {/* Popular FAQs */}
            {selectedCategory === "all" && !searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="glass border-warning/30 bg-warning/5 mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center text-warning">
                      <Star className="h-5 w-5 mr-2" />
                      Preguntas Más Populares
                    </CardTitle>
                    <CardDescription>
                      Las consultas que más recibimos de nuestra comunidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {popularFAQs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="glass rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                                Popular
                              </Badge>
                              <span className="text-left">{faq.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pt-2">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* All FAQs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="glass rounded-lg px-4 border-white/10">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center space-x-2">
                          {faq.popular && (
                            <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                              Popular
                            </Badge>
                          )}
                          <span className="text-left">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pt-2">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card className="glass border-white/10 text-center py-12">
                  <CardContent>
                    <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No encontramos resultados</h3>
                    <p className="text-muted-foreground mb-6">
                      Intenta con otros términos de búsqueda o contacta a nuestro soporte
                    </p>
                    <Button className="liquid-gradient">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar Soporte
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function ArticlesSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const articleCategories = [
    { id: "all", name: "Todos los Artículos" },
    { id: "getting-started", name: "Primeros Pasos" },
    { id: "professional", name: "Para Profesionales" },
    { id: "billing", name: "Facturación" },
    { id: "safety", name: "Seguridad" },
    { id: "verification", name: "Verificación" }
  ];

  const filteredArticles = selectedCategory === "all"
    ? helpArticles
    : helpArticles.filter(article => article.category === selectedCategory);

  return (
    <section id="articles" className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Guías y Tutoriales</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Artículos detallados para ayudarte a dominar todas las funciones de Fixia
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {articleCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={selectedCategory === category.id
                  ? "liquid-gradient"
                  : "glass border-white/20 hover:glass-medium"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => {
              const Icon = article.icon;
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/help/article/${article.id}`}>
                    <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 cursor-pointer group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{article.description}</p>
                        <Button variant="outline" size="sm" className="glass border-white/20 w-full">
                          Leer Artículo
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSupportSection() {
  const contactOptions = [
    {
      title: "WhatsApp",
      description: "Respuesta inmediata para problemas urgentes",
      icon: Phone,
      time: "Inmediato",
      availability: "Lun-Vie 9-18hs",
      action: "Abrir WhatsApp",
      href: "https://wa.me/5492804874166",
      color: "success"
    },
    {
      title: "Email",
      description: "Para consultas detalladas y no urgentes",
      icon: Mail,
      time: "24-48 horas",
      availability: "24/7",
      action: "Enviar Email",
      href: "mailto:soporte@fixia.com.ar",
      color: "primary"
    },
    {
      title: "Centro de Contacto",
      description: "Formulario completo con toda tu información",
      icon: MessageSquare,
      time: "24 horas",
      availability: "Siempre disponible",
      action: "Ir al Formulario",
      href: "/contact",
      color: "secondary"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">¿Necesitas Más Ayuda?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Elige el canal que prefieras
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${option.color === 'success' ? 'bg-success/20' :
                        option.color === 'primary' ? 'bg-primary/20' : 'bg-secondary/20'
                      }`}>
                      <Icon className={`h-8 w-8 ${option.color === 'success' ? 'text-success' :
                          option.color === 'primary' ? 'text-primary' : 'text-foreground'
                        }`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                    <p className="text-muted-foreground mb-4">{option.description}</p>

                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tiempo de respuesta:</span>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {option.time}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Disponibilidad:</span>
                        <span className="text-sm">{option.availability}</span>
                      </div>
                    </div>

                    <Button
                      className={option.color === 'success' ? 'bg-success hover:bg-success/90 text-white' : 'liquid-gradient'}
                      asChild
                    >
                      <a href={option.href} target={option.href.startsWith('http') ? '_blank' : undefined}>
                        {option.action}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Card className="glass border-primary/30 bg-primary/5 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">¿No encuentras lo que buscas?</h3>
              <p className="text-muted-foreground mb-4">
                Estamos constantemente mejorando nuestra documentación.
                Tu feedback nos ayuda a crear mejores recursos.
              </p>
              <Button variant="outline" className="glass border-primary/30 text-primary">
                Sugerir Mejora
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <QuickHelpSection />
      <FAQSection />
      <ArticlesSection />
      <ContactSupportSection />
    </div>
  );
}