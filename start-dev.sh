#!/bin/bash

echo "🚀 Starting Gift Tracker Development Environment"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Kill any existing processes
echo "🔄 Stopping any existing servers..."
pkill -f "vite" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
sleep 2

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Start backend server in background
echo "🔧 Starting backend server (port 3001)..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server (port 3000)..."
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:3001"
echo ""
echo "📋 Troubleshooting:"
echo "• If you see cache errors, clear browser cache (Cmd+Shift+R)"
echo "• If service worker issues persist, run clear-cache.js in DevTools"
echo "• WebSocket errors are normal - HMR will still work"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start frontend (this will block)
npm run dev

# Cleanup when script exits
echo "🛑 Stopping servers..."
kill $BACKEND_PID 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true