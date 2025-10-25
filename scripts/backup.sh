#!/bin/bash

# Backup script - Tạo backup của Docker image và data

set -e

APP_NAME="ai-clothes-fe"
BACKUP_DIR="/var/backups/${APP_NAME}"
DATE=$(date +%Y%m%d-%H%M%S)

echo "📦 Starting backup process..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup Docker image
echo "Backing up Docker image..."
docker save ${APP_NAME}:latest | gzip > ${BACKUP_DIR}/${APP_NAME}-${DATE}.tar.gz

# Tag current image with date
docker tag ${APP_NAME}:latest ${APP_NAME}:backup-${DATE}

echo "✅ Backup completed: ${BACKUP_DIR}/${APP_NAME}-${DATE}.tar.gz"

# Clean old backups (keep last 5)
echo "Cleaning old backups..."
cd ${BACKUP_DIR}
ls -t ${APP_NAME}-*.tar.gz | tail -n +6 | xargs -r rm

echo "✅ Backup process finished!"
