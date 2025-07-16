import { loadStripe, Stripe } from '@stripe/stripe-js';

// Mock Stripe configuration (replace with your actual keys)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';
const STRIPE_SECRET_KEY = 'sk_test_your_secret_key_here';

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
  // Mock implementation - replace with actual API call
  return {
    clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substr(2, 9),
    amount,
    currency
  };
};

export const createSubscription = async (priceId: string, paymentMethodId: string) => {
  // Mock implementation - replace with actual API call
  return {
    subscriptionId: 'sub_' + Math.random().toString(36).substr(2, 9),
    status: 'active',
    clientSecret: 'sub_mock_secret_' + Math.random().toString(36).substr(2, 9)
  };
};

export const cancelSubscription = async (subscriptionId: string) => {
  // Mock implementation - replace with actual API call
  return {
    success: true,
    canceledAt: new Date()
  };
};

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  // Mock implementation - replace with actual API call
  return {
    success: true,
    updatedAt: new Date()
  };
};

// Billing functions
export const getInvoices = async () => {
  // Mock implementation
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