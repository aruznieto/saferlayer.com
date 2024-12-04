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
  process.chdir('..');

  // Clean the output directory while preserving the .git directory
  console.log('🗑️  Cleaning output directory...');
  const outDir = path.join(process.cwd(), 'out');
  const items = fs.readdirSync(outDir);
  for (const item of items) {
    const itemPath = path.join(outDir, item);
    // Skip the .git directory completely
    if (item === '.git') continue;
    // Remove everything else
    fs.rmSync(itemPath, { recursive: true, force: true });
  }

  // Build the project
  console.log('🏗️  Building project...');
  run('npm run build');

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

  // Commit and push the changes in the submodule
  console.log('📦 Committing changes...');
  process.chdir(outDir);
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