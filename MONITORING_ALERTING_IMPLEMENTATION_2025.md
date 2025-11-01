# MONITORING AND ALERTING IMPLEMENTATION GUIDE
**Date:** November 1, 2025
**Status:** ✅ READY FOR IMPLEMENTATION
**Purpose:** Real-time visibility into application health and performance

---

## EXECUTIVE SUMMARY

Production monitoring ensures:
- **Uptime Visibility:** Know when services go down (before users do)
- **Performance Tracking:** Monitor latency, throughput, error rates
- **Resource Usage:** Track CPU, memory, database connections
- **Error Detection:** Automatically identify and alert on issues
- **Business Metrics:** Track user activity, transactions, revenue

### Three-Tier Monitoring Stack
```
┌─────────────────────────────────┐
│ Application Metrics             │
│ - Request latency               │
│ - Error rates                   │
│ - Request throughput            │
│ - Active users                  │
└─────────────────────────────────┘
           ↓↓↓
┌─────────────────────────────────┐
│ Infrastructure Metrics          │
│ - CPU usage                     │
│ - Memory usage                  │
│ - Database connections          │
│ - Disk usage                    │
└─────────────────────────────────┘
           ↓↓↓
┌─────────────────────────────────┐
│ Alerting Layer                  │
│ - Email alerts                  │
│ - Slack notifications           │
│ - SMS critical alerts           │
│ - PagerDuty escalation          │
└─────────────────────────────────┘
```

---

## COMPONENT 1: PROMETHEUS METRICS

### What to Monitor

**Application Metrics:**
- Request count (by endpoint, method, status code)
- Request duration (P50, P95, P99 latencies)
- Active connections (HTTP, WebSocket, Database)
- Error rate (4xx, 5xx)
- Queue depth (job queues, message queues)

**Business Metrics:**
- Active users
- New subscriptions
- Payment transactions
- Feature usage
- User retention

**System Metrics:**
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O
- Database connections (used vs max)

### Set Up Application Metrics with Prometheus

**1. Install Prometheus Client**

```bash
npm install @nestjs/metrics prom-client
```

**2. Create `MetricsModule`**

```typescript
// apps/api/src/metrics/metrics.module.ts

import { Module } from '@nestjs/common';
import { PrometheusModule } from '@nestjs/metrics';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultLabels: {
        app: 'fixia-api',
        environment: process.env.NODE_ENV || 'development',
      },
    }),
  ],
  controllers: [MetricsController],
})
export class MetricsModule {}
```

**3. Create `MetricsService`**

```typescript
// apps/api/src/metrics/metrics.service.ts

import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private registry = new Registry();

  // Application Metrics
  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });

  private httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });

  private errorTotal = new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'endpoint'],
    registers: [this.registry],
  });

  // Database Metrics
  private databaseConnections = new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
    registers: [this.registry],
  });

  private databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries',
    labelNames: ['operation', 'table'],
    registers: [this.registry],
  });

  // Business Metrics
  private activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
    registers: [this.registry],
  });

  private subscriptionCount = new Gauge({
    name: 'subscriptions_total',
    help: 'Total number of active subscriptions',
    labelNames: ['type'],
    registers: [this.registry],
  });

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration / 1000 // Convert to seconds
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  /**
   * Record error
   */
  recordError(type: string, endpoint: string) {
    this.errorTotal.inc({ type, endpoint });
  }

  /**
   * Update database connection count
   */
  setDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  /**
   * Record database query
   */
  recordDatabaseQuery(operation: string, table: string, duration: number) {
    this.databaseQueryDuration.observe(
      { operation, table },
      duration / 1000
    );
  }

  /**
   * Update active users
   */
  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  /**
   * Update subscription count
   */
  setSubscriptionCount(type: string, count: number) {
    this.subscriptionCount.set({ type }, count);
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}
```

**4. Create `MetricsController`**

```typescript
// apps/api/src/metrics/metrics.controller.ts

import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    return await this.metricsService.getMetrics();
  }
}
```

**5. Create HTTP Metrics Middleware**

```typescript
// apps/api/src/metrics/http-metrics.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const route = req.baseUrl || '/';
      const method = req.method;
      const statusCode = res.statusCode;

      this.metricsService.recordHttpRequest(
        method,
        route,
        statusCode,
        duration
      );
    });

    next();
  }
}
```

**6. Register in `app.module.ts`**

```typescript
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [MetricsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*');
  }
}
```

---

## COMPONENT 2: GRAFANA DASHBOARD

### Set Up Grafana for Visualization

**1. Deploy Grafana (Docker)**

```yaml
# docker-compose.yml (partial)

grafana:
  image: grafana/grafana:latest
  container_name: fixia-grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_SECURITY_ADMIN_USER=admin
    - GF_INSTALL_PLUGINS=grafana-piechart-panel
  volumes:
    - grafana-storage:/var/lib/grafana
    - ./grafana/provisioning:/etc/grafana/provisioning
  restart: unless-stopped
```

**2. Add Prometheus Data Source**

