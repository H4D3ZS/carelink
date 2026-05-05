# CareLink QR - Real-Time Patient Transparency System

A comprehensive healthcare solution providing real-time patient transparency for families through QR-based access, featuring Flutter mobile app and Next.js web portal.

## 🌟 Features

### QR-Based Access System
- Unique patient QR code for secure access
- Time-bound session management
- Multi-user family group support
- Role-based access control (3 levels)

### Role-Based Data Visibility
- **Level 1**: Billing & Status Overview
- **Level 2**: Medications & Schedule
- **Level 3**: Full Medical Summary (Admin Access)

### Real-Time Updates
- Live patient status monitoring
- Automated billing alerts
- Medication schedule reminders
- Push notification system

### Security & Audit
- Comprehensive activity logging
- OWASP security compliance
- Real-time data synchronization
- Secure API gateway

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       CARELINK QR                          │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌──────────────────┐            │
│  │  Flutter     │         │  Next.js Website │             │
│  │  Mobile App  │◄───────►│  (Admin & Family)│             │
│  │              │   API   │                  │             │
│  │  - QR Scan   │         │  - Admin Portal  │             │
│  │  - Patient   │         │  - Family View   │             │
│  │  - Billing   │         │  - Analytics     │             │
│  └──────────────┘         └──────────────────┘             │
│          ▼                      ▼                            │
│  ┌──────────────────────────────────────────┐               │
│  │         REST API Gateway                   │               │
│  │  - Authentication (JWT)                    │               │
│  │  - Patient Management                      │               │
│  │  - Billing Services                        │               │
│  │  - Notifications                           │               │
│  └──────────────────────────────────────────┘               │
│                      ▼                                       │
│  ┌──────────────────────────────────────────┐               │
│  │         PostgreSQL Database                │               │
│  │  - Patient Records                         │               │
│  │  - Billing Information                     │               │
│  │  - Audit Logs                              │               │
│  └──────────────────────────────────────────┘               │
└────────────────────────────────────────────────────────────┘
```

## 📱 Tech Stack

### Mobile (Flutter 3.x)
- **Framework**: Flutter with Null Safety
- **State Management**: Riverpod with StateNotifier
- **UI Components**: Material Design 3
- **Navigation**: GoRouter for declarative routing
- **QR Scanning**: qr_flutter + mobile_scanner

### Web (Next.js 14)
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **State**: React Query + Zustand
- **Real-time**: WebSocket support

### Backend (Node.js)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma for type-safe database access
- **Authentication**: JWT-based auth
- **API Documentation**: Swagger/OpenAPI

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Loki + Grafana
- **Database**: PostgreSQL 15

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ / pnpm 9+
- Flutter 3.x
- PostgreSQL 15+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/H4D3ZS/carelink-qr.git
cd carelink-qr
```

2. **Install dependencies**
```bash
# Install root dependencies
pnpm install

# Install app dependencies
pnpm install --filter=apps/*
pnpm install --filter=packages/*
```

3. **Environment Configuration**
```bash
# Copy environment templates
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
```

4. **Run Development Server**
```bash
# All services
pnpm dev

# Specific apps
pnpm dev:mobile  # Flutter mobile app
pnpm dev:web     # Next.js website
pnpm dev:api     # Node.js API server
```

5. **Run Flutter Mobile App**
```bash
cd apps/mobile
flutter run
```

6. **Run Next.js Website**
```bash
cd apps/web
pnpm dev
```

## 📦 Project Structure

```
carelink-qr/
├── apps/
│   ├── mobile/                    # Flutter Mobile Application
│   │   ├── android/               # Android specific files
│   │   ├── ios/                   # iOS specific files
│   │   ├── lib/
│   │   │   ├── core/              # Core infrastructure
│   │   │   │   ├── config/        # Configuration management
│   │   │   │   ├── constants/     # App constants & enums
│   │   │   │   └── utils/         # Utility functions
│   │   │   ├── features/          # Feature modules
│   │   │   │   ├── auth/          # Authentication & authorization
│   │   │   │   ├── patient/       # Patient management
│   │   │   │   ├── billing/       # Billing & payments
│   │   │   │   ├── notifications/ # Real-time notifications
│   │   │   │   └── qr/            # QR code functionality
│   │   │   ├── models/            # Data models & DTOs
│   │   │   ├── repositories/      # Data access layer
│   │   │   └── routes/            # Navigation & routes
│   │   ├── test/                  # Test suites
│   │   └── pubspec.yaml           # Flutter dependencies
│   │
│   └── web/                       # Next.js Web Application
│       ├── app/                   # Next.js App Router
│       │   ├── (auth)/            # Authentication routes
│       │   ├── (dashboard)/       # Dashboard routes
│       │   └── layout.tsx         # Root layout
│       ├── components/            # Reusable components
│       ├── lib/                   # Shared utilities
│       └── package.json
│
├── packages/
│   ├── shared/                    # Shared TypeScript Code
│   │   ├── src/
│   │   │   ├── types/             # TypeScript interfaces
│   │   │   ├── utils/             # Shared utilities
│   │   │   ├── constants/         # Global constants
│   │   │   └── hooks/             # React hooks
│   │   └── package.json
│   │
│   └── api-client/                # API Client Library
│       ├── src/
│       │   ├── clients/           # API clients
│       │   ├── types/             # API types
│       │   └── index.ts
│       └── package.json
│
├── backend/                       # Node.js API Backend
│   ├── src/
│   │   ├── modules/               # Domain modules
│   │   │   ├── authentication/
│   │   │   ├── patient/
│   │   │   ├── billing/
│   │   │   └── notifications/
│   │   ├── common/                # Cross-cutting concerns
│   │   └── main.ts
│   └── package.json
│
├── docker/                        # Docker configuration
│   ├── docker-compose.yml
│   └── Dockerfile
│
└── docs/                          # Documentation
    ├── architecture/
    ├── api/
    └── guidelines/
```

## 🔧 Development

### Code Generation

```bash
# Generate new Flutter feature
pnpm generate:feature patient

# Generate React component
pnpm generate:component Button

# Generate API client
pnpm generate:api-client
```

### Testing

```bash
# Run all tests
pnpm test

# Run Flutter tests
cd apps/mobile
flutter test

# Run Next.js tests
cd apps/web
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Building for Production

```bash
# Build all applications
pnpm build

# Build Flutter mobile
cd apps/mobile
flutter build ios  # For iOS
flutter build android  # For Android

# Build Next.js website
cd apps/web
pnpm build

# Build Node.js API
cd backend
npm run build
```

## 📋 Features Matrix

| Feature | Mobile | Web | Description |
|---------|-----|-----|-------------|
| QR Code Scanning | ✅ | ⚠️ | Mobile app full support, web limited |
| Patient Profile View | ✅ | ✅ | Real-time patient information |
| Medication Management | ✅ | ✅ | Schedule tracking & reminders |
| Billing Overview | ✅ | ✅ | Real-time billing status |
| Notifications | ✅ | ✅ | Push notifications & a
