# PropIntel AI - Quick Start Guide

Get PropIntel AI running in 5 minutes.

---

## 🚀 Development (Local)

### 1. Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18+

# Install pnpm (recommended)
npm install -g pnpm
```

### 2. Clone & Install

```bash
git clone https://github.com/your-org/propintel-ai.git
cd propintel-ai
pnpm install
```

### 3. Setup Environment

```bash
cp .env.example .env.local
```

Update `.env.local` with development values:
```env
# Database (Docker)
DATABASE_URL=postgresql://propintel:propintel_dev_password@localhost:5432/propintel
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=dev-secret-change-in-prod
ENCRYPTION_KEY=dev-encryption-key-32-chars

# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:3001

# AI Keys (optional for now)
ANTHROPIC_API_KEY=sk_ant_...
```

### 4. Start Everything

```bash
# Terminal 1: Database & Cache
docker-compose up

# Terminal 2: Frontend (Next.js)
cd apps/web
pnpm dev
# → http://localhost:3000

# Terminal 3: API (NestJS) [When ready]
cd apps/api
pnpm dev
# → http://localhost:3001
```

### 5. First Interactions

1. **Homepage**: http://localhost:3000
2. **Sign Up**: http://localhost:3000/signup
3. **Login**: http://localhost:3000/login
4. **Dashboard**: http://localhost:3000/dashboard

---

## 📦 Project Structure

```
propintel-ai/
├── apps/
│   ├── web/                    # Next.js 14 Frontend
│   │   ├── src/app/           # App Router pages
│   │   ├── src/components/    # React components
│   │   ├── src/styles/        # Global styles
│   │   └── tailwind.config.ts # Design tokens
│   ├── api/                    # NestJS Backend (TODO)
│   ├── scraper/                # Playwright Scraper (TODO)
│   └── worker/                 # BullMQ Workers (TODO)
│
├── packages/
│   ├── ui/                     # Shared components
│   │   └── src/components/    # ScoreBadge, DealCard, etc.
│   ├── types/                  # TypeScript types
│   └── config/                 # Shared config
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/             # Migrations (auto-generated)
│
├── docs/
│   ├── ARCHITECTURE.md         # System design
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── DESIGN_SYSTEM.md        # UI/UX guidelines
│
└── docker-compose.yml          # Local dev stack

```

---

## 🎨 Design System

### Colors
- **Slate 950**: Primary background
- **Teal 500**: Primary accent (CTAs)
- **Amber 500**: Investment signals
- **Emerald 500**: Positive metrics

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Inter (text)

### Key Classes
```tsx
// Utility classes
.glass-effect         /* Frosted glass card */
.data-card           /* Standard card with hover */
.btn-primary         /* Teal button */
.score-badge         /* Deal score display */
```

### Example Component
```tsx
import { ScoreBadge, DealCard } from "@propintel/ui";

export function PropertyViewer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DealCard
        address="1234 Oak St"
        city="Austin"
        state="TX"
        price={425000}
        roi={22.5}
        capRate={6.8}
        score={87}
      />
    </div>
  );
}
```

---

## 📝 Frontend Pages

### Landing Page
- Path: `/`
- Components: Hero, Features, Pricing, CTA, Footer
- Status: ✅ Complete

### Authentication
- **Login**: `/login` ✅ Complete
- **Signup**: `/signup` ✅ Complete
- **Dashboard**: `/dashboard` ✅ Template

### To Build
- [ ] Dashboard (full)
- [ ] Deals Feed
- [ ] Property Detail
- [ ] Search Profiles
- [ ] Reports
- [ ] Settings
- [ ] Billing

---

## 🔧 Common Tasks

### Add a New Page

```tsx
// Create: apps/web/src/app/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <h1 className="font-display text-4xl font-bold text-white">My Page</h1>
    </div>
  );
}
```

### Add a New Component

```tsx
// Create: apps/web/src/components/MyComponent.tsx
export function MyComponent() {
  return <div className="data-card">Component content</div>;
}

// Use in page
import { MyComponent } from "@/components/MyComponent";
```

### Add a Shared UI Component

```tsx
// Create: packages/ui/src/components/MyUIComponent.tsx
export interface MyUIComponentProps {
  title: string;
}

export function MyUIComponent({ title }: MyUIComponentProps) {
  return <div>{title}</div>;
}

// Export in packages/ui/src/index.ts
export { MyUIComponent } from "./components/MyUIComponent";

// Use anywhere
import { MyUIComponent } from "@propintel/ui";
```

---

## 📚 Documentation

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Deployment**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Design System**: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- **Full README**: [README.md](README.md)

---

## 🚢 Deployment

### Preview on Vercel

```bash
# Staging deployment
cd apps/web
vercel deploy

# Production
vercel deploy --prod
```

### Backend on Railway

```bash
# When ready to deploy API
cd apps/api
railway login
railway init
railway up
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full setup.

---

## 🐛 Troubleshooting

### Database won't connect

```bash
# Check Docker is running
docker ps

# Check database is up
docker-compose logs postgres

# Recreate containers
docker-compose down
docker-compose up
```

### Port already in use

```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 [PID]

# Or use different port
PORT=3001 pnpm run dev
```

### Tailwind styles not loading

```bash
# Rebuild CSS
cd apps/web
npm run build

# Or clear cache
rm -rf .next
pnpm dev
```

---

## 📖 Learning Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test locally: `pnpm dev`
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@propintel.ai

---

## 📄 License

Proprietary & Confidential

---

## Next Steps

1. **Explore the codebase**
   ```bash
   cd apps/web
   # Check out apps/web/src/components/sections/
   # Review design tokens in tailwind.config.ts
   ```

2. **Build the API** (When ready)
   ```bash
   # Initialize NestJS structure
   cd apps/api
   npm init nest
   ```

3. **Setup Stripe webhooks**
   - See: docs/DEPLOYMENT.md

4. **Configure environment**
   - Update .env.local with real keys
   - Deploy to staging (Railway)
   - Deploy frontend to Vercel

Happy building! 🚀
