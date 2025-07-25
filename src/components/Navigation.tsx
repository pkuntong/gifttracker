import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Gift,
  Users,
  Calendar,
  DollarSign, 
  Settings,
  Bell,
  LogOut,
  BarChart3,
  Lightbulb,
  Search,
  Database,
  Heart,
  Sparkles,
  Truck,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from './LanguageSwitcher';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    toast({
      title: t('auth.signOut'),
      description: t('success.logout'),
    });
  };

  const navItems = [
    { path: '/app/dashboard', label: t('navigation.dashboard'), icon: Home },
    { path: '/app/gifts', label: t('navigation.gifts'), icon: Gift },
    { path: '/app/people', label: t('navigation.people'), icon: Users },
    { path: '/app/occasions', label: t('navigation.occasions'), icon: Calendar },
    { path: '/app/recommendations', label: t('navigation.recommendations'), icon: Target },
    { path: '/app/tracking', label: t('navigation.tracking'), icon: Truck },
    { path: '/app/budgets', label: t('navigation.budgets'), icon: DollarSign },
    { path: '/app/families', label: t('navigation.families'), icon: Users },
    { path: '/app/notifications', label: t('navigation.notifications'), icon: Bell },
    { path: '/app/analytics', label: t('navigation.analytics'), icon: BarChart3 },
    { path: '/app/gift-ideas', label: t('navigation.giftIdeas'), icon: Lightbulb },
    { path: '/app/wishlists', label: t('navigation.wishlists'), icon: Heart },
    { path: '/app/reminders', label: t('navigation.reminders'), icon: Bell },
    { path: '/app/search', label: t('navigation.search'), icon: Search },
    { path: '/app/data', label: t('navigation.data'), icon: Database },
    { path: '/app/settings', label: t('navigation.settings'), icon: Settings },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">GiftTracker</h1>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to={item.path}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.welcome')},</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 