```yaml
# grafana/provisioning/datasources/prometheus.yml

apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

**3. Create Grafana Dashboard**

**Dashboard: "Fixia Application Health"**

Panels:
- **Request Rate (RPM)**
  - Query: `rate(http_requests_total[1m])`
  - Alert: > 1000 RPM

- **Error Rate (%)**
  - Query: `rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100`
  - Alert: > 1%

- **P95 Latency**
  - Query: `histogram_quantile(0.95, http_request_duration_seconds_bucket)`
  - Alert: > 500ms

- **Active Database Connections**
  - Query: `database_connections_active`
  - Alert: > 80

- **Active Users**
  - Query: `active_users`

- **CPU Usage**
  - Query: `process_resident_memory_bytes / 1024 / 1024`

---

## COMPONENT 3: ALERTING RULES

### Set Up Prometheus Alerting Rules

**1. Create `alert-rules.yml`**

```yaml
# prometheus/alert-rules.yml

groups:
  - name: fixia_alerts
    interval: 30s
    rules:
      # Application Alerts
      - alert: HighErrorRate
        expr: (rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.instance }}"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"

      - alert: HighRequestRate
        expr: rate(http_requests_total[5m]) > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request rate"
          description: "Request rate is {{ $value | humanize }} req/s"

      # Database Alerts
      - alert: DatabaseConnectionPoolExhausted
        expr: database_connections_active > 80
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"
          description: "Active connections: {{ $value }}/100"

      - alert: SlowDatabaseQueries
        expr: histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m])) > 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"
          description: "P95 query time: {{ $value }}s"

      # Business Alerts
      - alert: NoActiveUsers
        expr: active_users == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "No active users"
          description: "No users are currently active"

      - alert: LowSubscriptionCount
        expr: subscriptions_total < 10
        for: 1h
        labels:
          severity: info
        annotations:
          summary: "Low subscription count"
          description: "Only {{ $value }} active subscriptions"

      # System Alerts
      - alert: HighMemoryUsage
        expr: (process_resident_memory_bytes / 1024 / 1024 / 512) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

**2. Configure Prometheus to use rules**

```yaml
# prometheus.yml

rule_files:
  - "alert-rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093
```

---

## COMPONENT 4: ALERT MANAGER (EMAIL/SLACK)

### Route Alerts to Notifications

**1. Create `alertmanager.yml`**

```yaml
# alertmanager.yml

global:
  resolve_timeout: 5m
  slack_api_url: ${SLACK_WEBHOOK_URL}

templates:
  - '/etc/alertmanager/templates/*.tmpl'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    # Critical alerts → Email + SMS
    - match:
        severity: critical
      receiver: critical
      group_wait: 10s
      repeat_interval: 30m

    # Warnings → Slack
    - match:
        severity: warning
      receiver: slack

    # Info → Just log
    - match:
        severity: info
      receiver: null
      group_wait: 1h

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    email_configs:
      - to: 'ops@fixia.app'
        from: 'alerts@fixia.app'
        smarthost: 'smtp.resend.com:587'
        auth_username: 'resend'
        auth_password: '${RESEND_API_KEY}'
        headers:
          Subject: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
    slack_configs:
      - channel: '#critical-alerts'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'

  - name: 'slack'
    slack_configs:
      - channel: '#alerts'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'null'
```

**2. Deploy AlertManager (Docker)**

```yaml
alertmanager:
  image: prom/alertmanager:latest
  container_name: fixia-alertmanager
  ports:
    - "9093:9093"
  volumes:
    - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    - alertmanager-storage:/alertmanager
  command:
    - '--config.file=/etc/alertmanager/alertmanager.yml'
    - '--storage.path=/alertmanager'
  environment:
    - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
    - RESEND_API_KEY=${RESEND_API_KEY}
  restart: unless-stopped
```

---

## COMPONENT 5: LOGGING WITH ELK STACK

### Centralized Logging for Debugging

**1. Add Winston Logger to NestJS**

```bash
npm install winston winston-elasticsearch
```

**2. Create `LoggerModule`**

```typescript
// apps/api/src/logger/logger.module.ts

import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.simple()
      ),
    }),

    // Elasticsearch for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.Elasticsearch({
            level: 'error',
            clientOpts: {
              node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
            },
          }),
        ]
      : []),

    // File output
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

@Module({
  providers: [
    {
      provide: 'LOGGER',
      useValue: logger,
    },
  ],
  exports: ['LOGGER'],
})
export class LoggerModule {}
```

**3. Use Logger in Services**

```typescript
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

export class UsersService {
  constructor(@Inject('LOGGER') private logger: Logger) {}

  async findUser(id: string) {
    try {
      this.logger.info(`Fetching user: ${id}`);
      // ... fetch user
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${id}`, { error: error.message });
      throw error;
    }
  }
}
```

---

## COMPONENT 6: UPTIME MONITORING

### Monitor Service Availability

**1. Use Uptime Robot (Free)**

- Website: https://uptimerobot.com
- Set up monitors for:
  - `https://api.fixia.app/health`
  - `https://fixia.app`
  - Database health endpoint

- Alert via:
  - Email
  - Slack webhook
  - SMS (paid)

