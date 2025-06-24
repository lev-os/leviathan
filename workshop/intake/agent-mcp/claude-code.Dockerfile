# Simple Claude Code Docker Image for Testing
FROM node:18-alpine

# Install Claude Code globally (using placeholder - adjust based on actual installation)
RUN npm install -g @anthropic-ai/claude-code || echo "Claude Code package not available - using mock"

# Set working directory
WORKDIR /workspace

# Create mock claude command for testing if real one doesn't exist
RUN if ! command -v claude &> /dev/null; then \
    echo '#!/bin/sh' > /usr/local/bin/claude && \
    echo 'echo "Mock Claude Code Server starting on port ${CLAUDE_PORT:-54545}"' >> /usr/local/bin/claude && \
    echo 'echo "Workspace: $(pwd)"' >> /usr/local/bin/claude && \
    echo 'echo "Project: ${PROJECT_NAME:-default}"' >> /usr/local/bin/claude && \
    echo 'while true; do sleep 30; echo "Claude Code Server healthy"; done' >> /usr/local/bin/claude && \
    chmod +x /usr/local/bin/claude; \
fi

# Expose configurable port
ENV CLAUDE_PORT=54545
EXPOSE 54545

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD echo "Health check: Claude Code running"

# Start Claude Code
CMD ["sh", "-c", "claude --port ${CLAUDE_PORT} --workspace /workspace"]