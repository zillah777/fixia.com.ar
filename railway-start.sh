#!/bin/bash
set -e

echo "🚀 Starting Railway deployment for Fixia API..."

# Navegar al directorio API
cd apps/api

echo "🔍 Checking environment variables..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."

echo "🗄️ Running database migrations..."
if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
  echo "✅ Database migrations completed"
else
  echo "⚠️  No DATABASE_URL found, skipping migrations"
fi

echo "🎯 Starting production server..."
export PORT=${PORT:-3001}
export HOST="0.0.0.0"
npm run start:prod