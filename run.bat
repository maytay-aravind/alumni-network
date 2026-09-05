@echo off
title Alumni Network System
cd /d "%~dp0"
echo ========================================
echo  Alumni Network System - Local Run
echo  Folder: %CD%
echo ========================================
echo.

echo [1/5] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js NOT found!
    echo Install Node.js LTS from https://nodejs.org
    echo After install, restart this window and double-click run.bat again
    pause
    exit /b 1
)
node --version
echo [OK] Node found
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm NOT found - reinstall Node.js
    pause
    exit /b 1
)
echo [OK] npm found
echo.

echo [2/5] Checking env files...
if not exist ".env.local" (
    echo [ERROR] .env.local NOT found in %CD%
    echo Fix: copy .env.example to .env.local and fill Supabase + Gemini keys
    echo   copy .env.example .env.local
    pause
    exit /b 1
)
echo [OK] .env.local found

if not exist "backend\.env" (
    echo [INFO] Creating backend\.env from .env.local...
    if not exist "backend" mkdir backend
    echo PORT=4000> "backend\.env"
    echo FRONTEND_URL=http://localhost:3000>> "backend\.env"
    type ".env.local" >> "backend\.env"
    echo [OK] backend\.env created
) else (
    echo [OK] backend\.env found
)
echo.

echo [3/5] Installing frontend dependencies...
echo [INFO] Running: npm install (in %CD%)
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend install failed - see errors above
    pause
    exit /b 1
)
echo [OK] Frontend ready
echo.

echo [3b/5] Installing backend dependencies...
if exist "backend\package.json" (
    echo [INFO] Running: npm install (in backend)
    pushd backend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Backend install failed
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Backend ready
) else (
    echo [INFO] No backend/package.json - skipping
)
echo.

echo [4/5] Starting backend...
if exist "backend\server.js" (
    echo [INFO] Opening new window for backend http://localhost:4000
    start "Alumni Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"
    echo [OK] Backend window opened - wait 3 seconds...
    timeout /t 3 >nul
) else (
    echo [INFO] No backend/server.js - frontend only
)
echo.

echo [5/5] Starting frontend...
echo ========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:4000
echo  Keep BOTH windows open
echo  Press Ctrl+C here to stop frontend
echo ========================================
echo.

call npm run dev

echo.
echo ========================================
echo  Frontend stopped
echo  Backend window still open - close it manually
echo ========================================
pause
