#!/bin/bash

# CareLink QR - Nuclear Fix Script
# This script forcefully fixes all common issues

set -e

echo "🔥 CareLink QR - Nuclear Fix"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo -e "${BLUE}📁 Project Root: ${PROJECT_ROOT}${NC}"

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔍 Checking port $port...${NC}"
    
    # Try to find and kill process on port (cross-platform)
    if command -v lsof &> /dev/null; then
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$pid" ]; then
            echo -e "${YELLOW}  Killing process $pid on port $port${NC}"
            kill -9 $pid 2>/dev/null || true
        fi
    elif command -v netstat &> /dev/null; then
        # Windows/Git Bash
        local pid=$(netstat -ano 2>/dev/null | grep ":$port" | awk '{print $5}' | head -1)
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            echo -e "${YELLOW}  Killing process $pid on port $port${NC}"
            taskkill //PID $pid //F 2>/dev/null || true
        fi
    fi
}

# Function to kill by process name
kill_process() {
    local name=$1
    if command -v pkill &> /dev/null; then
        pkill -f "$name" 2>/dev/null || true
    elif command -v taskkill &> /dev/null; then
        taskkill //F //IM "$name" 2>/dev/null || true
    fi
}

echo -e "${BLUE}💀 Step 1: Killing all processes...${NC}"
kill_port 3000
kill_port 3001
kill_port 8080
kill_process "node.exe"
kill_process "next.exe"
kill_process "ts-node-dev"
echo -e "${GREEN}✅ Processes killed${NC}"

echo -e "${BLUE}🗑️ Step 2: Nuking cache and build directories...${NC}"
rm -rf apps/web/.next 2>/dev/null || true
rm -rf apps/mobile/build 2>/dev/null || true
rm -rf backend/dist 2>/dev/null || true
echo -e "${GREEN}✅ Cache cleared${NC}"

echo -e "${BLUE}🧹 Step 3: Nuking node_modules and lockfiles...${NC}"
rm -rf node_modules 2>/dev/null || true
rm -rf apps/web/node_modules 2>/dev/null || true
rm -rf backend/node_modules 2>/dev/null || true
rm -rf apps/mobile/node_modules 2>/dev/null || true

rm -f pnpm-lock.yaml 2>/dev/null || true
rm -f apps/web/pnpm-lock.yaml 2>/dev/null || true
rm -f backend/pnpm-lock.yaml 2>/dev/null || true
rm -f package-lock.json 2>/dev/null || true
rm -f apps/web/package-lock.json 2>/dev/null || true
rm -f backend/package-lock.json 2>/dev/null || true

echo -e "${GREEN}✅ All modules and lockfiles nuked${NC}"

echo -e "${BLUE}📦 Step 4: Reinstalling root dependencies...${NC}"
pnpm install --no-frozen-lockfile
echo -e "${GREEN}✅ Root dependencies installed${NC}"

echo -e "${BLUE}📦 Step 5: Reinstalling backend dependencies...${NC}"
cd backend

# For sqlite3 with native deps, sometimes npm works better
if command -v npm &> /dev/null; then
    echo -e "${YELLOW}  Using npm for backend (better for native deps)...${NC}"
    npm install --legacy-peer-deps 2>&1 | head -20 || {
        echo -e "${YELLOW}  npm failed, trying pnpm...${NC}"
        pnpm install --no-frozen-lockfile
    }
else
    pnpm install --no-frozen-lockfile
fi

echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo -e "${BLUE}🔍 Step 6: Verifying sqlite3 installation...${NC}"
if [ -d "node_modules/sqlite3" ]; then
    echo -e "${GREEN}✅ sqlite3 found in backend/node_modules${NC}"
else
    echo -e "${RED}❌ sqlite3 NOT found! Attempting manual install...${NC}"
    if command -v npm &> /dev/null; then
        npm install sqlite3 --legacy-peer-deps
    else
        pnpm add sqlite3
    fi
fi
cd ..

echo -e "${BLUE}📦 Step 7: Reinstalling web dependencies...${NC}"
cd apps/web
pnpm install --no-frozen-lockfile
cd ../..
echo -e "${GREEN}✅ Web dependencies installed${NC}"

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}✅ Nuclear fix complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "🚀 You can now start the development server:"
echo -e "   ${YELLOW}./scripts/dev-start.sh${NC}"
echo ""
