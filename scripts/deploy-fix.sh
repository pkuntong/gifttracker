#!/bin/bash

# Deploy fix for React useLayoutEffect error
echo "🚀 Deploying fixed version..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    
    # Check if dist folder exists and has content
    if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
        echo "✅ Dist folder created with content"
        
        # Check if index.html exists and has script tag
        if grep -q "script type=\"module\"" dist/index.html; then
            echo "✅ Index.html has proper script tags"
        else
            echo "❌ Warning: Index.html missing script tags"
        fi
        
        echo "🎯 Ready to deploy!"
        echo "📋 Next steps:"
        echo "   1. Commit your changes: git add . && git commit -m 'Fix React useLayoutEffect error'"
        echo "   2. Push to your repository: git push"
        echo "   3. Deploy to your hosting platform"
        
    else
        echo "❌ Error: Dist folder is empty or missing"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi 