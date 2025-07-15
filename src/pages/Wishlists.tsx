import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Share2, Users, Eye, Edit, Trash2, Heart, ShoppingCart, MessageSquare, Calendar, DollarSign, Tag, Star, MoreHorizontal, Copy, Link, Settings, UserPlus, Activity, BarChart3 } from 'lucide-react';
import { ApiService } from '@/services/api';
import { Wishlist, WishlistItem, WishlistCollaborator, WishlistActivity } from '@/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Wishlists: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [newWishlist, setNewWishlist] = useState({
    name: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
    settings: {
      allowComments: true,
      allowPurchases: true,
      showPrices: true,
      allowDuplicates: false,
    },
  });

  const [shareSettings, setShareSettings] = useState({
    shareType: 'public' as const,
    password: '',
    expiresAt: '',
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'contributor' | 'admin'>('viewer');

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getWishlists();
      setWishlists(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('wishlists.loadError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWishlist = async () => {
    try {
      const created = await ApiService.createWishlist(newWishlist);
      setWishlists(prev => [created, ...prev]);
      setShowCreateDialog(false);
      setNewWishlist({
        name: '',
        description: '',
        isPublic: false,
        isCollaborative: false,
        settings: {
          allowComments: true,
          allowPurchases: true,
          showPrices: true,
          allowDuplicates: false,
        },
      });
      toast({
        title: t('success'),
        description: t('wishlists.created'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('wishlists.createError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    try {
      await ApiService.deleteWishlist(id);
      setWishlists(prev => prev.filter(w => w.id !== id));
      if (selectedWishlist?.id === id) {
        setSelectedWishlist(null);
      }
      toast({
        title: t('success'),
        description: t('wishlists.deleted'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('wishlists.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleShareWishlist = async () => {
    if (!selectedWishlist) return;
    
    try {
      const share = await ApiService.shareWishlist(
        selectedWishlist.id,
        shareSettings.shareType,
        {
          password: shareSettings.password || undefined,
          expiresAt: shareSettings.expiresAt || undefined,
        }
      );
      
      toast({
        title: t('success'),
        description: t('wishlists.shared'),
      });
      setShowShareDialog(false);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('wishlists.shareError'),
        variant: 'destructive',
      });
    }
  };

  const handleInviteCollaborator = async () => {
    if (!selectedWishlist) return;
    
    try {
      await ApiService.inviteWishlistCollaborator(
        selectedWishlist.id,
        inviteEmail,
        inviteRole
      );
      
      toast({
        title: t('success'),
        description: t('wishlists.invitationSent'),
      });
      setInviteEmail('');
      setInviteRole('viewer');
    } catch (error) {
      toast({
        title: t('error'),
        description: t('wishlists.inviteError'),
        variant: 'destructive',
      });
    }
  };

  const filteredWishlists = wishlists.filter(wishlist => {
    const matchesSearch = wishlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wishlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'public' && wishlist.isPublic) ||
                         (filterStatus === 'collaborative' && wishlist.isCollaborative);
    return matchesSearch && matchesFilter;
  });

  const sortedWishlists = [...filteredWishlists].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'items':
        return b.items.length - a.items.length;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'purchased': return 'bg-blue-100 text-blue-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Wishlist List */}
        <div className="lg:w-1/3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{t('wishlists.title')}</h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('wishlists.create')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('wishlists.createNew')}</DialogTitle>
                  <DialogDescription>
                    {t('wishlists.createDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('wishlists.name')}</Label>
                    <Input
                      id="name"
                      value={newWishlist.name}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('wishlists.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('wishlists.description')}</Label>
                    <Textarea
                      id="description"
                      value={newWishlist.description}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('wishlists.descriptionPlaceholder')}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={newWishlist.isPublic}
                      onCheckedChange={(checked) => setNewWishlist(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic">{t('wishlists.public')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isCollaborative"
                      checked={newWishlist.isCollaborative}
                      onCheckedChange={(checked) => setNewWishlist(prev => ({ ...prev, isCollaborative: checked }))}
                    />
                    <Label htmlFor="isCollaborative">{t('wishlists.collaborative')}</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={handleCreateWishlist} disabled={!newWishlist.name}>
                      {t('create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('wishlists.searchPlaceholder')}
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
                  <SelectItem value="all">{t('wishlists.allWishlists')}</SelectItem>
                  <SelectItem value="public">{t('wishlists.publicOnly')}</SelectItem>
                  <SelectItem value="collaborative">{t('wishlists.collaborativeOnly')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">{t('wishlists.sortByUpdated')}</SelectItem>
                  <SelectItem value="created">{t('wishlists.sortByCreated')}</SelectItem>
                  <SelectItem value="name">{t('wishlists.sortByName')}</SelectItem>
                  <SelectItem value="items">{t('wishlists.sortByItems')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wishlist List */}
          <div className="space-y-3">
            {sortedWishlists.map((wishlist) => (
              <Card
                key={wishlist.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWishlist?.id === wishlist.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedWishlist(wishlist)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{wishlist.name}</CardTitle>
                      {wishlist.description && (
                        <CardDescription className="mt-1">
                          {wishlist.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {wishlist.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {t('wishlists.public')}
                        </Badge>
                      )}
                      {wishlist.isCollaborative && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {t('wishlists.collaborative')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>{wishlist.items.length} {t('wishlists.items')}</span>
                      <span>{wishlist.collaborators.length} {t('wishlists.collaborators')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWishlist(wishlist);
                          setShowShareDialog(true);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWishlist(wishlist.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel - Wishlist Details */}
        {selectedWishlist && (
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedWishlist.name}</h2>
                {selectedWishlist.description && (
                  <p className="text-muted-foreground mt-1">{selectedWishlist.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStatsDialog(true)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('wishlists.stats')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowActivityDialog(true)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {t('wishlists.activity')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCollaboratorsDialog(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('wishlists.collaborators')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t('wishlists.share')}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t('wishlists.overview')}</TabsTrigger>
                <TabsTrigger value="items">{t('wishlists.items')}</TabsTrigger>
                <TabsTrigger value="settings">{t('wishlists.settings')}</TabsTrigger>
                <TabsTrigger value="activity">{t('wishlists.activity')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('wishlists.totalItems')}</CardTitle>
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedWishlist.items.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('wishlists.availableItems')}</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedWishlist.items.filter(item => item.status === 'available').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('wishlists.purchasedItems')}</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedWishlist.items.filter(item => item.status === 'purchased').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('wishlists.totalValue')}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${selectedWishlist.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('wishlists.recentItems')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedWishlist.items.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">${item.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(item.status)}>
                              {t(`wishlists.status.${item.status}`)}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              {t(`wishlists.priority.${item.priority}`)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-6">
                {/* Items List */}
                <div className="space-y-4">
                  {selectedWishlist.items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold">{item.title}</h3>
                                <Badge className={getPriorityColor(item.priority)}>
                                  {t(`wishlists.priority.${item.priority}`)}
                                </Badge>
                                <Badge className={getStatusColor(item.status)}>
                                  {t(`wishlists.status.${item.status}`)}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-muted-foreground mb-2">{item.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>${item.price}</span>
                                <span>{item.category}</span>
                                {item.store && <span>{item.store}</span>}
                              </div>
                              {item.tags.length > 0 && (
                                <div className="flex items-center space-x-2 mt-2">
                                  {item.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.purchaseUrl && (
                              <Button variant="outline" size="sm">
                                <Link className="w-4 h-4 mr-2" />
                                {t('wishlists.view')}
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {item.comments.length}
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('wishlists.generalSettings')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('wishlists.allowComments')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('wishlists.allowCommentsDescription')}
                        </p>
                      </div>
                      <Switch checked={selectedWishlist.settings.allowComments} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('wishlists.allowPurchases')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('wishlists.allowPurchasesDescription')}
                        </p>
                      </div>
                      <Switch checked={selectedWishlist.settings.allowPurchases} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('wishlists.showPrices')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('wishlists.showPricesDescription')}
                        </p>
                      </div>
                      <Switch checked={selectedWishlist.settings.showPrices} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('wishlists.allowDuplicates')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('wishlists.allowDuplicatesDescription')}
                        </p>
                      </div>
                      <Switch checked={selectedWishlist.settings.allowDuplicates} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('wishlists.recentActivity')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Activity items would be loaded here */}
                      <div className="text-center text-muted-foreground py-8">
                        {t('wishlists.noActivity')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wishlists.shareWishlist')}</DialogTitle>
            <DialogDescription>
              {t('wishlists.shareDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('wishlists.shareType')}</Label>
              <Select value={shareSettings.shareType} onValueChange={(value: any) => setShareSettings(prev => ({ ...prev, shareType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t('wishlists.public')}</SelectItem>
                  <SelectItem value="private">{t('wishlists.private')}</SelectItem>
                  <SelectItem value="collaborative">{t('wishlists.collaborative')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {shareSettings.shareType === 'private' && (
              <div>
                <Label>{t('wishlists.password')}</Label>
                <Input
                  type="password"
                  value={shareSettings.password}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t('wishlists.passwordPlaceholder')}
                />
              </div>
            )}
            <div>
              <Label>{t('wishlists.expiresAt')}</Label>
              <Input
                type="datetime-local"
                value={shareSettings.expiresAt}
                onChange={(e) => setShareSettings(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleShareWishlist}>
                {t('wishlists.share')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaborators Dialog */}
      <Dialog open={showCollaboratorsDialog} onOpenChange={setShowCollaboratorsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('wishlists.collaborators')}</DialogTitle>
            <DialogDescription>
              {t('wishlists.collaboratorsDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('wishlists.inviteEmail')}</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('wishlists.emailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('wishlists.role')}</Label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">{t('wishlists.roleViewer')}</SelectItem>
                  <SelectItem value="contributor">{t('wishlists.roleContributor')}</SelectItem>
                  <SelectItem value="admin">{t('wishlists.roleAdmin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCollaboratorsDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleInviteCollaborator} disabled={!inviteEmail}>
                {t('wishlists.invite')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('wishlists.activity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Activity timeline would be loaded here */}
            <div className="text-center text-muted-foreground py-8">
              {t('wishlists.noActivity')}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('wishlists.statistics')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Statistics would be loaded here */}
            <div className="text-center text-muted-foreground py-8">
              {t('wishlists.noStats')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wishlists; 