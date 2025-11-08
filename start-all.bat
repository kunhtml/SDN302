@echo off
echo ========================================
echo   eBay Clone - Full Stack Startup
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.

echo.
echo Starting Backend Server...
start "eBay Clone - Backend" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
start "eBay Clone - Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Both servers are starting in separate windows!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the servers.
echo.
pause
