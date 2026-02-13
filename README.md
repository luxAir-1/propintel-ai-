# PropIntel AI

**AI Real Estate Investment Intelligence Platform**

A production-grade SaaS that monitors property listings, evaluates investment ROI using AI, scores deals, generates PDF reports, and sends alerts to investors.

---

## 🎯 Product Vision

- **Deal Scoring**: AI-powered scoring (0-100) in seconds
- **Financial Analysis**: Instant mortgage, expense, and cash flow projections
- **Smart Alerts**: Get notified when deals match your criteria
- **PDF Reports**: Professional reports for partners and due diligence
- **Portfolio Dashboard**: Track properties and performance metrics
- **Multi-Market**: Support for US properties with global expansion ready

---

## 📦 Monorepo Structure

```
propintel-ai/
├── apps/
│   ├── web/              # Next.js 14 frontend (Vercel)
│   ├── api/              # NestJS backend (Railway)
│   ├── scraper/          # Playwright scraping service (Railway)
│   └── worker/           # BullMQ job processing (Railway)
├── packages/
│   ├── ui/               # Shared UI components & design system
│   ├── config/           # Shared configuration
│   └── types/            # TypeScript type definitions
├── prisma/               # Database schema
├── docker/               # Docker configurations
├── docs/                 # Documentation
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **TailwindCSS** + **ShadCN UI**
- **React Hook Form** + **Zod** (validation)
- **Framer Motion** (animations)
- **Zustand** (state management)
- **Stripe.js** (payments)

### Backend
- **NestJS** (framework)
- **PostgreSQL** (Railway)
- **Prisma** (ORM)
- **Redis** (caching & queues)
- **BullMQ** (job processing)
- **pgvector** (embeddings)

### Infrastructure
- **GitHub** (source control)
- **Railway** (API, Workers, Database, Redis)
- **Vercel** (Frontend CDN)
- **Cloudflare R2** (PDF storage)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for local development)
- pnpm (recommended) or npm

### Installation

1. **Clone repository**
```bash
git clone https://github.com/your-org/propintel-ai
cd propintel-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start development stack**
```bash
# Start PostgreSQL & Redis
docker-compose up -d

# Run migrations
pnpm run migrate

# Start all services
pnpm run dev
```

Services will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`

---

## 💳 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Investor** | $79/mo | Unlimited analysis, 10 searches, basic alerts |
| **Pro** | $199/mo | Everything + unlimited searches, SMS alerts, API |
| **Group** | $999/mo | Everything + team members, white-label, 24/7 support |

---

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `subscriptions` - Stripe subscription management
- `listings` - Property listings (MLS data, external sources)
- `property_scores` - AI deal scores
- `property_financials` - ROI calculations & projections
- `reports` - Generated PDF reports
- `alerts` - User alert rules
- `search_profiles` - Saved searches
- `usage_logs` - Usage tracking (billing)
- `audit_logs` - Compliance & security

See `prisma/schema.prisma` for full schema.

---

## 🔐 Security

- **Authentication**: JWT + refresh tokens
- **Encryption**: AES-256 for sensitive data
- **Rate Limiting**: Per-user API limits by subscription tier
- **Input Validation**: Zod schemas on all endpoints
- **CORS**: Strict origin validation
- **Webhook Verification**: Stripe webhook signature validation
- **Audit Logging**: All sensitive actions logged

---

## 📈 Deployment

### Frontend (Vercel)
```bash
cd apps/web
vercel deploy
```

### Backend (Railway)
```bash
railway up
```

See `docs/DEPLOYMENT.md` for detailed deployment guides.

---

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run with coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch
```

---

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design & data flow
- [API Documentation](docs/API.md) - REST endpoints
- [Deployment Guide](docs/DEPLOYMENT.md) - Production setup
- [Environment Variables](docs/ENV.md) - Configuration reference
- [Stripe Setup](docs/STRIPE.md) - Billing configuration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 🎨 Design System

The UI follows a refined luxury aesthetic:
- **Color Palette**: Deep charcoal (#0f172a), teal accents (#06b6d4), amber highlights (#f59e0b)
- **Typography**: Playfair Display (headings), Inter (body)
- **Motion**: Smooth metric reveals, animated score badges
- **Components**: Glass morphism effects, luxury shadows

---

## 📧 Support

- Email: support@propintel.ai
- Docs: https://docs.propintel.ai
- Status: https://status.propintel.ai

---

Made with ❤️ by the PropIntel AI team
