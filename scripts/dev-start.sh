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
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=3001
MOBILE_PORT=8080

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
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

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}❌ pnpm is not installed${NC}"
    exit 1
fi

# Check Flutter
if ! command -v flutter &> /dev/null; then
    echo -e "${YELLOW}⚠ Flutter is not installed (optional for mobile)${NC}"
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

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

# Install dependencies if needed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    pnpm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend && pnpm install && cd ..
fi

if [ ! -d "apps/web/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing web dependencies...${NC}"
    cd apps/web && pnpm install && cd ../..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"

# Start services
echo ""
echo -e "${GREEN}🚀 Starting services...${NC}"
echo "=================================================="

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend API (Node.js)...${NC}"
    cd backend
    
    # Check if already running
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Backend already running on port $BACKEND_PORT${NC}"
        return 0
    fi
    
    # Start backend in background
    pnpm dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service $BACKEND_PORT "Backend API"; then
        echo -e "${GREEN}✅ Backend API running at http://localhost:$BACKEND_PORT${NC}"
        return 0
    else
        echo -e "${YELLOW}❌ Failed to start Backend API${NC}"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🌐 Starting Frontend (Next.js)...${NC}"
    cd apps/web
    
    # Check if already running
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Frontend already running on port $FRONTEND_PORT${NC}"
        return 0
    fi
    
    # Start frontend in background
    pnpm dev &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend to be ready
    if wait_for_service $FRONTEND_PORT "Frontend"; then
        echo -e "${GREEN}✅ Frontend running at http://localhost:$FRONTEND_PORT${NC}"
        return 0
    else
        echo -e "${YELLOW}❌ Failed to start Frontend${NC}"
        return 1
    fi
}

# Function to start mobile (optional)
start_mobile() {
    echo -e "${BLUE}📱 Starting Mobile App (Flutter)...${NC}"
    
    if ! command -v flutter &> /dev/null; then
        echo -e "${YELLOW}⚠ Flutter not installed, skipping mobile app${NC}"
        return 0
    fi
    
    cd apps/mobile
    
    # Check if Flutter dependencies are installed
    if [ ! -d ".dart_tool" ]; then
        echo -e "${YELLOW}📦 Installing Flutter dependencies...${NC}"
        flutter pub get
    fi
    
    # Start Flutter in debug mode
    flutter run --debug &
    MOBILE_PID=$!
    cd ../..
    
    echo -e "${GREEN}✅ Mobile app started (check device/emulator)${NC}"
    return 0
}

# Start all services
start_backend
start_frontend

# Ask about mobile app
echo ""
read -p "📱 Start mobile app (Flutter)? (y/N): " start_mobile_choice
if [[ $start_mobile_choice =~ ^[Yy]$ ]]; then
    start_mobile
fi

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "📍 Access Points:"
echo -e "  🔧 Backend API:     ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo -e "  🌐 Frontend:        ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  📱 Mobile:          ${BLUE}Check your device/emulator${NC}"
echo ""
echo -e "📋 Available Commands:"
echo -e "  📝 View logs:       ${YELLOW}tail -f logs/*.log${NC}"
echo -e "  🛑 Stop services:   ${YELLOW}./scripts/dev-stop.sh${NC}"
echo -e "  🔄 Restart:        ${YELLOW}./scripts/dev-start.sh${NC}"
echo ""
echo -e "🚀 Happy coding!${NC}"
echo ""

# Keep script running to maintain background processes
wait