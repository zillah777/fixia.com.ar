import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, HelpCircle, MessageSquare, Phone, 
  Mail, FileText, Users, Crown, ChevronDown, ChevronRight,
  ExternalLink, BookOpen, Play, Lightbulb, AlertCircle,
  CheckCircle, Clock, Heart, Shield, CreditCard
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FixiaNavigation } from "../components/FixiaNavigation";

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
    answer: "Para clientes es completamente gratis. Los profesionales pagan $3,900 ARS/mes para acceder a todas las funciones profesionales. Los primeros 200 profesionales obtienen 2 meses gratis.",
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
    question: "¿Cómo publico mi primer servicio?",
    answer: "Una vez registrado como profesional, ve a 'Mis Servicios' > 'Nuevo Servicio'. Completa título, descripción, precio y fotos. Tu servicio será revisado y publicado en 24 horas.",
    category: "services"
  }
];

const helpArticles: HelpArticle[] = [
  {
    id: "1",
    title: "Guía para nuevos usuarios",
    description: "Todo lo que necesitas saber para comenzar en Fixia",
    category: "getting-started",
    readTime: "5 min",
    icon: BookOpen
  },
  {
    id: "2",
    title: "Cómo contactar profesionales",
    description: "Aprende a comunicarte efectivamente con los profesionales",
    category: "clients",
    readTime: "3 min",
    icon: MessageSquare
  },
  {
    id: "3",
    title: "Crear un perfil profesional atractivo",
    description: "Tips para destacar tu perfil y conseguir más clientes",
    category: "professionals",
    readTime: "7 min",
    icon: Crown
  },
  {
    id: "4",
    title: "Sistema de verificación",
    description: "Cómo obtener la verificación y qué beneficios tiene",
    category: "verification",
    readTime: "4 min",
    icon: Shield
  },
  {
    id: "5",
    title: "Gestión de pagos y facturación",
    description: "Todo sobre suscripciones, pagos y facturación",
    category: "billing",
    readTime: "6 min",
    icon: CreditCard
  },
  {
    id: "6",
    title: "Políticas y términos de servicio",
    description: "Conoce nuestras políticas y términos de uso",
    category: "policies",
    readTime: "8 min",
    icon: FileText
  }
];

const supportOptions = [
  {
    title: "Centro de Mensajes",
    description: "Chatea con nuestro equipo de soporte",
    icon: MessageSquare,
    action: "Abrir Chat",
    available: "24/7"
  },
  {
    title: "Llamada Telefónica",
    description: "Habla directamente con un representante",
    icon: Phone,
    action: "Llamar Ahora",
    available: "Lun-Vie 9-18hs"
  },
  {
    title: "Email de Soporte",
    description: "Envía tu consulta detallada por email",
    icon: Mail,
    action: "Enviar Email",
    available: "Respuesta en 24hs"
  }
];

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="h-24 w-24 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-8 float">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
              ¿En qué podemos
            </span>{" "}
            <span className="text-gradient-rainbow inline-block">
              ayudarte?
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Encuentra respuestas rápidas a tus preguntas.
            <span className="block mt-2 text-base sm:text-lg text-muted-foreground/70">
              Nuestro centro de ayuda está disponible 24/7 para ti
            </span>
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-7 text-lg glass-glow border-white/20 focus:border-primary/50 transition-all"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PopularFAQ() {
  const popularFAQs = faqData.filter(faq => faq.popular);

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center float">
              <HelpCircle className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Preguntas Frecuentes</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Las consultas más comunes de nuestra comunidad
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {popularFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <AccordionItem value={faq.id} className="glass-glow border border-white/10 rounded-xl px-6 card-hover">
                  <AccordionTrigger className="text-left hover:no-underline group">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-semibold text-base sm:text-lg text-foreground">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground/80 pl-13 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function HelpArticles() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center float">
              <BookOpen className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Artículos de Ayuda</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Guías detalladas para aprovechar al máximo Fixia
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {helpArticles.map((article, index) => {
            const Icon = article.icon;
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-glow border-white/10 hover:bg-white/5 transition-all duration-300 cursor-pointer group h-full card-hover">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform float">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-base text-muted-foreground/80 mb-4 line-clamp-2 leading-relaxed">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            {article.readTime}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                        </div>
                      </div>
                    </div>
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

function SupportOptions() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-info/20 flex items-center justify-center float">
              <MessageSquare className="h-7 w-7 text-info" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">¿Necesitas más ayuda?</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Nuestro equipo está aquí para ayudarte
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-glow border-white/10 hover:bg-white/5 transition-all duration-300 text-center group card-hover">
                  <CardContent className="p-8">
                    <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform float">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl sm:text-2xl mb-4 text-foreground">{option.title}</h3>
                    <p className="text-muted-foreground/80 text-base mb-4 leading-relaxed">
                      {option.description}
                    </p>
                    <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm">
                      {option.available}
                    </Badge>
                    <Button className="liquid-gradient w-full group-hover:opacity-90 hover:scale-105 transition-all px-6 py-6 text-base font-semibold rounded-xl">
                      {option.action}
                    </Button>
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

function AllFAQ() {
  const categories = [
    { id: "all", name: "Todas", count: faqData.length },
    { id: "general", name: "General", count: faqData.filter(f => f.category === "general").length },
    { id: "pricing", name: "Precios", count: faqData.filter(f => f.category === "pricing").length },
    { id: "verification", name: "Verificación", count: faqData.filter(f => f.category === "verification").length },
    { id: "support", name: "Soporte", count: faqData.filter(f => f.category === "support").length },
    { id: "account", name: "Cuenta", count: faqData.filter(f => f.category === "account").length },
    { id: "services", name: "Servicios", count: faqData.filter(f => f.category === "services").length },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const filteredFAQs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-warning/20 flex items-center justify-center float">
              <FileText className="h-7 w-7 text-warning" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Todas las Preguntas</h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Explora todas nuestras preguntas frecuentes por categoría
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="glass-glow border-white/10 mb-10 grid grid-cols-3 lg:grid-cols-7 p-2">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm font-semibold transition-all">
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <AccordionItem value={faq.id} className="glass-glow border border-white/10 rounded-xl px-6 card-hover">
                      <AccordionTrigger className="text-left hover:no-underline group">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <HelpCircle className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-semibold text-base sm:text-lg text-foreground">{faq.question}</span>
                          {faq.popular && (
                            <Badge variant="secondary" className="ml-auto bg-yellow-500/20 text-yellow-600 pulse-glow">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground/80 pl-13 text-base leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      <HeroSection />
      <PopularFAQ />
      <HelpArticles />
      <SupportOptions />
      <AllFAQ />
    </div>
  );
}