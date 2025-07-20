#!/bin/bash

echo "🔧 Fixing npm issues..."

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove corrupted files
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Start dev server
echo "Starting development server..."
npm run dev 