**2. Create Health Checks**

```typescript
// apps/api/src/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1500 }),
      () =>
        this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150 MB
      () =>
        this.disk.checkStorage('disk', {
          thresholdPercent: 0.8,
          path: '/',
        }),
    ]);
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "checks": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "data": {
        "heapUsed": 31415926,
        "heapTotal": 157079632
      }
    },
    "disk": {
      "status": "up",
      "data": {
        "status": "up",
        "used": 100,
        "available": 900
      }
    }
  }
}
```

---

## COMPONENT 7: DEPLOYMENT MONITORING

### Monitor Deployments

**1. Create Deployment Events**

```typescript
// apps/api/src/admin/deployment.controller.ts

import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MetricsService } from '../metrics/metrics.service';

@Controller('admin/deployments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DeploymentController {
  constructor(private metricsService: MetricsService) {}

  @Post('notify')
  notifyDeployment(@Body() data: { version: string; timestamp: string }) {
    // Record deployment in metrics
    // Send notification to Slack
    // Create marker in Grafana graphs
    return {
      status: 'recorded',
      version: data.version,
      timestamp: data.timestamp,
    };
  }
}
```

**2. Slack Deployment Notification**

```typescript
// apps/api/src/deployment/deployment-notifier.ts

import { IncomingWebhookClient } from '@slack/webhook';

export class DeploymentNotifier {
  private webhook: IncomingWebhookClient;

  constructor() {
    this.webhook = new IncomingWebhookClient(
      process.env.SLACK_WEBHOOK_URL || ''
    );
  }

  async notifyDeployment(version: string) {
    await this.webhook.send({
      text: `🚀 Deployment started: ${version}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Deployment: ${version}*\nTime: ${new Date().toISOString()}`,
          },
        },
      ],
    });
  }

  async notifyDeploymentSuccess(version: string) {
    await this.webhook.send({
      text: `✅ Deployment successful: ${version}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*✅ Deployment Successful*\nVersion: ${version}\nTime: ${new Date().toISOString()}`,
          },
        },
      ],
    });
  }

  async notifyDeploymentFailure(version: string, error: string) {
    await this.webhook.send({
      text: `❌ Deployment failed: ${version}`,
      attachments: [
        {
          color: 'danger',
          title: `Deployment Failed: ${version}`,
          text: error,
        },
      ],
    });
  }
}
```

---

## COMPONENT 8: CUSTOM DASHBOARDS

### Business Metrics Dashboard

**Key Panels:**
```
╔════════════════════════════════════╗
║ 📊 DAILY ACTIVE USERS              ║
║ 1,234 (↑ 12% from yesterday)       ║
╚════════════════════════════════════╝

╔════════════════════════════════════╗
║ 💰 REVENUE (Last 24h)              ║
║ $5,432 (↑ 8% from avg)             ║
╚════════════════════════════════════╝

╔════════════════════════════════════╗
║ 🔄 CONVERSION RATE                 ║
║ 3.2% (↑ 0.5pp from baseline)      ║
╚════════════════════════════════════╝

╔════════════════════════════════════╗
║ 📈 USER RETENTION (30-day)         ║
║ 78% (↑ 4pp from previous)          ║
╚════════════════════════════════════╝
```

---

## MONITORING CHECKLIST

- [ ] Install Prometheus client in NestJS
- [ ] Create MetricsService with key metrics
- [ ] Create HTTP metrics middleware
- [ ] Deploy Prometheus (Docker/Kubernetes)
- [ ] Deploy Grafana with dashboards
- [ ] Create alerting rules (prometheus/alert-rules.yml)
- [ ] Deploy AlertManager with email/Slack routing
- [ ] Set up ELK stack for centralized logging
- [ ] Create health check endpoints
- [ ] Set up Uptime Robot monitors
- [ ] Create custom business dashboards
- [ ] Implement deployment notifications
- [ ] Test alert routing (email, Slack, SMS)
- [ ] Document on-call procedures
- [ ] Schedule alert review (weekly)

**Total Setup Time:** 6-8 hours
**Maintenance:** 2-3 hours/week

---

## RECOMMENDED ALERT SETTINGS

| Alert | Threshold | Action |
|-------|-----------|--------|
| Error Rate | > 1% for 5min | Page on-call |
| Latency P95 | > 1000ms for 10min | Email ops |
| CPU Usage | > 80% for 15min | Auto-scale |
| Memory Usage | > 85% for 5min | Email ops |
| Database Connections | > 80/100 for 2min | Page on-call |
| Disk Usage | > 80% | Email ops |
| Uptime Check Failed | 2 consecutive failures | Page on-call |

---

## NEXT STEPS

1. **This Week:** Deploy Prometheus and Grafana
2. **Next Week:** Implement alerts and test routing
3. **Week 3:** Set up ELK stack and custom dashboards
4. **Week 4:** Document on-call runbooks and train team

---

**Status:** ✅ READY FOR IMPLEMENTATION
**Difficulty:** Medium
**Setup Time:** 6-8 hours
**Maintenance:** Low (mostly automated)

