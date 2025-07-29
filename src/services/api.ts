// API Service for Gift Tracker
// Updated to use Supabase Edge Functions

import { User, Person, Gift, Occasion, Family, Budget, GiftPreferences, Report, ImportData, ExportOptions } from '@/types';

// API Request/Response Types
export interface CreatePersonRequest {
  name: string;
  email?: string;
  relationship: string;
  birthday?: string;
  notes?: string;
  avatar?: string;
  familyId?: string;
}

export interface UpdatePersonRequest extends Partial<CreatePersonRequest> {
  // Partial update interface for person data
}

export interface CreateGiftRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  status: 'planned' | 'purchased' | 'wrapped' | 'given';
  recipientId: string;
  occasionId?: string;
  notes?: string;
}

export interface UpdateGiftRequest extends Partial<CreateGiftRequest> {
  // Partial update interface for gift data
}

export interface CreateOccasionRequest {
  name: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
  personId?: string;
  description?: string;
  budget?: number;
}

export interface UpdateOccasionRequest extends Partial<CreateOccasionRequest> {
  // Partial update interface for occasion data
}

export interface CreateBudgetRequest {
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
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {}

export interface CreateExpenseRequest {
  amount: number;
  currency: string;
  description: string;
  category: string;
  budgetId?: string;
  giftId?: string;
  date: string;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export interface CreateFamilyRequest {
  name: string;
  description?: string;
}

export interface UpdateFamilyRequest extends Partial<CreateFamilyRequest> {}

export interface InviteFamilyMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

export interface AnalyticsFilters {
  dateRange?: { start: string; end: string };
  people?: string[];
  occasions?: string[];
  categories?: string[];
}

export interface CreateReportRequest {
  type: 'gift_summary' | 'budget_report' | 'occasion_report' | 'spending_analysis' | 'family_report';
  title: string;
  description: string;
  filters: AnalyticsFilters;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface UpdatePreferencesRequest {
  currency?: string;
  timezone?: string;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jnhucgyztokoffzwiegj.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaHVjZ3l6dG9rb2ZmendpZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzI0MTcsImV4cCI6MjA2ODU0ODQxN30.2M01OqtHmBv4CBqAw3pjTK7oysxnB_xJEXG3m2ENOn8'

// For development, we'll use the anon key as the authorization token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
})

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// API Service Class
export class ApiService {
  // Health Check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // User Validation
  async validateUser() {
    const response = await fetch(`${API_BASE_URL}/api/user/validate`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Contact Form - Public endpoint (no auth required)
  async submitContact(data: { name: string; email: string; subject: string; message: string }) {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }

  // Test Endpoint
  async testEndpoint() {
    const response = await fetch(`${API_BASE_URL}/test`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Authentication
  async login(email: string, password: string) {
    console.log('🌐 API: Making login request to:', `${API_BASE_URL}/api/auth/login`)
    console.log('📤 API: Request payload:', { email, password: '***' })
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    })
    
    console.log('📥 API: Response status:', response.status)
    console.log('📥 API: Response headers:', Object.fromEntries(response.headers.entries()))
    
    const result = await handleResponse(response)
    console.log('📥 API: Response data:', result)
    
    return result
  }

  async register(email: string, password: string, name: string) {
    console.log('🌐 API: Making registration request to:', `${API_BASE_URL}/api/auth/register`)
    console.log('📤 API: Registration payload:', { email, password: '***', name })
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name })
    })
    
