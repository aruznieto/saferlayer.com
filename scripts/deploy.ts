#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Utility to run commands
const run = (command: string): void => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`);
    process.exit(1);
  }
};

// Main deployment function
async function deploy(): Promise<void> {
  console.log('🚀 Starting deployment process...');

  const outDir = path.join(process.cwd(), 'out');
  
  // Clean out directory except .git
  if (fs.existsSync(outDir)) {
    console.log('🗑️  Cleaning out directory...');
    const items = fs.readdirSync(outDir);
    for (const item of items) {
      if (item !== '.git') {
        fs.rmSync(path.join(outDir, item), { recursive: true, force: true });
      }
    }
  }

  // Build the project
  console.log('🏗️  Building project...');
  run('npm run build');

  // Navigate to out directory and commit changes
  console.log('📦 Committing changes...');
  process.chdir(outDir);
  
  try {
    // Initialize if needed (in case it's empty)
    if (!fs.existsSync(path.join(outDir, '.git'))) {
      run('git init');
      run('git remote add origin git@github.com:bytelantic/saferlayer.com.git');
    }

    // Add all files
    run('git add -A');
    
    // Commit (will fail if no changes, that's ok)
    try {
      // Let's also add the date and time of the update
      const date = new Date().toISOString();
      run(`git commit -m "Update site at ${date}"`);
    } catch (error) {
      console.log('No changes to commit');
    }

    // Push to main
    console.log('🚀 Pushing to main...');
    run('git push -f origin main');
    
    console.log('✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploy().catch(console.error); 