#!/bin/bash

# CareLink QR - Supabase Production Setup Script
# This script configures the project for Supabase deployment

set -e

echo "🚀 CareLink QR - Supabase Production Setup"
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Function to prompt for input
prompt_input() {
    local prompt=$1
    local default=$2
    local var_name=$3
    
    if [ -n "$default" ]; then
        read -p "${prompt} [$default]: " input
        input=${input:-$default}
    else
        read -p "${prompt}: " input
    fi
    
    eval "$var_name=\"$input\""
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠ Supabase CLI not found. Installing...${NC}"
    
    # Install Supabase CLI
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        echo -e "${RED}❌ Please install Supabase CLI manually:${NC}"
        echo "npm install -g supabase"
        exit 1
    fi
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Supabase Configuration
echo ""
echo -e "${BLUE}🔧 Supabase Configuration${NC}"
echo "============================================"

prompt_input "Supabase Project URL (e.g., https://xxxxxx.supabase.co)" "" "SUPABASE_URL"
prompt_input "Supabase Anon Key" "" "SUPABASE_ANON_KEY"
prompt_input "Supabase Service Role Key" "" "SUPABASE_SERVICE_KEY"
prompt_input "Database Password" "" "DB_PASSWORD"

# Validate inputs
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Missing required Supabase credentials${NC}"
    exit 1
fi

# Create production environment files
echo ""
echo -e "${BLUE}📁 Creating production environment files...${NC}"

# Root .env.production
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Database (Supabase PostgreSQL)
DB_HOST=db.$SUPABASE_URL
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db.${SUPABASE_URL}:5432/postgres

# API Configuration
API_PORT=3000
API_URL=https://api.carelink-qr.com

# Frontend
FRONTEND_URL=https://carelink-qr.com
NEXT_PUBLIC_API_URL=https://api.carelink-qr.com

# Security
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Email (Supabase Auth)
SMTP_HOST=smtp.supabase.co
SMTP_PORT=587
SMTP_USER=noreply@carelink-qr.com

# Feature Flags
ENABLE_REALTIME=true
ENABLE_OFFLINE_MODE=true
ENABLE_ANALYTICS=true

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
EOF

# Backend .env.production
cat > backend/.env.production << EOF
# Backend Production Configuration
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db.${SUPABASE_URL}:5432/postgres

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://carelink-qr.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Storage (Supabase Storage)
STORAGE_BUCKET=carelink-qr-storage
STORAGE_REGION=us-east-1

# Email
EMAIL_FROM=noreply@carelink-qr.com
EMAIL_FROM_NAME=CareLink QR

# Monitoring
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_TRACKING=true
EOF

# Web .env.production
cat > apps/web/.env.production << EOF
# Web Production Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME=CareLink QR

# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# API
NEXT_PUBLIC_API_URL=https://api.carelink-qr.com
NEXT_PUBLIC_API_VERSION=v1

# Features
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_OFFLINE=true

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=
EOF

echo -e "${GREEN}✅ Production environment files created${NC}"

# Create Supabase configuration
echo ""
echo -e "${BLUE}⚙️ Creating Supabase configuration...${NC}"

mkdir -p supabase/migrations supabase/functions

# Create config.toml
cat > supabase/config.toml << EOF
# Supabase Configuration File

project_id = "carelink-qr"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[realtime]
enabled = true

[studio]
enabled = true
port = 54323
api_url = "http://localhost:54321"

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "https://carelink-qr.com"
additional_redirect_urls = ["https://carelink-qr.com/**"]
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.sms]
enable_signup = false
enable_confirmations = false

[auth.external]
[auth.external.google]
enabled = false
[auth.external.apple]
enabled = false
EOF

# Create initial database migration
cat > supabase/migrations/20240506000000_initial_schema.sql << 'EOF'
-- Initial Database Schema for CareLink QR

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'FAMILY_MEMBER',
    profile JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_code TEXT UNIQUE NOT NULL,
    personal_info JSONB NOT NULL,
    medical_info JSONB DEFAULT '{}',
    status TEXT DEFAULT 'ADMITTED',
    access_level INTEGER DEFAULT 1,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Groups table
CREATE TABLE public.family_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    primary_contact_id UUID REFERENCES public.users(id),
    access_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Members table
CREATE TABLE public.family_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    relationship TEXT,
    access_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Records table
