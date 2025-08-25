import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛍️ Starting services-only seeding for production...');

  // Check existing data
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const serviceCount = await prisma.service.count();
  
  console.log(`📊 Current database state:`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Services: ${serviceCount}`);

  if (serviceCount > 0) {
    console.log('✅ Services already exist, skipping seeding');
    return;
  }

  if (userCount === 0) {
    console.log('❌ No users found - please run full seed first');
    process.exit(1);
  }

  // Create categories if they don't exist
  if (categoryCount === 0) {
    console.log('📂 Creating missing categories...');
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

    for (const category of categories) {
      await prisma.category.create({
        data: category,
      });
    }
    console.log('✅ Categories created');
  }

  // Get existing categories and users
  const categories = await prisma.category.findMany();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  const professionals = await prisma.user.findMany({
    where: { user_type: 'professional' },
    include: { professional_profile: true }
  });

  if (professionals.length === 0) {
    console.log('❌ No professional users found - cannot create services');
    process.exit(1);
  }

  console.log(`👥 Found ${professionals.length} professionals for service creation`);

  // Create services using existing professionals
  const services = [
    {
      professionalEmail: 'carlos@fixia.com.ar',
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
      professionalEmail: 'carlos@fixia.com.ar',
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
      professionalEmail: 'ana@fixia.com.ar',
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
      professionalEmail: 'ana@fixia.com.ar',
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
      professionalEmail: 'miguel@fixia.com.ar',
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
      professionalEmail: 'miguel@fixia.com.ar',
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

  // Create fallback services for any professional if specific emails don't exist
  const fallbackServices = [
    {
      categorySlug: 'desarrollo-web',
      title: 'Desarrollo de Sitio Web Profesional',
      description: 'Desarrollo completo de sitio web empresarial con diseño moderno y responsivo. Incluye optimización SEO y hosting.',
      price: 75000,
      main_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      gallery: [],
      tags: ['HTML', 'CSS', 'JavaScript', 'Responsive'],
      delivery_time_days: 21,
      revisions_included: 2,
      featured: true,
    },
    {
      categorySlug: 'diseno-grafico',
      title: 'Diseño de Logo Profesional',
      description: 'Creación de logotipo único y memorable para tu marca. Incluye múltiples propuestas y archivos en diferentes formatos.',
      price: 25000,
      main_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      gallery: [],
      tags: ['Logo', 'Branding', 'Diseño'],
      delivery_time_days: 7,
      revisions_included: 3,
      featured: true,
    }
  ];

  let servicesCreated = 0;

  // Try to create services with specific professionals first
  for (const service of services) {
    const professional = professionals.find(p => p.email === service.professionalEmail);
    if (professional && categoryMap[service.categorySlug]) {
      await prisma.service.create({
        data: {
          professional_id: professional.id,
          category_id: categoryMap[service.categorySlug],
          title: service.title,
          description: service.description,
          price: service.price,
          main_image: service.main_image,
          gallery: service.gallery,
          tags: service.tags,
          delivery_time_days: service.delivery_time_days,
          revisions_included: service.revisions_included,
          featured: service.featured,
          view_count: Math.floor(Math.random() * 500) + 50,
        },
      });
      servicesCreated++;
    }
  }

  // Create fallback services if we don't have enough
  if (servicesCreated < 3) {
    console.log('🔄 Creating fallback services with available professionals...');
    for (const service of fallbackServices) {
      if (servicesCreated >= 6) break;
      
      const availableProfessional = professionals[servicesCreated % professionals.length];
      if (categoryMap[service.categorySlug]) {
        await prisma.service.create({
          data: {
            professional_id: availableProfessional.id,
            category_id: categoryMap[service.categorySlug],
            title: service.title,
            description: service.description,
            price: service.price,
            main_image: service.main_image,
            gallery: service.gallery,
            tags: service.tags,
            delivery_time_days: service.delivery_time_days,
            revisions_included: service.revisions_included,
            featured: service.featured,
            view_count: Math.floor(Math.random() * 500) + 50,
          },
        });
        servicesCreated++;
      }
    }
  }

  console.log(`✅ Created ${servicesCreated} services`);

  // Update category service counts
  for (const [slug, categoryId] of Object.entries(categoryMap)) {
    const count = await prisma.service.count({
      where: { category_id: categoryId as string },
    });
    await prisma.category.update({
      where: { id: categoryId as string },
      data: { service_count: count },
    });
  }

  console.log('✅ Updated category service counts');

  // Final verification
  const finalServiceCount = await prisma.service.count();
  console.log(`🎉 Services seeding completed successfully!`);
  console.log(`📊 Final service count: ${finalServiceCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during services seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });