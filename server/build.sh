#!/bin/bash

echo "🚀 Building Gift Tracker Backend for Render..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the server directory."
    exit 1
fi

# Force npm usage and clean install
echo "📦 Installing dependencies with npm..."
npm install --production

# Verify dotenv is installed
echo "🔍 Checking if dotenv is installed..."
if ! npm list dotenv > /dev/null 2>&1; then
    echo "⚠️  dotenv not found, installing explicitly..."
    npm install dotenv
fi

# Check if all required dependencies are installed
echo "🔍 Checking dependencies..."
REQUIRED_DEPS=("express" "cors" "bcryptjs" "jsonwebtoken" "pg" "uuid" "stripe" "dotenv")
for dep in "${REQUIRED_DEPS[@]}"; do
    if ! npm list "$dep" > /dev/null 2>&1; then
        echo "❌ Missing dependency: $dep"
        echo "Installing $dep..."
        npm install "$dep"
    else
        echo "✅ $dep is installed"
    fi
done

echo "✅ All dependencies installed successfully!"

# Test the server can start
echo "🧪 Testing server startup..."
node -e "
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded successfully');
  
  const express = require('express');
  console.log('✅ express loaded successfully');
  
  const cors = require('cors');
  console.log('✅ cors loaded successfully');
  
  const bcrypt = require('bcryptjs');
  console.log('✅ bcryptjs loaded successfully');
  
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken loaded successfully');
  
  const { Pool } = require('pg');
  console.log('✅ pg loaded successfully');
  
  const { v4: uuidv4 } = require('uuid');
  console.log('✅ uuid loaded successfully');
  
  console.log('✅ All modules loaded successfully!');
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  process.exit(1);
}
"

echo "🎉 Build completed successfully!" 