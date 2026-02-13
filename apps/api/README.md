# PropIntel API

NestJS backend API for PropIntel AI real estate investment platform.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- Redis 7+

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
# Run Prisma migrations
pnpm run migrate

# Start API server
pnpm run start:dev

# API available at: http://localhost:3001
# Swagger UI: http://localhost:3001/api
```

## Architecture

### Module Structure

```
src/
├── common/
│   ├── decorators/      # Custom decorators (@CurrentUser, @Public)
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards (JWT)
│   ├── interceptors/    # Logging interceptor
│   ├── prisma/          # Database service
│   └── strategies/      # Passport strategies
│
├── modules/
│   ├── auth/            # Authentication (login, register)
│   ├── users/           # User management
│   ├── subscriptions/   # Stripe integration
│   ├── listings/        # Property listings
│   ├── scoring/         # AI deal scoring
│   ├── financials/      # ROI calculations
│   ├── reports/         # PDF generation
│   ├── alerts/          # User alerts
│   └── health/          # Health checks
│
└── main.ts              # Entry point
```

### Key Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Database**: Prisma ORM with PostgreSQL
- **Queue**: BullMQ for async job processing
- **Validation**: class-validator with Zod
- **Documentation**: Swagger/OpenAPI
- **Error Handling**: Global exception filter
- **Logging**: Structured logging with Pino

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Users
- `GET /users/me` - Get profile
- `PATCH /users/me` - Update profile
- `DELETE /users/me` - Delete account
- `GET /users/usage` - Get usage stats

### Listings
- `POST /listings` - Create listing
- `GET /listings` - List listings (paginated)
- `GET /listings/search` - Search listings
- `GET /listings/:id` - Get listing details
- `PATCH /listings/:id` - Update listing
- `DELETE /listings/:id` - Delete listing

### Scoring
- `POST /scoring/:listingId/score` - Score property (async)
- `GET /scoring/:listingId/score` - Get score

### Financials
- `POST /financials/:listingId` - Calculate financials
- `GET /financials/:listingId` - Get financials

### Reports
- `POST /reports/:listingId` - Generate PDF report
- `GET /reports` - List reports
- `GET /reports/:reportId` - Get report details

### Alerts
- `POST /alerts` - Create alert
- `GET /alerts` - List alerts
- `GET /alerts/:id` - Get alert details
- `PATCH /alerts/:id` - Update alert
- `DELETE /alerts/:id` - Delete alert

### Subscriptions
- `GET /subscriptions` - Get current subscription
- `POST /subscriptions/upgrade` - Upgrade plan
- `POST /subscriptions/cancel` - Cancel subscription

### Health
- `GET /health` - Liveness check
- `GET /health/ready` - Readiness check

## Database

### Tables
- `users` - User accounts
- `subscriptions` - Stripe subscriptions
- `listings` - Property listings
- `property_scores` - AI scores
- `property_financials` - Financial analysis
- `reports` - Generated reports
- `alerts` - User alerts
- `search_profiles` - Saved searches
- `usage_logs` - Usage tracking
- `audit_logs` - Compliance logs
- `delivery_logs` - Email delivery
- `country_configs` - Global config

### Running Migrations

```bash
# Create migration
pnpm run migrate:create --name migration_name

# Apply migrations
pnpm run migrate

# Check migration status
pnpm run migrate:status
```

## Testing

```bash
# Run all tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:cov
```

## Deployment

### Docker

```bash
# Build image
docker build -t propintel-api .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  propintel-api
```

### Railway

```bash
# Login
railway login

# Link to project
railway link propintel-api-prod

# Deploy
railway up
```

See [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for detailed deployment guide.

## Configuration

### Environment Variables

- `NODE_ENV` - Development/production
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `JWT_EXPIRY` - Token expiry in seconds
- `CORS_ORIGIN` - Frontend URL
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `REDIS_URL` - Redis connection
- `ANTHROPIC_API_KEY` - Claude API key
- `R2_*` - Cloudflare R2 credentials
- `SENTRY_DSN` - Error tracking

## Development Notes

### Adding a New Module

```bash
# Create module structure
mkdir src/modules/feature
touch src/modules/feature/{feature.module,feature.service,feature.controller}.ts

# Create service
nest g service modules/feature

# Create controller
nest g controller modules/feature
```

### Code Style

- TypeScript strict mode
- ESLint rules (see .eslintrc.js)
- Prettier for formatting
- Consistent error handling

### Logging

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('FeatureName');
logger.log('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

### Error Handling

All errors should return proper HTTP status codes:

```typescript
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Auth failed');
throw new ForbiddenException('Access denied');
throw new NotFoundException('Not found');
throw new ConflictException('Already exists');
throw new InternalServerErrorException('Internal error');
```

## TODO / Future

- [ ] Stripe webhook integration
- [ ] BullMQ queue setup
- [ ] AI scoring model integration
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Rate limiting per subscription tier
- [ ] WebSocket for real-time updates
- [ ] GraphQL layer
- [ ] Comprehensive test coverage (80%+)
- [ ] API versioning

## Support

- Swagger UI: `http://localhost:3001/api`
- Health check: `http://localhost:3001/health`
- Logs: Check console output

## References

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Swagger/OpenAPI](https://swagger.io)
