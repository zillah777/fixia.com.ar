import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Clock, User, Calendar, BookOpen, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";

interface Article {
    id: string;
    title: string;
    description: string;
    category: string;
    readTime: string;
    author: string;
    date: string;
    content: {
        intro: string;
        sections: {
            title: string;
            content: string;
            tips?: string[];
        }[];
        conclusion: string;
    };
}

const articles: Record<string, Article> = {
    "1": {
        id: "1",
        title: "Guía para nuevos clientes",
        description: "Todo lo que necesitas saber para encontrar el profesional perfecto",
        category: "getting-started",
        readTime: "5 min",
        author: "Equipo Fixia",
        date: "2025-01-15",
        content: {
            intro: "Bienvenido a Fixia, el marketplace que conecta clientes con profesionales verificados en Chubut. Esta guía te ayudará a aprovechar al máximo nuestra plataforma.",
            sections: [
                {
                    title: "1. Crea tu cuenta gratuita",
                    content: "Registrarte en Fixia es completamente gratis para clientes. Solo necesitas un correo electrónico, tu DNI y fecha de nacimiento. Una vez registrado, recibirás un email de verificación.",
                    tips: [
                        "Usa un email que revises frecuentemente",
                        "Completa tu perfil con ubicación para mejores resultados",
                        "Verifica tu email para acceder a todas las funciones"
                    ]
                },
                {
                    title: "2. Busca profesionales",
                    content: "Utiliza nuestra barra de búsqueda o explora por categorías. Puedes filtrar por ubicación, calificación, experiencia y disponibilidad. Todos nuestros profesionales están verificados.",
                    tips: [
                        "Lee las reseñas de otros clientes",
                        "Revisa el portfolio y certificaciones",
                        "Verifica la insignia de verificación"
                    ]
                },
                {
                    title: "3. Contacta directamente",
                    content: "Una vez que encuentres el profesional ideal, puedes contactarlo directamente por WhatsApp. No cobramos comisiones por servicios, el pago se acuerda directamente con el profesional.",
                    tips: [
                        "Sé claro sobre lo que necesitas",
                        "Pregunta por disponibilidad y precios",
                        "Coordina horarios y forma de pago"
                    ]
                },
                {
                    title: "4. Deja tu reseña",
                    content: "Después de recibir el servicio, ayuda a la comunidad dejando una reseña honesta. Esto ayuda a otros clientes y a los profesionales a mejorar.",
                    tips: [
                        "Sé específico en tu feedback",
                        "Menciona aspectos positivos y áreas de mejora",
                        "Califica de manera justa"
                    ]
                }
            ],
            conclusion: "Fixia está diseñado para hacer tu vida más fácil. Si tienes dudas, nuestro equipo de soporte está disponible por WhatsApp y email."
        }
    },
    "2": {
        id: "2",
        title: "Cómo crear un perfil profesional exitoso",
        description: "Tips para destacar y atraer más clientes",
        category: "professional",
        readTime: "8 min",
        author: "Equipo Fixia",
        date: "2025-01-15",
        content: {
            intro: "Tu perfil es tu carta de presentación en Fixia. Un perfil completo y profesional puede aumentar tus contactos hasta un 300%. Aquí te mostramos cómo optimizarlo.",
            sections: [
                {
                    title: "1. Foto de perfil profesional",
                    content: "Tu foto es lo primero que ven los clientes. Usa una imagen clara, bien iluminada y profesional. Evita selfies o fotos borrosas.",
                    tips: [
                        "Fondo neutro y limpio",
                        "Buena iluminación natural",
                        "Vestimenta profesional",
                        "Sonrisa amigable"
                    ]
                },
                {
                    title: "2. Descripción detallada",
                    content: "Explica quién eres, qué servicios ofreces y qué te hace diferente. Menciona tu experiencia, especialidades y valores que te distinguen.",
                    tips: [
                        "Sé específico sobre tus servicios",
                        "Menciona años de experiencia",
                        "Destaca certificaciones o formación",
                        "Usa un tono profesional pero cercano"
                    ]
                },
                {
                    title: "3. Portfolio visual",
                    content: "Las imágenes venden. Sube fotos de tus mejores trabajos. Asegúrate de que sean de alta calidad y muestren resultados reales.",
                    tips: [
                        "Mínimo 5-10 fotos de trabajos",
                        "Antes y después cuando sea posible",
                        "Buena calidad de imagen",
                        "Variedad de proyectos"
                    ]
                },
                {
                    title: "4. Precios transparentes",
                    content: "Indica rangos de precios o tarifas base. La transparencia genera confianza y atrae clientes serios.",
                    tips: [
                        "Sé claro con tus tarifas",
                        "Ofrece paquetes o promociones",
                        "Explica qué incluye cada servicio",
                        "Actualiza precios regularmente"
                    ]
                },
                {
                    title: "5. Responde rápido",
                    content: "Los profesionales que responden en menos de 2 horas tienen 5 veces más probabilidades de cerrar el servicio. Activa las notificaciones.",
                    tips: [
                        "Configura notificaciones de WhatsApp",
                        "Responde aunque sea para agendar",
                        "Sé cortés y profesional",
                        "Confirma citas y detalles"
                    ]
                }
            ],
            conclusion: "Un perfil profesional bien optimizado es tu mejor herramienta de marketing. Dedica tiempo a mantenerlo actualizado y verás los resultados."
        }
    },
    "3": {
        id: "3",
        title: "Sistema de verificación paso a paso",
        description: "Proceso completo para obtener tu insignia verificada",
        category: "verification",
        readTime: "6 min",
        author: "Equipo Fixia",
        date: "2025-01-15",
        content: {
            intro: "La insignia de verificación genera confianza y te destaca frente a la competencia. Aquí te explicamos cómo obtenerla.",
            sections: [
                {
                    title: "1. Verificación de email",
                    content: "El primer paso es verificar tu correo electrónico. Recibirás un link al registrarte. Haz clic en el enlace para activar tu cuenta.",
                    tips: [
                        "Revisa tu bandeja de spam",
                        "El link expira en 24 horas",
                        "Puedes solicitar un nuevo link desde tu perfil"
                    ]
                },
                {
                    title: "2. Verificación de teléfono",
                    content: "Verifica tu número de WhatsApp para que los clientes puedan contactarte. Recibirás un código SMS que debes ingresar en la plataforma.",
                    tips: [
                        "Usa un número activo de WhatsApp",
                        "El código expira en 10 minutos",
                        "Asegúrate de tener señal"
                    ]
                },
                {
                    title: "3. Verificación de identidad",
                    content: "Sube una foto clara de tu DNI (frente y dorso). Esto garantiza que eres quien dices ser y protege a la comunidad.",
                    tips: [
                        "Foto nítida y legible",
                        "Todos los datos visibles",
                        "Sin reflejos ni sombras",
                        "Formato JPG o PNG"
                    ]
                },
                {
                    title: "4. Verificación de habilidades (opcional)",
                    content: "Sube certificados, diplomas o constancias que respalden tu experiencia. Esto aumenta tu credibilidad significativamente.",
                    tips: [
                        "Certificados oficiales",
                        "Diplomas de formación",
                        "Constancias de trabajo",
                        "Premios o reconocimientos"
                    ]
                },
                {
                    title: "5. Verificación de negocio (opcional)",
                    content: "Si tienes un negocio registrado, puedes verificarlo subiendo tu CUIT y comprobante de inscripción. Esto te da acceso a funciones adicionales.",
                    tips: [
                        "CUIT activo",
                        "Constancia de AFIP",
                        "Habilitación municipal si aplica",
                        "Seguro de responsabilidad civil (recomendado)"
                    ]
                }
            ],
            conclusion: "El proceso de verificación toma entre 24-48 horas. Una vez aprobado, tu perfil mostrará la insignia verificada y aparecerás más arriba en las búsquedas."
        }
    },
    "4": {
        id: "4",
        title: "Gestión de pagos y facturación",
        description: "Cómo manejar tu suscripción y métodos de pago",
        category: "billing",
        readTime: "4 min",
        author: "Equipo Fixia",
        date: "2025-01-15",
        content: {
            intro: "Fixia ofrece un modelo de suscripción simple y transparente. Aquí te explicamos todo sobre pagos, facturación y promociones.",
            sections: [
                {
                    title: "Plan Gratuito para Clientes",
                    content: "Si eres cliente, Fixia es 100% gratis. Puedes buscar profesionales, contactarlos y dejar reseñas sin ningún costo.",
                    tips: [
                        "3 solicitudes de servicio por mes",
                        "Reseñas ilimitadas",
                        "3 contactos directos por mes",
                        "Alertas de nuevos servicios"
                    ]
                },
                {
                    title: "Plan Profesional - $3,900/mes",
                    content: "Para profesionales, ofrecemos una suscripción mensual sin comisiones. Pagas una tarifa fija y te quedas con el 100% de tus ganancias.",
                    tips: [
                        "Sin comisiones por servicio",
                        "Contactos ilimitados",
                        "Perfil destacado",
                        "Estadísticas avanzadas",
                        "Soporte prioritario"
                    ]
                },
                {
                    title: "Promoción de Lanzamiento",
                    content: "Los primeros 200 profesionales obtienen 1 mes completamente gratis. No se requiere tarjeta de crédito para el mes gratuito.",
                    tips: [
                        "Regístrate cuanto antes",
                        "No se requiere tarjeta",
                        "Cancela cuando quieras",
                        "Sin permanencia mínima"
                    ]
                },
                {
                    title: "Métodos de Pago",
                    content: "Aceptamos Mercado Pago, tarjetas de crédito y débito. Los pagos son procesados de forma segura y automática cada mes.",
                    tips: [
                        "Pago automático mensual",
                        "Factura electrónica",
                        "Cancela en cualquier momento",
                        "Reembolso prorrateado si cancelas"
                    ]
                }
            ],
            conclusion: "Nuestro modelo de negocio es simple: tú ganas, nosotros ganamos. Sin sorpresas ni costos ocultos."
        }
    },
    "5": {
        id: "5",
        title: "Optimizar tu perfil para más visibilidad",
        description: "Estrategias para aparecer en los primeros resultados",
        category: "professional",
        readTime: "7 min",
        author: "Equipo Fixia",
        date: "2025-01-15",
        content: {
            intro: "El algoritmo de Fixia prioriza perfiles completos, activos y con buenas reseñas. Aquí te mostramos cómo escalar posiciones.",
            sections: [
                {
                    title: "1. Completa tu perfil al 100%",
                    content: "Los perfiles completos aparecen hasta 10 veces más en búsquedas. Asegúrate de llenar todos los campos: foto, descripción, servicios, precios, portfolio y certificaciones.",
                    tips: [
                        "Foto de perfil profesional",
                        "Descripción detallada (+200 palabras)",
                        "Mínimo 5 fotos de portfolio",
                        "Certificaciones verificadas",
                        "Precios transparentes"
                    ]
                },
                {
                    title: "2. Consigue reseñas positivas",
                    content: "Las reseñas son el factor más importante. Pide a tus clientes satisfechos que dejen una reseña. Responde a todas, positivas y negativas.",
                    tips: [
                        "Pide reseñas después de cada servicio",
                        "Responde a todas las reseñas",
                        "Agradece el feedback positivo",
                        "Resuelve problemas en reseñas negativas"
                    ]
                },
                {
                    title: "3. Mantén tu perfil activo",
                    content: "Los profesionales que actualizan su perfil regularmente y responden rápido aparecen más arriba. Inicia sesión al menos 3 veces por semana.",
                    tips: [
                        "Actualiza tu portfolio mensualmente",
                        "Responde mensajes en menos de 2 horas",
                        "Publica nuevos servicios",
                        "Actualiza tu disponibilidad"
                    ]
                },
                {
                    title: "4. Usa palabras clave relevantes",
                    content: "Incluye en tu descripción las palabras que tus clientes buscan. Por ejemplo: 'plomero urgencias', 'electricista matriculado', 'peluquería a domicilio'.",
                    tips: [
                        "Piensa como tu cliente",
                        "Usa términos locales",
                        "Menciona zonas que cubres",
                        "Incluye servicios específicos"
                    ]
                },
                {
                    title: "5. Suscripción Profesional",
                    content: "Los profesionales con suscripción activa tienen prioridad en el algoritmo. Además, obtienen insignia premium y aparecen en la sección destacados.",
                    tips: [
                        "Algoritmo prioritario",
                        "Insignia premium",
                        "Sección destacados",
                        "Estadísticas avanzadas"
                    ]
                }
            ],
            conclusion: "La visibilidad no es suerte, es estrategia. Aplica estos consejos consistentemente y verás resultados en 2-4 semanas."
        }
    },
    "6": {
        id: "6",
        title: "Protocolo de seguridad y reportes",
        description: "Cómo mantener interacciones seguras y reportar problemas",
        category: "safety",
        readTime: "5 min",
        author: "Equipo Fixia",
        date: "2025-01-15",
        content: {
            intro: "La seguridad de nuestra comunidad es nuestra prioridad. Aquí te explicamos cómo mantenerte seguro y qué hacer si encuentras un problema.",
            sections: [
                {
                    title: "1. Verifica antes de contratar",
                    content: "Siempre revisa la insignia de verificación, reseñas y portfolio antes de contratar. Los profesionales verificados han pasado por nuestro proceso de validación.",
                    tips: [
                        "Busca la insignia de verificación",
                        "Lee reseñas de otros clientes",
                        "Revisa el portfolio",
                        "Verifica años de experiencia"
                    ]
                },
                {
                    title: "2. Comunícate por canales oficiales",
                    content: "Usa WhatsApp para coordinar servicios. Evita compartir información bancaria o hacer pagos anticipados grandes sin garantías.",
                    tips: [
                        "Usa WhatsApp para comunicarte",
                        "No compartas datos bancarios por chat",
                        "Pide presupuesto por escrito",
                        "Confirma identidad en primera reunión"
                    ]
                },
                {
                    title: "3. Reporta comportamientos sospechosos",
                    content: "Si un usuario te pide dinero anticipado sin justificación, ofrece servicios no relacionados, o tiene comportamiento inapropiado, repórtalo inmediatamente.",
                    tips: [
                        "Usa el botón 'Reportar' en el perfil",
                        "Describe la situación claramente",
                        "Adjunta capturas si es posible",
                        "Nuestro equipo responde en 24hs"
                    ]
                },
                {
                    title: "4. Qué hacemos con los reportes",
                    content: "Investigamos todos los reportes en menos de 24 horas. Dependiendo de la gravedad, podemos suspender cuentas, solicitar verificaciones adicionales o banear usuarios.",
                    tips: [
                        "Investigación en 24 horas",
                        "Suspensión temporal o permanente",
                        "Notificación al reportante",
                        "Seguimiento del caso"
                    ]
                },
                {
                    title: "5. Mediación de conflictos",
                    content: "Si tienes un problema con un servicio, primero intenta resolverlo directamente. Si no hay solución, nuestro equipo puede mediar.",
                    tips: [
                        "Intenta resolver directamente primero",
                        "Documenta el problema (fotos, mensajes)",
                        "Contacta a soporte con evidencia",
                        "Seguimos un proceso justo para ambas partes"
                    ]
                }
            ],
            conclusion: "Fixia es una comunidad de confianza. Todos tenemos la responsabilidad de mantenerla segura. Si ves algo, di algo."
        }
    }
};

