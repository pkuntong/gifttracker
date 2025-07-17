# Stripe Payment Setup Guide

This guide will help you set up real Stripe payments for your GiftTracker application.

## Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Node.js**: Make sure you have Node.js installed
3. **Git**: For version control

## Step 1: Get Your Stripe API Keys

1. **Log into your Stripe Dashboard**
2. **Navigate to Developers → API Keys**
3. **Copy your keys**:
   - **Publishable Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)

## Step 2: Update Environment Variables

Edit the `.env` file in your project root and replace the placeholder keys:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
VITE_STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

# App Configuration
VITE_APP_NAME=Gift Tracker
VITE_API_URL=http://localhost:3001
```

## Step 3: Create Stripe Products and Prices

1. **Go to Stripe Dashboard → Products**
2. **Create a new product** for each subscription plan:

### Premium Plan
- **Product Name**: "Gift Tracker Premium"
- **Price**: $9.99/month
- **Billing**: Recurring
- **Price ID**: Copy this ID (starts with `price_`)

### Family Plan
- **Product Name**: "Gift Tracker Family"
- **Price**: $19.99/month
- **Billing**: Recurring
- **Price ID**: Copy this ID (starts with `price_`)

## Step 4: Update Price IDs in Code

Edit `src/services/stripeService.ts` and replace the placeholder price IDs:

```typescript
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: '', // No price ID for free plan
    // ... rest of config
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99,
    priceId: 'price_your_actual_premium_price_id_here', // Replace with your actual price ID
    // ... rest of config
  },
  FAMILY: {
    name: 'Family Plan',
    price: 19.99,
    priceId: 'price_your_actual_family_price_id_here', // Replace with your actual price ID
    // ... rest of config
  }
};
```

## Step 5: Start the Backend Server

1. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3001`

## Step 6: Test the Integration

1. **Start the frontend**:
   ```bash
   npm run dev
   ```

2. **Navigate to the Billing page** in your app
3. **Try subscribing** to a plan
4. **Use Stripe test card numbers**:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Any future date** for expiry
   - **Any 3-digit CVC**

## Step 7: Production Deployment

When ready for production:

1. **Switch to live keys** in your Stripe dashboard
2. **Update environment variables** with live keys
3. **Update price IDs** with live price IDs
4. **Deploy your application**

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**:
   - Check that your API keys are correct
   - Make sure you're using test keys for development

2. **"Price not found" error**:
   - Verify your price IDs are correct
   - Make sure prices are active in Stripe dashboard

3. **"Customer not found" error**:
   - Check that user authentication is working
   - Verify the user email is being passed correctly

### Testing

- **Use Stripe's test mode** for development
- **Test with different card scenarios** (success, decline, etc.)
- **Check Stripe Dashboard** for payment events and logs

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Keep your secret key secure** - only use it on the server
- **Use HTTPS in production** for secure payments

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in your Stripe dashboard
- **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

Your GiftTracker app now has real payment processing! 🎉 