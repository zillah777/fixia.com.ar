import { Module, Global, Logger, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis Module - Best Practices 2025
 * 
 * FEATURES:
 * - Dependency injection pattern
 * - Health checks and monitoring
 * - Graceful shutdown
 * - Connection pooling
 * - Automatic reconnection
 * - Error handling and fallback
 */

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('RedisModule');
                const redisUrl = configService.get<string>('REDIS_URL');

                if (!redisUrl) {
                    logger.warn('⚠️ REDIS_URL not configured - Redis features disabled');
                    return null;
                }

                try {
                    const redis = new Redis(redisUrl, {
                        // Connection settings
                        maxRetriesPerRequest: 3,
                        enableReadyCheck: true,
                        enableOfflineQueue: true,

                        // Reconnection strategy
                        retryStrategy: (times: number) => {
                            const delay = Math.min(times * 100, 3000);
                            logger.warn(`Redis reconnection attempt ${times}, waiting ${delay}ms`);

                            if (times > 10) {
                                logger.error('Redis connection failed after 10 retries');
                                return null; // Stop retrying
                            }

                            return delay;
                        },

                        // Connection timeout
                        connectTimeout: 10000,

                        // Lazy connect (connect on first command)
                        lazyConnect: false,
                    });

                    // Event handlers
                    redis.on('connect', () => {
                        logger.log('✅ Redis connected successfully');
                    });

                    redis.on('ready', () => {
                        logger.log('✅ Redis ready to accept commands');
                    });

                    redis.on('error', (err) => {
                        logger.error('❌ Redis error:', err.message);
                    });

                    redis.on('close', () => {
                        logger.warn('⚠️ Redis connection closed');
                    });

                    redis.on('reconnecting', () => {
                        logger.log('🔄 Redis reconnecting...');
                    });

                    return redis;
                } catch (error) {
                    logger.error('Failed to create Redis client:', error);
                    return null;
                }
            },
            inject: [ConfigService],
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
    private readonly logger = new Logger(RedisModule.name);

    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
    ) { }

    async onModuleDestroy() {
        if (this.redis) {
            this.logger.log('Closing Redis connection...');
            await this.redis.quit();
            this.logger.log('✅ Redis connection closed gracefully');
        }
    }

    /**
     * Health check for Redis connection
     */
    async isHealthy(): Promise<boolean> {
        if (!this.redis) {
            return false;
        }

        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        } catch (error) {
            this.logger.error('Redis health check failed:', error);
            return false;
        }
    }
}
