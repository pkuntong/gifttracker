# 🚀 Render Deployment Guide for Gift Tracker Backend

## Why Render?
- **Free Tier**: 750 hours/month (enough for 24/7)
- **Easy Deployment**: Connect GitHub, automatic deployments
- **Custom Domains**: Free SSL certificates
- **Sleep Mode**: Saves resources when not in use
- **No Credit Card Required**: Perfect for free tier

## Step-by-Step Deployment

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Ensure `server/` folder contains all backend files
3. Verify `render.yaml` is in your root directory

### Step 2: Deploy to Render
1. **Go to Render.com**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: `gift-tracker-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

4. **Set Environment Variables**
   Click "Environment" tab and add:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jnhucgyztokoffzwiegj.supabase.co:5432/postgres
   JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-3 minutes)
   - Your service will be available at: `https://your-app-name.onrender.com`

### Step 3: Test Your Deployment
1. **Health Check**:
   ```bash
   curl https://your-app-name.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"Gift Tracker API is running"}`

2. **Test API Endpoints**:
   ```bash
   # Test registration
   curl -X POST https://your-app-name.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

### Step 4: Update Frontend
Update your frontend environment variables:
```env
VITE_API_URL=https://your-app-name.onrender.com/api
```

### Step 5: Deploy Frontend to Vercel
```bash
vercel --prod
```

## Render Free Tier Limits
- **750 hours/month**: Enough for 24/7 operation
- **Sleep after 15 minutes**: Service sleeps when not in use
- **Cold start**: First request after sleep takes 10-30 seconds
- **No custom domains**: Use provided .onrender.com domain

## Monitoring Your App
1. **Render Dashboard**: Monitor deployments and logs
2. **Health Checks**: Automatic health monitoring
3. **Logs**: Real-time log viewing
4. **Metrics**: Basic performance metrics

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Environment Variables**: Ensure all required vars are set
4. **Cold Starts**: Normal for free tier, consider upgrading for production

### Performance Tips:
1. **Keep Alive**: Use services like UptimeRobot to ping your app
2. **Optimize Dependencies**: Remove unused packages
3. **Database Connection Pooling**: Already configured in server.js

## Cost Comparison
| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Render** | 750 hours/month | $7/month |
| **Railway** | $5 credit/month | $5/month |
| **Fly.io** | 3 VMs, 3GB storage | $1.94/month |
| **Heroku** | Discontinued | $7/month |

## Next Steps
1. ✅ Deploy backend to Render
2. ✅ Test all API endpoints
3. ✅ Update frontend environment variables
4. ✅ Deploy frontend to Vercel
5. ✅ Test complete application
6. ✅ Set up monitoring

Your app will be live and free! 🎉 