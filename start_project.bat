@echo off
title OIL SIF SENTINEL - Startup Launcher
echo ======================================================================
echo          OIL SIF SENTINEL - AI SIF Precursor Intelligence
echo           Oil India Limited - Smart India Hackathon (SIH26165)
echo ======================================================================
echo.
echo Starting Backend (FastAPI on port 8000)...
start "OIL SIF Backend" cmd /k "cd /d %~dp0 && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend (Vite on port 5173)...
start "OIL SIF Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening OIL SIF SENTINEL in browser: http://localhost:5173 ...
start http://localhost:5173

echo.
echo ======================================================================
echo Services started successfully!
echo Frontend: http://localhost:5173
echo API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
pause
