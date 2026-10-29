# PowerShell setup script for VS Code
Write-Host "Setting up Fake Review Detection System in VS Code..." -ForegroundColor Green

# Create necessary directories
$directories = @(
    "backend\models",
    "backend\datasets", 
    "backend\logs",
    "backend\tests"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Create .env file for backend
$backendEnv = @"
PYTHONPATH=.
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000
"@

$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "Created backend .env file" -ForegroundColor Yellow

# Create .env.local for frontend
$frontendEnv = @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
"@

$frontendEnv | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "Created frontend .env.local file" -ForegroundColor Yellow

Write-Host "`nSetup complete! 🎉" -ForegroundColor Green
Write-Host "`nQuick Start:" -ForegroundColor Cyan
Write-Host "1. Open VS Code in this directory" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "3. Type 'Tasks: Run Task'" -ForegroundColor White
Write-Host "4. Select 'Setup Complete Project'" -ForegroundColor White
Write-Host "5. Then run 'Start Backend Server' and 'Start Frontend Server'" -ForegroundColor White
Write-Host "`nAccess points:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8000/docs" -ForegroundColor White
