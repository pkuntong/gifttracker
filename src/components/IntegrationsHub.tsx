import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  ShoppingCart, 
  Calendar, 
  Mail, 
  Smartphone, 
  CreditCard,
  Gift,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'connected' | 'disconnected' | 'error';
  category: 'shopping' | 'calendar' | 'communication' | 'payment';
  features: string[];
  lastSync?: string;
  syncStatus?: 'syncing' | 'success' | 'error';
}

interface IntegrationsHubProps {
  onOpenSettings?: (integrationId: string, integrationName: string) => void;
}

const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ onOpenSettings }) => {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Sync wishlists and track purchases',
      icon: ShoppingCart,
      status: 'connected',
      category: 'shopping',
      features: ['Wishlist Sync', 'Price Tracking', 'Purchase History'],
      lastSync: '2 hours ago',
      syncStatus: 'success'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync occasions and reminders',
      icon: Calendar,
      status: 'connected',
      category: 'calendar',
      features: ['Event Sync', 'Reminder Integration', 'Birthday Import'],
      lastSync: '1 hour ago',
      syncStatus: 'success'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Email integration for gift coordination',
      icon: Mail,
      status: 'disconnected',
      category: 'communication',
      features: ['Email Templates', 'Gift Coordination', 'Reminder Emails']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Track gift payments and expenses',
      icon: CreditCard,
      status: 'connected',
      category: 'payment',
      features: ['Payment Tracking', 'Expense Reports', 'Budget Sync'],
      lastSync: '30 minutes ago',
      syncStatus: 'syncing'
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Discover unique handmade gifts',
      icon: Gift,
      status: 'disconnected',
      category: 'shopping',
      features: ['Gift Discovery', 'Price Alerts', 'Seller Tracking']
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Share gift ideas with family',
      icon: Smartphone,
      status: 'disconnected',
      category: 'communication',
      features: ['Gift Sharing', 'Family Coordination', 'Photo Sharing']
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'shopping', name: 'Shopping', count: integrations.filter(i => i.category === 'shopping').length },
    { id: 'calendar', name: 'Calendar', count: integrations.filter(i => i.category === 'calendar').length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'payment', name: 'Payment', count: integrations.filter(i => i.category === 'payment').length }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const handleConnect = async (integrationId: string) => {
    // Simulate connection process
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'connected' as const, lastSync: 'Just now', syncStatus: 'syncing' as const }
        : i
    ));

    // Simulate sync completion
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, syncStatus: 'success' as const, lastSync: 'Just now' }
          : i
      ));
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'disconnected' as const, syncStatus: undefined, lastSync: undefined }
        : i
    ));
  };

  const handleSync = async (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, syncStatus: 'syncing' as const }
        : i
    ));

    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, syncStatus: 'success' as const, lastSync: 'Just now' }
          : i
      ));
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSyncStatusIcon = (syncStatus?: string) => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-left">{t('integrations.title')}</h1>
          <p className="text-muted-foreground text-left">{t('integrations.description')}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('integrations.addIntegration')}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.name}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon;
          
          return (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    {getSyncStatusIcon(integration.syncStatus)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('integrations.features')}</h4>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {integration.lastSync && (
                      <span>Last sync: {integration.lastSync}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <>
                                                 <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleSync(integration.id)}
                           disabled={integration.syncStatus === 'syncing'}
                         >
                           <RefreshCw className="h-3 w-3 mr-1" />
                           {t('integrations.sync')}
                         </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenSettings?.(integration.id, integration.name)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          {t('integrations.settings')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(integration.id)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('integrations.connect')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {integrations.filter(i => i.status === 'connected').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('integrations.connected')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
                 <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <RefreshCw className="h-5 w-5 text-blue-600" />
               <div>
                 <div className="text-2xl font-bold">
                   {integrations.filter(i => i.syncStatus === 'syncing').length}
                 </div>
                 <div className="text-sm text-muted-foreground">
                   {t('integrations.syncing')}
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">
                  {t('integrations.giftsSynced')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">
                  {t('integrations.eventsSynced')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsHub; 