#!/bin/bash

# Rollback script - Quay lại version trước đó

set -e

APP_NAME="ai-clothes-fe"
BACKUP_TAG="${1:-previous}"

echo "🔄 Starting rollback to version: $BACKUP_TAG"

# Stop current containers
echo "Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

# Tag the current image as backup before rollback
docker tag ${APP_NAME}:latest ${APP_NAME}:backup-$(date +%Y%m%d-%H%M%S) || true

# Restore previous version
echo "Restoring previous version..."
docker tag ${APP_NAME}:${BACKUP_TAG} ${APP_NAME}:latest

# Start containers with previous version
echo "Starting containers with previous version..."
docker-compose -f docker-compose.prod.yml up -d

# Health check
echo "Waiting for application to start..."
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Rollback completed successfully!"
else
    echo "❌ Health check failed after rollback!"
    exit 1
fi
