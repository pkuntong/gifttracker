import React, { useState, useEffect } from 'react';
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
import { Calendar, Plus, Edit, Trash2, Search, Filter, Gift, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Occasion, Person } from '@/types';
import { ApiService } from '@/services/api';
import Navigation from '@/components/Navigation';

const occasionTypes = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'other', label: 'Other' },
];

const Occasions = () => {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);

  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: '',
    personId: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [occasionsData, peopleData] = await Promise.all([
        ApiService.getOccasions(),
        ApiService.getPeople(),
      ]);
      setOccasions(occasionsData);
      setPeople(peopleData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load occasions or people.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        type: formData.type as 'birthday' | 'anniversary' | 'holiday' | 'other',
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        personId: formData.personId === 'none' ? undefined : formData.personId,
      };

      if (editingOccasion) {
        await ApiService.updateOccasion(editingOccasion.id, submitData);
        toast({ title: 'Occasion updated!' });
      } else {
        await ApiService.createOccasion(submitData);
        toast({ title: 'Occasion added!' });
      }
      setIsDialogOpen(false);
      setEditingOccasion(null);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save occasion.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (occasionId: string) => {
    if (!confirm('Are you sure you want to delete this occasion?')) return;
    try {
      await ApiService.deleteOccasion(occasionId);
      toast({ title: 'Occasion deleted!' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete occasion.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (occasion: Occasion) => {
    setEditingOccasion(occasion);
    setFormData({
      name: occasion.name,
      date: occasion.date,
      type: occasion.type,
      personId: occasion.personId || 'none',
      description: occasion.description || '',
      budget: occasion.budget ? occasion.budget.toString() : '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      type: '',
      personId: 'none',
      description: '',
      budget: '',
    });
  };

  const filteredOccasions = occasions.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || o.type === filterType;
    return matchesSearch && matchesType;
  });

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    return person ? person.name : '—';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Occasions</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Occasion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}</DialogTitle>
                  <DialogDescription>
                    Add a birthday, anniversary, holiday, or other special event.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Occasion Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Mom's Birthday"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="personId">Person</Label>
                      <Select
                        value={formData.personId}
                        onValueChange={(value) => setFormData({ ...formData, personId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="(Optional) Link to person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {people.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Special notes, gift ideas, etc."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setEditingOccasion(null);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingOccasion ? 'Update' : 'Add'} Occasion
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search occasions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {occasionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occasions Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading occasions...</p>
            </div>
          ) : filteredOccasions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No occasions found</h3>
                <p className="text-muted-foreground mb-4">
                  {occasions.length === 0
                    ? 'Start by adding your first occasion.'
                    : 'No occasions match your search criteria.'}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Occasion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOccasions.map((occasion) => (
                <Card key={occasion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{occasion.name}</CardTitle>
                        <CardDescription>
                          {occasion.type.charAt(0).toUpperCase() + occasion.type.slice(1)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(occasion)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(occasion.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{occasion.type}</Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(occasion.date).toLocaleDateString()}
                      </Badge>
                      {occasion.personId && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {getPersonName(occasion.personId)}
                        </Badge>
                      )}
                      {occasion.budget && (
                        <Badge variant="outline">
                          Budget: ${occasion.budget}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {occasion.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {occasion.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Occasions; 