@echo off
echo 🛑 CareLink QR - Stopping Development Environment
echo ==================================================

:: Kill Node.js processes (Backend and Frontend)
echo Stopping Node.js services...
taskkill /F /IM node.exe /T 2>nul

:: Kill Next.js processes
taskkill /F /IM next.exe /T 2>nul

:: Kill pnpm processes if they exist
taskkill /F /IM pnpm.exe /T 2>nul

:: Optional: Kill specific ports
echo.
echo 🔍 Checking ports...

:: Function to kill process by port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Stopping process on port 3000 (PID: %%a)
    taskkill /PID %%a /F 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Stopping process on port 3001 (PID: %%a)
    taskkill /PID %%a /F 2>nul
)

echo.
echo ✅ All services stopped
echo ==================================================
echo.
pause