import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, Shield, Zap, Users, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  SUBSCRIPTION_PLANS, 
  createSubscription, 
  mockSubscription,
  type Subscription 
} from '@/services/stripeService';

// Get Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

interface StripePaymentProps {
  onSuccess?: (subscription: Subscription) => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<StripePaymentProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof SUBSCRIPTION_PLANS>('PREMIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

             const plan = SUBSCRIPTION_PLANS[selectedPlan];
       const result = await createSubscription(plan.priceId || '', paymentMethod.id);

      if (result.subscriptionId) {
        toast({
          title: "Subscription successful!",
          description: `Welcome to ${plan.name}!`,
        });
        
        onSuccess?.(mockSubscription);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all relative ${
              selectedPlan === key 
                ? 'ring-2 ring-primary border-primary shadow-lg' 
                : 'hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan(key as keyof typeof SUBSCRIPTION_PLANS)}
          >
            {selectedPlan === key && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Selected
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {key === 'FREE' && <Shield className="h-8 w-8 text-gray-500" />}
                {key === 'PREMIUM' && <Crown className="h-8 w-8 text-yellow-500" />}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-primary">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Form */}
      {selectedPlan !== 'FREE' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Your payment is secure and encrypted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Details</label>
                <div className="border rounded-md p-3">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>
              )}

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={!stripe || loading}
                  className="flex-1"
                >
                  {loading ? 'Processing...' : `Subscribe to ${SUBSCRIPTION_PLANS[selectedPlan].name}`}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <Shield className="h-4 w-4 inline mr-1" />
        Your payment information is secure and encrypted
      </div>
    </div>
  );
};

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePayment; 