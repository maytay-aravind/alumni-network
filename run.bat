@echo off
setlocal EnableDelayedExpansion
title Alumni Network System
cd /d "%~dp0"
echo ========================================
echo  Alumni Network System
echo  Folder: %CD%
echo ========================================
echo.

REM Keep window open on any error
if "%1"=="--no-pause" goto :skipPauseTrap
if not "%~0"=="%~dp0run.bat" (
  echo [INFO] Running from Explorer - window will stay open
  echo.
)
:skipPauseTrap

echo [1/4] Checking Node.js...
where node >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Node.js NOT found!
    echo Install Node.js from https://nodejs.org (LTS version)
    echo After install, close this window and double-click run.bat again
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v
echo [OK] Node !NODE_VER! found
where npm >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo [ERROR] npm NOT found (comes with Node.js)
    echo Reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] npm found
echo.

echo [2/4] Checking .env.local...
if not exist ".env.local" (
    echo [ERROR] .env.local NOT found in %CD%
    echo.
    echo Fix: copy .env.example to .env.local and add your keys
    echo   copy .env.example .env.local
    echo Then edit .env.local with your Supabase and Gemini keys
    echo.
    if exist ".env.example" (
        echo [INFO] Found .env.example - you can copy it now
    )
    pause
    exit /b 1
)
echo [OK] .env.local found
echo.

echo [3/4] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] node_modules missing - installing (this takes 1-2 minutes)...
    echo.
    call npm install
    if !ERRORLEVEL! equ 0 (
        echo.
        echo [ERROR] npm install failed - see errors above
        echo Try: delete node_modules folder and run again
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed
) else (
    echo [OK] node_modules ready
)
echo.

echo [4/4] Starting dev server...
echo ========================================
echo  URL: http://localhost:3000
echo  Keep this window OPEN while using the site
echo  Press Ctrl+C to stop the server
echo ========================================
echo.
echo [INFO] If port 3000 is busy, you will see EADDRINUSE error below
echo [INFO] Waiting for Next.js to show "Ready" - then open browser
echo.
timeout /t 2 >nul

call npm run dev

REM Server stopped - keep window open
echo.
echo ========================================
echo  Server has stopped
if !ERRORLEVEL! equ 0 (
    echo  It stopped cleanly (you pressed Ctrl+C)
) else (
    echo  Exit code: !ERRORLEVEL!
    echo  Look for errors above (e.g., port in use, missing env)
)
echo ========================================
echo.
echo Window will stay open - press any key to close
pause >nul
endlocal
