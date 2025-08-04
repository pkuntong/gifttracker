import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  Gift,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  ArrowRight,
  Pin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'update' | 'suggestion' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'gift' | 'person' | 'occasion' | 'budget' | 'system';
  isRead: boolean;
  isPinned: boolean;
  createdAt: Date;
}

const NotificationWidget: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock notifications for the widget
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Birthday Reminder',
      message: 'Sarah\'s birthday is in 3 days',
      type: 'reminder',
      priority: 'high',
      category: 'person',
      isRead: false,
      isPinned: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Budget Alert',
      message: '80% of Christmas budget spent',
      type: 'alert',
      priority: 'medium',
      category: 'budget',
      isRead: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Gift Recommendation',
      message: '5 new ideas for John\'s birthday',
      type: 'suggestion',
      priority: 'low',
      category: 'gift',
      isRead: true,
      isPinned: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ];

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pinnedCount = notifications.filter(n => n.isPinned).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications.title')}
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    !notification.isRead 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${
                      !notification.isRead ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <TypeIcon className="h-3 w-3" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                        {notification.isPinned && (
                          <Pin className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notification.createdAt.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/notifications">
                    <span className="text-xs">View all {notifications.length} notifications</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Unread: {unreadCount}</span>
            <span>Pinned: {pinnedCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationWidget; 