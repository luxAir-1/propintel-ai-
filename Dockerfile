# Build stage
FROM node:20 as builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy code
COPY . /app/

# Install dependencies for API only with --ignore-workspace
RUN cd /app/apps/api && pnpm install --no-frozen-lockfile --ignore-workspace

# Build API
RUN cd /app/apps/api && pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app/apps/api

# Copy built API and node_modules from builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || true

# Expose port
EXPOSE 3001

# Start API
CMD ["node", "dist/main.js"]
