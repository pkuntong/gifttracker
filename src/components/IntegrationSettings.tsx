import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  TestTube, 
  Save,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { integrationsService } from '@/services/integrations';

interface IntegrationSettingsProps {
  integrationId: string;
  integrationName: string;
  onClose: () => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  integrationId,
  integrationName,
  onClose
}) => {
  const { t } = useTranslation();
  const [showSecrets, setShowSecrets] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const [settings, setSettings] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    refreshToken: '',
    webhookUrl: '',
    autoSync: true,
    syncInterval: '1h',
    notifications: true
  });

  const getIntegrationConfig = () => {
    switch (integrationId) {
      case 'amazon':
        return {
          fields: [
            { key: 'apiKey', label: 'API Key', type: 'text', required: true },
            { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
          ],
          description: 'Connect your Amazon account to sync wishlists and track purchases'
        };
      case 'google-calendar':
        return {
          fields: [
            { key: 'accessToken', label: 'Access Token', type: 'text', required: true },
            { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
          ],
          description: 'Connect your Google Calendar to sync events and reminders'
        };
      case 'paypal':
        return {
          fields: [
            { key: 'apiKey', label: 'Client ID', type: 'text', required: true },
            { key: 'apiSecret', label: 'Client Secret', type: 'password', required: true }
          ],
          description: 'Connect your PayPal account to track gift payments and expenses'
        };
      case 'etsy':
        return {
          fields: [
            { key: 'apiKey', label: 'API Key', type: 'text', required: true }
          ],
          description: 'Connect to Etsy to discover unique handmade gifts'
        };
      case 'whatsapp':
        return {
          fields: [
            { key: 'apiKey', label: 'API Token', type: 'password', required: true },
            { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: false }
          ],
          description: 'Connect WhatsApp to share gift ideas with family'
        };
      case 'gmail':
        return {
          fields: [
            { key: 'accessToken', label: 'Access Token', type: 'text', required: true },
            { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true }
          ],
          description: 'Connect Gmail for email integration and gift coordination'
        };
      default:
        return {
          fields: [],
          description: 'Configure integration settings'
        };
    }
  };

  const config = getIntegrationConfig();

  const handleFieldChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      let result;
      switch (integrationId) {
        case 'amazon':
          result = await integrationsService.connectAmazon(settings.apiKey, settings.apiSecret);
          break;
        case 'google-calendar':
          result = await integrationsService.connectGoogleCalendar(settings.accessToken, settings.refreshToken);
          break;
        case 'paypal':
          result = await integrationsService.connectPayPal(settings.apiKey, settings.apiSecret);
          break;
        case 'etsy':
          result = await integrationsService.connectEtsy(settings.apiKey);
          break;
        case 'whatsapp':
          result = await integrationsService.connectWhatsApp('+1234567890', settings.apiKey);
          break;
        case 'gmail':
          result = await integrationsService.connectGmail(settings.accessToken, settings.refreshToken);
          break;
        default:
          result = { success: false, error: 'Unknown integration' };
      }

      setTestResult(result.success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save settings to localStorage or database
      localStorage.setItem(`integration_${integrationId}_settings`, JSON.stringify(settings));
      
      // Test connection after saving
      await handleTestConnection();
      
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = () => {
    integrationsService.disconnectIntegration(integrationId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{integrationName} Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* API Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">API Configuration</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSecrets ? 'Hide' : 'Show'} Secrets
              </Button>
            </div>
            
            <div className="grid gap-4">
              {config.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={field.type === 'password' && !showSecrets ? 'password' : 'text'}
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="pr-10"
                    />
                    {field.type === 'password' && (
                      <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sync Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data from this integration
                  </p>
                </div>
                <Switch
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => handleFieldChange('autoSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sync Interval</Label>
                  <p className="text-sm text-muted-foreground">
                    How often to sync data
                  </p>
                </div>
                <select
                  value={settings.syncInterval}
                  onChange={(e) => handleFieldChange('syncInterval', e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="15m">Every 15 minutes</option>
                  <option value="1h">Every hour</option>
                  <option value="6h">Every 6 hours</option>
                  <option value="1d">Daily</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about sync status
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleFieldChange('notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Connection</h3>
              {testResult && (
                <Badge variant={testResult === 'success' ? 'default' : 'destructive'}>
                  {testResult === 'success' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {testResult === 'success' ? 'Connected' : 'Failed'}
                </Badge>
              )}
            </div>
            
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="outline"
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings; 