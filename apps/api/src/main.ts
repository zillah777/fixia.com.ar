import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS with production-ready configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://fixia.com.ar', 'https://www.fixia.com.ar']
      : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  // Global error handling and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Rate limiting protection  
  app.useGlobalGuards(app.get(ThrottlerGuard));

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

  // Health check endpoint for Railway
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // Port configuration for Railway
  const port = process.env.PORT || 4000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  await app.listen(port, host);
  
  logger.log(`🚀 Fixia API running on: http://${host}:${port}${apiPrefix ? `/${apiPrefix}` : ''}`);
  logger.log(`🏥 Health check: http://${host}:${port}/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📖 API Documentation: http://${host}:${port}/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});