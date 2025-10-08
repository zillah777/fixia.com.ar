# Railway Dockerfile for NestJS API (from monorepo root)
FROM node:18-slim

WORKDIR /app

# Copy API package files for better layer caching
COPY apps/api/package*.json ./

# Install dependencies
RUN npm ci --omit=dev --silent

# Install build dependencies
RUN npm install --save-dev @nestjs/cli prisma --silent

# Copy all API source files
COPY apps/api/ .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]