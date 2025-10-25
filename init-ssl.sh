#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== SSL Certificate Setup for teecraft.com.vn ===${NC}\n"

# Domain configuration
DOMAIN="teecraft.com.vn"
EMAIL="your-email@example.com"  # Change this to your email

# Create necessary directories
echo -e "${GREEN}Creating directories...${NC}"
mkdir -p nginx/certbot/conf
mkdir -p nginx/certbot/www
mkdir -p nginx/logs

# Step 1: Start with HTTP only (for initial certificate generation)
echo -e "\n${GREEN}Step 1: Starting services with HTTP only...${NC}"
docker-compose up -d nextjs-app nginx

# Wait for services to be ready
echo -e "${GREEN}Waiting for services to start...${NC}"
sleep 10

# Step 2: Request SSL certificate
echo -e "\n${GREEN}Step 2: Requesting SSL certificate from Let's Encrypt...${NC}"
docker run --rm \
  -v $(pwd)/nginx/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/nginx/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# Check if certificate was successfully created
if [ -d "nginx/certbot/conf/live/$DOMAIN" ]; then
    echo -e "\n${GREEN}✓ SSL certificate successfully created!${NC}"
    
    # Step 3: Enable SSL configuration
    echo -e "\n${GREEN}Step 3: Enabling SSL configuration...${NC}"
    
    # Rename default.conf to disable HTTP-only config
    mv nginx/conf.d/default.conf nginx/conf.d/default.conf.disabled
    
    # Enable SSL config
    cp nginx/conf.d/ssl.conf.template nginx/conf.d/default.conf
    
    # Restart nginx to apply SSL configuration
    echo -e "${GREEN}Restarting nginx with SSL...${NC}"
    docker-compose restart nginx
    
    # Start certbot for auto-renewal
    docker-compose up -d certbot
    
    echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
    echo -e "${GREEN}Your site is now available at:${NC}"
    echo -e "  - ${YELLOW}https://$DOMAIN${NC}"
    echo -e "  - ${YELLOW}https://www.$DOMAIN${NC}"
    echo -e "\n${GREEN}Certificate auto-renewal is enabled.${NC}"
    
else
    echo -e "\n${RED}✗ Failed to create SSL certificate.${NC}"
    echo -e "${RED}Please check the error messages above.${NC}"
    echo -e "\n${YELLOW}Common issues:${NC}"
    echo -e "  1. Make sure your domain DNS points to this server's IP"
    echo -e "  2. Check that ports 80 and 443 are not blocked by firewall"
    echo -e "  3. Verify the email address is correct"
    echo -e "  4. Wait a few minutes for DNS propagation if you just set it up"
    exit 1
fi
