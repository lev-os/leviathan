# Notion Task MCP Server

A Model Context Protocol server for task management with persistent memory capabilities.

## Features

- **Memory Retention**: Stores context between conversations
- **Task Management**: Create and manage tasks in Notion
- **Project Organization**: Categorize and track project progress
- **Context Awareness**: Remember user preferences and patterns

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Notion API key
   ```

3. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

4. **Test with inspector:**
   ```bash
   npm run inspector
   ```

## Configuration

### For Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "notion-task-manager": {
      "command": "node",
      "args": ["/path/to/notion-task-mcp/dist/index.js"],
      "env": {
        "NOTION_API_KEY": "your_api_key",
        "NOTION_DATABASE_ID": "your_database_id"
      }
    }
  }
}
```

### For Continue.dev

Add to your `continue.json`:

```json
{
  "mcpServers": {
    "notion-tasks": {
      "command": "node",
      "args": ["/path/to/notion-task-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

- `remember_context` - Store information for future conversations
- `recall_context` - Retrieve stored information
- `list_memories` - View all stored memories
- `forget_memory` - Delete stored information
- `create_notion_task` - Create tasks in Notion (when configured)

## Memory System

The server maintains persistent memory across conversations:

- **Task Context**: Remembers ongoing tasks and projects
- **User Preferences**: Learns your preferred task formats
- **Project Patterns**: Tracks project-specific information

## Docker Support

### Build and run with Docker:

```bash
docker build -t notion-task-mcp .
docker run -e NOTION_API_KEY=your_key notion-task-mcp
```

### Using Docker Compose:

```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
