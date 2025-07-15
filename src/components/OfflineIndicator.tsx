import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '@/hooks/use-mobile';

const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { isOnline, offlineData, syncOfflineData } = useOffline();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    if (!isOnline || offlineData.length === 0) return;
    
    setIsSyncing(true);
    try {
      await syncOfflineData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && offlineData.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:top-8 md:left-8 md:right-8">
      <Alert className={`border-l-4 ${
        isOnline 
          ? 'border-green-500 bg-green-50' 
          : 'border-red-500 bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className="text-sm">
              {isOnline 
                ? t('pwa.onlineMessage')
                : t('pwa.offlineMessage')
              }
            </AlertDescription>
          </div>
          
          {offlineData.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {offlineData.length} pending
              </Badge>
              {isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? t('pwa.syncMessage') : 'Sync'}
                </Button>
              )}
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default OfflineIndicator; 