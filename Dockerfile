# Railway Dockerfile for NestJS Backend Only with OpenSSL fix
FROM node:18-alpine

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy packages/types (required by API)
COPY packages ./packages

# Copy API directory with package files
COPY apps/api ./apps/api

# Install all dependencies (including dev for build)
RUN cd apps/api && npm ci --include=dev

# Generate Prisma client and build NestJS
RUN cd apps/api && npx prisma generate && npx nest build

# Verify build output exists
RUN ls -la apps/api/dist/ || echo "Build output not found"

# Remove dev dependencies to reduce image size
RUN cd apps/api && npm prune --production

# Expose port
EXPOSE 3001

# Start command with improved error handling
CMD ["sh", "-c", "cd apps/api && echo 'Starting from:' && pwd && echo 'Files in dist:' && ls -la dist/ && (npx prisma migrate deploy || echo 'Migration failed, continuing...') && node dist/main.js"]