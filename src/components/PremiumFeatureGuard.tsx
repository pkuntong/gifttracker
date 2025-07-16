import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, Users, Shield, Gift, Target, BarChart3, ExternalLink, Heart, MessageCircle, Search, Download, Palette } from 'lucide-react';
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

  const featureDetails = {
    unlimited_gifts: {
      title: 'Unlimited Gifts',
      description: 'Track unlimited gifts across all your occasions',
      icon: Gift,
      plan: 'PREMIUM'
    },
    ai_recommendations: {
      title: 'Smart Recommendations',
      description: 'Get personalized gift suggestions based on preferences',
      icon: Target,
      plan: 'PREMIUM'
    },
    advanced_analytics: {
      title: 'Advanced Analytics',
      description: 'Detailed insights and spending analytics',
      icon: BarChart3,
      plan: 'PREMIUM'
    },
    social_features: {
      title: 'Social Features',
      description: 'Share wishlists and coordinate with family',
      icon: Users,
      plan: 'PREMIUM'
    },
    integrations: {
      title: 'Integrations',
      description: 'Connect with popular e-commerce platforms',
      icon: ExternalLink,
      plan: 'PREMIUM'
    },
    family_features: {
      title: 'Family Features',
      description: 'Advanced family management and sharing',
      icon: Heart,
      plan: 'FAMILY'
    },
    priority_support: {
      title: 'Priority Support',
      description: 'Get help when you need it most',
      icon: MessageCircle,
      plan: 'PREMIUM'
    },
    advanced_search: {
      title: 'Advanced Search',
      description: 'Smart search with intelligent filters',
      icon: Search,
      plan: 'PREMIUM'
    },
    data_export: {
      title: 'Data Export',
      description: 'Export your data in multiple formats',
      icon: Download,
      plan: 'PREMIUM'
    },
    custom_branding: {
      title: 'Custom Branding',
      description: 'Personalize your experience',
      icon: Palette,
      plan: 'FAMILY'
    }
  };

  const featureInfo = featureDetails[feature as keyof typeof featureDetails];
  const requiredPlan = SUBSCRIPTION_PLANS[featureInfo.plan as keyof typeof SUBSCRIPTION_PLANS];

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <featureInfo.icon className="h-8 w-8 text-primary" />
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