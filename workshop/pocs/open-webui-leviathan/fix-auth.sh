#!/bin/bash
# Fix Open WebUI authentication by starting fresh

echo "🔧 Fixing Open WebUI authentication..."

# Stop and remove existing container
echo "Stopping existing container..."
docker stop open-webui 2>/dev/null || echo "No container to stop"
docker rm open-webui 2>/dev/null || echo "No container to remove"

# Remove volume with existing users
echo "Removing volume with existing user data..."
docker volume rm open-webui 2>/dev/null || echo "No volume to remove"

# Start fresh container without authentication
echo "Starting fresh Open WebUI without authentication..."
docker run -d \
  --name open-webui \
  -p 3002:8080 \
  -e WEBUI_AUTH=False \
  --restart always \
  ghcr.io/open-webui/open-webui:main

echo "Waiting for startup..."
sleep 10

# Test if it's running
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ Open WebUI running at http://localhost:3002 (no login required)"
else
    echo "❌ Open WebUI not ready yet, check docker logs open-webui"
fi

echo ""
echo "🔧 Next: Configure model provider in Open WebUI:"
echo "   Settings → Connections → Add OpenAI API"  
echo "   URL: http://host.docker.internal:7894/v1"
echo "   API Key: any-key-works"
echo "   Model: leviathan-agent"