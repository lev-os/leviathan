#!/usr/bin/env python3
"""
Kingly OS Modern TUI using Textual
Can be deployed as a web app with textual-web
"""

from datetime import datetime
from typing import List, Dict, Any
import json
import asyncio

from textual import events
from textual.app import App, ComposeResult
from textual.widgets import (
    Header, Footer, Input, Button, Static, 
    ListView, ListItem, Label, Select,
    TabbedContent, TabPane, DataTable,
    ProgressBar, Markdown, Rule, Switch
)
from textual.containers import (
    Container, Horizontal, Vertical, 
    ScrollableContainer, Grid
)
from textual.reactive import var
from textual.message import Message
from textual import work

from rich.text import Text
from rich.panel import Panel
from rich.table import Table
from rich import box

from kingly_bridge import KinglyBridge


class ConversationMessage(ListItem):
    """A single message in the conversation"""
    
    def __init__(self, role: str, content: str, metadata: Dict[str, Any] = None):
        super().__init__()
        self.role = role
        self.content = content
        self.metadata = metadata or {}
        
    def compose(self) -> ComposeResult:
        """Compose the message display"""
        if self.role == "user":
            icon = "👤"
            style = "bold cyan"
        elif self.role == "agent":
            agent_type = self.metadata.get("agent", "unknown")
            agent_icons = {
                "researcher": "🔍",
                "writer": "✍️",
                "dev": "💻",
                "qa": "🧪",
                "ceo": "👔",
                "unknown": "🤖"
            }
            icon = agent_icons.get(agent_type, "🤖")
            style = "bold green"
        elif self.role == "system":
            icon = "⚙️"
            style = "dim yellow"
        else:
            icon = "💬"
            style = ""
        
        # Format metadata
        meta_parts = []
        if self.metadata.get("mode"):
            meta_parts.append(f"Mode: {self.metadata['mode']}")
        if self.metadata.get("confidence"):
            conf_pct = self.metadata["confidence"] * 100
            meta_parts.append(f"Confidence: {conf_pct:.1f}%")
        if self.metadata.get("workflow"):
            meta_parts.append(f"Workflow: {self.metadata['workflow']}")
        
        meta_str = " | ".join(meta_parts) if meta_parts else ""
        
        with Container(classes="message-container"):
            yield Label(f"{icon} {self.role.title()}", classes=f"message-role {style}")
            if meta_str:
                yield Label(f"[{meta_str}]", classes="message-metadata dim")
            yield Static(self.content, classes="message-content")


