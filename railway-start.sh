#!/bin/bash
set -e

echo "🚀 Starting Railway deployment for Fixia API..."
echo "📍 Current directory: $(pwd)"

# Navigate to API directory
cd apps/api
echo "📍 Now in API directory: $(pwd)"

echo "🔍 Checking environment variables..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

# Verify build artifacts exist
if [ ! -d "dist" ]; then
  echo "❌ dist directory not found!"
  exit 1
fi

if [ ! -f "dist/main.js" ]; then
  echo "❌ main.js not found at dist/main.js!"
  echo "📂 Dist contents: $(ls -la dist)"
  exit 1
fi

echo "✅ Build artifacts verified"

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Running database migrations..."
  npx prisma migrate deploy
  echo "✅ Database migrations completed"
else
  echo "⚠️  No DATABASE_URL found, skipping migrations"
fi

# Start the production server
echo "🎯 Starting production server..."
export PORT=${PORT:-3001}
export HOST="0.0.0.0"
echo "🌐 Server will start on: $HOST:$PORT"

echo "🚀 Starting server with: node dist/main.js"
exec node dist/main.js