@echo off
REM Process Automation Assessment Tool - Deployment Script for Windows

echo 🤖 Process Automation Assessment Tool Deployment
echo ================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "backend\media" mkdir backend\media
if not exist "backend\staticfiles" mkdir backend\staticfiles

REM Copy environment file if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating environment file...
    copy "backend\env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your configuration before continuing
    echo    Press Enter to continue or Ctrl+C to exit...
    pause >nul
)

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose up -d --build

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 30 /nobreak >nul

REM Run database migrations
echo 🗄️  Running database migrations...
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

echo.
echo 🎉 Deployment completed!
echo.
echo 📍 Your application is now running at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    Admin Panel: http://localhost:8000/admin
echo.
echo 🔧 To stop the application: docker-compose down
echo 🔧 To view logs: docker-compose logs -f
echo 🔧 To restart: docker-compose restart
echo.
echo 🚀 Happy automating!
pause
