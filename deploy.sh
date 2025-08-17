#!/bin/bash

# Process Automation Assessment Tool - Deployment Script

echo "🤖 Process Automation Assessment Tool Deployment"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/media
mkdir -p backend/staticfiles

# Copy environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating environment file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration before continuing"
    echo "   Press Enter to continue or Ctrl+C to exit..."
    read
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
echo "👤 Do you want to create a superuser? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker-compose exec backend python manage.py createsuperuser
fi

# Load sample data (optional)
echo "📊 Do you want to load sample data? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker-compose exec backend python manage.py loaddata sample_data.json
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📍 Your application is now running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "🔧 To stop the application: docker-compose down"
echo "🔧 To view logs: docker-compose logs -f"
echo "🔧 To restart: docker-compose restart"
echo ""
echo "🚀 Happy automating!"
