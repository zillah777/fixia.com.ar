#!/bin/bash
set -e

echo "🚀 Starting Railway deployment for Fixia API..."

# Navegar al directorio API
cd apps/api

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "🎯 Starting production server..."
npm run start:prod