#!/bin/bash

# Production Deployment Script for AI Prompt Generator

set -e

echo "🚀 Starting production deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ ERROR: NEXTAUTH_SECRET environment variable is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the application
echo "✅ Deployment complete! Starting application..."
npm start