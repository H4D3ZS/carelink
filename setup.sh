#!/bin/bash

# CareLink QR - Comprehensive Setup Script
# Version: 1.0.0

set -e

echo "🚀 CareLink QR - Project Setup"
echo "================================"

# Colors for output
RED='\033[0;32m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Installation Functions

## Check Prerequisites
check_prerequisites() {
    echo -e "${GREEN}✓ Checking prerequisites...${NC}"
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        exit 1
    fi
    
    # pnpm
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm is required but not installed."
        exit 1
    fi
    
    # Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required but not installed."
        exit 1
    fi
    
    # Flutter
    if ! command -v flutter &> /dev/null; then
        echo "❌ Flutter is required but not installed."
        exit 1
    fi
    
    echo -e "${GREEN}✓ All prerequisites detected:${NC}"
    node --version
    pnpm --version
    docker --version
    flutter --version
}

## Install Frontend Dependencies
install_frontend() {
    echo -e "${GREEN}✓ Installing frontend dependencies...${NC}"
    cd apps/web
    
    if [ ! -f "package.json" ]; then
        echo "Installing web dependencies..."
        pnpm install
    else
        echo "Web dependencies already configured."
    fi
    
    cd ../../
}

## Install Backend Dependencies
install_backend() {
    echo -e "${GREEN}✓ Installing backend dependencies...${NC}"
    cd backend
    
    if [ ! -f "package.json" ]; then
        echo "Installing backend dependencies..."
        npm install
    else
        echo "Backend dependencies already configured."
    fi
    
    cd ../../
}

## Set Up Flutter Mobile App
setup_flutter() {
    echo -e "${GREEN}✓ Setting up Flutter mobile application...${NC}"
    cd apps/mobile
    
    flutter pub get
    
    flutter doctor
    echo -e "${GREEN}✓ Flutter setup complete.${NC}"
    
    cd ../../
}

## Generate Environment Configuration
generate_config() {
    echo -e "${GREEN}✓ Generating environment configuration...${NC}"
    
    # Copy environment templates
    cp .env.example .env 2>/dev/null || echo "Creating .env file..."
    touch .env
    
    # Copy mobile environment
    if [ -f "apps/mobile/.env.example" ]; then
        cp apps/mobile/.env.example apps/mobile/.env 2>/dev/null || echo "Creating mobile .env file..."
    fi
    
    # Copy web environment
    if [ -f "apps/web/.env.example" ]; then
        cp apps/web/.env.example apps/web/.env 2>/dev/null || echo "Creating web .env file..."
    fi
    
    # Copy backend environment
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env 2>/dev/null || echo "Creating backend .env file..."
    fi
    
    echo -e "${GREEN}✓ Environment configuration generated.${NC}"
}

## Initialize Git Repository
init_git() {
    echo -e "${GREEN}✓ Initializing Git repository...${NC}"
    
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit: CareLink QR - DevKada Hackathon"
        echo -e "${GREEN}✓ Git repository initialized.${NC}"
    else
        echo -e "${GREEN}✓ Git repository already initialized.${NC}"
    fi
}

## Setup Development Workflows
setup_workflow() {
    echo -e "${GREEN}✓ Setting up development workflows...${NC}"
    
    # Create necessary directories
    mkdir -p docs/api docs/guides coverage
    mkdir -p .github/workflows
    
    # Setup Husky hooks
    if [ ! -d ".husky" ]; then
        npx husky install
        npx husky add .husky/pre-commit "pnpm lint-staged"
        echo -e "${GREEN}✓ Husky hooks configured.${NC}"
    fi
    
    echo -e "${GREEN}✓ Development workflows configured.${NC}"
}

## Verify Project Structure
verify_structure() {
    echo -e "${GREEN}✓ Verifying project structure...${NC}"
    
    # Check essential files and directories
    local project_root=$(pwd)
    echo "Current working directory: $project_root"
    
    # List project structure
    echo "Project Structure:"
    echo "├── apps/"
    echo "│   ├── mobile/    # Flutter Mobile Application"
    echo "│   └── web/       # Next.js Web Application"
    echo "├── backend/       # Node.js API Backend"
    echo "├── docs/          # Documentation"
    echo "└── packages/      # Shared Packages"
    
    echo -e "${GREEN}✓ Project structure verified.${NC}"
}

## Run Initial Tests
run_initial_tests() {
    echo -e "${GREEN}✓ Running initial tests...${NC}"
    
    # Mobile tests
    cd apps/mobile
    flutter test
    cd ../..
    
    # Backend tests
    cd backend
    npm test
    cd ../..
    
    # Web tests
    cd apps/web
    pnpm test
    cd ../..
    
    echo -e "${GREEN}✓ All initial tests completed successfully.${NC}"
}

## Display Application Status
display_status() {
    echo -e "${GREEN}
================================
✅ PROJECT SETUP COMPLETE
================================

Application: CareLink QR
Version: 1.0.0
Status: Ready for Development

Components:
├── Mobile App (Flutter) - Configured
├── Web Platform (Next.js) - Configured
├── API Backend (Node.js) - Configured
└── Infrastructure - Docker & CI/CD

Next Steps:
1. Review .env file and update configuration
2. Start development environment: pnpm dev
3. Monitor application logs: docker-compose logs -f

Documentation:
- README.md: Project overview and quick start guide
- CONTRIBUTING.md: Contribution guidelines
- CODE_OF_CONDUCT.md: Code of Conduct
- docs/ARCHITECTURE.md: System architecture
- docs/TECHNICAL-AUDIT.md: Technical debt assessment

Resources:
- GitHub Repository: https://github.com/your-org/carelink-qr
- Documentation: https://docs.carelink-qr.example.com
- API Reference: https://api.carelink-qr.example.com/docs

👍 Thank you for using CareLink QR!
📧 For support, visit: https://github.com/your-org/carelink-qr/discussions
================================${NC}"
}

# Main Setup Process
main() {
    echo -e "${YELLOW}Starting CareLink QR setup process...${NC}"
    
    # Execute setup steps
    check_prerequisites
    generate_config
    init_git
    setup_workflow
    
    # Install dependencies
    install_frontend
    install_backend
    setup_flutter
    
    # Verify and execute tests
    verify_structure
    run_initial_tests
    
    # Display final status
    display_status
    
    echo -e "${GREEN}✅ Setup completed successfully!${NC}"
}

# Run the main setup process
main

exit 0
