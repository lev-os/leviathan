#!/bin/bash

echo "🧠 LLM-First Configuration System - Quick Start"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create data directory
mkdir -p data/logs data/metrics

echo "🐳 Building and starting Docker containers..."
echo

# Build and start the system
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ System is running!"
    echo
    echo "🌐 Web Dashboard: http://localhost:3000"
    echo "📊 Health Check:  http://localhost:8080/health"
    echo
    echo "📋 Quick Actions:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop system:   docker-compose down"
    echo "  Stress test:   docker exec llm-config-system stress-ng --cpu 2 --timeout 30s"
    echo
    echo "🔍 To run in dry-run mode (safe testing):"
    echo "  DRY_RUN=true docker-compose up --build"
    echo
    echo "🚀 The AI is now monitoring your system and will make optimization decisions automatically!"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi