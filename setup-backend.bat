@echo off
echo Setting up ConnectEd Backend...
echo.

cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo Please edit backend\.env and add your GROQ_API_KEY
    echo.
)

echo Initializing database...
python init_db.py

echo Seeding database with sample data...
python seed.py

echo.
echo ========================================
echo Backend setup complete!
echo.
echo To start the backend server:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn main:app --reload --port 8000
echo ========================================
echo.

pause