export default function HelpArticlePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const article = id ? articles[id] : null;

    if (!article) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="glass border-white/10 max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Artículo no encontrado</h2>
                        <p className="text-muted-foreground mb-6">
                            El artículo que buscas no existe o ha sido movido.
                        </p>
                        <Button onClick={() => navigate("/help")} className="liquid-gradient">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Centro de Ayuda
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 w-full glass border-b border-white/10"
            >
                <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold">Fixia</span>
                            <span className="text-xs text-muted-foreground -mt-1">Centro de Ayuda</span>
                        </div>
                    </Link>

                    <Link to="/help">
                        <Button variant="ghost" className="hover:glass-medium">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>
            </motion.header>

            {/* Article Content */}
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Article Header */}
                    <div className="mb-8">
                        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                            {article.category === "getting-started" && "Primeros Pasos"}
                            {article.category === "professional" && "Para Profesionales"}
                            {article.category === "verification" && "Verificación"}
                            {article.category === "billing" && "Facturación"}
                            {article.category === "safety" && "Seguridad"}
                        </Badge>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                            {article.title}
                        </h1>

                        <p className="text-xl text-muted-foreground mb-6">
                            {article.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                {article.author}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(article.date).toLocaleDateString("es-AR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {article.readTime} de lectura
                            </div>
                        </div>
                    </div>

                    {/* Article Body */}
                    <Card className="glass border-white/10">
                        <CardContent className="p-8 lg:p-12">
                            {/* Intro */}
                            <div className="prose prose-invert max-w-none mb-8">
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    {article.content.intro}
                                </p>
                            </div>

                            {/* Sections */}
                            <div className="space-y-8">
                                {article.content.sections.map((section, index) => (
                                    <div key={index}>
                                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                                            <BookOpen className="h-6 w-6 mr-3 text-primary" />
                                            {section.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            {section.content}
                                        </p>

                                        {section.tips && section.tips.length > 0 && (
                                            <Alert className="border-primary/30 bg-primary/5">
                                                <Lightbulb className="h-4 w-4 text-primary" />
                                                <AlertDescription>
                                                    <p className="font-semibold mb-2 text-primary">Tips clave:</p>
                                                    <ul className="space-y-1 text-sm">
                                                        {section.tips.map((tip, tipIndex) => (
                                                            <li key={tipIndex} className="flex items-start">
                                                                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-success shrink-0" />
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Conclusion */}
                            <div className="mt-12 pt-8 border-t border-white/10">
                                <h2 className="text-2xl font-bold mb-4">Conclusión</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {article.content.conclusion}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA */}
                    <div className="mt-8 text-center">
                        <Card className="glass border-primary/30 bg-primary/5">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-2">¿Te fue útil este artículo?</h3>
                                <p className="text-muted-foreground mb-4">
                                    Si tienes más preguntas, nuestro equipo está aquí para ayudarte
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <Button variant="outline" className="glass border-white/20" asChild>
                                        <Link to="/help">
                                            Ver más artículos
                                        </Link>
                                    </Button>
                                    <Button className="liquid-gradient" asChild>
                                        <Link to="/contact">
                                            Contactar Soporte
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
