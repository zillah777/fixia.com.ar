# Production Monitoring Setup

## Overview
This document outlines the monitoring and observability setup for the Fixia production environment.

## Platform-Native Monitoring

### Railway (Backend & Database)
**Built-in Metrics Available:**
- CPU Usage and Memory Consumption
- Database Connection Pool Status
- Request Rate and Response Times
- Deployment History and Logs
- Health Check Status

**Access**: Railway Dashboard → Your Project → Metrics Tab

**Key Metrics to Monitor:**
- API Response Time (target: <200ms p95)
- Database Query Time (target: <100ms p95)
- Memory Usage (alert at >80%)
- Connection Pool Usage (alert at >15 connections)

### Vercel (Frontend)
**Built-in Analytics:**
- Page Views and Unique Visitors
- Core Web Vitals (LCP, FID, CLS)
- Function Execution Time
- Bandwidth Usage
- Error Rate

**Access**: Vercel Dashboard → Your Project → Analytics Tab

**Key Metrics to Monitor:**
- Core Web Vitals scores
- Page Load Time (target: <2s)
- Error Rate (alert at >1%)
- Traffic Patterns

## Health Check Monitoring

### Backend Health Endpoint
**URL**: `https://api.fixia.com.ar/health`

**Response Format**:
```json
{
  "status": "ok",
  "timestamp": "2024-08-21T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Monitoring**: Automated through GitHub Actions post-deployment

### Frontend Monitoring
**URL**: `https://fixia.com.ar`
**Check**: HTTP 200 response and basic content loading
**Frequency**: After each deployment via GitHub Actions

## Error Monitoring

### Application Errors
**Backend**: NestJS built-in error handling with structured logging
**Frontend**: React error boundaries with user-friendly error pages

### Structured Logging Format
```json
{
  "timestamp": "2024-08-21T10:30:00.000Z",
  "level": "error|warn|info|debug",
  "message": "Human readable message",
  "context": "ServiceName",
  "trace": "error-trace-id",
  "user": "user-id-if-available",
  "request": "request-id"
}
```

## Performance Monitoring

### Backend Performance
**Key Metrics**:
- API Endpoint Response Times
- Database Query Performance
- Authentication Success Rate
- File Upload Performance (if applicable)

**Monitoring Method**: Railway built-in metrics + application logs

### Frontend Performance
**Core Web Vitals Targets**:
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms  
- **CLS** (Cumulative Layout Shift): <0.1

**Monitoring Method**: Vercel Analytics + browser performance API

## Uptime Monitoring

### External Uptime Checks
**Recommended Services** (choose one):
- UptimeRobot (free tier available)
- Pingdom (paid)
- StatusCake (free tier available)

**Endpoints to Monitor**:
```
https://fixia.com.ar (every 5 minutes)
https://api.fixia.com.ar/health (every 5 minutes)
```

**Alert Thresholds**:
- 2 consecutive failures = Warning
- 5 consecutive failures = Critical Alert

### Status Page (Optional)
Create a simple status page showing:
- Frontend Status (UP/DOWN)
- API Status (UP/DOWN)  
- Database Status (UP/DOWN)
- Recent Incidents

## Alerting Strategy

### Critical Alerts (Immediate Response)
- Service completely down (5+ minute outage)
- Database connection failures
- Authentication system failures
- Security incidents

### Warning Alerts (Response within 1 hour)
- High error rates (>5%)
- Performance degradation (>2x normal response time)
- High memory/CPU usage (>90%)
- Failed deployments

### Info Alerts (Daily Review)
- Deployment successes
- Traffic spikes
- Performance improvements

## Dashboard Configuration

### Railway Dashboard
**Key Widgets**:
1. Service Health Status
2. CPU and Memory Usage (last 24h)
3. Request Rate (last 24h)
4. Database Connection Pool
5. Recent Deployment History

### Vercel Dashboard  
**Key Widgets**:
1. Page Performance (Core Web Vitals)
2. Traffic Overview (last 24h)
3. Function Performance
4. Error Rate
5. Bandwidth Usage

## Monitoring Automation

### GitHub Actions Integration
The deployment workflows include automated monitoring:

**Post-Deployment Checks**:
```yaml
- name: Health Check - Backend API
  run: |
    response=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.API_URL }}/health)
    if [ $response -ne 200 ]; then
      echo "Backend health check failed"
      exit 1
    fi
```

### Monitoring Scripts
Create monitoring scripts for local testing:

**Backend Health Check**:
```bash
#!/bin/bash
# scripts/check-api-health.sh
response=$(curl -s -w "%{http_code}" https://api.fixia.com.ar/health)
status_code="${response: -3}"
if [ "$status_code" -eq 200 ]; then
  echo "✅ API Health Check Passed"
else
  echo "❌ API Health Check Failed: $status_code"
fi
```

**Frontend Check**:
```bash
#!/bin/bash
# scripts/check-frontend.sh
response=$(curl -s -o /dev/null -w "%{http_code}" https://fixia.com.ar)
if [ "$response" -eq 200 ]; then
  echo "✅ Frontend Health Check Passed"
else
  echo "❌ Frontend Health Check Failed: $response"
fi
```

## Incident Response

### Monitoring-Based Incident Detection
1. **Automated Detection**: Platform alerts + health check failures
2. **Manual Detection**: User reports + team observation
3. **Response Time**: <5 minutes for critical, <1 hour for warnings

### Escalation Path
1. **Level 1**: Automated alerts to team Slack/email
2. **Level 2**: Page on-call engineer for critical issues
3. **Level 3**: Escalate to management for extended outages

## Performance Baselines

### Backend Performance Baselines
- **Health Check**: <50ms response time
- **Authentication**: <200ms response time
- **Database Queries**: <100ms average
- **API Endpoints**: <300ms p95 response time

### Frontend Performance Baselines
- **Initial Page Load**: <2s (LCP)
- **Route Navigation**: <500ms
- **API Call Response**: <1s perceived response
- **Error Rate**: <0.5%

## Regular Monitoring Tasks

### Daily
- [ ] Check platform dashboards for anomalies
- [ ] Review error rates and performance metrics
- [ ] Verify backup completion (if applicable)

### Weekly  
- [ ] Review traffic patterns and growth
- [ ] Check performance trend analysis
- [ ] Update monitoring thresholds if needed

### Monthly
- [ ] Review and update monitoring strategy
- [ ] Test incident response procedures
- [ ] Evaluate need for additional monitoring tools
- [ ] Performance optimization review

## Monitoring Tool Recommendations

### For Enhanced Monitoring (Optional)
**APM Tools**:
- New Relic (paid) - Full application performance monitoring
- DataDog (paid) - Comprehensive monitoring and logging
- Sentry (free tier) - Error tracking and performance

**Log Management**:
- LogTail (free tier) - Log aggregation and search
- Better Stack (paid) - Advanced logging and alerting

**Uptime Monitoring**:
- UptimeRobot (free) - Basic uptime monitoring
- Pingdom (paid) - Advanced uptime and performance monitoring

---

**Remember**: Start with platform-native monitoring and gradually add external tools based on actual needs and traffic growth.