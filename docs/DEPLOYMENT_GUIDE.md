# Fixia Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Fixia marketplace to production using Vercel (frontend) and Railway (backend).

## Architecture
- **Frontend**: React/Vite → Vercel
- **Backend**: NestJS → Railway  
- **Database**: PostgreSQL → Railway
- **CI/CD**: GitHub Actions
- **Monitoring**: Built-in platform tools + health checks

## Prerequisites

### Required Accounts
1. **Vercel Account** - For frontend deployment
2. **Railway Account** - For backend and database hosting
3. **GitHub Repository** - With admin access for secrets configuration
4. **Domain** (Optional) - Custom domain for production

### Local Setup Requirements
- Node.js 18+ installed
- Git configured with repository access
- Access to production environment variables

## Step 1: Environment Setup

### 1.1 Production Environment Variables

Create the following environment variables in your deployment platforms:

#### Railway Environment Variables (Backend)
```env
NODE_ENV=production
DATABASE_URL=[Railway PostgreSQL URL - auto-generated]
JWT_SECRET=[Generate: openssl rand -base64 64]
PORT=3001
ALLOWED_ORIGINS=https://fixia.com.ar,https://www.fixia.com.ar
```

#### Vercel Environment Variables (Frontend)
```env
NODE_ENV=production
VITE_API_URL=https://api.fixia.com.ar
VITE_APP_NAME=Fixia
VITE_APP_VERSION=1.0.0
```

### 1.2 GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
RAILWAY_TOKEN=your_railway_token
RAILWAY_TOKEN_STAGING=your_railway_staging_token
API_URL=https://api.fixia.com.ar
FRONTEND_URL=https://fixia.com.ar
STAGING_API_URL=https://api-staging.fixia.com.ar
```

## Step 2: Railway Backend Setup

### 2.1 Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Fixia repository
5. Select the `apps/api` directory as root

### 2.2 Add PostgreSQL Database
1. In Railway project dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically generate `DATABASE_URL`
4. The database will be linked to your backend service

### 2.3 Configure Railway Service
1. Set the service name to "fixia-api"
2. Configure environment variables (see section 1.1)
3. Verify the `railway.json` configuration:
   ```json
   {
     "build": {
       "builder": "nixpacks",
       "buildCommand": "npm ci && npx prisma generate && npm run build"
     },
     "deploy": {
       "startCommand": "npx prisma migrate deploy && npm run start:prod",
       "healthcheckPath": "/health"
     }
   }
   ```

### 2.4 Deploy Backend
1. Railway will automatically deploy from your main branch
2. Monitor deployment logs for any issues
3. Verify deployment at your Railway-provided URL
4. Test health endpoint: `https://your-railway-url/health`

### 2.5 Custom Domain (Optional)
1. In Railway service settings, go to "Networking"
2. Add custom domain: `api.fixia.com.ar`
3. Configure DNS CNAME record at your domain provider
4. Wait for SSL certificate provisioning

## Step 3: Vercel Frontend Setup

### 3.1 Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure as follows:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3.2 Configure Environment Variables
1. In Vercel project settings → Environment Variables
2. Add production environment variables (see section 1.1)
3. Make sure `VITE_API_URL` points to your Railway backend URL

### 3.3 Configure Vercel Settings
Verify the `vercel.json` configuration in project root:
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/build",
  "installCommand": "cd apps/web && npm install"
}
```

### 3.4 Deploy Frontend
1. Vercel will automatically deploy from your main branch
2. Monitor deployment logs
3. Test deployment at your Vercel-provided URL
4. Verify API connectivity

### 3.5 Custom Domain (Optional)
1. In Vercel project settings → Domains
2. Add custom domain: `fixia.com.ar`
3. Configure DNS records at your domain provider:
   - A record: `@` → Vercel IP
   - CNAME record: `www` → `fixia.com.ar`
4. Wait for SSL certificate provisioning

## Step 4: GitHub Actions CI/CD

### 4.1 Workflow Configuration
The repository includes two workflow files:
- `.github/workflows/deploy.yml` - Production deployment
- `.github/workflows/staging.yml` - Staging deployment

### 4.2 Workflow Features
- **Quality Gates**: Lint, type-check, build, and test
- **Parallel Deployment**: Frontend and backend deploy simultaneously
- **Health Checks**: Post-deployment verification
- **Rollback Strategy**: Automatic failure handling

### 4.3 Deployment Triggers
- **Production**: Pushes to `main` or `master` branch
- **Staging**: Pushes to `develop` or `staging` branch
- **Preview**: Pull requests (Vercel preview deployments)

## Step 5: Database Setup

### 5.1 Production Database Migration
1. Database migrations run automatically during Railway deployment
2. The `railway.json` includes migration in the start command:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

### 5.2 Initial Data Seeding (One-time)
If you need to seed initial data:
```bash
# Connect to Railway service
railway login
railway link [your-project-id]

