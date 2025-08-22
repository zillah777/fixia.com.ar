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
npm run build
echo "✅ NestJS build completed"

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