    console.log('📥 API: Registration response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('📥 API: Registration error data:', errorData)
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('📥 API: Registration success:', result)
    return result
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // People Management
  async getPeople() {
    const response = await fetch(`${API_BASE_URL}/api/people`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createPerson(personData: CreatePersonRequest) {
    const response = await fetch(`${API_BASE_URL}/api/people`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(personData)
    })
    return handleResponse(response)
  }

  async updatePerson(personId: string, personData: UpdatePersonRequest) {
    const response = await fetch(`${API_BASE_URL}/api/people/${personId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(personData)
    })
    return handleResponse(response)
  }

  async deletePerson(personId: string) {
    const response = await fetch(`${API_BASE_URL}/api/people/${personId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Gift Management
  async getGifts() {
    const response = await fetch(`${API_BASE_URL}/api/gifts`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createGift(giftData: CreateGiftRequest) {
    const response = await fetch(`${API_BASE_URL}/api/gifts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(giftData)
    })
    return handleResponse(response)
  }

  async updateGift(giftId: string, giftData: UpdateGiftRequest) {
    const response = await fetch(`${API_BASE_URL}/api/gifts/${giftId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(giftData)
    })
    return handleResponse(response)
  }

  async deleteGift(giftId: string) {
    const response = await fetch(`${API_BASE_URL}/api/gifts/${giftId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Occasion Management
  async getOccasions() {
    const response = await fetch(`${API_BASE_URL}/api/occasions`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createOccasion(occasionData: CreateOccasionRequest) {
    const response = await fetch(`${API_BASE_URL}/api/occasions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(occasionData)
    })
    return handleResponse(response)
  }

  async updateOccasion(occasionId: string, occasionData: UpdateOccasionRequest) {
    const response = await fetch(`${API_BASE_URL}/api/occasions/${occasionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(occasionData)
    })
    return handleResponse(response)
  }

  async deleteOccasion(occasionId: string) {
    const response = await fetch(`${API_BASE_URL}/occasions/${occasionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Budget Management
  async getBudgets() {
    const response = await fetch(`${API_BASE_URL}/api/budgets`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createBudget(budgetData: CreateBudgetRequest) {
    const response = await fetch(`${API_BASE_URL}/api/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData)
    })
    return handleResponse(response)
  }

  async updateBudget(budgetId: string, budgetData: UpdateBudgetRequest) {
    const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(budgetData)
    })
    return handleResponse(response)
  }

  async deleteBudget(budgetId: string) {
    const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Expenses
  async getExpenses() {
    const response = await fetch(`${API_BASE_URL}/api/expenses`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createExpense(expenseData: CreateExpenseRequest) {
    const response = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expenseData)
    })
    return handleResponse(response)
  }

  async updateExpense(expenseId: string, expenseData: UpdateExpenseRequest) {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(expenseData)
    })
    return handleResponse(response)
  }

  async deleteExpense(expenseId: string) {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Financial Insights
  async getFinancialInsights() {
    const response = await fetch(`${API_BASE_URL}/api/financial-insights`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Family Management
  async getFamilies() {
    const response = await fetch(`${API_BASE_URL}/api/families`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createFamily(familyData: CreateFamilyRequest) {
    const response = await fetch(`${API_BASE_URL}/api/families`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(familyData)
    })
    return handleResponse(response)
  }

  async updateFamily(familyId: string, familyData: UpdateFamilyRequest) {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(familyData)
    })
    return handleResponse(response)
  }

  async deleteFamily(familyId: string) {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async inviteFamilyMember(familyId: string, memberData: InviteFamilyMemberRequest) {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberData)
    })
    return handleResponse(response)
  }

  async removeFamilyMember(familyId: string, memberId: string) {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Analytics
  async getAnalytics(filters?: AnalyticsFilters) {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/api/analytics${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Search
  async search(query: string, type?: string) {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, type })
    })
    return handleResponse(response)
  }

  // Gift Recommendations
  async getRecommendations(personId: string, occasion: string, budget?: number, interests?: string[]) {
    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ personId, occasion, budget, interests })
    })
    return handleResponse(response)
  }

  // Reminders
  async getReminders() {
    const response = await fetch(`${API_BASE_URL}/api/reminders`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Data Export
  async exportData(format: 'json' | 'csv' = 'json') {
    const response = await fetch(`${API_BASE_URL}/api/export?format=${format}`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (format === 'csv') {
      return response.text()
    }
    return handleResponse(response)
  }

  // Data Import
  async importData(data: ImportData, overwrite: boolean = false) {
    const response = await fetch(`${API_BASE_URL}/api/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data, overwrite })
    })
    return handleResponse(response)
  }

  // Gift Preferences
  async getGiftPreferences(personId: string) {
    const response = await fetch(`${API_BASE_URL}/api/preferences/${personId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Reports
  async getReports() {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createReport(reportData: CreateReportRequest) {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reportData)
    })
    return handleResponse(response)
  }

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'json') {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/export?format=${format}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return response.blob()
  }

  async deleteReport(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Billing & Invoices
  async getInvoices() {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async getUsage() {
    const response = await fetch(`${API_BASE_URL}/api/usage`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async cancelSubscription(subscriptionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Profile Management
  async updateProfile(updates: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse(response)
  }

  async updatePreferences(preferences: UpdatePreferencesRequest) {
    const response = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(preferences)
    })
    return handleResponse(response)
  }
}

// Create and export the API service instance
export const apiService = new ApiService()

// Export individual functions for backward compatibility
export const {
  healthCheck,
  testEndpoint,
  login,
  register,
  logout,
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
  getGifts,
  createGift,
  updateGift,
  deleteGift,
  getOccasions,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getFinancialInsights,
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
  inviteFamilyMember,
  removeFamilyMember,
  getAnalytics,
  search,
  getGiftPreferences,
  getRecommendations,
  getReminders,
  exportData,
  importData,
  getReports,
  createReport,
  exportReport,
  deleteReport,
  getInvoices,
  getUsage,
  cancelSubscription
} = apiService

export default apiService 