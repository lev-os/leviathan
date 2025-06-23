#!/bin/bash

# Start Graphiti Memory System
echo "🧠 Starting Kingly Graphiti Memory System..."

# Check if .env file exists
if [ ! -f ".kingly/graphiti/.env" ]; then
    echo "❌ .env file not found. Please configure API keys in .kingly/graphiti/.env"
    exit 1
fi

# Load environment variables
export $(cat .kingly/graphiti/.env | grep -v '^#' | xargs)

# Check if required API keys are set
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ No API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env"
    exit 1
fi

# Start services
echo "🚀 Starting Neo4j database..."
cd .kingly/graphiti && docker-compose up -d neo4j

echo "⏳ Waiting for Neo4j to be ready..."
sleep 10

# Check Neo4j health
docker-compose exec neo4j cypher-shell -u neo4j -p kingly-password "RETURN 'Neo4j is ready' as status" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Neo4j is ready"
else
    echo "❌ Neo4j failed to start properly"
    docker-compose logs neo4j
    exit 1
fi

echo "🧠 Starting Graphiti MCP server..."
docker-compose up -d graphiti-mcp

echo "⏳ Waiting for Graphiti MCP server..."
sleep 5

# Check if MCP server is responding
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Graphiti MCP server is ready"
else
    echo "⚠️  Graphiti MCP server may still be starting..."
fi

echo ""
echo "🎯 Kingly Graphiti Memory System Status:"
echo "   Neo4j Browser: http://localhost:7474"
echo "   MCP Server: http://localhost:3001"
echo "   Username: neo4j"
echo "   Password: kingly-password"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Claude Desktop to use MCP server"
echo "   2. Test memory capture with: node test-graphiti-integration.js"
echo "   3. Monitor patterns in Neo4j Browser"

cd ../..