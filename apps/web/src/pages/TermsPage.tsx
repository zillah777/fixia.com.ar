import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, AlertTriangle, Shield, Users, Zap, 
  Search, Bell, MapPin, Phone, Mail, Crown,
  CheckCircle, XCircle, Gift, CreditCard
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { FixiaNavigation } from "../components/FixiaNavigation";


export default function TermsPage() {
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
              Términos y Condiciones de Uso
            </h1>
            <p className="text-muted-foreground mb-4">
              Última actualización: 20 de agosto de 2025
            </p>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <MapPin className="h-4 w-4 mr-2" />
              Fixia.com.ar • Chubut, Argentina
            </Badge>
          </div>

          {/* Section 1: Naturaleza del Servicio */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>1. Naturaleza del Servicio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                <strong>FIXIA.COM.AR</strong> es un <strong>ANUNCIANTE AUTOMATIZADO</strong> con features modernos que funciona como:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Search className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Matchmaking inteligente entre AS (oferentes) y Exploradores (demandantes)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Bell className="h-5 w-5 text-warning mt-0.5" />
                    <span className="text-sm">Sistema de búsqueda avanzada con filtros como "busco niñera para hoy a las 10:00 pm"</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Notificaciones automáticas urgentes para AS disponibles</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Plataforma de conexión que anuncia gente que quiere prestar servicios</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Puente tecnológico que acerca a proveedores de micro servicios con quienes los necesitan</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Suscripciones y Promociones */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>2. Suscripciones y Promociones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Promoción de Lanzamiento */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Gift className="h-5 w-5 text-warning" />
                  <h4 className="font-semibold text-warning">Promoción de Lanzamiento</h4>
                </div>
                <Alert className="border-warning/50 bg-warning/10">
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    Los primeros <strong>200 AS</strong> y <strong>200 Exploradores</strong> tendrán acceso <strong>GRATUITO por 2 meses</strong> a todas las funcionalidades premium de la plataforma.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Sistema de Suscripciones */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Crown className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Sistema de Suscripciones</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="glass-medium border-white/20">
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h5 className="font-medium mb-1">Plan Gratuito</h5>
                      <p className="text-xs text-muted-foreground">Funcionalidades básicas limitadas</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-medium border-primary/30">
                    <CardContent className="p-4 text-center">
                      <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h5 className="font-medium mb-1">Plan Mensual</h5>
                      <p className="text-xs text-muted-foreground">Acceso completo - $5000/mes</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-medium border-success/30">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                      <h5 className="font-medium mb-1">Exploradores</h5>
                      <p className="text-xs text-muted-foreground">Uso gratuito de la plataforma</p>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  • <strong>SOLO facturación mensual</strong> para anunciantes de servicios (AS)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: EXENCIÓN TOTAL DE RESPONSABILIDAD */}
          <Card className="glass border-destructive/30 bg-destructive/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>3. 🚨 EXENCIÓN TOTAL DE RESPONSABILIDAD</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ DISCLAIMER FUNDAMENTAL</strong><br />
                  <strong>FIXIA.COM.AR NO SE HACE RESPONSABLE POR:</strong>
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 text-destructive">Incumplimientos y Calidad:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Incumplimientos de cualquier tipo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Calidad de servicios prestados</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Impuntualidad o retrasos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Cobros adicionales no acordados</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Falta de profesionalismo</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 text-destructive">Delitos y Daños:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Robos, estafas, fraudes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Pérdidas, faltantes, daños</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Actividades delictuales</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Violaciones al código civil/penal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Cualquier actividad ilícita</span>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="glass-medium border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <h5 className="font-semibold mb-2 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>📢 Nuestra Función Exclusiva</span>
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Fixia.com.ar únicamente anuncia personas que desean prestar servicios y las conecta con personas que necesitan esos servicios. 
                    Somos un <strong>intermediario tecnológico</strong> que facilita el encuentro entre oferta y demanda.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Section 4: Responsabilidades de los Usuarios */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>4. Responsabilidades de los Usuarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span>👨‍💼 AS (Anunciantes de Servicios)</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Prestar servicios con profesionalismo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Cumplir con acuerdos pactados</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Mantener información veraz y actualizada</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Responder a solicitudes de manera oportuna</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Cumplir con todas las leyes aplicables</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 flex items-center space-x-2">
                    <Search className="h-4 w-4 text-success" />
                    <span>🔍 Exploradores (Clientes)</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Proporcionar información clara sobre sus necesidades</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Respetar los acuerdos establecidos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Realizar pagos según lo acordado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Comportarse de manera respetuosa</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Evaluar honestamente los servicios recibidos</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Funcionalidades de la Plataforma */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>5. Funcionalidades de la Plataforma</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h5 className="font-semibold flex items-center space-x-2">
                <Search className="h-4 w-4 text-primary" />
                <span>🤖 Búsqueda Inteligente y Matchmaking</span>
              </h5>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Filtros avanzados: Búsquedas específicas como "busco niñera para hoy a las 10:00 pm"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Notificaciones automáticas: Los AS disponibles reciben alertas inmediatas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Geolocalización: Conexión con profesionales cercanos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Sistema de disponibilidad: Estados "disponible", "ocupado", "desconectado"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Urgencia inteligente: Priorización automática según la urgencia del servicio</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Limitaciones Legales */}
          <Card className="glass border-warning/30 bg-warning/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <span>6. Limitaciones Legales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h5 className="font-semibold text-warning">⚖️ CLÁUSULA DE EXONERACIÓN LEGAL</h5>
              <p className="text-sm text-muted-foreground">
                Al utilizar FIXIA.COM.AR, los usuarios reconocen y aceptan que:
              </p>
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">FIXIA.COM.AR actúa únicamente como plataforma de conexión e intermediación</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">Los acuerdos, contratos y negociaciones se realizan directamente entre AS y Exploradores</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">FIXIA.COM.AR no participa en la prestación efectiva de servicios</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">Los usuarios son responsables de verificar credenciales, referencias y antecedentes</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">Cualquier disputa debe resolverse directamente entre las partes involucradas</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-warning mt-0.5" />
                      <span className="text-sm">FIXIA.COM.AR no puede garantizar la idoneidad, honestidad o competencia de los usuarios</span>
                    </div>
                  </div>
                </div>
              </div>
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  🚫 <strong>FIXIA.COM.AR QUEDA EXENTA DE TODA RESPONSABILIDAD CIVIL, CONTRACTUAL, EXTRACONTRACTUAL Y PENAL</strong> derivada de las relaciones entre usuarios.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Section 7: Uso Responsable */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-success" />
                <span>7. Uso Responsable</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h5 className="font-semibold flex items-center space-x-2">
                <Shield className="h-4 w-4 text-success" />
                <span>💡 Recomendaciones de Seguridad</span>
              </h5>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Solicita referencias y verifica antecedentes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Establece acuerdos claros por escrito</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Utiliza métodos de pago seguros y trazables</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Conserva evidencia de todas las comunicaciones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Reporta comportamientos sospechosos a través de la plataforma</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Confía en tu instinto - si algo no se siente bien, no procedas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Contacto y Soporte */}
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>8. Contacto y Soporte</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para consultas, soporte técnico o reportes relacionados con la plataforma:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 glass-medium rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">soporte@fixia.app</p>
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
                    <p className="text-sm font-medium">Web</p>
                    <p className="text-sm text-muted-foreground">www.fixia.app</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aceptación */}
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold mb-4">Aceptación de Términos</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Al utilizar <strong>FIXIA.COM.AR</strong>, confirmas que has leído, entendido y aceptado estos términos y condiciones en su totalidad. 
                El uso continuado de la plataforma constituye la aceptación de futuras modificaciones a estos términos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                    Acepto y Quiero Registrarme
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                    Volver al Inicio
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