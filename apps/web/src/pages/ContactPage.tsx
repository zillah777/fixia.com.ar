import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  ArrowLeft, Phone, Mail, MapPin, Clock, MessageSquare,
  Send, User, FileText, HelpCircle, Zap, Shield,
  CheckCircle, AlertCircle, Info, HeadphonesIcon
} from "lucide-react";
import { contactService, ContactFormData } from "../lib/services";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
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
          <Badge className="mb-8 bg-primary/20 text-primary border-primary/30 px-5 py-2.5 text-base pulse-glow">
            <HeadphonesIcon className="h-5 w-5 mr-2" />
            Soporte 24/7 disponible
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
              ¿Necesitas Ayuda?
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Estamos aquí para ayudarte.
            <span className="block mt-2 text-base sm:text-lg text-muted-foreground/70">
              Comunícate con nuestro equipo en Chubut y te responderemos en menos de 24 horas.
            </span>
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Lun-Vie 9:00-18:00
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-success" />
              Chubut, Argentina
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-warning" />
              Respuesta en 24hs
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactInfoSection() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Correo Electrónico",
      primary: "comercial@fixia.app",
      secondary: "comercial@fixia.app",
      description: "Para consultas generales y soporte técnico",
      color: "text-primary",
      action: "mailto:hello@send.fixia.app"
    },
    {
      icon: Phone,
      title: "Teléfono",
      primary: "+54 280 487-4166",
      secondary: "WhatsApp disponible",
      description: "Atención personalizada de Lun-Vie 9:00-18:00",
      color: "text-success",
      action: "tel:+542804874166"
    },
    {
      icon: MapPin,
      title: "Oficina",
      primary: "Rawson, Chubut",
      secondary: "Argentina",
      description: "Servimos toda la Provincia del Chubut",
      color: "text-warning",
      action: null
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
          <h2 className="text-4xl font-bold mb-4 text-foreground">Información de Contacto</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Múltiples formas de contactarnos para que elijas la que más te convenga
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full text-center">
                  <CardContent className="p-8">
                    <div className={`h-16 w-16 bg-current/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ${method.color}`}>
                      <Icon className={`h-8 w-8 ${method.color}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 ${method.color}`}>{method.title}</h3>
                    <p className="font-medium mb-1 text-foreground">{method.primary}</p>
                    <p className="text-sm text-muted-foreground mb-4">{method.secondary}</p>
                    <p className="text-sm text-muted-foreground mb-6">{method.description}</p>
                    {method.action && (
                      <a href={method.action}>
                        <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                          Contactar
                        </Button>
                      </a>
                    )}
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

function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    userType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Map form data to API expected format
      const contactData: ContactFormData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        phone: formData.phone || undefined,
        category: (formData.category as ContactFormData['category']) || 'general'
      };

      const response = await contactService.sendContactForm(contactData);
      
      setTicketNumber(response.ticketNumber);
      setIsSubmitted(true);
      
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      
      // Reset form after 5 seconds (extended for better UX)
      setTimeout(() => {
        setIsSubmitted(false);
        setTicketNumber('');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: '',
          message: '',
          userType: ''
        });
      }, 5000);
      
    } catch (error: any) {
      console.error('Contact form error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al enviar el mensaje';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="glass border-success/30 bg-success/5">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">¡Mensaje Enviado!</h3>
                <p className="text-muted-foreground mb-6">
                  Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos 
                  dentro de las próximas 24 horas hábiles.
                </p>
                {ticketNumber && (
                  <div className="mb-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                      Ticket #{ticketNumber}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Guarda este número para futuras referencias
                    </p>
                  </div>
                )}
                <Badge className="bg-success/20 text-success border-success/30">
                  Respuesta en menos de 24 horas
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

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
          <h2 className="text-4xl font-bold mb-4 text-foreground">Envíanos un Mensaje</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Completa el formulario y nos pondremos en contacto contigo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass border-white/10">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre y apellido"
                      autoComplete="name"
                      autoCorrect="off"
                      autoCapitalize="words"
                      spellCheck="false"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+54 280 1234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">Tipo de Usuario</Label>
                    <Select value={formData.userType} onValueChange={(value) => setFormData({ ...formData, userType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="professional">Profesional</SelectItem>
                        <SelectItem value="interested">Interesado en conocer más</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría de Consulta *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="¿En qué podemos ayudarte?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Soporte Técnico</SelectItem>
                      <SelectItem value="general">Problemas de Cuenta</SelectItem>
                      <SelectItem value="billing">Facturación y Pagos</SelectItem>
                      <SelectItem value="partnership">Quiero ser Profesional</SelectItem>
                      <SelectItem value="partnership">Propuesta Comercial</SelectItem>
                      <SelectItem value="feedback">Sugerencia o Mejora</SelectItem>
                      <SelectItem value="general">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Breve descripción del tema"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe tu consulta o problema en detalle..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
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
      question: "¿Cómo puedo registrarme como profesional?",
      answer: "Puedes registrarte como profesional haciendo clic en 'Ser Profesional' y completando el proceso de verificación. El plan profesional cuesta $5000 pesos argentinos mensuales."
    },
    {
      question: "¿Fixia cobra comisiones por los servicios?",
      answer: "No, Fixia no cobra comisiones. Los profesionales pagan una suscripción mensual y pueden quedarse con el 100% de sus ganancias."
    },
    {
      question: "¿Cómo funciona el sistema de verificación?",
      answer: "Los profesionales deben verificar su identidad con DNI, CUIT/CUIL y documentación profesional. Esto garantiza la confianza en nuestra plataforma."
    },
    {
      question: "¿En qué ciudades de Chubut están disponibles?",
      answer: "Fixia está disponible en toda la Provincia del Chubut, incluyendo Rawson, Puerto Madryn, Comodoro Rivadavia, Trelew, Esquel y todas las demás ciudades."
    },
    {
      question: "¿Cómo contacto con un profesional?",
      answer: "Puedes solicitar contacto con hasta 3 profesionales (10 si eres profesional). Una vez que acepten, se revelará su número de WhatsApp para contacto directo."
    },
    {
      question: "¿Qué incluye la promoción de lanzamiento?",
      answer: "Los primeros 200 profesionales y 200 clientes obtienen 2 meses gratis de todas las funcionalidades premium de la plataforma."
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
          <h2 className="text-4xl font-bold mb-4 text-foreground">Preguntas Frecuentes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas rápidas a las consultas más comunes
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
                  <div className="flex items-start space-x-4">
                    <HelpCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">{faq.question}</h4>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">¿No encontraste lo que buscabas?</p>
          <a href="#contact-form">
            <Button variant="outline" className="glass border-white/20 hover:glass-medium">
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar Consulta Personalizada
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function SupportHoursSection() {
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
                <Clock className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-6 text-foreground">Horarios de Atención</h2>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-semibold mb-4 text-primary">Soporte General</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Lunes a Viernes: 9:00 - 18:00</p>
                      <p>Sábados: 10:00 - 14:00</p>
                      <p>Domingos: Cerrado</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-success">Soporte Urgente</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>WhatsApp: 24/7</p>
                      <p>Email: Respuesta en 24hs</p>
                      <p>Problemas críticos: Inmediato</p>
                    </div>
                  </div>
                </div>

                <Alert className="border-primary/50 bg-primary/10 max-w-2xl mx-auto">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Zona Horaria:</strong> Todos los horarios están en GMT-3 (Argentina). 
                    Para consultas fuera del horario, usa el formulario de contacto y te responderemos al siguiente día hábil.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      <HeroSection />
      <ContactInfoSection />
      <div id="contact-form">
        <ContactFormSection />
      </div>
      <FAQSection />
      <SupportHoursSection />
    </div>
  );
}