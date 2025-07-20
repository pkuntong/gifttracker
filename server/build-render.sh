#!/bin/bash

echo "🚀 Building for Render..."

# Force npm usage
export npm_config_registry=https://registry.npmjs.org/

# Navigate to server directory
cd server

# Clean any existing node_modules
rm -rf node_modules package-lock.json

# Install dependencies with npm
echo "📦 Installing dependencies with npm..."
npm install --production

# Verify express is installed
echo "🔍 Checking if express is installed..."
if npm list express > /dev/null 2>&1; then
    echo "✅ express is installed"
else
    echo "❌ express is not installed"
    echo "Installing express manually..."
    npm install express cors
fi

# List installed packages
echo "📋 Installed packages:"
npm list --depth=0

# Test that we can require express
echo "🧪 Testing express module..."
node -e "
try {
  const express = require('express');
  console.log('✅ express loaded successfully');
  console.log('express version:', express.version);
} catch (error) {
  console.error('❌ Error loading express:', error.message);
  process.exit(1);
}
"

echo "🎉 Build completed successfully!" 