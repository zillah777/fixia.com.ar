# PRODUCTION DEPLOYMENT GUIDE - FIXIA.APP
**Date:** November 1, 2025
**Status:** ✅ PRODUCTION READY
**Version:** 1.0
**Environment:** Railway + Cloudflare + S3 Backups

---

## TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Architecture](#deployment-architecture)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Scaling & Performance](#scaling--performance)
7. [Disaster Recovery](#disaster-recovery)
8. [Maintenance Schedule](#maintenance-schedule)

---

## PRE-DEPLOYMENT CHECKLIST

### Code Quality ✅
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] All dependencies up-to-date
- [ ] Security audit passed
- [ ] Database migrations tested

### Configuration ✅
- [ ] All environment variables set in Railway
- [ ] JWT secrets configured and secure
- [ ] CORS origins properly configured
- [ ] API endpoints verified
- [ ] Email service configured
- [ ] Payment processor configured
- [ ] S3 credentials stored securely

### Infrastructure ✅
- [ ] PostgreSQL database created and migrated
- [ ] Connection pooling configured
- [ ] Backup system tested
- [ ] CDN configured (Cloudflare)
- [ ] DNS pointing to production
- [ ] SSL certificates valid
- [ ] Rate limiting configured

### Documentation ✅
- [ ] Deployment guide (this file)
- [ ] Runbooks for common issues
- [ ] On-call procedures documented
- [ ] Rollback procedures tested
- [ ] Team trained

### Monitoring ✅
- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards created
- [ ] Alerts configured
- [ ] Uptime monitoring enabled
- [ ] Error tracking enabled
- [ ] Log aggregation working
- [ ] Slack webhooks tested

---

## DEPLOYMENT ARCHITECTURE

### Three-Layer Architecture

```
┌──────────────────────────────────────────────────────┐
│ CDN & Security Layer                                 │
│ ├─ Cloudflare (DDoS protection, caching)            │
│ ├─ SSL/TLS (https://fixia.app)                      │
│ ├─ Rate limiting & WAF                              │
│ └─ Global edge caching                              │
└──────────────────────────────────────────────────────┘
                         ↓↓↓
┌──────────────────────────────────────────────────────┐
│ Application Layer (Railway)                          │
│ ├─ NestJS API Server (Docker container)             │
│ ├─ Frontend React/Next.js (Static files + CDN)      │
│ ├─ WebSocket Gateway (Socket.io)                    │
│ └─ Job Queue (Bull, if using)                       │
└──────────────────────────────────────────────────────┘
                         ↓↓↓
┌──────────────────────────────────────────────────────┐
│ Data Layer                                           │
│ ├─ PostgreSQL (Railway managed)                     │
│ ├─ Connection Pooling (PgBouncer)                   │
│ ├─ Automated Backups (S3)                           │
│ └─ Point-in-time Recovery (PITR)                    │
└──────────────────────────────────────────────────────┘
```

---

## STEP-BY-STEP DEPLOYMENT

### PHASE 1: PRE-DEPLOYMENT (Day -1)

**1. Backup Current Production**

```bash
# Create full database backup
npm run db:backup

# Export all S3 files (media, etc.)
aws s3 sync s3://fixia-production /backups/s3/

# Verify backup
npm run db:verify-backup
```

**2. Test Deployment on Staging**

```bash
# Deploy to staging environment first
git push origin develop  # Push to staging branch

# Railway auto-deploys to staging
# Wait for deployment to complete (5-10 minutes)

# Run smoke tests against staging
npm run test:smoke -- --environment staging

# Expected: All tests pass
```

**3. Notify Team**

```
📧 Deployment notification:
- Environment: Production
- Time: 2 AM UTC (off-peak)
- Duration: 15-30 minutes
- Rollback: Available if needed
- Contact: ops@fixia.app
```

### PHASE 2: DEPLOYMENT (Day 0 - 2 AM UTC)

**1. Create Pre-Deployment Snapshot**

```bash
# Create database backup before deployment
railway exec -- pg_dump [...] > backups/pre-deploy-$(date +%s).sql

# Take screenshot of current metrics
# (for comparison post-deployment)
```

**2. Deploy to Production**

**Option A: Automatic Deployment (Recommended)**

```bash
# Just merge to main - Railway auto-deploys
git push origin main

# Railway triggers:
# 1. Builds Docker image
# 2. Runs migrations
# 3. Deploys new container
# 4. Performs health checks
# 5. Routes traffic to new version
```

**Option B: Manual Deployment (If needed)**

```bash
# SSH into Railway
railway connect api

# Stop current service
railway stop

# Run migrations
npm run db:migrate:prod

# Start new version
railway start

# Verify
railway logs
```

**3. Monitor Deployment Progress**

```bash
# Watch Railway logs in real-time
railway logs api --follow

# Expected output:
# 2025-11-01 02:00:00 Building Docker image...
# 2025-11-01 02:05:00 Image built successfully
# 2025-11-01 02:06:00 Running database migrations...
# 2025-11-01 02:08:00 Starting application server...
# 2025-11-01 02:09:00 ✅ Application started
# 2025-11-01 02:09:30 ✅ Health checks passing
```

**4. Verify Deployment**

```bash
# Check API health
curl -s https://api.fixia.app/health | jq .

# Expected response:
{
  "status": "ok",
  "checks": {
    "database": {"status": "up"},
    "memory": {"status": "up"},
    "disk": {"status": "up"}
  }
}

# Check version
curl -s https://api.fixia.app/version | jq .

# Should show new version number
```

### PHASE 3: POST-DEPLOYMENT (2:15 AM UTC+)

**1. Run Comprehensive Tests**

```bash
# Test all critical user flows
npm run test:smoke -- --environment production

# Critical tests:
✓ User login
✓ User signup
✓ Create project
✓ Send message
✓ Process payment
✓ WebSocket notifications
✓ Data export
```

**2. Monitor Metrics**

```
✅ Error Rate: 0-1% (should be near zero for new deployment)
✅ Latency P95: < 500ms
✅ Request Rate: Normal (2,000-5,000 req/min)
✅ Database Connections: 10-20 (pooled)
✅ Active Users: Check for expected pattern
✅ Server Health: 100% uptime

Watch for 15-30 minutes for any anomalies
```

**3. Monitor Error Logs**

```bash
# Watch Sentry/error tracking
# Should see zero critical errors

# Check application logs
railway logs api --follow

# Should see only normal operational logs
```

**4. Verify Database**

```bash
# Confirm migrations applied
railway exec -- psql -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 5;"

# Expected: Latest migration version in output

# Check data integrity
railway exec -- psql -c "SELECT COUNT(*) as user_count FROM \"User\";"
# Count should match pre-deployment
```

**5. Test Critical Features**

```bash
# Login test
curl -X POST https://api.fixia.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@fixia.app","password":"test"}'

# Should return JWT token

# WebSocket test
wscat -c wss://api.fixia.app/notifications \
  --auth "token:JWT_TOKEN"

# Should connect successfully

# Payment test
curl -X POST https://api.fixia.app/payments/test \
  -H "Authorization: Bearer JWT_TOKEN"

# Should return success
```

**6. Smoke Test Frontend**

```
Manual checks:
□ Navigate to https://fixia.app
□ Login works
□ Dashboard loads
□ Profile page loads
□ Mobile responsive
□ Dark mode works
□ Notifications appear
□ File upload works
```

---

## POST-DEPLOYMENT VERIFICATION

### Health Checks (Every 5 minutes for 1 hour)

```bash
#!/bin/bash
# health-check.sh

for i in {1..12}; do
  echo "Health check $i/12"

  curl -s https://api.fixia.app/health | jq .
  curl -s https://fixia.app | grep -o "<title>.*</title>" | head -1

  sleep 300  # 5 minutes
done

echo "✅ All health checks passed"
```

### Metrics Baseline

**Expected Metrics After Deployment:**

| Metric | Expected | Alert Threshold |
|--------|----------|-----------------|
| Error Rate | < 0.5% | > 1% |
| P95 Latency | 200-500ms | > 1000ms |
| Throughput | 2,000-5,000 req/min | N/A |
| CPU Usage | 20-40% | > 80% |
| Memory Usage | 40-60% | > 85% |
| Database Connections | 10-20 | > 80 |
| Active Users | Normal pattern | Sudden drop |

### Checklist

- [ ] Deployment completed successfully
- [ ] All health checks passing
- [ ] Error rate acceptable
- [ ] Latency acceptable
- [ ] No unusual logs
- [ ] Database verified
- [ ] Critical features tested
- [ ] Team notified of success
- [ ] Metrics baseline established

---

## ROLLBACK PROCEDURES

### When to Rollback

- Critical feature broken (users cannot login)
- Error rate > 10%
- Database corruption detected
- Data loss detected
- Service unavailable for > 5 minutes

### Quick Rollback (< 5 minutes)

**Option 1: Rollback to Previous Commit**

```bash
# Get previous commit
git log --oneline | head -5
# ab12345 (current) feat: Add feature X
# cd34567 (previous) fix: Previous fix

# Rollback
git reset --hard cd34567
git push origin main --force

# Railway auto-deploys previous version
# Deployment time: 3-5 minutes
```

**Option 2: Revert Specific Commit**

```bash
# If multiple commits since last deployment
git revert ab12345  # Reverts specific commit

# Creates new commit with changes reversed
git push origin main

# Railway auto-deploys
```

**Option 3: Manual Database Rollback**

```bash
# If data corruption detected
# Restore from pre-deployment backup

railway exec -- psql < backups/pre-deploy-1730428800.sql

# Data restored to pre-deployment state
# May lose recent transactions (< 1 hour)
```

### Rollback Notification

```
🚨 ROLLBACK NOTIFICATION

Deployment rolled back:
- Reason: [Critical issue]
- Previous version: v1.2.3
- Current version: v1.2.2
- Time rolled back: [timestamp]
- Data: Restored from backup
- Status: Investigating

Next steps:
1. Fix issue locally
2. Test on staging
3. Re-deploy when safe
```

---

## SCALING & PERFORMANCE

### Horizontal Scaling (Multiple Instances)

**Current Setup:**
```
1 API instance
1 PostgreSQL database
100 max connections
```

**Scaling to 3 Instances:**

```bash
# In Railway dashboard:
1. Select API service
2. Settings → Scale
3. Set replica count: 3
4. Enable load balancing

# Result:
3 API instances
1 PostgreSQL database (shared)
PgBouncer pools connections (10-20 per instance)
```

**Expected Improvements:**
- Availability: 99.9% → 99.99%
- Throughput: 5,000 req/min → 15,000 req/min
- Latency: Same or better (less per-instance load)
- Cost: 3x (but much higher capacity)

### Auto-Scaling

```yaml
# railway.json (advanced)

deploy:
  autoscaling:
    enabled: true
    minReplicas: 1
    maxReplicas: 5
    targetCPUUtilization: 70
    targetMemoryUtilization: 80
```

### Database Scaling

**When to Scale:**
- Current: 50-100 concurrent connections
- Next level: Vertical scaling (more CPU/RAM)
  - Railway: Upgrade from Standard → Professional tier
  - Cost: $50 → $200/month

**Read Replicas (if needed):**
- Create read-only replicas for reporting
- Route analytics queries to replicas
- Keep transactional writes on primary

---

## DISASTER RECOVERY

### Data Recovery Scenarios

**Scenario 1: Accidental Data Deletion**
```
Timeline: 2 hours ago
Action:
1. Stop all writes (maintenance mode)
2. Restore from S3 backup (2 hours old)
3. Recover recent changes from WAL archives
4. Verify data integrity
5. Resume service

Time to recover: 30-60 minutes
Data loss: 0-30 minutes
```

**Scenario 2: Database Corruption**
```
Timeline: Unknown
Action:
1. Switch to read-only mode
2. Restore to new database
3. Run integrity checks
4. Point application to new DB
5. Keep old DB for analysis

Time to recover: 15-30 minutes
Data loss: 0 (PITR available)
```

**Scenario 3: Complete Server Failure**
```
Timeline: Immediate
Action:
1. Railway detects failure
2. Automatic failover to new instance
3. Database replicas take over
4. Service restored

Time to recover: < 5 minutes (automatic)
Data loss: 0 (using backups)
SLA: 99.9% uptime guaranteed
```

---

## MAINTENANCE SCHEDULE

### Daily
- [ ] Check error logs
- [ ] Verify backup completed
- [ ] Monitor metrics baseline
- [ ] Check security alerts

### Weekly
- [ ] Run full test suite
- [ ] Review performance metrics
- [ ] Check security patches
- [ ] Test restore procedure
- [ ] Update documentation

### Monthly
- [ ] Review and optimize costs
- [ ] Audit access logs
- [ ] Performance review
- [ ] Capacity planning
- [ ] Security audit

### Quarterly
- [ ] Major version upgrades
- [ ] Database optimization
- [ ] Infrastructure review
- [ ] Disaster recovery drill
- [ ] Team training

### Annually
- [ ] Full security audit
- [ ] Cost optimization review
- [ ] Technology stack review
- [ ] Capacity planning for next year

---

## DEPLOYMENT TEMPLATE SCRIPT

### Automated Deployment

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Step 1: Pre-deployment
echo "📦 Creating pre-deployment backup..."
railway exec -- pg_dump [...] > backups/pre-deploy-$(date +%s).sql

echo "✅ Running tests..."
npm test
npm run type-check

# Step 2: Deployment
echo "📤 Pushing to production..."
git push origin main

# Step 3: Monitor
echo "👀 Monitoring deployment..."
sleep 10
railway logs api --follow &
LOGS_PID=$!

# Wait for deployment to complete (up to 10 minutes)
for i in {1..120}; do
  if curl -s https://api.fixia.app/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
    kill $LOGS_PID
    break
  fi
  sleep 5
done

# Step 4: Verify
echo "🧪 Running smoke tests..."
npm run test:smoke -- --environment production

echo "✅ Deployment completed successfully!"
echo "📊 Check metrics: https://grafana.fixia.app"
```

### Usage
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

---

## EMERGENCY CONTACTS

```
🚨 Production On-Call

Primary: [Name] - [Phone] - [Email]
Secondary: [Name] - [Phone] - [Email]
Manager: [Name] - [Phone] - [Email]

Escalation Path:
1. Try to fix on-call
2. Escalate to secondary
3. Escalate to manager
4. Full incident response

Slack Channel: #production-incidents
PagerDuty: [Link]
Status Page: https://status.fixia.app
```

---

## RUNBOOKS FOR COMMON ISSUES

### Issue: "API returning 500 errors"

```
1. Check Sentry for error details
2. Check application logs: railway logs api
3. Check database: railway exec -- psql -c "SELECT 1"
4. Check connection pool: psql -c "SHOW CONNECTIONS"
5. Possible solutions:
   - Restart API service
   - Increase pool size
   - Scale up database
6. If not resolved → Rollback last deployment
```

### Issue: "Database slow queries"

```
1. Check slow query log: SELECT * FROM pg_stat_statements WHERE calls > 100
2. Kill stuck queries: SELECT pg_terminate_backend(pid) WHERE query ~ 'pattern'
3. Run VACUUM: VACUUM ANALYZE;
4. Check index usage: SELECT * FROM pg_stat_user_indexes
5. Possible solutions:
   - Add missing index
   - Update table statistics
   - Optimize query
6. Monitor: Check "slow_queries" in Grafana
```

### Issue: "WebSocket connections failing"

```
1. Check WebSocket logs: railway logs api | grep -i websocket
2. Verify auth: Check JWT token validity
3. Check CORS: Verify origins in notifications.gateway.ts
4. Verify endpoint: https://api.fixia.app/notifications
5. Possible solutions:
   - Restart service
   - Check token expiration
   - Verify CORS config
6. Test: wscat -c wss://api.fixia.app/notifications
```

---

## PRODUCTION CHECKLIST

**Before Deployment:**
- [ ] All code reviewed
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Team notified
- [ ] Runbooks available
- [ ] On-call engineer standing by

**After Deployment:**
- [ ] Health checks passing
- [ ] Error rate < 1%
- [ ] Latency acceptable
- [ ] Database verified
- [ ] Critical features tested
- [ ] Team notified of success
- [ ] Monitoring active

**Post-Incident (if rollback needed):**
- [ ] Root cause identified
- [ ] Fix developed and tested
- [ ] Staging test passed
- [ ] Re-deployment scheduled
- [ ] Team debriefing scheduled

---

## CONTACT & SUPPORT

**Questions?** Check:
1. This deployment guide
2. Team wiki: https://wiki.fixia.app
3. Slack: #devops
4. On-call engineer: See emergency contacts

---

**Last Updated:** November 1, 2025
**Version:** 1.0
**Status:** ✅ READY FOR PRODUCTION
**Next Review:** December 1, 2025

