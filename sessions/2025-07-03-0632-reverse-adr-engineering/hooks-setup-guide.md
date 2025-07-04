# Brave Search Analysis Hook Setup Guide

## Interactive Hook Configuration

To add Brave search analysis, run `/hooks` in Claude Code and configure:

### Hook Configuration
```
Trigger: PostToolUse
Condition: tool == "mcp__brave-search__brave_web_search"
Command: /Users/jean-patricksmith/digital/leviathan/scripts/analyze-brave-search.sh
```

### Analysis Script
Create this script at `scripts/analyze-brave-search.sh`:

```bash
#!/bin/bash
# Analyze Brave search results and suggest storage

echo "📊 BRAVE SEARCH ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━"

# Suggest storage based on context
if [[ -d "sessions/$(date +%Y-%m-%d)*" ]]; then
    echo "💾 Active session detected - Save to: sessions/*/freestyle/research.md"
elif [[ -d "drafts" ]]; then
    echo "📝 Save to: drafts/$(date +%Y%m%d)-research.md"
else
    echo "📁 Save to: tmp/research-$(date +%Y%m%d-%H%M).md"
fi

echo ""
echo "🔍 Extract these insights:"
echo "  • Key frameworks/tools discovered"
echo "  • Comparison points between solutions"
echo "  • Implementation patterns identified"
echo "  • Gaps in current approach"
```

## Benefits
- Automatic research organization guidance
- Session-aware storage suggestions
- Consistent documentation patterns
- Research synthesis reminders