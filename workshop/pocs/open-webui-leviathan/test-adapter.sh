#!/bin/bash
# Quick test script for the adapter

echo "🧪 Testing Leviathan Adapter..."
echo ""

# Test health endpoint
echo "1. Health Check:"
curl -s http://localhost:7894/health | python -m json.tool || echo "❌ Health check failed"
echo ""

# Test memory dashboard
echo "2. Memory Dashboard:"
curl -s http://localhost:7894/v1/memory/dashboard | python -m json.tool | head -20
echo "   ... (truncated)"
echo ""

# Test chat completion
echo "3. Chat Completion Test:"
curl -s -X POST http://localhost:7894/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello, test message"}],
    "model": "leviathan-agent",
    "session_id": "test-session"
  }' | python -m json.tool
echo ""

echo "✅ Tests complete!"