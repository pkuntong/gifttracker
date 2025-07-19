# Production Setup Guide

## Environment Variables for Production

Create a `.env.production` file in your project root with the following variables:

```env
# Production Environment Variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RHtDnRp30Oo5mnQ5bs8kzcp9dtXHaHS9FhAzibeg7wy61I49UJL1pKDvs9z6KGotGBD6j3GI8qVkBODEr1pojLp00jv62uYtG

# App Configuration
VITE_APP_NAME=Gift Tracker

# Production API URL - Update this with your actual backend URL
VITE_API_URL=https://your-production-backend-url.com/api
```

## Vercel Deployment Configuration

### 1. Environment Variables in Vercel

Set these environment variables in your Vercel dashboard:

- `VITE_API_URL`: Your production backend URL
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your live Stripe publishable key
- `VITE_APP_NAME`: Gift Tracker

### 2. Backend Deployment

Your backend server needs to be deployed separately. Options:

1. **Vercel Functions**: Deploy `server/server.js` as a Vercel function
2. **Railway**: Deploy the server to Railway
3. **Heroku**: Deploy the server to Heroku
4. **DigitalOcean**: Deploy to a DigitalOcean droplet

### 3. Update API URL

Once your backend is deployed, update the `VITE_API_URL` in your Vercel environment variables to point to your deployed backend.

## Current Configuration Status

✅ **Frontend**: Ready for production deployment  
✅ **PWA**: Service worker and manifest configured  
✅ **Authentication**: JWT_SECRET properly configured  
✅ **Stripe**: Live keys configured  
⚠️ **Backend**: Needs deployment  
⚠️ **API URL**: Needs to be updated with production backend URL  

## Next Steps

1. Deploy your backend server
2. Update `VITE_API_URL` in Vercel environment variables
3. Deploy frontend to Vercel
4. Test the complete application 