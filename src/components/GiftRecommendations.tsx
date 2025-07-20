import React, { useState, useEffect } from 'react'
import { Gift, Star, DollarSign, Heart, ShoppingCart, Sparkles } from 'lucide-react'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Recommendation {
  id: string
  name: string
  description: string
  price: number
  category: string
  reason: string
  rating: number
}

interface Person {
  id: string
  name: string
  relationship?: string
}

export const GiftRecommendations: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<string>('')
  const [selectedOccasion, setSelectedOccasion] = useState<string>('')
  const [budget, setBudget] = useState<number>(100)
  const [interests, setInterests] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const occasions = [
    'birthday',
    'christmas',
    'anniversary',
    'wedding',
    'graduation',
    'housewarming',
    'baby shower',
    'mother\'s day',
    'father\'s day',
    'valentine\'s day'
  ]

  const interestOptions = [
    'technology',
    'books',
    'fashion',
    'sports',
    'cooking',
    'art',
    'music',
    'travel',
    'fitness',
    'gaming',
    'gardening',
    'photography'
  ]

  // Load people on component mount
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const response = await apiService.getPeople()
        setPeople(response.people || [])
      } catch (error) {
        console.error('Error loading people:', error)
      }
    }
    loadPeople()
  }, [])

  const handleGetRecommendations = async () => {
    if (!selectedPerson || !selectedOccasion) {
      alert('Please select a person and occasion')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiService.getRecommendations(
        selectedPerson,
        selectedOccasion,
        budget,
        interests
      )
      setRecommendations(response.recommendations || [])
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSaveRecommendation = (recommendation: Recommendation) => {
    // Save to gifts
    apiService.createGift({
      name: recommendation.name,
      description: recommendation.description,
      price: recommendation.price,
      status: 'planned',
      person_id: selectedPerson
    }).then(() => {
      alert('Gift saved to your list!')
    }).catch(error => {
      console.error('Error saving gift:', error)
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Personal': 'bg-purple-100 text-purple-800',
      'Food & Drink': 'bg-orange-100 text-orange-800',
      'Wellness': 'bg-green-100 text-green-800',
      'Fashion': 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Gift Recommendations</h2>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Find the Perfect Gift</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Person Selection */}
            <div>
              <Label htmlFor="person">For</Label>
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} {person.relationship && `(${person.relationship})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Occasion Selection */}
            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((occasion) => (
                    <SelectItem key={occasion} value={occasion}>
                      {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <Label htmlFor="budget">Budget</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label>Interests (Optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {interestOptions.map((interest) => (
                  <Button
                    key={interest}
                    variant={interests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGetRecommendations}
            disabled={!selectedPerson || !selectedOccasion || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Finding recommendations...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Get Recommendations
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Recommended Gifts ({recommendations.length})
            </h3>
            <Badge variant="secondary">
              Budget: ${budget}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium">{recommendation.name}</h4>
                      </div>
                      <Badge className={getCategoryColor(recommendation.category)}>
                        {recommendation.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600">
                      {recommendation.description}
                    </p>

                    {/* Price and Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          ${recommendation.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{recommendation.rating}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-blue-700">
                        <strong>Why this gift:</strong> {recommendation.reason}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveRecommendation(recommendation)}
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Save Gift
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(recommendation.name)}`, '_blank')}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Recommendations */}
      {!isLoading && recommendations.length === 0 && selectedPerson && selectedOccasion && (
        <Card>
          <CardContent className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your budget or interests
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 