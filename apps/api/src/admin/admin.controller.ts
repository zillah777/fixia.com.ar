import { Controller, Post, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('database-status')
  @ApiOperation({ summary: 'Check database status' })
  @ApiResponse({ status: 200, description: 'Database status retrieved successfully' })
  async getDatabaseStatus() {
    try {
      const userCount = await this.prisma.user.count();
      const categoryCount = await this.prisma.category.count();
      const serviceCount = await this.prisma.service.count();
      const projectCount = await this.prisma.project.count();

      return {
        status: 'connected',
        counts: {
          users: userCount,
          categories: categoryCount,
          services: serviceCount,
          projects: projectCount,
        },
        needsSeeding: serviceCount === 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('seed-services')
  @ApiOperation({ summary: 'Populate missing services data (production-safe)' })
  @ApiResponse({ status: 200, description: 'Services seeded successfully' })
  @ApiResponse({ status: 400, description: 'Services already exist or seeding failed' })
  async seedServices() {
    try {
      // Check if services already exist
      const serviceCount = await this.prisma.service.count();
      if (serviceCount > 0) {
        return {
          status: 'skipped',
          message: 'Services already exist',
          serviceCount,
          timestamp: new Date().toISOString(),
        };
      }

      // Check if we have users
      const userCount = await this.prisma.user.count();
      if (userCount === 0) {
        throw new HttpException(
          'No users found. Please run full seed first.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Ensure categories exist
      let categoryCount = await this.prisma.category.count();
      if (categoryCount === 0) {
        await this.createCategories();
        categoryCount = await this.prisma.category.count();
      }

      // Create services
      const servicesCreated = await this.createServices();

      return {
        status: 'success',
        message: 'Services created successfully',
        servicesCreated,
        totalUsers: userCount,
        totalCategories: categoryCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to seed services',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async createCategories() {
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
      await this.prisma.category.create({ data: category });
    }
  }

  private async createServices(): Promise<number> {
    // Get categories and users
    const categories = await this.prisma.category.findMany();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    const professionals = await this.prisma.user.findMany({
      where: { user_type: 'professional' },
    });

    if (professionals.length === 0) {
      throw new Error('No professional users found');
    }

    // Service templates
    const serviceTemplates = [
      {
        categorySlug: 'desarrollo-web',
        title: 'Desarrollo Web Completo',
        description: 'Desarrollo de sitios web profesionales con tecnologías modernas como React y Node.js. Incluye diseño responsivo, optimización SEO y hosting.',
        price: 85000,
        main_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        gallery: ['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop'],
        tags: ['React', 'Node.js', 'PostgreSQL', 'Responsive', 'SEO'],
        delivery_time_days: 30,
        revisions_included: 3,
        featured: true,
      },
      {
        categorySlug: 'diseno-grafico',
        title: 'Identidad Visual Completa',
        description: 'Diseño integral de marca que incluye logotipo, manual de marca, papelería corporativa y plantillas para redes sociales.',
        price: 45000,
        main_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        gallery: ['https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop'],
        tags: ['Logo', 'Branding', 'Manual de Marca', 'Papelería'],
        delivery_time_days: 15,
        revisions_included: 4,
        featured: true,
      },
      {
        categorySlug: 'reparaciones',
        title: 'Reparación de Electrodomésticos',
        description: 'Servicio técnico especializado en reparación de electrodomésticos de línea blanca. Incluye diagnóstico y garantía de 6 meses.',
        price: 8500,
        main_image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        gallery: [],
        tags: ['Reparación', 'Electrodomésticos', 'Garantía', 'Domicilio'],
        delivery_time_days: 3,
        revisions_included: 1,
        featured: true,
      },
      {
        categorySlug: 'marketing-digital',
        title: 'Gestión de Redes Sociales',
        description: 'Manejo completo de redes sociales por 3 meses. Incluye creación de contenido, diseño de publicaciones y reportes.',
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
        description: 'Asesoramiento estratégico para el crecimiento de tu empresa. Incluye análisis de mercado y plan de acción detallado.',
        price: 55000,
        main_image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
        gallery: [],
        tags: ['Consultoría', 'Estrategia', 'Análisis', 'Crecimiento'],
        delivery_time_days: 14,
        revisions_included: 2,
        featured: false,
      },
      {
        categorySlug: 'limpieza',
        title: 'Servicio de Limpieza Integral',
        description: 'Limpieza profunda para hogares y oficinas. Incluye todos los materiales y garantía de satisfacción.',
        price: 12000,
        main_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        gallery: [],
        tags: ['Limpieza', 'Hogar', 'Oficina', 'Materiales Incluidos'],
        delivery_time_days: 1,
        revisions_included: 1,
        featured: true,
      }
    ];

    let servicesCreated = 0;

    // Create services by assigning them to available professionals
    for (let i = 0; i < serviceTemplates.length; i++) {
      const template = serviceTemplates[i];
      const professional = professionals[i % professionals.length];
      
      if (categoryMap[template.categorySlug]) {
        await this.prisma.service.create({
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
      }
    }

    // Update category service counts
    for (const [slug, categoryId] of Object.entries(categoryMap)) {
      const count = await this.prisma.service.count({
        where: { category_id: categoryId as string },
      });
      await this.prisma.category.update({
        where: { id: categoryId as string },
        data: { service_count: count },
      });
    }

    return servicesCreated;
  }
}