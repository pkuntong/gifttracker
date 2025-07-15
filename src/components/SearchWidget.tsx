import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Sparkles, 
  TrendingUp,
  Clock,
  Heart,
  Lightbulb,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchWidget: React.FC = () => {
  const { t } = useTranslation();
  const [quickSearch, setQuickSearch] = useState('');
  const [recentSearches] = useState([
    'wireless headphones',
    'personalized gifts',
    'tech gadgets',
    'handmade jewelry',
    'coffee gifts'
  ]);

  const [trendingSearches] = useState([
    { term: 'smart watches', count: 156 },
    { term: 'personalized frames', count: 89 },
    { term: 'gourmet coffee', count: 234 },
    { term: 'fitness trackers', count: 123 }
  ]);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(quickSearch)}`;
    }
  };

  const handleSearchClick = (searchTerm: string) => {
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {t('search.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <form onSubmit={handleQuickSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder={t('search.placeholder')}
              className="pl-10 pr-20"
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </form>

        {/* AI Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>{t('search.aiSuggestions')}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearchClick('personalized gifts')}
              className="text-xs"
            >
              Personalized
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearchClick('premium gifts')}
              className="text-xs"
            >
              Premium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearchClick('handmade gifts')}
              className="text-xs"
            >
              Handmade
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearchClick('trending gifts')}
              className="text-xs"
            >
              Trending
            </Button>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t('search.recentSearches')}</span>
          </div>
          
          <div className="space-y-1">
            {recentSearches.slice(0, 3).map((search, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleSearchClick(search)}
                className="w-full justify-start text-xs h-7"
              >
                <Search className="h-3 w-3 mr-2" />
                {search}
              </Button>
            ))}
          </div>
        </div>

        {/* Trending Searches */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </div>
          
          <div className="space-y-1">
            {trendingSearches.slice(0, 3).map((search, index) => (
              <div key={index} className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearchClick(search.term)}
                  className="justify-start text-xs h-7"
                >
                  <Lightbulb className="h-3 w-3 mr-2" />
                  {search.term}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {search.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <Link to="/search">
                <Search className="h-3 w-3 mr-1" />
                Advanced
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <Link to="/search">
                <Filter className="h-3 w-3 mr-1" />
                Filters
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchWidget; 