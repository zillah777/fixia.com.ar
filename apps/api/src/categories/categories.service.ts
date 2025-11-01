import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [
        { popular: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  async findPopular() {
    return this.prisma.category.findMany({
      where: { popular: true },
      orderBy: { name: 'asc' }
    });
  }

  async seedCategories() {
    const categories = [
      {
        name: 'Tecnología e Informática',
        slug: 'tecnologia-informatica',
        description: 'Servicios de tecnología, reparación y soporte informático',
        icon: '💻',
        popular: true,
        subcategories: [
          { name: 'Reparación de computadoras', slug: 'reparacion-computadoras' },
          { name: 'Reparación de laptops', slug: 'reparacion-laptops' },
          { name: 'Reparación de celulares', slug: 'reparacion-celulares' },
          { name: 'Soporte técnico remoto', slug: 'soporte-tecnico-remoto' },
          { name: 'Soporte técnico presencial', slug: 'soporte-tecnico-presencial' },
          { name: 'Instalación de software', slug: 'instalacion-software' },
          { name: 'Configuración de sistemas', slug: 'configuracion-sistemas' },
          { name: 'Recuperación de datos', slug: 'recuperacion-datos' },
          { name: 'Antivirus y protección', slug: 'antivirus-proteccion' },
          { name: 'Instalación de redes WiFi', slug: 'instalacion-wifi' },
          { name: 'Configuración de redes', slug: 'configuracion-redes' },
          { name: 'Mantenimiento de servidores', slug: 'mantenimiento-servidores' },
          { name: 'Virtualización', slug: 'virtualizacion' },
          { name: 'Ciberseguridad', slug: 'ciberseguridad' },
          { name: 'Consultoría IT', slug: 'consultor-it' },
          { name: 'Desarrollo de software', slug: 'desarrollo-software' },
          { name: 'Desarrollo web', slug: 'desarrollo-web' },
          { name: 'Desarrollo de aplicaciones', slug: 'desarrollo-aplicaciones' },
          { name: 'Base de datos', slug: 'base-datos' },
          { name: 'Cloud computing', slug: 'cloud-computing' },
          { name: 'SEO y posicionamiento', slug: 'seo-posicionamiento' },
          { name: 'Hosting y dominios', slug: 'hosting-dominios' },
          { name: 'Mantenimiento de sitios web', slug: 'mantenimiento-sitios-web' },
          { name: 'Auditoría de seguridad', slug: 'auditoria-seguridad' },
          { name: 'Soporte técnico 24/7', slug: 'soporte-24-7' }
        ]
      },
      {
        name: 'Diseño, Creatividad y Arte Digital',
        slug: 'diseno-creatividad-arte',
        description: 'Servicios de diseño gráfico, arte digital y contenido creativo',
        icon: '🎨',
        popular: true,
        subcategories: [
          { name: 'Diseño de logos', slug: 'diseno-logos' },
          { name: 'Diseño de marca (branding)', slug: 'diseno-branding' },
          { name: 'Identidad visual corporativa', slug: 'identidad-visual' },
          { name: 'Diseño de flyers y volantes', slug: 'diseno-flyers' },
          { name: 'Diseño de tarjetas de presentación', slug: 'diseno-tarjetas' },
          { name: 'Diseño de empaques', slug: 'diseno-empaques' },
          { name: 'Diseño de catálogos', slug: 'diseno-catalogos' },
          { name: 'Diseño de carteles y banners', slug: 'diseno-carteles' },
          { name: 'Diseño web responsivo', slug: 'diseno-web-responsivo' },
          { name: 'Diseño UX/UI', slug: 'diseno-ux-ui' },
          { name: 'Fotografía profesional', slug: 'fotografia-profesional' },
          { name: 'Edición de fotografía', slug: 'edicion-fotografia' },
          { name: 'Retoque fotográfico', slug: 'retoque-fotografico' },
          { name: 'Videografía profesional', slug: 'videografia-profesional' },
          { name: 'Edición de video', slug: 'edicion-video' },
          { name: 'Animación 2D', slug: 'animacion-2d' },
          { name: 'Animación 3D', slug: 'animacion-3d' },
          { name: 'Ilustración digital', slug: 'ilustracion-digital' },
          { name: 'Ilustración tradicional', slug: 'ilustracion-tradicional' },
          { name: 'Arte digital', slug: 'arte-digital' }
        ]
      },
      {
        name: 'Marketing, Publicidad y Ventas',
        slug: 'marketing-publicidad-ventas',
        description: 'Servicios de marketing digital, publicidad y estrategia comercial',
        icon: '📊',
        popular: true,
        subcategories: [
          { name: 'Marketing digital integral', slug: 'marketing-digital-integral' },
          { name: 'Publicidad en Google Ads', slug: 'google-ads' },
          { name: 'Publicidad en Facebook e Instagram', slug: 'facebook-instagram-ads' },
          { name: 'Community management', slug: 'community-management' },
          { name: 'Gestión de redes sociales', slug: 'gestion-redes-sociales' },
          { name: 'Estrategia de contenidos', slug: 'estrategia-contenidos' },
          { name: 'Creación de contenido', slug: 'creacion-contenido' },
          { name: 'Copywriting y redacción', slug: 'copywriting-redaccion' },
          { name: 'Email marketing', slug: 'email-marketing' },
          { name: 'Marketing de influencers', slug: 'marketing-influencers' },
          { name: 'Publicidad en TikTok', slug: 'publicidad-tiktok' },
          { name: 'Publicidad en LinkedIn', slug: 'publicidad-linkedin' },
          { name: 'SEO y posicionamiento', slug: 'seo-posicionamiento-marketing' },
          { name: 'SEM y publicidad pagada', slug: 'sem-publicidad' },
          { name: 'Análisis de competencia', slug: 'analisis-competencia' },
          { name: 'Consultoría de ventas', slug: 'consultor-ventas' },
          { name: 'Entrenamiento en ventas', slug: 'entrenamiento-ventas' },
          { name: 'Prospección de clientes', slug: 'prospeccion-clientes' },
          { name: 'Telemarketing', slug: 'telemarketing' },
          { name: 'Growth hacking', slug: 'growth-hacking' }
        ]
      },
      {
        name: 'Oficios y Reparaciones',
        slug: 'oficios-reparaciones',
        description: 'Servicios de construcción, reparación y mantenimiento general',
        icon: '🔧',
        popular: true,
        subcategories: [
          { name: 'Electricista residencial', slug: 'electricista-residencial' },
          { name: 'Electricista industrial', slug: 'electricista-industrial' },
          { name: 'Instalación eléctrica', slug: 'instalacion-electrica' },
          { name: 'Reparación de electricidad', slug: 'reparacion-electricidad' },
          { name: 'Plomero / Fontanero', slug: 'plomero-fontanero' },
          { name: 'Instalación de tuberías', slug: 'instalacion-tuberias' },
          { name: 'Reparación de fugas', slug: 'reparacion-fugas' },
          { name: 'Desazolve y destapes', slug: 'desazolve-destapes' },
          { name: 'Albañil / Construcción', slug: 'albanil-construccion' },
          { name: 'Demolición y derribo', slug: 'demolicion-derribo' },
          { name: 'Remodelación de casas', slug: 'remodelacion-casas' },
          { name: 'Levantamiento de paredes', slug: 'levantamiento-paredes' },
          { name: 'Chapista y pintor', slug: 'chapista-pintor' },
          { name: 'Carpintero de madera', slug: 'carpintero-madera' },
          { name: 'Carpintero metálico', slug: 'carpintero-metalico' },
          { name: 'Cerrajero', slug: 'cerrajero' },
          { name: 'Pintor de interiores', slug: 'pintor-interiores' },
          { name: 'Pintor de exteriores', slug: 'pintor-exteriores' },
          { name: 'Técnico en refrigeración', slug: 'tecnico-refrigeracion' },
          { name: 'Instalación de gas', slug: 'instalacion-gas' },
          { name: 'Reparación de electrodomésticos', slug: 'reparacion-electrodomesticos' },
          { name: 'Mantenimiento general', slug: 'mantenimiento-general' },
          { name: 'Reparación de muebles', slug: 'reparacion-muebles' },
          { name: 'Vidriería y cristalería', slug: 'vidrieria-cristaleria' },
          { name: 'Revestimiento de pisos', slug: 'revestimiento-pisos' }
        ]
      },
      {
        name: 'Limpieza y Mantenimiento',
        slug: 'limpieza-mantenimiento',
        description: 'Servicios profesionales de limpieza, jardinería y mantenimiento',
        icon: '🧹',
        popular: true,
        subcategories: [
          { name: 'Limpieza de casas', slug: 'limpieza-casas' },
          { name: 'Limpieza de oficinas', slug: 'limpieza-oficinas' },
          { name: 'Limpieza de comercios', slug: 'limpieza-comercios' },
          { name: 'Limpieza de vidrios y ventanas', slug: 'limpieza-vidrios' },
          { name: 'Limpieza de alfombras', slug: 'limpieza-alfombras' },
          { name: 'Limpieza de muebles', slug: 'limpieza-muebles' },
          { name: 'Desinfección de espacios', slug: 'desinfeccion-espacios' },
          { name: 'Limpieza post-construcción', slug: 'limpieza-post-construccion' },
          { name: 'Jardinería y paisajismo', slug: 'jardineria-paisajismo' },
          { name: 'Mantenimiento de jardines', slug: 'mantenimiento-jardines' },
          { name: 'Poda de árboles', slug: 'poda-arboles' },
          { name: 'Riego automático', slug: 'riego-automatico' },
          { name: 'Fumigación y control de plagas', slug: 'fumigacion-plagas' },
          { name: 'Control de hormigas', slug: 'control-hormigas' },
          { name: 'Desratización', slug: 'desratizacion' },
          { name: 'Lavado de autos a domicilio', slug: 'lavado-autos' },
          { name: 'Detailing de autos', slug: 'detailing-autos' },
          { name: 'Limpieza de piscinas', slug: 'limpieza-piscinas' },
          { name: 'Mantenimiento de piscinas', slug: 'mantenimiento-piscinas' },
          { name: 'Limpieza de campanas extractoras', slug: 'limpieza-campanas' }
        ]
      },
      {
        name: 'Educación y Formación',
        slug: 'educacion-formacion',
        description: 'Clases particulares, tutorías y cursos de formación profesional',
        icon: '📚',
        popular: true,
        subcategories: [
          { name: 'Clases de matemáticas', slug: 'clases-matematicas' },
          { name: 'Clases de física', slug: 'clases-fisica' },
          { name: 'Clases de química', slug: 'clases-quimica' },
          { name: 'Clases de biología', slug: 'clases-biologia' },
          { name: 'Clases de historia', slug: 'clases-historia' },
          { name: 'Clases de geografía', slug: 'clases-geografia' },
          { name: 'Clases de literatura', slug: 'clases-literatura' },
          { name: 'Clases de inglés', slug: 'clases-ingles' },
          { name: 'Clases de francés', slug: 'clases-frances' },
          { name: 'Clases de portugués', slug: 'clases-portugues' },
          { name: 'Clases de otros idiomas', slug: 'clases-otros-idiomas' },
          { name: 'Tutorías escolares primaria', slug: 'tutorias-primaria' },
          { name: 'Tutorías escolares secundaria', slug: 'tutorias-secundaria' },
          { name: 'Apoyo universitario', slug: 'apoyo-universitario' },
          { name: 'Clases de música', slug: 'clases-musica' },
          { name: 'Clases de guitarra', slug: 'clases-guitarra' },
          { name: 'Clases de piano', slug: 'clases-piano' },
          { name: 'Clases de arte y dibujo', slug: 'clases-arte-dibujo' },
          { name: 'Cursos de oficio', slug: 'cursos-oficio' },
          { name: 'Formación profesional', slug: 'formacion-profesional' }
        ]
      },
      {
        name: 'Gastronomía y Catering',
        slug: 'gastronomia-catering',
        description: 'Servicios culinarios, catering y preparación de comidas',
        icon: '🍽️',
        popular: true,
        subcategories: [
          { name: 'Chef a domicilio', slug: 'chef-domicilio' },
          { name: 'Preparación de comidas (meal prep)', slug: 'meal-prep' },
          { name: 'Pastelería y repostería', slug: 'pasteleria-reposteria' },
          { name: 'Catering para eventos', slug: 'catering-eventos' },
          { name: 'Catering empresarial', slug: 'catering-empresarial' },
          { name: 'Comida por encargo', slug: 'comida-encargo' },
          { name: 'Pizzería a domicilio', slug: 'pizzeria-domicilio' },
          { name: 'Servicios de bar y bebidas', slug: 'servicios-bar' },
          { name: 'Clases de cocina', slug: 'clases-cocina' },
          { name: 'Clases de repostería', slug: 'clases-reposteria' },
          { name: 'Decoración de tartas', slug: 'decoracion-tartas' },
          { name: 'Cupcakes y postres artesanales', slug: 'cupcakes-postres' },
          { name: 'Banquetes y eventos', slug: 'banquetes-eventos' },
          { name: 'Desayunos corporativos', slug: 'desayunos-corporativos' },
          { name: 'Menús degustación', slug: 'menus-degustacion' },
          { name: 'Gastronomía fusion', slug: 'gastronomia-fusion' },
          { name: 'Comida internacional', slug: 'comida-internacional' },
          { name: 'Dietas especiales', slug: 'dietas-especiales' },
          { name: 'Comida vegana y vegetariana', slug: 'comida-vegana' },
          { name: 'Servicio de mesero', slug: 'servicio-mesero' }
        ]
      },
      {
        name: 'Moda, Costura y Artesanías',
        slug: 'moda-costura-artesanias',
        description: 'Servicios de costura, confección y trabajos artesanales',
        icon: '🧵',
        popular: true,
        subcategories: [
          { name: 'Costura y confección', slug: 'costura-confeccion' },
          { name: 'Modista profesional', slug: 'modista-profesional' },
          { name: 'Reparación de ropa', slug: 'reparacion-ropa' },
          { name: 'Arreglos de ropa', slug: 'arreglos-ropa' },
          { name: 'Confección a medida', slug: 'confeccion-medida' },
          { name: 'Ropa personalizada', slug: 'ropa-personalizada' },
          { name: 'Uniformes y equipos', slug: 'uniformes-equipos' },
          { name: 'Tejido y crochet', slug: 'tejido-crochet' },
          { name: 'Bordado a mano', slug: 'bordado-mano' },
          { name: 'Bordado industrializado', slug: 'bordado-industrial' },
          { name: 'Estampado y serigrafía', slug: 'estampado-serigrafia' },
          { name: 'Personalización de prendas', slug: 'personalizacion-prendas' },
          { name: 'Customización de ropa', slug: 'customizacion-ropa' },
          { name: 'Diseño de moda', slug: 'diseno-moda' },
          { name: 'Confección de bolsos', slug: 'confeccion-bolsos' },
          { name: 'Marroquinería', slug: 'marroquineria' },
          { name: 'Joyería artesanal', slug: 'joyeria-artesanal' },
          { name: 'Trabajos en cuero', slug: 'trabajos-cuero' },
          { name: 'Artesanías en general', slug: 'artesanias-general' },
          { name: 'Manualidades y DIY', slug: 'manualidades-diy' }
        ]
      },
      {
        name: 'Belleza y Bienestar',
        slug: 'belleza-bienestar',
        description: 'Servicios de estética, peluquería, masajes y bienestar',
        icon: '💆',
        popular: true,
        subcategories: [
          { name: 'Peluquería a domicilio', slug: 'peluqueria-domicilio' },
          { name: 'Peluquería en salón', slug: 'peluqueria-salon' },
          { name: 'Corte y peinado', slug: 'corte-peinado' },
          { name: 'Coloración capilar', slug: 'coloracion-capilar' },
          { name: 'Alisado y permanente', slug: 'alisado-permanente' },
          { name: 'Extensiones de cabello', slug: 'extensiones-cabello' },
          { name: 'Barbería profesional', slug: 'barberia-profesional' },
          { name: 'Afeitado tradicional', slug: 'afeitado-tradicional' },
          { name: 'Maquillaje profesional', slug: 'maquillaje-profesional' },
          { name: 'Maquillaje para eventos', slug: 'maquillaje-eventos' },
          { name: 'Maquillaje artístico', slug: 'maquillaje-artistico' },
          { name: 'Diseño de cejas', slug: 'diseno-cejas' },
          { name: 'Manicure y pedicure', slug: 'manicure-pedicure' },
          { name: 'Diseño de uñas', slug: 'diseno-unas' },
          { name: 'Uñas acrílicas', slug: 'unas-acrilicas' },
          { name: 'Uñas de gel', slug: 'unas-gel' },
          { name: 'Depilación a cera', slug: 'depilacion-cera' },
          { name: 'Depilación láser', slug: 'depilacion-laser' },
          { name: 'Masajes relajantes', slug: 'masajes-relajantes' },
          { name: 'Masajes terapéuticos', slug: 'masajes-terapeuticos' },
          { name: 'Masajes descontracturantes', slug: 'masajes-descontracturantes' },
          { name: 'Reflexología', slug: 'reflexologia' },
          { name: 'Tratamientos faciales', slug: 'tratamientos-faciales' },
          { name: 'Spa a domicilio', slug: 'spa-domicilio' },
          { name: 'Wellness y meditación', slug: 'wellness-meditacion' }
        ]
      },
      {
        name: 'Transporte y Mudanzas',
        slug: 'transporte-mudanzas',
        description: 'Servicios de transporte, fletes y mudanzas',
        icon: '🚚',
        popular: true,
        subcategories: [
          { name: 'Mudanzas residenciales', slug: 'mudanzas-residenciales' },
          { name: 'Mudanzas empresariales', slug: 'mudanzas-empresariales' },
          { name: 'Fletes nacionales', slug: 'fletes-nacionales' },
          { name: 'Fletes internacionales', slug: 'fletes-internacionales' },
          { name: 'Transporte de carga', slug: 'transporte-carga' },
          { name: 'Carga y descarga', slug: 'carga-descarga' },
          { name: 'Empaque y embalaje', slug: 'empaque-embalaje' },
          { name: 'Guardamuebles', slug: 'guardamuebles' },
          { name: 'Transporte de personas', slug: 'transporte-personas' },
          { name: 'Servicio de taxi ejecutivo', slug: 'taxi-ejecutivo' },
          { name: 'Remis a domicilio', slug: 'remis-domicilio' },
          { name: 'Chofer privado', slug: 'chofer-privado' },
          { name: 'Servicio de minibús', slug: 'servicio-minibus' },
          { name: 'Transporte de turismo', slug: 'transporte-turismo' },
          { name: 'Motomensajería', slug: 'motomensajeria' },
          { name: 'Mensajería urgente', slug: 'mensajeria-urgente' },
          { name: 'Envío de documentos', slug: 'envio-documentos' },
          { name: 'Courier internacional', slug: 'courier-internacional' },
          { name: 'Logística y distribución', slug: 'logistica-distribucion' },
          { name: 'Transporte especializado', slug: 'transporte-especializado' }
        ]
      },
      {
        name: 'Mascotas y Veterinaria',
        slug: 'mascotas-veterinaria',
        description: 'Servicios para mascotas, cuidado y entrenamiento canino',
        icon: '🐾',
        popular: true,
        subcategories: [
          { name: 'Paseo de perros', slug: 'paseo-perros' },
          { name: 'Cuidado de mascotas a domicilio', slug: 'cuidado-mascotas-domicilio' },
          { name: 'Pet sitting', slug: 'pet-sitting' },
          { name: 'Guardería de mascotas', slug: 'guarderia-mascotas' },
          { name: 'Peluquería canina', slug: 'peluqueria-canina' },
          { name: 'Baño y estética canina', slug: 'bano-estética-canina' },
          { name: 'Corte de uñas canino', slug: 'corte-unas-canino' },
          { name: 'Peluquería felina', slug: 'peluqueria-felina' },
          { name: 'Entrenamiento canino básico', slug: 'entrenamiento-basico' },
          { name: 'Entrenamiento avanzado', slug: 'entrenamiento-avanzado' },
          { name: 'Adiestramiento de perros', slug: 'adiestramiento-perros' },
          { name: 'Comportamiento canino', slug: 'comportamiento-canino' },
          { name: 'Socialización de mascotas', slug: 'socializacion-mascotas' },
          { name: 'Nutrición y dietas para mascotas', slug: 'nutricion-mascotas' },
          { name: 'Rehabilitación de mascotas', slug: 'rehabilitacion-mascotas' },
          { name: 'Transporte de mascotas', slug: 'transporte-mascotas' },
          { name: 'Servicios de viaje con mascotas', slug: 'servicios-viaje-mascotas' },
          { name: 'Hotel para mascotas', slug: 'hotel-mascotas' },
          { name: 'Servicios veterinarios a domicilio', slug: 'veterinarios-domicilio' },
          { name: 'Consulta veterinaria', slug: 'consulta-veterinaria' }
        ]
      },
      {
        name: 'Eventos y Entretenimiento',
        slug: 'eventos-entretenimiento',
        description: 'Servicios de fotografía, video, animación y entretenimiento',
        icon: '🎉',
        popular: true,
        subcategories: [
          { name: 'Fotografía de eventos', slug: 'fotografia-eventos' },
          { name: 'Fotografía de bodas', slug: 'fotografia-bodas' },
          { name: 'Fotografía infantil', slug: 'fotografia-infantil' },
          { name: 'Fotografía de productos', slug: 'fotografia-productos' },
          { name: 'Videofilmación profesional', slug: 'videofilmacion-profesional' },
          { name: 'Videografía de bodas', slug: 'videografia-bodas' },
          { name: 'Edición de video profesional', slug: 'edicion-video-profesional' },
          { name: 'Producción de contenido video', slug: 'produccion-video' },
          { name: 'Animación de eventos', slug: 'animacion-eventos' },
          { name: 'Animadores infantiles', slug: 'animadores-infantiles' },
          { name: 'Payasos profesionales', slug: 'payasos-profesionales' },
          { name: 'Magos y ilusionistas', slug: 'magos-ilusionistas' },
          { name: 'Música en vivo para eventos', slug: 'musica-vivo-eventos' },
          { name: 'DJ profesional', slug: 'dj-profesional' },
          { name: 'Sonido e iluminación', slug: 'sonido-iluminacion' },
          { name: 'Decoración de eventos', slug: 'decoracion-eventos' },
          { name: 'Decoración de bodas', slug: 'decoracion-bodas' },
          { name: 'Globología y decoración con globos', slug: 'globologia' },
          { name: 'Organización de eventos', slug: 'organizacion-eventos' },
          { name: 'Wedding planner', slug: 'wedding-planner' },
          { name: 'Coordinación de eventos', slug: 'coordinacion-eventos' },
          { name: 'Alquiler de escenarios', slug: 'alquiler-escenarios' },
          { name: 'Catering para eventos', slug: 'catering-eventos-ent' },
          { name: 'Renta de equipo de sonido', slug: 'renta-equipo-sonido' },
          { name: 'Renta de equipos audiovisuales', slug: 'renta-audiovisual' }
        ]
      },
      {
        name: 'Consultoría y Servicios Empresariales',
        slug: 'consultor-servicios-empresariales',
        description: 'Servicios de consultoría, asesoría y apoyo administrativo',
        icon: '💼',
        popular: true,
        subcategories: [
          { name: 'Asesoría empresarial', slug: 'asesoria-empresarial' },
          { name: 'Consultoría de negocios', slug: 'consultoria-negocios' },
          { name: 'Consultoría estratégica', slug: 'consultoria-estrategica' },
          { name: 'Asesoría fiscal y contable', slug: 'asesoria-fiscal' },
          { name: 'Asesoría legal', slug: 'asesoria-legal' },
          { name: 'Asesoría de recursos humanos', slug: 'asesoria-rh' },
          { name: 'Asistente administrativo virtual', slug: 'asistente-administrativo' },
          { name: 'Secretaría virtual', slug: 'secretaria-virtual' },
          { name: 'Datos entry y digitación', slug: 'datos-entry' },
          { name: 'Trascripción de audio', slug: 'transcripcion-audio' },
          { name: 'Redacción de documentos', slug: 'redaccion-documentos' },
          { name: 'Traducción de documentos', slug: 'traduccion-documentos' },
          { name: 'Corrección de textos', slug: 'correccion-textos' },
          { name: 'Gestión de email y correspondencia', slug: 'gestion-email' },
          { name: 'Gestión de agenda', slug: 'gestion-agenda' },
          { name: 'Gestión de bases de datos', slug: 'gestion-bases-datos' },
          { name: 'Entrenamiento empresarial', slug: 'entrenamiento-empresarial' },
          { name: 'Coaching ejecutivo', slug: 'coaching-ejecutivo' },
          { name: 'Desarrollo de liderazgo', slug: 'desarrollo-liderazgo' },
          { name: 'Capacitación corporativa', slug: 'capacitacion-corporativa' }
        ]
      },
      {
        name: 'Servicios Generales y Diversos',
        slug: 'servicios-generales-diversos',
        description: 'Servicios variados y tareas generales de apoyo',
        icon: '🧰',
        popular: true,
        subcategories: [
          { name: 'Ayudante para tareas varias', slug: 'ayudante-tareas' },
          { name: 'Personal de apoyo', slug: 'personal-apoyo' },
          { name: 'Gestión de trámites', slug: 'gestion-tramites' },
          { name: 'Gestoría en línea (making filas)', slug: 'hacemos-filas' },
          { name: 'Compra de víveres', slug: 'compra-viveres' },
          { name: 'Gestión de compras', slug: 'gestion-compras' },
          { name: 'Recados personales', slug: 'recados-personales' },
          { name: 'Montaje de muebles', slug: 'montaje-muebles' },
          { name: 'Instalación de muebles', slug: 'instalacion-muebles' },
          { name: 'Mensajería y entregas', slug: 'mensajeria-entregas' },
          { name: 'Servicio de entrega urgente', slug: 'entrega-urgente' },
          { name: 'Organización de espacio', slug: 'organizacion-espacio' },
          { name: 'Asesoría de decoración', slug: 'asesoria-decoracion' },
          { name: 'Interiorismo', slug: 'interiorismo' },
          { name: 'Feng Shui', slug: 'feng-shui' },
          { name: 'Cuidado de plantas', slug: 'cuidado-plantas' },
          { name: 'Preparación de vivienda para venta', slug: 'preparacion-venta' },
          { name: 'Home staging', slug: 'home-staging' },
          { name: 'Servicios de custodia', slug: 'servicios-custodia' },
          { name: 'Seguridad personal', slug: 'seguridad-personal' }
        ]
      }
    ];

    let created = 0;
    let updated = 0;
    let subcategoriesCreated = 0;

    // Delete all existing categories to start fresh
    await this.prisma.subcategory.deleteMany({});
    await this.prisma.category.deleteMany({});

    for (const catData of categories) {
      const category = await this.prisma.category.create({
        data: {
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          icon: catData.icon,
          popular: catData.popular,
          subcategories: {
            create: catData.subcategories.map(sub => ({
              name: sub.name,
              slug: sub.slug,
            }))
          }
        },
        include: { subcategories: true }
      });
      created++;
      subcategoriesCreated += category.subcategories.length;
    }

    return {
      success: true,
      total_categories: categories.length,
      created_categories: created,
      created_subcategories: subcategoriesCreated,
      total_subcategories: categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)
    };
  }
}
