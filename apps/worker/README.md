# PropIntel Workers

BullMQ-based job processors for PropIntel AI:
- **Scoring Worker**: AI-powered deal scoring with Claude API
- **PDF Worker**: PDF report generation with Puppeteer
- **Alerts Worker**: Alert matching and email notifications

## Quick Start

### Prerequisites
- Node.js 18+
- Redis 7+
- PostgreSQL (shared with API)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Development

```bash
# Start all workers
pnpm run start:dev

# Or start individual workers
pnpm run start:scoring    # Only scoring worker
pnpm run start:pdf        # Only PDF worker
pnpm run start:alerts     # Only alerts worker
```

Workers will connect to:
- Redis: `redis://localhost:6379` (job queue)
- PostgreSQL: Database connection
- APIs: Claude, Resend

## Architecture

### Scoring Worker

**Purpose**: AI-powered real estate deal scoring

**Process**:
1. Receive job from `scoring` queue
2. Fetch listing with financials
3. Call Claude API with property data
4. Parse AI response
5. Store score in database
6. Log usage

**Queue**: `scoring`
**Concurrency**: 3 parallel jobs
**Retries**: 3 attempts with 5s delay

**AI Prompt**:
```
Score this real estate deal from 0-100 based on:
- Location & market
- Financial metrics (ROI, cap rate, cash flow)
- Risk factors
- Growth potential

Return JSON: { score, summary, strengths, weaknesses }
```

### PDF Worker

**Purpose**: Generate professional PDF investment reports

**Process**:
1. Receive job from `reports` queue
2. Fetch listing and financial data
3. Generate HTML report template
4. Launch Puppeteer browser
5. Render HTML to PDF
6. Upload to Cloudflare R2 (TODO)
7. Generate signed URL (7-day expiry)
8. Update report in database

**Queue**: `reports`
**Concurrency**: 2 parallel jobs
**Retries**: 2 attempts with 5s delay

**Report Contents**:
- Property overview
- AI score & analysis
- Financial breakdown
- 5-year projections
- ROI & cap rate

### Alerts Worker

**Purpose**: Match properties against user alert rules and send notifications

**Process**:
1. Receive job from `alerts` queue
2. Fetch listing and user alerts
3. Check criteria matching:
   - Minimum score
   - Maximum price
   - Minimum ROI
   - Cities
   - Property types
4. Send email for matched alerts
5. Log delivery status

**Queue**: `alerts`
**Concurrency**: 5 parallel jobs
**Retries**: 3 attempts with 1s delay

**Alert Criteria**:
```json
{
  "minScore": 70,
  "maxPrice": 500000,
  "minROI": 12,
  "cities": ["Austin", "Dallas"],
  "listingTypes": ["single_family", "multi_family"]
}
```

## Queue Status

Monitor queue health:

```bash
# Check scoring queue
curl http://api:3001/queues/status

# Response:
{
  "scoring": { "waiting": 5, "active": 2, "completed": 142, "failed": 0 },
  "reports": { "waiting": 1, "active": 1, "completed": 28, "failed": 0 },
  "alerts": { "waiting": 10, "active": 3, "completed": 456, "failed": 1 }
}
```

## Integration with API

The API dispatches jobs to workers:

```typescript
// In API controller
import { dispatchScoringJob, dispatchPDFJob, dispatchAlertJob } from '@propintel/worker';

// Dispatch scoring
await dispatchScoringJob(listingId, userId);

// Dispatch PDF
await dispatchPDFJob(reportId, listingId, userId);

// Dispatch alerts
await dispatchAlertJob(listingId, userId);
```

## Configuration

### Environment Variables

```env
# Database (shared with API)
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# AI Model
ANTHROPIC_API_KEY=sk_ant_...

# Email Service
RESEND_API_KEY=re_...

# Storage (Cloudflare R2) - TODO
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=propintel-pdfs

# Logging
LOG_LEVEL=debug|info|warn|error
```

### Queue Options

Each queue has configurable options:

```typescript
// Concurrency
concurrency: 3              // Parallel jobs

// Retries
attempts: 3                 // Max attempts
backoff: exponential        // Retry strategy

// Cleanup
removeOnComplete: true      // Remove after success
removeOnFail: false         // Keep failed jobs
```

