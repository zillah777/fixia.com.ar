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
      // 🛠️ Oficios y Reparaciones
      { name: 'Electricista', slug: 'electricista', description: 'Instalaciones eléctricas, reparaciones y mantenimiento', icon: '⚡', popular: true },
      { name: 'Plomero / Fontanero', slug: 'plomero', description: 'Reparación e instalación de sistemas de agua y gas', icon: '🔧', popular: true },
      { name: 'Albañil / Construcción', slug: 'albanil', description: 'Construcción, remodelación y albañilería', icon: '🏗️', popular: true },
      { name: 'Carpintero', slug: 'carpintero', description: 'Trabajos en madera, muebles y reparaciones', icon: '🪵', popular: true },
      { name: 'Cerrajero', slug: 'cerrajero', description: 'Cerrajería, instalación de cerraduras y llaves', icon: '🔐', popular: true },
      { name: 'Pintor', slug: 'pintor', description: 'Pintura de interiores, exteriores y decoración', icon: '🎨', popular: true },
      { name: 'Técnico en refrigeración', slug: 'tecnico-refrigeracion', description: 'Reparación de sistemas de refrigeración y climatización', icon: '❄️', popular: false },
      { name: 'Instalación de gas', slug: 'instalacion-gas', description: 'Instalación y reparación de sistemas de gas', icon: '🔥', popular: false },
      { name: 'Reparación de electrodomésticos', slug: 'reparacion-electrodomesticos', description: 'Reparación de línea blanca y electrodomésticos', icon: '🔌', popular: true },

      // 🧹 Limpieza y Mantenimiento
      { name: 'Limpieza de casas', slug: 'limpieza-casas', description: 'Limpieza profesional de hogares', icon: '🏠', popular: true },
      { name: 'Limpieza de oficinas', slug: 'limpieza-oficinas', description: 'Limpieza comercial y de oficinas', icon: '🏢', popular: true },
      { name: 'Limpieza de vidrios', slug: 'limpieza-vidrios', description: 'Limpieza profesional de ventanas y vidrios', icon: '🪟', popular: false },
      { name: 'Jardinería', slug: 'jardineria', description: 'Mantenimiento de jardines y paisajismo', icon: '🌱', popular: true },
      { name: 'Mantenimiento general', slug: 'mantenimiento-general', description: 'Servicios de mantenimiento y reparaciones menores', icon: '🛠️', popular: true },
      { name: 'Lavado de autos a domicilio', slug: 'lavado-autos', description: 'Lavado y detailing de vehículos', icon: '🚗', popular: false },
      { name: 'Fumigación', slug: 'fumigacion', description: 'Control de plagas y fumigación', icon: '🦟', popular: false },

      // 👨‍🏫 Educación y Clases
      { name: 'Clases particulares', slug: 'clases-particulares', description: 'Tutorías de matemáticas, física y otras materias', icon: '📚', popular: true },
      { name: 'Clases de idiomas', slug: 'clases-idiomas', description: 'Enseñanza de inglés, portugués y otros idiomas', icon: '🗣️', popular: true },
      { name: 'Tutorías escolares', slug: 'tutorias-escolares', description: 'Apoyo escolar para primaria y secundaria', icon: '✏️', popular: true },
      { name: 'Apoyo universitario', slug: 'apoyo-universitario', description: 'Tutorías y apoyo para estudiantes universitarios', icon: '🎓', popular: false },
      { name: 'Música e instrumentos', slug: 'musica-instrumentos', description: 'Clases de guitarra, piano y otros instrumentos', icon: '🎸', popular: false },
      { name: 'Cursos online personalizados', slug: 'cursos-online', description: 'Cursos virtuales personalizados', icon: '💻', popular: false },
      { name: 'Clases de arte / manualidades', slug: 'clases-arte', description: 'Talleres de pintura, dibujo y manualidades', icon: '🎨', popular: false },

      // 🧑‍🍳 Comida y Cocina
      { name: 'Chef a domicilio', slug: 'chef-domicilio', description: 'Servicio de chef privado en tu hogar', icon: '👨‍🍳', popular: false },
      { name: 'Preparación de comidas', slug: 'preparacion-comidas', description: 'Meal prep y comidas por encargo', icon: '🍱', popular: true },
      { name: 'Pastelería / Repostería', slug: 'pasteleria', description: 'Tortas, pasteles y dulces personalizados', icon: '🎂', popular: true },
      { name: 'Catering para eventos', slug: 'catering', description: 'Servicio de catering para eventos', icon: '🍽️', popular: true },
      { name: 'Comida por encargo', slug: 'comida-encargo', description: 'Platos preparados por pedido', icon: '🍲', popular: true },
      { name: 'Clases de cocina', slug: 'clases-cocina', description: 'Aprende a cocinar con profesionales', icon: '🔪', popular: false },

      // 🧵 Manualidades y Artesanías
      { name: 'Costura / Modista', slug: 'costura', description: 'Confección y arreglos de ropa', icon: '🪡', popular: true },
      { name: 'Tejido / Crochet', slug: 'tejido', description: 'Tejidos a mano personalizados', icon: '🧶', popular: false },
      { name: 'Bordado personalizado', slug: 'bordado', description: 'Bordados y personalizaciones', icon: '🪡', popular: false },
      { name: 'Reparación de ropa', slug: 'reparacion-ropa', description: 'Arreglos y reparación de prendas', icon: '👔', popular: true },
      { name: 'Confección por encargo', slug: 'confeccion-encargo', description: 'Ropa a medida y personalizada', icon: '👗', popular: false },

      // 💇 Belleza y Cuidado Personal
      { name: 'Peluquería a domicilio', slug: 'peluqueria-domicilio', description: 'Corte y peinado en tu hogar', icon: '💇', popular: true },
      { name: 'Maquillaje', slug: 'maquillaje', description: 'Maquillaje profesional para eventos', icon: '💄', popular: true },
      { name: 'Manicure / Pedicure', slug: 'manicure-pedicure', description: 'Servicio de uñas profesional', icon: '💅', popular: true },
      { name: 'Barbería', slug: 'barberia', description: 'Corte de cabello y barba para hombres', icon: '💈', popular: true },
      { name: 'Masajes', slug: 'masajes', description: 'Masajes terapéuticos y relajantes', icon: '💆', popular: true },
      { name: 'Depilación', slug: 'depilacion', description: 'Servicios de depilación profesional', icon: '🪒', popular: false },
      { name: 'Spa en casa', slug: 'spa-casa', description: 'Tratamientos de spa a domicilio', icon: '🧖', popular: false },

      // 🖥️ Tecnología y Soporte
      { name: 'Reparación de computadoras', slug: 'reparacion-computadoras', description: 'Reparación de PC, laptops y celulares', icon: '💻', popular: true },
      { name: 'Soporte técnico', slug: 'soporte-tecnico', description: 'Asistencia técnica informática', icon: '🛠️', popular: true },
      { name: 'Instalación de software', slug: 'instalacion-software', description: 'Instalación y configuración de programas', icon: '💿', popular: false },
      { name: 'Servicios de redes', slug: 'servicios-redes', description: 'Instalación de WiFi y redes', icon: '📡', popular: true },
      { name: 'Diseño gráfico', slug: 'diseno-grafico', description: 'Diseño de logos, branding y material gráfico', icon: '🎨', popular: true },
      { name: 'Diseño web', slug: 'diseno-web', description: 'Diseño y desarrollo de sitios web', icon: '🌐', popular: true },
      { name: 'Desarrollo de apps', slug: 'desarrollo-apps', description: 'Desarrollo de aplicaciones móviles', icon: '📱', popular: false },

      // 📦 Mudanzas y Transporte
      { name: 'Fletes / Mudanzas', slug: 'fletes-mudanzas', description: 'Servicio de mudanzas y fletes', icon: '🚚', popular: true },
      { name: 'Transporte de personas', slug: 'transporte-personas', description: 'Servicio de transporte privado', icon: '🚗', popular: true },
      { name: 'Motomensajería', slug: 'motomensajeria', description: 'Envío rápido de paquetes', icon: '🏍️', popular: false },
      { name: 'Carga ligera', slug: 'carga-ligera', description: 'Transporte de carga pequeña', icon: '📦', popular: true },
      { name: 'Chofer privado', slug: 'chofer-privado', description: 'Servicio de chofer particular', icon: '🚙', popular: false },

      // 🐶 Cuidado de Mascotas
      { name: 'Paseo de perros', slug: 'paseo-perros', description: 'Paseador canino profesional', icon: '🐕', popular: true },
      { name: 'Cuidado de mascotas', slug: 'cuidado-mascotas', description: 'Pet sitting y cuidado a domicilio', icon: '🐾', popular: true },
      { name: 'Peluquería canina', slug: 'peluqueria-canina', description: 'Estética y baño para mascotas', icon: '🐩', popular: true },
      { name: 'Entrenamiento de mascotas', slug: 'entrenamiento-mascotas', description: 'Adiestramiento canino', icon: '🦴', popular: false },

      // 📸 Eventos y Entretenimiento
      { name: 'Fotografía', slug: 'fotografia', description: 'Fotografía profesional para eventos', icon: '📷', popular: true },
      { name: 'Filmación', slug: 'filmacion', description: 'Videos profesionales para eventos', icon: '🎥', popular: true },
      { name: 'Animadores / Payasos', slug: 'animadores', description: 'Animación infantil para fiestas', icon: '🎪', popular: true },
      { name: 'Música en vivo', slug: 'musica-vivo', description: 'Música en vivo para eventos', icon: '🎵', popular: false },
      { name: 'Decoración de eventos', slug: 'decoracion-eventos', description: 'Decoración para fiestas y eventos', icon: '🎈', popular: true },
      { name: 'Organización de eventos', slug: 'organizacion-eventos', description: 'Planificación integral de eventos', icon: '📋', popular: true },

      // 📲 Marketing y Negocios
      { name: 'Community manager', slug: 'community-manager', description: 'Gestión de redes sociales', icon: '📱', popular: true },
      { name: 'Publicidad digital', slug: 'publicidad-digital', description: 'Campañas de marketing online', icon: '📊', popular: true },
      { name: 'Redacción / Copywriting', slug: 'redaccion-copywriting', description: 'Redacción de contenidos publicitarios', icon: '✍️', popular: false },
      { name: 'Ventas por comisión', slug: 'ventas-comision', description: 'Representación de ventas', icon: '💼', popular: false },
      { name: 'Asistente virtual', slug: 'asistente-virtual', description: 'Asistencia administrativa remota', icon: '💻', popular: true },

      // 🧰 Servicios Generales
      { name: 'Ayudante para tareas varias', slug: 'ayudante-tareas', description: 'Ayuda con tareas diversas', icon: '🧰', popular: true },
      { name: 'Hacemos filas / trámites', slug: 'filas-tramites', description: 'Gestión de trámites y filas', icon: '📝', popular: false },
      { name: 'Compra de víveres / encargos', slug: 'compra-viveres', description: 'Servicio de compras a domicilio', icon: '🛒', popular: true },
      { name: 'Montaje de muebles', slug: 'montaje-muebles', description: 'Armado e instalación de muebles', icon: '🪑', popular: true },
      { name: 'Mensajería', slug: 'mensajeria', description: 'Servicio de mensajería y entregas', icon: '📮', popular: true },
    ];

    let created = 0;
    let updated = 0;

    for (const category of categories) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (existing) {
        await this.prisma.category.update({
          where: { slug: category.slug },
          data: {
            name: category.name,
            description: category.description,
            icon: category.icon,
            popular: category.popular,
          }
        });
        updated++;
      } else {
        await this.prisma.category.create({
          data: category
        });
        created++;
      }
    }

    return {
      success: true,
      total: categories.length,
      created,
      updated
    };
  }
}
