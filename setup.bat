@echo off
echo ========================================
echo   eBay Clone - Project Setup
echo ========================================
echo.
echo This script will:
echo 1. Install Backend dependencies
echo 2. Install Frontend dependencies
echo 3. Create .env files from examples
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM Install Backend
echo.
echo ========================================
echo   Installing Backend Dependencies
echo ========================================
cd backend
if not exist ".env" (
    copy .env.example .env
    echo Created backend\.env file
)
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed!
    cd ..
    pause
    exit /b 1
)
echo Backend installation completed!
cd ..

REM Install Frontend
echo.
echo ========================================
echo   Installing Frontend Dependencies
echo ========================================
cd frontend
if not exist ".env" (
    copy .env.example .env
    echo Created frontend\.env file
)
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed!
    cd ..
    pause
    exit /b 1
)
echo Frontend installation completed!
cd ..

echo.
echo ========================================
echo   Setup Completed Successfully!
echo ========================================
echo.
echo IMPORTANT: Please configure your environment files:
echo   - backend\.env (MongoDB URI, JWT Secret, etc.)
echo   - frontend\.env (API URL)
echo.
echo To start the project:
echo   - Run: start-all.bat (both servers)
echo   - Or run: start-backend.bat and start-frontend.bat separately
echo.
pause
