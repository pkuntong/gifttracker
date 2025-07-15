import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Zap,
  Star,
  Heart,
  Gift,
  Users,
  TrendingUp,
  Filter,
  Plus,
  Edit,
  Trash2,
  Archive,
  Pin
} from 'lucide-react';
import { ApiService } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'update' | 'suggestion' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'gift' | 'person' | 'occasion' | 'budget' | 'system';
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    gift: boolean;
    person: boolean;
    occasion: boolean;
    budget: boolean;
    system: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
}

const SmartNotifications: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      gift: true,
      person: true,
      occasion: true,
      budget: true,
      system: true
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      urgent: true
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned' | 'urgent'>('all');
  const [loading, setLoading] = useState(false);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Birthday Reminder',
      message: 'Sarah\'s birthday is in 3 days. Don\'t forget to get a gift!',
      type: 'reminder',
      priority: 'high',
      category: 'person',
      isRead: false,
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      actionUrl: '/people/sarah'
    },
    {
      id: '2',
      title: 'Budget Alert',
      message: 'You\'ve spent 80% of your Christmas budget. Consider reviewing your spending.',
      type: 'alert',
      priority: 'medium',
      category: 'budget',
      isRead: false,
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      actionUrl: '/budgets'
    },
    {
      id: '3',
      title: 'Gift Recommendation',
      message: 'Based on John\'s interests, we found 5 new gift ideas for his upcoming birthday.',
      type: 'suggestion',
      priority: 'low',
      category: 'gift',
      isRead: true,
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      actionUrl: '/recommendations'
    },
    {
      id: '4',
      title: 'Package Delivered',
      message: 'Your gift for Mom has been delivered successfully.',
      type: 'update',
      priority: 'medium',
      category: 'gift',
      isRead: true,
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      actionUrl: '/tracking'
    },
    {
      id: '5',
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve completed 10 gifts this month.',
      type: 'achievement',
      priority: 'low',
      category: 'system',
      isRead: false,
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      metadata: { achievement: 'gift_master', count: 10 }
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const togglePin = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isPinned: !notification.isPinned }
          : notification
      )
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isArchived: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'alert': return AlertTriangle;
      case 'update': return CheckCircle;
      case 'suggestion': return Star;
      case 'achievement': return Zap;
      default: return Bell;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gift': return Gift;
      case 'person': return Users;
      case 'occasion': return Calendar;
      case 'budget': return TrendingUp;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'pinned') return notification.isPinned;
    if (filter === 'urgent') return notification.priority === 'urgent';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pinnedCount = notifications.filter(n => n.isPinned).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('notifications.title')}</h1>
          <p className="text-muted-foreground">{t('notifications.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('notifications.settings')}
          </Button>
          <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('notifications.markAllRead')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-muted-foreground">Unread</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{pinnedCount}</div>
                <div className="text-sm text-muted-foreground">Pinned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{urgentCount}</div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('notifications.settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Channels */}
            <div className="space-y-4">
              <h3 className="font-semibold">{t('notifications.channels')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.email}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, email: checked }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.push}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, push: checked }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Push</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.sms}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, sms: checked }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">SMS</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.inApp}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, inApp: checked }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">In-App</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      quietHours: { ...prev.quietHours, enabled: checked }
                    }))
                  }
                />
                <span className="font-semibold">{t('notifications.quietHours')}</span>
              </div>
              {settings.quietHours.enabled && (
                <div className="flex gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Start</label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">End</label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'pinned' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pinned')}
        >
          Pinned ({pinnedCount})
        </Button>
        <Button
          variant={filter === 'urgent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('urgent')}
        >
          Urgent ({urgentCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('notifications.noNotifications')}</h3>
              <p className="text-muted-foreground">{t('notifications.noNotificationsDescription')}</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type);
            const CategoryIcon = getCategoryIcon(notification.category);
            
            return (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        notification.isRead ? 'bg-muted' : 'bg-primary/10'
                      }`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                            {notification.isPinned && (
                              <Pin className="h-3 w-3 text-yellow-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CategoryIcon className="h-3 w-3" />
                              {notification.category}
                            </div>
                            <span>{notification.createdAt.toLocaleString()}</span>
                            {notification.scheduledFor && (
                              <span>Scheduled: {notification.scheduledFor.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                                                     <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => togglePin(notification.id)}
                           >
                             <Pin className={`h-3 w-3 ${notification.isPinned ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                           </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => archiveNotification(notification.id)}
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SmartNotifications; 