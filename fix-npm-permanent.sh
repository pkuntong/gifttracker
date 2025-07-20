#!/bin/bash

echo "🔧 PERMANENT NPM FIX"
echo "======================"

# 1. Clear ALL npm caches
echo "1. Clearing npm cache..."
npm cache clean --force
npm cache verify

# 2. Remove any conflicting lock files
echo "2. Removing conflicting lock files..."
rm -f bun.lockb
rm -f yarn.lock
rm -f pnpm-lock.yaml

# 3. Remove corrupted node_modules and lock files
echo "3. Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# 4. Clear npm cache again
echo "4. Final cache clear..."
npm cache clean --force

# 5. Reinstall everything fresh
echo "5. Fresh npm install..."
npm install

# 6. Verify scripts are available
echo "6. Verifying scripts..."
npm run

# 7. Start dev server
echo "7. Starting development server..."
npm run dev 