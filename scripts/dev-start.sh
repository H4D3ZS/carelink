#!/bin/bash

# CareLink QR - Development Start Script
# This script starts both frontend and backend services locally

set -e

echo "🚀 CareLink QR - Local Development Environment"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=3001
MOBILE_PORT=8080

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${BLUE}📁 Project Root: ${PROJECT_ROOT}${NC}"

# Function to check if port is available
check_port() {
    local port=$1
    if netstat -ano 2>/dev/null | grep -q ":${port}"; then
        echo -e "${YELLOW}⚠ Port $port is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to wait for service
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service on port $port...${NC}"
    
    while ! nc -z localhost $port 2>/dev/null; do
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${YELLOW}⚠ $service failed to start on port $port${NC}"
            return 1
        fi
        sleep 1
        ((attempt++))
    done
    
    echo -e "${GREEN}✅ $service is ready on port $port${NC}"
    return 0
}

# Function to check if dependency is installed
check_dependency() {
    local module=$1
    local package=$2
    
    if [ -d "${module}/node_modules/${package}" ]; then
        return 0
    else
        return 1
    fi
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Navigate to project root
cd "${PROJECT_ROOT}"
echo -e "${BLUE}📁 Working in: $(pwd)${NC}"

# Check environment files
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ Root .env not found, copying from example...${NC}"
    cp .env.example .env 2>/dev/null || echo "Creating empty .env file..."
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠ Backend .env not found, copying from example...${NC}"
    cp backend/.env.example backend/.env 2>/dev/null || echo "Creating empty backend .env file..."
fi

if [ ! -f "apps/web/.env" ]; then
    echo -e "${YELLOW}⚠ Web .env not found, copying from example...${NC}"
    cp apps/web/.env.example apps/web/.env 2>/dev/null || echo "Creating empty web .env file..."
fi

# Check port availability
echo -e "${BLUE}🔍 Checking port availability...${NC}"
check_port $BACKEND_PORT || echo -e "${YELLOW}⚠ Backend port $BACKEND_PORT may be in use${NC}"
check_port $FRONTEND_PORT || echo -e "${YELLOW}⚠ Frontend port $FRONTEND_PORT may be in use${NC}"

echo -e "${GREEN}✅ Port check complete${NC}"

# Check if sqlite3 is installed - if not, we need to reset the lockfile
echo -e "${BLUE}🔍 Checking for stale lockfiles...${NC}"

if ! check_dependency "backend" "sqlite3"; then
    echo -e "${YELLOW}⚠ sqlite3 not found in backend dependencies${NC}"
    echo -e "${YELLOW}📦 Stale lockfile detected. Regenerating...${NC}"
    
    # Delete stale lockfiles
    rm -f backend/pnpm-lock.yaml 2>/dev/null
    rm -f apps/web/pnpm-lock.yaml 2>/dev/null
    rm -f pnpm-lock.yaml 2>/dev/null
    
    # Clean up node_modules to force fresh install
    rm -rf backend/node_modules 2>/dev/null
    rm -rf apps/web/node_modules 2>/dev/null
    rm -rf node_modules 2>/dev/null
    
    echo -e "${GREEN}✅ Stale dependencies cleaned${NC}"
fi

# Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Root dependencies
echo -e "${YELLOW}📦 Root dependencies...${NC}"
pnpm install

# Backend dependencies  
echo -e "${YELLOW}📦 Backend dependencies...${NC}"
(cd backend && pnpm install)

# Verify sqlite3 was installed
if ! check_dependency "backend" "sqlite3"; then
    echo -e "${RED}❌ ERROR: sqlite3 still not installed after pnpm install${NC}"
    echo -e "${RED}   Please check backend/package.json contains sqlite3${NC}"
    exit 1
fi

# Web dependencies
echo -e "${YELLOW}📦 Web dependencies...${NC}"
(cd apps/web && pnpm install)

echo -e "${GREEN}✅ All dependencies installed successfully${NC}"

# Start services
echo ""
echo -e "${GREEN}🚀 Starting services...${NC}"
echo "=================================================="

# Start Backend API
echo -e "${BLUE}🔧 Starting Backend API (Node.js)...${NC}"
(cd backend && pnpm dev &) 
BACKEND_PID=$!

# Wait a bit for backend to initialize
sleep 3

# Check if backend started
if ! wait_for_service $BACKEND_PORT "Backend API"; then
    echo -e "${YELLOW}⚠ Backend may have failed to start. Check logs.${NC}"
fi

# Start Frontend
echo -e "${BLUE}🌐 Starting Frontend (Next.js)...${NC}"
(cd apps/web && pnpm dev &)
FRONTEND_PID=$!

# Wait a bit for frontend to initialize
sleep 3

# Check if frontend started
if ! wait_for_service $FRONTEND_PORT "Frontend"; then
    echo -e "${YELLOW}⚠ Frontend may have failed to start. Check logs.${NC}"
fi

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}🎉 Development services started!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "📍 Access Points:"
echo -e "  🔧 Backend API:     ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo -e "  🌐 Frontend:        ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo ""
echo -e "📋 Available Commands:"
echo -e "  📝 View backend logs:   ${YELLOW}tail -f backend/logs/*.log${NC}"
echo -e "  📝 View frontend logs:  ${YELLOW}tail -f apps/web/logs/*.log${NC}"
echo -e "  🛑 Stop services:       ${YELLOW}./scripts/dev-stop.sh${NC}"
echo -e "  🔄 Restart:            ${YELLOW}./scripts/dev-start.sh${NC}"
echo ""
echo -e "${YELLOW}⚠ Note: Services are running in background.${NC}"
echo -e "${YELLOW}  Use 'jobs' to see background jobs or 'fg' to bring to foreground.${NC}"
echo ""

# Keep script running to maintain background processes
echo -e "${GREEN}Press Ctrl+C to stop this script (services will continue running)${NC}"
echo -e "${GREEN}Run ./scripts/dev-stop.sh to stop all services${NC}"
echo ""

# Wait for user interrupt
trap 'echo -e "\n${YELLOW}Script interrupted. Services are still running.${NC}"; exit 0' INT
wait