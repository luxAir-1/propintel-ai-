# Deployment Checklist

## 🚀 Quick Start: 5-Step Deployment Process

Follow this checklist to deploy PropIntel to production.

---

## ✅ Step 1: Database Migration

- [ ] Run: `npx prisma migrate dev --name add_stripe_customer_id`
- [ ] Verify: `npx prisma db push`
- [ ] Commit changes: `git add prisma && git commit -m "chore: add stripe migration"`

**Time: 5 minutes**

---

## ✅ Step 2: Create Railway Services

### PostgreSQL Database
- [ ] Go to https://railway.app/dashboard
- [ ] Click "New" → "Database" → "PostgreSQL"
- [ ] Wait for initialization
- [ ] Copy `DATABASE_URL` from "Connect" tab

### Redis Cache
- [ ] Click "New" → "Database" → "Redis"
- [ ] Wait for initialization
- [ ] Copy `REDIS_URL` from "Connect" tab

**Time: 10 minutes**

---

## ✅ Step 3: Deploy API Service

### Create Service
- [ ] In Railway Dashboard, click "New" → "GitHub Repo"
- [ ] Select `propintel-ai` repository
- [ ] Set Root Directory: `./apps/api`
- [ ] Build Command: `pnpm run build`
- [ ] Start Command: `pnpm run start`

### Add Environment Variables
- [ ] `DATABASE_URL` - Copy from PostgreSQL service
- [ ] `REDIS_URL` - Copy from Redis service
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `JWT_EXPIRY` = `3600`
- [ ] `ENCRYPTION_KEY` - Generate: `openssl rand -base64 32`

### Stripe Variables
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks (whsec_live_...)
- [ ] `STRIPE_PRICE_INVESTOR` - From Stripe Products (price_...)
- [ ] `STRIPE_PRICE_PRO` - From Stripe Products (price_...)
- [ ] `STRIPE_PRICE_GROUP` - From Stripe Products (price_...)

### Other Services
- [ ] `ANTHROPIC_API_KEY` - From Anthropic Console
- [ ] `RESEND_API_KEY` - From Resend Dashboard
- [ ] `CORS_ORIGIN` - Set to frontend URL (e.g., https://app.yoursite.com)
- [ ] `FRONTEND_URL` - Set to frontend URL
- [ ] `API_URL` - Set to API URL

### Deploy
- [ ] Push to main: `git push origin main`
- [ ] Railway auto-deploys
- [ ] Monitor logs: Watch deployment complete
- [ ] Test health check: `curl https://your-api.railway.app/health`

**Time: 15 minutes**

---

## ✅ Step 4: Deploy Worker Service

### Create Service
- [ ] Click "New" → "GitHub Repo"
- [ ] Select `propintel-ai` repository
- [ ] Set Root Directory: `./apps/worker`
- [ ] Build Command: `pnpm run build`
- [ ] Start Command: `pnpm run start`

### Add Environment Variables
- [ ] Copy all variables from API service
- [ ] Ensure `DATABASE_URL` and `REDIS_URL` match API

### Deploy
- [ ] Push to main (already done from Step 3)
- [ ] Railway auto-deploys
- [ ] Monitor logs: `railway logs --service worker`
- [ ] Verify: All 3 workers starting successfully

**Time: 5 minutes**

---

## ✅ Step 5: Deploy Frontend

### Create Vercel Project
- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Framework: Next.js
- [ ] Root Directory: `./apps/web`

### Add Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` - Set to API URL (e.g., https://your-api.railway.app)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe (pk_live_...)

### Deploy
- [ ] Click "Deploy"
- [ ] Vercel builds and deploys automatically
- [ ] Get your frontend URL from Vercel Dashboard
- [ ] Test: Visit frontend URL

**Time: 5 minutes**

---

## ✅ Step 6: Configure Stripe Webhooks

### Register Webhook Endpoint
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://your-api.railway.app/webhooks/stripe`
- [ ] Select Events:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.paid`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.deleted`
  - [ ] `customer.subscription.updated`
- [ ] Click "Add endpoint"
- [ ] Copy Signing Secret (whsec_live_...)
- [ ] Update Railway: `STRIPE_WEBHOOK_SECRET` with this value
- [ ] Restart API service

### Test Webhook
- [ ] In Stripe, select your webhook endpoint
- [ ] Click "Send test event"
- [ ] Monitor: `railway logs --service api`
- [ ] Look for: "📥 Received Stripe webhook"

**Time: 5 minutes**

---

## ✅ Step 7: Verification

### Health Checks
- [ ] API: `curl https://your-api.railway.app/health` → 200 OK
- [ ] Queue Status: `curl https://your-api.railway.app/health/queues` → shows queue stats
- [ ] Swagger: `https://your-api.railway.app/api` → documentation loads

### Authentication
- [ ] Register at frontend
- [ ] Login with credentials
- [ ] Verify JWT token works
- [ ] Check user can create listing

### Billing
- [ ] Visit billing page
- [ ] Click "Upgrade to Investor"
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify subscription activated
- [ ] Check limits enforced

### Workers
- [ ] Create listing
- [ ] Monitor: `railway logs --service worker`
- [ ] Verify: Scoring job processed
- [ ] Verify: Alert check completed

**Time: 10 minutes**

---

## 📊 Total Deployment Time: **1 hour**

---

## 🆘 Troubleshooting

### API Won't Start
```bash
# Check logs
railway logs --service api

# Common issues:
# - Missing DATABASE_URL
# - Missing REDIS_URL
# - Build failed
```

### Workers Won't Process
```bash
# Check logs
railway logs --service worker

# Common issues:
# - Can't connect to database
# - Can't connect to Redis
# - Missing ANTHROPIC_API_KEY
```

### Frontend Can't Connect
```bash
# Check:
# - NEXT_PUBLIC_API_URL is correct
# - API CORS_ORIGIN includes frontend domain
# - API is actually running
```

### Webhooks Not Arriving
```bash
# Check:
# - Endpoint URL is correct
# - STRIPE_WEBHOOK_SECRET is correct
# - Railway logs show webhook arrival
```

---

## ✨ Success!

Once all steps complete:
- ✅ Frontend live on Vercel
- ✅ API live on Railway
- ✅ Workers processing jobs
- ✅ Database persistent
- ✅ Stripe billing active
- ✅ Webhooks receiving payments

**You're in production! 🚀**

---

## 📞 Post-Deployment

### Day 1
- [ ] Monitor logs for errors
- [ ] Test all critical flows
- [ ] Verify billing works
- [ ] Check email delivery

### Week 1
- [ ] Monitor performance
- [ ] Review error tracking
- [ ] Check API response times
- [ ] Validate queue processing

### Ongoing
- [ ] Monitor uptime
- [ ] Review Stripe payments
- [ ] Check database size
- [ ] Review usage patterns

---

**All steps documented in DEPLOYMENT_GUIDE.md for detailed instructions.**
