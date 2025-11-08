@echo off
echo ========================================
echo   eBay Clone - Frontend Setup
echo ========================================
echo.

cd frontend

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
    echo IMPORTANT: Please edit frontend\.env file with your configuration!
    echo Default API URL: http://localhost:5000/api/v1
    echo.
)

echo.
echo ========================================
echo   Starting Frontend Development Server
echo ========================================
echo.
echo Frontend will run at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
