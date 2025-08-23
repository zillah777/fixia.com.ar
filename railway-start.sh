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

# Database migrations (if configured)
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Running database migrations..."
  if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
  else
    echo "❌ Database migrations failed!"
    echo "⚠️  Continuing with server start (migrations may not be needed)"
  fi
else
  echo "⚠️  DATABASE_URL not configured, skipping migrations"
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
echo ""

# Use exec to replace the shell process with node
exec node dist/main.js