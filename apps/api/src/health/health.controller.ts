import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';
import { Public } from '../auth/decorators/public.decorator';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../common/redis/redis.module';
import Redis from 'ioredis';

interface HealthCheckResponse {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    database: string;
    redis: string;
    memory: {
        rss: string;
        heapUsed: string;
        heapTotal: string;
    };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
    ) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    async check(): Promise<HealthCheckResponse> {
        const checks = {
            status: 'ok' as const,
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            database: await this.checkDatabase(),
            redis: await this.checkRedis(),
            memory: this.checkMemory(),
        };

        const isHealthy = checks.database === 'ok' && checks.redis === 'ok';

        return {
            ...checks,
            status: isHealthy ? 'ok' : 'degraded',
        };
    }

    @Get('ready')
    @Public()
    @ApiOperation({ summary: 'Readiness probe for Render/Kubernetes' })
    @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
    async readiness() {
        const dbOk = await this.checkDatabase() === 'ok';

        if (!dbOk) {
            throw new Error('Database not ready');
        }

        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('live')
    @Public()
    @ApiOperation({ summary: 'Liveness probe for Render/Kubernetes' })
    @ApiResponse({ status: 200, description: 'Service is alive' })
    liveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
        };
    }

    private async checkDatabase(): Promise<string> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return 'ok';
        } catch (error) {
            console.error('Database health check failed:', error);
            return 'error';
        }
    }

    private async checkRedis(): Promise<string> {
        if (!this.redis) {
            return 'not_configured';
        }

        try {
            await this.redis.ping();
            return 'ok';
        } catch (error) {
            console.error('Redis health check failed:', error);
            return 'error';
        }
    }

    private checkMemory() {
        const used = process.memoryUsage();
        return {
            rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
        };
    }
}
