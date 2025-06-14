# LLM-First Configuration System
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    golang-go \
    nodejs \
    npm \
    htop \
    stress-ng \
    net-tools \
    procps \
    sysstat \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set up Go environment
ENV GOPATH=/go
ENV PATH=$GOPATH/bin:$PATH
RUN mkdir -p $GOPATH/src $GOPATH/bin

# Create app directory
WORKDIR /app

# Copy source files
COPY src/ ./src/
COPY web/ ./web/

# Build Go application
WORKDIR /app/src
RUN go mod tidy && \
    GOOS=linux go build -o ../llm-system main.go llm_decision_engine.go configuration_applier.go telemetry_collector_linux.go leviathan_intelligence.go flowmind_parser.go llm_providers.go

# Set up web dashboard
WORKDIR /app/web
RUN npm install

# Create data directory for logs and metrics
RUN mkdir -p /app/data/logs /app/data/metrics

# Expose ports
EXPOSE 8080 3000

# Create startup script
WORKDIR /app
RUN echo '#!/bin/bash\n\
echo "🐋 Starting LEVIATHAN OS - AI-Native Operating System in Docker"\n\
echo "🧠 Cognitive Parliament: 8-personality decision framework"\n\
echo "⚡ FlowMind Integration: Pattern-based reasoning"\n\
\n\
# Start the Go backend\n\
echo "🚀 Starting Leviathan Intelligence Engine..."\n\
./llm-system > data/logs/system.log 2>&1 &\n\
\n\
# Start the web dashboard\n\
echo "🌐 Starting AI consciousness dashboard..."\n\
cd web && node server.js &\n\
\n\
# Wait a moment for services to start\n\
sleep 3\n\
\n\
echo "✅ Leviathan OS online. Dashboard at http://localhost:4322"\n\
echo "🎯 AI-native system consciousness active"\n\
echo "📊 Autonomous optimization and cognitive parliament ready"\n\
\n\
# Keep container running\n\
tail -f /dev/null\n\
' > start.sh && chmod +x start.sh

CMD ["./start.sh"]