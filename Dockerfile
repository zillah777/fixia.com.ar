# Railway Dockerfile for NestJS Backend Only
FROM node:18-alpine

WORKDIR /app

# Copy only API package.json and install dependencies
COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm ci --omit=dev

# Install build dependencies
RUN cd apps/api && npm install --save-dev @nestjs/cli prisma

# Copy only API source code and build
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate && npx nest build

# Expose port
EXPOSE 3001

# Start command with migrations
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/main.js"]