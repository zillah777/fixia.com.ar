#!/bin/bash
set -e

echo "🚂 Starting Railway build for Fixia API..."
echo "📍 Current directory: $(pwd)"
echo "📂 Root contents: $(ls -la)"

# Navegar al directorio API
cd apps/api
echo "📍 Now in API directory: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found! We're in the wrong directory!"
  echo "📂 Current contents: $(ls -la)"
  exit 1
fi

if [ ! -f "tsconfig.json" ]; then
  echo "❌ tsconfig.json not found! We're in the wrong directory!"
  echo "📂 Current contents: $(ls -la)"
  exit 1
fi

echo "✅ Confirmed we're in the correct API directory"
echo "📂 API directory contents: $(ls -la)"

echo "📦 Installing API dependencies..."
npm install
echo "✅ Dependencies installed"
echo "📦 node_modules size: $(du -sh node_modules 2>/dev/null || echo 'N/A')"

echo "🗄️ Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

echo "🔨 Building NestJS application..."
echo "📍 Current directory for build: $(pwd)"
echo "📦 Using nest CLI to build..."

# Limpiar dist anterior
rm -rf dist

npx nest build
echo "✅ NestJS build completed"

echo "🔍 Verifying build output..."
echo "📂 Current dist contents: $(ls -la dist 2>/dev/null || echo 'dist directory not found')"

if [ -f "dist/main.js" ]; then
  echo "✅ main.js found in dist"
  echo "📄 main.js size: $(ls -lh dist/main.js | awk '{print $5}')"
else
  echo "❌ main.js not found! Trying alternative build method..."
  echo "🔧 Using tsc directly with explicit config..."
  
  # Limpiar y usar tsc con configuración explícita
  rm -rf dist
  npx tsc --project tsconfig.json
  
  echo "📂 After tsc - dist contents: $(ls -la dist 2>/dev/null || echo 'dist directory not found')"
  
  if [ -f "dist/main.js" ]; then
    echo "✅ main.js created with tsc"
  else
    echo "❌ Build failed - main.js still not found"
    echo "📂 Full directory structure:"
    find . -name "*.js" -path "*/dist/*" 2>/dev/null || echo "No JS files found in any dist directory"
    echo "🔍 Checking for compiled files in other locations:"
    find . -name "main.js" 2>/dev/null || echo "No main.js found anywhere"
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