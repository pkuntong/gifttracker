import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, CreditCard, FileText, Users, Shield, Zap, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BillingManagement from '@/components/BillingManagement';
import StripePayment from '@/components/StripePayment';
import PremiumFeatureGuard from '@/components/PremiumFeatureGuard';
import { SUBSCRIPTION_PLANS, mockSubscription, type Subscription } from '@/services/stripeService';

const Billing: React.FC = () => {
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [subscription, setSubscription] = useState(mockSubscription);
  const [planDialogs, setPlanDialogs] = useState<Record<string, boolean>>({});

  const handleSubscriptionSuccess = (newSubscription: Subscription) => {
    setSubscription(newSubscription);
    setShowPaymentDialog(false);
  };

  const handlePlanUpgrade = (planKey: string, planName: string) => {
    // This will be handled by the StripePayment component
    console.log(`Upgrading to ${planName}`);
  };

  const handlePlanDowngrade = (planKey: string, planName: string) => {
    // This will be handled by the StripePayment component
    console.log(`Downgrading to ${planName}`);
  };

  const openPlanDialog = (planKey: string) => {
    setPlanDialogs(prev => ({ ...prev, [planKey]: true }));
  };

  const closePlanDialog = (planKey: string) => {
    setPlanDialogs(prev => ({ ...prev, [planKey]: false }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and payment methods</p>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose Your Plan</DialogTitle>
              <DialogDescription>
                Select the perfect plan for your gift tracking needs
              </DialogDescription>
            </DialogHeader>
            <StripePayment 
              onSuccess={handleSubscriptionSuccess}
              onCancel={() => setShowPaymentDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing Management</TabsTrigger>
          <TabsTrigger value="plans">Plans & Features</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {subscription.plan === 'PREMIUM' && <Crown className="h-5 w-5 mr-2 text-yellow-500" />}
                  {subscription.plan === 'FREE' && <Shield className="h-5 w-5 mr-2 text-gray-500" />}
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {SUBSCRIPTION_PLANS[subscription.plan].name}
                    </h3>
                    <p className="text-gray-600">
                      ${SUBSCRIPTION_PLANS[subscription.plan].price}/month
                    </p>
                  </div>
                  
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-4 w-4 mr-1" />
                    Active
                  </Badge>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">{subscription.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next billing:</span>
                      <span>{subscription.currentPeriodEnd.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Mock download invoices functionality
                    const link = document.createElement('a');
                    link.href = 'data:text/csv;charset=utf-8,Invoice ID,Amount,Date,Status\nINV-001,9.99,2025-07-22,Paid\nINV-002,19.99,2025-06-22,Paid';
                    link.download = 'invoices.csv';
                    link.click();
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Invoices
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Gifts:</span>
                    <span>45 / ∞</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipients:</span>
                    <span>12 / ∞</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span>0.5 GB / 1 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Management Tab */}
        <TabsContent value="billing">
          <BillingManagement />
        </TabsContent>

        {/* Plans & Features Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose the Perfect Plan</h2>
            <p className="text-gray-600">Upgrade to unlock premium features and unlimited gifts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <Card key={key} className={`relative ${
                subscription.plan === key ? 'ring-2 ring-primary' : ''
              }`}>
                {subscription.plan === key && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Current Plan
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {key === 'FREE' && <Shield className="h-8 w-8 text-gray-500" />}
                    {key === 'PREMIUM' && <Crown className="h-8 w-8 text-yellow-500" />}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {subscription.plan === key ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Dialog open={planDialogs[key]} onOpenChange={(open) => open ? openPlanDialog(key) : closePlanDialog(key)}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => openPlanDialog(key)}
                        >
                          {key === 'FREE' ? 'Downgrade' : 'Upgrade'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{key === 'FREE' ? 'Downgrade to Free' : 'Upgrade to Premium'}</DialogTitle>
                        </DialogHeader>
                        <StripePayment 
                          onSuccess={handleSubscriptionSuccess}
                          onCancel={() => closePlanDialog(key)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>
                Compare features across all plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Feature</th>
                      <th className="text-center p-2 font-medium">Free</th>
                      <th className="text-center p-2 font-medium">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Gifts Limit</td>
                      <td className="text-center p-2">10</td>
                      <td className="text-center p-2">∞</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">AI Recommendations</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Advanced Analytics</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Social Features</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Integrations</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Priority Support</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr>
                      <td className="p-2">Export Reports</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Open help or FAQ section
                    toast({
                      title: "Need Help?",
                      description: "Contact our support team for detailed plan information.",
                    });
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Need Help Choosing?
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing; 