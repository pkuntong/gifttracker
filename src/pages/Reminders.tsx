import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Bell, Clock, CheckCircle, XCircle, AlertTriangle, Settings, Smartphone, Mail, MessageSquare, BarChart3, MoreHorizontal, Edit, Trash2, Copy, Zap, Eye, EyeOff } from 'lucide-react';
import { ApiService } from '@/services/api';
import { Reminder, ReminderTemplate, ReminderRule, NotificationPreferences, SmartReminder, ReminderChannel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Reminders: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [smartReminders, setSmartReminders] = useState<SmartReminder[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('scheduled');
  const [activeTab, setActiveTab] = useState('reminders');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Form states
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    type: 'custom' as Reminder['type'],
    priority: 'medium' as Reminder['priority'],
    status: 'pending' as Reminder['status'],
    scheduledFor: '',
    channels: [] as ReminderChannel[],
    relatedData: {},
    repeatSettings: {
      frequency: 'once' as const,
      interval: 1,
      endDate: '',
      maxOccurrences: undefined as number | undefined,
    },
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'custom' as ReminderTemplate['type'],
    title: '',
    message: '',
    defaultAdvanceNotice: 60,
    defaultChannels: ['email', 'in_app'] as ReminderChannel['type'][],
    isSystem: false,
  });

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    conditions: {
      occasionType: [],
      daysInAdvance: 7,
      giftStatus: [],
      budgetThreshold: 0,
      personId: [],
    },
    actions: {
      createReminder: true,
      reminderTemplate: '',
      advanceNotice: 60,
      channels: ['email', 'in_app'] as ReminderChannel['type'][],
    },
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [remindersData, templatesData, rulesData, smartData, prefsData] = await Promise.all([
        ApiService.getReminders(),
        ApiService.getReminderTemplates(),
        ApiService.getReminderRules(),
        ApiService.getSmartReminders(),
        ApiService.getNotificationPreferences(),
      ]);
      
      setReminders(remindersData);
      setTemplates(templatesData);
      setRules(rulesData);
      setSmartReminders(smartData);
      setPreferences(prefsData);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.loadError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReminder = async () => {
    try {
      const created = await ApiService.createReminder(newReminder);
      setReminders(prev => [created, ...prev]);
      setShowCreateDialog(false);
      setNewReminder({
        title: '',
        description: '',
        type: 'custom',
        priority: 'medium',
        status: 'pending',
        scheduledFor: '',
        channels: [],
        relatedData: {},
        repeatSettings: {
          frequency: 'once',
          interval: 1,
          endDate: '',
          maxOccurrences: undefined,
        },
      });
      toast({
        title: t('success'),
        description: t('reminders.created'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.createError'),
        variant: 'destructive',
      });
    }
  };

  const handleDismissReminder = async (id: string) => {
    try {
      await ApiService.dismissReminder(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
      toast({
        title: t('success'),
        description: t('reminders.dismissed'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.dismissError'),
        variant: 'destructive',
      });
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await ApiService.completeReminder(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
      toast({
        title: t('success'),
        description: t('reminders.completed'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.completeError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await ApiService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast({
        title: t('success'),
        description: t('reminders.deleted'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const created = await ApiService.createReminderTemplate(newTemplate);
      setTemplates(prev => [created, ...prev]);
      setShowTemplateDialog(false);
      setNewTemplate({
        name: '',
        description: '',
        type: 'custom',
        title: '',
        message: '',
        defaultAdvanceNotice: 60,
        defaultChannels: ['email', 'in_app'],
        isSystem: false,
      });
      toast({
        title: t('success'),
        description: t('reminders.templateCreated'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.templateCreateError'),
        variant: 'destructive',
      });
    }
  };

  const handleCreateRule = async () => {
    try {
      const created = await ApiService.createReminderRule(newRule);
      setRules(prev => [created, ...prev]);
      setShowRuleDialog(false);
      setNewRule({
        name: '',
        description: '',
        conditions: {
          occasionType: [],
          daysInAdvance: 7,
          giftStatus: [],
          budgetThreshold: 0,
          personId: [],
        },
        actions: {
          createReminder: true,
          reminderTemplate: '',
          advanceNotice: 60,
          channels: ['email', 'in_app'],
        },
        isActive: true,
      });
      toast({
        title: t('success'),
        description: t('reminders.ruleCreated'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.ruleCreateError'),
        variant: 'destructive',
      });
    }
  };

  const handleDismissSmartReminder = async (id: string) => {
    try {
      await ApiService.dismissSmartReminder(id);
      setSmartReminders(prev => prev.map(r => r.id === id ? { ...r, isDismissed: true } : r));
      toast({
        title: t('success'),
        description: t('reminders.smartReminderDismissed'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('reminders.smartReminderDismissError'),
        variant: 'destructive',
      });
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reminder.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reminder.status === filterStatus;
    const matchesType = filterType === 'all' || reminder.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    switch (sortBy) {
      case 'scheduled':
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
      case 'priority': {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'occasion': return Calendar;
      case 'gift_deadline': return Clock;
      case 'budget_alert': return AlertTriangle;
      case 'shipping_deadline': return Bell;
      case 'custom': return Settings;
      default: return Bell;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('reminders.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('reminders.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowStatsDialog(true)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('reminders.stats')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreferencesDialog(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('reminders.preferences')}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('reminders.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('reminders.createNew')}</DialogTitle>
                <DialogDescription>
                  {t('reminders.createDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('reminders.title')}</Label>
                  <Input
                    id="title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('reminders.titlePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t('reminders.description')}</Label>
                  <Textarea
                    id="description"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('reminders.descriptionPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('reminders.type')}</Label>
                    <Select value={newReminder.type} onValueChange={(value: "custom" | "occasion" | "gift_deadline" | "budget_alert" | "shipping_deadline") => setNewReminder(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="occasion">{t('reminders.typeOccasion')}</SelectItem>
                        <SelectItem value="gift_deadline">{t('reminders.typeGiftDeadline')}</SelectItem>
                        <SelectItem value="budget_alert">{t('reminders.typeBudgetAlert')}</SelectItem>
                        <SelectItem value="shipping_deadline">{t('reminders.typeShippingDeadline')}</SelectItem>
                        <SelectItem value="custom">{t('reminders.typeCustom')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('reminders.priority')}</Label>
                    <Select value={newReminder.priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setNewReminder(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('reminders.priorityLow')}</SelectItem>
                        <SelectItem value="medium">{t('reminders.priorityMedium')}</SelectItem>
                        <SelectItem value="high">{t('reminders.priorityHigh')}</SelectItem>
                        <SelectItem value="urgent">{t('reminders.priorityUrgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{t('reminders.scheduledFor')}</Label>
                  <Input
                    type="datetime-local"
                    value={newReminder.scheduledFor}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleCreateReminder} disabled={!newReminder.title || !newReminder.scheduledFor}>
                    {t('create')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('reminders.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('reminders.allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('reminders.statusPending')}</SelectItem>
              <SelectItem value="sent">{t('reminders.statusSent')}</SelectItem>
              <SelectItem value="dismissed">{t('reminders.statusDismissed')}</SelectItem>
              <SelectItem value="completed">{t('reminders.statusCompleted')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('reminders.allTypes')}</SelectItem>
              <SelectItem value="occasion">{t('reminders.typeOccasion')}</SelectItem>
              <SelectItem value="gift_deadline">{t('reminders.typeGiftDeadline')}</SelectItem>
              <SelectItem value="budget_alert">{t('reminders.typeBudgetAlert')}</SelectItem>
              <SelectItem value="shipping_deadline">{t('reminders.typeShippingDeadline')}</SelectItem>
              <SelectItem value="custom">{t('reminders.typeCustom')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">{t('reminders.sortByScheduled')}</SelectItem>
              <SelectItem value="priority">{t('reminders.sortByPriority')}</SelectItem>
              <SelectItem value="created">{t('reminders.sortByCreated')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reminders">{t('reminders.reminders')}</TabsTrigger>
          <TabsTrigger value="templates">{t('reminders.templates')}</TabsTrigger>
          <TabsTrigger value="rules">{t('reminders.rules')}</TabsTrigger>
          <TabsTrigger value="smart">{t('reminders.smartReminders')}</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-6">
          {/* Reminders List */}
          <div className="space-y-4">
            {sortedReminders.map((reminder) => {
              const TypeIcon = getTypeIcon(reminder.type);
              return (
                <Card key={reminder.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <TypeIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{reminder.title}</h3>
                            <Badge className={getStatusColor(reminder.status)}>
                              {t(`reminders.status.${reminder.status}`)}
                            </Badge>
                            <Badge className={getPriorityColor(reminder.priority)}>
                              {t(`reminders.priority.${reminder.priority}`)}
                            </Badge>
                          </div>
                          {reminder.description && (
                            <p className="text-muted-foreground mb-2">{reminder.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{format(new Date(reminder.scheduledFor), 'PPP p')}</span>
                            <span>{t(`reminders.type.${reminder.type}`)}</span>
                            {reminder.channels.length > 0 && (
                              <span>{reminder.channels.length} {t('reminders.channels')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {reminder.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteReminder(reminder.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t('reminders.complete')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissReminder(reminder.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {t('reminders.dismiss')}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('reminders.templates')}</h2>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('reminders.createTemplate')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('reminders.createTemplate')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('reminders.templateName')}</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('reminders.templateNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('reminders.templateDescription')}</Label>
                    <Textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('reminders.templateDescriptionPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('reminders.templateType')}</Label>
                      <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="occasion">{t('reminders.typeOccasion')}</SelectItem>
                          <SelectItem value="gift_deadline">{t('reminders.typeGiftDeadline')}</SelectItem>
                          <SelectItem value="budget_alert">{t('reminders.typeBudgetAlert')}</SelectItem>
                          <SelectItem value="shipping_deadline">{t('reminders.typeShippingDeadline')}</SelectItem>
                          <SelectItem value="custom">{t('reminders.typeCustom')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('reminders.advanceNotice')}</Label>
                      <Input
                        type="number"
                        value={newTemplate.defaultAdvanceNotice}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, defaultAdvanceNotice: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t('reminders.templateTitle')}</Label>
                    <Input
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('reminders.templateTitlePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('reminders.templateMessage')}</Label>
                    <Textarea
                      value={newTemplate.message}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t('reminders.templateMessagePlaceholder')}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.title}>
                      {t('create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('reminders.type')}</span>
                      <Badge variant="outline">{t(`reminders.type.${template.type}`)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('reminders.advanceNotice')}</span>
                      <span className="text-sm text-muted-foreground">{template.defaultAdvanceNotice} {t('reminders.minutes')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('reminders.channels')}</span>
                      <div className="flex space-x-1">
                        {template.defaultChannels.map((channel) => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {t(`reminders.channel.${channel}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('reminders.rules')}</h2>
            <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('reminders.createRule')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('reminders.createRule')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('reminders.ruleName')}</Label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('reminders.ruleNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('reminders.ruleDescription')}</Label>
                    <Textarea
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('reminders.ruleDescriptionPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('reminders.daysInAdvance')}</Label>
                      <Input
                        type="number"
                        value={newRule.conditions.daysInAdvance}
                        onChange={(e) => setNewRule(prev => ({ 
                          ...prev, 
                          conditions: { ...prev.conditions, daysInAdvance: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>{t('reminders.advanceNotice')}</Label>
                      <Input
                        type="number"
                        value={newRule.actions.advanceNotice}
                        onChange={(e) => setNewRule(prev => ({ 
                          ...prev, 
                          actions: { ...prev.actions, advanceNotice: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={newRule.isActive}
                      onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">{t('reminders.ruleActive')}</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={handleCreateRule} disabled={!newRule.name}>
                      {t('create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      {rule.description && (
                        <p className="text-muted-foreground mt-1">{rule.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? t('reminders.active') : t('reminders.inactive')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {rule.conditions.daysInAdvance} {t('reminders.daysInAdvance')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="smart" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('reminders.smartReminders')}</h2>
          </div>
          <div className="space-y-4">
            {smartReminders.filter(r => !r.isDismissed).map((smartReminder) => (
              <Card key={smartReminder.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Zap className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{smartReminder.title}</h3>
                          <Badge className={getPriorityColor(smartReminder.priority)}>
                            {t(`reminders.priority.${smartReminder.priority}`)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{smartReminder.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{format(new Date(smartReminder.scheduledFor), 'PPP p')}</span>
                          <span>{t(`reminders.smartType.${smartReminder.type}`)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismissSmartReminder(smartReminder.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t('reminders.dismiss')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preferences Dialog */}
      <Dialog open={showPreferencesDialog} onOpenChange={setShowPreferencesDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('reminders.notificationPreferences')}</DialogTitle>
            <DialogDescription>
              {t('reminders.preferencesDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {preferences && (
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    {t('reminders.email')}
                  </TabsTrigger>
                  <TabsTrigger value="push">
                    <Bell className="w-4 h-4 mr-2" />
                    {t('reminders.push')}
                  </TabsTrigger>
                  <TabsTrigger value="sms">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('reminders.sms')}
                  </TabsTrigger>
                  <TabsTrigger value="inApp">
                    <Smartphone className="w-4 h-4 mr-2" />
                    {t('reminders.inApp')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={preferences.email.enabled} />
                    <Label>{t('reminders.enableEmail')}</Label>
                  </div>
                  <div>
                    <Label>{t('reminders.emailFrequency')}</Label>
                    <Select value={preferences.email.frequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">{t('reminders.immediate')}</SelectItem>
                        <SelectItem value="daily">{t('reminders.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('reminders.weekly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="push" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={preferences.push.enabled} />
                    <Label>{t('reminders.enablePush')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={preferences.push.sound} />
                    <Label>{t('reminders.pushSound')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={preferences.push.vibration} />
                    <Label>{t('reminders.pushVibration')}</Label>
                  </div>
                </TabsContent>
                <TabsContent value="sms" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={preferences.sms.enabled} />
                    <Label>{t('reminders.enableSms')}</Label>
                  </div>
                  <div>
                    <Label>{t('reminders.phoneNumber')}</Label>
                    <Input value={preferences.sms.phoneNumber || ''} placeholder="+1234567890" />
                  </div>
                </TabsContent>
                <TabsContent value="inApp" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={preferences.inApp.enabled} />
                    <Label>{t('reminders.enableInApp')}</Label>
                  </div>
                  <div>
                    <Label>{t('reminders.notificationPosition')}</Label>
                    <Select value={preferences.inApp.position}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-right">{t('reminders.topRight')}</SelectItem>
                        <SelectItem value="top-left">{t('reminders.topLeft')}</SelectItem>
                        <SelectItem value="bottom-right">{t('reminders.bottomRight')}</SelectItem>
                        <SelectItem value="bottom-left">{t('reminders.bottomLeft')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPreferencesDialog(false)}>
                {t('cancel')}
              </Button>
              <Button>
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('reminders.reminderStatistics')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reminders.length}</div>
                  <div className="text-sm text-muted-foreground">{t('reminders.totalReminders')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {reminders.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('reminders.pendingReminders')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {reminders.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('reminders.completedReminders')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {smartReminders.filter(r => !r.isDismissed).length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('reminders.activeSmartReminders')}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reminders; 