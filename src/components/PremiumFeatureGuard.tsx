import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, Users, Shield } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/services/stripeService';

interface PremiumFeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  // Mock subscription status - replace with actual user subscription
  const mockSubscription = {
    plan: 'FREE' as keyof typeof SUBSCRIPTION_PLANS,
    status: 'active' as const
  };

  const hasFeature = (() => {
    if (mockSubscription.status !== 'active') return false;
    
    const plan = SUBSCRIPTION_PLANS[mockSubscription.plan];
    
    switch (feature) {
      case 'unlimited_gifts':
        return plan.limits.gifts === -1;
      case 'ai_recommendations':
        return mockSubscription.plan !== 'FREE';
      case 'advanced_analytics':
        return mockSubscription.plan !== 'FREE';
      case 'social_features':
        return mockSubscription.plan !== 'FREE';
      case 'integrations':
        return mockSubscription.plan !== 'FREE';
      case 'family_features':
        return mockSubscription.plan === 'FAMILY';
      case 'priority_support':
        return mockSubscription.plan !== 'FREE';
      case 'advanced_search':
        return mockSubscription.plan !== 'FREE';
      case 'data_export':
        return mockSubscription.plan !== 'FREE';
      case 'custom_branding':
        return mockSubscription.plan === 'FAMILY';
      default:
        return false;
    }
  })();

  if (hasFeature) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case 'unlimited_gifts':
        return {
          title: 'Unlimited Gifts',
          description: 'Track unlimited gifts and recipients',
          icon: <Crown className="h-6 w-6 text-yellow-500" />,
          plan: 'PREMIUM'
        };
      case 'ai_recommendations':
        return {
          title: 'AI-Powered Recommendations',
          description: 'Get intelligent gift suggestions based on preferences',
          icon: <Zap className="h-6 w-6 text-blue-500" />,
          plan: 'PREMIUM'
        };
      case 'advanced_analytics':
        return {
          title: 'Advanced Analytics',
          description: 'Detailed insights and predictive analytics',
          icon: <Zap className="h-6 w-6 text-purple-500" />,
          plan: 'PREMIUM'
        };
      case 'social_features':
        return {
          title: 'Social Features',
          description: 'Share wishlists and coordinate with family',
          icon: <Users className="h-6 w-6 text-green-500" />,
          plan: 'PREMIUM'
        };
      case 'integrations':
        return {
          title: 'External Integrations',
          description: 'Connect with Amazon, Google Calendar, and more',
          icon: <Zap className="h-6 w-6 text-orange-500" />,
          plan: 'PREMIUM'
        };
      case 'family_features':
        return {
          title: 'Family Plan Features',
          description: 'Up to 6 family members with shared features',
          icon: <Users className="h-6 w-6 text-blue-500" />,
          plan: 'FAMILY'
        };
      case 'priority_support':
        return {
          title: 'Priority Support',
          description: 'Get faster support responses',
          icon: <Shield className="h-6 w-6 text-green-500" />,
          plan: 'PREMIUM'
        };
      case 'advanced_search':
        return {
          title: 'Advanced Search',
          description: 'AI-powered search with intelligent filters',
          icon: <Zap className="h-6 w-6 text-indigo-500" />,
          plan: 'PREMIUM'
        };
      case 'data_export':
        return {
          title: 'Data Export',
          description: 'Export your data in multiple formats',
          icon: <Zap className="h-6 w-6 text-teal-500" />,
          plan: 'PREMIUM'
        };
      case 'custom_branding':
        return {
          title: 'Custom Branding',
          description: 'Personalize your gift tracking experience',
          icon: <Crown className="h-6 w-6 text-purple-500" />,
          plan: 'FAMILY'
        };
      default:
        return {
          title: 'Premium Feature',
          description: 'This feature requires a premium subscription',
          icon: <Lock className="h-6 w-6 text-gray-500" />,
          plan: 'PREMIUM'
        };
    }
  };

  const featureInfo = getFeatureInfo(feature);
  const requiredPlan = SUBSCRIPTION_PLANS[featureInfo.plan as keyof typeof SUBSCRIPTION_PLANS];

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {featureInfo.icon}
        </div>
        <CardTitle className="text-xl">{featureInfo.title}</CardTitle>
        <CardDescription className="text-base">
          {featureInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Premium Feature</span>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-center mb-2">
            {requiredPlan.name === 'Premium' && <Crown className="h-5 w-5 text-yellow-500 mr-2" />}
            {requiredPlan.name === 'Family Plan' && <Users className="h-5 w-5 text-blue-500 mr-2" />}
            <span className="font-semibold">{requiredPlan.name}</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            ${requiredPlan.price}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </div>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            {requiredPlan.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center justify-center">
                <span className="text-green-500 mr-1">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
          <Button variant="outline" className="flex-1">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumFeatureGuard; 