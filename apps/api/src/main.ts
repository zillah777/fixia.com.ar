import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Railway port configuration
  const port = parseInt(process.env.PORT) || 3001;
  const host = '0.0.0.0';
  
  logger.log(`🚀 Starting Fixia API on ${host}:${port}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.RAILWAY_ENVIRONMENT) {
    logger.log(`🚂 Railway deployment detected: ${process.env.RAILWAY_SERVICE_NAME}`);
  }

  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug', 'verbose']
    });

    // Health check endpoint - Simple and reliable
    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        uptime: process.uptime()
      });
    });

    // Emergency services seeding endpoint for production
    if (process.env.NODE_ENV === 'production') {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      app.getHttpAdapter().get('/seed-services-emergency', async (req, res) => {
        try {
          // Check if services already exist
          const serviceCount = await prisma.service.count();
          if (serviceCount > 0) {
            return res.json({
              status: 'skipped',
              message: 'Services already exist',
              serviceCount,
              timestamp: new Date().toISOString(),
            });
          }

          // Get users and categories
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            return res.status(400).json({
              status: 'error',
              message: 'No users found - cannot create services'
            });
          }

          let categoryCount = await prisma.category.count();
          const categories = await prisma.category.findMany();
          const professionals = await prisma.user.findMany({
            where: { user_type: 'professional' }
          });

          // Create basic services if none exist
          let servicesCreated = 0;
          if (categories.length > 0 && professionals.length > 0) {
            const webDevCategory = categories.find(c => c.slug === 'desarrollo-web' || c.name.toLowerCase().includes('desarrollo'));
            const designCategory = categories.find(c => c.slug === 'diseno-grafico' || c.name.toLowerCase().includes('diseño'));
            const repairCategory = categories.find(c => c.slug === 'reparaciones' || c.name.toLowerCase().includes('reparacion'));
            
            const serviceTemplates = [
              {
                category: webDevCategory,
                title: 'Desarrollo Web Profesional',
                description: 'Desarrollo completo de sitio web empresarial con diseño moderno y responsivo.',
                price: 75000,
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
              },
              {
                category: designCategory,
                title: 'Diseño de Logo y Branding',
                description: 'Creación de identidad visual completa para tu empresa.',
                price: 35000,
                image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'
              },
              {
                category: repairCategory,
                title: 'Reparación de Electrodomésticos',
                description: 'Servicio técnico especializado con garantía.',
                price: 8500,
                image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
              }
            ];

            for (let i = 0; i < serviceTemplates.length && i < professionals.length; i++) {
              const template = serviceTemplates[i];
              if (template.category) {
                await prisma.service.create({
                  data: {
                    professional_id: professionals[i].id,
                    category_id: template.category.id,
                    title: template.title,
                    description: template.description,
                    price: template.price,
                    main_image: template.image,
                    gallery: [],
                    tags: ['Profesional', 'Calidad'],
                    delivery_time_days: 14,
                    revisions_included: 2,
                    featured: true,
                    view_count: Math.floor(Math.random() * 100) + 10,
                  }
                });
                servicesCreated++;
              }
            }

            // Update category counts
            for (const category of categories) {
              const count = await prisma.service.count({ where: { category_id: category.id } });
              await prisma.category.update({
                where: { id: category.id },
                data: { service_count: count }
              });
            }
          }

          await prisma.$disconnect();

          res.json({
            status: 'success',
            message: 'Services seeding completed',
            servicesCreated,
            totalUsers: userCount,
            totalCategories: categoryCount,
            timestamp: new Date().toISOString(),
          });

        } catch (error) {
          logger.error('Emergency seeding failed:', error);
          res.status(500).json({
            status: 'error',
            message: 'Seeding failed',
            error: error.message
          });
        }
      });
    }


    // Root endpoint
    app.getHttpAdapter().get('/', (req, res) => {
      res.json({
        message: 'Fixia API is running',
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
          health: '/health',
          docs: process.env.NODE_ENV !== 'production' ? '/docs' : 'disabled'
        }
      });
    });

    // Enable CORS with production-ready configuration
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://fixia.com.ar', 
            'https://www.fixia.com.ar',
            'https://fixiaweb.vercel.app',
            'https://fixia.vercel.app'
          ]
        : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    });

    // Global error handling and interceptors
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalInterceptors(new TransformInterceptor());

    // Global validation pipe with error formatting
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // API prefix
    const apiPrefix = process.env.API_PREFIX || '';
    if (apiPrefix) {
      app.setGlobalPrefix(apiPrefix);
    }

    // Swagger Documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Fixia API')
        .setDescription('API del marketplace de microservicios de Chubut')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addServer('http://localhost:4000', 'Desarrollo local')
        .addServer('https://api-staging.fixia.com.ar', 'Staging')
        .addServer('https://api.fixia.com.ar', 'Producción')
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });
    }
    
    // Start NestJS server
    await app.listen(port, host);
    
    logger.log(`🚀 Fixia API running on: http://${host}:${port}${apiPrefix ? `/${apiPrefix}` : ''}`);
    logger.log(`🏥 Health check: http://${host}:${port}/health`);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.log(`📖 API Documentation: http://${host}:${port}/docs`);
    }

    if (process.env.RAILWAY_ENVIRONMENT) {
      logger.log(`🚂 Railway deployment successful - Service: ${process.env.RAILWAY_SERVICE_NAME}`);
    }

    return app;
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});