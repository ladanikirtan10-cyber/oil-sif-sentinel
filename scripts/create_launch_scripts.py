bat_content = """@echo off
title OIL SIF SENTINEL - Startup Launcher
echo ================================================================
echo   OIL SIF SENTINEL - AI-Powered Safety Intelligence Platform
echo   Smart India Hackathon Problem Statement SIH26165
echo ================================================================
echo.

echo [1/3] Ensuring dependencies and initial database seed...
python scripts/generate_demo_data.py --count 150

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "OIL SIF Backend (FastAPI)" cmd /k "python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Starting Vite React Frontend on http://localhost:5173 ...
cd frontend
start "OIL SIF Frontend (React)" cmd /k "npm run dev"

echo.
echo ================================================================
echo   OIL SIF SENTINEL is running!
echo   Frontend UI: http://localhost:5173
echo   Backend API: http://127.0.0.1:8000/docs
echo ================================================================
pause
"""

ps1_content = """# OIL SIF SENTINEL - Startup Launcher PowerShell Script
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  OIL SIF SENTINEL - AI Safety Intelligence Platform (SIH26165)  " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Ensuring demo database seed..." -ForegroundColor Gray
python scripts/generate_demo_data.py --count 150

Write-Host "`n[2/3] Launching FastAPI Backend Server..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

Write-Host "`n[3/3] Launching React Vite Frontend Server..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host "`nServers launched successfully!" -ForegroundColor Green
Write-Host "Frontend Application: http://localhost:5173" -ForegroundColor White
Write-Host "Backend Swagger API:  http://127.0.0.1:8000/docs" -ForegroundColor White
"""

with open('run_app.bat', 'w', encoding='utf-8') as f:
    f.write(bat_content)
with open('run_app.ps1', 'w', encoding='utf-8') as f:
    f.write(ps1_content)
print('Created run_app.bat and run_app.ps1 launch scripts.')
