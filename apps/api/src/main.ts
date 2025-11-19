```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import { SnakeToCamelInterceptor } from './common/interceptors/snake-to-camel.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Server port configuration
  const port = parseInt(process.env.PORT) || 3001;
  const host = '0.0.0.0';

  logger.log(`🚀 Starting Fixia API on ${ host }:${ port } `);
  logger.log(`🌍 Environment: ${ process.env.NODE_ENV || 'development' } `);

  try {
    // Create NestJS application with explicit Express platform
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose']
    });

    // Cookie Parser for httpOnly cookie support
    app.use(cookieParser());

    // Security Headers with Helmet - Production-compatible configuration
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: {
        policy: process.env.NODE_ENV === 'production' ? "cross-origin" : "same-site"
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.fixia.app", "https://fixia-api.onrender.com", "wss://fixia-api.onrender.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));

    // Health check endpoint - Simple and reliable
    app.getHttpAdapter().get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        uptime: process.uptime()
      });
    });

    // Emergency services seeding endpoint removed for security
    // This endpoint was a critical security risk (CVSS 8.1) as it allowed
    // unauthorized database manipulation in production.
    // Seeding must be performed through secure admin-only endpoints with authentication.


    // Handle common bot/crawler requests for JS files to prevent 404 errors
    app.getHttpAdapter().get('/js/:filename', (req: Request, res: Response) => {
      const filename = req.params.filename;
      logger.warn(`🤖 Bot / crawler requesting JS file: /js/${ filename } - returning empty response`);
      
      // Return empty JavaScript file to prevent 404 errors
      res.set('Content-Type', 'application/javascript');
      res.send('// File not found - empty response to prevent 404 errors');
    });

    // Root endpoint
    app.getHttpAdapter().get('/', (req: Request, res: Response) => {
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

    // Enable CORS with production-ready configuration - Updated for actual deployment URLs
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT;

    const allowedOrigins = isProduction
      ? [
        // Primary Vercel deployments
        'https://fixiaweb.vercel.app',
        'https://fixia.vercel.app',
        // Custom domains
        'https://fixia.com.ar',
        'https://www.fixia.com.ar',
        'https://fixia.app',
        'https://www.fixia.app',
        // Render.com domain
        'https://fixia-api.onrender.com',
        // Allow all Vercel preview deployments
        /https:\/\/.*\.vercel\.app$/
      ]
      : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000'];

    logger.log(`🌐 Environment: ${ process.env.NODE_ENV || 'development' } (isProduction: ${ isProduction })`);
    logger.log(`🌐 CORS enabled for origins: ${ JSON.stringify(allowedOrigins) } `);

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl, etc.)
        if (!origin) {
          logger.log(`✅ CORS allowed for request with no origin(mobile / tools)`);
          return callback(null, true);
        }

        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowedOrigin => {
          if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
          }
          return allowedOrigin === origin;
        });

        if (isAllowed) {
          logger.log(`✅ CORS allowed for origin: ${ origin } `);
          callback(null, true);
        } else {
          logger.warn(`❌ CORS blocked for origin: ${ origin } `);
          logger.warn(`   Allowed origins: ${ JSON.stringify(allowedOrigins) } `);
          // In production, block; in development, allow for debugging
          if (isProduction) {
            callback(new Error('Not allowed by CORS'));
          } else {
            logger.warn(`   ⚠️  Allowing anyway for development`);
            callback(null, true);
          }
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-Token'],
      exposedHeaders: ['Set-Cookie'],
      credentials: true,
      optionsSuccessStatus: 200,
      preflightContinue: false,
      maxAge: 86400 // Cache preflight requests for 24 hours
    });

    // Global error handling and interceptors
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalInterceptors(new RateLimitInterceptor()); // Rate limiting for POST/PUT/DELETE
    app.useGlobalInterceptors(new SnakeToCamelInterceptor()); // Transform snake_case to camelCase
    app.useGlobalInterceptors(new TransformInterceptor());

    // Global validation pipe with error formatting
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false, // Temporarily enabled to debug subscription issues
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
        .addServer('https://api.fixia.app', 'Producción')
        .addServer('https://api.fixia.com.ar', 'Producción (Legacy)')
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