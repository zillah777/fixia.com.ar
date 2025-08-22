#!/bin/bash
set -e

echo "🚂 Starting Railway build for Fixia API..."
echo "📍 Current directory: $(pwd)"

# Navigate to API directory
cd apps/api
echo "📍 Now in API directory: $(pwd)"

# Verify we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "tsconfig.json" ]; then
  echo "❌ Required files not found! Wrong directory."
  exit 1
fi

echo "✅ Confirmed we're in the correct API directory"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
echo "✅ Dependencies installed"

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build NestJS application
echo "🔨 Building NestJS application..."
npx nest build
echo "✅ NestJS build completed"

# Verify build output
echo "🔍 Verifying build output..."
if [ -f "dist/main.js" ]; then
  echo "✅ main.js found at dist/main.js"
  echo "📄 main.js size: $(ls -lh dist/main.js | awk '{print $5}')"
else
  echo "❌ main.js not found at expected location!"
  echo "📂 Dist contents: $(ls -la dist 2>/dev/null || echo 'dist directory not found')"
  
  # Check if it's in src subdirectory (old structure)
  if [ -f "dist/src/main.js" ]; then
    echo "⚠️  Found main.js in dist/src/, moving to dist/"
    mv dist/src/main.js dist/
    mv dist/src/* dist/ 2>/dev/null || true
    rmdir dist/src 2>/dev/null || true
    echo "✅ main.js moved to correct location"
  else
    echo "❌ Build failed - main.js not found anywhere"
    exit 1
  fi
fi

echo "🎉 Build completed successfully!"
echo "📂 Final dist contents: $(ls -la dist)"