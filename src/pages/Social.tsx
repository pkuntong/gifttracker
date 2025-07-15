import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Calendar,
  Gift,
  Plus,
  Search,
  Bell,
  Mail,
  Phone,
  Globe,
  Lock,
  Unlock,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Settings,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Star,
  ThumbsUp,
  MessageSquare,
  Camera,
  Video,
  FileText,
  Link,
  QrCode,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';
import { Gift as GiftType, Person } from '@/types';

interface FamilyGroup {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  lastActive: string;
}

interface SharedWishlist {
  id: string;
  name: string;
  description: string;
  owner: FamilyMember;
  collaborators: FamilyMember[];
  items: WishlistItem[];
  isPublic: boolean;
  shareCode: string;
  createdAt: string;
  updatedAt: string;
}

interface WishlistItem {
  id: string;
  name: string;
  description: string;
  price: number;
  url?: string;
  image?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  reservedBy?: FamilyMember;
  purchasedBy?: FamilyMember;
  comments: WishlistComment[];
  createdAt: string;
  updatedAt: string;
}

interface WishlistComment {
  id: string;
  text: string;
  author: FamilyMember;
  createdAt: string;
}

interface GiftEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  organizer: FamilyMember;
  attendees: FamilyMember[];
  gifts: GiftType[];
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const Social: React.FC = () => {
  const [families, setFamilies] = useState<FamilyGroup[]>([]);
  const [wishlists, setWishlists] = useState<SharedWishlist[]>([]);
  const [events, setEvents] = useState<GiftEvent[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('families');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyGroup | null>(null);
  
  const { toast } = useToast();

  // Form states
  const [familyForm, setFamilyForm] = useState({
    name: '',
    description: '',
    avatar: ''
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [familiesData, peopleData] = await Promise.all([
        ApiService.getFamilies(),
        ApiService.getPeople()
      ]);
      setFamilies(familiesData);
      setPeople(peopleData);
      
      // Load mock social data
      loadMockSocialData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load social data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMockSocialData = () => {
    const mockFamilies: FamilyGroup[] = [
      {
        id: '1',
        name: 'Smith Family',
        description: 'Our family gift coordination group',
        members: [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            role: 'admin',
            joinedAt: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            role: 'member',
            joinedAt: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-14T15:45:00Z'
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'member',
            joinedAt: '2024-01-05T00:00:00Z',
            lastActive: '2024-01-13T09:20:00Z'
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    ];

    const mockWishlists: SharedWishlist[] = [
      {
        id: '1',
        name: 'Christmas Wishlist 2024',
        description: 'Our family Christmas wishlist',
        owner: mockFamilies[0].members[0],
        collaborators: mockFamilies[0].members,
        items: [
          {
            id: '1',
            name: 'Wireless Headphones',
            description: 'Noise-cancelling wireless headphones',
            price: 199.99,
            url: 'https://example.com/headphones',
            category: 'Electronics',
            priority: 'high',
            comments: [
              {
                id: '1',
                text: 'These look perfect for Dad!',
                author: mockFamilies[0].members[1],
                createdAt: '2024-01-10T14:30:00Z'
              }
            ],
            createdAt: '2024-01-10T00:00:00Z',
            updatedAt: '2024-01-10T14:30:00Z'
          },
          {
            id: '2',
            name: 'Cookbook Collection',
            description: 'Professional cooking recipes',
            price: 45.00,
            category: 'Books',
            priority: 'medium',
            reservedBy: mockFamilies[0].members[1],
            comments: [],
            createdAt: '2024-01-12T00:00:00Z',
            updatedAt: '2024-01-12T00:00:00Z'
          }
        ],
        isPublic: false,
        shareCode: 'SMITH2024',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    ];

    const mockEvents: GiftEvent[] = [
      {
        id: '1',
        title: 'Christmas Gift Exchange',
        description: 'Annual family Christmas gift exchange',
        date: '2024-12-25T18:00:00Z',
        location: 'Smith Family Home',
        organizer: mockFamilies[0].members[0],
        attendees: mockFamilies[0].members,
        gifts: [],
        status: 'upcoming',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    ];

    setFamilies(mockFamilies);
    setWishlists(mockWishlists);
    setEvents(mockEvents);
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newFamily: FamilyGroup = {
        id: Date.now().toString(),
        name: familyForm.name,
        description: familyForm.description,
        avatar: familyForm.avatar,
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setFamilies(prev => [newFamily, ...prev]);
      setIsCreateDialogOpen(false);
      resetFamilyForm();
      
      toast({
        title: "Success",
        description: "Family group created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create family group",
        variant: "destructive",
      });
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFamily) return;
    
    try {
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: inviteForm.email.split('@')[0], // Mock name
        email: inviteForm.email,
        role: inviteForm.role,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setFamilies(prev => prev.map(family => 
        family.id === selectedFamily.id 
          ? { ...family, members: [...family.members, newMember] }
          : family
      ));
      
      setIsInviteDialogOpen(false);
      resetInviteForm();
      
      toast({
        title: "Success",
        description: "Member invited successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive",
      });
    }
  };

  const resetFamilyForm = () => {
    setFamilyForm({
      name: '',
      description: '',
      avatar: ''
    });
  };

  const resetInviteForm = () => {
    setInviteForm({
      email: '',
      role: 'member'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const shareWishlist = (wishlist: SharedWishlist) => {
    const shareUrl = `${window.location.origin}/wishlist/${wishlist.shareCode}`;
    copyToClipboard(shareUrl);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Social & Sharing</h1>
            <p className="text-muted-foreground">Collaborate with family and friends on gift planning</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Family Group
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="families">Family Groups</TabsTrigger>
          <TabsTrigger value="wishlists">Shared Wishlists</TabsTrigger>
          <TabsTrigger value="events">Gift Events</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
        </TabsList>

        {/* Family Groups Tab */}
        <TabsContent value="families" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {families.map((family) => (
              <Card key={family.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={family.avatar} />
                        <AvatarFallback>{family.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{family.name}</CardTitle>
                        <CardDescription>{family.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFamily(family);
                          setIsInviteDialogOpen(true);
                        }}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Members ({family.members.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {family.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                            <Badge className={getRoleColor(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created {new Date(family.createdAt).toLocaleDateString()}</span>
                      <span>Last active {new Date(family.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Shared Wishlists Tab */}
        <TabsContent value="wishlists" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wishlists.map((wishlist) => (
              <Card key={wishlist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="w-8 h-8 text-primary" />
                      <div>
                        <CardTitle>{wishlist.name}</CardTitle>
                        <CardDescription>{wishlist.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareWishlist(wishlist)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Items ({wishlist.items.length})</span>
                      <Badge variant={wishlist.isPublic ? "default" : "secondary"}>
                        {wishlist.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {wishlist.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{item.name}</span>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">${item.price}</span>
                        </div>
                      ))}
                      {wishlist.items.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{wishlist.items.length - 3} more items
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Owner: {wishlist.owner.name}</span>
                      <span>Share code: {wishlist.shareCode}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Gift Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-primary" />
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">
                          {event.location || 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Attendees ({event.attendees.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {event.attendees.map((attendee) => (
                          <div key={attendee.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={attendee.avatar} />
                              <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{attendee.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Organizer: {event.organizer.name}</span>
                      <span>Gifts: {event.gifts.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your family and friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: '1',
                    type: 'wishlist_created',
                    user: 'Sarah Smith',
                    action: 'created a new wishlist',
                    target: 'Christmas Wishlist 2024',
                    time: '2 hours ago',
                    avatar: ''
                  },
                  {
                    id: '2',
                    type: 'gift_reserved',
                    user: 'Mike Johnson',
                    action: 'reserved a gift',
                    target: 'Cookbook Collection',
                    time: '1 day ago',
                    avatar: ''
                  },
                  {
                    id: '3',
                    type: 'event_created',
                    user: 'John Smith',
                    action: 'created a gift event',
                    target: 'Christmas Gift Exchange',
                    time: '3 days ago',
                    avatar: ''
                  }
                ].map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Family Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Family Group</DialogTitle>
            <DialogDescription>
              Create a new family group to coordinate gift planning
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFamily}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Family Name</Label>
                <Input
                  id="name"
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  placeholder="Enter family name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={familyForm.description}
                  onChange={(e) => setFamilyForm({ ...familyForm, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Family</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite someone to join your family group
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteMember}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value: 'admin' | 'member' | 'viewer') => setInviteForm({ ...inviteForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Social; 