import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Gift, 
  Heart, 
  Star, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  User, 
  Calendar,
  DollarSign,
  ShoppingCart,
  ExternalLink,
  Edit,
  Trash2,
  Lightbulb,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { apiService } from '@/services/api';
import { GiftIdea, GiftRecommendation, GiftPreferences, Person, Occasion } from '@/types';
import { useToast } from '@/hooks/use-toast';

const GiftIdeasPage: React.FC = () => {
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [category, setCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ideas');
  const { toast } = useToast();

  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'all',
    price: 0,
    currency: 'USD',
    tags: [] as string[],
    imageUrl: '',
    purchaseUrl: '',
    recipientId: 'all',
    occasionId: 'all',
    notes: '',
  });

  const [preferences, setPreferences] = useState({
    interests: [] as string[],
    hobbies: [] as string[],
    favoriteCategories: [] as string[],
    priceRange: { min: 0, max: 1000 },
    preferredStores: [] as string[],
    allergies: [] as string[],
    dislikes: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ideasData, peopleData, occasionsData] = await Promise.all([
        apiService.getGiftIdeas(),
        apiService.getPeople(),
        apiService.getOccasions(),
      ]);
      setGiftIdeas(Array.isArray(ideasData) ? ideasData : []);
      setPeople(Array.isArray(peopleData) ? peopleData : []);
      setOccasions(Array.isArray(occasionsData) ? occasionsData : []);
    } catch (error) {
      console.error('Error loading gift ideas:', error);
      // Set default empty arrays to prevent map errors
      setGiftIdeas([]);
      setPeople([]);
      setOccasions([]);
      toast({
        title: "Error",
        description: "Failed to load gift ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async () => {
    try {
      await apiService.createGiftIdea({
        ...newIdea,
        category: newIdea.category === 'all' ? '' : newIdea.category,
        recipientId: newIdea.recipientId === 'all' ? '' : newIdea.recipientId,
        occasionId: newIdea.occasionId === 'all' ? '' : newIdea.occasionId,
        source: 'manual',
        isFavorite: false,
        isPurchased: false,
      });
      setShowAddIdea(false);
              setNewIdea({
          title: '',
          description: '',
          category: 'all',
          price: 0,
          currency: 'USD',
          tags: [],
          imageUrl: '',
          purchaseUrl: '',
          recipientId: 'all',
          occasionId: 'all',
          notes: '',
        });
      loadData();
      toast({
        title: "Success",
        description: "Gift idea created successfully",
      });
    } catch (error) {
      console.error('Error creating gift idea:', error);
      toast({
        title: "Error",
        description: "Failed to create gift idea",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await apiService.toggleFavorite(id);
      loadData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await apiService.deleteGiftIdea(id);
      loadData();
      toast({
        title: "Success",
        description: "Gift idea deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting gift idea:', error);
      toast({
        title: "Error",
        description: "Failed to delete gift idea",
        variant: "destructive",
      });
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setLoading(true);
      const filters: Record<string, unknown> = {};
      if (selectedPerson && selectedPerson !== 'all') filters.personId = selectedPerson;
      if (selectedOccasion && selectedOccasion !== 'all') filters.occasionId = selectedOccasion;
      if (category && category !== 'all') filters.category = category;
      if (priceRange[0] > 0 || priceRange[1] < 1000) {
        filters.priceRange = { min: priceRange[0], max: priceRange[1] };
      }
      
      const recommendationsData = await apiService.getGiftRecommendations(filters);
      setRecommendations(recommendationsData);
      setActiveTab('recommendations');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (personId: string) => {
    try {
      await apiService.createGiftPreferences({
        personId,
        ...preferences,
      });
      setShowPreferences(false);
      toast({
        title: "Success",
        description: "Gift preferences saved successfully",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  const filteredIdeas = giftIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || idea.category === category;
    const matchesPrice = idea.price >= priceRange[0] && idea.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gift Ideas & Recommendations</h1>
          <p className="text-muted-foreground">Discover perfect gifts and get personalized recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowPreferences(true)} variant="outline">
            <User className="mr-2 h-4 w-4" />
            Preferences
          </Button>
          <Button onClick={() => setShowAddIdea(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Idea
          </Button>
        </div>
      </div>

      {/* Filters */}
      {/* Simplified Search and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for gift ideas, recipients, or occasions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGetRecommendations} 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Smart Ideas
          </Button>
          <Button onClick={() => setShowAddIdea(true)} variant="outline" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Idea
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedPerson === 'all' ? 'outline' : 'default'} 
              className="cursor-pointer"
              onClick={() => setSelectedPerson('all')}
            >
              All Recipients
            </Badge>
            {(people || []).slice(0, 4).map((person) => (
              <Badge 
                key={person.id}
                variant={selectedPerson === person.id ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedPerson(person.id)}
              >
                {person.name}
              </Badge>
            ))}
            <Badge 
              variant={category === 'all' ? 'outline' : 'secondary'} 
              className="cursor-pointer"
              onClick={() => setCategory('all')}
            >
              All Categories
            </Badge>
            {['electronics', 'clothing', 'books', 'home'].map((cat) => (
              <Badge 
                key={cat}
                variant={category === cat ? 'secondary' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Badge>
            ))}
            {priceRange[0] > 0 || priceRange[1] < 1000 ? (
              <Badge 
                variant="destructive" 
                className="cursor-pointer"
                onClick={() => setPriceRange([0, 1000])}
              >
                ${priceRange[0]} - ${priceRange[1]} ✕
              </Badge>
            ) : null}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              More filters
            </summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  min={0}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs">Occasion</Label>
                <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Occasions</SelectItem>
                    {(occasions || []).map((occasion) => (
                      <SelectItem key={occasion.id} value={occasion.id}>
                        {occasion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="ideas">My Ideas</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="space-y-6">
          <div className="grid gap-6">
            {(filteredIdeas || []).map((idea) => (
              <Card key={idea.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        {idea.title}
                      </CardTitle>
                      <CardDescription>{idea.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{idea.category}</Badge>
                      <Badge variant="outline">${idea.price}</Badge>
                      {idea.isFavorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {idea.recipientId && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">
                            {people.find(p => p.id === idea.recipientId)?.name}
                          </span>
                        </div>
                      )}
                      {idea.occasionId && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {occasions.find(o => o.id === idea.occasionId)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFavorite(idea.id)}
                      >
                        <Heart className={`h-4 w-4 ${idea.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                      {idea.purchaseUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={idea.purchaseUrl} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteIdea(idea.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {idea.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{idea.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
                              {(recommendations || []).map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {rec.title}
                      </CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{rec.category}</Badge>
                      <Badge variant="outline">${rec.price}</Badge>
                      <Badge variant="default">{rec.confidence}% match</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{rec.reason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {rec.source} recommendation
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(rec.tags || []).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewIdea({
                            title: rec.title,
                            description: rec.description,
                            category: rec.category,
                            price: rec.price,
                            currency: rec.currency,
                            tags: rec.tags,
                            imageUrl: rec.imageUrl || '',
                            purchaseUrl: rec.purchaseUrl || '',
                            recipientId: selectedPerson === 'all' ? 'all' : selectedPerson,
                            occasionId: selectedOccasion === 'all' ? 'all' : selectedOccasion,
                            notes: `Recommended: ${rec.reason}`,
                          });
                          setShowAddIdea(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Save as Idea
                      </Button>
                      {rec.purchaseUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={rec.purchaseUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid gap-6">
            {(giftIdeas || []).filter(idea => idea.isFavorite).map((idea) => (
              <Card key={idea.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                        {idea.title}
                      </CardTitle>
                      <CardDescription>{idea.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{idea.category}</Badge>
                      <Badge variant="outline">${idea.price}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {idea.recipientId && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">
                            {people.find(p => p.id === idea.recipientId)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFavorite(idea.id)}
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      </Button>
                      {idea.purchaseUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={idea.purchaseUrl} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Gift Idea Dialog */}
      <Dialog open={showAddIdea} onOpenChange={setShowAddIdea}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Gift Idea</DialogTitle>
            <DialogDescription>
              Create a new gift idea with details and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Enter gift title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="Enter gift description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newIdea.category} onValueChange={(value) => setNewIdea({ ...newIdea, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select category</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="sports">Sports & Outdoors</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="food">Food & Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newIdea.price}
                  onChange={(e) => setNewIdea({ ...newIdea, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={newIdea.recipientId} onValueChange={(value) => setNewIdea({ ...newIdea, recipientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select recipient</SelectItem>
                    {(people || []).map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={newIdea.occasionId} onValueChange={(value) => setNewIdea({ ...newIdea, occasionId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select occasion</SelectItem>
                    {(occasions || []).map((occasion) => (
                      <SelectItem key={occasion.id} value={occasion.id}>
                        {occasion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchaseUrl">Purchase URL (optional)</Label>
              <Input
                id="purchaseUrl"
                value={newIdea.purchaseUrl}
                onChange={(e) => setNewIdea({ ...newIdea, purchaseUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={newIdea.notes}
                onChange={(e) => setNewIdea({ ...newIdea, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddIdea(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateIdea}>Create Idea</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gift Preferences</DialogTitle>
            <DialogDescription>
              Set preferences for gift recommendations and ideas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Interests</Label>
              <Input
                placeholder="Add interests (comma separated)"
                value={preferences.interests.join(', ')}
                onChange={(e) => setPreferences({
                  ...preferences,
                  interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hobbies</Label>
              <Input
                placeholder="Add hobbies (comma separated)"
                value={preferences.hobbies.join(', ')}
                onChange={(e) => setPreferences({
                  ...preferences,
                  hobbies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Favorite Categories</Label>
              <Input
                placeholder="Add favorite categories (comma separated)"
                value={preferences.favoriteCategories.join(', ')}
                onChange={(e) => setPreferences({
                  ...preferences,
                  favoriteCategories: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Price Range: ${preferences.priceRange.min} - ${preferences.priceRange.max}</Label>
              <Slider
                value={[preferences.priceRange.min, preferences.priceRange.max]}
                onValueChange={(value) => setPreferences({
                  ...preferences,
                  priceRange: { min: value[0], max: value[1] }
                })}
                max={1000}
                min={0}
                step={10}
              />
            </div>
            <div className="grid gap-2">
              <Label>Preferred Stores</Label>
              <Input
                placeholder="Add preferred stores (comma separated)"
                value={preferences.preferredStores.join(', ')}
                onChange={(e) => setPreferences({
                  ...preferences,
                  preferredStores: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Allergies/Dislikes</Label>
              <Input
                placeholder="Add allergies or dislikes (comma separated)"
                value={preferences.allergies?.join(', ') || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  allergies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={preferences.notes}
                onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                placeholder="Additional preferences..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPreferences(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSavePreferences(selectedPerson === 'all' ? '' : selectedPerson)}>
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftIdeasPage; 