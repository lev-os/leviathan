# Running Multiple Claude Code Instances with Docker

## Quick Setup

### Option 1: Individual Docker Commands

```bash
# Instance 1 (default port)
docker run -d \
  -p 54545:54545 \
  -v ~/claude-workspace-1:/workspace \
  --name claude-code-1 \
  claude-code-image

# Instance 2 (different port)
docker run -d \
  -p 54546:54545 \
  -v ~/claude-workspace-2:/workspace \
  --name claude-code-2 \
  claude-code-image

# Instance 3 (another port)
docker run -d \
  -p 54547:54545 \
  -v ~/claude-workspace-3:/workspace \
  --name claude-code-3 \
  claude-code-image
```

### Option 2: Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  claude-code-main:
    image: claude-code-image
    ports:
      - "54545:54545"
    volumes:
      - ./workspaces/main:/workspace
      - ~/.claude:/root/.claude
    environment:
      - CLAUDE_PORT=54545
      - PROJECT_NAME=main
    container_name: claude-code-main

  claude-code-agent-mcp:
    image: claude-code-image
    ports:
      - "54546:54545"
    volumes:
      - ./workspaces/agent-mcp:/workspace
      - ~/.claude:/root/.claude
    environment:
      - CLAUDE_PORT=54546
      - PROJECT_NAME=agent-mcp
    container_name: claude-code-agent-mcp

  claude-code-aiforge:
    image: claude-code-image
    ports:
      - "54547:54545"
    volumes:
      - ./workspaces/aiforge:/workspace
      - ~/.claude:/root/.claude
    environment:
      - CLAUDE_PORT=54547
      - PROJECT_NAME=aiforge
    container_name: claude-code-aiforge
```

## Custom Claude Code Dockerfile

If you need to build your own image with specific configurations:

```dockerfile
FROM node:18-alpine

# Install Claude Code (adjust based on actual installation method)
RUN npm install -g @anthropic-ai/claude-code

# Set working directory
WORKDIR /workspace

# Expose configurable port
ARG PORT=54545
ENV CLAUDE_PORT=${PORT}
EXPOSE ${PORT}

# Copy any custom configurations
COPY claude-config.json /root/.claude/

# Start Claude Code
CMD ["claude-code", "--port", "${CLAUDE_PORT}"]
```

Build with different ports:
```bash
# Build different images for different ports
docker build --build-arg PORT=54545 -t claude-code:main .
docker build --build-arg PORT=54546 -t claude-code:dev .
docker build --build-arg PORT=54547 -t claude-code:testing .
```

## Management Scripts

### Start All Instances
```bash
#!/bin/bash
# start-all-claude.sh

docker-compose up -d

echo "Claude Code instances started:"
echo "Main: http://localhost:54545"
echo "Agent-MCP: http://localhost:54546" 
echo "AIForge: http://localhost:54547"
```

### Stop All Instances
```bash
#!/bin/bash
# stop-all-claude.sh

docker-compose down
echo "All Claude Code instances stopped"
```

### Check Status
```bash
#!/bin/bash
# status-claude.sh

echo "Claude Code Container Status:"
docker ps --filter "name=claude-code" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Port Mapping Strategy

| Instance | Host Port | Purpose | Workspace |
|----------|-----------|---------|-----------|
| Main | 54545 | General development | ~/claude-workspace-main |
| Agent-MCP | 54546 | MCP development | ~/claude-workspace-mcp |
| AIForge | 54547 | AIForge system work | ~/claude-workspace-aiforge |
| Testing | 54548 | Testing/experiments | ~/claude-workspace-test |

## Environment Configuration

### Per-Instance Config Files

Create separate config directories:
```bash
mkdir -p ~/claude-configs/{main,agent-mcp,aiforge,testing}
```

Mount different configs:
```yaml
volumes:
  - ~/claude-configs/main:/root/.claude
```

### Environment Variables

```yaml
environment:
  - CLAUDE_PROJECT=agent-mcp
  - WORKSPACE_PATH=/workspace
  - LOG_LEVEL=info
  - MCP_SERVERS_PATH=/workspace/.claude/mcp-servers.json
```

## Usage Examples

### Start specific instance:
```bash
docker-compose up claude-code-agent-mcp -d
```

### Access logs:
```bash
docker-compose logs claude-code-main -f
```

### Execute commands in container:
```bash
docker exec -it claude-code-agent-mcp /bin/sh
```

### Connect to specific instance:
```bash
# Connect to agent-mcp instance
curl http://localhost:54546/health

# Connect to aiforge instance  
curl http://localhost:54547/health
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using ports
netstat -tlnp | grep 5454

# Kill specific port
npx kill-port 54545
```

### Container Won't Start
```bash
# Check container logs
docker logs claude-code-main

# Check port bindings
docker port claude-code-main
```

### Reset Everything
```bash
# Stop and remove all containers
docker-compose down
docker container prune -f

# Remove volumes (be careful!)
docker volume prune -f

# Restart
docker-compose up -d
```

## Security Considerations

### Localhost Only
```yaml
ports:
  - "127.0.0.1:54545:54545"  # Only accessible from localhost
```

### Read-Only Volumes
```yaml
volumes:
  - ~/code:/workspace:ro  # Read-only workspace
```

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

This setup allows you to run multiple isolated Claude Code instances without port conflicts!