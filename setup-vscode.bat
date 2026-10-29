@echo off
echo Setting up Fake Review Detection System in VS Code...

REM Create necessary directories
if not exist "backend\models" mkdir backend\models
if not exist "backend\datasets" mkdir backend\datasets
if not exist "backend\logs" mkdir backend\logs
if not exist "backend\tests" mkdir backend\tests

REM Create .env file for backend
echo Creating environment configuration...
echo PYTHONPATH=. > backend\.env
echo LOG_LEVEL=INFO >> backend\.env
echo API_HOST=0.0.0.0 >> backend\.env
echo API_PORT=8000 >> backend\.env

REM Create .env.local for frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NODE_ENV=development >> .env.local

echo Setup complete! Open this folder in VS Code and use Ctrl+Shift+P to run tasks.
echo.
echo Quick Start:
echo 1. Open VS Code in this directory
echo 2. Press Ctrl+Shift+P
echo 3. Type "Tasks: Run Task"
echo 4. Select "Setup Complete Project"
echo 5. Then run "Start Backend Server" and "Start Frontend Server"
echo.
pause
