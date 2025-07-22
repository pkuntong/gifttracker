// API Service for Gift Tracker
// Updated to use Supabase Edge Functions

const API_BASE_URL = 'https://jnhucgyztokoffzwiegj.supabase.co/functions/v1/api'
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name })
    })
    return handleResponse(response)
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // People Management
  async getPeople() {
    const response = await fetch(`${API_BASE_URL}/people`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createPerson(personData: any) {
    const response = await fetch(`${API_BASE_URL}/people`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(personData)
    })
    return handleResponse(response)
  }

  async updatePerson(personId: string, personData: any) {
    const response = await fetch(`${API_BASE_URL}/people/${personId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(personData)
    })
    return handleResponse(response)
  }

  async deletePerson(personId: string) {
    const response = await fetch(`${API_BASE_URL}/people/${personId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Gift Management
  async getGifts() {
    const response = await fetch(`${API_BASE_URL}/gifts`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createGift(giftData: any) {
    const response = await fetch(`${API_BASE_URL}/gifts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(giftData)
    })
    return handleResponse(response)
  }

  async updateGift(giftId: string, giftData: any) {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(giftData)
    })
    return handleResponse(response)
  }

  async deleteGift(giftId: string) {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Occasion Management
  async getOccasions() {
    const response = await fetch(`${API_BASE_URL}/occasions`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createOccasion(occasionData: any) {
    const response = await fetch(`${API_BASE_URL}/occasions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(occasionData)
    })
    return handleResponse(response)
  }

  async updateOccasion(occasionId: string, occasionData: any) {
    const response = await fetch(`${API_BASE_URL}/occasions/${occasionId}`, {
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
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createBudget(budgetData: any) {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData)
    })
    return handleResponse(response)
  }

  // Family Management
  async getFamilies() {
    const response = await fetch(`${API_BASE_URL}/families`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createFamily(familyData: any) {
    const response = await fetch(`${API_BASE_URL}/families`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(familyData)
    })
    return handleResponse(response)
  }

  // Analytics
  async getAnalytics(filters?: any) {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/analytics${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Search
  async search(query: string, type?: string) {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, type })
    })
    return handleResponse(response)
  }

  // Gift Recommendations
  async getRecommendations(personId: string, occasion: string, budget?: number, interests?: string[]) {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ personId, occasion, budget, interests })
    })
    return handleResponse(response)
  }

  // Reminders
  async getReminders() {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Data Export
  async exportData(format: 'json' | 'csv' = 'json') {
    const response = await fetch(`${API_BASE_URL}/export?format=${format}`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (format === 'csv') {
      return response.text()
    }
    return handleResponse(response)
  }

  // Data Import
  async importData(data: any, overwrite: boolean = false) {
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data, overwrite })
    })
    return handleResponse(response)
  }

  // Gift Preferences
  async getGiftPreferences(personId: string) {
    const response = await fetch(`${API_BASE_URL}/preferences/${personId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Reports
  async getReports() {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createReport(reportData: any) {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reportData)
    })
    return handleResponse(response)
  }

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'json') {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/export?format=${format}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return response.blob()
  }

  async deleteReport(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Billing & Invoices
  async getInvoices() {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async getUsage() {
    const response = await fetch(`${API_BASE_URL}/usage`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async cancelSubscription(subscriptionId: string) {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Profile Management
  async updateProfile(updates: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse(response)
  }

  async updatePreferences(preferences: any) {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
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
  getFamilies,
  createFamily,
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