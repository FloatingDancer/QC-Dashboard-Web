@echo off
echo ===================================================
echo Memulai mode Development QC Dashboard (Q-Shield Pro)
echo ===================================================
echo.
echo Memulai Backend Server (FastAPI)...
start cmd /k "cd backend && .\venv\Scripts\python -m uvicorn app.main:app --port 8000"
echo.
echo Memulai Frontend Server (Vite dev)...
start cmd /k "cd frontend && cmd /c \"npm run dev\""
echo.
echo Selesai! Buka http://localhost:5173 di browser Anda.
