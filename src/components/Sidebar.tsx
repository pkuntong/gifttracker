import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Gift,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Search,
  Bell,
  CreditCard,
  FileText,
  Heart,
  ShoppingCart,
  Target,
  Zap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: t('auth.signOut'),
      description: t('success.logout'),
    });
  };

  const navItems = [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: Home },
    { path: '/gifts', label: t('navigation.gifts'), icon: Gift },
    { path: '/people', label: t('navigation.people'), icon: Users },
    { path: '/occasions', label: t('navigation.occasions'), icon: Calendar },
    { path: '/recommendations', label: t('navigation.recommendations'), icon: Target },
    { path: '/analytics', label: t('navigation.analytics'), icon: BarChart3 },
    { path: '/search', label: t('navigation.search'), icon: Search },
    { path: '/notifications', label: t('navigation.notifications'), icon: Bell },
    { path: '/billing', label: t('navigation.billing'), icon: CreditCard },
    { path: '/settings', label: t('navigation.settings'), icon: Settings },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/dashboard" className="flex items-center gap-3">
          <Gift className="w-8 h-8 text-primary flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold">GiftTracker</h1>
          )}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Link to={item.path}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('common.welcome')},</span>
            <span className="font-medium truncate">{user?.name}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!isCollapsed && <LanguageSwitcher />}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className={cn(
              "flex-1",
              isCollapsed && "flex-none px-2"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && (
              <span className="ml-2">{t('auth.signOut')}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 