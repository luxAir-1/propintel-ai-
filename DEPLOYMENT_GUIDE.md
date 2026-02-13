# PropIntel Deployment Guide

## 🚀 Complete Production Deployment

This guide walks through deploying PropIntel to production using Railway (backend) and Vercel (frontend).

---

## 📋 Prerequisites

### Required Accounts
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Stripe account (https://stripe.com)
- [ ] GitHub account (for deployments)

### Required Tools
- [ ] Git (for version control)
- [ ] Node.js 18+ (for local testing)
- [ ] PostgreSQL client (optional, for database verification)
- [ ] Railway CLI (optional, for local Railway commands)

---

## 🗄️ Step 1: Database Migration

### 1.1 Run Local Migration First

```bash
# From project root
npx prisma migrate dev --name add_stripe_customer_id

# This will:
# 1. Create a migration file
# 2. Apply schema changes
# 3. Generate updated Prisma client
```

**Output should show:**
```
✓ Created new migration: add_stripe_customer_id
✓ Migrated in XXXms
```

### 1.2 Verify Schema

```bash
npx prisma db push

# Or check directly:
npx prisma db seed  # If you have seed.ts
```

---

## 🚀 Step 2: Deploy Backend API to Railway

### 2.1 Create Railway Project

```bash
# Install Railway CLI (optional but recommended)
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway create propintel-api

# Link to existing Railway project (if already created)
railway link
```

### 2.2 Add Services to Railway

**Via Railway Dashboard:**

1. **Create PostgreSQL Database**
   - Go to Railway Dashboard
   - Click "New"
   - Select "Database" → "PostgreSQL"
   - Wait for database to initialize
   - Copy connection string

2. **Create Redis Cache**
   - Click "New"
   - Select "Database" → "Redis"
   - Wait for Redis to initialize
   - Copy connection string

3. **Create API Service**
   - Click "New"
   - Select "GitHub Repo"
   - Select propintel-ai repository
   - Configure as shown below

### 2.3 Configure API Service

**In Railway Dashboard for API Service:**

**Build Settings:**
```
- Build Command: pnpm run build
- Start Command: pnpm run start
- Root Directory: ./apps/api
```

**Environment Variables:**
```
# Database
DATABASE_URL=<from PostgreSQL service>

# Redis
REDIS_URL=<from Redis service>

# Authentication
NODE_ENV=production
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_EXPIRY=3600
ENCRYPTION_KEY=<generate with: openssl rand -base64 32>

# Stripe
STRIPE_SECRET_KEY=sk_live_... (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_live_... (from Stripe Webhooks)
STRIPE_PRICE_INVESTOR=price_... (from Stripe Products)
STRIPE_PRICE_PRO=price_... (from Stripe Products)
STRIPE_PRICE_GROUP=price_... (from Stripe Products)

# Email
RESEND_API_KEY=<from Resend Dashboard>

# AI
ANTHROPIC_API_KEY=<from Anthropic Dashboard>

# Cloud Storage (for PDFs)
R2_ACCOUNT_ID=<from Cloudflare Dashboard>
R2_ACCESS_KEY_ID=<from Cloudflare Dashboard>
R2_SECRET_ACCESS_KEY=<from Cloudflare Dashboard>
R2_BUCKET_NAME=propintel-pdfs

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-api.railway.app
```

### 2.4 Deploy API

```bash
# Push to main branch (Railway auto-deploys on push)
git push origin main

# Or manual deploy via CLI:
railway deploy --service api
```

**Monitor deployment:**
```bash
railway logs

# Should see:
# ✅ PropIntel API running on port 3001
# 📚 Swagger UI: https://your-api.railway.app/api
```

---

## 🎯 Step 3: Deploy Worker Service to Railway

### 3.1 Create Worker Service

**In Railway Dashboard:**

1. Click "New"
2. Select "GitHub Repo"
3. Select propintel-ai repository
4. **Build Settings:**
   ```
   - Root Directory: ./apps/worker
   - Build Command: pnpm run build
   - Start Command: pnpm run start
   ```

### 3.2 Configure Worker Service

**Environment Variables (same as API):**
```
DATABASE_URL=<from PostgreSQL service>
REDIS_URL=<from Redis service>
NODE_ENV=production
ANTHROPIC_API_KEY=<from Anthropic>
RESEND_API_KEY=<from Resend>
# ... etc
```

### 3.3 Deploy Worker

```bash
# Deploy via CLI or push to main
railway deploy --service worker

# Monitor:
railway logs

# Should see:
# ✅ All workers started successfully
# 🟢 Scoring worker started
# 🟢 PDF worker started
# 🟢 Alerts worker started
```

---

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Configure Vercel Project

**Via Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import GitHub repository
4. Select `apps/web` as Root Directory
5. Framework: Next.js

### 4.2 Set Environment Variables

**In Vercel Project Settings → Environment Variables:**

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (from Stripe)
```

### 4.3 Deploy Frontend

```bash
# Via Vercel CLI:
npm i -g vercel
vercel deploy --prod

# Or push to main:
git push origin main
# Vercel auto-deploys on push
```

**Verify deployment:**
```
https://your-app.vercel.app
```

---

## 🔌 Step 5: Configure Stripe Webhooks

### 5.1 Get Production Stripe Keys

1. Go to Stripe Dashboard
2. Switch to "Live" mode (top left)
3. Go to API Keys
4. Copy:
   - Secret Key (starts with `sk_live_`)
   - Add to Railway API environment variables

### 5.2 Register Webhook Endpoint

1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://your-api.railway.app/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click "Add endpoint"
6. Copy webhook signing secret (starts with `whsec_live_`)
7. Add to Railway as `STRIPE_WEBHOOK_SECRET`

### 5.3 Test Webhook

```bash
# Via Stripe Dashboard
# Webhooks → Select endpoint → Send test event

# Monitor arrival:
railway logs --service api

# Should see:
# 📥 Received Stripe webhook: checkout.session.completed
# ✅ Updated subscription for user xyz
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Test API Endpoints

```bash
API_URL="https://your-api.railway.app"

# Health check
curl ${API_URL}/health

# Swagger UI
curl ${API_URL}/api

# List subscription plans
curl ${API_URL}/subscriptions/plans
```

### 6.2 Test Authentication

```bash
# Register user
curl -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "SecurePassword123!"
  }'

# Login
curl -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

### 6.3 Test Frontend

1. Open https://your-app.vercel.app
2. Register account
3. Verify email works
4. Check dashboard loads
5. Try creating a listing
6. Verify scoring job dispatches
7. Check queue status at `/health/queues`

### 6.4 Test Stripe Integration

1. Go to billing page
2. Click "Upgrade to Investor"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify webhook processed
6. Check subscription is active
7. Verify limits enforced

---

## 📊 Production Checklist

### Database
- [ ] PostgreSQL created in Railway
- [ ] Database URL added to all services
- [ ] Migrations applied
- [ ] Backup configured

### Redis
- [ ] Redis created in Railway
- [ ] Redis URL added to all services
- [ ] Queue status confirmed

### API Service
- [ ] Deployed to Railway
- [ ] Health checks passing
- [ ] Logs clean (no errors)
- [ ] Swagger docs accessible
- [ ] CORS configured correctly

### Worker Service
- [ ] Deployed to Railway
- [ ] All 3 workers starting
- [ ] Connected to Redis and database
- [ ] Processing jobs successfully

### Frontend
- [ ] Deployed to Vercel
- [ ] API URL configured
- [ ] Stripe key configured
- [ ] Pages loading correctly

### Stripe
- [ ] Production keys in place
- [ ] Webhook endpoint registered
- [ ] Webhook signing secret stored
- [ ] Test payment processed
- [ ] Subscription activated

### DNS (Optional)
- [ ] API custom domain: `api.yourdomain.com`
- [ ] Frontend custom domain: `yourdomain.com`
- [ ] SSL certificates installed

---

## 🔒 Security Checklist

- [ ] All secrets in environment variables (never in code)
- [ ] Webhook signature verification working
- [ ] CORS origin restricted to frontend domain
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] Logs don't contain sensitive data
- [ ] HTTPS enforced on all endpoints

---

## 📈 Monitoring Setup

### Log Aggregation (Optional)
```bash
# Railway provides built-in logs
railway logs --service api
railway logs --service worker

# View real-time logs
railway logs --follow
```

### Error Tracking (Optional)
```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Configure in apps/api/src/main.ts:
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring (Optional)
```bash
# Use Pingdom, Uptime Robot, or similar
# Monitor: https://your-api.railway.app/health
# Alert if status != 200 for 5+ minutes
```

---

## 🔄 Deployment Updates

### Deploying Code Changes

```bash
# Make changes locally
git add .
git commit -m "fix: update something"

# Push to main
git push origin main

# Railway automatically deploys to API and Worker
# Vercel automatically deploys to Frontend

# Monitor deployment:
railway logs
```

### Environment Variable Changes

1. Update in Railway Dashboard
2. Restart service: Railway → Services → Restart
3. Verify in logs

### Database Schema Changes

```bash
# Create migration locally
npx prisma migrate dev --name feature_name

# Commit and push
git push origin main

# Railway runs migrations automatically on deploy
# Verify: npx prisma db seed
```

---

## 🆘 Troubleshooting

### API Won't Start
```
Check logs: railway logs --service api
Common issues:
- DATABASE_URL not set
- REDIS_URL not set
- Migration failed
- Build command failed
```

### Workers Not Processing
```
Check logs: railway logs --service worker
Common issues:
- Can't connect to Redis
- Can't connect to database
- ANTHROPIC_API_KEY not set
- Environment mismatch
```

### Frontend Can't Reach API
```
Check:
- NEXT_PUBLIC_API_URL set correctly
- API CORS origin matches frontend domain
- API is actually running: curl https://your-api.railway.app/health
```

### Stripe Webhooks Not Arriving
```
Check:
- Webhook endpoint URL correct
- Webhook signing secret matches
- Railway logs show webhook arrival
- Signature verification passing
```

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🎉 Post-Deployment

### Day 1
- Monitor logs for errors
- Test all critical flows
- Verify billing works
- Check email delivery

### Week 1
- Monitor performance
- Review error tracking
- Check API response times
- Validate queue processing

### Ongoing
- Monitor uptime
- Review Stripe payments
- Check database size
- Review usage patterns

---

## ✨ You're Live!

Once all steps are complete:
- ✅ Frontend running on Vercel
- ✅ API running on Railway
- ✅ Workers processing jobs
- ✅ Database persisting data
- ✅ Redis managing queues
- ✅ Stripe handling billing

**Ready to onboard users and start generating revenue!** 🚀
