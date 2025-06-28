#!/usr/bin/env node
/**
 * Auto-start setup script for Leviathan Desktop
 * Handles platform-specific auto-start configuration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const platform = os.platform();
const homeDir = os.homedir();

async function setupAutoStart() {
    console.log('🚀 Setting up Leviathan Desktop auto-start...');
    console.log(`Platform: ${platform}`);
    
    try {
        switch (platform) {
            case 'darwin':
                await setupMacOSAutoStart();
                break;
            case 'win32':
                await setupWindowsAutoStart();
                break;
            case 'linux':
                await setupLinuxAutoStart();
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
        
        console.log('✅ Auto-start configured successfully!');
        console.log('Leviathan Desktop will now start automatically on system boot.');
        
    } catch (error) {
        console.error('❌ Failed to setup auto-start:', error.message);
        process.exit(1);
    }
}

async function setupMacOSAutoStart() {
    console.log('🍎 Configuring macOS auto-start...');
    
    // Create LaunchAgent plist
    const launchAgentDir = path.join(homeDir, 'Library', 'LaunchAgents');
    const plistPath = path.join(launchAgentDir, 'com.leviathan.desktop.plist');
    
    // Ensure LaunchAgents directory exists
    if (!fs.existsSync(launchAgentDir)) {
        fs.mkdirSync(launchAgentDir, { recursive: true });
    }
    
    // Find the Leviathan app bundle
    const appPaths = [
        '/Applications/Leviathan.app',
        path.join(homeDir, 'Applications', 'Leviathan.app'),
        // Development paths
        path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle', 'osx', 'Leviathan.app'),
    ];
    
    let appPath = null;
    for (const possiblePath of appPaths) {
        if (fs.existsSync(possiblePath)) {
            appPath = possiblePath;
            break;
        }
    }
    
    if (!appPath) {
        throw new Error('Leviathan.app not found. Please install the app first.');
    }
    
    const executablePath = path.join(appPath, 'Contents', 'MacOS', 'leviathan-desktop');
    
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.leviathan.desktop</string>
    <key>ProgramArguments</key>
    <array>
        <string>${executablePath}</string>
        <string>--minimized</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>ProcessType</key>
    <string>Interactive</string>
    <key>LSUIElement</key>
    <true/>
</dict>
</plist>`;
    
    fs.writeFileSync(plistPath, plistContent);
    console.log(`✅ Created LaunchAgent: ${plistPath}`);
    
    // Load the LaunchAgent
    try {
        execSync(`launchctl load "${plistPath}"`, { stdio: 'inherit' });
        console.log('✅ LaunchAgent loaded');
    } catch (error) {
        console.warn('⚠️ Warning: Could not load LaunchAgent immediately. It will start on next login.');
    }
}

async function setupWindowsAutoStart() {
    console.log('🪟 Configuring Windows auto-start...');
    
    // Add registry entry for auto-start
    const appPath = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'leviathan-desktop.exe');
    
    if (!fs.existsSync(appPath)) {
        throw new Error('leviathan-desktop.exe not found. Please build the app first.');
    }
    
    const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "LeviathanDesktop" /t REG_SZ /d "${appPath} --minimized" /f`;
    
    try {
        execSync(regCommand, { stdio: 'inherit' });
        console.log('✅ Registry entry added');
    } catch (error) {
        throw new Error(`Failed to add registry entry: ${error.message}`);
    }
}

async function setupLinuxAutoStart() {
    console.log('🐧 Configuring Linux auto-start...');
    
    const autostartDir = path.join(homeDir, '.config', 'autostart');
    const desktopFilePath = path.join(autostartDir, 'leviathan-desktop.desktop');
    
    // Ensure autostart directory exists
    if (!fs.existsSync(autostartDir)) {
        fs.mkdirSync(autostartDir, { recursive: true });
    }
    
    // Find the executable
    const execPaths = [
        '/usr/local/bin/leviathan-desktop',
        '/usr/bin/leviathan-desktop',
        path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'leviathan-desktop'),
    ];
    
    let execPath = null;
    for (const possiblePath of execPaths) {
        if (fs.existsSync(possiblePath)) {
            execPath = possiblePath;
            break;
        }
    }
    
    if (!execPath) {
        throw new Error('leviathan-desktop executable not found');
    }
    
    const desktopFileContent = `[Desktop Entry]
Type=Application
Name=Leviathan Desktop
Exec=${execPath} --minimized
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Comment=Leviathan AI-Native Memory & Agent System
`;
    
    fs.writeFileSync(desktopFilePath, desktopFileContent);
    fs.chmodSync(desktopFilePath, 0o755);
    
    console.log(`✅ Created autostart desktop file: ${desktopFilePath}`);
}

async function removeAutoStart() {
    console.log('🗑️ Removing Leviathan Desktop auto-start...');
    
    try {
        switch (platform) {
            case 'darwin':
                const plistPath = path.join(homeDir, 'Library', 'LaunchAgents', 'com.leviathan.desktop.plist');
                if (fs.existsSync(plistPath)) {
                    execSync(`launchctl unload "${plistPath}"`);
                    fs.unlinkSync(plistPath);
                    console.log('✅ macOS LaunchAgent removed');
                }
                break;
                
            case 'win32':
                execSync('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "LeviathanDesktop" /f');
                console.log('✅ Windows registry entry removed');
                break;
                
            case 'linux':
                const desktopFilePath = path.join(homeDir, '.config', 'autostart', 'leviathan-desktop.desktop');
                if (fs.existsSync(desktopFilePath)) {
                    fs.unlinkSync(desktopFilePath);
                    console.log('✅ Linux autostart entry removed');
                }
                break;
        }
        
        console.log('✅ Auto-start removed successfully!');
        
    } catch (error) {
        console.error('❌ Failed to remove auto-start:', error.message);
        process.exit(1);
    }
}

// CLI interface
const command = process.argv[2];

switch (command) {
    case 'install':
    case 'setup':
        setupAutoStart();
        break;
    case 'remove':
    case 'uninstall':
        removeAutoStart();
        break;
    default:
        console.log('Usage: node setup-autostart.js [install|remove]');
        console.log('');
        console.log('Commands:');
        console.log('  install  - Enable auto-start on system boot');
        console.log('  remove   - Disable auto-start');
        process.exit(1);
}