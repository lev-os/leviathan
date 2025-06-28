# Jared's Brain - Local Memory Storage

This directory contains Jared's local memory storage organized by type:

## Directory Structure

- `conversations/` - Conversation history and context
- `projects/` - Project status, relationships, and opportunities
- `intelligence/` - Gathered intelligence, trends, and insights

## Storage Format

All data is stored as JSON files with timestamps and metadata for easy retrieval and analysis.

### Conversation Memory
```json
{
  "id": "conv-123",
  "userId": "jp",
  "platform": "slack",
  "messages": [...],
  "context": {...},
  "timestamp": "2025-01-27T12:00:00Z"
}
```

### Project Memory
```json
{
  "id": "proj-choosehealthy",
  "name": "ChooseHealthy",
  "status": "on_hold",
  "opportunities": [...],
  "relationships": [...],
  "lastUpdated": "2025-01-27T12:00:00Z"
}
```

### Intelligence Memory
```json
{
  "id": "intel-123",
  "topic": "AI wearables",
  "sources": ["hackernews", "github"],
  "findings": [...],
  "relevance": 0.85,
  "timestamp": "2025-01-27T12:00:00Z"
}
```

## Note

Files in these directories are ignored by git (see .gitignore) to protect sensitive conversation and project data.