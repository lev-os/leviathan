#!/usr/bin/env python3
"""
Kingly OS GUI using tkinter (built into Python)
No external dependencies needed!
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import json
from pathlib import Path
import sys

from kingly_bridge import KinglyBridge


class KinglyGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🚀 Kingly OS - AI Agent Orchestration")
        self.root.geometry("800x700")
        
        # Configure style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Initialize bridge
        self.bridge = KinglyBridge(mode="subprocess")
        self.conversation_history = []
        
        self.setup_ui()
        self.check_connection()
        
    def setup_ui(self):
        """Set up the user interface"""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        
        # Title
        title_label = ttk.Label(
            main_frame, 
            text="🚀 Kingly OS - AI Agent Orchestration",
            font=('Arial', 16, 'bold')
        )
        title_label.grid(row=0, column=0, pady=(0, 10))
        
        # Task input frame
        input_frame = ttk.LabelFrame(main_frame, text="Task/Message", padding="10")
        input_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=5)
        input_frame.columnconfigure(0, weight=1)
        
        self.message_text = tk.Text(input_frame, height=5, wrap=tk.WORD)
        self.message_text.grid(row=0, column=0, sticky=(tk.W, tk.E))
        self.message_text.bind('<Return>', lambda e: self.send_message() if not e.state & 0x1 else None)
        
        # User settings frame
        settings_frame = ttk.LabelFrame(main_frame, text="Settings", padding="10")
        settings_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=5)
        
        # Username
        ttk.Label(settings_frame, text="Username:").grid(row=0, column=0, sticky=tk.W, padx=(0, 5))
        self.user_var = tk.StringVar(value="gui-user")
        ttk.Entry(settings_frame, textvariable=self.user_var, width=20).grid(row=0, column=1, padx=5)
        
        # Style
        ttk.Label(settings_frame, text="Style:").grid(row=0, column=2, sticky=tk.W, padx=(20, 5))
        self.style_var = tk.StringVar(value="technical")
        style_combo = ttk.Combobox(
            settings_frame,
            textvariable=self.style_var,
            values=["technical", "casual", "creative", "professional"],
            state="readonly",
            width=15
        )
        style_combo.grid(row=0, column=3, padx=5)
        
        # Format
        ttk.Label(settings_frame, text="Format:").grid(row=1, column=0, sticky=tk.W, padx=(0, 5))
        self.format_var = tk.StringVar(value="numbered")
        format_combo = ttk.Combobox(
            settings_frame,
            textvariable=self.format_var,
            values=["numbered", "bullet", "paragraph", "markdown"],
            state="readonly",
            width=15
        )
        format_combo.grid(row=1, column=1, padx=5)
        
        # Mode
        ttk.Label(settings_frame, text="Mode:").grid(row=1, column=2, sticky=tk.W, padx=(20, 5))
        self.mode_var = tk.StringVar(value="subprocess")
        mode_combo = ttk.Combobox(
            settings_frame,
            textvariable=self.mode_var,
            values=["subprocess", "http"],
            state="readonly",
            width=15
        )
        mode_combo.grid(row=1, column=3, padx=5)
        
        # Options frame
        options_frame = ttk.Frame(main_frame)
        options_frame.grid(row=3, column=0, pady=5)
        
        self.verbose_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            options_frame,
            text="Verbose Output",
            variable=self.verbose_var
        ).grid(row=0, column=0, padx=5)
        
        self.save_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            options_frame,
            text="Save Conversation",
            variable=self.save_var
        ).grid(row=0, column=1, padx=5)
        
        # Buttons frame
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=4, column=0, pady=10)
        
        ttk.Button(
            button_frame,
            text="🚀 Send",
            command=self.send_message
        ).grid(row=0, column=0, padx=5)
        
        ttk.Button(
            button_frame,
            text="🧹 Clear",
            command=self.clear_all
        ).grid(row=0, column=1, padx=5)
        
        ttk.Button(
            button_frame,
            text="💾 Save",
            command=self.save_conversation
        ).grid(row=0, column=2, padx=5)
        
        ttk.Button(
            button_frame,
            text="❌ Exit",
            command=self.root.quit
        ).grid(row=0, column=3, padx=5)
        
        # Output frame
        output_frame = ttk.LabelFrame(main_frame, text="Output", padding="10")
        output_frame.grid(row=5, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        output_frame.columnconfigure(0, weight=1)
        output_frame.rowconfigure(0, weight=1)
        main_frame.rowconfigure(5, weight=1)
        
        self.output_text = scrolledtext.ScrolledText(
            output_frame,
            wrap=tk.WORD,
            width=80,
            height=20,
            bg='#1a1a1a',
            fg='#00ff00',
            font=('Courier', 10)
        )
        self.output_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.output_text.config(state=tk.DISABLED)
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(
            self.root,
            textvariable=self.status_var,
            relief=tk.SUNKEN
        )
        status_bar.grid(row=1, column=0, sticky=(tk.W, tk.E), padx=5, pady=2)
        
        # Focus on message input
        self.message_text.focus()
    
    def check_connection(self):
        """Check connection to Kingly OS"""
        self.status_var.set("🔍 Checking Kingly OS connection...")
        self.root.update()
        
        if self.bridge.health_check():
            self.status_var.set("✅ Connected to Kingly OS")
        else:
            self.status_var.set("❌ Cannot connect to Kingly OS")
            messagebox.showwarning(
                "Connection Error",
                "Cannot connect to Kingly OS.\n\n"
                "Make sure Node.js is installed and working."
            )
    
    def send_message(self):
        """Send message to Kingly OS"""
        message = self.message_text.get("1.0", tk.END).strip()
        if not message:
            messagebox.showwarning("Empty Message", "Please enter a message!")
            return
        
        # Update status
        self.status_var.set("🤖 Processing...")
        self.root.update()
        
        # Change bridge mode if needed
        if self.bridge.mode != self.mode_var.get():
            self.bridge.mode = self.mode_var.get()
        
        try:
            # Process request
            result = self.bridge.process_request(
                user=self.user_var.get(),
                message=message,
                style=self.style_var.get(),
                response_format=self.format_var.get()
            )
            
            # Format and display output
            self.display_result(message, result)
            
            # Save to history
            self.conversation_history.append({
                'user': self.user_var.get(),
                'message': message,
                'settings': {
                    'style': self.style_var.get(),
                    'format': self.format_var.get(),
                    'mode': self.mode_var.get()
                },
                'result': result
            })
            
            # Clear input
            self.message_text.delete("1.0", tk.END)
            self.status_var.set("✅ Ready")
            
            # Auto-save if enabled
            if self.save_var.get():
                self.auto_save()
                
        except Exception as e:
            self.status_var.set("❌ Error")
            messagebox.showerror("Error", f"Error processing request:\n\n{str(e)}")
    
    def display_result(self, message, result):
        """Display result in output area"""
        self.output_text.config(state=tk.NORMAL)
        
        # Add separator if not empty
        if self.output_text.get("1.0", tk.END).strip():
            self.output_text.insert(tk.END, "\n" + "="*60 + "\n\n")
        
        # Add user message
        self.output_text.insert(tk.END, f"👤 {self.user_var.get()}: {message}\n\n")
        
        # Add result info
        self.output_text.insert(tk.END, f"🎯 Mode: {result.get('mode', 'unknown')}\n")
        
        if result.get('mode') == 'error':
            self.output_text.insert(tk.END, f"❌ Error: {result.get('error', 'Unknown error')}\n")
        elif result.get('mode') == 'workflow':
            self.output_text.insert(tk.END, f"🔄 Workflow: {result.get('workflow', 'unknown')}\n")
            self.output_text.insert(tk.END, f"🤖 Agents: {' → '.join(result.get('agents', []))}\n")
            if result.get('currentAgent'):
                self.output_text.insert(tk.END, f"📍 Current Agent: {result.get('currentAgent')}\n")
        elif result.get('mode') == 'learning':
            self.output_text.insert(tk.END, f"🧪 Experiments: {len(result.get('experiments', []))}\n")
            for i, exp in enumerate(result.get('experiments', [])):
                self.output_text.insert(tk.END, f"   {i+1}. {exp.get('approach', 'Unknown')}\n")
        else:
            if result.get('agent'):
                self.output_text.insert(tk.END, f"🤖 Agent: {result.get('agent', {}).get('type', 'unknown')}\n")
            if result.get('confidence'):
                confidence_pct = result.get('confidence', 0) * 100
                self.output_text.insert(tk.END, f"📊 Confidence: {confidence_pct:.1f}%\n")
        
        if self.verbose_var.get() and result.get('context'):
            self.output_text.insert(tk.END, "\n📄 Context Preview:\n")
            self.output_text.insert(tk.END, "-" * 40 + "\n")
            context_preview = result.get('context', '')[:300]
            self.output_text.insert(tk.END, f"{context_preview}...\n")
            self.output_text.insert(tk.END, "-" * 40 + "\n")
        
        self.output_text.insert(tk.END, "\n✅ Task completed!\n")
        
        # Scroll to bottom
        self.output_text.see(tk.END)
        self.output_text.config(state=tk.DISABLED)
    
    def clear_all(self):
        """Clear all text areas"""
        self.message_text.delete("1.0", tk.END)
        self.output_text.config(state=tk.NORMAL)
        self.output_text.delete("1.0", tk.END)
        self.output_text.config(state=tk.DISABLED)
        self.status_var.set("Ready")
    
    def save_conversation(self):
        """Save conversation to file"""
        if not self.conversation_history:
            messagebox.showinfo("No Data", "No conversation to save!")
            return
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialfile="kingly-conversation.json"
        )
        
        if filename:
            try:
                with open(filename, 'w') as f:
                    json.dump(self.conversation_history, f, indent=2)
                self.status_var.set(f"💾 Saved to {Path(filename).name}")
                messagebox.showinfo("Success", f"Conversation saved to:\n{filename}")
            except Exception as e:
                messagebox.showerror("Save Error", f"Error saving file:\n{str(e)}")
    
    def auto_save(self):
        """Auto-save conversation"""
        filename = f"kingly-conversation-auto-{len(self.conversation_history)}.json"
        try:
            with open(filename, 'w') as f:
                json.dump(self.conversation_history, f, indent=2)
            self.status_var.set(f"💾 Auto-saved to {filename}")
        except:
            pass  # Silent fail for auto-save


def main():
    """Main entry point"""
    root = tk.Tk()
    app = KinglyGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()