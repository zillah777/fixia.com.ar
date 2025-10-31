import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, MessageSquare, Crown, Shield,
  CreditCard, FileText, Clock, Share2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { MobileBottomNavigation } from "../components/MobileBottomNavigation";

// Article data - same as in HelpPage
const helpArticlesData = [
  {
    id: "1",
    title: "Guía para nuevos usuarios",
    description: "Todo lo que necesitas saber para comenzar en Fixia",
    category: "getting-started",
    readTime: "5 min",
    icon: BookOpen,
    sections: [
      {
        title: "Bienvenido a Fixia",
        content: "Fixia es el marketplace #1 de microservicios profesionales en la Provincia del Chubut. Conectamos clientes con profesionales verificados en diversas categorías como diseño, desarrollo, marketing, consultoría y más."
      },
      {
        title: "Crear tu cuenta",
        content: "1. Haz clic en 'Únete Gratis' en la página principal\n2. Completa tu información básica (nombre, email, contraseña)\n3. Verifica tu email haciendo clic en el enlace de confirmación\n4. Completa tu perfil con foto y descripción\n5. ¡Listo! Ya puedes explorar servicios profesionales"
      },
      {
        title: "Tipos de usuarios",
        content: "CLIENTE: Busca y contrata servicios profesionales. Es completamente gratis.\n\nPROFESIONAL: Ofrece servicios y genera ingresos. Requiere suscripción de $3,900 ARS/mes sin comisiones.\n\nDUAL: Sé cliente y profesional simultáneamente manteniendo perfiles separados y trust scores independientes."
      }
    ]
  },
  {
    id: "2",
    title: "Cómo contactar profesionales",
    description: "Aprende a comunicarte efectivamente con los profesionales",
    category: "clients",
    readTime: "3 min",
    icon: MessageSquare,
    sections: [
      {
        title: "Encontrar profesionales",
        content: "1. Ve a la sección 'Servicios'\n2. Usa la búsqueda o filtra por categoría\n3. Lee las reseñas y verifica el badge de verificación\n4. Revisa su experiencia y trust score\n5. Selecciona el profesional que mejor se ajuste a tus necesidades"
      },
      {
        title: "Contactar por WhatsApp",
        content: "Todos nuestros profesionales están disponibles por WhatsApp para consultas. Al hacer clic en 'Contactar', serás redirigido a WhatsApp donde podrás:\n\n• Hacer preguntas específicas\n• Solicitar presupuestos\n• Acordar detalles del proyecto\n• Negociar plazos y términos"
      },
      {
        title: "Mejores prácticas",
        content: "✓ Sé claro y específico en tu consulta\n✓ Proporciona detalles relevantes del proyecto\n✓ Pregunta sobre disponibilidad y experiencia\n✓ Solicita referencias o ejemplos de trabajo anterior\n✓ Revisa los términos antes de contratar"
      }
    ]
  },
  {
    id: "3",
    title: "Crear un perfil profesional atractivo",
    description: "Tips para destacar tu perfil y conseguir más clientes",
    category: "professionals",
    readTime: "7 min",
    icon: Crown,
    sections: [
      {
        title: "Información profesional básica",
        content: "Completa estos campos para que los clientes te encuentren:\n\n• Nombre completo y foto profesional\n• Descripción clara de tu especialidad\n• Años de experiencia\n• Servicios que ofreces\n• Categoría principal y subcategorías\n• Ubicación (provincia/zona)"
      },
      {
        title: "Tu descripción profesional",
        content: "Crea una descripción que:\n\n✓ Sea clara y concisa (máx 500 caracteres)\n✓ Destaque tu propuesta de valor única\n✓ Mencione especialidades clave\n✓ Incluya tu experiencia relevante\n✓ Refleje tu personalidad profesional\n\nEjemplo: 'Diseñador web especializado en ecommerce con 8 años de experiencia. Creo sitios hermosos y funcionales que venden.'"
      },
      {
        title: "Foto y verificación",
        content: "FOTO: Usa una foto profesional clara donde se vea tu cara. Las fotos de perfil claras aumentan la confianza en 40%.\n\nVERIFICACIÓN: Obtén el badge de verificación completando:\n• Validación de email\n• Validación de teléfono\n• Documento de identidad\n• Comprobante de domicilio\n\nLos profesionales verificados reciben 3x más consultas."
      },
      {
        title: "Trust Score y reseñas",
        content: "Tu Trust Score se calcula basado en:\n\n• Calificaciones de clientes (★★★★★)\n• Número de trabajos completados\n• Puntualidad y calidad\n• Respuesta a mensajes\n• Antigüedad en la plataforma\n\nMantén un score alto siendo profesional, cumpliendo plazos y ofreciendo excelente servicio."
      }
    ]
  },
  {
    id: "4",
    title: "Sistema de verificación",
    description: "Cómo obtener la verificación y qué beneficios tiene",
    category: "verification",
    readTime: "4 min",
    icon: Shield,
    sections: [
      {
        title: "¿Por qué verificarse?",
        content: "La verificación en Fixia:\n\n✓ Aumenta tu credibilidad ante clientes\n✓ Te destaca con un badge especial\n✓ Incrementa las consultas en 3x\n✓ Mejora tu posicionamiento en búsquedas\n✓ Demuestra que eres profesional serio\n\nEs gratuito y es uno de los factores clave para obtener más trabajo."
      },
      {
        title: "Pasos para verificarse",
        content: "1. Ve a tu perfil > Configuración > Verificación\n2. Completa validación de email (automática)\n3. Completa validación de teléfono (SMS)\n4. Sube foto de tu documento de identidad\n5. Sube comprobante de domicilio (factura de servicios)\n6. Espera la aprobación (48-72 horas)\n7. ¡Recibe tu badge de verificación!"
      },
      {
        title: "Documentos requeridos",
        content: "IDENTIDAD:\n• DNI/Cédula/Pasaporte (Foto clara frente y dorso)\n• Debe ser válido y legible\n\nDOMICILIO:\n• Factura de agua, luz, gas o teléfono (últimos 3 meses)\n• Contrato de alquiler o escritura\n• A nombre del propietario"
      }
    ]
  },
  {
    id: "5",
    title: "Gestión de pagos y facturación",
    description: "Todo sobre suscripciones, pagos y facturación",
    category: "billing",
    readTime: "6 min",
    icon: CreditCard,
    sections: [
      {
        title: "Planes y precios",
        content: "CLIENTES: Completamente gratis\n\nPROFESIONALES:\n• Plan Básico: $3,900 ARS/mes (5 servicios activos)\n• Plan Premium: $7,900 ARS/mes (servicios ilimitados)\n• Plan Profesional: $14,900 ARS/mes (todas las features + soporte prioritario)\n\nPROMOCIÓN: Primeros 200 profesionales obtienen 2 MESES GRATIS."
      },
      {
        title: "Cómo suscribirse",
        content: "1. Inicia sesión en tu cuenta\n2. Ve a Configuración > Plan Actual\n3. Haz clic en 'Actualizar a Profesional'\n4. Selecciona el plan que deseas\n5. Ingresa datos de tu tarjeta de crédito\n6. Completa el pago\n7. ¡Acceso inmediato a todas las features!\n\nAceptamos: Visa, Mastercard, American Express"
      },
      {
        title: "Sin comisiones, solo suscripción",
        content: "A diferencia de otros marketplaces:\n\n✓ No cobramos comisiones por servicios\n✓ El 100% del dinero que cobres es tuyo\n✓ Solo pagas la suscripción mensual\n✓ Puedes cancelar en cualquier momento\n✓ No hay costos ocultos\n\nEsto significa que ganancia desde tu primer cliente."
      },
      {
        title: "Facturación y comprobantes",
        content: "• Recibe factura automática después de cada pago\n• Descargable desde tu cuenta > Facturación\n• Válido para impuestos y deducciones\n• Historial completo de transacciones\n• Soporte fiscal disponible"
      }
    ]
  },
  {
    id: "6",
    title: "Políticas y términos de servicio",
    description: "Conoce nuestras políticas y términos de uso",
    category: "policies",
    readTime: "8 min",
    icon: FileText,
    sections: [
      {
        title: "Términos de servicio",
        content: "Al usar Fixia, aceptas:\n\n✓ Proporcionar información veraz y completa\n✓ No ofrecer servicios ilegales o prohibidos\n✓ Respetar la propiedad intelectual\n✓ No acosar, discriminar o ofender otros usuarios\n✓ Cumplir con leyes y regulaciones locales\n✓ No intentar hackear o interferir con el sistema\n\nLos términos completos están disponibles en /terms"
      },
      {
        title: "Política de privacidad",
        content: "Tu privacidad es importante:\n\n✓ No compartimos datos con terceros sin consentimiento\n✓ Usamos encriptación para proteger información\n✓ Los datos se almacenan de forma segura\n✓ Puedes acceder, modificar o eliminar tus datos\n✓ Cumplimos con regulaciones de protección de datos\n\nLa política completa está en /privacy"
      },
      {
        title: "Conducta y seguridad",
        content: "Reservamos el derecho a:\n\n• Suspender cuentas que violen políticas\n• Remover contenido inapropiado\n• Investigar fraude o comportamiento malicioso\n• Colaborar con autoridades si es necesario\n\nTodos los usuarios deben cumplir con nuestros estándares de seguridad y conducta profesional."
      },
      {
        title: "Resolver disputas",
        content: "Si tienes un problema con otro usuario:\n\n1. Intenta resolver directamente por WhatsApp\n2. Contacta a soporte si persiste\n3. Proporciona evidencia de la disputa\n4. Esperamos resolverlo en 48 horas\n5. Decisión final de Fixia\n\nNuestro equipo de soporte mediará conflictos de forma justa e imparcial."
      }
    ]
  }
];

