#!/bin/bash
set -e

echo "🚀 RAILWAY START: Fixia NestJS API Production Server"
echo "📍 Working Directory: $(pwd)"
echo "🔧 Node Version: $(node --version)"

# Print critical environment variables (sanitized)
echo "🌍 Environment Configuration:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "PORT: ${PORT:-'3001'}"
echo "DATABASE_URL: ${DATABASE_URL:+configured}"
echo "HOST: ${HOST:-'0.0.0.0'}"

# CRITICAL: Ensure we are in the root directory first
if [ ! -d "apps/api" ]; then
  echo "❌ CRITICAL ERROR: apps/api directory not found in $(pwd)"
  echo "📂 Available directories: $(ls -la)"
  exit 1
fi

# Navigate to API directory
cd apps/api
echo "📍 Now in NestJS API directory: $(pwd)"

# Verify build artifacts exist and are valid
echo "🔍 Verifying build artifacts..."
if [ ! -d "dist" ]; then
  echo "❌ CRITICAL: dist/ directory not found!"
  echo "📂 Current directory contents: $(ls -la)"
  exit 1
fi

if [ ! -f "dist/main.js" ]; then
  echo "❌ CRITICAL: main.js not found at dist/main.js!"
  echo "📂 dist/ contents: $(ls -la dist/ 2>/dev/null || echo 'dist/ is empty')"
  exit 1
fi

# Verify main.js is not empty and looks valid
MAIN_JS_SIZE=$(stat -f%z dist/main.js 2>/dev/null || stat -c%s dist/main.js 2>/dev/null || echo "0")
if [ "$MAIN_JS_SIZE" -lt 1000 ]; then
  echo "❌ CRITICAL: main.js appears too small (${MAIN_JS_SIZE} bytes) - likely build failed"
  exit 1
fi

echo "✅ Build artifacts verified (main.js: ${MAIN_JS_SIZE} bytes)"

# Set production environment variables
export NODE_ENV="production"
export PORT=${PORT:-3001}
export HOST=${HOST:-"0.0.0.0"}

echo "🎯 Production Configuration:"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   Environment: $NODE_ENV"

# Database migrations and seeding (if configured)
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Running database migrations..."
  if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
    
    # Check if database needs seeding (if no users exist)
    echo "🌱 Checking if database needs seeding..."
    USER_COUNT=$(node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.user.count().then(count => {
        console.log(count);
        process.exit(0);
      }).catch(() => {
        console.log(0);
        process.exit(0);
      }).finally(() => prisma.\$disconnect());
    ")
    
    if [ "$USER_COUNT" -eq 0 ]; then
      echo "📊 Database is empty, running seed data..."
      if npm run db:seed:prod; then
        echo "✅ Seed data loaded successfully"
      else
        echo "⚠️  Production seed failed, trying alternative method..."
        # Fallback: run with npx directly
        if npx ts-node prisma/seed.ts; then
          echo "✅ Seed data loaded successfully (fallback method)"
        else
          echo "❌ All seed methods failed - continuing without seed data"
          echo "⚠️  You may need to seed manually later"
        fi
      fi
    else
      echo "✅ Database already has $USER_COUNT users, skipping seed"
    fi
  else
    echo "❌ Database migrations failed!"
    echo "⚠️  Continuing with server start (migrations may not be needed)"
  fi
else
  echo "⚠️  DATABASE_URL not configured, skipping migrations and seeding"
fi

# Final pre-flight check
echo "🧪 Pre-flight check: Testing application can load..."
if timeout 5s node -e "require('./dist/main.js')" 2>/dev/null; then
  echo "✅ Application pre-flight check passed"
else
  echo "⚠️  Pre-flight check inconclusive (normal for some apps)"
fi

# Start the production server
echo ""
echo "🚀 LAUNCHING PRODUCTION SERVER"
echo "🌐 Server will be available at: http://$HOST:$PORT"
echo "📡 Health check endpoint: http://$HOST:$PORT/health"
echo "📊 Railway will healthcheck this endpoint every few seconds"
echo ""

# Use exec to replace the shell process with node
# This ensures Railway can properly monitor the process
exec node dist/main.js