class KinglyTextualApp(App):
    """Modern TUI for Kingly OS"""
    
    CSS = """
    .message-container {
        padding: 1 2;
        margin: 1 0;
        border: round $primary;
    }
    
    .message-role {
        text-style: bold;
        margin-bottom: 1;
    }
    
    .message-metadata {
        color: $text-muted;
        margin-bottom: 1;
    }
    
    .message-content {
        padding-left: 2;
    }
    
    #conversation-view {
        height: 100%;
        border: solid $primary;
        padding: 1;
    }
    
    #input-container {
        height: 5;
        padding: 1;
    }
    
    #status-bar {
        height: 3;
        padding: 1;
        border: round $accent;
    }
    
    .agent-indicator {
        width: 15;
        height: 3;
        border: round $secondary;
        content-align: center middle;
        margin: 0 1;
    }
    
    .agent-active {
        background: $success;
        color: $text;
    }
    
    .confidence-bar {
        width: 30;
        margin: 1;
    }
    
    DataTable {
        height: 10;
    }
    """
    
    TITLE = "Kingly OS - AI Agent Orchestration"
    SUB_TITLE = "Intelligent task routing with confidence-based agent selection"
    
    # Reactive variables
    current_mode = var("ready")
    current_agent = var(None)
    current_confidence = var(0.0)
    conversation_history = var([])
    
    def __init__(self):
        super().__init__()
        self.bridge = KinglyBridge(mode="subprocess")
        self.user = "textual-user"
        self.style = "technical"
        self.response_format = "markdown"
        
    def compose(self) -> ComposeResult:
        """Create the UI layout"""
        yield Header()
        
        with TabbedContent(initial="chat"):
            # Chat tab
            with TabPane("💬 Chat", id="chat"):
                with Vertical():
                    # Agent status indicators
                    with Horizontal(id="agent-status"):
                        yield Label("Active Agent:", classes="label")
                        for agent in ["researcher", "writer", "dev", "qa", "ceo"]:
                            yield Static(
                                agent.title(), 
                                classes="agent-indicator",
                                id=f"agent-{agent}"
                            )
                    
                    # Confidence meter
                    with Horizontal():
                        yield Label("Confidence:", classes="label")
                        yield ProgressBar(
                            total=100, 
                            show_eta=False,
                            id="confidence-bar",
                            classes="confidence-bar"
                        )
                        yield Label("0%", id="confidence-label")
                    
                    yield Rule()
                    
                    # Conversation view
                    yield ListView(id="conversation-view")
                    
                    # Input area
                    with Horizontal(id="input-container"):
                        yield Input(
                            placeholder="Ask Kingly OS anything...",
                            id="message-input"
                        )
                        yield Button("Send", variant="primary", id="send-button")
            
            # Settings tab
            with TabPane("⚙️ Settings", id="settings"):
                with Vertical(classes="settings-container"):
                    yield Label("User Settings", classes="section-title")
                    
                    with Grid():
                        yield Label("Username:")
                        yield Input(value=self.user, id="username-input")
                        
                        yield Label("Response Style:")
                        yield Select(
                            [
                                ("Technical", "technical"),
                                ("Casual", "casual"),
                                ("Creative", "creative"),
                                ("Professional", "professional")
                            ],
                            value="technical",
                            id="style-select"
                        )
                        
                        yield Label("Response Format:")
                        yield Select(
                            [
                                ("Markdown", "markdown"),
                                ("Numbered", "numbered"),
                                ("Bullet Points", "bullet"),
                                ("Paragraph", "paragraph")
                            ],
                            value="markdown",
                            id="format-select"
                        )
                        
                        yield Label("Connection Mode:")
                        yield Select(
                            [
                                ("Direct (Subprocess)", "subprocess"),
                                ("API (HTTP)", "http")
                            ],
                            value="subprocess",
                            id="mode-select"
                        )
                    
                    yield Button("Save Settings", variant="success", id="save-settings")
            
            # Metrics tab
            with TabPane("📊 Metrics", id="metrics"):
                with Vertical():
                    yield Label("System Metrics", classes="section-title")
                    yield DataTable(id="metrics-table")
                    
                    yield Label("Recent Interactions", classes="section-title")
                    yield DataTable(id="interactions-table")
                    
                    yield Button("Refresh Metrics", id="refresh-metrics")
            
            # About tab
            with TabPane("ℹ️ About", id="about"):
                yield Markdown("""
# Kingly OS

**Version:** 0.1.0  
**Type:** AI Agent Orchestration System

## Features

- 🤖 **Intelligent Agent Routing** - Automatically selects the best agent for your task
- 📊 **Confidence-Based Decisions** - Uses confidence thresholds for optimal routing
- 🔄 **Workflow Support** - Pre-defined multi-agent sequences for common tasks
- 🧪 **Learning Mode** - Experiments with multiple approaches for complex tasks
- 👤 **User Preferences** - Personalized responses based on your settings

## Available Agents

- **Researcher** 🔍 - Information gathering and analysis
- **Writer** ✍️ - Creative content and documentation
- **Developer** 💻 - Code implementation and debugging
- **QA** 🧪 - Testing and quality assurance
- **CEO** 👔 - High-level strategy and coordination

## Keyboard Shortcuts

- `Ctrl+L` - Clear conversation
- `Ctrl+S` - Save conversation
- `Ctrl+Tab` - Switch tabs
- `Ctrl+Q` - Quit application

## Web Deployment

This app can be deployed to the web using:

```bash
textual-web --app kingly-textual:app --port 8080
```

Then access at http://localhost:8080
                """)
        
        yield Footer()
    
    def on_mount(self) -> None:
        """Initialize the app when mounted"""
        self.add_system_message("Welcome to Kingly OS! Type a message to get started.")
        self.setup_metrics_table()
        
        # Focus on input
        self.query_one("#message-input").focus()
    
    def setup_metrics_table(self) -> None:
        """Setup the metrics data table"""
        metrics_table = self.query_one("#metrics-table", DataTable)
        metrics_table.add_columns("Metric", "Value")
        metrics_table.add_rows([
            ["Status", "Ready"],
            ["Total Interactions", "0"],
            ["Active Workflows", "0"],
            ["Learned Patterns", "0"],
            ["Success Rate", "0%"]
        ])
        
        interactions_table = self.query_one("#interactions-table", DataTable)
        interactions_table.add_columns("Time", "User", "Task", "Agent", "Mode")
    
    def add_system_message(self, content: str) -> None:
        """Add a system message to the conversation"""
        message = ConversationMessage("system", content)
        self.query_one("#conversation-view").append(message)
    
    def add_user_message(self, content: str) -> None:
        """Add a user message to the conversation"""
        message = ConversationMessage("user", content)
        self.query_one("#conversation-view").append(message)
    
    def add_agent_message(self, content: str, metadata: Dict[str, Any]) -> None:
        """Add an agent message to the conversation"""
        message = ConversationMessage("agent", content, metadata)
        self.query_one("#conversation-view").append(message)
    
    async def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses"""
        if event.button.id == "send-button":
            await self.send_message()
        elif event.button.id == "save-settings":
            await self.save_settings()
        elif event.button.id == "refresh-metrics":
            await self.refresh_metrics()
    
    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """Handle input submission"""
        if event.input.id == "message-input":
            await self.send_message()
    
    @work(exclusive=True)
    async def send_message(self) -> None:
        """Send message to Kingly OS"""
        input_widget = self.query_one("#message-input", Input)
        message = input_widget.value.strip()
        
        if not message:
            return
        
        # Clear input
        input_widget.value = ""
        
        # Add user message
        self.add_user_message(message)
        
        # Update status
        self.add_system_message("🤖 Processing...")
        
        # Process request
        try:
            result = await asyncio.to_thread(
                self.bridge.process_request,
                user=self.user,
                message=message,
                style=self.style,
                response_format=self.response_format
            )
            
            # Update UI based on result
            await self.handle_response(result)
            
        except Exception as e:
            self.add_system_message(f"❌ Error: {str(e)}")
    
    async def handle_response(self, result: Dict[str, Any]) -> None:
        """Handle response from Kingly OS"""
        # Clear processing message
        conv_view = self.query_one("#conversation-view", ListView)
        if conv_view.children and isinstance(conv_view.children[-1], ConversationMessage):
            if conv_view.children[-1].role == "system":
                await conv_view.children[-1].remove()
        
        # Handle error
        if result.get("mode") == "error":
            self.add_system_message(f"❌ {result.get('error', 'Unknown error')}")
            return
        
        # Update agent indicators
        agent_type = None
        if result.get("agent"):
            agent_type = result["agent"].get("type")
        elif result.get("currentAgent"):
            agent_type = result["currentAgent"]
        
        if agent_type:
            await self.highlight_agent(agent_type)
        
        # Update confidence
        if result.get("confidence"):
            await self.update_confidence(result["confidence"])
        
        # Create response content
        response_parts = []
        
        if result.get("mode") == "workflow":
            response_parts.append(f"**Workflow Mode**: {result.get('workflow', 'unknown')}")
            response_parts.append(f"**Agents**: {' → '.join(result.get('agents', []))}")
        
        elif result.get("mode") == "learning":
            response_parts.append(f"**Learning Mode**: {len(result.get('experiments', []))} experiments")
            for exp in result.get("experiments", []):
                response_parts.append(f"- {exp.get('approach', 'Unknown')}")
        
        if result.get("context"):
            # In real implementation, this would show actual LLM response
            response_parts.append("\n**Response**:")
            response_parts.append("*[Simulated response - connect to real LLM for actual output]*")
        
        # Add agent response
        metadata = {
            "mode": result.get("mode"),
            "agent": agent_type,
            "confidence": result.get("confidence"),
            "workflow": result.get("workflow")
        }
        
        self.add_agent_message("\n".join(response_parts), metadata)
        
        # Update metrics
        await self.update_metrics(result)
    
    async def highlight_agent(self, agent_type: str) -> None:
        """Highlight the active agent"""
        # Clear all highlights
        for agent in ["researcher", "writer", "dev", "qa", "ceo"]:
            indicator = self.query_one(f"#agent-{agent}")
            indicator.remove_class("agent-active")
        
        # Highlight active agent
        if agent_type:
            indicator = self.query_one(f"#agent-{agent_type}")
            indicator.add_class("agent-active")
    
    async def update_confidence(self, confidence: float) -> None:
        """Update confidence display"""
        progress_bar = self.query_one("#confidence-bar", ProgressBar)
        confidence_label = self.query_one("#confidence-label", Label)
        
        confidence_pct = int(confidence * 100)
        progress_bar.update(progress=confidence_pct)
        confidence_label.update(f"{confidence_pct}%")
    
    async def update_metrics(self, result: Dict[str, Any]) -> None:
        """Update metrics tables"""
        # Add to interactions table
        interactions_table = self.query_one("#interactions-table", DataTable)
        interactions_table.add_row(
            datetime.now().strftime("%H:%M:%S"),
            self.user,
            "Task",  # Would extract from message
            result.get("agent", {}).get("type", "N/A") if result.get("agent") else "N/A",
            result.get("mode", "N/A")
        )
    
    async def save_settings(self) -> None:
        """Save user settings"""
        self.user = self.query_one("#username-input", Input).value
        self.style = self.query_one("#style-select", Select).value
        self.response_format = self.query_one("#format-select", Select).value
        
        mode = self.query_one("#mode-select", Select).value
        self.bridge.mode = mode
        
        self.add_system_message("✅ Settings saved!")
    
    async def refresh_metrics(self) -> None:
        """Refresh system metrics"""
        self.add_system_message("📊 Refreshing metrics...")
        # In real implementation, would fetch actual metrics


def main():
    """Run the Textual app"""
    app = KinglyTextualApp()
    app.run()


if __name__ == "__main__":
    main()