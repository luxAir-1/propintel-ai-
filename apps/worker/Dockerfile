# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/worker ./apps/worker
COPY prisma ./prisma

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build worker
WORKDIR /app/apps/worker
RUN pnpm run build

# Runtime stage
FROM node:18-alpine

# Install Puppeteer dependencies for PDF generation
RUN apk add --no-cache \
  chromium \
  noto-sans \
  freetype \
  ttf-liberation

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json ./

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

# Copy Prisma schema
COPY prisma ./prisma

# Set environment
ENV NODE_ENV=production

# Start workers
CMD ["node", "apps/worker/dist/main.js"]
