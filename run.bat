@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo  Alumni Network System
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node %~nx0
node --version
echo.

REM Check .env.local
if not exist ".env.local" (
    echo [ERROR] .env.local not found.
    echo Copy .env.example to .env.local and fill in your keys.
    echo   copy .env.example .env.local
    pause
    exit /b 1
)
echo [OK] .env.local found
echo.

REM Check if port 3000 already in use
netstat -ano | findstr :3000 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [WARN] Port 3000 already in use - server may already be running
    echo [INFO] Check http://localhost:3000 in your browser
    echo [INFO] Or close the other terminal and try again
    echo.
)

REM Install deps if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies (first run, please wait)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
) else (
    echo [OK] Dependencies ready
    echo.
)

echo ========================================
echo  Starting dev server...
echo  URL: http://localhost:3000
echo  Press Ctrl+C to stop
echo ========================================
echo.
echo [INFO] Compiling... (wait for "Ready" message)
echo.

call npm run dev

REM If we reach here, server stopped
echo.
echo ========================================
if %ERRORLEVEL% equ 0 (
    echo  Server stopped cleanly
) else (
    echo  Server stopped with error code %ERRORLEVEL%
    echo  Check the messages above for details
)
echo ========================================
pause
