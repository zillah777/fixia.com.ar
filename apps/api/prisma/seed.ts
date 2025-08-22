import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data...');

  // Clean existing data (only in development)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.serviceView.deleteMany();
    await prisma.userActivity.deleteMany();
    await prisma.review.deleteMany();
    await prisma.proposal.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.service.deleteMany();
    await prisma.project.deleteMany();
    await prisma.professionalProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    
    console.log('🧹 Cleaned existing data');
  }

  // Create categories
  const categories = [
    {
      name: 'Desarrollo Web',
      slug: 'desarrollo-web',
      icon: 'Globe',
      popular: true,
      description: 'Desarrollo de sitios web, aplicaciones web y e-commerce'
    },
    {
      name: 'Diseño Gráfico',
      slug: 'diseno-grafico',
      icon: 'Palette',
      popular: true,
      description: 'Diseño de logotipos, branding, marketing digital y material gráfico'
    },
    {
      name: 'Reparaciones',
      slug: 'reparaciones',
      icon: 'Briefcase',
      popular: true,
      description: 'Reparación de electrodomésticos, dispositivos electrónicos y equipos'
    },
    {
      name: 'Marketing Digital',
      slug: 'marketing-digital',
      icon: 'TrendingUp',
      popular: false,
      description: 'Gestión de redes sociales, publicidad digital y estrategias de marketing'
    },
    {
      name: 'Consultoría',
      slug: 'consultoria',
      icon: 'HeadphonesIcon',
      popular: false,
      description: 'Asesoramiento empresarial, consultoría técnica y capacitación'
    },
    {
      name: 'Limpieza',
      slug: 'limpieza',
      icon: 'Users',
      popular: true,
      description: 'Servicios de limpieza doméstica, comercial y especializada'
    },
    {
      name: 'Jardinería',
      slug: 'jardineria',
      icon: 'Camera',
      popular: false,
      description: 'Mantenimiento de jardines, paisajismo y cuidado de plantas'
    },
    {
      name: 'Educación',
      slug: 'educacion',
      icon: 'PenTool',
      popular: false,
      description: 'Tutorías, clases particulares y capacitación profesional'
    }
  ];

  const createdCategories = {};
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    });
    createdCategories[category.slug] = created.id;
  }
  console.log('📂 Created categories');

  // Create featured professionals from frontend
  const professionals = [
    {
      email: 'carlos@fixia.com.ar',
      password: 'password123',
      name: 'Carlos Rodríguez',
      location: 'Rawson, Chubut',
      verified: true,
      bio: 'Desarrollador Full Stack con más de 8 años de experiencia en tecnologías web modernas. Especializado en React, Node.js y bases de datos relacionales.',
      specialties: ['Desarrollo Web', 'React', 'Node.js', 'PostgreSQL', 'JavaScript', 'TypeScript'],
      level: 'TopRatedPlus' as const,
      rating: 4.9,
      review_count: 76,
      whatsapp_number: '+542804567890',
    },
    {
      email: 'ana@fixia.com.ar',
      password: 'password123',
      name: 'Ana Martínez',
      location: 'Puerto Madryn, Chubut',
      verified: true,
      bio: 'Diseñadora gráfica profesional especializada en identidad visual y branding para empresas de Patagonia. Más de 6 años creando diseños únicos.',
      specialties: ['Diseño Gráfico', 'Branding', 'Logotipos', 'Marketing Visual', 'Illustrator', 'Photoshop'],
      level: 'ProfesionalVerificado' as const,
      rating: 4.8,
      review_count: 52,
      whatsapp_number: '+542804123456',
    },
    {
      email: 'miguel@fixia.com.ar',
      password: 'password123',
      name: 'Miguel Santos',
      location: 'Comodoro Rivadavia, Chubut',
      verified: true,
      bio: 'Técnico en reparación de electrodomésticos con 12 años de experiencia. Especialista en línea blanca, aires acondicionados y equipos industriales.',
      specialties: ['Reparación Electrodomésticos', 'Aires Acondicionados', 'Refrigeradores', 'Lavadoras', 'Cocinas'],
      level: 'TecnicoCertificado' as const,
      rating: 4.7,
      review_count: 89,
      whatsapp_number: '+542974567890',
    }
  ];

  const createdUsers = [];
  for (const prof of professionals) {
    const hashedPassword = await bcrypt.hash(prof.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: prof.email,
        password_hash: hashedPassword,
        name: prof.name,
        user_type: 'professional',
        location: prof.location,
        verified: prof.verified,
        email_verified: true,
        whatsapp_number: prof.whatsapp_number,
      },
    });

    const profile = await prisma.professionalProfile.create({
      data: {
        user_id: user.id,
        bio: prof.bio,
        specialties: prof.specialties,
        level: prof.level,
        rating: prof.rating,
        review_count: prof.review_count,
        years_experience: Math.floor(Math.random() * 10) + 5,
        availability_status: 'available',
        response_time_hours: Math.floor(Math.random() * 24) + 1,
      },
    });

    createdUsers.push({ user, profile });
  }
  console.log('👥 Created professional users');

  // Create sample client
  const clientPassword = await bcrypt.hash('password123', 12);
  const client = await prisma.user.create({
    data: {
      email: 'cliente@fixia.com.ar',
      password_hash: clientPassword,
      name: 'María González',
      user_type: 'client',
      location: 'Trelew, Chubut',
      verified: true,
      email_verified: true,
      phone: '+542804111222',
    },
  });
  console.log('🙋‍♀️ Created sample client');

  // Create services for professionals
  const services = [
    {
      professionalIndex: 0, // Carlos
      categorySlug: 'desarrollo-web',
      title: 'Desarrollo Web Completo',
      description: 'Desarrollo de sitios web profesionales con tecnologías modernas como React y Node.js. Incluye diseño responsivo, optimización SEO, panel de administración y hosting por 1 año. Perfecto para empresas que buscan una presencia web sólida.',
      price: 85000,
      main_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
      ],
      tags: ['React', 'Node.js', 'PostgreSQL', 'Responsive', 'SEO'],
      delivery_time_days: 30,
      revisions_included: 3,
      featured: true,
    },
    {
      professionalIndex: 0, // Carlos
      categorySlug: 'desarrollo-web',
      title: 'E-commerce con Pasarela de Pagos',
      description: 'Tienda online completa con carrito de compras, pasarela de pagos (MercadoPago/Stripe), gestión de inventario y panel administrativo. Integración con redes sociales y herramientas de marketing.',
      price: 150000,
      main_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      gallery: [],
      tags: ['E-commerce', 'MercadoPago', 'Inventario', 'Admin Panel'],
      delivery_time_days: 45,
      revisions_included: 2,
      featured: true,
    },
    {
      professionalIndex: 1, // Ana
      categorySlug: 'diseno-grafico',
      title: 'Identidad Visual Completa',
      description: 'Diseño integral de marca que incluye logotipo, manual de marca, papelería corporativa, tarjetas de presentación y plantillas para redes sociales. Todo lo que necesitas para proyectar profesionalismo.',
      price: 45000,
      main_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
      ],
      tags: ['Logo', 'Branding', 'Manual de Marca', 'Papelería'],
      delivery_time_days: 15,
      revisions_included: 4,
      featured: true,
    },
    {
      professionalIndex: 1, // Ana
      categorySlug: 'marketing-digital',
      title: 'Gestión de Redes Sociales',
      description: 'Manejo completo de tus redes sociales por 3 meses. Incluye creación de contenido, diseño de publicaciones, programación de posts, interacción con seguidores y reportes mensuales.',
      price: 35000,
      main_image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop',
      gallery: [],
      tags: ['Redes Sociales', 'Content Marketing', 'Community Management'],
      delivery_time_days: 90,
      revisions_included: 2,
      featured: false,
    },
    {
      professionalIndex: 2, // Miguel
      categorySlug: 'reparaciones',
      title: 'Reparación de Electrodomésticos',
      description: 'Servicio técnico especializado en reparación de electrodomésticos de línea blanca. Incluye diagnóstico, reparación con garantía de 6 meses, repuestos originales y servicio a domicilio en toda la zona.',
      price: 8500,
      main_image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=600&fit=crop'
      ],
      tags: ['Reparación', 'Electrodomésticos', 'Garantía', 'Domicilio'],
      delivery_time_days: 3,
      revisions_included: 1,
      featured: true,
    },
    {
      professionalIndex: 2, // Miguel
      categorySlug: 'reparaciones',
      title: 'Instalación y Service de Aires Acondicionados',
      description: 'Instalación profesional y service de aires acondicionados. Incluye instalación completa, carga de gas, limpieza de filtros, verificación de funcionamiento y garantía por 1 año.',
      price: 15000,
      main_image: 'https://images.unsplash.com/photo-1631545180907-48ac8e5aa9b6?w=800&h=600&fit=crop',
      gallery: [],
      tags: ['Aire Acondicionado', 'Instalación', 'Service', 'Garantía'],
      delivery_time_days: 1,
      revisions_included: 1,
      featured: false,
    }
  ];

  const createdServices = [];
  for (const service of services) {
    const professional = createdUsers[service.professionalIndex];
    const categoryId = createdCategories[service.categorySlug];

    const createdService = await prisma.service.create({
      data: {
        professional_id: professional.user.id,
        category_id: categoryId,
        title: service.title,
        description: service.description,
        price: service.price,
        main_image: service.main_image,
        gallery: service.gallery,
        tags: service.tags,
        delivery_time_days: service.delivery_time_days,
        revisions_included: service.revisions_included,
        featured: service.featured,
        view_count: Math.floor(Math.random() * 500) + 50, // Random view count
      },
    });
    createdServices.push(createdService);
  }
  console.log('🛍️ Created services');

  // Update category service counts
  for (const [slug, categoryId] of Object.entries(createdCategories)) {
    const count = await prisma.service.count({
      where: { category_id: categoryId as string },
    });
    await prisma.category.update({
      where: { id: categoryId as string },
      data: { service_count: count },
    });
  }

  // Create sample projects
  const projects = [
    {
      title: 'Aplicación móvil para delivery',
      description: 'Necesito desarrollar una app móvil para mi restaurante que permita a los clientes hacer pedidos, rastrear entregas y pagar online. Debe tener panel administrativo y estar disponible para Android e iOS.',
      category_slug: 'desarrollo-web',
      budget_min: 80000,
      budget_max: 150000,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      location: 'Puerto Madryn, Chubut',
      skills_required: ['React Native', 'Node.js', 'API Development', 'Payments Integration'],
    },
    {
      title: 'Rediseño de marca para empresa turística',
      description: 'Empresa de turismo en Península Valdés busca renovar completamente su imagen. Necesitamos nuevo logo, papelería, señalética y material promocional que refleje la belleza natural de la región.',
      category_slug: 'diseno-grafico',
      budget_min: 30000,
      budget_max: 60000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      location: 'Puerto Pirámides, Chubut',
      skills_required: ['Branding', 'Logo Design', 'Print Design', 'Photography'],
    }
  ];

  for (const project of projects) {
    const categoryId = createdCategories[project.category_slug];
    await prisma.project.create({
      data: {
        client_id: client.id,
        category_id: categoryId,
        title: project.title,
        description: project.description,
        budget_min: project.budget_min,
        budget_max: project.budget_max,
        deadline: project.deadline,
        location: project.location,
        skills_required: project.skills_required,
      },
    });
  }
  console.log('📋 Created sample projects');

  // Create sample reviews
  const reviews = [
    {
      serviceIndex: 0, // Carlos's web development service
      rating: 5,
      comment: 'Excelente trabajo! Carlos desarrolló mi sitio web exactamente como lo imaginé. Muy profesional y siempre disponible para consultas. Lo recomiendo 100%.',
    },
    {
      serviceIndex: 0,
      rating: 5,
      comment: 'Increíble atención al detalle. El sitio quedó perfecto y funciona muy bien en todos los dispositivos. Gran profesional.',
    },
    {
      serviceIndex: 2, // Ana's branding service
      rating: 5,
      comment: 'Ana creó una identidad visual hermosa para mi empresa. Su creatividad y profesionalismo son excepcionales. Muy satisfecho con el resultado.',
    },
    {
      serviceIndex: 2,
      rating: 4,
      comment: 'Buen trabajo en el diseño de la marca. Ana entendió perfectamente lo que buscaba y lo plasmó de manera creativa.',
    },
    {
      serviceIndex: 4, // Miguel's appliance repair
      rating: 5,
      comment: 'Miguel arregló mi lavarropas rápidamente y con garantía. Muy confiable y conoce mucho del tema. Precios justos.',
    },
    {
      serviceIndex: 4,
      rating: 5,
      comment: 'Servicio técnico de primera calidad. Llegó puntual, diagnosticó rápido y solucionó el problema. Lo volvería a contratar.',
    }
  ];

  for (const review of reviews) {
    const service = createdServices[review.serviceIndex];
    await prisma.review.create({
      data: {
        service_id: service.id,
        reviewer_id: client.id,
        professional_id: service.professional_id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  }
  console.log('⭐ Created sample reviews');

  console.log('🎉 Seed completed successfully!');
  
  console.log('\n📊 Summary:');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Professionals: ${professionals.length}`);
  console.log(`- Services: ${services.length}`);
  console.log(`- Projects: ${projects.length}`);
  console.log(`- Reviews: ${reviews.length}`);
  
  console.log('\n🔐 Test credentials:');
  console.log('Professionals:');
  professionals.forEach(p => {
    console.log(`  ${p.email} / password123`);
  });
  console.log('Client:');
  console.log(`  cliente@fixia.com.ar / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });