#!/usr/bin/env node

/**
 * Script to remove demo user from Supabase
 * 
 * This script helps remove the demo user (demo@example.com) from your Supabase project.
 * 
 * Prerequisites:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login to Supabase: supabase login
 * 3. Link your project: supabase link --project-ref YOUR_PROJECT_REF
 * 
 * Usage:
 * node scripts/remove-demo-user.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗑️  Demo User Removal Script');
console.log('============================\n');

// Function to execute shell commands
function executeCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to prompt user
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('This script will help you remove the demo user from Supabase.');
  console.log('Demo user: demo@example.com\n');

  // Check if Supabase CLI is installed
  const cliCheck = executeCommand('supabase --version');
  if (!cliCheck.success) {
    console.log('❌ Supabase CLI not found. Please install it first:');
    console.log('   npm install -g supabase');
    console.log('   Then run: supabase login');
    process.exit(1);
  }

  console.log('✅ Supabase CLI found');

  // Check if project is linked
  const statusCheck = executeCommand('supabase status');
  if (!statusCheck.success) {
    console.log('❌ Project not linked. Please link your project first:');
    console.log('   supabase link --project-ref YOUR_PROJECT_REF');
    console.log('   (Replace YOUR_PROJECT_REF with your actual project reference)');
    process.exit(1);
  }

  console.log('✅ Project is linked');

  // Manual removal instructions
  console.log('\n📋 Manual Removal Instructions:');
  console.log('================================');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Authentication → Users');
  console.log('4. Find the user with email: demo@example.com');
  console.log('5. Click the three dots (⋮) next to the user');
  console.log('6. Select "Delete user"');
  console.log('7. Confirm the deletion');
  console.log('\n⚠️  Warning: This will permanently delete the demo user and all associated data!');

  const confirm = await askQuestion('\nHave you completed the manual removal? (y/N): ');
  
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    console.log('\n✅ Demo user removal completed!');
    console.log('\nNext steps:');
    console.log('1. Test registration with a new email');
    console.log('2. Verify no demo references remain in the code');
    console.log('3. Update any documentation that mentions demo credentials');
  } else {
    console.log('\n❌ Demo user removal cancelled.');
  }

  rl.close();
}

main().catch(console.error); 