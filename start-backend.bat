@echo off
echo ========================================
echo   eBay Clone - Backend Setup
echo ========================================
echo.

cd backend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo node_modules found. Skipping installation...
)

echo.
echo Checking .env file...
if not exist ".env" (
    echo .env file not found. Creating from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env file with your configuration!
    echo Required settings:
    echo   - MONGO_URI (MongoDB connection string)
    echo   - JWT_SECRET (Your secret key)
    echo   - Email configuration (if using email features)
    echo.
    pause
)

echo.
echo ========================================
echo   Starting Backend Development Server
echo ========================================
echo.
echo Backend API will run at: http://localhost:5000
echo API Version: v1
echo Health check: http://localhost:5000/health
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
