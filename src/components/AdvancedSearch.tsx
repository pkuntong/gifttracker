import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Users, Gift, Calendar, DollarSign } from 'lucide-react'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SearchResult {
  id: string
  name: string
  description?: string
  type: 'person' | 'gift' | 'occasion'
  [key: string]: unknown
}

interface SearchFilters {
  type?: string
  priceRange?: { min: number; max: number }
  status?: string
  dateRange?: { start: string; end: string }
}

export const AdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Search suggestions
  const suggestions = [
    'Sarah Johnson',
    'iPhone 15',
    'Birthday',
    'Christmas',
    'Anniversary',
    'Technology',
    'Books',
    'Clothing'
  ]

  const handleSearch = async (searchQuery: string, searchType?: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await apiService.search(searchQuery, searchType)
      setResults(response.results || [])
      
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value.trim()) {
      // Debounced search
      const timeoutId = setTimeout(() => {
        handleSearch(value, filters.type)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'person':
        return <Users className="h-4 w-4" />
      case 'gift':
        return <Gift className="h-4 w-4" />
      case 'occasion':
        return <Calendar className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultBadge = (type: string) => {
    const colors = {
      person: 'bg-blue-100 text-blue-800',
      gift: 'bg-green-100 text-green-800',
      occasion: 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Search</h2>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search people, gifts, occasions..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 pr-4"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="people">People</SelectItem>
                    <SelectItem value="gifts">Gifts</SelectItem>
                    <SelectItem value="occasions">Occasions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="purchased">Purchased</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      min: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      max: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleSearch(query, filters.type)}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      {!query && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleQueryChange(suggestion)}
                className="text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !query && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term) => (
              <Button
                key={term}
                variant="ghost"
                size="sm"
                onClick={() => handleQueryChange(term)}
                className="text-sm"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({results.length})
            </h3>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Searching...
              </div>
            )}
          </div>

          {results.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No results found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResultIcon(result.type)}
                      <div>
                        <h4 className="font-medium">{result.name}</h4>
                        {result.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getResultBadge(result.type)}>
                      {result.type}
                    </Badge>
                  </div>

                  {/* Additional details based on type */}
                  {result.type === 'person' && result.relationship && (
                    <p className="text-sm text-gray-500 mt-2">
                      Relationship: {result.relationship}
                    </p>
                  )}

                  {result.type === 'gift' && result.price && (
                    <div className="flex items-center gap-1 mt-2">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        ${result.price}
                      </span>
                    </div>
                  )}

                  {result.type === 'occasion' && result.date && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className="text-sm text-blue-600">
                        {new Date(result.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch 