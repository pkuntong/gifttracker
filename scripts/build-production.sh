#!/bin/bash

echo "🚀 Building for Production"
echo "========================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf .vite

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run type-check

# Lint check
echo "🔍 Running lint check..."
npm run lint

# Build for production
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📁 Build output: dist/"
    echo "📊 Bundle size:"
    du -sh dist/*
    
    echo ""
    echo "🚀 Ready for deployment!"
    echo "Next steps:"
    echo "1. Set production environment variables"
    echo "2. Deploy to Vercel: git push origin main"
    echo "3. Test the deployed application"
else
    echo "❌ Build failed!"
    exit 1
fi 