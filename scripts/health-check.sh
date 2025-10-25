#!/bin/bash

# Health Check Script
# Kiểm tra trạng thái của ứng dụng

APP_URL="${1:-http://localhost:3000}"
MAX_RETRIES=5
RETRY_DELAY=5

echo "🔍 Checking application health at: $APP_URL"

for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Application is healthy (HTTP $HTTP_CODE)"
        exit 0
    else
        echo "⚠️  Received HTTP $HTTP_CODE"
        if [ $i -lt $MAX_RETRIES ]; then
            echo "Retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
