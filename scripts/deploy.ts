#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Utility to run commands
const run = (command: string, options: { cwd?: string } = {}): void => {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Failed to execute ${command}`);
    process.exit(1);
  }
};

// Main deployment function
async function deploy(): Promise<void> {
  console.log('🚀 Starting deployment process...');

  const outDir = path.join(process.cwd(), 'out');
  
  // Clean and reinitialize the submodule
  console.log('📦 Reinitializing submodule...');
  run('rm -rf out');
  run('git submodule update --init');
  run('git checkout main', { cwd: outDir });
  
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

  // Commit and push changes in the submodule
  console.log('📦 Committing changes...');
  try {
    run('git add -A', { cwd: outDir });
    
    try {
      const date = new Date().toISOString();
      run(`git commit -m "Update site at ${date}"`, { cwd: outDir });
      console.log('🚀 Pushing to main...');
      run('git push origin main', { cwd: outDir });
    } catch (error) {
      console.log('No changes to commit in the submodule');
    }

    // Update the submodule reference in the main repository
    run('git add out');
    try {
      run('git commit -m "chore: update deployment submodule reference"');
      run('git push');
    } catch (error) {
      console.log('No need to update submodule reference');
    }
    
    console.log('✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploy().catch(console.error); 