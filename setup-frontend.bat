@echo off
echo Setting up ConnectEd Frontend...
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo ========================================
echo Frontend setup complete!
echo.
echo To start the frontend server:
echo   cd frontend
echo   npm run dev
echo ========================================
echo.

pause
