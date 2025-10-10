# Multi-stage build for NestJS API
FROM node:18-alpine AS builder

RUN apk add --no-cache openssl openssl-dev

WORKDIR /app
COPY packages ./packages
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npm ci --include=dev

RUN npx prisma generate

RUN npm run build

# Production stage
FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy shared packages
COPY packages ./packages

# Copy package.json only
COPY apps/api/package.json ./

# Use npm install instead of npm ci (doesn't require lock file)
RUN npm install --omit=dev --legacy-peer-deps

# Copy Prisma schema
COPY apps/api/prisma ./prisma
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3001

CMD npx prisma migrate deploy && node dist/main.js
