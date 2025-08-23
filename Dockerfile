# Railway Dockerfile for NestJS Backend Only
FROM node:18-alpine

WORKDIR /app

# Copy API directory with package files
COPY apps/api ./apps/api

# Install all dependencies (including dev for build)
RUN cd apps/api && npm install

# Generate Prisma client and build NestJS
RUN cd apps/api && npx prisma generate && npx nest build

# Remove dev dependencies to reduce image size
RUN cd apps/api && npm prune --production

# Expose port
EXPOSE 3001

# Start command with migrations
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/main.js"]