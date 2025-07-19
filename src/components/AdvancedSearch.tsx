import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X,
  Save,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { Label } from '@/components/ui/label';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  image: string;
  rating: number;
  source: string;
  relevance: number;
  matchType: 'exact' | 'partial' | 'semantic' | 'ai';
}

interface SearchFilter {
  priceRange: [number, number];
  categories: string[];
  tags: string[];
  sources: string[];
  rating: number;
  dateRange: [Date, Date] | null;
}

const AdvancedSearch: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFilter>({
    priceRange: [0, 1000],
    categories: [],
    tags: [],
    sources: [],
    rating: 0,
    dateRange: null
  });

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-canceling headphones with 30-hour battery life',
      price: 199.99,
      category: 'Electronics',
      tags: ['tech', 'music', 'wireless', 'premium'],
      image: '/headphones.jpg',
      rating: 4.8,
      source: 'Amazon',
      relevance: 0.95,
      matchType: 'exact'
    },
    {
      id: '2',
      name: 'Personalized Photo Frame',
      description: 'Custom wooden photo frame with engraved message',
      price: 45.00,
      category: 'Home & Garden',
      tags: ['personalized', 'photo', 'wooden', 'sentimental'],
      image: '/photo-frame.jpg',
      rating: 4.9,
      source: 'Etsy',
      relevance: 0.88,
      matchType: 'semantic'
    },
    {
      id: '3',
      name: 'Smart Fitness Watch',
      description: 'Advanced fitness tracker with heart rate monitoring',
      price: 299.99,
      category: 'Electronics',
      tags: ['fitness', 'health', 'smart', 'tech'],
      image: '/smartwatch.jpg',
      rating: 4.7,
      source: 'Amazon',
      relevance: 0.82,
      matchType: 'ai'
    },
    {
      id: '4',
      name: 'Handmade Jewelry Set',
      description: 'Beautiful sterling silver necklace and earrings',
      price: 85.00,
      category: 'Fashion',
      tags: ['jewelry', 'handmade', 'silver', 'elegant'],
      image: '/jewelry.jpg',
      rating: 4.9,
      source: 'Etsy',
      relevance: 0.79,
      matchType: 'partial'
    },
    {
      id: '5',
      name: 'Gourmet Coffee Gift Set',
      description: 'Premium coffee beans with artisanal mug',
      price: 65.00,
      category: 'Food & Beverage',
      tags: ['coffee', 'gourmet', 'premium', 'food'],
      image: '/coffee-set.jpg',
      rating: 4.6,
      source: 'Amazon',
      relevance: 0.75,
      matchType: 'semantic'
    }
  ];

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Food & Beverage',
    'Books', 'Sports', 'Beauty', 'Toys & Games', 'Automotive'
  ];

  const sources = ['Amazon', 'Etsy', 'eBay', 'Walmart', 'Target'];

  const priceRanges = [
    { label: 'Under $25', range: [0, 25] },
    { label: '$25 - $50', range: [25, 50] },
    { label: '$50 - $100', range: [50, 100] },
    { label: '$100 - $200', range: [100, 200] },
    { label: 'Over $200', range: [200, 1000] }
  ];

  // Smart search suggestions
  const generateSmartSuggestions = (searchQuery: string) => {
    const suggestions = [
      `${searchQuery} for men`,
      `${searchQuery} personalized`,
      `${searchQuery} premium`,
      `${searchQuery} handmade`,
      `${searchQuery} on sale`,
      `${searchQuery} trending`,
      `${searchQuery} best rated`,
      `${searchQuery} unique`
    ];
    return suggestions.slice(0, 6);
  };

  // Perform search with AI enhancement
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter results based on query and filters
      const filteredResults = mockResults.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesPrice = item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1];
        const matchesCategory = filters.categories.length === 0 || filters.categories.includes(item.category);
        const matchesSource = filters.sources.length === 0 || filters.sources.includes(item.source);
        const matchesRating = item.rating >= filters.rating;
        
        return matchesQuery && matchesPrice && matchesCategory && matchesSource && matchesRating;
      });

      // Sort by relevance
      filteredResults.sort((a, b) => b.relevance - a.relevance);
      
      setResults(filteredResults);
      
      // Add to search history
      if (searchQuery.trim()) {
        setSearchHistory(prev => [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10));
      }
      
      // Generate AI suggestions
      setAiSuggestions(generateSmartSuggestions(searchQuery));
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  // Save current search
  const saveSearch = () => {
    if (query.trim() && !savedSearches.includes(query)) {
      setSavedSearches(prev => [...prev, query]);
    }
  };

  // Load saved search
  const loadSavedSearch = (savedQuery: string) => {
    setQuery(savedQuery);
    performSearch(savedQuery);
  };

  // Remove saved search
  const removeSavedSearch = (savedQuery: string) => {
    setSavedSearches(prev => prev.filter(s => s !== savedQuery));
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  // Get match type badge
  const getMatchTypeBadge = (matchType: string) => {
    const matchTypes = {
      exact: { variant: 'default' as const, icon: Target },
      semantic: { variant: 'secondary' as const, icon: Target },
      partial: { variant: 'outline' as const, icon: TrendingUp },
      ai: { variant: 'destructive' as const, icon: Zap },
    };
    
    const { variant, icon: Icon } = matchTypes[matchType as keyof typeof matchTypes] || matchTypes.partial;
    
    return (
      <Badge variant={variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {matchType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('search.title')}</h1>
          <p className="text-muted-foreground">{t('search.description')}</p>
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t('search.filters')}
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('search.aiSuggestions')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('search.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div className="space-y-2">
              <Label>{t('search.priceRange')}</Label>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range, index) => (
                  <Button
                    key={index}
                    variant={filters.priceRange[0] === range.range[0] && filters.priceRange[1] === range.range[1] ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: range.range as [number, number] }))}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>{t('search.categories')}</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.includes(category)
                          ? prev.categories.filter(c => c !== category)
                          : [...prev.categories, category]
                      }));
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-2">
              <Label>{t('search.sources')}</Label>
              <div className="flex flex-wrap gap-2">
                {sources.map((source) => (
                  <Button
                    key={source}
                    variant={filters.sources.includes(source) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        sources: prev.sources.includes(source)
                          ? prev.sources.filter(s => s !== source)
                          : [...prev.sources, source]
                      }));
                    }}
                  >
                    {source}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>{t('search.minRating')}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm">{filters.rating}+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search History & Saved Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('search.recentSearches')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((search, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSavedSearch(search)}
                    className="justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {search}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saved Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              {t('search.savedSearches')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSavedSearch(search)}
                    className="justify-start"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {search}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSavedSearch(search)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t('search.results')} ({results.length})
            </h2>
            <Button onClick={saveSearch} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              {t('search.saveSearch')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Image placeholder */}
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold line-clamp-2">{result.name}</h3>
                        {getMatchTypeBadge(result.matchType)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{result.rating}</span>
                        </div>
                        <span className="font-semibold">${result.price}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{result.source}</span>
                        <span>{result.category}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query && !loading && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('search.noResults')}</h3>
            <p className="text-muted-foreground">{t('search.noResultsDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch; 