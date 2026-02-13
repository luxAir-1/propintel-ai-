# PropIntel AI - Architecture

## System Overview

PropIntel AI is a multi-tenant SaaS platform built with a modern microservices architecture optimized for scalability, performance, and security.

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Geo-distributed)               │
│                    Next.js Frontend (apps/web)               │
│              CloudFlare Workers + CDN + Edge Cache           │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────────┐  ┌──▼──────────────────┐
│  Railway (US-EAST)   │  │  Cloudflare R2      │
│   NestJS API Port    │  │   (PDF Storage)     │
│   3001               │  │                     │
│   - REST endpoints   │  │   - Reports         │
│   - Auth             │  │   - Artifacts       │
│   - Subscriptions    │  │                     │
│   - Job dispatch     │  │                     │
└───┬──────────────────┘  └─────────────────────┘
    │
    ├─────────────────────────────────────────┐
    │                                         │
┌───▼──────────────────┐  ┌──────────────────▼────┐
│    PostgreSQL        │  │      Redis             │
│   (Railway, EU)      │  │    (Railway)           │
│                      │  │                        │
│  - Users             │  │  - Session cache       │
│  - Listings          │  │  - Queue system        │
│  - Scores            │  │  - Real-time pub/sub   │
│  - Financials        │  │  - Rate limit tracking │
│  - Reports           │  │                        │
│  - Audit logs        │  │                        │
└──────────────────────┘  └────────────────────────┘
    │
    └─────────────────────────────────────────┐
                                              │
        ┌─────────────────────────────────────┼──────────┐
        │                                     │          │
    ┌───▼───────┐  ┌───────────────┐  ┌──────▼─────┐  ┌──▼──────┐
    │  Scraper  │  │  PDF Worker   │  │  Scoring   │  │  Alert  │
    │  Service  │  │   Service     │  │  Worker    │  │ Worker  │
    │ (Railway) │  │   (Railway)   │  │ (Railway)  │  │(Railway)│
    └───────────┘  └───────────────┘  └────────────┘  └─────────┘
         │                │                 │             │
         └─────────────────┴─────────────────┴─────────────┘
                      BullMQ Job Queue
```

---

## Technology Stack

### Frontend (Next.js 14)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + ShadCN UI
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Payments**: Stripe.js
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend (NestJS)
- **Framework**: NestJS (enterprise Node.js)
- **Language**: TypeScript (strict)
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Caching**: Redis
- **Task Queue**: BullMQ
- **Authentication**: JWT + refresh tokens
- **Validation**: class-validator
- **Logging**: Pino

### Infrastructure
- **Compute**: Railway.app (containerized)
- **Database**: PostgreSQL 16 (Railway, EU-WEST)
- **Cache**: Redis (Railway)
- **Storage**: Cloudflare R2
- **Frontend CDN**: Vercel
- **Monitoring**: Sentry + PostHog
- **VCS**: GitHub

---

## Core Services

### 1. API Service (NestJS)
**Port**: 3001
**Replicas**: 3 (production), 1 (development)

**Modules**:
- `AuthModule` - User authentication, JWT
- `UsersModule` - User management, profiles
- `SubscriptionModule` - Billing, Stripe webhooks
- `ListingsModule` - Property CRUD, search
- `ScoringModule` - Deal analysis dispatcher
- `FinancialsModule` - ROI calculations
- `ReportsModule` - PDF generation dispatcher
- `AlertsModule` - Alert rules & dispatch
- `HealthModule` - Liveness/readiness probes

**Key Features**:
- Rate limiting per user/subscription tier
- Idempotent request handling
- Request/response compression
- CORS strict origin validation
- Helmet for security headers

### 2. Scraper Service
**Purpose**: Property listing ingestion
**Technology**: Playwright + Node.js
**Deployment**: Railway worker

**Responsibilities**:
- Crawl MLS data sources
- Normalize property data
- Handle deduplication
- Store in PostgreSQL
- Update listing embeddings

**Architecture**:
- Scheduled jobs via BullMQ
- Proxy support for distributed crawling
- Rate limiting per source
- Error handling with retry

### 3. Scoring Worker
**Purpose**: AI-powered deal analysis
**Technology**: NestJS + OpenAI/Claude SDK
**Deployment**: Railway worker

**Pipeline**:
1. Receive job from BullMQ queue
2. Fetch property data + comps
3. Calculate financial metrics
4. Run LLM scoring model
5. Store score in PostgreSQL
6. Emit score.updated event

### 4. PDF Worker
**Purpose**: Report generation
**Technology**: Puppeteer + Node.js
**Deployment**: Railway worker

**Pipeline**:
1. Receive report job
2. Fetch property + financials
3. Render HTML template
4. Screenshot to PDF
5. Upload to R2
6. Store signed URL (7-day expiry)
7. Send email notification

### 5. Alert Worker
**Purpose**: Threshold-based notifications
**Technology**: NestJS + Resend/Twilio
**Deployment**: Railway worker

**Logic**:
- Monitor scoring queue
- Check against user alert rules
- Route email/SMS
- Log delivery attempts
- Handle bounces

---

## Data Flow

### Property Analysis Flow
```
User uploads/searches property
        ↓
API validates & stores in DB
        ↓
Dispatch to scoring queue
        ↓
Scoring Worker:
  - Fetch comps
  - Calculate financials
  - Run AI model
  - Store score
        ↓
Emit score.completed event
        ↓
Alert Worker checks rules
        ↓
Send notifications if matched
```

### Report Generation Flow
```
User clicks "Download Report"
        ↓
