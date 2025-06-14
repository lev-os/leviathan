#!/bin/bash

echo "🧪 LLM-First Configuration System - Test Suite"
echo "=============================================="

# Check if system is running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ System is not running. Start it first with: ./start.sh"
    exit 1
fi

echo "🎯 Running comprehensive system tests..."
echo

# Test 1: API Health Check
echo "1️⃣ Testing API connectivity..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "   ✅ Web API is responsive"
else
    echo "   ❌ Web API is not accessible"
fi

if curl -s http://localhost:8080/health > /dev/null; then
    echo "   ✅ Backend health check is working"
else
    echo "   ❌ Backend health check failed"
fi

echo

# Test 2: Generate CPU Load
echo "2️⃣ Testing AI response to CPU stress..."
echo "   🔥 Generating CPU load for 30 seconds..."
docker exec llm-config-system stress-ng --cpu 4 --timeout 30s > /dev/null 2>&1 &
STRESS_PID=$!

echo "   ⏳ Monitoring AI decisions (watch the dashboard for real-time updates)"
echo "   📊 Dashboard: http://localhost:3000"

# Wait for stress test to complete
wait $STRESS_PID

echo "   ✅ CPU stress test completed"
echo

# Test 3: Generate Memory Pressure
echo "3️⃣ Testing AI response to memory pressure..."
echo "   💾 Generating memory pressure for 20 seconds..."
docker exec llm-config-system stress-ng --vm 2 --vm-bytes 512M --timeout 20s > /dev/null 2>&1 &
MEMORY_PID=$!

wait $MEMORY_PID
echo "   ✅ Memory stress test completed"
echo

# Test 4: API Data Check
echo "4️⃣ Checking data collection..."

# Check telemetry data
TELEMETRY_COUNT=$(curl -s http://localhost:3000/api/telemetry | jq '. | length' 2>/dev/null || echo "0")
echo "   📊 Telemetry samples collected: $TELEMETRY_COUNT"

# Check AI decisions
DECISIONS_COUNT=$(curl -s http://localhost:3000/api/decisions | jq '. | length' 2>/dev/null || echo "0")
echo "   🤖 AI decisions made: $DECISIONS_COUNT"

# Check configuration changes
CONFIG_COUNT=$(curl -s http://localhost:3000/api/configurations | jq '. | length' 2>/dev/null || echo "0")
echo "   ⚙️ Configuration changes applied: $CONFIG_COUNT"

echo

# Test 5: Dashboard Accessibility
echo "5️⃣ Testing dashboard functionality..."
if curl -s http://localhost:3000 | grep -q "LLM-First Configuration System"; then
    echo "   ✅ Dashboard is accessible and loaded"
else
    echo "   ❌ Dashboard is not loading properly"
fi

echo

# Summary
echo "📊 TEST RESULTS SUMMARY"
echo "======================="
echo "🌐 Web Dashboard:     http://localhost:3000"
echo "📈 Real-time Metrics: Watch CPU/Memory/Network charts"
echo "🤖 AI Decisions:      Check decision log for AI reasoning"
echo "⚙️ Config Changes:    Monitor applied optimizations"
echo

if [ "$DECISIONS_COUNT" -gt "0" ]; then
    echo "🎉 SUCCESS: AI made $DECISIONS_COUNT intelligent decisions!"
    echo "   The LLM-first configuration system is working correctly."
    echo "   Check the dashboard to see detailed AI reasoning and impacts."
else
    echo "⚠️  No AI decisions detected yet. This could mean:"
    echo "   - System load was not high enough to trigger optimizations"
    echo "   - AI is running in dry-run mode"
    echo "   - System is operating within normal parameters"
    echo
    echo "💡 Try running: docker exec llm-config-system stress-ng --cpu 8 --timeout 60s"
fi

echo
echo "🔄 To continue monitoring: docker-compose logs -f"
echo "🛑 To stop the system: docker-compose down"