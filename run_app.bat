@echo off
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
