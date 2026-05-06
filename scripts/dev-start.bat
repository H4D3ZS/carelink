@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo 🚀 CareLink QR - Local Development Environment
echo ==================================================

:: Configuration
set FRONTEND_PORT=3000
set BACKEND_PORT=3001
set MOBILE_PORT=8080

:: Colors (using PowerShell for colors)
call :ColorText 0B "📋 Checking prerequisites..."
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :ColorText 0C "❌ Node.js is not installed"
    echo.
    exit /b 1
)

:: Check pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    call :ColorText 0C "❌ pnpm is not installed"
    echo.
    exit /b 1
)

call :ColorText 0A "✅ Prerequisites check passed"
echo.

:: Check environment files
call :ColorText 0B "🔧 Checking environment configuration..."
echo.

if not exist ".env" (
    call :ColorText 0E "⚠ Root .env not found, copying from example..."
    echo.
    copy .env.example .env >nul 2>&1 || echo. > .env
)

if not exist "backend\.env" (
    call :ColorText 0E "⚠ Backend .env not found, copying from example..."
    echo.
    copy backend\.env.example backend\.env >nul 2>&1 || echo. > backend\.env
)

if not exist "apps\web\.env" (
    call :ColorText 0E "⚠ Web .env not found, copying from example..."
    echo.
    copy apps\web\.env.example apps\web\.env >nul 2>&1 || echo. > apps\web\.env
)

:: Check dependencies
call :ColorText 0B "📦 Checking dependencies..."
echo.

if not exist "node_modules" (
    call :ColorText 0E "📦 Installing root dependencies..."
    echo.
    pnpm install
)

if not exist "backend\node_modules" (
    call :ColorText 0E "📦 Installing backend dependencies..."
    echo.
    cd backend && pnpm install && cd ..
)

if not exist "apps\web\node_modules" (
    call :ColorText 0E "📦 Installing web dependencies..."
    echo.
    cd apps\web && pnpm install && cd ..\..
)

call :ColorText 0A "✅ Dependencies ready"
echo.

:: Start services
call :ColorText 0B "🚀 Starting services..."
echo.
echo ==================================================

:: Start Backend API
call :ColorText 0B "🔧 Starting Backend API (Node.js)..."
echo.
start "Backend API" cmd /k "cd backend && pnpm dev"

:: Wait a bit for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend
call :ColorText 0B "🌐 Starting Frontend (Next.js)..."
echo.
start "Frontend" cmd /k "cd apps\web && pnpm dev"

:: Wait a bit for frontend to initialize
timeout /t 3 /nobreak >nul

:: Success message
echo.
call :ColorText 0A "=================================================="
echo.
call :ColorText 0A "🎉 All services started successfully!"
echo.
call :ColorText 0A "=================================================="
echo.
call :ColorText 0B "📍 Access Points:"
echo.
call :ColorText 0F "  🔧 Backend API:     http://localhost:%BACKEND_PORT%"
echo.
call :ColorText 0F "  🌐 Frontend:        http://localhost:%FRONTEND_PORT%"
echo.
call :ColorText 0F "  📱 Mobile:          Check separate terminal for Flutter"
echo.
echo.
call :ColorText 0E "📋 Available Commands:"
echo.
call :ColorText 0F "  📝 View logs:       Check individual terminal windows"
echo.
call :ColorText 0F "  🛑 Stop services:   Close terminal windows or run dev-stop.bat"
echo.
call :ColorText 0F "  🔄 Restart:        Run dev-start.bat again"
echo.
echo.
call :ColorText 0A "🚀 Happy coding!"
echo.

:: Keep window open
pause
exit /b

:: Function to display colored text
:ColorText
echo off
<nul set /p ".=%~2" > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" >nul 2>&1
exit /b