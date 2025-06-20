#!/bin/bash
# Simple Performance Test - Go vs JS

set -e

GO_BINARY="/Users/jean-patricksmith/digital/leviathan/os/agent/go-agent/bin/lev-go"
JS_BINARY="/Users/jean-patricksmith/digital/leviathan/agent/bin/lev"

echo "🚀 Leviathan Performance Test"
echo "============================="

# Test if binaries exist
echo "📁 Checking binaries..."
if [ -f "$GO_BINARY" ]; then
    echo "✅ Go binary found: $(du -h "$GO_BINARY" | cut -f1)"
else
    echo "❌ Go binary not found"
    exit 1
fi

if [ -f "$JS_BINARY" ]; then
    echo "✅ JS binary found"
else
    echo "⚠️  JS binary not found - will skip JS comparison"
fi

echo ""

# Quick test - Go help command
echo "⚡ Testing Go Implementation:"
echo "Command: $GO_BINARY help"
time "$GO_BINARY" help > /dev/null

echo ""

# Quick test - Go find command  
echo "⚡ Testing Go Find:"
echo "Command: $GO_BINARY find \"test query\""
time "$GO_BINARY" find "test query" > /dev/null

echo ""

# Test JS if available
if [ -f "$JS_BINARY" ]; then
    echo "⚡ Testing JS Implementation:"
    echo "Command: $JS_BINARY help"
    time "$JS_BINARY" help > /dev/null 2>&1 || echo "JS test failed"
    
    echo ""
    echo "⚡ Testing JS Find:"
    echo "Command: $JS_BINARY find \"test query\""
    time "$JS_BINARY" find "test query" > /dev/null 2>&1 || echo "JS find test failed"
fi

echo ""
echo "✅ Performance test complete!"
echo ""
echo "Expected results:"
echo "- Go should be significantly faster (especially for startup)"
echo "- Go binary is self-contained (~2.5MB)"
echo "- Both should produce compatible output"