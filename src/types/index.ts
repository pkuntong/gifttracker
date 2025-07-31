export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  preferences?: UserPreferences;
  subscription?: {
    plan: 'FREE' | 'PREMIUM';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: string;
  };
}

export interface UserPreferences {
  currency: string;
  timezone: string;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  relationship: string;
  birthday?: string;
  notes?: string;
  avatar?: string;
  familyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  status: 'planned' | 'purchased' | 'wrapped' | 'given';
  recipientId: string;
  occasionId?: string;
  purchasedAt?: string;
  givenAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Occasion {
  id: string;
  name: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
  personId?: string;
  description?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  members: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'custom';
  type: 'occasion' | 'person' | 'general';
  personId?: string;
  occasionId?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'occasion_reminder' | 'gift_status_update' | 'budget_alert' | 'family_update';
  title: string;
  message: string;
  channel: 'email' | 'in_app' | 'both';
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
}

export interface Analytics {
  giftStats: {
    totalGifts: number;
    completedGifts: number;
    pendingGifts: number;
    averageGiftPrice: number;
    totalSpent: number;
    budgetUtilization: number;
  };
  occasionStats: {
    totalOccasions: number;
    upcomingOccasions: number;
    averageGiftsPerOccasion: number;
    mostPopularOccasionType: string;
  };
  peopleStats: {
    totalPeople: number;
    averageGiftsPerPerson: number;
    mostGiftedPerson: string;
  };
  budgetStats: {
    totalBudgets: number;
    totalBudgetAmount: number;
    totalSpent: number;
    averageBudgetUtilization: number;
  };
  familyStats: {
    totalFamilies: number;
    totalFamilyMembers: number;
    averageFamilySize: number;
  };
  monthlyTrends: {
    month: string;
    giftsPurchased: number;
    amountSpent: number;
    occasions: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    totalSpent: number;
  }[];
  spendingByPerson: {
    personName: string;
    totalSpent: number;
    giftCount: number;
  }[];
}

export interface Report {
  id: string;
  userId: string;
  type: 'gift_summary' | 'budget_report' | 'occasion_report' | 'spending_analysis' | 'family_report';
  title: string;
  description: string;
  data: Record<string, unknown>;
  filters: {
    dateRange?: { start: string; end: string };
    people?: string[];
    occasions?: string[];
    categories?: string[];
    budgetRange?: { min: number; max: number };
  };
  createdAt: string;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastGenerated?: string;
  nextScheduled?: string;
}

export interface GiftIdea {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  source: 'manual' | 'recommendation' | 'imported';
  tags: string[];
  imageUrl?: string;
  purchaseUrl?: string;
  recipientId?: string;
  occasionId?: string;
  isFavorite: boolean;
  isPurchased: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  confidence: number; // 0-100
  reason: string;
  tags: string[];
  imageUrl?: string;
  purchaseUrl?: string;
  source: 'ai' | 'popular' | 'trending' | 'personalized';
}

export interface GiftPreferences {
  id: string;
  userId: string;
  personId: string;
  interests: string[];
  hobbies: string[];
  favoriteCategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  preferredStores: string[];
  allergies?: string[];
  dislikes: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  category: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
  people: string[];
  occasions: string[];
  families: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  type: 'gift' | 'person' | 'occasion' | 'budget' | 'family' | 'gift-idea';
  title: string;
  description: string;
  tags: string[];
  relevance: number;
  data: Record<string, unknown>;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'tag' | 'person' | 'occasion' | 'category';
  count: number;
}

// Data Import/Export Types
export interface ExportData {
  version: string;
  exportedAt: string;
  user: User;
  data: {
    people: Person[];
    gifts: Gift[];
    occasions: Occasion[];
    budgets: Budget[];
    families: Family[];
    giftIdeas: GiftIdea[];
    giftPreferences: GiftPreferences[];
    savedSearches: SavedSearch[];
  };
}

export interface ImportData {
  version: string;
  exportedAt: string;
  user: User;
  data: {
    people: Person[];
    gifts: Gift[];
    occasions: Occasion[];
    budgets: Budget[];
    families: Family[];
    giftIdeas: GiftIdea[];
    giftPreferences: GiftPreferences[];
    savedSearches: SavedSearch[];
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    people: number;
    gifts: number;
    occasions: number;
    budgets: number;
    families: number;
    giftIdeas: number;
    giftPreferences: number;
    savedSearches: number;
  };
  errors: string[];
  duplicates: {
    people: string[];
    gifts: string[];
    occasions: string[];
    budgets: string[];
    families: string[];
    giftIdeas: string[];
    giftPreferences: string[];
    savedSearches: string[];
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeData: {
    people: boolean;
    gifts: boolean;
    occasions: boolean;
    budgets: boolean;
    families: boolean;
    giftIdeas: boolean;
    giftPreferences: boolean;
    savedSearches: boolean;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    people?: string[];
    occasions?: string[];
    categories?: string[];
    status?: string[];
  };
}

export interface BackupData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  data: ExportData;
  createdAt: string;
  size: number;
  isAutoBackup: boolean;
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataPreview: {
    people: number;
    gifts: number;
    occasions: number;
    budgets: number;
    families: number;
    giftIdeas: number;
    giftPreferences: number;
    savedSearches: number;
  };
}

// Gift Wishlist Types
export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  shareUrl?: string;
  shareCode?: string;
  items: WishlistItem[];
  collaborators: WishlistCollaborator[];
  settings: {
    allowComments: boolean;
    allowPurchases: boolean;
    showPrices: boolean;
    allowDuplicates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'available' | 'reserved' | 'purchased' | 'unavailable';
  imageUrl?: string;
  purchaseUrl?: string;
  store?: string;
  tags: string[];
  notes?: string;
  reservedBy?: string;
  purchasedBy?: string;
  purchasedAt?: string;
  comments: WishlistComment[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistComment {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface WishlistCollaborator {
  id: string;
  wishlistId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'viewer' | 'contributor' | 'admin';
  invitedBy: string;
  invitedAt: string;
  joinedAt?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface WishlistInvitation {
  id: string;
  wishlistId: string;
  email: string;
  role: 'viewer' | 'contributor' | 'admin';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface WishlistShare {
  id: string;
  wishlistId: string;
  shareType: 'public' | 'private' | 'collaborative';
  shareUrl: string;
  shareCode?: string;
  password?: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
}

export interface WishlistActivity {
  id: string;
  wishlistId: string;
  userId: string;
  userName: string;
  action: 'item_added' | 'item_updated' | 'item_removed' | 'item_purchased' | 'item_reserved' | 'comment_added' | 'collaborator_added' | 'collaborator_removed';
  itemId?: string;
  itemTitle?: string;
  details?: string;
  createdAt: string;
}

// Reminder & Notification Types
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'occasion' | 'gift_deadline' | 'budget_alert' | 'shipping_deadline' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'dismissed' | 'completed';
  scheduledFor: string;
  sentAt?: string;
  dismissedAt?: string;
  completedAt?: string;
  channels: ReminderChannel[];
  relatedData?: {
    personId?: string;
    occasionId?: string;
    giftId?: string;
    budgetId?: string;
  };
  repeatSettings?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    maxOccurrences?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReminderChannel {
  id: string;
  reminderId: string;
  type: 'email' | 'push' | 'sms' | 'in_app' | 'calendar';
  enabled: boolean;
  settings: {
    advanceNotice?: number; // minutes
    template?: string;
    customMessage?: string;
  };
}

export interface ReminderTemplate {
  id: string;
  name: string;
  description: string;
  type: Reminder['type'];
  title: string;
  message: string;
  defaultAdvanceNotice: number; // minutes
  defaultChannels: ReminderChannel['type'][];
  isSystem: boolean;
  createdAt: string;
}

export interface ReminderRule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  conditions: {
    occasionType?: string[];
    daysInAdvance?: number;
    giftStatus?: string[];
    budgetThreshold?: number;
    personId?: string[];
  };
  actions: {
    createReminder: boolean;
    reminderTemplate?: string;
    advanceNotice?: number;
    channels?: ReminderChannel['type'][];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: string[];
    quietHours?: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
  };
  push: {
    enabled: boolean;
    types: string[];
    sound: boolean;
    vibration: boolean;
  };
  sms: {
    enabled: boolean;
    phoneNumber?: string;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration: number; // seconds
  };
  calendar: {
    enabled: boolean;
    defaultCalendar?: string;
    includeDetails: boolean;
  };
}

export interface NotificationHistory {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: ReminderChannel['type'];
  status: 'sent' | 'delivered' | 'failed' | 'read';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  metadata?: {
    reminderId?: string;
    personId?: string;
    occasionId?: string;
    giftId?: string;
  };
}

export interface SmartReminder {
  id: string;
  userId: string;
  type: 'shipping_estimate' | 'budget_warning' | 'gift_suggestion' | 'occasion_preparation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data: {
    estimatedShippingDays?: number;
    budgetUtilization?: number;
    suggestedGifts?: string[];
    preparationTasks?: string[];
  };
  scheduledFor: string;
  isDismissed: boolean;
  dismissedAt?: string;
  createdAt: string;
} 

// Gift Categories & Tags
export interface GiftCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parentId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GiftTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryHierarchy {
  category: GiftCategory;
  children: CategoryHierarchy[];
  giftCount: number;
}

export interface TagUsage {
  tag: GiftTag;
  usageCount: number;
  lastUsed: string;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  giftCount: number;
  totalSpent: number;
  averageSpent: number;
  mostPopularTags: string[];
}

export interface TagStats {
  tagId: string;
  tagName: string;
  usageCount: number;
  associatedCategories: string[];
  averageGiftValue: number;
} 