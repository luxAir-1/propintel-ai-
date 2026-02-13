# PropIntel AI - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- pnpm or npm
- Docker & Docker Compose (for local development)
- GitHub account with repository access
- Railway.app account
- Vercel account
- Stripe account
- Cloudflare account (for R2)

---

## Local Development Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/propintel-ai.git
cd propintel-ai
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
# Database
DATABASE_URL=postgresql://propintel:propintel_dev_password@localhost:5432/propintel
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-dev-secret-change-in-prod
ENCRYPTION_KEY=your-32-char-encryption-key

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Email
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=your-email@resend.dev
SMTP_PASSWORD=your-resend-api-key

# AI
ANTHROPIC_API_KEY=sk_ant_...
```

### 3. Start Services

```bash
# Terminal 1: Database & Cache
docker-compose up

# Terminal 2: Frontend
cd apps/web && pnpm dev
# Runs on http://localhost:3000

# Terminal 3: API
cd apps/api && pnpm dev
# Runs on http://localhost:3001
```

### 4. Database Migrations

```bash
# Apply migrations
pnpm run migrate

# Seed test data (optional)
pnpm run seed
```

---

## Staging Deployment (Railway)

### 1. Create Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init
```

### 2. Add Services

```bash
# Create PostgreSQL service
railway add
# Select: PostgreSQL

# Create Redis service
railway add
# Select: Redis

# Create API service
railway add
# Select: Node.js
```

### 3. Configure Environment

```bash
# Set environment variables
railway variables

# Or via CLI:
railway variables set NODE_ENV=staging
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -c 32)
railway variables set STRIPE_SECRET_KEY=sk_test_...
```

### 4. Deploy API

```bash
cd apps/api

# Link to Railway project
railway link [project-id]

# Deploy
railway up

# View logs
railway logs
```

### 5. Deploy Workers

```bash
# Scoring Worker
cd apps/worker
railway up

# Scraper Service
cd apps/scraper
railway up
```

### 6. Database Setup

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Run migrations
pnpm run migrate
```

---

## Production Deployment

### 1. Vercel (Frontend)

#### Option A: GitHub Integration
1. Push code to GitHub
2. Login to https://vercel.com
3. Click "New Project"
4. Select `apps/web` as root directory
5. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.propintel.app`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
6. Deploy

#### Option B: CLI
```bash
cd apps/web

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL https://api.propintel.app
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY pk_live_...

# Rebuild with env
vercel deploy --prod
```

### 2. Railway (Backend)

#### API Service
```bash
cd apps/api

# Create production project
railway init --name propintel-api-prod

# Add PostgreSQL (production tier)
railway add
# Select: PostgreSQL
# Tier: Pro

# Add Redis
railway add
# Select: Redis

# Configure 3 replicas
railway variables set RAILWAY_REPLICAS=3

# Deploy
railway up
```

#### Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://propintel.app
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_EXPIRY=3600
railway variables set ENCRYPTION_KEY=$(openssl rand -c 32)
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set ANTHROPIC_API_KEY=sk_ant_...
railway variables set R2_ACCOUNT_ID=...
railway variables set R2_ACCESS_KEY_ID=...
railway variables set R2_SECRET_ACCESS_KEY=...
railway variables set R2_BUCKET_NAME=propintel-pdfs
```

#### Health Checks
```bash
# Configure in Railway UI
Health Check Endpoint: /health
Interval: 30s
Timeout: 10s
```

### 3. Setup Stripe Webhooks

```bash
# Stripe Dashboard > Webhooks
# Add endpoint: https://api.propintel.app/webhooks/stripe

# Events to subscribe:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### 4. Setup Cloudflare R2

```bash
# Create R2 bucket
# Bucket name: propintel-pdfs

# Create API token with R2 access
# Store in Railway environment:
railway variables set R2_ACCOUNT_ID=[your-account-id]
railway variables set R2_ACCESS_KEY_ID=[token-id]
railway variables set R2_SECRET_ACCESS_KEY=[token-secret]
```

