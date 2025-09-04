import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMetricsMiddleware.name);
  
  // In-memory metrics (in production, use Redis or similar)
  private readonly metrics = {
    totalRequests: 0,
    authSuccesses: 0,
    authFailures: 0,
    tokenRefreshes: 0,
    suspiciousActivity: 0,
    lastReset: Date.now(),
  };

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalJson = res.json;
    
    // Track all auth-related requests
    if (req.url.startsWith('/auth/')) {
      this.metrics.totalRequests++;
    }

    // Override response to capture results
    res.json = function(body: any) {
      const duration = Date.now() - startTime;
      
      // Track authentication outcomes
      if (req.url.startsWith('/auth/')) {
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (req.url.includes('/login') || req.url.includes('/register')) {
            this.metrics.authSuccesses++;
          } else if (req.url.includes('/refresh')) {
            this.metrics.tokenRefreshes++;
          }
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          this.metrics.authFailures++;
          
          // Detect suspicious patterns
          if (body?.error_code && this.isSuspiciousActivity(req, body)) {
            this.metrics.suspiciousActivity++;
          }
        }
        
        // Log performance metrics for slow requests
        if (duration > 1000) { // > 1 second
          this.logger.warn(`Slow auth request: ${req.method} ${req.url} took ${duration}ms`);
        }
      }
      
      return originalJson.call(this, body);
    }.bind(this);

    // Reset metrics every hour for memory management
    if (Date.now() - this.metrics.lastReset > 3600000) { // 1 hour
      this.resetMetrics();
    }

    next();
  }

  private isSuspiciousActivity(req: Request, responseBody: any): boolean {
    // Define patterns that indicate suspicious activity
    const suspiciousPatterns = [
      // Multiple token invalid errors from same IP in short time
      responseBody.error_code === 'AUTH_1005' && this.isHighFrequencyRequest(req.ip),
      // Repeated refresh failures (possible token hijacking)
      responseBody.error_code === 'AUTH_1010' && req.url.includes('/refresh'),
      // Credential stuffing patterns
      responseBody.error_code === 'AUTH_1001' && this.isCredentialStuffing(req),
    ];

    return suspiciousPatterns.some(pattern => pattern);
  }

  private isHighFrequencyRequest(ip: string): boolean {
    // Simple high-frequency detection
    // In production, use more sophisticated rate limiting
    return false; // Implement based on your rate limiting strategy
  }

  private isCredentialStuffing(req: Request): boolean {
    // Detect potential credential stuffing based on patterns
    const userAgent = req.headers['user-agent'];
    const hasCommonAttackPatterns = [
      !userAgent, // Missing user agent
      userAgent?.includes('python'), // Python scripts
      userAgent?.includes('curl'), // Command line tools
      userAgent?.includes('bot'), // Bot indicators
    ].some(Boolean);

    return hasCommonAttackPatterns;
  }

  private resetMetrics(): void {
    this.logger.log('Auth metrics summary', {
      period: '1 hour',
      totalRequests: this.metrics.totalRequests,
      authSuccesses: this.metrics.authSuccesses,
      authFailures: this.metrics.authFailures,
      tokenRefreshes: this.metrics.tokenRefreshes,
      suspiciousActivity: this.metrics.suspiciousActivity,
      successRate: this.metrics.totalRequests > 0 
        ? ((this.metrics.authSuccesses / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
    });

    // Reset counters
    this.metrics.totalRequests = 0;
    this.metrics.authSuccesses = 0;
    this.metrics.authFailures = 0;
    this.metrics.tokenRefreshes = 0;
    this.metrics.suspiciousActivity = 0;
    this.metrics.lastReset = Date.now();
  }

  // Method to get current metrics (can be used by monitoring endpoints)
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.lastReset,
    };
  }
}