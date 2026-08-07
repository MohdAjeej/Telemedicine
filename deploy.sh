#!/bin/bash

# ===================================================================
# Telemedicine Platform Deployment Script
# Server: 147.93.108.99
# ===================================================================

set -e  # Exit on any error

echo "🚀 Starting Telemedicine Platform Deployment..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file in the root directory"
    exit 1
fi

echo "✅ Found .env file"
echo ""

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📋 Configuration Summary:"
echo "----------------------------------------"
echo "Environment: $NODE_ENV"
echo "API Port: $PORT"
echo "MongoDB: $MONGO_URI"
echo "Client URLs: $CLIENT_URL"
echo "API URL: $VITE_API_BASE_URL"
echo "Socket URL: $VITE_SOCKET_URL"
echo "Cloudinary: $CLOUDINARY_CLOUD_NAME"
echo "----------------------------------------"
echo ""

# Warn about default secrets
if [ "$JWT_ACCESS_SECRET" = "change-me-access-secret" ]; then
    echo "⚠️  WARNING: JWT_ACCESS_SECRET is still set to default value!"
    echo "   Generate a secure secret with: openssl rand -hex 32"
    echo ""
fi

if [ "$JWT_REFRESH_SECRET" = "change-me-refresh-secret" ]; then
    echo "⚠️  WARNING: JWT_REFRESH_SECRET is still set to default value!"
    echo "   Generate a secure secret with: openssl rand -hex 32"
    echo ""
fi

# Ask for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔨 Building and starting services..."
echo ""

# Stop existing containers
docker-compose down

# Build and start services
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🧪 Testing API Health..."
sleep 5

# Test API health endpoint
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://147.93.108.99:5002/api/v1/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ API Health Check: PASSED"
else
    echo "❌ API Health Check: FAILED (Status: $HEALTH_CHECK)"
    echo ""
    echo "📋 Server Logs:"
    docker-compose logs --tail=50 server
fi

echo ""
echo "🌐 Service URLs:"
echo "----------------------------------------"
echo "📱 Patient App:     http://147.93.108.99:8080"
echo "🛠️  Admin Dashboard: http://147.93.108.99:8081"
echo "⚡ API Server:      http://147.93.108.99:5002"
echo "🗄️  MongoDB:         mongodb://147.93.108.99:27019"
echo "----------------------------------------"
echo ""

echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Test the Patient App: http://147.93.108.99:8080"
echo "  2. Test the Admin Dashboard: http://147.93.108.99:8081"
echo "  3. Check API health: http://147.93.108.99:5002/api/v1/health"
echo "  4. Seed demo data: docker-compose exec server npx ts-node --transpile-only src/scripts/seed.ts"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🔄 Restart: docker-compose restart"
echo "🛑 Stop: docker-compose down"
echo ""
