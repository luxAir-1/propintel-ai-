# PropIntel API ↔ Workers Queue Integration

## ✅ Complete Integration

The API and workers are now fully integrated through BullMQ Redis queues. When users perform actions, jobs are automatically dispatched to workers for async processing.

---

## 📊 Integration Architecture

```
API Layer (NestJS)
    ↓
QueueService (BullMQ + Redis)
    ↓
Redis Queue
    ↓
Worker Layer (BullMQ Workers)
    ↓
External Services (Claude, Puppeteer, Resend)
    ↓
Database (Prisma)
```

---

## 🔄 Job Flows

### 1️⃣ Listing Creation Flow

**When user creates a listing:**

```
POST /listings
  ↓
ListingsService.create()
  ├─ Create listing in DB
  ├─ Dispatch scoring job → scoring queue
  └─ Dispatch alert check job → alerts queue
  ↓
Return listing with jobIds
  ↓
[Async] Workers process jobs independently
```

**Response:**
```json
{
  "id": "listing-123",
  "address": "123 Main St",
  "price": 425000,
  "status": "scoring_queued"
}
```

---

### 2️⃣ Scoring Job Flow

**When user requests property score:**

```
POST /scoring/:listingId/score
  ↓
ScoringService.scoreProperty()
  ├─ Verify listing belongs to user
  └─ Dispatch scoring job → scoring queue
  ↓
Return jobId for polling
  ↓
GET /scoring/job/:jobId
  ↓
Return job status (queued → active → completed)
  ↓
[When complete] PropertyScore created in DB
  ↓
GET /scoring/:listingId/score
  ↓
Return final score with AI analysis
```

**Request:**
```bash
POST /scoring/listing-123/score
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "jobId": "job-456",
  "listingId": "listing-123",
  "status": "queued",
  "message": "Property is being scored. Check status with jobId."
}
```

**Job Status:**
```bash
GET /scoring/job/job-456

{
  "id": "job-456",
  "state": "active",
  "progress": 50,
  "data": { "listingId": "listing-123", "userId": "user-789" },
  "attempts": 1,
  "maxAttempts": 3
}
```

---

### 3️⃣ PDF Report Flow

**When user requests PDF report:**

```
POST /reports/:listingId
  ↓
ReportsService.generateReport()
  ├─ Create report record (status: generating)
  └─ Dispatch PDF job → reports queue
  ↓
Return reportId & jobId
  ↓
GET /reports/job/:jobId
  ↓
Return job status (queued → active → completed)
  ↓
[When complete] PDF uploaded to R2, URL stored in DB
  ↓
GET /reports/:reportId
  ↓
Return report with signed download URL
```

**Request:**
```bash
POST /reports/listing-123
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "reportId": "report-789",
  "jobId": "job-012",
  "status": "generating",
  "message": "Report is being generated. You will receive an email when ready."
}
```

---

### 4️⃣ Alert Matching Flow

**When user creates a listing (automatic):**

```
POST /listings
  ↓
ListingsService.create()
  └─ Dispatch alert check job → alerts queue
  ↓
[Async] AlertsWorker processes job
  ├─ Fetch all user active alerts
  ├─ Match listing against alert criteria
  └─ Send email for matching alerts
  ↓
DeliveryLog recorded in DB
```

**Alert Criteria:**
```json
{
  "minScore": 70,
  "maxPrice": 500000,
  "minROI": 12,
  "cities": ["Austin", "Dallas"],
  "listingTypes": ["single_family", "multi_family"]
}
```

---

## 📡 Queue Management

### Queue Service API

```typescript
// In any service that imports QueueModule

constructor(private queueService: QueueService) {}

// Dispatch scoring job
const jobId = await this.queueService.dispatchScoringJob(listingId, userId);

// Dispatch PDF job
const jobId = await this.queueService.dispatchPDFJob(reportId, listingId, userId);

// Dispatch alert job
const jobId = await this.queueService.dispatchAlertJob(listingId, userId);

// Get job status
const status = await this.queueService.getJobStatus('scoring', jobId);
// Returns:
// {
//   id: string
//   state: 'queued' | 'active' | 'completed' | 'failed'
//   progress: number
//   data: JobData
//   returnValue: any
//   failedReason?: string
//   attempts: number
//   maxAttempts: number
// }

// Get queue statistics
const stats = await this.queueService.getQueueStatus('scoring');
// Returns:
// {
//   queue: 'scoring'
//   waiting: 5
//   active: 2
//   completed: 142
//   failed: 0
// }

// Get all queues
const allStats = await this.queueService.getAllQueuesStatus();
// Returns:
// {
//   scoring: { queue, waiting, active, completed, failed }
//   reports: { queue, waiting, active, completed, failed }
//   alerts: { queue, waiting, active, completed, failed }
// }
```

---

## 🏥 Health & Monitoring

### Queue Status Endpoint

```bash
GET /health/queues
Authorization: Bearer {accessToken}

{
  "scoring": {
    "queue": "scoring",
    "waiting": 3,
    "active": 2,
    "completed": 1250,
    "failed": 5
  },
  "reports": {
    "queue": "reports",
    "waiting": 1,
    "active": 1,
    "completed": 450,
    "failed": 2
  },
  "alerts": {
    "queue": "alerts",
    "waiting": 8,
    "active": 5,
    "completed": 3200,
    "failed": 0
  }
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Redis connection (required)
REDIS_URL=redis://localhost:6379

# Or individual Redis config
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional
```

### Queue Settings

