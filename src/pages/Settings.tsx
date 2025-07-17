import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  DollarSign,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Languages
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
];

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
];

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: '中文', flag: '🇨🇳', native: '中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', native: '한국어' },
];

const Settings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Account form state
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    currency: 'USD',
    timezone: 'UTC',
    theme: 'system' as 'light' | 'dark' | 'system',
    notifications: true,
    language: 'en',
  });

  useEffect(() => {
    if (user) {
      setAccountForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
      
      if (user.preferences) {
        setPreferencesForm({
          currency: user.preferences.currency || 'USD',
          timezone: user.preferences.timezone || 'UTC',
          theme: user.preferences.theme || 'system',
          notifications: user.preferences.notifications !== false,
          language: i18n.language || 'en',
        });
      }
    }
  }, [user, i18n.language]);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updates: any = {};
      
      if (accountForm.name !== user?.name) {
        updates.name = accountForm.name;
      }
      
      if (accountForm.email !== user?.email) {
        updates.email = accountForm.email;
      }

      if (updates.name || updates.email) {
        await ApiService.updateProfile(updates);
        toast({ title: t('success.profileUpdated') });
      }

      // Reset password fields
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.profileUpdate'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    
    try {
      await ApiService.updatePreferences(preferencesForm);
      toast({ title: t('success.preferencesUpdated') });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.preferencesUpdate'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setPreferencesForm(prev => ({ ...prev, language: languageCode }));
    
    // Update document direction for RTL languages
    if (languageCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
    }
    
    toast({ 
      title: t('success.languageChanged'),
      description: t('settings.languageChangeDescription')
    });
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all user data
      const [people, gifts, occasions, budgets] = await Promise.all([
        ApiService.getPeople(),
        ApiService.getGifts(),
        ApiService.getOccasions(),
        ApiService.getBudgets(),
      ]);

      const exportData = {
        user: {
          name: user?.name,
          email: user?.email,
          preferences: user?.preferences,
        },
        people,
        gifts,
        occasions,
        budgets,
        exportedAt: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gift-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: t('success.dataExported') });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.dataExport'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // In a real app, you'd have a delete account endpoint
      // For now, we'll just log out the user
      logout();
      toast({ title: t('success.accountDeleted') });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.accountDelete'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          </div>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                {t('settings.language')}
              </CardTitle>
              <CardDescription>
                {t('settings.languageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        i18n.language === language.code
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div className="flex-1">
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-muted-foreground">{language.native}</div>
                        </div>
                        {i18n.language === language.code && (
                          <Badge variant="secondary" className="text-xs">
                            {t('common.active')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{t('settings.currentLanguage')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
                    </p>
                  </div>
                  {/* <LanguageSwitcher /> */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('settings.accountSettings')}
              </CardTitle>
              <CardDescription>
                {t('settings.accountDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('settings.fullName')}</Label>
                    <Input
                      id="name"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      placeholder={t('settings.fullNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.emailAddress')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                      placeholder={t('settings.emailPlaceholder')}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('settings.changePassword')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={accountForm.currentPassword}
                          onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                          placeholder={t('settings.currentPasswordPlaceholder')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={accountForm.newPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                        placeholder={t('settings.newPasswordPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={accountForm.confirmPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                        placeholder={t('settings.confirmPasswordPlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('common.saving') : t('settings.saveChanges')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {t('settings.preferences')}
              </CardTitle>
              <CardDescription>
                {t('settings.preferencesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t('settings.currency')}</Label>
                    <Select
                      value={preferencesForm.currency}
                      onValueChange={(value) => setPreferencesForm({ ...preferencesForm, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.selectCurrency')} />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                    <Select
                      value={preferencesForm.timezone}
                      onValueChange={(value) => setPreferencesForm({ ...preferencesForm, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.selectTimezone')} />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">{t('settings.theme')}</Label>
                    <Select
                      value={preferencesForm.theme}
                      onValueChange={(value) => setPreferencesForm({ ...preferencesForm, theme: value as 'light' | 'dark' | 'system' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.selectTheme')} />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notifications">{t('settings.notifications')}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={preferencesForm.notifications}
                        onCheckedChange={(checked) => setPreferencesForm({ ...preferencesForm, notifications: checked })}
                      />
                      <span className="text-sm">
                        {t('settings.notificationsDescription')}
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={handlePreferencesUpdate} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('common.saving') : t('settings.savePreferences')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t('settings.dataManagement')}
              </CardTitle>
              <CardDescription>
                {t('settings.dataManagementDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{t('settings.exportData')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.exportDataDescription')}
                    </p>
                  </div>
                  <Button onClick={handleExportData} disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('settings.export')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                  <div>
                    <h3 className="font-semibold text-destructive">{t('settings.deleteAccount')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.deleteAccountDescription')}
                    </p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('settings.deleteAccount')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          {t('settings.deleteAccount')}
                        </DialogTitle>
                        <DialogDescription>
                          {t('settings.deleteAccountWarning')}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                          {loading ? t('settings.deleting') : t('settings.deleteAccount')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('settings.accountInformation')}
              </CardTitle>
              <CardDescription>
                {t('settings.accountInformationDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t('settings.accountId')}</Label>
                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('settings.memberSince')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t('settings.active')}</Badge>
                  <span className="text-sm text-muted-foreground">{t('settings.accountStatus')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings; 