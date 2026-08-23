@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo  Alumni Network System - Starting...
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM Check .env.local
if not exist ".env.local" (
    echo [ERROR] .env.local not found.
    echo Copy .env.example to .env.local and fill in your keys.
    echo   copy .env.example .env.local
    pause
    exit /b 1
)

REM Install deps if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [INFO] Starting dev server at http://localhost:3000
echo [INFO] Press Ctrl+C to stop.
echo.
call npm run dev
pause
