#!/bin/bash
# Schedule Research Script - Set up automated research tasks

echo "📅 TimeTravel Research Scheduler"
echo "==============================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse arguments
ACTION="$1"
SCHEDULE_TYPE="$2"

# Show usage if no arguments
if [ -z "$ACTION" ]; then
    echo "Schedule automated research tasks for TimeTravel"
    echo ""
    echo "Usage: ./schedule-research.sh <action> [type]"
    echo ""
    echo "Actions:"
    echo "  setup    - Set up scheduled tasks"
    echo "  list     - List current schedules"
    echo "  remove   - Remove scheduled tasks"
    echo "  test     - Test schedule without installing"
    echo ""
    echo "Schedule Types:"
    echo "  weekly   - Tuesday 2-hour deep research"
    echo "  daily    - 15-minute trend monitoring"
    echo "  monthly  - 4-hour strategic synthesis"
    echo "  all      - All schedules"
    echo ""
    echo "Example: ./schedule-research.sh setup weekly"
    exit 0
fi

# Cron job definitions
WEEKLY_CRON="0 10 * * 2"  # Tuesday 10 AM
DAILY_CRON="0 9 * * *"    # Daily 9 AM
MONTHLY_CRON="0 10 1 * *" # First day of month 10 AM

# Function to add cron job
add_cron_job() {
    local schedule="$1"
    local command="$2"
    local comment="$3"
    
    # Check if job already exists
    if crontab -l 2>/dev/null | grep -q "$comment"; then
        echo "⚠️  Schedule already exists: $comment"
        return 1
    fi
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "# $comment"; echo "$schedule $command") | crontab -
    echo "✅ Added: $comment"
}

# Function to remove cron job
remove_cron_job() {
    local comment="$1"
    
    if crontab -l 2>/dev/null | grep -q "$comment"; then
        crontab -l | grep -v "$comment" | grep -v "^# $comment" | crontab -
        echo "✅ Removed: $comment"
    else
        echo "⚠️  Not found: $comment"
    fi
}

# Function to create automation script
create_automation_script() {
    local script_name="$1"
    local research_type="$2"
    local duration="$3"
    
    cat > "$PROJECT_ROOT/scripts/$script_name" << EOF
#!/bin/bash
# Auto-generated research automation script
# Type: $research_type
# Duration: $duration

# Get script directory
SCRIPT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
PROJECT_ROOT="\$(dirname "\$SCRIPT_DIR")"

# Log start
echo "🤖 Automated Research: $research_type" >> "\$PROJECT_ROOT/automation.log"
echo "Started: \$(date)" >> "\$PROJECT_ROOT/automation.log"

# Load environment
if [ -f "\$PROJECT_ROOT/.env" ]; then
    export \$(cat "\$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Execute research based on type
case "$research_type" in
    "weekly_deep")
        # Run three-tier deep research on trending topics
        TOPIC=\$(cat "\$PROJECT_ROOT/trending-topics.txt" 2>/dev/null | head -1 || echo "AI breakthroughs this week")
        "\$PROJECT_ROOT/kingly-sim.sh" research "\$TOPIC"
        ;;
        
    "daily_trends")
        # Quick trend monitoring
        "\$PROJECT_ROOT/scripts/trend-monitor.sh"
        ;;
        
    "monthly_synthesis")
        # Strategic synthesis of month's research
        "\$PROJECT_ROOT/scripts/monthly-synthesis.sh"
        ;;
esac

# Log completion
echo "Completed: \$(date)" >> "\$PROJECT_ROOT/automation.log"
echo "---" >> "\$PROJECT_ROOT/automation.log"

# Optional: Send notification
if [ ! -z "\$NOTIFICATION_EMAIL" ]; then
    echo "Research complete: $research_type" | mail -s "TimeTravel Research Update" "\$NOTIFICATION_EMAIL"
fi
EOF
    
    chmod +x "$PROJECT_ROOT/scripts/$script_name"
    echo "✅ Created automation script: $script_name"
}

# Handle actions
case "$ACTION" in
    "setup")
        echo "🔧 Setting up scheduled research..."
        echo ""
        
        case "$SCHEDULE_TYPE" in
            "weekly"|"all")
                create_automation_script "auto-weekly-research.sh" "weekly_deep" "2_hours"
                add_cron_job "$WEEKLY_CRON" "$PROJECT_ROOT/scripts/auto-weekly-research.sh" "TimeTravel Weekly Deep Research"
                ;;&
                
            "daily"|"all")
                create_automation_script "auto-daily-trends.sh" "daily_trends" "15_minutes"
                add_cron_job "$DAILY_CRON" "$PROJECT_ROOT/scripts/auto-daily-trends.sh" "TimeTravel Daily Trend Monitor"
                ;;&
                
            "monthly"|"all")
                create_automation_script "auto-monthly-synthesis.sh" "monthly_synthesis" "4_hours"
                add_cron_job "$MONTHLY_CRON" "$PROJECT_ROOT/scripts/auto-monthly-synthesis.sh" "TimeTravel Monthly Synthesis"
                ;;&
                
            "weekly"|"daily"|"monthly"|"all")
                echo ""
                echo "📅 Schedule configured!"
                ;;
                
            *)
                echo "❌ Unknown schedule type: $SCHEDULE_TYPE"
                exit 1
                ;;
        esac
        ;;
        
    "list")
        echo "📋 Current Research Schedules:"
        echo "============================="
        echo ""
        
        if crontab -l 2>/dev/null | grep -q "TimeTravel"; then
            crontab -l | grep -A1 "TimeTravel" | grep -v "^--$"
        else
            echo "No TimeTravel schedules found"
        fi
        ;;
        
    "remove")
        echo "🗑️  Removing scheduled research..."
        echo ""
        
        case "$SCHEDULE_TYPE" in
            "weekly"|"all")
                remove_cron_job "TimeTravel Weekly Deep Research"
                ;;&
                
            "daily"|"all")
                remove_cron_job "TimeTravel Daily Trend Monitor"
                ;;&
                
            "monthly"|"all")
                remove_cron_job "TimeTravel Monthly Synthesis"
                ;;&
                
            "weekly"|"daily"|"monthly"|"all")
                echo ""
                echo "✅ Schedules removed"
                ;;
                
            *)
                echo "❌ Unknown schedule type: $SCHEDULE_TYPE"
                exit 1
                ;;
        esac
        ;;
        
    "test")
        echo "🧪 Testing schedule (dry run)..."
        echo ""
        
        case "$SCHEDULE_TYPE" in
            "weekly")
                echo "Would run: Weekly deep research (Tuesdays 10 AM)"
                echo "Command: $PROJECT_ROOT/scripts/auto-weekly-research.sh"
                ;;
                
            "daily")
                echo "Would run: Daily trend monitoring (Daily 9 AM)"
                echo "Command: $PROJECT_ROOT/scripts/auto-daily-trends.sh"
                ;;
                
            "monthly")
                echo "Would run: Monthly synthesis (1st of month 10 AM)"
                echo "Command: $PROJECT_ROOT/scripts/auto-monthly-synthesis.sh"
                ;;
                
            *)
                echo "❌ Unknown schedule type: $SCHEDULE_TYPE"
                exit 1
                ;;
        esac
        
        echo ""
        echo "💡 Run with 'setup' action to install"
        ;;
        
    *)
        echo "❌ Unknown action: $ACTION"
        exit 1
        ;;
esac

echo ""
echo "💡 Tips:"
echo "- Check automation.log for execution history"
echo "- Update trending-topics.txt for weekly research topics"
echo "- Set NOTIFICATION_EMAIL in .env for email alerts"