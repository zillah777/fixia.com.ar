# Railway Dockerfile for NestJS API
FROM node:18-slim

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev --silent

# Install build dependencies
RUN npm install --save-dev @nestjs/cli prisma --silent

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]