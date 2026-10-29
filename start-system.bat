@echo off
echo Starting Fake Review Detection System with User History...

REM Start backend
echo Starting backend server...
start cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"

REM Wait a moment for backend to start
timeout /t 5

REM Start frontend
echo Starting frontend server...
start cmd /k "npm install && npm run dev"

echo System is starting up...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause
