import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Archive,
  Trash2,
  Copy,
  RotateCcw,
  HardDrive,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Gift,
  DollarSign,
  TrendingUp,
  Zap,
  Star,
  ArrowUpDown,
  Play,
  Pause
} from 'lucide-react';
import { apiService } from '@/services/api';

interface Backup {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'auto' | 'sync';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: number;
  createdAt: Date;
  scheduledFor?: Date;
  dataTypes: string[];
  encryption: boolean;
  compression: boolean;
  location: 'local' | 'cloud' | 'both';
  metadata: {
    people: number;
    gifts: number;
    occasions: number;
    budgets: number;
    families: number;
  };
}

interface SyncStatus {
  lastSync: Date;
  nextSync: Date;
  status: 'synced' | 'syncing' | 'failed' | 'offline';
  progress: number;
  conflicts: number;
  changes: number;
}

interface DataStats {
  totalSize: number;
  people: number;
  gifts: number;
  occasions: number;
  budgets: number;
  families: number;
  lastBackup: Date;
  lastSync: Date;
  storageUsed: number;
  storageLimit: number;
}

const AdvancedDataManagement: React.FC = () => {
  const { t } = useTranslation();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    nextSync: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    status: 'synced',
    progress: 100,
    conflicts: 0,
    changes: 0
  });
  const [dataStats, setDataStats] = useState<DataStats>({
    totalSize: 2.5 * 1024 * 1024, // 2.5MB
    people: 12,
    gifts: 45,
    occasions: 8,
    budgets: 3,
    families: 2,
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    storageUsed: 2.5 * 1024 * 1024,
    storageLimit: 100 * 1024 * 1024 // 100MB
  });
  const [loading, setLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [compression, setCompression] = useState(true);

  // Mock backups data
  const mockBackups: Backup[] = [
    {
      id: '1',
      name: 'Full Backup - Dec 15',
      description: 'Complete system backup with all data',
      type: 'manual',
      status: 'completed',
      size: 2.5 * 1024 * 1024, // 2.5MB
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      dataTypes: ['people', 'gifts', 'occasions', 'budgets', 'families'],
      encryption: true,
      compression: true,
      location: 'both',
      metadata: {
        people: 12,
        gifts: 45,
        occasions: 8,
        budgets: 3,
        families: 2
      }
    },
    {
      id: '2',
      name: 'Auto Backup - Dec 14',
      description: 'Automated daily backup',
      type: 'auto',
      status: 'completed',
      size: 2.3 * 1024 * 1024, // 2.3MB
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      dataTypes: ['people', 'gifts', 'occasions', 'budgets'],
      encryption: true,
      compression: true,
      location: 'cloud',
      metadata: {
        people: 11,
        gifts: 42,
        occasions: 7,
        budgets: 3,
        families: 2
      }
    },
    {
      id: '3',
      name: 'Sync Backup - Dec 13',
      description: 'Cross-device synchronization',
      type: 'sync',
      status: 'completed',
      size: 2.1 * 1024 * 1024, // 2.1MB
      createdAt: new Date(Date.now() - 54 * 60 * 60 * 1000),
      dataTypes: ['people', 'gifts', 'occasions'],
      encryption: true,
      compression: false,
      location: 'both',
      metadata: {
        people: 10,
        gifts: 38,
        occasions: 6,
        budgets: 2,
        families: 1
      }
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups(mockBackups);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'manual' | 'auto' | 'sync') => {
    setLoading(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup: Backup = {
        id: Date.now().toString(),
        name: `${type === 'manual' ? 'Manual' : type === 'auto' ? 'Auto' : 'Sync'} Backup - ${new Date().toLocaleDateString()}`,
        description: `New ${type} backup created`,
        type,
        status: 'completed',
        size: 2.5 * 1024 * 1024,
        createdAt: new Date(),
        dataTypes: ['people', 'gifts', 'occasions', 'budgets', 'families'],
        encryption,
        compression,
        location: 'both',
        metadata: {
          people: dataStats.people,
          gifts: dataStats.gifts,
          occasions: dataStats.occasions,
          budgets: dataStats.budgets,
          families: dataStats.families
        }
      };
      
      setBackups(prev => [newBackup, ...prev]);
      setDataStats(prev => ({ ...prev, lastBackup: new Date() }));
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    setLoading(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Backup restored:', backupId);
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const startSync = async () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing', progress: 0 }));
    
    // Simulate sync process
    const interval = setInterval(() => {
      setSyncStatus(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            status: 'synced',
            progress: 100,
            lastSync: new Date(),
            nextSync: new Date(Date.now() + 30 * 60 * 1000)
          };
        }
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'syncing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'synced':
        return CheckCircle;
      case 'in_progress':
      case 'syncing':
        return RefreshCw;
      case 'failed':
        return X;
      case 'scheduled':
        return Clock;
      default:
        return AlertTriangle;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-left">{t('dataManagement.title')}</h1>
          <p className="text-muted-foreground text-left">{t('dataManagement.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => createBackup('manual')} disabled={loading}>
            <Database className="h-4 w-4 mr-2" />
            {t('dataManagement.createBackup')}
          </Button>
          <Button variant="outline" onClick={startSync} disabled={syncStatus.status === 'syncing'}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
            {t('dataManagement.sync')}
          </Button>
        </div>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{formatBytes(dataStats.totalSize)}</div>
                <div className="text-sm text-muted-foreground">Total Data</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{dataStats.people}</div>
                <div className="text-sm text-muted-foreground">People</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{dataStats.gifts}</div>
                <div className="text-sm text-muted-foreground">Gifts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{dataStats.occasions}</div>
                <div className="text-sm text-muted-foreground">Occasions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage & Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              {t('dataManagement.storageUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('dataManagement.used')}</span>
                <span>{formatBytes(dataStats.storageUsed)}</span>
              </div>
              <Progress value={storageProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('dataManagement.available')}</span>
                <span>{formatBytes(dataStats.storageLimit - dataStats.storageUsed)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span>{dataStats.people} People</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-600" />
                <span>{dataStats.gifts} Gifts</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span>{dataStats.occasions} Occasions</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span>{dataStats.budgets} Budgets</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              {t('dataManagement.syncStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dataManagement.lastSync')}</span>
              <span className="text-sm text-muted-foreground">
                {syncStatus.lastSync.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('dataManagement.nextSync')}</span>
              <span className="text-sm text-muted-foreground">
                {syncStatus.nextSync.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(syncStatus.status)}>
                {syncStatus.status}
              </Badge>
              {syncStatus.conflicts > 0 && (
                <Badge variant="destructive">
                  {syncStatus.conflicts} conflicts
                </Badge>
              )}
            </div>

            {syncStatus.status === 'syncing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('dataManagement.syncing')}</span>
                  <span>{syncStatus.progress}%</span>
                </div>
                <Progress value={syncStatus.progress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={startSync} disabled={syncStatus.status === 'syncing'}>
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('dataManagement.syncNow')}
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                {t('dataManagement.syncSettings')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('dataManagement.backupSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">{t('dataManagement.automation')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('dataManagement.autoBackup')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('dataManagement.autoBackupDescription')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('dataManagement.autoSync')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('dataManagement.autoSyncDescription')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">{t('dataManagement.security')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('dataManagement.encryption')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('dataManagement.encryptionDescription')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={encryption}
                    onChange={(e) => setEncryption(e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('dataManagement.compression')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('dataManagement.compressionDescription')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={compression}
                    onChange={(e) => setCompression(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {t('dataManagement.backups')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('dataManagement.noBackups')}</h3>
                <p className="text-muted-foreground">{t('dataManagement.noBackupsDescription')}</p>
              </div>
            ) : (
              backups.map((backup) => {
                const StatusIcon = getStatusIcon(backup.status);
                
                return (
                  <div key={backup.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{backup.name}</h3>
                          <Badge className={getStatusColor(backup.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {backup.status}
                          </Badge>
                          {backup.encryption && (
                            <Lock className="h-4 w-4 text-green-600" />
                          )}
                          {backup.compression && (
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {backup.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatBytes(backup.size)}</span>
                          <span>{backup.createdAt.toLocaleString()}</span>
                          <span>{backup.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreBackup(backup.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBackup(backup.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {backup.dataTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground">
                      <div>People: {backup.metadata.people}</div>
                      <div>Gifts: {backup.metadata.gifts}</div>
                      <div>Occasions: {backup.metadata.occasions}</div>
                      <div>Budgets: {backup.metadata.budgets}</div>
                      <div>Families: {backup.metadata.families}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedDataManagement; 