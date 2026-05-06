#!/bin/bash

# CareLink QR - Development Stop Script
# This script stops all local development services

set -e

echo "🛑 CareLink QR - Stopping Development Environment"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Ports to check
FRONTEND_PORT=3000
BACKEND_PORT=3001
MOBILE_PORT=8080

# Function to kill process on port
kill_port() {
    local port=$1
    local service=$2
    
    echo -e "${YELLOW}🔍 Checking $service on port $port...${NC}"
    
    # Find process using the port
    pid=$(lsof -ti :$port 2>/dev/null || echo "")
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}🛑 Stopping $service (PID: $pid)...${NC}"
        kill -TERM $pid 2>/dev/null || kill -KILL $pid 2>/dev/null
        sleep 2
        
        # Verify process is stopped
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service stopped${NC}"
        else
            echo -e "${YELLOW}⚠ Failed to stop $service${NC}"
        fi
    else
        echo -e "${GREEN}✅ $service not running${NC}"
    fi
}

# Stop services
echo ""
kill_port $BACKEND_PORT "Backend API"
kill_port $FRONTEND_PORT "Frontend"

# Kill Flutter processes if running
echo -e "${YELLOW}🔍 Checking Flutter processes...${NC}"
flutter_pids=$(pgrep -f "flutter" || echo "")
if [ -n "$flutter_pids" ]; then
    echo -e "${YELLOW}🛑 Stopping Flutter processes...${NC}"
    echo "$flutter_pids" | xargs kill -TERM 2>/dev/null || true
    echo -e "${GREEN}✅ Flutter processes stopped${NC}"
else
    echo -e "${GREEN}✅ No Flutter processes running${NC}"
fi

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}✅ All services stopped${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""