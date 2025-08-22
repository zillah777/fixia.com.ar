#!/bin/bash
set -e

echo "🚂 Starting Railway build for Fixia API..."
echo "📍 Current directory: $(pwd)"
echo "📂 Root contents: $(ls -la)"

# Navegar al directorio API
cd apps/api
echo "📍 Now in API directory: $(pwd)"
echo "📂 API directory contents: $(ls -la)"

echo "📦 Installing API dependencies..."
npm install
echo "✅ Dependencies installed"
echo "📦 node_modules size: $(du -sh node_modules 2>/dev/null || echo 'N/A')"

echo "🗄️ Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

echo "🔨 Building NestJS application..."
echo "📦 Using nest CLI to build..."
npx nest build
echo "✅ NestJS build completed"

echo "🔍 Verifying build output..."
if [ -f "dist/main.js" ]; then
  echo "✅ main.js found in dist"
  echo "📄 main.js size: $(ls -lh dist/main.js | awk '{print $5}')"
else
  echo "❌ main.js not found! Trying alternative build method..."
  echo "🔧 Using tsc directly..."
  npx tsc
  
  if [ -f "dist/main.js" ]; then
    echo "✅ main.js created with tsc"
  else
    echo "❌ Build failed - main.js still not found"
    echo "📂 Contents of dist: $(ls -la dist 2>/dev/null || echo 'dist directory not found')"
    exit 1
  fi
fi

echo "📂 Checking build output..."
if [ -d "dist" ]; then
  echo "✅ dist directory created"
  echo "📂 Dist contents: $(ls -la dist)"
  echo "📄 Main file: $(ls -la dist/main.js 2>/dev/null || echo 'main.js not found')"
else
  echo "❌ dist directory not found!"
  exit 1
fi

echo "🎉 Build completed successfully!"