#!/bin/bash

# Script deploy cho AI Clothes Frontend
# Sử dụng script này để deploy thủ công hoặc từ Jenkins

set -e

echo "🚀 Starting deployment process..."

# Configuration
APP_NAME="ai-clothes-fe"
DOCKER_IMAGE="${APP_NAME}:latest"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_info "Docker is running ✓"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    docker build -t $DOCKER_IMAGE .
    log_info "Docker image built successfully ✓"
}

# Stop existing containers
stop_containers() {
    log_info "Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE down || log_warn "No existing containers to stop"
}

# Start new containers
start_containers() {
    log_info "Starting new containers..."
    docker-compose -f $COMPOSE_FILE up -d
    log_info "Containers started successfully ✓"
}

# Clean up old images
cleanup() {
    log_info "Cleaning up old images..."
    docker image prune -f
    log_info "Cleanup completed ✓"
}

# Health check
health_check() {
    log_info "Performing health check..."
    sleep 10
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Application is healthy ✓"
    else
        log_error "Health check failed!"
        exit 1
    fi
}

# Main deployment process
main() {
    check_docker
    build_image
    stop_containers
    start_containers
    cleanup
    health_check
    
    log_info "🎉 Deployment completed successfully!"
}

# Run main function
main