### 5. Setup Email (Resend)

```bash
# Get API key from https://resend.com
railway variables set SMTP_PASSWORD=[resend-api-key]
```

---

## Database Migrations

### Create Migration

```bash
# Schema change
pnpm run migrate:create --name add_new_field

# Edit migration in prisma/migrations/
# Run migration
pnpm run migrate
```

### Backup Before Deployment

```bash
# PostgreSQL dump
pg_dump postgresql://user:pass@host/dbname > backup.sql

# Restore if needed
psql postgresql://user:pass@host/dbname < backup.sql
```

---

## Monitoring & Logging

### Sentry Setup

```bash
# Create Sentry project at https://sentry.io
# Get DSN

railway variables set SENTRY_DSN=https://...@sentry.io/...

# In API code:
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### View Logs

```bash
# Railway logs
railway logs -f

# Vercel logs
vercel logs

# Stream all services
railway logs --all
```

---

## Zero-Downtime Deployment

### Blue-Green Strategy

1. Deploy new version to staging slot
2. Run smoke tests
3. Switch traffic router to new version
4. Monitor metrics
5. Keep old version as rollback

```bash
# Railway supports this via traffic routing
railway variables set TRAFFIC_WEIGHT=100  # Route 100% to new
```

---

## Scaling Configuration

### API Service

```bash
# Increase replicas for load
railway variables set RAILWAY_REPLICAS=3

# CPU: 2048 MB
# RAM: 512 MB
```

### Database

```bash
# Monitor connections
SELECT count(*) FROM pg_stat_activity;

# If needed, upgrade to Railway Pro tier
```

### Redis

```bash
# Monitor memory usage
MEMORY USAGE

# Upgrade if needed
```

---

## Rollback Procedure

### Vercel

```bash
# View deployments
vercel list

# Rollback to previous
vercel rollback [deployment-id]
```

### Railway

```bash
# View deployments
railway logs --deployment-id [id]

# Rollback
railway rollback [deployment-id]
```

---

## Security Checklist

Before production deployment:

- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS (automatic on Vercel & Railway)
- [ ] Configure CORS properly
- [ ] Rotate all API keys regularly
- [ ] Enable CSRF protection
- [ ] Set secure cookies (httpOnly, sameSite)
- [ ] Rate limiting enabled
- [ ] Stripe webhook verification active
- [ ] Database backups automated
- [ ] Sentry error tracking enabled
- [ ] Security headers configured (Helmet)
- [ ] Secrets not in code/git

---

## Performance Tuning

### Database

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM listings WHERE city = 'Austin';

-- Create index if needed
CREATE INDEX idx_listings_city ON listings(city);
```

### Redis Caching

```bash
# Monitor cache hit ratio
INFO stats
# Check: keyspace_hits / (keyspace_hits + keyspace_misses)

# Target: > 90% hit ratio
```

### API Response Times

```bash
# Monitor in production
# API p95 latency should be < 500ms
# Reports p95 should be < 5s
```

---

## Disaster Recovery

### Database Backup

```bash
# Automated daily backups on Railway (Pro plan)
# Retention: 7 days

# Manual backup
pg_dump $DATABASE_URL > prod-backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < prod-backup-20240213.sql
```

### Recovery Procedure

1. Alert team in #incidents Slack
2. Assess impact scope
3. Restore from latest backup
4. Verify data integrity
5. Switch traffic back
6. Post-mortem analysis

---

## Support & Troubleshooting

### Common Issues

**API won't start**
```bash
railway logs
# Check for database connection errors
# Verify DATABASE_URL is correct
```

**High database connections**
```bash
# Check for connection leaks
SELECT count(*) FROM pg_stat_activity;

# Restart service
railway up --force
```

**Redis memory full**
```bash
# Check memory
MEMORY STATS

# Clear cache
FLUSHDB
```

### Contact

- Railway Support: https://railway.app/support
- Vercel Support: https://vercel.com/support
- Stripe Support: https://support.stripe.com
