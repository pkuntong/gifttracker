# 🛠️ Development Setup Guide

## Quick Fix for Current Issues

The errors you're seeing are due to configuration mismatches. Here's how to fix them:

### 1. **Start Both Servers Correctly**

You need to run **both** the frontend and backend servers:

```bash
# Terminal 1: Start the backend server (port 3001)
cd server
npm start

# Terminal 2: Start the frontend (port 3000)  
cd ..
npm run dev
```

### 2. **Access the Correct URL**

- ✅ **Frontend**: http://localhost:3000 (Vite dev server)
- ✅ **Backend**: http://localhost:3001 (Express server)

**Don't access localhost:3001 directly** - that's your API server, not the frontend!

### 3. **Fixed Configuration Issues**

✅ **Environment Variables**: Updated `.env.local` to point frontend to backend  
✅ **PWA Manifest**: Fixed icon references  
✅ **Meta Tags**: Removed deprecated apple-mobile-web-app-capable  
✅ **Service Worker**: Simplified for development  

## Proper Development Workflow

```bash
# 1. Install dependencies (if not done)
npm install
cd server && npm install && cd ..

# 2. Start backend server
cd server
npm start
# Should show: Server running on port 3001

# 3. In a new terminal, start frontend
npm run dev
# Should show: Local: http://localhost:3000

# 4. Open browser to http://localhost:3000
```

## Configuration Details

### Port Setup
- **Frontend (Vite)**: Port 3000 (`vite.config.ts`)
- **Backend (Express)**: Port 3001 (`server/.env.local`)
- **API calls**: Frontend → `http://localhost:3001/api/*`

### Environment Files
- `.env.local`: Development config (frontend points to localhost:3001)
- `server/.env.local`: Backend config with your live keys

## Troubleshooting

### Error: "Failed to load module script"
- **Cause**: Accessing backend port (3001) instead of frontend port (3000)
- **Fix**: Use http://localhost:3000

### Error: "WebSocket connection failed"
- **Cause**: Vite HMR trying wrong ports
- **Fix**: Both servers must be running, access via localhost:3000

### Error: "Service Worker registered"
- **Status**: Normal development behavior, simplified SW for dev mode

## Production Deployment

For production, you only need the built frontend:

```bash
npm run build
# Deploy the `dist/` folder
```

The environment variables will automatically switch to your production Supabase endpoints.

---

**TL;DR**: Run both servers, access localhost:3000, not localhost:3001! 🚀