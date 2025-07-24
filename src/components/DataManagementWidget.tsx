import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Cloud, 
  HardDrive,
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DataStats {
  totalSize: number;
  people: number;
  gifts: number;
  occasions: number;
  budgets: number;
  storageUsed: number;
  storageLimit: number;
  lastBackup: Date;
  lastSync: Date;
}

const DataManagementWidget: React.FC = () => {
  const { t } = useTranslation();
  const [dataStats, setDataStats] = useState<DataStats>({
    totalSize: 2.5 * 1024 * 1024, // 2.5MB
    people: 12,
    gifts: 45,
    occasions: 8,
    budgets: 3,
    storageUsed: 2.5 * 1024 * 1024,
    storageLimit: 100 * 1024 * 1024, // 100MB
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDataStats();
  }, []);

  const loadDataStats = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Data is already set in useState
    } catch (error) {
      console.error('Failed to load data stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storageProgress = (dataStats.storageUsed / dataStats.storageLimit) * 100;
  const isBackupRecent = Date.now() - dataStats.lastBackup.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours
  const isSyncRecent = Date.now() - dataStats.lastSync.getTime() < 60 * 60 * 1000; // Within 1 hour

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t('dataManagement.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-medium">{formatBytes(dataStats.storageUsed)}</span>
              </div>
              <Progress value={storageProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatBytes(dataStats.storageUsed)} used</span>
                <span>{formatBytes(dataStats.storageLimit - dataStats.storageUsed)} available</span>
              </div>
            </div>

            {/* Data Overview */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-blue-600" />
                <span>{formatBytes(dataStats.totalSize)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Encrypted</span>
              </div>
            </div>

            {/* Data Counts */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">People</span>
                <span className="font-medium">{dataStats.people}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gifts</span>
                <span className="font-medium">{dataStats.gifts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Occasions</span>
                <span className="font-medium">{dataStats.occasions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Budgets</span>
                <span className="font-medium">{dataStats.budgets}</span>
              </div>
            </div>

            {/* Backup & Sync Status */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Last Backup</span>
                </div>
                <div className="flex items-center gap-1">
                  {isBackupRecent ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  )}
                  <span className="text-muted-foreground">
                    {dataStats.lastBackup.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  <span>Last Sync</span>
                </div>
                <div className="flex items-center gap-1">
                  {isSyncRecent ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  )}
                  <span className="text-muted-foreground">
                    {dataStats.lastSync.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link to="/app/data">
                    <Database className="h-3 w-3 mr-1" />
                    Manage
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link to="/app/data">
                    <Cloud className="h-3 w-3 mr-1" />
                    Sync
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataManagementWidget; 