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
import { Textarea } from '@/components/ui/textarea';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle,
  Package,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Gift as GiftType, Person } from '@/types';
import { ApiService } from '@/services/api';

const Gifts = () => {
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftType | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    status: 'planned' as 'planned' | 'purchased' | 'wrapped' | 'given',
    recipientId: '',
    occasionId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [giftsData, peopleData] = await Promise.all([
        ApiService.getGifts(),
        ApiService.getPeople()
      ]);
      setGifts(giftsData);
      setPeople(peopleData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGift) {
        await ApiService.updateGift(editingGift.id, {
          ...formData,
          price: parseFloat(formData.price),
        });
        toast({
          title: "Success",
          description: "Gift updated successfully.",
        });
      } else {
        await ApiService.createGift({
          ...formData,
          price: parseFloat(formData.price),
        });
        toast({
          title: "Success",
          description: "Gift added successfully.",
        });
      }
      
      setIsAddDialogOpen(false);
      setEditingGift(null);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save gift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!confirm('Are you sure you want to delete this gift?')) return;
    
    try {
      await ApiService.deleteGift(giftId);
      toast({
        title: "Success",
        description: "Gift deleted successfully.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (gift: GiftType) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      description: gift.description || '',
      price: gift.price.toString(),
      currency: gift.currency,
      status: gift.status,
      recipientId: gift.recipientId,
      occasionId: gift.occasionId || '',
      notes: gift.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      status: 'planned',
      recipientId: '',
      occasionId: '',
      notes: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Gift className="w-4 h-4" />;
      case 'purchased':
        return <Package className="w-4 h-4" />;
      case 'wrapped':
        return <Heart className="w-4 h-4" />;
      case 'given':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'purchased':
        return 'bg-yellow-100 text-yellow-800';
      case 'wrapped':
        return 'bg-purple-100 text-purple-800';
      case 'given':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || gift.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getRecipientName = (recipientId: string) => {
    const person = people.find(p => p.id === recipientId);
    return person?.name || 'Unknown';
  };

  const totalValue = gifts.reduce((sum, gift) => sum + gift.price, 0);
  const purchasedValue = gifts
    .filter(gift => gift.status === 'purchased' || gift.status === 'wrapped' || gift.status === 'given')
    .reduce((sum, gift) => sum + gift.price, 0);

  const statuses = [
    { value: 'planned', label: 'Planned' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'wrapped', label: 'Wrapped' },
    { value: 'given', label: 'Given' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gifts</h1>
            <p className="text-muted-foreground">Manage your gift list and track purchases</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Gift
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gifts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all people
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Planned gifts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${purchasedValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Purchased gifts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gifts Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading gifts...</p>
            </div>
          ) : filteredGifts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No gifts found</h3>
                <p className="text-muted-foreground mb-4">
                  {gifts.length === 0 
                    ? "Start by adding your first gift to track."
                    : "No gifts match your search criteria."
                  }
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Gift
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGifts.map((gift) => (
                <Card key={gift.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{gift.name}</CardTitle>
                        <CardDescription>
                          For {getRecipientName(gift.recipientId)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(gift)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gift.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(gift.status)}>
                        {getStatusIcon(gift.status)}
                        <span className="ml-1">{gift.status}</span>
                      </Badge>
                      <Badge variant="outline">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {gift.currency} {gift.price}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {gift.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {gift.description}
                      </p>
                    )}
                    {gift.notes && (
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>Notes:</strong> {gift.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Added</span>
                      <span className="font-medium">
                        {new Date(gift.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Gift Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingGift ? 'Edit Gift' : 'Add New Gift'}
            </DialogTitle>
            <DialogDescription>
              {editingGift ? 'Update gift details below.' : 'Add a new gift to your list.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Gift Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter gift name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'planned' | 'purchased' | 'wrapped' | 'given') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient *</Label>
              <Select value={formData.recipientId} onValueChange={(value) => setFormData({ ...formData, recipientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the gift..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingGift(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGift ? 'Update Gift' : 'Add Gift'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gifts; 