Each queue is configured with specific concurrency and retry settings:

**Scoring Queue:**
- Concurrency: 3 workers
- Max Retries: 3
- Backoff: exponential (2s, 4s, 8s)
- Timeout: 30s
- Cleanup: removeOnComplete

**Reports Queue:**
- Concurrency: 2 workers
- Max Retries: 2
- Backoff: fixed (5s)
- Timeout: 60s
- Cleanup: removeOnComplete

**Alerts Queue:**
- Concurrency: 5 workers
- Max Retries: 3
- Backoff: exponential (1s, 2s, 4s)
- Timeout: 20s
- Cleanup: removeOnComplete

---

## 🔐 Error Handling

### Automatic Retries

If a job fails, it automatically retries:

```
Attempt 1 (fail) → Wait 2s → Attempt 2
Attempt 2 (fail) → Wait 4s → Attempt 3
Attempt 3 (fail) → Mark as failed, log error
```

### Job Status Tracking

Frontend can poll job status to show progress:

```typescript
async function waitForJob(queueName: string, jobId: string) {
  let maxAttempts = 300; // 5 minutes with 1s polling

  while (maxAttempts-- > 0) {
    const status = await fetch(
      `/api/${queueName}/job/${jobId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const job = await status.json();

    if (job.state === 'completed') {
      return job.returnValue;
    }

    if (job.state === 'failed') {
      throw new Error(`Job failed: ${job.failedReason}`);
    }

    console.log(`Progress: ${job.progress}%`);
    await sleep(1000); // Poll every 1s
  }

  throw new Error('Job timeout');
}
```

---

## 📦 Files Changed/Created

### New Files
- `apps/api/src/modules/queue/queue.module.ts` - Queue module
- `apps/api/src/modules/queue/queue.service.ts` - Queue service with dispatch methods
- `apps/api/src/modules/queue/redis.service.ts` - Redis connection service
- `apps/api/API_QUEUE_INTEGRATION.md` - This file

### Updated Files
- `apps/api/src/modules/scoring/scoring.service.ts` - Added queue dispatch
- `apps/api/src/modules/scoring/scoring.controller.ts` - Added job status endpoint
- `apps/api/src/modules/scoring/scoring.module.ts` - Imported QueueModule
- `apps/api/src/modules/reports/reports.service.ts` - Added queue dispatch
- `apps/api/src/modules/reports/reports.controller.ts` - Added job status endpoint
- `apps/api/src/modules/reports/reports.module.ts` - Imported QueueModule
- `apps/api/src/modules/alerts/alerts.service.ts` - Added queue dispatch
- `apps/api/src/modules/alerts/alerts.module.ts` - Imported QueueModule
- `apps/api/src/modules/listings/listings.service.ts` - Auto-dispatch scoring & alerts
- `apps/api/src/modules/listings/listings.module.ts` - Imported QueueModule
- `apps/api/src/modules/health/health.service.ts` - Added queue status check
- `apps/api/src/modules/health/health.controller.ts` - Added /health/queues endpoint
- `apps/api/src/modules/health/health.module.ts` - Imported QueueModule
- `apps/api/src/app.module.ts` - Imported QueueModule globally

---

## 🚀 How It Works End-to-End

### Example: User Creates Listing

**Step 1: Frontend creates listing**
```typescript
const response = await fetch('/api/listings', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    address: '123 Main St',
    price: 425000,
    beds: 3,
    baths: 2,
    sqft: 2500,
    city: 'Austin',
    state: 'TX',
    financials: { /* ... */ }
  })
});

const listing = await response.json();
console.log('Listing created:', listing.id);
```

**Step 2: API processes request**
- NestJS controller receives request
- Validates user authentication
- ListingsService.create() is called
- Listing is written to database
- ScoringJob is dispatched to queue
- AlertJob is dispatched to queue
- Response returned with jobIds

**Step 3: Workers process jobs independently**
- ScoringWorker fetches listing
- Calls Claude API for AI score
- Writes PropertyScore to database
- Updates usage logs

- AlertsWorker fetches listing
- Checks all user active alerts
- Sends matching alert emails
- Logs deliveries

**Step 4: Frontend polls for results**
```typescript
// Poll job status
async function checkScoring(jobId) {
  const res = await fetch(`/api/scoring/job/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const job = await res.json();

  if (job.state === 'completed') {
    // Fetch final score
    const scoreRes = await fetch(`/api/scoring/${listingId}/score`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const score = await scoreRes.json();
    console.log('Deal Score:', score.score);
  }
}
```

---

## 🔄 Deployment Considerations

### Redis Setup

```bash
# Local development
docker run -d -p 6379:6379 redis:7

# Railway production
# Set REDIS_URL environment variable
```

### Worker Deployment

Workers run as separate service:

```bash
# Terminal 1: Start API
cd apps/api && pnpm run start:dev

# Terminal 2: Start Workers
cd apps/worker && pnpm run start:dev

# Both connect to same Redis instance
```

---

## ✅ Integration Complete

The API and workers are now fully connected:

- ✅ Queue service with Redis
- ✅ Scoring job dispatch & status tracking
- ✅ PDF generation job dispatch & status tracking
- ✅ Alert checking job dispatch & status tracking
- ✅ Auto-dispatch on listing creation
- ✅ Queue monitoring endpoints
- ✅ Job status polling endpoints
- ✅ Error handling & retries
- ✅ Production-ready configuration

**All three systems (API, Workers, Database) are now working together to process real estate investment intelligence jobs asynchronously.** 🚀