# Run seed script (one-time only)
railway run npm run db:seed -- --production
```

### 5.3 Database Backup Strategy
- Railway provides automatic daily backups
- Manual backup before major changes:
  ```bash
  railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
  ```

## Step 6: Monitoring and Health Checks

### 6.1 Health Check Endpoints
- **Backend Health**: `https://api.fixia.com.ar/health`
- **Response Format**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-08-21T10:30:00.000Z",
    "environment": "production",
    "version": "1.0.0"
  }
  ```

### 6.2 Monitoring Setup
1. **Railway Monitoring**: Built-in metrics and logs
2. **Vercel Analytics**: Performance and usage metrics
3. **GitHub Actions**: Deployment status and notifications

### 6.3 Alerting
Set up alerts for:
- Deployment failures
- Health check failures
- High error rates
- Performance degradation

## Step 7: Security Configuration

### 7.1 CORS Configuration
Backend CORS is configured for production domains:
```typescript
app.enableCors({
  origin: ['https://fixia.com.ar', 'https://www.fixia.com.ar'],
  credentials: true,
});
```

### 7.2 Security Headers
Vercel automatically adds security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`

### 7.3 HTTPS Enforcement
- Vercel: Automatic HTTPS with Let's Encrypt
- Railway: Automatic HTTPS for custom domains
- Headers enforce HTTPS redirects

## Step 8: Go-Live Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Custom domains configured and SSL active
- [ ] Database migrations completed
- [ ] Health checks passing
- [ ] Performance testing completed
- [ ] Security review completed

### Launch
- [ ] DNS propagation verified
- [ ] Frontend loading correctly
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Database connections stable
- [ ] Monitoring active

### Post-Launch
- [ ] Monitor error rates for first 24 hours
- [ ] Verify backup systems working
- [ ] Test all critical user flows
- [ ] Monitor performance metrics
- [ ] Document any issues for future reference

## Step 9: Maintenance and Updates

### 9.1 Regular Deployment Process
1. Create feature branch
2. Make changes and test locally
3. Create pull request → triggers staging deployment
4. Review and test on staging
5. Merge to main → triggers production deployment
6. Monitor deployment and health checks

### 9.2 Rollback Procedure
If deployment fails:
1. Check GitHub Actions logs
2. Review Railway deployment logs  
3. Revert commit if necessary
4. Redeploy previous working version
5. Fix issues and redeploy

### 9.3 Scaling Considerations
- **Railway**: Automatic scaling based on demand
- **Vercel**: Automatic edge caching and scaling
- **Database**: Monitor connection pool usage
- **Performance**: Use built-in metrics to identify bottlenecks

## Troubleshooting

### Common Issues

#### Deployment Fails
1. Check GitHub Actions logs
2. Verify environment variables
3. Test build locally
4. Check for dependency conflicts

#### API Not Accessible
1. Verify Railway deployment succeeded
2. Check health endpoint
3. Verify CORS configuration
4. Check DNS configuration

#### Database Issues
1. Verify DATABASE_URL is correct
2. Check migration logs
3. Test database connection
4. Review Prisma schema

#### Frontend Not Loading
1. Verify Vercel deployment succeeded
2. Check API URL configuration
3. Test build locally
4. Check browser console for errors

### Support Resources
- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/en/actions)

## Contact Information
For deployment issues or questions:
- **DevOps Lead**: [Your contact]
- **Backend Team**: [Team contact]
- **Frontend Team**: [Team contact]

---

**Version**: 1.0.0  
**Last Updated**: August 21, 2024  
**Next Review**: September 21, 2024