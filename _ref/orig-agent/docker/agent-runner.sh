#!/bin/bash
# Claude Agent Mode Runner

# Read context
CONTEXT_FILE="/workspace/context/context.json"
if [ ! -f "$CONTEXT_FILE" ]; then
    echo "Error: Context file not found at $CONTEXT_FILE"
    exit 1
fi

# Extract key values
SPAWN_ID=$(jq -r '.spawnId' $CONTEXT_FILE)
TASK_ID=$(jq -r '.taskData.taskId // empty' $CONTEXT_FILE)
AGENT_ID=$(jq -r '.taskData.agent // "dev"' $CONTEXT_FILE)
TASK_TYPE=$(jq -r '.taskType' $CONTEXT_FILE)
INSTRUCTIONS=$(jq -r '.instructions' $CONTEXT_FILE)

echo "Starting agent $AGENT_ID for spawn $SPAWN_ID (task: $TASK_ID)"

# Load agent card if available
AGENT_PROMPT=""
if [ -f "/workspace/agents/${AGENT_ID}.yaml" ]; then
    AGENT_PROMPT=$(yq eval '.system_prompt' /workspace/agents/${AGENT_ID}.yaml)
fi

# Create comprehensive prompt
cat > /tmp/agent_prompt.txt <<EOF
$AGENT_PROMPT

$INSTRUCTIONS

CONTEXT DETAILS:
- Spawn ID: $SPAWN_ID
- Task ID: $TASK_ID
- Task Type: $TASK_TYPE

IMPORTANT REQUIREMENTS:
1. Write all output files to /workspace/results/
2. Create summary.json with:
   {
     "status": "completed|failed",
     "summary": "What was accomplished",
     "files_created": ["list", "of", "files"],
     "next_steps": ["any", "follow", "up", "tasks"]
   }
3. If updating task, create task-update.json:
   {
     "taskId": "$TASK_ID",
     "status": "completed|failed|ready",
     "confidence": 0.95,
     "notes": "What was done"
   }
4. Work autonomously - no user interaction available
5. Exit when complete

Full context available at: $CONTEXT_FILE
EOF

# Run Claude Code with the prompt
echo "Executing Claude Code in agent mode..."
claude-code \
    --prompt-file /tmp/agent_prompt.txt \
    --working-dir /workspace \
    --auto-approve \
    --max-interactions 50 \
    --output-dir /workspace/results \
    --no-interactive

# Check execution status
EXIT_CODE=$?

# Create summary if none exists
if [ ! -f "/workspace/results/summary.json" ]; then
    cat > /workspace/results/summary.json <<EOF
{
  "status": "completed",
  "summary": "Agent execution completed with exit code $EXIT_CODE",
  "spawnId": "$SPAWN_ID",
  "taskId": "$TASK_ID",
  "exitCode": $EXIT_CODE
}
EOF
fi

echo "Agent execution complete for spawn $SPAWN_ID (exit: $EXIT_CODE)"
exit $EXIT_CODE