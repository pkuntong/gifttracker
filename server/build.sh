#!/bin/bash

echo "🚀 Building Gift Tracker Backend for Render..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the server directory."
    exit 1
fi

# Clean install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Check if dotenv is installed
if ! npm list dotenv > /dev/null 2>&1; then
    echo "⚠️  dotenv not found, installing..."
    npm install dotenv
fi

# Check if all required dependencies are installed
echo "🔍 Checking dependencies..."
REQUIRED_DEPS=("express" "cors" "bcryptjs" "jsonwebtoken" "pg" "uuid" "stripe")
for dep in "${REQUIRED_DEPS[@]}"; do
    if ! npm list "$dep" > /dev/null 2>&1; then
        echo "❌ Missing dependency: $dep"
        exit 1
    fi
done

echo "✅ All dependencies installed successfully!"

# Test the server
echo "🧪 Testing server..."
node -e "
const dotenv = require('dotenv');
dotenv.config();
console.log('✅ dotenv loaded successfully');
console.log('✅ Environment variables:', Object.keys(process.env).filter(key => key.includes('DATABASE_URL') || key.includes('JWT_SECRET') || key.includes('NODE_ENV')));
"

echo "🎉 Build completed successfully!" 