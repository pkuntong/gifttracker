#!/bin/bash

echo "🔄 Resetting development environment..."

# Kill any running processes
echo "Stopping any running servers..."
pkill -f "vite" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true

# Clear node modules and reinstall (optional - only if needed)
# echo "Clearing node modules..."
# rm -rf node_modules server/node_modules
# npm install
# cd server && npm install && cd ..

# Clear browser cache programmatically (this creates a script)
echo "Creating cache clearing script..."
cat > clear-cache.js << 'EOF'
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('ServiceWorker unregistered:', boolean);
      });
    }
  });
}

if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name).then(function(deleted) {
        console.log('Cache deleted:', name, deleted);
      });
    }
  });
}

console.log('✅ Browser cache and service workers cleared!');
console.log('Now refresh the page (Cmd+Shift+R or Ctrl+Shift+R)');
EOF

echo "✅ Development environment reset complete!"
echo ""
echo "Next steps:"
echo "1. Run: cd server && npm start"
echo "2. In new terminal: npm run dev"
echo "3. Open browser to: http://localhost:3000"
echo "4. Open DevTools Console and run: $(cat clear-cache.js)"
echo "5. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)"