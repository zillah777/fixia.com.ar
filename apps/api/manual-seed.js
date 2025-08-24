#!/usr/bin/env node

/**
 * Manual Database Seeding Script for Production
 * 
 * This script can be run independently to seed the database
 * Usage: node manual-seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting manual seed process...');

  try {
    // Check current user count
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log(`✅ Database already has ${userCount} users, skipping seed`);
      return;
    }

    console.log('📊 Database is empty, proceeding with seed...');

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
      const created = await prisma.category.create({ data: category });
      createdCategories[category.slug] = created.id;
    }
    console.log('📂 Created categories');

    // Create professional users
    const professionals = [
      {
        email: 'carlos@fixia.com.ar',
        password: 'password123',
        name: 'Carlos Rodríguez',
        location: 'Rawson, Chubut',
        verified: true,
        bio: 'Desarrollador Full Stack con más de 8 años de experiencia en tecnologías web modernas. Especializado en React, Node.js y bases de datos relacionales.',
        specialties: ['Desarrollo Web', 'React', 'Node.js', 'PostgreSQL', 'JavaScript', 'TypeScript'],
        level: 'TopRatedPlus',
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
        level: 'ProfesionalVerificado',
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
        level: 'TecnicoCertificado',
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

    console.log('🎉 Manual seed completed successfully!');
    console.log('\n🔐 Test credentials:');
    console.log('Professionals:');
    professionals.forEach(p => {
      console.log(`  ${p.email} / password123`);
    });
    console.log('Client:');
    console.log(`  cliente@fixia.com.ar / password123`);

  } catch (error) {
    console.error('❌ Manual seed failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();