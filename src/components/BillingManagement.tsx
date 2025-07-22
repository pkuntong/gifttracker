import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Crown,
  Users,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StripePayment from '@/components/StripePayment';
import { 
  SUBSCRIPTION_PLANS,
  mockSubscription,
  mockPaymentMethods,
  getInvoices,
  getUsage,
  cancelSubscription,
  type Subscription,
  type PaymentMethod,
  type Invoice,
  type UsageData
} from '@/services/stripeService';

const BillingManagement: React.FC = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription>(mockSubscription);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [invoicesData, usageData] = await Promise.all([
        getInvoices(),
        getUsage()
      ]);
      setInvoices(invoicesData);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await cancelSubscription(subscription.id);
      setSubscription({ ...subscription, cancelAtPeriodEnd: true });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will end at the current billing period.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = () => {
    setShowPaymentDialog(true);
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentDialog(true);
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowEditPaymentDialog(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Create a mock CSV download
    const csvContent = `Invoice ID,Description,Date,Amount,Status\n${invoice.id},"${invoice.description}",${formatDate(invoice.date)},${formatCurrency(invoice.amount)},${invoice.status}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully.",
    });
  };

  const handleSubscriptionSuccess = (newSubscription: Subscription) => {
    setSubscription(newSubscription);
    setShowPaymentDialog(false);
    toast({
      title: "Plan Updated",
      description: "Your subscription has been updated successfully.",
    });
  };

  const handlePaymentMethodSuccess = () => {
    setShowPaymentDialog(false);
    setShowEditPaymentDialog(false);
    setSelectedPaymentMethod(null);
    toast({
      title: "Payment Method Updated",
      description: "Your payment method has been updated successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'canceled': return <AlertTriangle className="h-4 w-4" />;
      case 'past_due': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {subscription.plan === 'PREMIUM' && <Crown className="h-5 w-5 mr-2 text-yellow-500" />}
              {subscription.plan === 'FAMILY' && <Users className="h-5 w-5 mr-2 text-blue-500" />}
              {subscription.plan === 'FREE' && <Shield className="h-5 w-5 mr-2 text-gray-500" />}
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">
                {SUBSCRIPTION_PLANS[subscription.plan].name}
              </h3>
              <p className="text-gray-600">
                ${SUBSCRIPTION_PLANS[subscription.plan].price}/month
              </p>
            </div>
            
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusIcon(subscription.status)}
              <span className="ml-1 capitalize">{subscription.status}</span>
            </Badge>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span>{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}</span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="text-yellow-600 text-sm">
                  ⚠️ Subscription will end at current period
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleChangePlan}>
                Change Plan
              </Button>
              {!subscription.cancelAtPeriodEnd && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                >
                  {loading ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {usage && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gifts:</span>
                  <span>{usage.gifts} / {usage.limits.gifts === -1 ? '∞' : usage.limits.gifts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipients:</span>
                  <span>{usage.recipients} / {usage.limits.recipients === -1 ? '∞' : usage.limits.recipients}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommendations:</span>
                  <span>{usage.recommendations} / {usage.limits.recommendations === -1 ? '∞' : usage.limits.recommendations}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span>{usage.storage} GB / 1 GB</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {method.brand?.toUpperCase()} •••• {method.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEditPaymentMethod(method)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={handleAddPaymentMethod}>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                  <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog for Plan Changes and New Payment Methods */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Subscription & Payment</DialogTitle>
            <DialogDescription>
              Update your subscription plan or add a new payment method
            </DialogDescription>
          </DialogHeader>
          <StripePayment 
            onSuccess={handleSubscriptionSuccess}
            onCancel={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog for Editing Payment Methods */}
      <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update your payment method details
            </DialogDescription>
          </DialogHeader>
          <StripePayment 
            onSuccess={handlePaymentMethodSuccess}
            onCancel={() => setShowEditPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingManagement; 