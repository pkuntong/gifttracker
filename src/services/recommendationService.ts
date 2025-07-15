import { GiftRecommendation, Person, Occasion, GiftPreferences } from '@/types';

export interface RecommendationFilters {
  personId?: string;
  occasionId?: string;
  category?: string;
  priceRange: {
    min: number;
    max: number;
  };
  interests: string[];
  occasionType?: string;
  urgency: 'low' | 'medium' | 'high';
  source: 'ai' | 'popular' | 'trending' | 'personalized' | 'all';
}

export interface RecommendationContext {
  person: Person;
  occasion?: Occasion;
  preferences?: GiftPreferences;
  budget: number;
  interests: string[];
  occasionType: string;
}

class RecommendationService {
  private mockGiftDatabase = [
    {
      id: '1',
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-canceling headphones with 30-hour battery life',
      category: 'Electronics',
      price: 199.99,
      currency: 'USD',
      tags: ['electronics', 'music', 'tech', 'wireless', 'audio'],
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
      tags: ['personal', 'memories', 'custom', 'photo', 'sentimental'],
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
      tags: ['coffee', 'subscription', 'gourmet', 'food', 'beverage'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/coffee',
      source: 'trending'
    },
    {
      id: '4',
      title: 'Smart Fitness Watch',
      description: 'Advanced fitness tracking with heart rate monitoring',
      category: 'Electronics',
      price: 299.99,
      currency: 'USD',
      tags: ['fitness', 'tech', 'health', 'smartwatch', 'tracking'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/smartwatch',
      source: 'ai'
    },
    {
      id: '5',
      title: 'Artisan Chocolate Box',
      description: 'Luxury chocolate assortment from local artisans',
      category: 'Food & Beverage',
      price: 39.99,
      currency: 'USD',
      tags: ['chocolate', 'luxury', 'food', 'artisan', 'gourmet'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/chocolate',
      source: 'popular'
    },
    {
      id: '6',
      title: 'Handcrafted Leather Wallet',
      description: 'Premium leather wallet with RFID protection',
      category: 'Fashion',
      price: 89.99,
      currency: 'USD',
      tags: ['leather', 'fashion', 'accessories', 'premium', 'handcrafted'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/wallet',
      source: 'personalized'
    },
    {
      id: '7',
      title: 'Board Game Collection',
      description: 'Family-friendly board games for all ages',
      category: 'Toys & Games',
      price: 59.99,
      currency: 'USD',
      tags: ['games', 'family', 'entertainment', 'board games', 'fun'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/boardgames',
      source: 'trending'
    },
    {
      id: '8',
      title: 'Aromatherapy Diffuser Set',
      description: 'Essential oil diffuser with calming scents',
      category: 'Home & Garden',
      price: 69.99,
      currency: 'USD',
      tags: ['wellness', 'home', 'aromatherapy', 'relaxation', 'essential oils'],
      imageUrl: 'https://via.placeholder.com/300x200',
      purchaseUrl: 'https://example.com/diffuser',
      source: 'ai'
    }
  ];

  private occasionRecommendations = {
    birthday: {
      categories: ['Electronics', 'Fashion', 'Toys & Games', 'Personal'],
      priceMultiplier: 1.2,
      tags: ['celebration', 'personal', 'special']
    },
    anniversary: {
      categories: ['Jewelry', 'Personal', 'Home & Garden', 'Fashion'],
      priceMultiplier: 1.5,
      tags: ['romantic', 'luxury', 'sentimental']
    },
    christmas: {
      categories: ['Electronics', 'Toys & Games', 'Home & Garden', 'Fashion'],
      priceMultiplier: 1.3,
      tags: ['holiday', 'family', 'celebration']
    },
    wedding: {
      categories: ['Jewelry', 'Home & Garden', 'Personal', 'Luxury'],
      priceMultiplier: 2.0,
      tags: ['luxury', 'celebration', 'premium']
    }
  };

  async generateRecommendations(filters: RecommendationFilters): Promise<GiftRecommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let recommendations = this.mockGiftDatabase;

    // Filter by source
    if (filters.source !== 'all') {
      recommendations = recommendations.filter(item => item.source === filters.source);
    }

    // Filter by price range
    recommendations = recommendations.filter(item => 
      item.price >= filters.priceRange.min && item.price <= filters.priceRange.max
    );

    // Filter by category
    if (filters.category) {
      recommendations = recommendations.filter(item => 
        item.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Apply AI scoring based on context
    const scoredRecommendations = recommendations.map(item => {
      const score = this.calculateRecommendationScore(item, filters);
      return {
        ...item,
        confidence: score,
        reason: this.generateRecommendationReason(item, filters),
        source: item.source as 'ai' | 'popular' | 'trending' | 'personalized'
      };
    });

    // Sort by confidence score
    scoredRecommendations.sort((a, b) => b.confidence - a.confidence);

    // Return top recommendations
    return scoredRecommendations.slice(0, 12);
  }

  private calculateRecommendationScore(item: any, filters: RecommendationFilters): number {
    let score = 50; // Base score

    // Price range scoring
    const priceRange = filters.priceRange.max - filters.priceRange.min;
    const pricePosition = (item.price - filters.priceRange.min) / priceRange;
    if (pricePosition >= 0.3 && pricePosition <= 0.7) {
      score += 20; // Sweet spot in price range
    } else if (pricePosition >= 0.2 && pricePosition <= 0.8) {
      score += 10;
    }

    // Category preference scoring
    if (filters.category && item.category.toLowerCase() === filters.category.toLowerCase()) {
      score += 15;
    }

    // Source preference scoring
    if (filters.source === 'all' || item.source === filters.source) {
      score += 10;
    }

    // Interest matching (if we had interest data)
    if (filters.interests.length > 0) {
      const matchingInterests = filters.interests.filter(interest =>
        item.tags.some((tag: string) => 
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      score += matchingInterests.length * 10;
    }

    // Occasion-based scoring
    if (filters.occasionType) {
      const occasionPrefs = this.occasionRecommendations[filters.occasionType as keyof typeof this.occasionRecommendations];
      if (occasionPrefs) {
        if (occasionPrefs.categories.includes(item.category)) {
          score += 15;
        }
        if (occasionPrefs.tags.some(tag => item.tags.includes(tag))) {
          score += 10;
        }
      }
    }

    // Random variation for diversity
    score += Math.random() * 10 - 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private generateRecommendationReason(item: any, filters: RecommendationFilters): string {
    const reasons = [];

    if (filters.category && item.category.toLowerCase() === filters.category.toLowerCase()) {
      reasons.push(`Matches your selected category`);
    }

    if (filters.interests.length > 0) {
      const matchingInterests = filters.interests.filter(interest =>
        item.tags.some((tag: string) => 
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      if (matchingInterests.length > 0) {
        reasons.push(`Matches interests: ${matchingInterests.join(', ')}`);
      }
    }

    if (filters.occasionType) {
      const occasionPrefs = this.occasionRecommendations[filters.occasionType as keyof typeof this.occasionRecommendations];
      if (occasionPrefs && occasionPrefs.categories.includes(item.category)) {
        reasons.push(`Perfect for ${filters.occasionType} celebrations`);
      }
    }

    if (item.price >= filters.priceRange.min * 0.8 && item.price <= filters.priceRange.max * 1.2) {
      reasons.push(`Fits your budget range`);
    }

    if (reasons.length === 0) {
      reasons.push('Popular choice with great reviews');
    }

    return reasons.join('. ');
  }

  async getPersonalizedRecommendations(personId: string, occasionId?: string): Promise<GiftRecommendation[]> {
    // This would integrate with real user data and preferences
    const mockPreferences = {
      interests: ['Technology', 'Music', 'Fitness'],
      hobbies: ['Gaming', 'Photography'],
      favoriteCategories: ['Electronics', 'Sports'],
      priceRange: { min: 50, max: 300 }
    };

    const filters: RecommendationFilters = {
      personId,
      occasionId,
      priceRange: mockPreferences.priceRange,
      interests: [...mockPreferences.interests, ...mockPreferences.hobbies],
      source: 'personalized',
      urgency: 'medium'
    };

    return this.generateRecommendations(filters);
  }

  async getTrendingRecommendations(): Promise<GiftRecommendation[]> {
    const filters: RecommendationFilters = {
      priceRange: { min: 0, max: 1000 },
      interests: [],
      source: 'trending',
      urgency: 'medium'
    };

    return this.generateRecommendations(filters);
  }

  async getPopularRecommendations(): Promise<GiftRecommendation[]> {
    const filters: RecommendationFilters = {
      priceRange: { min: 0, max: 1000 },
      interests: [],
      source: 'popular',
      urgency: 'medium'
    };

    return this.generateRecommendations(filters);
  }

  async getOccasionRecommendations(occasionType: string, budget: number): Promise<GiftRecommendation[]> {
    const occasionPrefs = this.occasionRecommendations[occasionType as keyof typeof this.occasionRecommendations];
    
    if (!occasionPrefs) {
      return this.generateRecommendations({
        priceRange: { min: 0, max: budget },
        interests: [],
        source: 'all',
        urgency: 'medium'
      });
    }

    const filters: RecommendationFilters = {
      category: occasionPrefs.categories[0],
      priceRange: { min: 0, max: budget },
      interests: occasionPrefs.tags,
      occasionType,
      source: 'ai',
      urgency: 'medium'
    };

    return this.generateRecommendations(filters);
  }

  async analyzeGiftSuccess(giftId: string, recipientId: string): Promise<{
    successRate: number;
    similarGifts: GiftRecommendation[];
    improvements: string[];
  }> {
    // Mock analysis - in real app, this would analyze historical data
    return {
      successRate: 85,
      similarGifts: await this.getPersonalizedRecommendations(recipientId),
      improvements: [
        'Consider adding more personal touches',
        'Include a handwritten note',
        'Choose items within their preferred price range'
      ]
    };
  }

  async getRecommendationInsights(): Promise<{
    totalRecommendations: number;
    averageConfidence: number;
    topCategories: string[];
    popularPriceRanges: string[];
  }> {
    return {
      totalRecommendations: 156,
      averageConfidence: 78.5,
      topCategories: ['Electronics', 'Fashion', 'Home & Garden'],
      popularPriceRanges: ['$50-100', '$100-200', '$200-500']
    };
  }
}

export const recommendationService = new RecommendationService(); 