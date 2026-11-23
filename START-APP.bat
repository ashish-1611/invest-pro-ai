@echo off
title Invest-AI Pro Launcher
echo ========================================================
echo   INVEST-AI PRO - INSTITUTIONAL INVESTMENT RESEARCH
echo ========================================================
echo.

if not exist node_modules (
    echo [INFO] Installing required packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please ensure Node.js is installed.
        pause
        exit /b 1
    )
)

echo [INFO] Launching Invest-AI Pro at http://localhost:5173 ...
timeout /t 2 /nobreak >nul
start http://localhost:5173
call npm run dev
pause