## Monitoring

### Log Output

```
[09:15:23] ✅ All workers started successfully
[09:15:24] 🟢 Scoring worker started
[09:15:24] 🟢 PDF worker started
[09:15:24] 🟢 Alerts worker started

[09:16:01] ⏳ Processing scoring job [jobId: abc123]
[09:16:05] ✅ Scoring job completed [score: 87]

[09:17:15] ❌ Scoring job failed [error: API timeout]
[09:17:20] ⏳ Retrying job (attempt 2/3)
```

### Queue Health

Monitor with BullMQ Dashboard (optional):

```bash
# Install
npm install -g bullmq-dashboard

# Run
bullmq-dashboard -p 3001
# Visit http://localhost:3001
```

## Deployment

### Docker

```bash
# Build image
docker build -t propintel-worker .

# Run all workers
docker run \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://redis:6379 \
  -e ANTHROPIC_API_KEY=... \
  propintel-worker

# Or run specific worker
docker run propintel-worker node dist/workers/scoring.worker.js
```

### Railway

```bash
# Deploy as separate service
railway deploy --service worker

# Or deploy all workers as one service
# scaling: 2 replicas for scoring, 1 for PDF, 2 for alerts
```

### Kubernetes

```yaml
# workers-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: propintel-workers
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: workers
        image: propintel-worker:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: propintel-secrets
              key: database-url
        - name: REDIS_URL
          value: redis://redis:6379
```

## Testing

### Manual Job Dispatch

```bash
# Connect to Redis
redis-cli

# Add job to queue
lpush scoring:waiting '{"data":{"listingId":"123","userId":"456"}}'

# Check queue
llen scoring:waiting
```

### Generate Test Data

```bash
# Create test listing
curl -X POST http://localhost:3001/listings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "price": 425000,
    "beds": 3,
    "baths": 2,
    "sqft": 2500
  }'

# Score it
curl -X POST http://localhost:3001/scoring/LISTING_ID/score \
  -H "Authorization: Bearer TOKEN"

# Worker will pick up the job from queue
```

## Troubleshooting

### Worker Not Processing Jobs

```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# Check job queue
redis-cli llen scoring:waiting

# Check active jobs
redis-cli llen scoring:active

# Check worker logs
pnpm run start:dev
```

### Scoring Returns Fallback Scores

If Claude API fails:
- Check `ANTHROPIC_API_KEY`
- Check API rate limits
- Worker falls back to heuristic scoring (50 + ROI/Cap rate adjustments)

### PDF Generation Slow

- Increase concurrency (careful with memory)
- Use production build (faster)
- Check available system memory
- Consider horizontal scaling (multiple worker pods)

### Alert Emails Not Sending

- Check `RESEND_API_KEY`
- Check email domain verification
- Check spam folder
- Verify user email addresses

## Performance Tuning

### Concurrency Levels

```
Scoring (AI calls):  1-3 workers  (API-limited)
PDF (I/O heavy):     2-4 workers  (CPU-limited)
Alerts (fast):       5-10 workers (I/O-limited)
```

### Memory Usage

- Scoring: ~100MB each
- PDF: ~200MB each (Puppeteer)
- Alerts: ~50MB each

Total: 3 workers = ~500MB + Node base + Redis

### Scaling Strategy

```
Development:  1 worker process (all 3 workers)
Staging:      2 processes (scoring x2, PDF x1, alerts x2)
Production:   4+ processes (distributed by type)
```

## Future Enhancements

- [ ] Cloudflare R2 integration for PDF storage
- [ ] Email template system
- [ ] SMS alerts (Twilio)
- [ ] Webhook delivery for 3rd party integrations
- [ ] BullMQ Dashboard for monitoring
- [ ] Job rate limiting per user
- [ ] Scheduled jobs (nightly alerts)
- [ ] Batch job processing
- [ ] Analytics & metrics export

## Support

- Check logs: `pnpm run start:dev`
- Monitor queues: Redis CLI or BullMQ Dashboard
- Debug jobs: Add `LOG_LEVEL=debug`
- Check database: `psql $DATABASE_URL`
