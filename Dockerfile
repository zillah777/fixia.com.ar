# Multi-stage build for NestJS API
FROM node:18-alpine AS builder

RUN apk add --no-cache openssl openssl-dev

WORKDIR /app
COPY packages ./packages
COPY apps/api/package*.json apps/api/package-lock.json ./apps/api/

WORKDIR /app/apps/api
RUN npm ci --include=dev

COPY apps/api/prisma ./prisma
RUN npx prisma generate

COPY apps/api/src ./src
COPY apps/api/tsconfig*.json ./
COPY apps/api/nest-cli.json ./

RUN npm run build

# Production stage
FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy shared packages
COPY packages ./packages

# Copy package files to /app (not /app/apps/api)
COPY apps/api/package*.json apps/api/package-lock.json ./

# Install production dependencies in /app
RUN npm ci --omit=dev

# Copy Prisma schema to /app
COPY apps/api/prisma ./prisma
RUN npx prisma generate

# Copy built application to /app/dist
COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3001

CMD npx prisma migrate deploy && node dist/main.js
