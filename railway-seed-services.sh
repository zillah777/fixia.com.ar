#!/bin/bash
set -e

echo "🛍️ RAILWAY SERVICES SEEDING SCRIPT"
echo "This script will populate missing services data in Railway production database"
echo ""

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway. Please run:"
    echo "railway login"
    exit 1
fi

echo "✅ Railway CLI is available and authenticated"
echo ""

# Navigate to API directory
cd apps/api
echo "📍 Working in: $(pwd)"

# Show current database status
echo "📊 Checking current database status..."
railway run npm run health:test

echo ""
echo "🛍️ Starting services seeding in Railway production..."
echo "⚠️  This will only add missing services data, existing users will not be affected"

# Execute services seeding
if railway run npm run db:seed:services; then
    echo "✅ Services seeding completed successfully!"
    echo ""
    echo "🔍 Verifying services were created..."
    echo "📊 Checking health status..."
    railway run npm run health:test
else
    echo "❌ Services seeding failed!"
    echo "Trying alternative method..."
    if railway run node -r ts-node/register seed-services-only.ts; then
        echo "✅ Services seeding completed with fallback method!"
    else
        echo "❌ All seeding methods failed!"
        echo "Please check Railway logs for more details"
        exit 1
    fi
fi

echo ""
echo "🎉 Services seeding process completed!"
echo "📱 You should now be able to see services on the frontend:"
echo "   https://fixiacomar-production.up.railway.app"
echo ""
echo "Next steps:"
echo "1. Visit the frontend URL above"
echo "2. Navigate to 'Explora Servicios Profesionales'"
echo "3. Verify services are now displayed instead of 'undefined de undefined'"