CREATE TABLE public.billing_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES public.users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_code ON public.patients(patient_code);
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
CREATE INDEX idx_billing_patient ON public.billing_records(patient_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Family members can view patient info" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_members fm
            JOIN public.family_groups fg ON fm.group_id = fg.id
            WHERE fm.user_id = auth.uid() AND fg.patient_id = patients.id
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

echo -e "${GREEN}✅ Supabase configuration created${NC}"

# Create deployment scripts
echo ""
echo -e "${BLUE}📝 Creating deployment scripts...${NC}"

# Production deployment script
cat > scripts/deploy-production.sh << 'EOF'
#!/bin/bash

# CareLink QR - Production Deployment Script
set -e

echo "🚀 Deploying CareLink QR to Production"
echo "======================================"

# Load production environment
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build applications
echo "📦 Building applications..."
cd backend && pnpm install && pnpm build && cd ..
cd apps/web && pnpm install && pnpm build && cd ../..

# Deploy to Supabase (if configured)
if command -v supabase &> /dev/null; then
    echo "🔄 Pushing database migrations..."
    supabase db push
fi

echo "✅ Production deployment complete!"
EOF

chmod +x scripts/deploy-production.sh

# Database migration script
cat > scripts/db-migrate.sh << 'EOF'
#!/bin/bash

# Database Migration Script
set -e

echo "🔄 Running database migrations..."

if command -v supabase &> /dev/null; then
    supabase db push
    echo "✅ Migrations applied successfully"
else
    echo "⚠ Supabase CLI not found. Please install it first."
    exit 1
fi
EOF

chmod +x scripts/db-migrate.sh

# Environment switcher
cat > scripts/switch-env.sh << 'EOF'
#!/bin/bash

# Environment Switcher Script

ENV=${1:-development}

echo "🔄 Switching to $ENV environment..."

if [ "$ENV" = "production" ]; then
    cp .env.production .env
    cp backend/.env.production backend/.env
    cp apps/web/.env.production apps/web/.env
    echo "✅ Switched to production environment"
elif [ "$ENV" = "development" ]; then
    cp .env.example .env 2>/dev/null || echo "Creating development .env"
    cp backend/.env.example backend/.env 2>/dev/null || true
    cp apps/web/.env.example apps/web/.env 2>/dev/null || true
    echo "✅ Switched to development environment"
else
    echo "❌ Unknown environment: $ENV"
    echo "Usage: ./scripts/switch-env.sh [development|production]"
    exit 1
fi
EOF

chmod +x scripts/switch-env.sh

echo -e "${GREEN}✅ Deployment scripts created${NC}"

# Create README for Supabase setup
cat > SUPABASE_SETUP.md << 'EOF'
# Supabase Production Setup Guide

## Prerequisites

1. Supabase account (https://supabase.com)
2. Supabase CLI installed
3. Node.js 18+ and pnpm

## Quick Start

1. **Run setup script:**
   ```bash
   ./scripts/setup-supabase.sh
   ```

2. **Link to your Supabase project:**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Push database schema:**
   ```bash
   supabase db push
   ```

4. **Deploy to production:**
   ```bash
   ./scripts/deploy-production.sh
   ```

## Environment Files

The setup creates these environment files:
- `.env.production` - Root configuration
- `backend/.env.production` - Backend services
- `apps/web/.env.production` - Frontend application

## Database Schema

The initial migration includes:
- Users table (extends auth.users)
- Patients table with patient codes
- Family groups and members
- Billing records
- Notifications
- Audit logs

## Features

- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps
- ✅ Indexed for performance
- ✅ UUID primary keys
- ✅ JSONB for flexible data

## Security

- JWT-based authentication
- Role-based access control
- IP logging for audit trails
- Encrypted data storage

For more details, see the full documentation.
EOF

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Supabase setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "📦 Created Files:"
echo -e "  ✅ .env.production (root config)"
echo -e "  ✅ backend/.env.production"
echo -e "  ✅ apps/web/.env.production"
echo -e "  ✅ supabase/config.toml"
echo -e "  ✅ supabase/migrations/initial_schema.sql"
echo -e "  ✅ scripts/deploy-production.sh"
echo -e "  ✅ scripts/db-migrate.sh"
echo -e "  ✅ scripts/switch-env.sh"
echo -e "  ✅ SUPABASE_SETUP.md"
echo ""
echo -e "🚀 Next Steps:"
echo -e "  1. Review ${YELLOW}.env.production${NC} files"
echo -e "  2. Run ${YELLOW}supabase login${NC} to authenticate"
echo -e "  3. Run ${YELLOW}supabase link${NC} to connect project"
echo -e "  4. Run ${YELLOW}./scripts/deploy-production.sh${NC} to deploy"
echo ""
echo -e "📚 Documentation:"
echo -e "  - SUPABASE_SETUP.md"
echo -e "  - scripts/README.md"
echo ""
echo -e "💡 Pro Tip: Use ${YELLOW}./scripts/switch-env.sh production${NC} to switch environments"
echo ""