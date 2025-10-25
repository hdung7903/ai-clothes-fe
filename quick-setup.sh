#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Quick Setup - teecraft.com.vn ===${NC}\n"

# Create directories
echo -e "${GREEN}1. Creating directories...${NC}"
mkdir -p nginx/certbot/conf
mkdir -p nginx/certbot/www
mkdir -p nginx/logs

# Check DNS
echo -e "\n${GREEN}2. Checking DNS configuration...${NC}"
IP=$(dig +short teecraft.com.vn A | tail -n1)
if [ -z "$IP" ]; then
    echo -e "${RED}✗ DNS not configured!${NC}"
    echo -e "${YELLOW}Please add A record: teecraft.com.vn → Your Server IP${NC}"
    exit 1
else
    echo -e "${GREEN}✓ DNS points to: $IP${NC}"
fi

# Start services
echo -e "\n${GREEN}3. Starting Docker services...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for services
echo -e "\n${GREEN}4. Waiting for services to be ready...${NC}"
sleep 15

# Check if Nginx is running
echo -e "\n${GREEN}5. Checking Nginx...${NC}"
if docker-compose ps nginx | grep -q "Up"; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
    
    # Test local access
    if curl -s http://localhost/health > /dev/null; then
        echo -e "${GREEN}✓ Nginx is accessible locally${NC}"
    else
        echo -e "${RED}✗ Nginx not accessible locally${NC}"
    fi
else
    echo -e "${RED}✗ Nginx is not running${NC}"
    docker-compose logs nginx
    exit 1
fi

# Check if Next.js is running
echo -e "\n${GREEN}6. Checking Next.js app...${NC}"
if docker-compose ps nextjs-app | grep -q "Up"; then
    echo -e "${GREEN}✓ Next.js app is running${NC}"
else
    echo -e "${RED}✗ Next.js app is not running${NC}"
    docker-compose logs nextjs-app
    exit 1
fi

# Instructions
echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
echo -e "${GREEN}Your app is running at:${NC}"
echo -e "  - ${YELLOW}http://teecraft.com.vn${NC}"
echo -e "  - ${YELLOW}http://$IP${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Test access: ${YELLOW}curl -I http://teecraft.com.vn${NC}"
echo -e "  2. If working, setup SSL: ${YELLOW}./init-ssl.sh${NC}"
echo -e "\n${YELLOW}View logs:${NC}"
echo -e "  ${YELLOW}docker-compose logs -f${NC}"
