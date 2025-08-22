import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Shield, Lock, Eye, Database, 
  Phone, Mail, MapPin, Cookie, UserCheck,
  AlertTriangle, CheckCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { FixiaNavigation } from "../components/FixiaNavigation";


export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Política de Privacidad
            </h1>
            <p className="text-muted-foreground mb-4">
              Última actualización: 20 de agosto de 2025
            </p>
            <Badge className="bg-success/20 text-success border-success/30">
              <Shield className="h-4 w-4 mr-2" />
              Cumplimiento PDPA Argentina
            </Badge>
          </div>

          {/* Introducción */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <span>Compromiso con tu Privacidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                En <strong>Fixia.com.ar</strong>, respetamos y protegemos la privacidad de nuestros usuarios. 
                Esta política describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal 
                cuando utilizas nuestra plataforma de matchmaking de servicios profesionales en la Provincia del Chubut, Argentina.
              </p>
            </CardContent>
          </Card>

          {/* Información que Recopilamos */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <span>1. Información que Recopilamos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-success" />
                    <span>Datos de Registro</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Nombre y apellido</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Correo electrónico</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Número de teléfono</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Fecha de nacimiento</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Dirección y ciudad en Chubut</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-warning" />
                    <span>Datos Profesionales (AS)</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Número de DNI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">CUIT/CUIL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Matrícula profesional (si aplica)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Categorías de servicios</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Portfolio y certificaciones</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-primary/50 bg-primary/10">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Transparencia Total:</strong> Solo recopilamos la información estrictamente necesaria para 
                  facilitar el matchmaking entre profesionales y clientes. Nunca vendemos ni compartimos tus datos con terceros.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Cómo Usamos tu Información */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>2. Cómo Usamos tu Información</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h6 className="font-medium">Matchmaking Inteligente</h6>
                      <p className="text-sm text-muted-foreground">Conectar AS con Exploradores según ubicación, categorías y necesidades específicas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h6 className="font-medium">Verificación de Identidad</h6>
                      <p className="text-sm text-muted-foreground">Validar profesionales y otorgar insignias de confianza y calidad</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h6 className="font-medium">Notificaciones Relevantes</h6>
                      <p className="text-sm text-muted-foreground">Enviar alertas de proyectos urgentes y solicitudes de contacto</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h6 className="font-medium">Facturación y Pagos</h6>
                      <p className="text-sm text-muted-foreground">Procesar suscripciones mensuales de profesionales ($5000/mes)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h6 className="font-medium">Soporte Técnico</h6>
                      <p className="text-sm text-muted-foreground">Brindar asistencia y resolver consultas de usuarios</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h6 className="font-medium">Mejora del Servicio</h6>
                      <p className="text-sm text-muted-foreground">Analizar métricas agregadas para optimizar la plataforma</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protección de Datos */}
          <Card className="glass border-success/30 bg-success/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-success">
                <Lock className="h-5 w-5" />
                <span>3. Protección y Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Encriptación SSL/TLS en todas las comunicaciones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Servidores seguros ubicados en Argentina</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Acceso limitado solo a personal autorizado</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Backups automáticos y recuperación de datos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Monitoreo 24/7 de actividades sospechosas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Cumplimiento PDPA y normativas argentinas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidad de Contacto */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>4. Privacidad en el Contacto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-warning/50 bg-warning/10">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Protección de Datos de Contacto:</strong> Tu número de teléfono y correo electrónico permanecen 
                  ocultos hasta que aceptes explícitamente una solicitud de contacto. Mantenemos tu privacidad hasta que decidas conectar.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h6 className="font-medium">Sistema de Contacto Protegido</h6>
                    <p className="text-sm text-muted-foreground">
                      Los números de teléfono se revelan solo cuando ambas partes aceptan la conexión para contacto directo vía WhatsApp
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <h6 className="font-medium">Control Total del Usuario</h6>
                    <p className="text-sm text-muted-foreground">
                      Tú decides qué información mostrar en tu perfil público y puedes configurar tu disponibilidad en cualquier momento
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tus Derechos */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>5. Tus Derechos sobre tus Datos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Conforme a la legislación argentina de protección de datos personales, tienes derecho a:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Acceder a tus datos personales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Rectificar información incorrecta</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Actualizar datos desactualizados</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Solicitar eliminación de tu cuenta</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Exportar tus datos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Limitar el procesamiento</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies y Tecnologías */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cookie className="h-5 w-5 text-primary" />
                <span>6. Cookies y Tecnologías Similares</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en la plataforma:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <h6 className="font-medium">Cookies Esenciales</h6>
                    <p className="text-sm text-muted-foreground">Necesarias para el funcionamiento básico del sitio y mantener tu sesión activa</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h6 className="font-medium">Cookies de Funcionalidad</h6>
                    <p className="text-sm text-muted-foreground">Recordar tus preferencias y configuraciones para personalizar tu experiencia</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h6 className="font-medium">Cookies Analíticas</h6>
                    <p className="text-sm text-muted-foreground">Entender cómo usas la plataforma para mejorar nuestros servicios (datos agregados y anónimos)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <span>7. Contacto sobre Privacidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para ejercer tus derechos, consultas sobre privacidad o reportar preocupaciones:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 glass-medium rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Email Privacidad</p>
                    <p className="text-sm text-muted-foreground">privacidad@fixia.com.ar</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 glass-medium rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">+54 9 280 XXX-XXXX</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 glass-medium rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">Chubut, Argentina</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambios en la Política */}
          <Card className="glass border-warning/30 bg-warning/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <span>8. Cambios en esta Política</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de actualizar esta política de privacidad. Te notificaremos sobre cambios 
                significativos por correo electrónico y publicaremos la versión actualizada en nuestro sitio web. 
                El uso continuado de Fixia.com.ar constituye la aceptación de cualquier modificación.
              </p>
            </CardContent>
          </Card>

          {/* Aceptación */}
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold mb-4">Consentimiento y Aceptación</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Al utilizar <strong>Fixia.com.ar</strong>, consientes el procesamiento de tus datos personales 
                según se describe en esta política de privacidad. Tu confianza es fundamental para nosotros.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                    <Shield className="h-4 w-4 mr-2" />
                    Registrarme de Forma Segura
                  </Button>
                </Link>
                <Link to="/terms">
                  <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                    Ver Términos y Condiciones
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}