# Multi-stage build for NestJS API
FROM node:18-alpine AS builder

RUN apk add --no-cache openssl openssl-dev

WORKDIR /app
COPY packages ./packages
COPY apps/api/package*.json ./apps/api/

WORKDIR /app/apps/api
RUN npm ci --include=dev

COPY apps/api/prisma ./prisma
RUN npx prisma generate

COPY apps/api/src ./src
COPY apps/api/tsconfig*.json ./
COPY apps/api/nest-cli.json ./

RUN npm run build

FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app
COPY packages ./packages
COPY apps/api/package*.json ./

RUN npm ci --omit=dev

COPY apps/api/prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3001

CMD npx prisma migrate deploy && node dist/main.js
