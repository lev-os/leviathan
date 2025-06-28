#!/bin/bash
# Simple run script for the Leviathan adapter

# Activate virtual environment
source venv/bin/activate

echo "🚀 Starting Leviathan Adapter..."
echo "   This will auto-find available ports starting at 7893/7894"
echo "   Press Ctrl+C to stop"
echo ""

# Run the adapter
python src/leviathan_adapter.py