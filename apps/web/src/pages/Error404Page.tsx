import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Home, Search, ArrowLeft, HelpCircle, MessageSquare,
  Compass, Heart, Lightbulb, RefreshCw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { FixiaNavigation } from "../components/FixiaNavigation";

function HeroSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* 404 Animated Number */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-8xl lg:text-9xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                4
              </span>
              <motion.span
                className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                0
              </motion.span>
              <span className="bg-gradient-to-r from-pink-400 to-primary bg-clip-text text-transparent">
                4
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-foreground">
              ¡Ups! Página no encontrada
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              La página que buscas parece haber desaparecido. Pero no te preocupes, 
              te ayudamos a encontrar lo que necesitas.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="¿Qué servicio estás buscando?"
                className="pl-12 pr-4 py-6 text-lg glass border-white/20"
              />
              <Link to="/services">
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 liquid-gradient hover:opacity-90 transition-all duration-300">
                  Buscar
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/">
              <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-6">
                <Home className="mr-2 h-5 w-5" />
                Ir al Inicio
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="glass border-white/20 hover:bg-white/10 px-6">
                <Compass className="mr-2 h-5 w-5" />
                Explorar Servicios
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SuggestionsSection() {
  const suggestions = [
    {
      title: "Servicios Populares",
      description: "Explora los servicios más solicitados en Chubut",
      icon: Heart,
      action: "Ver Servicios",
      href: "/services",
      color: "primary"
    },
    {
      title: "¿Eres Profesional?",
      description: "Únete a nuestra comunidad y ofrece tus servicios",
      icon: Lightbulb,
      action: "Registrarse",
      href: "/register?type=professional",
      color: "success"
    },
    {
      title: "Centro de Ayuda",
      description: "Encuentra respuestas a preguntas frecuentes",
      icon: HelpCircle,
      action: "Ir a Ayuda",
      href: "/help",
      color: "warning"
    },
    {
      title: "Contactar Soporte",
      description: "Nuestro equipo está aquí para ayudarte",
      icon: MessageSquare,
      action: "Contactar",
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
          <h2 className="text-3xl font-bold mb-4 text-foreground">Mientras tanto, puedes...</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Te sugerimos algunas opciones que podrían interesarte
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.div
                key={suggestion.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Link to={suggestion.href}>
                  <Card className="glass hover:bg-white/10 transition-all duration-300 border-white/10 cursor-pointer group h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${
                        suggestion.color === 'primary' ? 'bg-primary/20' :
                        suggestion.color === 'success' ? 'bg-green-500/20' :
                        suggestion.color === 'warning' ? 'bg-yellow-500/20' : 'bg-secondary/20'
                      }`}>
                        <Icon className={`h-8 w-8 ${
                          suggestion.color === 'primary' ? 'text-primary' :
                          suggestion.color === 'success' ? 'text-green-500' :
                          suggestion.color === 'warning' ? 'text-yellow-500' : 'text-foreground'
                        }`} />
                      </div>
                      <h3 className="font-semibold mb-2 text-foreground">{suggestion.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass border-white/20 group-hover:border-primary/30 group-hover:text-primary transition-colors"
                      >
                        {suggestion.action}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PopularLinks() {
  const links = [
    { name: "Desarrollo Web", href: "/services?category=Desarrollo Web" },
    { name: "Diseño Gráfico", href: "/services?category=Diseño Gráfico" },
    { name: "Reparaciones", href: "/services?category=Reparaciones" },
    { name: "Limpieza", href: "/services?category=Limpieza" },
    { name: "Marketing Digital", href: "/services?category=Marketing Digital" },
    { name: "Consultoría", href: "/services?category=Consultoría" },
    { name: "Planes y Precios", href: "/pricing" },
    { name: "Cómo Funciona", href: "/how-it-works" },
    { name: "Sobre Nosotros", href: "/about" },
    { name: "Contacto", href: "/contact" }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass border-white/10 max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Enlaces Populares</CardTitle>
              <CardDescription>
                Páginas más visitadas que podrían ser lo que buscas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {links.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                  >
                    <Link to={link.href}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start glass border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all"
                      >
                        <ArrowLeft className="h-3 w-3 mr-2 rotate-180" />
                        {link.name}
                      </Button>
                    </Link>
                  </motion.div>
                ))}
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
    <section className="py-16">
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
                <RefreshCw className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-4xl font-bold mb-6 text-foreground">
                  ¿Sigues perdido?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  No te preocupes, nuestro equipo está aquí para ayudarte a encontrar 
                  exactamente lo que necesitas.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/help">
                    <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-6">
                      <HelpCircle className="mr-2 h-5 w-5" />
                      Centro de Ayuda
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="glass border-white/20 hover:bg-white/10 px-6">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Contactar Soporte
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
                  <span>📧 soporte@fixia.app</span>
                  <span>📱 +54 280 4567890</span>
                  <span>⏰ Lun-Vie 9-18hs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default function Error404Page() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      <HeroSection />
      <SuggestionsSection />
      <PopularLinks />
      <CTASection />
    </div>
  );
}