#!/usr/bin/env node

/**
 * Migration script from electron-builder to Electron Forge
 * Run with: node scripts/migrate-to-forge.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Electron Forge migration...\n');

// Step 1: Check prerequisites
console.log('📋 Checking prerequisites...');
try {
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ Git repository detected');
} catch (error) {
  console.error('❌ Not a git repository. Please initialize git first.');
  process.exit(1);
}

// Step 2: Create backup branch
console.log('\n📦 Creating backup branch...');
try {
  execSync('git checkout -b backup/pre-forge-migration', { stdio: 'pipe' });
  execSync('git add .', { stdio: 'pipe' });
  execSync('git commit -m "Backup: Pre-Electron Forge migration"', { stdio: 'pipe' });
  console.log('✅ Backup branch created');
} catch (error) {
  console.log('⚠️  Could not create backup branch (may already exist)');
}

// Step 3: Install Electron Forge
console.log('\n📥 Installing Electron Forge dependencies...');
const forgeDeps = [
  '@electron-forge/cli',
  '@electron-forge/maker-squirrel',
  '@electron-forge/maker-zip',
  '@electron-forge/maker-dmg',
  '@electron-forge/maker-deb',
  '@electron-forge/plugin-vite',
  '@electron-forge/plugin-auto-unpack-natives',
  '@electron-forge/publisher-github'
];

try {
  execSync(`npm install --save-dev ${forgeDeps.join(' ')}`, { stdio: 'inherit' });
  console.log('✅ Electron Forge dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 4: Create forge.config.js
console.log('\n📝 Creating forge.config.js...');
if (fs.existsSync('forge.config.example.js') && !fs.existsSync('forge.config.js')) {
  fs.copyFileSync('forge.config.example.js', 'forge.config.js');
  console.log('✅ forge.config.js created from example');
} else {
  console.log('⚠️  forge.config.js already exists or example not found');
}

// Step 5: Update package.json scripts
console.log('\n📝 Updating package.json scripts...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const oldScripts = { ...packageJson.scripts };
packageJson.scripts = {
  // Forge scripts
  "start": "electron-forge start",
  "package": "electron-forge package",
  "make": "electron-forge make",
  "publish": "electron-forge publish",
  
  // Keep existing useful scripts
  "dev": "electron-forge start",
  "build": "npm run build -ws --if-present && electron-forge package",
  "test": "npm run test -ws --if-present",
  "typecheck": "npm run typecheck -ws --if-present",
  
  // Preserve devnet test scripts
  ...Object.fromEntries(
    Object.entries(oldScripts).filter(([key]) => key.includes('devnet'))
  ),
  
  // Legacy scripts (prefixed)
  "legacy:compile": oldScripts.compile || "echo 'No legacy compile script'",
  "legacy:dev": oldScripts.dev || "echo 'No legacy dev script'"
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json scripts updated');

// Step 6: Update main process for Squirrel events
console.log('\n📝 Updating main process for Squirrel events...');
const mainPath = path.join(process.cwd(), 'packages/main/src/index.ts');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  if (!mainContent.includes('electron-squirrel-startup')) {
    const updatedContent = `// Handle Squirrel events (Windows installer)
if (require('electron-squirrel-startup')) {
  app.quit();
}

${mainContent}`;
    fs.writeFileSync(mainPath, updatedContent);
    console.log('✅ Main process updated for Squirrel events');
  } else {
    console.log('✅ Main process already handles Squirrel events');
  }
}

// Step 7: Create entitlements.plist for macOS
console.log('\n📝 Creating entitlements.plist for macOS code signing...');
const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.network.server</key>
  <true/>
</dict>
</plist>`;

fs.writeFileSync('entitlements.plist', entitlementsContent);
console.log('✅ entitlements.plist created');

// Step 8: Update .gitignore
console.log('\n📝 Updating .gitignore...');
const gitignorePath = path.join(process.cwd(), '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
const forgeIgnores = ['out/', '.webpack/', '.vite/'];
const newIgnores = forgeIgnores.filter(ignore => !gitignoreContent.includes(ignore));

if (newIgnores.length > 0) {
  fs.appendFileSync(gitignorePath, '\n# Electron Forge\n' + newIgnores.join('\n') + '\n');
  console.log('✅ .gitignore updated');
}

// Step 9: Create migration report
console.log('\n📊 Creating migration report...');
const report = {
  timestamp: new Date().toISOString(),
  forgeVersion: packageJson.devDependencies['@electron-forge/cli'],
  electronVersion: packageJson.devDependencies['electron'],
  migratedScripts: Object.keys(packageJson.scripts).filter(key => 
    ['start', 'package', 'make', 'publish'].includes(key)
  ),
  preservedScripts: Object.keys(packageJson.scripts).filter(key => 
    key.includes('devnet')
  ),
  nextSteps: [
    'Test development mode: npm start',
    'Test production build: npm run make',
    'Configure GitHub Actions for automated releases',
    'Remove old electron-builder files when ready'
  ]
};

fs.writeFileSync('forge-migration-report.json', JSON.stringify(report, null, 2));
console.log('✅ Migration report created');

// Final summary
console.log('\n🎉 Migration completed successfully!\n');
console.log('Next steps:');
console.log('1. Test development mode: npm start');
console.log('2. Test production build: npm run make');
console.log('3. Review forge.config.js for your specific needs');
console.log('4. Configure environment variables for code signing');
console.log('5. Test on all target platforms');
console.log('\nTo rollback: git checkout backup/pre-forge-migration');