# OIL SIF SENTINEL - Startup Launcher PowerShell Script
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
