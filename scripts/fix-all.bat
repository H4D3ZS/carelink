@echo off
chcp 65001 >nul
echo 🔥 CareLink QR - Nuclear Fix (Windows)
echo ==================================================

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo 📁 Project Root: %CD%

echo 💀 Step 1: Killing processes on ports...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM next.exe 2>nul
taskkill /F /IM ts-node-dev 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a on port 3001
    taskkill /F /PID %%a 2>nul
)
echo ✅ Processes killed

echo 🗑️ Step 2: Clearing cache...
if exist apps\web\.next rmdir /s /q apps\web\.next 2>nul
if exist backend\dist rmdir /s /q backend\dist 2>nul
echo ✅ Cache cleared

echo 🧹 Step 3: Nuking node_modules and lockfiles...
if exist node_modules rmdir /s /q node_modules 2>nul
if exist apps\web\node_modules rmdir /s /q apps\web\node_modules 2>nul
if exist backend\node_modules rmdir /s /q backend\node_modules 2>nul

del /f /q pnpm-lock.yaml 2>nul
del /f /q apps\web\pnpm-lock.yaml 2>nul
del /f /q backend\pnpm-lock.yaml 2>nul
del /f /q package-lock.json 2>nul

echo ✅ All modules and lockfiles nuked

echo 📦 Step 4: Reinstalling root dependencies...
call pnpm install --no-frozen-lockfile
if errorlevel 1 (
    echo ❌ Root install failed
    exit /b 1
)
echo ✅ Root dependencies installed

echo 📦 Step 5: Reinstalling backend dependencies...
cd backend

REM Try npm first for native deps
call npm install --legacy-peer-deps 2>nul
if errorlevel 1 (
    echo npm failed, trying pnpm...
    call pnpm install --no-frozen-lockfile
)

echo ✅ Backend dependencies installed

echo 🔍 Step 6: Verifying sqlite3...
if exist node_modules\sqlite3 (
    echo ✅ sqlite3 found
) else (
    echo ❌ sqlite3 NOT found! Installing manually...
    call npm install sqlite3 --legacy-peer-deps
)
cd ..

echo 📦 Step 7: Reinstalling web dependencies...
cd apps\web
call pnpm install --no-frozen-lockfile
cd ..\..
echo ✅ Web dependencies installed

echo.
echo ==================================================
echo ✅ Nuclear fix complete!
echo ==================================================
echo.
echo 🚀 You can now start the development server:
echo    .\scripts\dev-start.bat
echo.
pause
