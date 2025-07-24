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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Mail,
  Crown,
  Shield,
  User,
  Settings,
  Gift,
  Calendar,
  DollarSign,
  Copy,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Family, FamilyMember, Person, Gift as GiftType, Occasion, Budget } from '@/types';
import { apiService } from '@/services/api';

const memberRoles = [
  { value: 'owner', label: 'Owner', icon: Crown, description: 'Full control over family' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Manage family and members' },
  { value: 'member', label: 'Member', icon: User, description: 'View and contribute' },
];

const Families = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);

  // Form state
  const [familyForm, setFamilyForm] = useState({
    name: '',
    description: '',
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'owner' | 'admin' | 'member',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [familiesData, peopleData, giftsData, occasionsData, budgetsData] = await Promise.all([
        apiService.getFamilies(),
        apiService.getPeople(),
        apiService.getGifts(),
        apiService.getOccasions(),
        apiService.getBudgets(),
      ]);
      
      // Safely extract arrays from API responses
      const families = Array.isArray(familiesData) ? familiesData : (familiesData?.families || familiesData?.data || []);
      const people = Array.isArray(peopleData) ? peopleData : (peopleData?.people || peopleData?.data || []);
      const gifts = Array.isArray(giftsData) ? giftsData : (giftsData?.gifts || giftsData?.data || []);
      const occasions = Array.isArray(occasionsData) ? occasionsData : (occasionsData?.occasions || occasionsData?.data || []);
      const budgets = Array.isArray(budgetsData) ? budgetsData : (budgetsData?.budgets || budgetsData?.data || []);
      
      setFamilies(families);
      setPeople(people);
      setGifts(gifts);
      setOccasions(occasions);
      setBudgets(budgets);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load family data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createFamily({
        ...familyForm,
        members: [],
      });
      toast({ title: 'Family created successfully!' });
      setIsCreateDialogOpen(false);
      setFamilyForm({ name: '', description: '' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create family.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFamily) return;
    
    try {
      await apiService.updateFamily(editingFamily.id, familyForm);
      toast({ title: 'Family updated successfully!' });
      setIsCreateDialogOpen(false);
      setEditingFamily(null);
      setFamilyForm({ name: '', description: '' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update family.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (!confirm('Are you sure you want to delete this family? This action cannot be undone.')) return;
    
    try {
      await apiService.deleteFamily(familyId);
      toast({ title: 'Family deleted successfully!' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete family.',
        variant: 'destructive',
      });
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) return;
    
    try {
      await apiService.inviteFamilyMember(selectedFamily.id, inviteForm.email);
      toast({ title: 'Invitation sent successfully!' });
      setIsInviteDialogOpen(false);
      setInviteForm({ email: '', role: 'member' });
      setSelectedFamily(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (familyId: string, memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await apiService.removeFamilyMember(familyId, memberId);
      toast({ title: 'Member removed successfully!' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member.',
        variant: 'destructive',
      });
    }
  };

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family);
    setFamilyForm({
      name: family.name,
      description: family.description || '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleInviteToFamily = (family: Family) => {
    setSelectedFamily(family);
    setIsInviteDialogOpen(true);
  };

  const getMemberRole = (family: Family) => {
    const member = family.members.find(m => m.userId === user?.id);
    return member?.role || 'member';
  };

  const canManageFamily = (family: Family) => {
    const role = getMemberRole(family);
    return role === 'owner' || role === 'admin';
  };

  const canInviteMembers = (family: Family) => {
    const role = getMemberRole(family);
    return role === 'owner' || role === 'admin';
  };

  const getFamilyStats = (family: Family) => {
    const familyPeople = people.filter(p => p.familyId === family.id);
    const familyGifts = gifts.filter(g => familyPeople.some(p => p.id === g.recipientId));
    const familyOccasions = occasions.filter(o => familyPeople.some(p => p.id === o.personId));
    const familyBudgets = budgets.filter(b => familyPeople.some(p => p.id === b.personId));

    return {
      people: familyPeople.length,
      gifts: familyGifts.length,
      occasions: familyOccasions.length,
      budgets: familyBudgets.length,
      totalSpent: familyGifts.reduce((sum, g) => sum + g.price, 0),
    };
  };

  const filteredFamilies = families.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-left">Families</h1>
            <p className="text-muted-foreground text-left">Manage your family groups and shared gift planning</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Family
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Families Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading families...</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No families found</h3>
              <p className="text-muted-foreground mb-4">
                {families.length === 0
                  ? 'Start by creating your first family group.'
                  : 'No families match your search criteria.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Family
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredFamilies.map((family) => {
              const stats = getFamilyStats(family);
              const userRole = getMemberRole(family);
              const canManage = canManageFamily(family);
              const canInvite = canInviteMembers(family);

              return (
                <Card key={family.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {family.name}
                          <Badge variant={userRole === 'owner' ? 'default' : userRole === 'admin' ? 'secondary' : 'outline'}>
                            {userRole}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {family.description || 'No description'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {canInvite && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInviteToFamily(family)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Invite
                          </Button>
                        )}
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFamily(family)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFamily(family.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Family Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.people}</div>
                          <div className="text-sm text-muted-foreground">People</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.gifts}</div>
                          <div className="text-sm text-muted-foreground">Gifts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.occasions}</div>
                          <div className="text-sm text-muted-foreground">Occasions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{stats.budgets}</div>
                          <div className="text-sm text-muted-foreground">Budgets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">${stats.totalSpent}</div>
                          <div className="text-sm text-muted-foreground">Spent</div>
                        </div>
                      </div>

                      {/* Family Members */}
                      <div>
                        <h4 className="font-semibold mb-3">Members</h4>
                        <div className="space-y-2">
                          {family.members.map((member) => {
                            const roleInfo = memberRoles.find(r => r.value === member.role);
                            const RoleIcon = roleInfo?.icon || User;
                            
                            return (
                              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>
                                      {member.userId === user?.id ? 'You' : 'M'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {member.userId === user?.id ? 'You' : `Member ${member.userId.slice(0, 8)}`}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <RoleIcon className="w-3 h-3" />
                                      {roleInfo?.label}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.userId !== user?.id && canManage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMember(family.id, member.id)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Family Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingFamily ? 'Edit Family' : 'Create New Family'}
            </DialogTitle>
            <DialogDescription>
              {editingFamily 
                ? 'Update your family information.'
                : 'Create a family group to share gifts and occasions with your loved ones.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingFamily ? handleUpdateFamily : handleCreateFamily}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Family Name *</Label>
                <Input
                  id="name"
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  placeholder="e.g. Smith Family"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={familyForm.description}
                  onChange={(e) => setFamilyForm({ ...familyForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingFamily(null);
                setFamilyForm({ name: '', description: '' });
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingFamily ? 'Update Family' : 'Create Family'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Family Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your family. They'll receive an email with instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteMember}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="inviteEmail">Email Address *</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as 'owner' | 'admin' | 'member' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsInviteDialogOpen(false);
                setInviteForm({ email: '', role: 'member' });
              }}>
                Cancel
              </Button>
              <Button type="submit">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Families; 