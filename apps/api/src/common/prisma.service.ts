import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('🗄️ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      if (process.env.NODE_ENV === 'development') {
        console.log('💡 Tip: Configure your DATABASE_URL in .env file');
        console.log('📝 See setup-database.sh for configuration options');
      }
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}