API validates access
        ↓
Dispatch to report queue
        ↓
PDF Worker:
  - Fetch all data
  - Render HTML
  - Generate PDF
  - Upload to R2
  - Store signed URL
        ↓
Return download link
        ↓
Send email with link
```

---

## Database Schema

### Key Tables

#### users
- id (PK)
- email (UNIQUE)
- name
- language
- timezone
- created_at, updated_at

#### subscriptions
- id (PK)
- user_id (FK, UNIQUE)
- plan (investor|pro|group)
- status (active|canceled|past_due)
- stripe_customer_id (UNIQUE)
- stripe_subscription_id (UNIQUE)
- current_period_start, current_period_end
- canceled_at

#### listings
- id (PK)
- user_id (FK)
- address, city, state, zip_code
- price, beds, baths, sqft
- listing_type
- image_url, external_id
- created_at, updated_at
- INDEX: (user_id, external_id), city, state, price, created_at

#### property_scores
- id (PK)
- listing_id (FK, UNIQUE)
- user_id (FK)
- score (0-100)
- summary (TEXT)
- strengths (ARRAY)
- weaknesses (ARRAY)
- model_version
- created_at, updated_at
- INDEX: user_id, score

#### property_financials
- id (PK)
- listing_id (FK, UNIQUE)
- user_id (FK)
- purchase_price, down_payment_percent
- loan_amount, interest_rate, loan_term
- monthly_payment
- rental_income, vacancy_rate
- monthly_expenses, cash_flow
- cap_rate, roi_percent
- projections (JSON)
- created_at, updated_at
- INDEX: user_id, cap_rate, roi_percent

#### reports
- id (PK)
- user_id (FK)
- listing_id (FK)
- title
- status (draft|generating|ready|expired)
- s3_url, signed_url
- expires_at
- created_at, updated_at
- INDEX: user_id, status

#### alerts
- id (PK)
- user_id (FK)
- name
- criteria (JSON)
- is_active
- created_at, updated_at
- INDEX: user_id, is_active

---

## Security Architecture

### Authentication
- JWT access tokens (1 hour expiry)
- Refresh tokens (7 days, httpOnly cookies)
- Token rotation on refresh
- AES-256 encryption for sensitive data

### Authorization
- Role-based access control (RBAC)
- Subscription tier enforcement
- Resource ownership validation
- Rate limiting per subscription

### Data Protection
- TLS 1.3 in transit
- AES-256 at rest (Stripe API keys, etc.)
- Sensitive fields encrypted in DB
- PII redaction in logs

### API Security
- Helmet for security headers
- CORS strict origin validation
- Request size limits
- SQL injection prevention (Prisma)
- XSS protection (CSP headers)
- CSRF tokens for state-changing ops

### Monitoring
- Sentry for error tracking
- Audit logs for compliance
- Usage logs for billing
- Rate limit tracking

---

## Performance Optimization

### Database
- Connection pooling (PgBouncer)
- Query indexing on hot columns
- Prepared statements (Prisma)
- Query caching (Redis)
- Pagination (cursor-based)

### Caching Strategy
- User profiles: 1 hour
- Listings: 24 hours
- Scores: 24 hours
- Reports: 7 days

### API Response
- Response compression (gzip)
- JSON serialization optimization
- Async job processing (no blocking)
- CDN for static assets (Vercel)

### Frontend
- Code splitting per route
- Image optimization (Next.js)
- CSS-in-JS at build time
- PWA capabilities

---

## Deployment Pipeline

### Development
```
Developer commits to feature branch
        ↓
GitHub Actions CI
  - Lint
  - Type check
  - Unit tests
  - Security scan
        ↓
Pull request review
        ↓
Merge to main
```

### Staging
```
Merge triggers Railway deploy
        ↓
Staging environment
  - Database: staging PostgreSQL
  - API: 1 replica
  - Workers: 1 replica
        ↓
Manual acceptance testing
```

### Production
```
Manual trigger or tag
        ↓
Production Railway deploy
  - Database: production (backups)
  - API: 3 replicas (load balanced)
  - Workers: 2-3 replicas
        ↓
Canary deployment (10% traffic)
        ↓
Monitor metrics
        ↓
Blue-green switch to 100%
```

---

## Scaling Considerations

### Horizontal Scaling
- API: Stateless (load balancer ready)
- Workers: Independent queue consumers
- Database: Connection pooling
- Redis: Replication for HA

### Vertical Scaling
- Increase Railway dyno size
- Database: Larger instance + read replicas
- Redis: Larger memory tier

### Future Optimization
- Microservices (separate scoring service)
- Event streaming (Kafka for analytics)
- GraphQL for frontend
- cdk for infrastructure-as-code

---

## Monitoring & Alerting

### Metrics
- API response time (p50, p95, p99)
- Error rate (5xx, 4xx)
- Queue depth
- Database connections
- Cache hit ratio
- PDF generation time
- Score calculation time

### Alerts
- API latency > 1s
- Error rate > 1%
- Queue depth > 1000
- Database CPU > 80%
- Storage > 80% capacity
- Failed jobs > 10

---

## Disaster Recovery

### Backups
- PostgreSQL: Daily automated backups (7-day retention)
- Redis: In-memory only (non-critical)
- Application code: GitHub

### Recovery Procedures
- Point-in-time recovery (PITR) for PostgreSQL
- Blue-green deployment for zero-downtime
- Traffic rerouting via load balancer

### RPO/RTO
- RPO: 24 hours (database backups)
- RTO: < 1 hour (restore + redeploy)
