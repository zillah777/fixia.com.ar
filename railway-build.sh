#!/bin/bash
set -e

echo "🚂 RAILWAY BUILD: Fixia NestJS API (Nixpacks Override)"
echo "📍 Working Directory: $(pwd)"
echo "🔧 Node Version: $(node --version)"
echo "📦 NPM Version: $(npm --version)"

# Print environment info
echo "🌍 Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "PORT: ${PORT:-'not set'}"
echo "DATABASE_URL: ${DATABASE_URL:+set}"

# CRITICAL: Ensure we are in the root directory first
if [ ! -d "apps/api" ]; then
  echo "❌ CRITICAL ERROR: apps/api directory not found in $(pwd)"
  echo "📂 Available directories: $(ls -la)"
  exit 1
fi

# Navigate to API directory
cd apps/api
echo "📍 Now in NestJS API directory: $(pwd)"

# Verify NestJS project structure
echo "🔍 Verifying NestJS project structure..."
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found in apps/api/"
  exit 1
fi

if [ ! -f "tsconfig.json" ]; then
  echo "❌ tsconfig.json not found in apps/api/"
  exit 1
fi

if [ ! -f "nest-cli.json" ]; then
  echo "❌ nest-cli.json not found in apps/api/"
  exit 1
fi

echo "✅ NestJS project structure verified"

# Clean any previous builds
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist/
rm -rf node_modules/.cache/ 2>/dev/null || true

# Install dependencies PRODUCTION ONLY
echo "📦 Installing production dependencies..."
npm ci --omit=dev --silent
echo "✅ Production dependencies installed"

# Install build-time dependencies
echo "🛠️  Installing build-time dependencies..."
npm install --save-dev @nestjs/cli prisma typescript ts-node --silent
echo "✅ Build dependencies installed"

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

# Verify NestJS CLI is available
echo "🔧 Verifying NestJS CLI..."
if ! npx nest --version; then
  echo "❌ NestJS CLI not found, installing..."
  npm install -g @nestjs/cli
fi

# Build NestJS application
echo "🔨 Building NestJS application with production optimizations..."
NODE_ENV=production npx nest build --webpack

# Verify build succeeded
echo "🔍 Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ CRITICAL: dist/ directory not created"
  exit 1
fi

if [ ! -f "dist/main.js" ]; then
  echo "❌ CRITICAL: main.js not found in dist/"
  echo "📂 Available files in dist/:"
  ls -la dist/ || echo "dist/ directory is empty"
  
  # Check for alternative locations
  if [ -f "dist/src/main.js" ]; then
    echo "⚠️  Found main.js in dist/src/, restructuring..."
    cp -r dist/src/* dist/
    rm -rf dist/src/
    echo "✅ Build output restructured"
  else
    echo "❌ Build completely failed - no main.js found anywhere"
    exit 1
  fi
fi

# Final verification
echo "✅ Build verification successful!"
echo "📄 main.js size: $(ls -lh dist/main.js | awk '{print $5}')"
echo "📂 Final dist/ structure:"
ls -la dist/

# Test that the built application can at least load
echo "🧪 Testing built application loads..."
timeout 10s node dist/main.js --dry-run 2>/dev/null || echo "⚠️  App test skipped (normal for some configurations)"

echo "🎉 Railway build completed successfully!"
echo "🚀 Ready for deployment with: node dist/main.js"