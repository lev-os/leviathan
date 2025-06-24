#!/usr/bin/env pythonw
"""
Simple GUI for Kingly OS using PySimpleGUI
Works better on macOS than Gooey
"""

import sys
import json
from pathlib import Path

try:
    import PySimpleGUI as sg
except ImportError:
    print("❌ PySimpleGUI not installed!")
    print("📦 Install with: pip install PySimpleGUI")
    sys.exit(1)

from kingly_bridge import KinglyBridge

# Set theme
sg.theme('DarkBlue14')

def create_window():
    """Create the GUI window"""
    layout = [
        [sg.Text('🚀 Kingly OS - AI Agent Orchestration', font=('Arial', 16), text_color='#4a9eff')],
        [sg.HorizontalSeparator()],
        
        # Task input
        [sg.Text('Task/Message:', size=(15, 1))],
        [sg.Multiline(
            key='-MESSAGE-',
            size=(60, 5),
            tooltip='What would you like the AI agents to help with?'
        )],
        
        # User settings
        [sg.Frame('User Settings', [
            [
                sg.Text('Username:', size=(12, 1)),
                sg.Input('gui-user', key='-USER-', size=(20, 1)),
                sg.Text('Style:', size=(6, 1)),
                sg.Combo(
                    ['technical', 'casual', 'creative', 'professional'],
                    default_value='technical',
                    key='-STYLE-',
                    size=(15, 1)
                )
            ],
            [
                sg.Text('Format:', size=(12, 1)),
                sg.Combo(
                    ['numbered', 'bullet', 'paragraph', 'markdown'],
                    default_value='numbered',
                    key='-FORMAT-',
                    size=(15, 1)
                ),
                sg.Text('Mode:', size=(6, 1)),
                sg.Combo(
                    ['subprocess', 'http'],
                    default_value='subprocess',
                    key='-MODE-',
                    size=(15, 1)
                )
            ]
        ])],
        
        # Options
        [sg.Frame('Options', [
            [
                sg.Checkbox('Verbose Output', key='-VERBOSE-', default=False),
                sg.Checkbox('Save Conversation', key='-SAVE-', default=False)
            ]
        ])],
        
        # Buttons
        [
            sg.Button('🚀 Send', key='-SEND-', button_color=('#FFFFFF', '#4a9eff')),
            sg.Button('🧹 Clear', key='-CLEAR-'),
            sg.Button('❌ Exit', key='-EXIT-')
        ],
        
        [sg.HorizontalSeparator()],
        
        # Output
        [sg.Text('Output:', font=('Arial', 12))],
        [sg.Multiline(
            key='-OUTPUT-',
            size=(60, 15),
            autoscroll=True,
            disabled=True,
            text_color='#00ff00',
            background_color='#1a1a1a'
        )],
        
        # Status bar
        [sg.Text('Ready', key='-STATUS-', size=(50, 1), relief=sg.RELIEF_SUNKEN)]
    ]
    
    return sg.Window(
        'Kingly OS GUI',
        layout,
        finalize=True,
        resizable=True,
        return_keyboard_events=True
    )

def process_request(bridge, values):
    """Process a request through Kingly OS"""
    try:
        result = bridge.process_request(
            user=values['-USER-'],
            message=values['-MESSAGE-'],
            style=values['-STYLE-'],
            response_format=values['-FORMAT-']
        )
        
        # Format output
        output = []
        output.append(f"🎯 Mode: {result.get('mode', 'unknown')}")
        
        if result.get('mode') == 'workflow':
            output.append(f"🔄 Workflow: {result.get('workflow', 'unknown')}")
            output.append(f"🤖 Agents: {' → '.join(result.get('agents', []))}")
        elif result.get('mode') == 'learning':
            output.append(f"🧪 Experiments: {len(result.get('experiments', []))}")
        else:
            if result.get('agent'):
                output.append(f"🤖 Agent: {result.get('agent', {}).get('type', 'unknown')}")
            if result.get('confidence'):
                output.append(f"📊 Confidence: {result.get('confidence', 0) * 100:.1f}%")
        
        if values['-VERBOSE-'] and result.get('context'):
            output.append("\n📄 Context Preview:")
            output.append("-" * 40)
            output.append(result.get('context', '')[:300] + "...")
        
        output.append("\n✅ Task completed!")
        
        return '\n'.join(output), result
        
    except Exception as e:
        return f"❌ Error: {str(e)}", None

def main():
    """Main application loop"""
    window = create_window()
    bridge = KinglyBridge(mode="subprocess")
    
    # Check health
    window['-STATUS-'].update('🔍 Checking Kingly OS connection...')
    if bridge.health_check():
        window['-STATUS-'].update('✅ Connected to Kingly OS')
    else:
        window['-STATUS-'].update('❌ Cannot connect to Kingly OS')
    
    conversation_history = []
    
    while True:
        event, values = window.read()
        
        # Handle exit
        if event in (sg.WIN_CLOSED, '-EXIT-'):
            break
        
        # Handle clear
        if event == '-CLEAR-':
            window['-MESSAGE-'].update('')
            window['-OUTPUT-'].update('')
            window['-STATUS-'].update('Ready')
            continue
        
        # Handle send
        if event == '-SEND-' or (event == 'Return:13' and not values['-MESSAGE-'].endswith('\n')):
            if not values['-MESSAGE-'].strip():
                sg.popup_quick_message('Please enter a message!', text_color='red')
                continue
            
            # Update status
            window['-STATUS-'].update('🤖 Processing...')
            window.refresh()
            
            # Process request
            output, result = process_request(bridge, values)
            
            # Update output
            current_output = window['-OUTPUT-'].get()
            if current_output:
                current_output += '\n' + '=' * 60 + '\n'
            current_output += f"👤 {values['-USER-']}: {values['-MESSAGE-']}\n\n"
            current_output += output
            window['-OUTPUT-'].update(current_output)
            
            # Save to history
            conversation_history.append({
                'user': values['-USER-'],
                'message': values['-MESSAGE-'],
                'result': result,
                'output': output
            })
            
            # Clear input
            window['-MESSAGE-'].update('')
            window['-STATUS-'].update('✅ Ready')
            
            # Save conversation if requested
            if values['-SAVE-'] and result:
                filename = sg.popup_get_file(
                    'Save conversation',
                    save_as=True,
                    file_types=(('JSON Files', '*.json'), ('All Files', '*.*')),
                    default_extension='.json'
                )
                if filename:
                    with open(filename, 'w') as f:
                        json.dump(conversation_history, f, indent=2)
                    window['-STATUS-'].update(f'💾 Saved to {Path(filename).name}')
    
    window.close()

if __name__ == '__main__':
    main()