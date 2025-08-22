# Database Strategy - Production & Staging

## Overview
This document outlines the database configuration, migration strategy, and backup procedures for the Fixia application.

## Database Configuration

### Production Environment (Railway)
- **Provider**: PostgreSQL on Railway
- **Connection**: Managed through `DATABASE_URL` environment variable
- **Connection Pooling**: Handled by Railway with optimized settings
- **Backup**: Automatic daily backups by Railway
- **High Availability**: Railway provides built-in redundancy

### Staging Environment
- **Provider**: PostgreSQL on Railway (separate instance)
- **Purpose**: Testing migrations and new features
- **Data**: Sanitized copy of production data (personal data removed)

## Migration Strategy

### 1. Development to Staging
```bash
# In apps/api directory
npm run db:migrate      # Apply migrations in development
npm run db:generate     # Generate Prisma client
npm run build          # Build application
```

### 2. Staging to Production
- Migrations are automatically applied during Railway deployment
- Railway.json includes `npx prisma migrate deploy` in start command
- This ensures zero-downtime deployments

### 3. Migration Best Practices
- **Always test migrations in staging first**
- **Create backwards-compatible migrations when possible**
- **Use transactions for complex migrations**
- **Monitor migration performance on large tables**

## Deployment Migration Process

### Automatic Migration (Recommended)
Railway configuration automatically runs migrations during deployment:

```json
{
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start:prod"
  }
}
```

### Manual Migration (Emergency)
If automatic migration fails, manually run:

```bash
# Connect to Railway service
railway login
railway link [project-id]
railway run npx prisma migrate deploy
```

## Database Seeding

### Production Seeding
- Minimal seed data for essential categories and system data
- **Never** seed user data in production
- Run only on initial deployment

```bash
# One-time production seeding
railway run npm run db:seed -- --production
```

### Development Seeding
- Comprehensive test data for development
- Sample users, services, projects
- Reset and reseed as needed

```bash
npm run db:reset    # Reset database with seed data
npm run db:seed     # Add seed data to existing db
```

## Backup Strategy

### Automated Backups (Railway)
- **Frequency**: Daily automatic backups
- **Retention**: 7 days for free tier, 30 days for pro
- **Location**: Railway's secure backup storage
- **Recovery**: Point-in-time recovery through Railway dashboard

### Manual Backup Commands
```bash
# Create manual backup before major changes
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
railway run psql $DATABASE_URL < backup-20240821.sql
```

### Critical Operation Backups
Before major migrations or updates:
1. Create manual backup
2. Test migration in staging
3. Execute migration in production
4. Verify data integrity
5. Keep backup for 48 hours

## Performance Optimization

### Database Indexes
Current indexes defined in schema:
- User lookups: email, user_type, location
- Service searches: professional_id, category_id, price, active
- Project queries: client_id, status, budget range
- Reviews: service_id, professional_id, rating

### Connection Pooling
Production configuration:
```env
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=60000
```

### Query Optimization
- Use Prisma's built-in query optimization
- Implement pagination for large result sets
- Use database views for complex queries
- Monitor slow queries through Railway metrics

## Monitoring and Alerts

### Database Health Monitoring
- **Connection Pool**: Monitor active connections
- **Query Performance**: Track slow queries (>100ms)
- **Storage Usage**: Alert at 80% capacity
- **Backup Status**: Verify daily backup success

### Railway Monitoring
- Database metrics available in Railway dashboard
- Set up alerts for:
  - High CPU usage (>80%)
  - Memory usage (>90%)
  - Connection pool exhaustion
  - Failed migrations

## Security Best Practices

### Access Control
- Database accessed only through application
- No direct database access in production
- Separate staging and production databases
- Use Railway's built-in security features

### Data Protection
- Encrypt sensitive data at application level
- Use environment variables for all secrets
- Regular security updates through Railway
- Audit database access patterns

## Disaster Recovery

### Recovery Plan
1. **Identify Issue**: Use Railway monitoring and application logs
2. **Assess Impact**: Determine if data restoration is needed
3. **Stop Traffic**: Put application in maintenance mode if necessary
4. **Restore Data**: Use Railway backup restoration
5. **Verify Integrity**: Run data validation checks
6. **Resume Operations**: Gradually restore service

### Recovery Time Objectives
- **RTO** (Recovery Time Objective): 15 minutes
- **RPO** (Recovery Point Objective): 24 hours (last backup)
- **Critical Path**: Database → API → Frontend

### Emergency Contacts
- Railway Support: Platform-level issues
- Database Admin: [Your team's database expert]
- DevOps Lead: Infrastructure decisions

## Data Migration Checklist

### Pre-Migration
- [ ] Create manual backup
- [ ] Test migration in staging
- [ ] Verify staging data integrity
- [ ] Plan rollback procedure
- [ ] Schedule maintenance window

### During Migration
- [ ] Monitor migration progress
- [ ] Watch for errors or warnings
- [ ] Verify application starts successfully
- [ ] Test critical user flows
- [ ] Check data consistency

### Post-Migration
- [ ] Verify all services are healthy
- [ ] Run automated tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Update documentation

## Troubleshooting

### Common Migration Issues
1. **Migration Timeout**: Increase timeout or run during low traffic
2. **Constraint Violations**: Check data integrity before migration
3. **Lock Conflicts**: Ensure no long-running queries during migration
4. **Schema Changes**: Test backwards compatibility

### Debug Commands
```bash
# Check migration status
npx prisma migrate status

# View pending migrations
npx prisma migrate diff

# Generate migration without applying
npx prisma migrate dev --create-only

# Reset to specific migration
npx prisma migrate reset --to [migration-name]
```