export const HelpArticleDetailPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  const article = helpArticlesData.find(a => a.id === articleId);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <FixiaNavigation />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Artículo no encontrado</h1>
            <p className="text-muted-foreground mb-6">El artículo que buscas no existe.</p>
            <Link to="/help">
              <Button>Volver a Ayuda</Button>
            </Link>
          </motion.div>
        </main>
        <MobileBottomNavigation />
      </div>
    );
  }

  const Icon = article.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FixiaNavigation />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8 max-w-3xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Ayuda
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">{article.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{article.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{article.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 mb-12"
        >
          {article.sections?.map((section, index) => (
            <Card key={index} className="glass border-white/10">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
                  {section.title}
                </h2>
                <div className="prose prose-invert max-w-none">
                  {section.content.split('\n').map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-base text-muted-foreground/90 leading-relaxed mb-3 whitespace-pre-wrap"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Related Articles or CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-6 sm:p-8 border border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">¿Necesitas más ayuda?</h3>
              <p className="text-muted-foreground mb-4">
                Si tienes más preguntas, puedes contactarnos directamente a través de nuestro centro de soporte.
              </p>
              <Link to="/help">
                <Button variant="outline" className="gap-2">
                  Explorar más artículos
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <MobileBottomNavigation />
    </div>
  );
};

export default HelpArticleDetailPage;
