#!/bin/bash

echo "🚀 Preparing Gift Tracker for Render Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if server directory exists
if [ ! -d "server" ]; then
    echo "❌ Error: Server directory not found"
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found"
    exit 1
fi

echo "✅ Project structure looks good!"

# Test backend locally first
echo "🧪 Testing backend locally..."
cd server

# Install dependencies
npm install

# Start server in background
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
curl -f http://localhost:3001/api/health
if [ $? -eq 0 ]; then
    echo "✅ Backend health check passed!"
else
    echo "❌ Backend health check failed!"
    kill $SERVER_PID
    exit 1
fi

# Stop server
kill $SERVER_PID
cd ..

echo ""
echo "🎉 Backend is ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://render.com"
echo "2. Sign up with GitHub"
echo "3. Create new Web Service"
echo "4. Connect your repository"
echo "5. Set environment variables:"
echo "   - DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jnhucgyztokoffzwiegj.supabase.co:5432/postgres"
echo "   - JWT_SECRET=your-super-secure-jwt-secret"
echo "   - STRIPE_SECRET_KEY=sk_test_your_secret_key"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "6. Deploy!"
echo ""
echo "After deployment, update your frontend .env.production with:"
echo "VITE_API_URL=https://your-app-name.onrender.com/api"
echo ""
echo "Then deploy frontend to Vercel: vercel --prod" 