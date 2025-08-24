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

    // Temporary database debug endpoint
    app.getHttpAdapter().get('/debug/db', async (req, res) => {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const userCount = await prisma.user.count();
        const categoryCount = await prisma.category.count();
        const serviceCount = await prisma.service.count();
        
        const seedUsers = await Promise.all([
          'carlos@fixia.com.ar',
          'ana@fixia.com.ar', 
          'miguel@fixia.com.ar',
          'cliente@fixia.com.ar'
        ].map(async email => {
          const user = await prisma.user.findUnique({ where: { email } });
          return { email, exists: !!user, type: user?.user_type || null };
        }));
        
        await prisma.$disconnect();
        
        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            users: userCount,
            categories: categoryCount,
            services: serviceCount,
            seedUsers
          }
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            error: error.message
          }
        });
      }
    });

    // Temporary manual seed endpoint
    app.getHttpAdapter().post('/debug/seed', async (req, res) => {
      try {
        const { spawn } = require('child_process');
        
        // Run the manual seed script
        const seedProcess = spawn('node', ['manual-seed.js'], {
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        let output = '';
        let errorOutput = '';
        
        seedProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        seedProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        seedProcess.on('close', (code) => {
          if (code === 0) {
            res.status(200).json({
              status: 'ok',
              message: 'Seed completed successfully',
              timestamp: new Date().toISOString(),
              output
            });
          } else {
            res.status(500).json({
              status: 'error',
              message: 'Seed failed',
              timestamp: new Date().toISOString(),
              exitCode: code,
              output,
              errorOutput
            });
          }
        });
        
      } catch (error) {
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          message: 'Failed to run seed',
          error: error.message
        });
      }
    });

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
            'https://fixiaweb.vercel.app'
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