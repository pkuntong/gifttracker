import { User, Person, Gift, Occasion, Family, Budget, GiftPreferences } from '@/types';

// Mock data for development
const mockPeople: Person[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    relationship: 'Family',
    birthday: '1990-05-15',
    notes: 'Loves technology and gadgets',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    relationship: 'Friend',
    birthday: '1988-12-03',
    notes: 'Interested in cooking and gardening',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    relationship: 'Colleague',
    birthday: '1992-08-22',
    notes: 'Sports enthusiast',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockGifts: Gift[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling headphones',
    price: 199.99,
    currency: 'USD',
    status: 'planned',
    recipientId: '1',
    occasionId: '1',
    notes: 'For birthday',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Cookbook Collection',
    description: 'Gourmet cooking recipes',
    price: 45.99,
    currency: 'USD',
    status: 'purchased',
    recipientId: '2',
    occasionId: '2',
    notes: 'For Christmas',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockOccasions: Occasion[] = [
  {
    id: '1',
    name: 'John\'s Birthday',
    date: '2024-05-15',
    type: 'birthday',
    personId: '1',
    description: 'John\'s 34th birthday',
    budget: 200,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Christmas 2024',
    date: '2024-12-25',
    type: 'holiday',
    description: 'Family Christmas celebration',
    budget: 500,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Birthday Budget',
    amount: 300,
    currency: 'USD',
    period: 'monthly',
    type: 'occasion',
    occasionId: '1',
    description: 'Budget for birthday gifts',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    spent: 199.99,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Christmas Budget',
    amount: 500,
    currency: 'USD',
    period: 'yearly',
    type: 'occasion',
    occasionId: '2',
    description: 'Budget for Christmas gifts',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    spent: 45.99,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockFamilies: Family[] = [
  {
    id: '1',
    name: 'Smith Family',
    description: 'Immediate family members',
    members: [
      {
        id: '1',
        userId: '1',
        familyId: '1',
        role: 'owner',
        joinedAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockPreferences: GiftPreferences[] = [
  {
    id: '1',
    userId: '1',
    personId: '1',
    interests: ['Technology', 'Music', 'Gaming'],
    hobbies: ['Photography', 'Travel'],
    favoriteCategories: ['Electronics', 'Gaming'],
    priceRange: { min: 50, max: 300 },
    preferredStores: ['Amazon', 'Best Buy'],
    allergies: [],
    dislikes: ['Clothing'],
    notes: 'Prefers practical gifts',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

class MockApiService {
  // Simulate API delay
  private delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await this.delay();
    return {
      user: {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        createdAt: new Date().toISOString(),
        preferences: {
          currency: 'USD',
          timezone: 'UTC',
          notifications: true,
          theme: 'system'
        }
      },
      token: 'mock-token'
    };
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    await this.delay();
    return {
      user: {
        id: '1',
        name,
        email,
        createdAt: new Date().toISOString(),
        preferences: {
          currency: 'USD',
          timezone: 'UTC',
          notifications: true,
          theme: 'system'
        }
      },
      token: 'mock-token'
    };
  }

  async getCurrentUser(): Promise<User> {
    await this.delay();
    return {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      createdAt: new Date().toISOString(),
      preferences: {
        currency: 'USD',
        timezone: 'UTC',
        notifications: true,
        theme: 'system'
      }
    };
  }

  // People Management
  async getPeople(): Promise<Person[]> {
    await this.delay();
    return mockPeople;
  }

  async createPerson(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    await this.delay();
    const newPerson: Person = {
      ...person,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockPeople.push(newPerson);
    return newPerson;
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    await this.delay();
    const index = mockPeople.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Person not found');
    
    mockPeople[index] = { ...mockPeople[index], ...updates, updatedAt: new Date().toISOString() };
    return mockPeople[index];
  }

  async deletePerson(id: string): Promise<void> {
    await this.delay();
    const index = mockPeople.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Person not found');
    mockPeople.splice(index, 1);
  }

  // Gift Management
  async getGifts(): Promise<Gift[]> {
    await this.delay();
    return mockGifts;
  }

  async createGift(gift: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> {
    await this.delay();
    const newGift: Gift = {
      ...gift,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockGifts.push(newGift);
    return newGift;
  }

  async updateGift(id: string, updates: Partial<Gift>): Promise<Gift> {
    await this.delay();
    const index = mockGifts.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Gift not found');
    
    mockGifts[index] = { ...mockGifts[index], ...updates, updatedAt: new Date().toISOString() };
    return mockGifts[index];
  }

  async deleteGift(id: string): Promise<void> {
    await this.delay();
    const index = mockGifts.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Gift not found');
    mockGifts.splice(index, 1);
  }

  // Occasion Management
  async getOccasions(): Promise<Occasion[]> {
    await this.delay();
    return mockOccasions;
  }

  async createOccasion(occasion: Omit<Occasion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Occasion> {
    await this.delay();
    const newOccasion: Occasion = {
      ...occasion,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockOccasions.push(newOccasion);
    return newOccasion;
  }

  async updateOccasion(id: string, updates: Partial<Occasion>): Promise<Occasion> {
    await this.delay();
    const index = mockOccasions.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Occasion not found');
    
    mockOccasions[index] = { ...mockOccasions[index], ...updates, updatedAt: new Date().toISOString() };
    return mockOccasions[index];
  }

  async deleteOccasion(id: string): Promise<void> {
    await this.delay();
    const index = mockOccasions.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Occasion not found');
    mockOccasions.splice(index, 1);
  }

  // Budget Management
  async getBudgets(): Promise<Budget[]> {
    await this.delay();
    return mockBudgets;
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    await this.delay();
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockBudgets.push(newBudget);
    return newBudget;
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    await this.delay();
    const index = mockBudgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    
    mockBudgets[index] = { ...mockBudgets[index], ...updates, updatedAt: new Date().toISOString() };
    return mockBudgets[index];
  }

  async deleteBudget(id: string): Promise<void> {
    await this.delay();
    const index = mockBudgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    mockBudgets.splice(index, 1);
  }

  // Family Management
  async getFamilies(): Promise<Family[]> {
    await this.delay();
    return mockFamilies;
  }

  async createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<Family> {
    await this.delay();
    const newFamily: Family = {
      ...family,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockFamilies.push(newFamily);
    return newFamily;
  }

  async updateFamily(id: string, updates: Partial<Family>): Promise<Family> {
    await this.delay();
    const index = mockFamilies.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Family not found');
    
    mockFamilies[index] = { ...mockFamilies[index], ...updates, updatedAt: new Date().toISOString() };
    return mockFamilies[index];
  }

  async deleteFamily(id: string): Promise<void> {
    await this.delay();
    const index = mockFamilies.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Family not found');
    mockFamilies.splice(index, 1);
  }

  // Gift Preferences
  async getGiftPreferences(personId: string): Promise<GiftPreferences | null> {
    await this.delay();
    return mockPreferences.find(p => p.personId === personId) || null;
  }

  async createGiftPreferences(preferences: Omit<GiftPreferences, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftPreferences> {
    await this.delay();
    const newPreferences: GiftPreferences = {
      ...preferences,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockPreferences.push(newPreferences);
    return newPreferences;
  }

  async updateGiftPreferences(personId: string, updates: Partial<GiftPreferences>): Promise<GiftPreferences> {
    await this.delay();
    const index = mockPreferences.findIndex(p => p.personId === personId);
    if (index === -1) throw new Error('Preferences not found');
    
    mockPreferences[index] = { ...mockPreferences[index], ...updates, updatedAt: new Date().toISOString() };
    return mockPreferences[index];
  }

  async deleteGiftPreferences(personId: string): Promise<void> {
    await this.delay();
    const index = mockPreferences.findIndex(p => p.personId === personId);
    if (index === -1) throw new Error('Preferences not found');
    mockPreferences.splice(index, 1);
  }

  // Mock other API methods that might be called
  async getGiftRecommendations(filters: Record<string, unknown>): Promise<Array<Record<string, unknown>>> {
    await this.delay();
    return [];
  }

  async getNotifications(): Promise<Array<Record<string, unknown>>> {
    await this.delay();
    return [];
  }

  async getAnalytics(): Promise<Record<string, unknown>> {
    await this.delay();
    return {
      giftStats: {
        totalGifts: mockGifts.length,
        completedGifts: mockGifts.filter(g => g.status === 'given').length,
        pendingGifts: mockGifts.filter(g => g.status === 'planned').length,
        averageGiftPrice: mockGifts.reduce((sum, g) => sum + g.price, 0) / mockGifts.length,
        totalSpent: mockGifts.filter(g => g.status === 'purchased' || g.status === 'given').reduce((sum, g) => sum + g.price, 0),
        budgetUtilization: 65
      },
      occasionStats: {
        totalOccasions: mockOccasions.length,
        upcomingOccasions: mockOccasions.filter(o => new Date(o.date) > new Date()).length,
        averageGiftsPerOccasion: mockGifts.length / mockOccasions.length,
        mostPopularOccasionType: 'birthday'
      },
      peopleStats: {
        totalPeople: mockPeople.length,
        averageGiftsPerPerson: mockGifts.length / mockPeople.length,
        mostGiftedPerson: mockPeople[0]?.name || 'Unknown'
      },
      budgetStats: {
        totalBudgets: mockBudgets.length,
        totalBudgetAmount: mockBudgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: mockBudgets.reduce((sum, b) => sum + b.spent, 0),
        averageBudgetUtilization: 75
      }
    };
  }

  // Tracking Management
  async getTrackingItems(): Promise<Array<Record<string, unknown>>> {
    await this.delay();
    return [
      {
        id: '1',
        giftId: '1',
        trackingNumber: '1Z999AA1234567890',
        carrier: 'ups',
        status: 'in_transit',
        estimatedDelivery: '2024-01-15',
        currentLocation: 'Memphis, TN',
        events: [
          {
            id: '1',
            timestamp: '2024-01-13T10:30:00Z',
            location: 'Memphis, TN',
            status: 'In Transit',
            description: 'Package has left the facility'
          },
          {
            id: '2',
            timestamp: '2024-01-12T15:45:00Z',
            location: 'Atlanta, GA',
            status: 'Departed',
            description: 'Package departed from Atlanta facility'
          },
          {
            id: '3',
            timestamp: '2024-01-12T08:20:00Z',
            location: 'Atlanta, GA',
            status: 'Arrived',
            description: 'Package arrived at Atlanta facility'
          }
        ],
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-13T10:30:00Z'
      },
      {
        id: '2',
        giftId: '2',
        trackingNumber: '9400100000000000000000',
        carrier: 'usps',
        status: 'delivered',
        estimatedDelivery: '2024-01-14',
        actualDelivery: '2024-01-14T14:30:00Z',
        currentLocation: 'Delivered',
        events: [
          {
            id: '4',
            timestamp: '2024-01-14T14:30:00Z',
            location: 'Home Address',
            status: 'Delivered',
            description: 'Package delivered to recipient'
          },
          {
            id: '5',
            timestamp: '2024-01-14T08:15:00Z',
            location: 'Local Post Office',
            status: 'Out for Delivery',
            description: 'Package out for delivery'
          }
        ],
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-14T14:30:00Z'
      }
    ];
  }

  async createTrackingItem(tracking: Record<string, unknown>): Promise<Record<string, unknown>> {
    await this.delay();
    const newTracking = {
      ...tracking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newTracking;
  }

  async updateTrackingItem(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    await this.delay();
    return { id, ...updates, updatedAt: new Date().toISOString() };
  }

  async deleteTrackingItem(id: string): Promise<void> {
    await this.delay();
    // Mock deletion
  }
}

export const mockApiService = new MockApiService(); 