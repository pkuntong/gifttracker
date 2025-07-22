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
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Gift, 
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Person } from '@/types';
import { apiService } from '@/services/api';
import GiftPreferencesForm from '@/components/GiftPreferencesForm';

const People = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
    birthday: '',
    notes: ''
  });

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPeople();
      
      // Extract array from response (handle both direct arrays and objects with data property)
      const peopleData = Array.isArray(response) ? response : (response?.people || []);
      
      setPeople(peopleData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load people. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPerson) {
        await apiService.updatePerson(editingPerson.id, formData);
        toast({
          title: "Success",
          description: "Person updated successfully.",
        });
      } else {
        await apiService.createPerson(formData);
        toast({
          title: "Success",
          description: "Person added successfully.",
        });
      }
      
      setIsAddDialogOpen(false);
      setEditingPerson(null);
      resetForm();
      loadPeople();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save person. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return;
    
    try {
      await apiService.deletePerson(personId);
      toast({
        title: "Success",
        description: "Person deleted successfully.",
      });
      loadPeople();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete person. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email || '',
      relationship: person.relationship,
      birthday: person.birthday || '',
      notes: person.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      relationship: '',
      birthday: '',
      notes: ''
    });
  };

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRelationship === 'all' || person.relationship === filterRelationship;
    return matchesSearch && matchesFilter;
  });

  const relationships = ['Family', 'Friend', 'Colleague', 'Neighbor', 'Other'];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-left">People</h1>
            <p className="text-muted-foreground text-left">Manage your gift recipients</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRelationship} onValueChange={setFilterRelationship}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relationships</SelectItem>
                {relationships.map((rel) => (
                  <SelectItem key={rel} value={rel}>
                    {rel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* People Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading people...</p>
            </div>
          ) : filteredPeople.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No people found</h3>
                <p className="text-muted-foreground mb-4">
                  {people.length === 0 
                    ? "Start by adding your first person to track gifts for."
                    : "No people match your search criteria."
                  }
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Person
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPeople.map((person) => (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{person.name}</CardTitle>
                        <CardDescription>{person.email}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(person)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(person.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{person.relationship}</Badge>
                      {person.birthday && (
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          Birthday
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {person.notes && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {person.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">Gifts planned</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex gap-2">
                      <GiftPreferencesForm 
                        personId={person.id} 
                        personName={person.name}
                        onPreferencesUpdated={loadPeople}
                      />
                      <Button variant="outline" size="sm" className="flex-1">
                        <Gift className="w-4 h-4 mr-2" />
                        View Gifts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Person Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? 'Edit Person' : 'Add New Person'}
            </DialogTitle>
            <DialogDescription>
              {editingPerson ? 'Update person details below.' : 'Add a new person to your gift list.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this person..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingPerson(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPerson ? 'Update Person' : 'Add Person'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default People; 