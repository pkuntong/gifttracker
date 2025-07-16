import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Plus, 
  X, 
  Heart, 
  DollarSign, 
  ShoppingBag,
  Star,
  Target,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';
import { GiftPreferences, Person } from '@/types';

interface GiftPreferencesFormProps {
  personId: string;
  personName: string;
  onPreferencesUpdated?: () => void;
}

const GiftPreferencesForm: React.FC<GiftPreferencesFormProps> = ({
  personId,
  personName,
  onPreferencesUpdated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<Partial<GiftPreferences>>({
    interests: [],
    hobbies: [],
    favoriteCategories: [],
    priceRange: { min: 0, max: 500 },
    preferredStores: [],
    allergies: [],
    dislikes: [],
    notes: ''
  });
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStore, setNewStore] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newDislike, setNewDislike] = useState('');
  
  const { toast } = useToast();

  const categories = [
    'Electronics', 'Fashion', 'Books', 'Sports', 'Home & Garden',
    'Personal Care', 'Food & Beverage', 'Toys & Games', 'Jewelry',
    'Art & Crafts', 'Music', 'Movies', 'Gaming', 'Fitness',
    'Beauty', 'Automotive', 'Pet Supplies', 'Travel', 'Outdoor'
  ];

  const popularInterests = [
    'Technology', 'Music', 'Sports', 'Cooking', 'Reading',
    'Travel', 'Fitness', 'Art', 'Gaming', 'Photography',
    'Fashion', 'Beauty', 'DIY', 'Gardening', 'Pets',
    'Movies', 'Dancing', 'Writing', 'Painting', 'Hiking'
  ];

  const popularStores = [
    'Amazon', 'Target', 'Walmart', 'Best Buy', 'Apple Store',
    'Nike', 'Sephora', 'Etsy', 'Wayfair', 'Home Depot',
    'Macy\'s', 'Nordstrom', 'REI', 'Barnes & Noble', 'GameStop'
  ];

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen, personId]);

  const loadPreferences = async () => {
    try {
      const prefs = await ApiService.getGiftPreferences(personId);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      // Preferences might not exist yet, start with defaults
      setPreferences({
        interests: [],
        hobbies: [],
        favoriteCategories: [],
        priceRange: { min: 0, max: 500 },
        preferredStores: [],
        allergies: [],
        dislikes: [],
        notes: ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (preferences.id) {
        await ApiService.updateGiftPreferences(personId, preferences);
      } else {
        await ApiService.createGiftPreferences({
          ...preferences,
          personId
        } as any);
      }
      
      toast({
        title: "Success",
        description: "Gift preferences saved successfully",
      });
      
      setIsOpen(false);
      onPreferencesUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field: keyof GiftPreferences, value: string, setter: (value: string) => void) => {
    if (value.trim() && !(preferences[field] as string[])?.includes(value.trim())) {
      setPreferences(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[] || []), value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: keyof GiftPreferences, index: number) => {
    setPreferences(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addPopularItem = (field: keyof GiftPreferences, item: string) => {
    if (!(preferences[field] as string[])?.includes(item)) {
      setPreferences(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[] || []), item]
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Target className="w-4 h-4 mr-2" />
          Manage Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Gift Preferences for {personName}
          </DialogTitle>
          <DialogDescription>
            Set up detailed preferences to get better gift recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Interests & Hobbies
              </CardTitle>
              <CardDescription>
                What does this person enjoy doing?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add interest..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem('interests', newInterest, setNewInterest)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => addItem('interests', newInterest, setNewInterest)}
                    disabled={!newInterest.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.interests?.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('interests', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Popular: {popularInterests.slice(0, 8).map(interest => (
                    <button
                      key={interest}
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => addPopularItem('interests', interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hobbies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    placeholder="Add hobby..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem('hobbies', newHobby, setNewHobby)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => addItem('hobbies', newHobby, setNewHobby)}
                    disabled={!newHobby.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.hobbies?.map((hobby, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {hobby}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('hobbies', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Price */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Categories & Budget
              </CardTitle>
              <CardDescription>
                Preferred gift categories and price range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Favorite Categories</Label>
                <div className="flex gap-2">
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => addItem('favoriteCategories', newCategory, setNewCategory)}
                    disabled={!newCategory}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.favoriteCategories?.map((category, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('favoriteCategories', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minPrice">Min Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={preferences.priceRange?.min || 0}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange!, min: Number(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">Max Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={preferences.priceRange?.max || 500}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange!, max: Number(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stores & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Preferred Stores
              </CardTitle>
              <CardDescription>
                Where they like to shop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Stores</Label>
                <div className="flex gap-2">
                  <Input
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    placeholder="Add store..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem('preferredStores', newStore, setNewStore)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => addItem('preferredStores', newStore, setNewStore)}
                    disabled={!newStore.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.preferredStores?.map((store, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {store}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('preferredStores', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Popular: {popularStores.slice(0, 6).map(store => (
                    <button
                      key={store}
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => addPopularItem('preferredStores', store)}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergies & Dislikes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="w-5 h-5" />
                Allergies & Dislikes
              </CardTitle>
              <CardDescription>
                Important things to avoid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy, setNewAllergy)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                    disabled={!newAllergy.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.allergies?.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {allergy}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('allergies', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dislikes</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDislike}
                    onChange={(e) => setNewDislike(e.target.value)}
                    placeholder="Add dislike..."
                    onKeyPress={(e) => e.key === 'Enter' && addItem('dislikes', newDislike, setNewDislike)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => addItem('dislikes', newDislike, setNewDislike)}
                    disabled={!newDislike.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.dislikes?.map((dislike, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {dislike}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('dislikes', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Any other important information about gift preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes about gift preferences..."
              value={preferences.notes || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiftPreferencesForm; 