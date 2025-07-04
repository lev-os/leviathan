# Brave Search Analysis Enhancement

## Current Issue
The Brave search results are not automatically analyzed for where to save research findings. The tool returns raw search results without processing or suggesting storage locations.

## Proposed Enhancement
Add a post-processing hook that:
1. Analyzes search results for research relevance
2. Suggests appropriate save locations based on content
3. Extracts key insights for documentation

## Storage Patterns for Research
- **drafts/** - Active research and exploration
- **tmp/** - Multi-step processing and temporary analysis
- **docs/research/** - Curated research findings
- **sessions/*/freestyle/** - Session-specific research

## Example Analysis Flow
```yaml
brave_search_hook:
  trigger: "after_brave_search"
  actions:
    - analyze_content_type
    - suggest_storage_location
    - extract_key_insights
    - create_research_summary
```