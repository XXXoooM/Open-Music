const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const webDir = path.join(__dirname, '../web');

const targets = [
  {
    name: 'Android Assets',
    path: path.join(__dirname, '../android/app/src/main/assets/public'),
  },
  {
    name: 'Electron App',
    path: path.join(__dirname, '../electron/app'),
  },
  {
    name: 'HarmonyOS Rawfile Web',
    path: path.join(__dirname, '../harmony/entry/src/main/resources/rawfile/web'),
  }
];

function syncAll() {
  console.log('🔄 Starting multi-platform asset synchronization...');
  
  if (!fs.existsSync(webDir)) {
    console.error(`❌ Source directory not found: ${webDir}`);
    process.exit(1);
  }

  // 1. Run Capacitor Sync for Android
  try {
    console.log('📦 Running Capacitor Sync for Android...');
    execSync('npx cap sync android', { stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Capacitor sync android skipped or failed. Falling back to manual filesystem copy...');
    const androidTarget = targets[0];
    copyFolder(webDir, androidTarget.path, androidTarget.name);
  }

  // 2. Run Capacitor Electron sync/copy
  try {
    console.log('📦 Running Capacitor Electron copy...');
    // In capacitor-community/electron, it uses cap copy
    execSync('npx cap copy electron', { stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Capacitor Electron copy skipped or failed. Falling back to manual filesystem copy...');
    const electronTarget = targets[1];
    copyFolder(webDir, electronTarget.path, electronTarget.name);
  }

  // 3. Sync HarmonyOS (custom Native ArkWeb app, needs direct file copy)
  const harmonyTarget = targets[2];
  copyFolder(webDir, harmonyTarget.path, harmonyTarget.name);

  console.log('✅ Asset synchronization complete!');
}

function copyFolder(src, dest, name) {
  try {
    console.log(`📁 Copying web assets to ${name}: ${dest}`);
    
    // Ensure parent directories exist
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    
    // Remove old contents if exists to prevent stale assets
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    
    // Copy folder recursively (Node.js 16.7.0+)
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`✨ Successfully synchronized to ${name}.`);
  } catch (err) {
    console.error(`❌ Failed to sync to ${name}:`, err.message);
  }
}

syncAll();
