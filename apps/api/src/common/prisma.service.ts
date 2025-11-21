import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Validate DATABASE_URL before creating PrismaClient
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      const errorMessage = `
❌ DATABASE_URL environment variable is not configured!

In Railway deployment, make sure you have:
1. Added a PostgreSQL service to your project
2. Set DATABASE_URL = $\{\{Postgres.DATABASE_URL\}\} in Railway environment variables
3. The PostgreSQL service is running and connected

Current environment: ${process.env.NODE_ENV || 'unknown'}
Available env vars: ${Object.keys(process.env).filter(key => key.includes('DATA')).join(', ') || 'none related to DATABASE'}
      `.trim();

      // Use console.error before super() is called
      console.error(errorMessage);
      throw new Error('DATABASE_URL is required but not provided');
    }

    // Call super() FIRST before using 'this'
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });

    // Now we can safely use this.logger
    this.logger.log(`🗄️ Prisma initialized with DATABASE_URL: ${databaseUrl.substring(0, 20)}...`);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🗄️ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      if (process.env.NODE_ENV === 'development') {
        this.logger.log('💡 Tip: Configure your DATABASE_URL in .env file');
        this.logger.log('📝 See setup-database.sh for configuration options');
      }
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}