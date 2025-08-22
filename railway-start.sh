#!/bin/bash
set -e

echo "🚀 Starting Railway deployment for Fixia API..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents: $(ls -la)"

# Navegar al directorio API
cd apps/api
echo "📍 Now in directory: $(pwd)"
echo "📂 API directory contents: $(ls -la)"

echo "🔍 Checking environment variables..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "PWD: $PWD"

echo "📦 Checking if node_modules exists..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules found"
  echo "📦 Dependencies: $(ls node_modules | head -10)"
else
  echo "❌ node_modules not found!"
fi

echo "📦 Checking if dist directory exists..."
if [ -d "dist" ]; then
  echo "✅ dist directory found"
  echo "📂 Dist contents: $(ls -la dist)"
else
  echo "❌ dist directory not found!"
fi

echo "🗄️ Running database migrations..."
if [ -n "$DATABASE_URL" ]; then
  echo "🔗 Testing database connection..."
  npx prisma migrate deploy
  echo "✅ Database migrations completed"
else
  echo "⚠️  No DATABASE_URL found, skipping migrations"
fi

echo "🎯 Starting production server..."
export PORT=${PORT:-3001}
export HOST="0.0.0.0"
echo "🌐 Server will start on: $HOST:$PORT"
echo "🚀 Executing: npm run start:prod"

echo "🔍 Final check - looking for main.js..."
if [ -f "dist/main.js" ]; then
  echo "✅ main.js found, starting server..."
  node dist/main.js
else
  echo "❌ main.js not found, trying npm start:prod..."
  npm run start:prod
fi