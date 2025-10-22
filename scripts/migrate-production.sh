#!/bin/bash

# Production Database Migration Script

set -e

echo "🗄️ Running production database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Deploy migrations to production database
echo "📊 Deploying migrations..."
npx prisma migrate deploy

# Verify database connection
echo "🔍 Verifying database connection..."
npx prisma db pull --print

echo "✅ Database migrations completed successfully!"