#!/usr/bin/env python3
"""Fix Open WebUI authentication by starting fresh"""

import subprocess
import time
import sys

def run_command(cmd, ignore_errors=False):
    """Run a shell command"""
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0 and not ignore_errors:
            print(f"Error: {result.stderr}")
            return False
        else:
            print(f"Success: {result.stdout}")
            return True
    except Exception as e:
        print(f"Exception: {e}")
        return False

def main():
    print("🔧 Fixing Open WebUI authentication...")
    
    # Stop and remove existing container
    print("\n1. Stopping existing container...")
    run_command("docker stop open-webui", ignore_errors=True)
    
    print("\n2. Removing existing container...")
    run_command("docker rm open-webui", ignore_errors=True)
    
    # Remove volume with existing users
    print("\n3. Removing volume with existing user data...")
    run_command("docker volume rm open-webui", ignore_errors=True)
    
    # Start fresh container without authentication
    print("\n4. Starting fresh Open WebUI without authentication...")
    success = run_command(
        "docker run -d --name open-webui -p 3002:8080 -e WEBUI_AUTH=False --restart always ghcr.io/open-webui/open-webui:main"
    )
    
    if not success:
        print("❌ Failed to start Open WebUI")
        sys.exit(1)
    
    print("\n5. Waiting for startup (15 seconds)...")
    time.sleep(15)
    
    # Test if it's running
    print("\n6. Testing if Open WebUI is accessible...")
    if run_command("curl -s http://localhost:3002 > /dev/null", ignore_errors=True):
        print("\n✅ Open WebUI running at http://localhost:3002 (no login required)")
    else:
        print("\n⚠️  Open WebUI might still be starting up. Try accessing http://localhost:3002 in a browser.")
    
    print("\n🔧 Next: Configure model provider in Open WebUI:")
    print("   Settings → Connections → Add OpenAI API")
    print("   URL: http://host.docker.internal:7894/v1")
    print("   API Key: any-key-works")
    print("   Model: leviathan-agent")

if __name__ == "__main__":
    main()