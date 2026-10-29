@echo off
echo Starting Fake Review Detection Frontend...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Start the Next.js development server
echo Starting Next.js development server on http://localhost:3000
npm run dev
