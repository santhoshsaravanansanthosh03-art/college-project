@echo off
title OmniPoints - Universal Loyalty Platform Launcher
echo ===================================================================
echo      Launching OmniPoints Universal Loyalty Platform
echo ===================================================================
echo Starting FastAPI Backend Ledger (Port 8000)...
start "OmniPoints Backend (Port 8000)" cmd /k "cd /d C:\Users\Santhosh\.gemini\antigravity\scratch\universal-loyalty-platform\backend && python run.py"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting React Frontend (Port 3000)...
start "OmniPoints Frontend (Port 3000)" cmd /k "set PATH=C:\Users\Santhosh\.gemini\antigravity\scratch\nodejs;%%PATH%% && cd /d C:\Users\Santhosh\.gemini\antigravity\scratch\universal-loyalty-platform\frontend && cmd.exe /c npm.cmd run dev"

echo.
echo ===================================================================
echo  Services Running:
echo    - Frontend App:   http://localhost:3000
echo    - Backend API:    http://localhost:8000
echo    - Swagger Docs:   http://localhost:8000/docs
echo ===================================================================
echo Press any key to exit this launcher window (services keep running).
pause >nul
