import { User, Person, Gift, Occasion, Family, Budget, Notification, Analytics, Report, GiftIdea, GiftRecommendation, GiftPreferences, SearchFilters, SearchResult, SearchSuggestion, SavedSearch, ExportData, ImportData, ImportResult, ExportOptions, BackupData, ImportValidation, Wishlist, WishlistItem, WishlistComment, WishlistCollaborator, WishlistInvitation, WishlistShare, WishlistActivity, Reminder, ReminderChannel, ReminderTemplate, ReminderRule, NotificationPreferences, NotificationHistory, SmartReminder, GiftCategory, CategoryHierarchy, CategoryStats, GiftTag, TagUsage, TagStats } from '@/types';
import { mockApiService } from './mockApiService';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://your-backend-url.com/api' : 'http://localhost:3001/api');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Check if we're in development mode and should use mock API
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const shouldUseMockApi = isDevelopment || !import.meta.env.VITE_API_URL || API_BASE_URL.includes('localhost');

// API Service Class
export class ApiService {
  // Authentication
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (shouldUseMockApi) {
      return mockApiService.login(email, password);
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  }

  static async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  }

  static async getCurrentUser(): Promise<User> {
    if (shouldUseMockApi) {
      return mockApiService.getCurrentUser();
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // People Management
  static async getPeople(): Promise<Person[]> {
    if (shouldUseMockApi) {
      return mockApiService.getPeople();
    }
    
    const response = await fetch(`${API_BASE_URL}/people`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createPerson(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const response = await fetch(`${API_BASE_URL}/people`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(person),
    });
    return handleResponse(response);
  }

  static async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const response = await fetch(`${API_BASE_URL}/people/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deletePerson(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/people/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Gift Management
  static async getGifts(): Promise<Gift[]> {
    if (shouldUseMockApi) {
      return mockApiService.getGifts();
    }
    
    const response = await fetch(`${API_BASE_URL}/gifts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createGift(gift: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> {
    const response = await fetch(`${API_BASE_URL}/gifts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gift),
    });
    return handleResponse(response);
  }

  static async updateGift(id: string, updates: Partial<Gift>): Promise<Gift> {
    const response = await fetch(`${API_BASE_URL}/gifts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteGift(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/gifts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Occasion Management
  static async getOccasions(): Promise<Occasion[]> {
    if (shouldUseMockApi) {
      return mockApiService.getOccasions();
    }
    
    const response = await fetch(`${API_BASE_URL}/occasions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createOccasion(occasion: Omit<Occasion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Occasion> {
    const response = await fetch(`${API_BASE_URL}/occasions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(occasion),
    });
    return handleResponse(response);
  }

  static async updateOccasion(id: string, updates: Partial<Occasion>): Promise<Occasion> {
    const response = await fetch(`${API_BASE_URL}/occasions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteOccasion(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/occasions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Family Management
  static async getFamilies(): Promise<Family[]> {
    const response = await fetch(`${API_BASE_URL}/families`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<Family> {
    const response = await fetch(`${API_BASE_URL}/families`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(family),
    });
    return handleResponse(response);
  }

  static async inviteFamilyMember(familyId: string, email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  }

  static async updateFamily(id: string, updates: Partial<Family>): Promise<Family> {
    const response = await fetch(`${API_BASE_URL}/families/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteFamily(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/families/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async removeFamilyMember(familyId: string, memberId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Notification Management
  static async getNotifications(): Promise<Notification[]> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    return handleResponse(response);
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async sendTestNotification(data: { type: string; channel: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  // Budget Management
  static async getBudgets(): Promise<Budget[]> {
    if (shouldUseMockApi) {
      return mockApiService.getBudgets();
    }
    
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(budget),
    });
    return handleResponse(response);
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteBudget(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // User Profile
  static async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async updatePreferences(preferences: User['preferences']): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ preferences }),
    });
    return handleResponse(response);
  }

  // Analytics
  static async getAnalytics(filters?: {
    dateRange?: { start: string; end: string };
    people?: string[];
    occasions?: string[];
    categories?: string[];
  }): Promise<Analytics> {
    if (shouldUseMockApi) {
      return mockApiService.getAnalytics();
    }
    
    const params = new URLSearchParams();
    if (filters) {
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters.people) {
        filters.people.forEach(person => params.append('people', person));
      }
      if (filters.occasions) {
        filters.occasions.forEach(occasion => params.append('occasions', occasion));
      }
      if (filters.categories) {
        filters.categories.forEach(category => params.append('categories', category));
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/analytics?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Reports
  static async getReports(): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createReport(report: Omit<Report, 'id' | 'userId' | 'createdAt'>): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(report),
    });
    return handleResponse(response);
  }

  static async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteReport(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async generateReport(type: Report['type'], filters?: Report['filters']): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, filters }),
    });
    return handleResponse(response);
  }

  static async exportReport(id: string, format: 'pdf' | 'csv' | 'json'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/export?format=${format}`, {
      headers: getAuthHeaders(),
    });
    return response.blob();
  }

  // Gift Ideas
  static async getGiftIdeas(): Promise<GiftIdea[]> {
    const response = await fetch(`${API_BASE_URL}/gift-ideas`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createGiftIdea(giftIdea: Omit<GiftIdea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<GiftIdea> {
    const response = await fetch(`${API_BASE_URL}/gift-ideas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(giftIdea),
    });
    return handleResponse(response);
  }

  static async updateGiftIdea(id: string, updates: Partial<GiftIdea>): Promise<GiftIdea> {
    const response = await fetch(`${API_BASE_URL}/gift-ideas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteGiftIdea(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/gift-ideas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async toggleFavorite(id: string): Promise<GiftIdea> {
    const response = await fetch(`${API_BASE_URL}/gift-ideas/${id}/favorite`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Gift Recommendations
  static async getGiftRecommendations(filters?: {
    personId?: string;
    occasionId?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    interests?: string[];
  }): Promise<GiftRecommendation[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.personId) params.append('personId', filters.personId);
      if (filters.occasionId) params.append('occasionId', filters.occasionId);
      if (filters.category) params.append('category', filters.category);
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.interests) {
        filters.interests.forEach(interest => params.append('interests', interest));
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/gift-recommendations?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async generatePersonalizedRecommendations(personId: string, occasionId?: string): Promise<GiftRecommendation[]> {
    const params = new URLSearchParams();
    params.append('personId', personId);
    if (occasionId) params.append('occasionId', occasionId);
    
    const response = await fetch(`${API_BASE_URL}/gift-recommendations/personalized?${params}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Gift Preferences
  static async getGiftPreferences(personId: string): Promise<GiftPreferences | null> {
    if (shouldUseMockApi) {
      return mockApiService.getGiftPreferences(personId);
    }
    
    const response = await fetch(`${API_BASE_URL}/gift-preferences/${personId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createGiftPreferences(preferences: Omit<GiftPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<GiftPreferences> {
    const response = await fetch(`${API_BASE_URL}/gift-preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    return handleResponse(response);
  }

  static async updateGiftPreferences(personId: string, updates: Partial<GiftPreferences>): Promise<GiftPreferences> {
    const response = await fetch(`${API_BASE_URL}/gift-preferences/${personId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteGiftPreferences(personId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/gift-preferences/${personId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Tracking Management
  static async getTrackingItems(): Promise<Array<Record<string, unknown>>> {
    if (shouldUseMockApi) {
      return mockApiService.getTrackingItems();
    }
    
    const response = await fetch(`${API_BASE_URL}/tracking`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createTrackingItem(tracking: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (shouldUseMockApi) {
      return mockApiService.createTrackingItem(tracking);
    }
    
    const response = await fetch(`${API_BASE_URL}/tracking`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tracking),
    });
    return handleResponse(response);
  }

  static async updateTrackingItem(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (shouldUseMockApi) {
      return mockApiService.updateTrackingItem(id, updates);
    }
    
    const response = await fetch(`${API_BASE_URL}/tracking/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteTrackingItem(id: string): Promise<void> {
    if (shouldUseMockApi) {
      return mockApiService.deleteTrackingItem(id);
    }
    
    const response = await fetch(`${API_BASE_URL}/tracking/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Search and Filter Methods
  static async search(filters: SearchFilters): Promise<SearchResult[]> {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(filters),
    });
    return handleResponse(response);
  }

  static async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    const response = await fetch(`${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getSavedSearches(): Promise<SavedSearch[]> {
    const response = await fetch(`${API_BASE_URL}/search/saved`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedSearch> {
    const response = await fetch(`${API_BASE_URL}/search/saved`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(search),
    });
    return handleResponse(response);
  }

  static async updateSavedSearch(id: string, search: Partial<SavedSearch>): Promise<SavedSearch> {
    const response = await fetch(`${API_BASE_URL}/search/saved/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(search),
    });
    return handleResponse(response);
  }

  static async deleteSavedSearch(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/search/saved/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getSearchHistory(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/search/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async clearSearchHistory(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/search/history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getPopularSearches(): Promise<SearchSuggestion[]> {
    const response = await fetch(`${API_BASE_URL}/search/popular`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getSearchStats(): Promise<{
    totalSearches: number;
    popularTerms: string[];
    recentSearches: string[];
  }> {
    const response = await fetch(`${API_BASE_URL}/search/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Data Import/Export Methods
  static async exportData(options: ExportOptions): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/data/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || `Export failed! status: ${response.status}`);
    }
    
    return response.blob();
  }

  static async importData(file: File, options?: {
    overwrite?: boolean;
    skipDuplicates?: boolean;
    validateOnly?: boolean;
  }): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${API_BASE_URL}/data/import`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
    return handleResponse(response);
  }

  static async validateImportData(file: File): Promise<ImportValidation> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('validateOnly', 'true');

    const response = await fetch(`${API_BASE_URL}/data/import/validate`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    return handleResponse(response);
  }

  static async createBackup(name: string, description?: string): Promise<BackupData> {
    const response = await fetch(`${API_BASE_URL}/data/backup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  }

  static async getBackups(): Promise<BackupData[]> {
    const response = await fetch(`${API_BASE_URL}/data/backup`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async restoreBackup(backupId: string): Promise<ImportResult> {
    const response = await fetch(`${API_BASE_URL}/data/backup/${backupId}/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async deleteBackup(backupId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/data/backup/${backupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async downloadBackup(backupId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/data/backup/${backupId}/download`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || `Download failed! status: ${response.status}`);
    }
    
    return response.blob();
  }

  static async getExportTemplates(): Promise<{
    name: string;
    description: string;
    options: ExportOptions;
  }[]> {
    const response = await fetch(`${API_BASE_URL}/data/export/templates`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async saveExportTemplate(name: string, description: string, options: ExportOptions): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/data/export/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, options }),
    });
    return handleResponse(response);
  }

  static async getImportHistory(): Promise<{
    id: string;
    fileName: string;
    importedAt: string;
    status: 'success' | 'partial' | 'failed';
    imported: ImportResult['imported'];
    errors: string[];
  }[]> {
    const response = await fetch(`${API_BASE_URL}/data/import/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getDataStats(): Promise<{
    totalPeople: number;
    totalGifts: number;
    totalOccasions: number;
    totalBudgets: number;
    totalFamilies: number;
    totalGiftIdeas: number;
    lastBackup?: string;
    dataSize: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/data/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Methods
  static async getWishlists(): Promise<Wishlist[]> {
    const response = await fetch(`${API_BASE_URL}/wishlists`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createWishlist(wishlist: Omit<Wishlist, 'id' | 'userId' | 'items' | 'collaborators' | 'createdAt' | 'updatedAt'>): Promise<Wishlist> {
    const response = await fetch(`${API_BASE_URL}/wishlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wishlist),
    });
    return handleResponse(response);
  }

  static async updateWishlist(id: string, updates: Partial<Wishlist>): Promise<Wishlist> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteWishlist(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getWishlist(id: string): Promise<Wishlist> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getPublicWishlist(shareCode: string): Promise<Wishlist> {
    const response = await fetch(`${API_BASE_URL}/wishlists/public/${shareCode}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Items
  static async addWishlistItem(wishlistId: string, item: Omit<WishlistItem, 'id' | 'wishlistId' | 'comments' | 'createdAt' | 'updatedAt'>): Promise<WishlistItem> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  }

  static async updateWishlistItem(wishlistId: string, itemId: string, updates: Partial<WishlistItem>): Promise<WishlistItem> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteWishlistItem(wishlistId: string, itemId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async reserveWishlistItem(wishlistId: string, itemId: string): Promise<WishlistItem> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/reserve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async purchaseWishlistItem(wishlistId: string, itemId: string): Promise<WishlistItem> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/purchase`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Comments
  static async addWishlistComment(itemId: string, comment: Omit<WishlistComment, 'id' | 'itemId' | 'userId' | 'userName' | 'createdAt'>): Promise<WishlistComment> {
    const response = await fetch(`${API_BASE_URL}/wishlist-items/${itemId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(comment),
    });
    return handleResponse(response);
  }

  static async deleteWishlistComment(itemId: string, commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist-items/${itemId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Collaboration
  static async inviteWishlistCollaborator(wishlistId: string, email: string, role: 'viewer' | 'contributor' | 'admin'): Promise<WishlistInvitation> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, role }),
    });
    return handleResponse(response);
  }

  static async acceptWishlistInvitation(invitationId: string): Promise<WishlistCollaborator> {
    const response = await fetch(`${API_BASE_URL}/wishlist-invitations/${invitationId}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async declineWishlistInvitation(invitationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist-invitations/${invitationId}/decline`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async removeWishlistCollaborator(wishlistId: string, collaboratorId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/collaborators/${collaboratorId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async updateWishlistCollaboratorRole(wishlistId: string, collaboratorId: string, role: 'viewer' | 'contributor' | 'admin'): Promise<WishlistCollaborator> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/collaborators/${collaboratorId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  }

  // Wishlist Sharing
  static async shareWishlist(wishlistId: string, shareType: 'public' | 'private' | 'collaborative', options?: {
    password?: string;
    expiresAt?: string;
  }): Promise<WishlistShare> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/share`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ shareType, ...options }),
    });
    return handleResponse(response);
  }

  static async unshareWishlist(wishlistId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/share`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getWishlistShares(wishlistId: string): Promise<WishlistShare[]> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/shares`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Activity
  static async getWishlistActivity(wishlistId: string): Promise<WishlistActivity[]> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/activity`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Analytics
  static async getWishlistStats(wishlistId: string): Promise<{
    totalItems: number;
    availableItems: number;
    reservedItems: number;
    purchasedItems: number;
    totalValue: number;
    averagePrice: number;
    mostPopularCategory: string;
    recentActivity: WishlistActivity[];
  }> {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Search
  static async searchWishlists(query: string): Promise<Wishlist[]> {
    const response = await fetch(`${API_BASE_URL}/wishlists/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Wishlist Templates
  static async getWishlistTemplates(): Promise<{
    id: string;
    name: string;
    description: string;
    category: string;
    items: Omit<WishlistItem, 'id' | 'wishlistId' | 'comments' | 'createdAt' | 'updatedAt'>[];
  }[]> {
    const response = await fetch(`${API_BASE_URL}/wishlists/templates`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createWishlistFromTemplate(templateId: string, name: string, description?: string): Promise<Wishlist> {
    const response = await fetch(`${API_BASE_URL}/wishlists/templates/${templateId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  }

  // Reminder Methods
  static async getReminders(): Promise<Reminder[]> {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createReminder(reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder),
    });
    return handleResponse(response);
  }

  static async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteReminder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async dismissReminder(id: string): Promise<Reminder> {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}/dismiss`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async completeReminder(id: string): Promise<Reminder> {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Reminder Templates
  static async getReminderTemplates(): Promise<ReminderTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/reminders/templates`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createReminderTemplate(template: Omit<ReminderTemplate, 'id' | 'createdAt'>): Promise<ReminderTemplate> {
    const response = await fetch(`${API_BASE_URL}/reminders/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(template),
    });
    return handleResponse(response);
  }

  static async updateReminderTemplate(id: string, updates: Partial<ReminderTemplate>): Promise<ReminderTemplate> {
    const response = await fetch(`${API_BASE_URL}/reminders/templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteReminderTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reminders/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Reminder Rules
  static async getReminderRules(): Promise<ReminderRule[]> {
    const response = await fetch(`${API_BASE_URL}/reminders/rules`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createReminderRule(rule: Omit<ReminderRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ReminderRule> {
    const response = await fetch(`${API_BASE_URL}/reminders/rules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rule),
    });
    return handleResponse(response);
  }

  static async updateReminderRule(id: string, updates: Partial<ReminderRule>): Promise<ReminderRule> {
    const response = await fetch(`${API_BASE_URL}/reminders/rules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  }

  static async deleteReminderRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reminders/rules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Notification Preferences
  static async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Notification History
  static async getNotificationHistory(filters?: {
    type?: string;
    channel?: string;
    status?: string;
    dateRange?: { start: string; end: string };
  }): Promise<NotificationHistory[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value);
          }
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/notifications/history?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Smart Reminders
  static async getSmartReminders(): Promise<SmartReminder[]> {
    const response = await fetch(`${API_BASE_URL}/reminders/smart`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async dismissSmartReminder(id: string): Promise<SmartReminder> {
    const response = await fetch(`${API_BASE_URL}/reminders/smart/${id}/dismiss`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Reminder Analytics
  static async getReminderStats(): Promise<{
    totalReminders: number;
    pendingReminders: number;
    completedReminders: number;
    dismissedReminders: number;
    upcomingReminders: Reminder[];
    reminderEffectiveness: {
      completed: number;
      dismissed: number;
      missed: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/reminders/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Test Notifications
  static async testNotification(channel: string, type: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ channel, type }),
    });
    return handleResponse(response);
  }

  // Bulk Reminder Operations
  static async createBulkReminders(reminders: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]): Promise<Reminder[]> {
    const response = await fetch(`${API_BASE_URL}/reminders/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reminders }),
    });
    return handleResponse(response);
  }

  static async updateBulkReminders(updates: { id: string; updates: Partial<Reminder> }[]): Promise<Reminder[]> {
    const response = await fetch(`${API_BASE_URL}/reminders/bulk`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ updates }),
    });
    return handleResponse(response);
  }

  static async deleteBulkReminders(ids: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reminders/bulk`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });
    return handleResponse(response);
  }

  // Gift Categories & Tags
  static async getCategories(): Promise<GiftCategory[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getCategory(id: string): Promise<GiftCategory> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createCategory(category: Omit<GiftCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftCategory> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  }

  static async updateCategory(id: string, category: Partial<GiftCategory>): Promise<GiftCategory> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  }

  static async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getCategoryHierarchy(): Promise<CategoryHierarchy[]> {
    const response = await fetch(`${API_BASE_URL}/categories/hierarchy`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getCategoryStats(): Promise<CategoryStats[]> {
    const response = await fetch(`${API_BASE_URL}/categories/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getTags(): Promise<GiftTag[]> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getTag(id: string): Promise<GiftTag> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async createTag(tag: Omit<GiftTag, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<GiftTag> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tag),
    });
    return handleResponse(response);
  }

  static async updateTag(id: string, tag: Partial<GiftTag>): Promise<GiftTag> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tag),
    });
    return handleResponse(response);
  }

  static async deleteTag(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getTagUsage(): Promise<TagUsage[]> {
    const response = await fetch(`${API_BASE_URL}/tags/usage`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getTagStats(): Promise<TagStats[]> {
    const response = await fetch(`${API_BASE_URL}/tags/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async assignTagsToGift(giftId: string, tagIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tagIds }),
    });
    return handleResponse(response);
  }

  static async removeTagsFromGift(giftId: string, tagIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/tags`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tagIds }),
    });
    return handleResponse(response);
  }

  static async getGiftTags(giftId: string): Promise<GiftTag[]> {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/tags`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async searchTags(query: string): Promise<GiftTag[]> {
    const response = await fetch(`${API_BASE_URL}/tags/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async getPopularTags(limit: number = 10): Promise<GiftTag[]> {
    const response = await fetch(`${API_BASE_URL}/tags/popular?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  static async mergeTags(sourceId: string, targetId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags/${sourceId}/merge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetId }),
    });
    return handleResponse(response);
  }

  static async bulkCreateTags(tags: Array<Omit<GiftTag, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>>): Promise<GiftTag[]> {
    const response = await fetch(`${API_BASE_URL}/tags/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tags }),
    });
    return handleResponse(response);
  }

  static async exportCategories(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/categories/export`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.text(); // Assuming the API returns a string for export
  }

  static async importCategories(data: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data }),
    });
    return handleResponse(response);
  }

  static async exportTags(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/tags/export`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.text(); // Assuming the API returns a string for export
  }

  static async importTags(data: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data }),
    });
    return handleResponse(response);
  }
}

export { ApiError }; 