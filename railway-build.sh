#!/bin/bash
set -e

echo "🚂 Starting Railway build for Fixia API..."

# Navegar al directorio API
cd apps/api

echo "📦 Installing API dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🔨 Building NestJS application..."
npm run build

echo "✅ Build completed successfully!"