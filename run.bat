@echo off
setlocal EnableDelayedExpansion
title Alumni Network System
cd /d "%~dp0"
echo ========================================
echo  Alumni Network System - Local Run
echo  Folder: %CD%
echo ========================================
echo.

echo [1/5] Checking Node.js...
where node >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Node.js NOT found! Install LTS from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v
echo [OK] Node !NODE_VER!
where npm >nul 2>nul
if !ERRORLEVEL! neq 0 (
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
echo [OK] .env.local found (frontend)

REM Ensure backend .env exists - copy from root .env.local if missing
if not exist "backend\.env" (
    echo [INFO] backend\.env missing - creating from .env.local...
    if not exist "backend" mkdir backend >nul 2>nul
    (
        echo PORT=4000
        echo FRONTEND_URL=http://localhost:3000
        for /f "usebackq tokens=*" %%a in (".env.local") do (
            echo %%a
        )
    ) > "backend\.env"
    echo [OK] backend\.env created
) else (
    echo [OK] backend\.env found
)
echo.

echo [3/5] Installing dependencies...
if not exist "node_modules" (
    echo [INFO] Installing frontend deps (1-2 min)...
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Frontend npm install failed
        pause
        exit /b 1
    )
    echo [OK] Frontend deps ready
) else (
    echo [OK] Frontend deps ready
)

if exist "backend\package.json" (
    if not exist "backend\node_modules" (
        echo [INFO] Installing backend deps...
        pushd backend
        call npm install
        if !ERRORLEVEL! neq 0 (
            echo [ERROR] Backend npm install failed
            popd
            pause
            exit /b 1
        )
        popd
        echo [OK] Backend deps ready
    ) else (
        echo [OK] Backend deps ready
    )
) else (
    echo [INFO] No backend/package.json - skipping backend install
)
echo.

echo [4/5] Starting servers...
echo [INFO] Backend will run at http://localhost:4000
echo [INFO] Frontend will run at http://localhost:3000
echo.

REM Start backend in new window if it exists
if exist "backend\server.js" (
    echo [INFO] Launching backend in new window...
    start "Alumni Backend - http://localhost:4000" cmd /k "cd /d "%~dp0backend" && echo Backend starting... && npm run dev"
    timeout /t 3 >nul
    echo [OK] Backend window opened
) else (
    echo [INFO] No backend/server.js - running frontend only
)
echo.

echo [5/5] Starting frontend...
echo ========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:4000 (separate window)
echo  Keep BOTH windows open while using the site
echo  Press Ctrl+C here to stop frontend
echo ========================================
echo.

call npm run dev

echo.
echo ========================================
echo  Frontend stopped (code !ERRORLEVEL!)
echo  Backend window is still open - close it manually if needed
echo ========================================
pause
endlocal
