# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Supabase Project**: Your backend is already deployed on Supabase

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `pkuntong/gifttracker`

### 2. Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables

Add these environment variables in Vercel:

```
VITE_API_URL=https://jnhucgyztokoffzwiegj.supabase.co/functions/v1/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
VITE_APP_NAME=Gift Tracker
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Troubleshooting

### Common Issues

1. **Build Fails**: Check the build logs in Vercel dashboard
2. **Environment Variables**: Make sure all required env vars are set
3. **API Errors**: Verify Supabase Edge Functions are deployed

### Build Commands

```bash
# Local build test
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

## Post-Deployment

1. **Test the Application**: Visit your Vercel URL
2. **Check Console**: Look for any JavaScript errors
3. **Test Authentication**: Try logging in with demo credentials
4. **Test API Calls**: Verify Supabase integration works

## Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `demo123`

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally with `npm run dev`
4. Check browser console for errors 