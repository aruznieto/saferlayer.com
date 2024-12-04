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

  // Ensure submodule is initialized and on main branch
  console.log('📦 Preparing submodule...');
  run('git submodule update --init');
  process.chdir('out');
  run('git checkout main');
  
  // Clean everything except .git
  console.log('🗑️  Cleaning directory...');
  const items = fs.readdirSync('.');
  for (const item of items) {
    if (item === '.git') continue;
    fs.rmSync(item, { recursive: true, force: true });
  }

  // Go back to root to build
  process.chdir('..');

  // Build the project
  console.log('🏗️  Building project...');
  run('npm run build');

  // Move contents of out directory to deployment repo
  console.log('📦 Moving build files...');
  const buildDir = path.join(process.cwd(), 'out');
  const tempDir = path.join(process.cwd(), 'temp_build');
  fs.renameSync(buildDir, tempDir);
  fs.mkdirSync(buildDir);
  const builtItems = fs.readdirSync(tempDir);
  for (const item of builtItems) {
    fs.renameSync(path.join(tempDir, item), path.join(buildDir, item));
  }
  fs.rmdirSync(tempDir);

  // Get formatted date for commit messages
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });

  // Commit and push the changes
  console.log('📦 Committing changes...');
  process.chdir('out');
  run('git add .');
  
  try {
    run(`git commit -m "Deploy site: ${timestamp} UTC"`);
    run('git push origin HEAD:main');
  } catch (error) {
    console.log('No changes to commit');
  }

  // Go back to main repository and update the submodule reference
  process.chdir('..');
  run('git add out');
  try {
    run(`git commit -m "chore: update site deployment (${timestamp} UTC)"`);
    run('git push');
  } catch (error) {
    console.log('No need to update submodule reference');
  }

  console.log('✅ Deployment successful!');
}

deploy().catch(console.error); 