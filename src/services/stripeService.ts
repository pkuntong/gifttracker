import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get Stripe keys from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here';

let stripe: Stripe | null = null;

export const initializeStripe = async (): Promise<Stripe | null> => {
  if (!stripe) {
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripe;
};

export const getStripe = (): Stripe | null => stripe;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: '', // No price ID for free plan
    features: [
      'Up to 10 gifts',
      'Basic tracking',
      'Standard support'
    ],
    limits: {
      gifts: 10,
      people: 5,
      occasions: 3
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99,
    priceId: 'price_premium_monthly', // Replace with your actual Stripe price ID
    features: [
      'Unlimited gifts',
      'Smart recommendations',
      'Advanced analytics',
      'Social features',
      'Integrations',
      'Priority support'
    ],
    limits: {
      gifts: -1,
      people: -1,
      occasions: -1
    }
  },
  FAMILY: {
    name: 'Family Plan',
    price: 19.99,
    priceId: 'price_family_monthly', // Replace with your actual Stripe price ID
    features: [
      'Everything in Premium',
      'Up to 6 family members',
      'Family features',
      'Custom branding',
      'Advanced data export'
    ],
    limits: {
      gifts: -1,
      people: -1,
      occasions: -1
    }
  }
};

// Payment methods
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

// Subscription status
export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: keyof typeof SUBSCRIPTION_PLANS;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// Invoice interface
export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'pending';
  date: Date;
  description: string;
}

// Usage data interface
export interface UsageData {
  gifts: number;
  recipients: number;
  recommendations: number;
  storage: number;
  limits: {
    gifts: number;
    people: number;
    occasions: number;
    recipients: number;
    recommendations: number;
  };
}

// Mock payment methods
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expMonth: 12,
    expYear: 2025,
    isDefault: true
  },
  {
    id: 'pm_2',
    type: 'card',
    last4: '5555',
    brand: 'mastercard',
    expMonth: 8,
    expYear: 2026,
    isDefault: false
  }
];

// Mock subscription
export const mockSubscription: Subscription = {
  id: 'sub_1',
  status: 'active',
  plan: 'PREMIUM',
  currentPeriodStart: new Date('2024-01-01'),
  currentPeriodEnd: new Date('2024-02-01'),
  cancelAtPeriodEnd: false
};

// Payment processing functions
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const response = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ amount, currency })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Create payment intent error:', error);
    // Fallback to mock for development
    return {
      clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substr(2, 9),
      amount,
      currency
    };
  }
};

export const createSubscription = async (priceId: string, paymentMethodId: string) => {
  try {
    const response = await fetch('/api/payments/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ priceId, paymentMethodId })
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Create subscription error:', error);
    // Fallback to mock for development
    return {
      subscriptionId: 'sub_' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      clientSecret: 'sub_mock_secret_' + Math.random().toString(36).substr(2, 9)
    };
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch('/api/payments/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ subscriptionId })
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Cancel subscription error:', error);
    // Fallback to mock for development
    return {
      success: true,
      canceledAt: new Date()
    };
  }
};

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  try {
    const response = await fetch('/api/payments/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ subscriptionId, priceId })
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Update subscription error:', error);
    // Fallback to mock for development
    return {
      success: true,
      updatedAt: new Date()
    };
  }
};

// Billing functions
export const getInvoices = async () => {
  try {
    const response = await fetch('/api/payments/invoices', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get invoices');
    }

    return await response.json();
  } catch (error) {
    console.error('Get invoices error:', error);
    // Fallback to mock for development
    return [
      {
        id: 'inv_1',
        amount: 999,
        currency: 'usd',
        status: 'paid',
        date: new Date('2024-01-01'),
        description: 'Premium Plan - January 2024'
      },
      {
        id: 'inv_2',
        amount: 999,
        currency: 'usd',
        status: 'paid',
        date: new Date('2023-12-01'),
        description: 'Premium Plan - December 2023'
      }
    ];
  }
};

export const getUsage = async () => {
  // Mock implementation
  return {
    gifts: 45,
    recipients: 12,
    recommendations: 23,
    storage: 0.5, // GB
    limits: SUBSCRIPTION_PLANS.PREMIUM.limits
  };
};

// Premium features check
export const hasPremiumFeature = (feature: string, subscription?: Subscription): boolean => {
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS[subscription.plan];
  
  switch (feature) {
    case 'unlimited_gifts':
      return plan.limits.gifts === -1;
    case 'ai_recommendations':
      return subscription.plan !== 'FREE';
    case 'advanced_analytics':
      return subscription.plan !== 'FREE';
    case 'social_features':
      return subscription.plan !== 'FREE';
    case 'integrations':
      return subscription.plan !== 'FREE';
    case 'family_features':
      return subscription.plan === 'FAMILY';
    default:
      return false;
  }
};

// Usage tracking
export const trackUsage = async (feature: string, amount: number = 1) => {
  // Mock implementation - replace with actual usage tracking
  console.log(`Usage tracked: ${feature} - ${amount}`);
};

// Webhook handling (for server-side)
export const handleWebhook = async (event: any) => {
  // Mock implementation - replace with actual webhook handling
  switch (event.type) {
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'customer.subscription.updated':
      // Handle subscription update
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
  }
}; 