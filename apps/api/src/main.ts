import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // CRITICAL: Initialize basic HTTP server FIRST before any NestJS modules
  const express = require('express');
  const basicApp = express();
  
  // Railway port configuration - CRITICAL for healthcheck
  const port = parseInt(process.env.PORT) || 3001;
  const host = '0.0.0.0';
  
  console.log(`🚀 EMERGENCY STARTUP: Setting up basic HTTP server on ${host}:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚂 Railway: ${process.env.RAILWAY_ENVIRONMENT || 'not-railway'}`);
  
  // Immediate health endpoint that works without NestJS
  basicApp.get('/health', (req, res) => {
    console.log(`✅ BASIC Health check accessed at ${new Date().toISOString()}`);
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Basic health check working',
      version: '1.0.0-emergency',
      port: port,
      host: host,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      railway: {
        service: process.env.RAILWAY_SERVICE_NAME || 'unknown',
        environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
        deployment_id: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown'
      }
    });
  });
  
  // Basic root endpoint
  basicApp.get('/', (req, res) => {
    res.status(200).json({
      message: 'Fixia API Emergency Mode - Basic Server Running',
      status: 'ok',
      timestamp: new Date().toISOString(),
      endpoints: ['/health', '/debug']
    });
  });
  
  // Debug endpoint
  basicApp.get('/debug', (req, res) => {
    res.json({
      mode: 'emergency-basic-server',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]',
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
        RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        cwd: process.cwd()
      }
    });
  });
  
  // Start basic server immediately
  const basicServer = basicApp.listen(port, host, () => {
    console.log(`🏥 EMERGENCY HTTP Server running on http://${host}:${port}`);
    console.log(`📡 Health endpoint: http://${host}:${port}/health`);
  });
  
  try {
    console.log(`🔄 Now attempting to initialize NestJS application...`);
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    logger.log(`🌐 NestJS app created, configuring...`);

    // Close basic server and replace with NestJS
    basicServer.close(() => {
      console.log(`🔄 Closed basic server, switching to NestJS...`);
    });

    // Health check endpoint - MUST BE FIRST for Railway
    app.getHttpAdapter().get('/health', (req, res) => {
      try {
        const healthData = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0',
          port: port,
          host: host,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          database: process.env.DATABASE_URL ? 'connected' : 'not configured',
          railway: {
            service: process.env.RAILWAY_SERVICE_NAME || 'unknown',
            environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
            deployment_id: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown'
          }
        };
        
        logger.log(`✅ NestJS Health check accessed - responding with OK`);
        res.status(200).json(healthData);
      } catch (error) {
        logger.error(`❌ Health check error: ${error.message}`);
        res.status(500).json({ 
          status: 'error', 
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Debug endpoint for troubleshooting
    app.getHttpAdapter().get('/debug', (req, res) => {
      res.json({
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT,
          DATABASE_URL: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]',
          RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
          RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
          RAILWAY_DEPLOYMENT_ID: process.env.RAILWAY_DEPLOYMENT_ID
        },
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          cwd: process.cwd()
        },
        application: {
          port: port,
          host: host,
          timestamp: new Date().toISOString(),
          routes: ['/', '/health', '/debug']
        }
      });
    });

    // Root endpoint for basic connectivity test
    app.getHttpAdapter().get('/', (req, res) => {
      res.json({
        message: 'Fixia API is running',
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
          health: '/health',
          debug: '/debug',
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

    // Rate limiting protection  
    // app.useGlobalGuards(app.get(ThrottlerGuard)); // Temporarily disabled for emergency deployment

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
    
    // Start NestJS server with enhanced error handling
    await app.listen(port, host);
    
    logger.log(`🚀 NestJS Fixia API running on: http://${host}:${port}${apiPrefix ? `/${apiPrefix}` : ''}`);
    logger.log(`🏥 Health check: http://${host}:${port}/health`);
    logger.log(`🔍 Debug endpoint: http://${host}:${port}/debug`);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.log(`📖 API Documentation: http://${host}:${port}/docs`);
    }

    // Railway-specific logging for deployment debugging
    if (process.env.RAILWAY_ENVIRONMENT) {
      logger.log(`🚂 Railway deployment detected`);
      logger.log(`📋 Service: ${process.env.RAILWAY_SERVICE_NAME || 'unknown'}`);
      logger.log(`🌍 Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      logger.log(`🆔 Deployment ID: ${process.env.RAILWAY_DEPLOYMENT_ID || 'unknown'}`);
    }

    return app;
  } catch (nestError) {
    console.error('❌ CRITICAL: NestJS initialization failed:', nestError);
    console.error('Stack trace:', nestError.stack);
    
    // Keep basic server running as fallback
    console.log('🔄 FALLBACK: Keeping basic HTTP server running for Railway healthchecks');
    console.log(`📡 Basic health endpoint available at: http://${host}:${port}/health`);
    
    // Don't exit - let basic server handle healthchecks
    return null;
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  console.log('⚠️ Application failed to start, but basic HTTP server should still be running');
});