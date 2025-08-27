#!/usr/bin/env node

/**
 * Direct Railway Database Services Seeding Script
 * This script connects directly to the Railway PostgreSQL database to populate services
 */

const { PrismaClient } = require('@prisma/client');

// Railway connection will use DATABASE_URL from environment
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function seedServices() {
  console.log('🛍️ Direct Railway Services Seeding');
  console.log('🔗 Connecting to Railway PostgreSQL...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Check current status
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const serviceCount = await prisma.service.count();

    console.log('📊 Current database state:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Services: ${serviceCount}`);

    if (serviceCount > 0) {
      console.log('✅ Services already exist, exiting');
      process.exit(0);
    }

    if (userCount === 0) {
      console.log('❌ No users found - cannot create services');
      process.exit(1);
    }

    // Create categories if needed
    if (categoryCount === 0) {
      console.log('📂 Creating categories...');
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
        }
      ];

      for (const category of categories) {
        await prisma.category.create({ data: category });
      }
      console.log('✅ Categories created');
    }

    // Get data for service creation
    const categories = await prisma.category.findMany();
    const professionals = await prisma.user.findMany({
      where: { user_type: 'professional' }
    });

    console.log(`👥 Found ${professionals.length} professionals for service creation`);

    if (professionals.length === 0) {
      console.log('❌ No professional users found');
      process.exit(1);
    }

    // Create service templates
    const serviceTemplates = [
      {
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
        categorySlug: 'consultoria',
        title: 'Consultoría Empresarial',
        description: 'Asesoramiento estratégico para el crecimiento de tu empresa. Incluye análisis de mercado, plan de negocios y estrategias de expansión.',
        price: 65000,
        main_image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
        gallery: [],
        tags: ['Consultoría', 'Estrategia', 'Negocios', 'Análisis'],
        delivery_time_days: 21,
        revisions_included: 3,
        featured: false,
      },
      {
        categorySlug: 'limpieza',
        title: 'Servicio de Limpieza Integral',
        description: 'Limpieza profunda para hogares y oficinas. Incluye todos los materiales de limpieza, desinfección completa y garantía de satisfacción total.',
        price: 15000,
        main_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        gallery: [],
        tags: ['Limpieza', 'Desinfección', 'Hogar', 'Oficina'],
        delivery_time_days: 1,
        revisions_included: 1,
        featured: true,
      }
    ];

    // Create category mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Create services
    let servicesCreated = 0;
    for (let i = 0; i < serviceTemplates.length && i < professionals.length * 2; i++) {
      const template = serviceTemplates[i % serviceTemplates.length];
      const professional = professionals[i % professionals.length];
      
      if (categoryMap[template.categorySlug]) {
        try {
          await prisma.service.create({
            data: {
              professional_id: professional.id,
              category_id: categoryMap[template.categorySlug],
              title: template.title,
              description: template.description,
              price: template.price,
              main_image: template.main_image,
              gallery: template.gallery,
              tags: template.tags,
              delivery_time_days: template.delivery_time_days,
              revisions_included: template.revisions_included,
              featured: template.featured,
              view_count: Math.floor(Math.random() * 500) + 50,
            },
          });
          servicesCreated++;
          console.log(`✅ Created service: ${template.title}`);
        } catch (error) {
          console.log(`⚠️  Failed to create service ${template.title}:`, error.message);
        }
      }
    }

    // Update category service counts
    console.log('🔄 Updating category counts...');
    for (const category of categories) {
      const count = await prisma.service.count({
        where: { category_id: category.id },
      });
      await prisma.category.update({
        where: { id: category.id },
        data: { service_count: count },
      });
    }

    // Final verification
    const finalServiceCount = await prisma.service.count();
    
    console.log('🎉 Services seeding completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Services: ${finalServiceCount} (created: ${servicesCreated})`);

  } catch (error) {
    console.error('❌ Services seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  seedServices();
}

module.exports = { seedServices };