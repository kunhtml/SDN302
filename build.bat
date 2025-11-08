@echo off
echo ========================================
echo   eBay Clone - Production Build
echo ========================================
echo.

REM Build Backend
echo Building Backend...
cd backend
call npm install --production
if errorlevel 1 (
    echo ERROR: Backend build failed!
    cd ..
    pause
    exit /b 1
)
echo Backend build completed!
cd ..

REM Build Frontend
echo.
echo Building Frontend...
cd frontend
call npm install
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
echo Frontend build completed!
cd ..

echo.
echo ========================================
echo   Build Completed Successfully!
echo ========================================
echo.
echo Frontend build location: frontend\build
echo.
echo To deploy:
echo   1. Upload backend folder to your server
echo   2. Upload frontend\build folder to web server (Nginx/Apache)
echo   3. Configure environment variables on server
echo   4. Start backend with: npm start
echo.
pause
