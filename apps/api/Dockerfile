# Dockerfile for NestJS API
# Multi-stage build for production optimization
FROM node:18-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files from correct path
COPY apps/api/package*.json ./

# Install ALL dependencies (dev + prod) for build
RUN npm ci --silent

# Copy source code
COPY apps/api/ .

# Generate Prisma client with proper binary targets
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim AS production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies only
COPY apps/api/package*.json ./
RUN npm ci --omit=dev --silent

# Copy built application from build stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=base /app/prisma ./prisma

# Create non-root user for security
RUN groupadd -r nodeapp && useradd -r -g nodeapp nodeapp
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]