#!/usr/bin/env python3
"""
Kingly OS Desktop GUI using Gooey
One-line conversion from CLI to GUI!
"""

import sys
import json
from pathlib import Path

# Try to import Gooey, provide helpful message if not installed
try:
    from gooey import Gooey, GooeyParser
except ImportError:
    print("❌ Gooey not installed!")
    print("📦 Install with: pip install gooey wxPython")
    print("🐍 Or in conda: conda activate ai-ml-shared && pip install gooey wxPython")
    sys.exit(1)

from kingly_bridge import KinglyBridge

# One decorator transforms this into a GUI!
@Gooey(
    program_name="Kingly OS",
    program_description="AI Agent Orchestration System",
    default_size=(800, 600),
    terminal_font_family="monospace",
    progress_regex=r"^Progress: (\d+)%$",
    progress_expr="x[0] if x else None",
    hide_progress_msg=False,
    timing_options={
        'show_time_remaining': True,
        'hide_time_remaining_on_complete': True
    },
    advanced=True,
    show_success_modal=False,
    show_failure_modal=True,
    menu=[{
        'name': 'File',
        'items': [{
            'type': 'AboutDialog',
            'menuTitle': 'About',
            'name': 'Kingly OS GUI',
            'description': 'AI-powered task orchestration with intelligent agent routing',
            'version': '0.1.0',
            'copyright': '2024',
            'website': 'https://github.com/yourusername/kingly-os',
            'license': 'MIT'
        }]
    }]
)
def main():
    """Main GUI application"""
    parser = GooeyParser(description='Interact with Kingly OS AI Agents')
    
    # Required arguments group
    required_group = parser.add_argument_group('Required Options')
    required_group.add_argument(
        'message',
        metavar='Task/Message',
        help='What would you like the AI agents to help with?',
        widget='Textarea',
        gooey_options={
            'height': 100,
            'placeholder': 'Examples:\n- Build an API for user authentication\n- Write a blog post about microservices\n- Debug this performance issue\n- Create documentation for my project'
        }
    )
    
    # User settings group
    user_group = parser.add_argument_group('User Settings')
    user_group.add_argument(
        '-u', '--user',
        metavar='Username',
        default='gui-user',
        help='Your username for personalized responses'
    )
    
    user_group.add_argument(
        '-s', '--style',
        metavar='Response Style',
        choices=['technical', 'casual', 'creative', 'professional'],
        default='technical',
        help='Writing style for responses',
        widget='Dropdown'
    )
    
    user_group.add_argument(
        '-f', '--format',
        metavar='Response Format',
        choices=['numbered', 'bullet', 'paragraph', 'markdown'],
        default='numbered',
        help='How to format the response',
        widget='Dropdown'
    )
    
    # Advanced options group
    advanced_group = parser.add_argument_group('Advanced Options')
    advanced_group.add_argument(
        '--mode',
        metavar='Connection Mode',
        choices=['subprocess', 'http'],
        default='subprocess',
        help='How to connect to Kingly OS',
        widget='RadioGroup',
        gooey_options={
            'initial_selection': 0
        }
    )
    
    advanced_group.add_argument(
        '--workflow',
        metavar='Force Workflow',
        choices=['auto', 'api-development', 'bug-fix', 'feature-dev', 'documentation'],
        default='auto',
        help='Override automatic workflow detection',
        widget='Dropdown'
    )
    
    advanced_group.add_argument(
        '--confidence-threshold',
        metavar='Confidence Threshold',
        type=float,
        default=0.7,
        help='Minimum confidence for single agent mode (0.0-1.0)',
        widget='DecimalField',
        gooey_options={
            'min': 0.0,
            'max': 1.0,
            'increment': 0.1
        }
    )
    
    # Output options
    output_group = parser.add_argument_group('Output Options')
    output_group.add_argument(
        '--verbose',
        metavar='Verbose Output',
        action='store_true',
        help='Show detailed agent reasoning and confidence scores',
        widget='CheckBox'
    )
    
    output_group.add_argument(
        '--save-conversation',
        metavar='Save Conversation',
        help='Save the conversation to a file',
        widget='FileSaver',
        gooey_options={
            'wildcard': 'JSON files (*.json)|*.json|All files (*.*)|*.*',
            'default_file': 'kingly-conversation.json'
        }
    )
    
    args = parser.parse_args()
    
    # Process the request
    print("🚀 Initializing Kingly OS...\n")
    
    bridge = KinglyBridge(mode=args.mode)
    
    # Check health
    if not bridge.health_check():
        print("❌ Error: Cannot connect to Kingly OS!")
        if args.mode == "http":
            print("💡 Make sure MCP server is running: npm run mcp")
        else:
            print("💡 Make sure Node.js is installed and working")
        return
    
    print("✅ Connected to Kingly OS\n")
    print(f"👤 User: {args.user}")
    print(f"✍️  Style: {args.style}")
    print(f"📋 Format: {args.format}")
    print(f"🔄 Workflow: {args.workflow}")
    print(f"📊 Confidence Threshold: {args.confidence_threshold}\n")
    
    print("🤖 Processing your request...\n")
    print("=" * 60)
    print(f"📝 Task: {args.message}")
    print("=" * 60 + "\n")
    
    # Send request
    result = bridge.process_request(
        user=args.user,
        message=args.message,
        style=args.style,
        response_format=args.format
    )
    
    # Display results
    if result.get('mode') == 'error':
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
        return
    
    print(f"🎯 Mode: {result.get('mode', 'unknown')}")
    
    if result.get('mode') == 'workflow':
        print(f"🔄 Workflow: {result.get('workflow', 'unknown')}")
        print(f"🤖 Agents: {' → '.join(result.get('agents', []))}")
        if result.get('currentAgent'):
            print(f"📍 Current Agent: {result.get('currentAgent')}")
    
    elif result.get('mode') == 'learning':
        print(f"🧪 Learning Mode: {len(result.get('experiments', []))} experiments")
        for i, exp in enumerate(result.get('experiments', [])):
            print(f"   {i+1}. {exp.get('approach', 'Unknown approach')}")
    
    else:  # default mode
        if result.get('agent'):
            print(f"🤖 Agent: {result.get('agent', {}).get('type', 'unknown')}")
        if result.get('confidence'):
            confidence_pct = result.get('confidence', 0) * 100
            print(f"📊 Confidence: {confidence_pct:.1f}%")
    
    if args.verbose and result.get('context'):
        print(f"\n📄 Context Preview:")
        print("-" * 40)
        context_preview = result.get('context', '')[:200]
        print(f"{context_preview}...")
        print("-" * 40)
    
    if result.get('response'):
        print(f"\n💬 Response:")
        print("=" * 60)
        print(result.get('response'))
        print("=" * 60)
    
    # Save conversation if requested
    if args.save_conversation:
        conversation = {
            'user': args.user,
            'message': args.message,
            'settings': {
                'style': args.style,
                'format': args.format,
                'workflow': args.workflow,
                'confidence_threshold': args.confidence_threshold
            },
            'result': result
        }
        
        with open(args.save_conversation, 'w') as f:
            json.dump(conversation, f, indent=2)
        
        print(f"\n💾 Conversation saved to: {args.save_conversation}")
    
    print("\n✅ Task completed!")

if __name__ == '__main__':
    main()