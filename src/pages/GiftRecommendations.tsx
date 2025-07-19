import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Slider,
} from '@/components/ui/slider';
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
  Gift, 
  Heart, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Filter,
  Sparkles,
  Target,
  Zap,
  ShoppingCart,
  Eye,
  Share2,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';
import { recommendationService } from '@/services/recommendationService';
import { Person, Occasion, GiftRecommendation, GiftPreferences } from '@/types';

interface RecommendationFilters {
  personId?: string;
  occasionId?: string;
  category?: string;
  priceRange: [number, number];
  interests: string[];
  occasionType?: string;
  urgency: 'low' | 'medium' | 'high';
  source: 'ai' | 'popular' | 'trending' | 'personalized' | 'all';
}

const GiftRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RecommendationFilters>({
    priceRange: [0, 1000],
    interests: [],
    urgency: 'medium',
    source: 'all'
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<GiftRecommendation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [preferences, setPreferences] = useState<GiftPreferences | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filters.personId) {
      loadPreferences(filters.personId);
    }
  }, [filters.personId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleData, occasionsData] = await Promise.all([
        ApiService.getPeople(),
        ApiService.getOccasions()
      ]);
      setPeople(peopleData);
      setOccasions(occasionsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async (personId: string) => {
    try {
      const prefs = await ApiService.getGiftPreferences(personId);
      setPreferences(prefs);
    } catch (error) {
      // Preferences might not exist yet
      setPreferences(null);
    }
  };

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const recommendations = await recommendationService.generateRecommendations({
        personId: filters.personId,
        occasionId: filters.occasionId,
        category: filters.category,
        priceRange: {
          min: filters.priceRange[0],
          max: filters.priceRange[1]
        },
        interests: filters.interests,
        urgency: filters.urgency,
        source: filters.source
      });
      setRecommendations(recommendations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof RecommendationFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai': return <Target className="w-4 h-4" />;
      case 'popular': return <TrendingUp className="w-4 h-4" />;
      case 'trending': return <Zap className="w-4 h-4" />;
      case 'personalized': return <Target className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mockRecommendations: GiftRecommendation[] = [
    {
      id: '1',
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-canceling headphones with 30-hour battery life',
      category: 'Electronics',
      price: 199.99,
      currency: 'USD',
      confidence: 95,
      reason: 'Based on music interests and tech preferences',
      tags: ['electronics', 'music', 'tech'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/headphones',
      source: 'ai'
    },
    {
      id: '2',
      title: 'Personalized Photo Book',
      description: 'Custom photo album with memories and stories',
      category: 'Personal',
      price: 49.99,
      currency: 'USD',
      confidence: 88,
      reason: 'Perfect for sentimental value and personal connection',
      tags: ['personal', 'memories', 'custom'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/photobook',
      source: 'personalized'
    },
    {
      id: '3',
      title: 'Gourmet Coffee Subscription',
      description: 'Monthly delivery of premium coffee beans',
      category: 'Food & Beverage',
      price: 79.99,
      currency: 'USD',
      confidence: 82,
      reason: 'Matches coffee enthusiast interests',
      tags: ['coffee', 'subscription', 'gourmet'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/coffee',
      source: 'trending'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gift Recommendations</h1>
            <p className="text-muted-foreground">Smart personalized gift suggestions</p>
          </div>
        </div>
        <Button onClick={generateRecommendations} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Generate Recommendations
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Smart Filters
          </CardTitle>
          <CardDescription>
            Customize your gift recommendations with intelligent filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="person">Recipient</Label>
              <Select value={filters.personId} onValueChange={(value) => handleFilterChange('personId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={filters.occasionId} onValueChange={(value) => handleFilterChange('occasionId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map(occasion => (
                    <SelectItem key={occasion.id} value={occasion.id}>
                      {occasion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="personal">Personal Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="ai">AI Recommendations</SelectItem>
                  <SelectItem value="personalized">Personalized</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6 space-y-2">
            <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Preferences Display */}
          {preferences && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Recipient Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Interests:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Price Range:</strong>
                  <p>${preferences.priceRange.min} - ${preferences.priceRange.max}</p>
                </div>
                <div>
                  <strong>Favorite Categories:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.favoriteCategories.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getSourceIcon(recommendation.source)}
                  <Badge variant="outline" className="text-xs">
                    {recommendation.source}
                  </Badge>
                </div>
                <Badge className={getConfidenceColor(recommendation.confidence)}>
                  {recommendation.confidence}% match
                </Badge>
              </div>
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <CardDescription>{recommendation.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={recommendation.imageUrl} 
                  alt={recommendation.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">${recommendation.price}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">{recommendation.category}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{recommendation.reason}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {recommendation.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Recommendations State */}
      {recommendations.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or generating new recommendations
          </p>
          <Button onClick={generateRecommendations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate Recommendations
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Generating recommendations...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRecommendations; 