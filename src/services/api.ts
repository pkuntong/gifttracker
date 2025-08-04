/**
 * API Service for Gift Tracker Application
 * 
 * Features:
 * - Type-safe API calls with comprehensive error handling
 * - Request/response caching and batching
 * - Retry mechanisms with exponential backoff
 * - Secure authentication token management
 * - Request/response interceptors
 * - Performance monitoring and logging
 */

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

// Partial update interface for person data
export type UpdatePersonRequest = Partial<CreatePersonRequest>;

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

// Partial update interface for gift data
export type UpdateGiftRequest = Partial<CreateGiftRequest>;

export interface CreateOccasionRequest {
  name: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
  personId?: string;
  description?: string;
  budget?: number;
}

// Partial update interface for occasion data
export type UpdateOccasionRequest = Partial<CreateOccasionRequest>;

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

export type UpdateBudgetRequest = Partial<CreateBudgetRequest>;

export interface CreateExpenseRequest {
  amount: number;
  currency: string;
  description: string;
  category: string;
  budgetId?: string;
  giftId?: string;
  date: string;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

export interface CreateFamilyRequest {
  name: string;
  description?: string;
}

export type UpdateFamilyRequest = Partial<CreateFamilyRequest>;

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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

// Environment Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes default cache TTL
  MAX_CONCURRENT_REQUESTS: 5,
} as const;

// Helper function to build API URLs correctly
const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

// Validate environment variables
if (!API_CONFIG.SUPABASE_ANON_KEY) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY not found in environment variables');
}

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    HAS_ANON_KEY: !!API_CONFIG.SUPABASE_ANON_KEY,
    TIMEOUT: API_CONFIG.TIMEOUT,
    RETRY_ATTEMPTS: API_CONFIG.RETRY_ATTEMPTS,
  });
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

// Request Configuration
interface RequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// Cache implementation
class ApiCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: unknown, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Request Queue for batching
class RequestQueue {
  private queue: Array<{
    url: string;
    options: RequestInit;
    resolve: (value: Response) => void;
    reject: (reason: unknown) => void;
  }> = [];
  private processing = false;
  private readonly batchDelay = 50; // ms

  add(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      this.scheduleProcess();
    });
  }

  private scheduleProcess(): void {
    if (this.processing) return;
    
    setTimeout(() => {
      this.process();
    }, this.batchDelay);
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0);
    
    // Process requests in parallel with limit
    const limit = 5;
    for (let i = 0; i < batch.length; i += limit) {
      const chunk = batch.slice(i, i + limit);
      await Promise.allSettled(chunk.map(async ({ url, options, resolve, reject }) => {
        try {
          const response = await fetch(url, options);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      }));
    }
    
    this.processing = false;
  }
}

// Initialize cache and queue
const apiCache = new ApiCache();
const requestQueue = new RequestQueue();

// Secure token management
class TokenManager {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }
  
  setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }
  
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }
  
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }
  
  clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
  
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

const tokenManager = new TokenManager();

// Enhanced headers with better security
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0',
  };

  const authToken = tokenManager.getToken();
  if (authToken && !tokenManager.isTokenExpired(authToken)) {
    headers.Authorization = `Bearer ${authToken}`;
  } else if (API_CONFIG.SUPABASE_ANON_KEY) {
    headers.Authorization = `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`;
  }

  return headers;
};

// Enhanced error handling
const createApiError = async (response: Response): Promise<ApiError> => {
  let errorData: { message?: string; code?: string; details?: Record<string, unknown> } = {};
  
  try {
    const text = await response.text();
    if (text) {
      errorData = JSON.parse(text);
    }
  } catch {
    // Failed to parse error response
  }

  const statusMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Validation Error',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return {
    message: errorData.message || statusMessages[response.status] || `HTTP error! status: ${response.status}`,
    code: errorData.code || `HTTP_${response.status}`,
    status: response.status,
    details: errorData.details,
  };
};

// Enhanced response handler with better error handling
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const error = await createApiError(response);
    throw error;
  }

  // Clone the response to avoid consuming the stream multiple times
  const responseClone = response.clone();
  
  try {
    const data = await response.json();
    return { data } as ApiResponse<T>;
  } catch {
    // Handle non-JSON responses using the cloned response
    const text = await responseClone.text();
    return { data: text as T } as ApiResponse<T>;
  }
};

// Retry mechanism with exponential backoff
const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Don't retry on 4xx errors (except 429)
    if (error instanceof Error && 'status' in error) {
      const status = (error as ApiError).status;
      if (status >= 400 && status < 500 && status !== 429) {
        throw error;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

// Enhanced fetch with timeout, caching, and retry
const enhancedFetch = async <T>(
  url: string,
  options: RequestInit & RequestConfig = {}
): Promise<ApiResponse<T>> => {
  const {
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    cache = false,
    cacheTTL,
    ...fetchOptions
  } = options;

  // Check cache first for GET requests
  if (cache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cacheKey = `${url}${fetchOptions.body ? `_${JSON.stringify(fetchOptions.body)}` : ''}`;
    const cached = apiCache.get<T>(cacheKey);
    if (cached) {
      return { data: cached } as ApiResponse<T>;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestFn = async (): Promise<ApiResponse<T>> => {
    try {
      const response = await requestQueue.add(url, {
        ...fetchOptions,
        headers: {
          ...getHeaders(),
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });

      const result = await handleResponse<T>(response);

      // Cache successful responses
      if (cache && result.data && (!fetchOptions.method || fetchOptions.method === 'GET')) {
        const cacheKey = `${url}${fetchOptions.body ? `_${JSON.stringify(fetchOptions.body)}` : ''}`;
        apiCache.set(cacheKey, result.data, cacheTTL);
      }

      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return retryRequest(requestFn, retries);
};

// Performance monitoring
class PerformanceMonitor {
  private metrics = new Map<string, { count: number; totalTime: number; errors: number }>();

  startRequest(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const current = this.metrics.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
      this.metrics.set(endpoint, {
        count: current.count + 1,
        totalTime: current.totalTime + duration,
        errors: current.errors,
      });
    };
  }

  recordError(endpoint: string): void {
    const current = this.metrics.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
    this.metrics.set(endpoint, {
      ...current,
      errors: current.errors + 1,
    });
  }

  getMetrics(): Record<string, { avgTime: number; successRate: number; totalRequests: number }> {
    const result: Record<string, { avgTime: number; successRate: number; totalRequests: number }> = {};
    
    this.metrics.forEach((value, key) => {
      result[key] = {
        avgTime: value.count > 0 ? value.totalTime / value.count : 0,
        successRate: value.count > 0 ? (value.count - value.errors) / value.count : 0,
        totalRequests: value.count,
      };
    });
    
    return result;
  }
}

const performanceMonitor = new PerformanceMonitor();

// Enhanced API Service Class with comprehensive error handling and performance monitoring
export class ApiService {
  // Health Check with monitoring
  async healthCheck(): Promise<{ status: string; timestamp: string; version?: string }> {
    const endpoint = '/health';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ status: string; timestamp: string; version?: string }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { 
          method: 'GET',
          cache: true,
          cacheTTL: 30000, // 30 seconds
        }
      );
      endTimer();
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  // User Validation with token refresh
  async validateUser(): Promise<{ user?: User; valid: boolean }> {
    const endpoint = '/api/user/validate';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ user?: User; valid: boolean }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { 
          method: 'GET',
          cache: true,
          cacheTTL: 60000, // 1 minute
        }
      );
      endTimer();
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      
      // Handle token expiration
      if ((error as ApiError).status === 401) {
        await this.refreshToken();
        // Retry once with new token
        try {
          const retryResult = await enhancedFetch<{ user?: User; valid: boolean }>(
            `${API_CONFIG.BASE_URL}${endpoint}`,
            { method: 'GET' }
          );
          return retryResult.data!;
        } catch (retryError) {
          tokenManager.clearTokens();
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  // Token refresh mechanism
  private async refreshToken(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const result = await enhancedFetch<{ access_token: string; refresh_token?: string }>(
        `${API_CONFIG.BASE_URL}/api/auth/refresh`,
        {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (result.data?.access_token) {
        tokenManager.setToken(result.data.access_token);
        if (result.data.refresh_token) {
          tokenManager.setRefreshToken(result.data.refresh_token);
        }
      }
    } catch (error) {
      tokenManager.clearTokens();
      throw error;
    }
  }

  // Contact Form - Public endpoint with validation
  async submitContact(data: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; id?: string }> {
    // Input validation
    if (!data.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!data.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!data.subject?.trim()) {
      throw new Error('Subject is required');
    }
    if (!data.message?.trim()) {
      throw new Error('Message is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    const endpoint = '/api/contact';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ success: boolean; id?: string }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            subject: data.subject.trim(),
            message: data.message.trim(),
          }),
        }
      );
      
      endTimer();
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  // Test Endpoint for development
  async testEndpoint(): Promise<{ message: string; timestamp: string; performance?: Record<string, unknown> }> {
    const endpoint = '/test';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ message: string; timestamp: string }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { 
          method: 'GET',
          cache: false, // Don't cache test endpoints
        }
      );
      
      endTimer();
      
      // Include performance metrics in development
      if (import.meta.env.DEV) {
        return {
          ...result.data!,
          performance: performanceMonitor.getMetrics(),
        };
      }
      
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  // Enhanced Authentication with input validation
  async login(email: string, password: string): Promise<{ user: User; session: { access_token: string; refresh_token?: string } }> {
    // Input validation
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
    if (!password?.trim()) {
      throw new Error('Password is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    // Use Supabase authentication if available
    if (API_CONFIG.SUPABASE_ANON_KEY) {
      const endpoint = '/api/auth/login';
      const endTimer = performanceMonitor.startRequest(endpoint);
      
      try {
        console.log('🔐 Attempting Supabase login for:', email.trim());
        
        const result = await enhancedFetch<{ user: User; session: { access_token: string; refresh_token?: string } }>(
          buildApiUrl(endpoint),
          {
            method: 'POST',
            body: JSON.stringify({ 
              email: email.trim().toLowerCase(), 
              password 
            }),
          }
        );
        
        endTimer();
        
        if (result.data?.session?.access_token) {
          tokenManager.setToken(result.data.session.access_token);
          if (result.data.session.refresh_token) {
            tokenManager.setRefreshToken(result.data.session.refresh_token);
          }
        }
        
        console.log('✅ Supabase login successful');
        return result.data!;
      } catch (error) {
        performanceMonitor.recordError(endpoint);
        endTimer();
        console.error('❌ Supabase login failed:', error);
        throw error;
      }
    } else {
      // Fallback to local server authentication
      const endpoint = '/api/auth/login';
      const endTimer = performanceMonitor.startRequest(endpoint);
      
      try {
        console.log('🔐 Attempting local server login for:', email.trim());
        
        const result = await enhancedFetch<{ user: User; session: { access_token: string; refresh_token?: string } }>(
          buildApiUrl(endpoint),
          {
            method: 'POST',
            body: JSON.stringify({ 
              email: email.trim().toLowerCase(), 
              password 
            }),
          }
        );
        
        endTimer();
        
        if (result.data?.session?.access_token) {
          tokenManager.setToken(result.data.session.access_token);
          if (result.data.session.refresh_token) {
            tokenManager.setRefreshToken(result.data.session.refresh_token);
          }
        }
        
        console.log('✅ Local server login successful');
        return result.data!;
      } catch (error) {
        performanceMonitor.recordError(endpoint);
        endTimer();
        console.error('❌ Local server login failed:', error);
        throw error;
      }
    }
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; session: { access_token: string; refresh_token?: string } }> {
    // Comprehensive input validation
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
    if (!password?.trim()) {
      throw new Error('Password is required');
    }
    if (!name?.trim()) {
      throw new Error('Name is required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }

    // Password strength validation
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Name validation
    if (cleanName.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const endpoint = '/api/auth/register';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      console.log('📝 Attempting registration for:', cleanEmail);
      
      const result = await enhancedFetch<{ user: User; session: { access_token: string; refresh_token?: string } }>(
        buildApiUrl(endpoint),
        {
          method: 'POST',
          body: JSON.stringify({ 
            email: cleanEmail, 
            password, 
            name: cleanName 
          }),
        }
      );
      
      endTimer();
      
      if (result.data?.session?.access_token) {
        tokenManager.setToken(result.data.session.access_token);
        if (result.data.session.refresh_token) {
          tokenManager.setRefreshToken(result.data.session.refresh_token);
        }
      }
      
      console.log('✅ Registration successful');
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  async logout(): Promise<{ success: boolean }> {
    const endpoint = '/api/auth/logout';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ success: boolean }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { method: 'POST' }
      );
      
      endTimer();
      
      // Clear tokens regardless of API response
      tokenManager.clearTokens();
      apiCache.clear();
      
      console.log('✅ Logout successful');
      return result.data || { success: true };
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      
      // Still clear tokens on error
      tokenManager.clearTokens();
      apiCache.clear();
      
      console.error('❌ Logout error (tokens cleared):', error);
      return { success: true }; // Return success since tokens are cleared
    }
  }

  // People Management with caching and fallback
  async getPeople(): Promise<Person[]> {
    const endpoint = '/api/people';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<Person[]>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { 
          method: 'GET',
          cache: true,
          cacheTTL: 5 * 60 * 1000, // 5 minutes
        }
      );
      
      endTimer();
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      
      // Provide fallback data for development
      if ((error as ApiError).status === 404 && import.meta.env.DEV) {
        console.warn('⚠️ People endpoint not found, returning mock data');
        return [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            relationship: 'Sister',
            birthday: '1990-05-15',
            notes: 'Loves technology and coffee',
            avatar: '/placeholder.svg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Mike Chen',
            email: 'mike@example.com',
            relationship: 'Friend',
            birthday: '1988-12-03',
            notes: 'Into fitness and outdoor activities',
            avatar: '/placeholder.svg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Emma Davis',
            email: 'emma@example.com',
            relationship: 'Colleague',
            birthday: '1992-08-22',
            notes: 'Book lover and plant enthusiast',
            avatar: '/placeholder.svg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      
      throw error;
    }
  }

  async createPerson(personData: CreatePersonRequest): Promise<Person> {
    // Input validation
    if (!personData.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!personData.relationship?.trim()) {
      throw new Error('Relationship is required');
    }
    if (personData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personData.email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    const endpoint = '/api/people';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<Person>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...personData,
            name: personData.name.trim(),
            relationship: personData.relationship.trim(),
            email: personData.email?.trim().toLowerCase(),
            notes: personData.notes?.trim(),
          }),
        }
      );
      
      endTimer();
      
      // Clear people cache
      apiCache.delete(`${API_CONFIG.BASE_URL}/api/people`);
      
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  async updatePerson(personId: string, personData: UpdatePersonRequest): Promise<Person> {
    if (!personId?.trim()) {
      throw new Error('Person ID is required');
    }

    // Validate email if provided
    if (personData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personData.email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    const endpoint = `/api/people/${personId}`;
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const cleanData = {
        ...personData,
        ...(personData.name && { name: personData.name.trim() }),
        ...(personData.relationship && { relationship: personData.relationship.trim() }),
        ...(personData.email && { email: personData.email.trim().toLowerCase() }),
        ...(personData.notes && { notes: personData.notes.trim() }),
      };

      const result = await enhancedFetch<Person>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        {
          method: 'PUT',
          body: JSON.stringify(cleanData),
        }
      );
      
      endTimer();
      
      // Clear people cache
      apiCache.delete(`${API_CONFIG.BASE_URL}/api/people`);
      
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  async deletePerson(personId: string): Promise<{ success: boolean }> {
    if (!personId?.trim()) {
      throw new Error('Person ID is required');
    }

    const endpoint = `/api/people/${personId}`;
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ success: boolean }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        { method: 'DELETE' }
      );
      
      endTimer();
      
      // Clear people cache
      apiCache.delete(`${API_CONFIG.BASE_URL}/api/people`);
      
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  // Gift Management
  async getGifts() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/gifts`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createGift(giftData: CreateGiftRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/gifts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(giftData)
    })
    return handleResponse(response)
  }

  async updateGift(giftId: string, giftData: UpdateGiftRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/gifts/${giftId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(giftData)
    })
    return handleResponse(response)
  }

  async deleteGift(giftId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/gifts/${giftId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Occasion Management
  async getOccasions() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/occasions`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (response.status === 404) {
      console.warn('Occasions endpoint not found, returning mock data')
      return [
        {
          id: '1',
          name: 'Christmas 2024',
          date: '2024-12-25',
          type: 'holiday',
          description: 'Annual Christmas celebration',
          budget: 500
        },
        {
          id: '2',
          name: "Sarah's Birthday",
          date: '2024-05-15',
          type: 'birthday',
          personId: '1',
          description: 'Sister Sarah\'s birthday',
          budget: 100
        },
        {
          id: '3',
          name: 'Wedding Anniversary',
          date: '2024-08-12',
          type: 'anniversary',
          description: 'Annual wedding anniversary',
          budget: 200
        }
      ]
    }
    
    return handleResponse(response)
  }

  async createOccasion(occasionData: CreateOccasionRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/occasions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(occasionData)
    })
    return handleResponse(response)
  }

  async updateOccasion(occasionId: string, occasionData: UpdateOccasionRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/occasions/${occasionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(occasionData)
    })
    return handleResponse(response)
  }

  async deleteOccasion(occasionId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/occasions/${occasionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Budget Management
  async getBudgets() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/budgets`, {
      headers: getHeaders()
    })
    
    if (response.status === 404) {
      console.warn('Budgets endpoint not found, returning mock data')
      return {
        budgets: [
          {
            id: '1',
            name: 'Christmas 2024',
            amount: 500,
            currency: 'USD',
            period: 'yearly',
            type: 'occasion',
            spent: 250,
            remaining: 250,
            status: 'on_track'
          },
          {
            id: '2',
            name: 'Birthday Gifts',
            amount: 200,
            currency: 'USD',
            period: 'monthly',
            type: 'general',
            spent: 180,
            remaining: 20,
            status: 'over_budget'
          }
        ]
      }
    }
    
    return handleResponse(response)
  }

  async createBudget(budgetData: CreateBudgetRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData)
    })
    return handleResponse(response)
  }

  async updateBudget(budgetId: string, budgetData: UpdateBudgetRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(budgetData)
    })
    return handleResponse(response)
  }

  async deleteBudget(budgetId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Expenses
  async getExpenses() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/expenses`, {
      headers: getHeaders()
    })
    
    if (response.status === 404) {
      console.warn('Expenses endpoint not found, returning mock data')
      return {
        expenses: [
          {
            id: '1',
            amount: 89.99,
            currency: 'USD',
            description: 'Bluetooth headphones for Sarah',
            category: 'Electronics',
            date: '2024-01-15',
            budgetId: '1'
          },
          {
            id: '2',
            amount: 45.50,
            currency: 'USD',
            description: 'Gift wrapping supplies',
            category: 'Supplies',
            date: '2024-01-20',
            budgetId: '1'
          }
        ]
      }
    }
    
    return handleResponse(response)
  }

  async createExpense(expenseData: CreateExpenseRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expenseData)
    })
    return handleResponse(response)
  }

  async updateExpense(expenseId: string, expenseData: UpdateExpenseRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/expenses/${expenseId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(expenseData)
    })
    return handleResponse(response)
  }

  async deleteExpense(expenseId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Financial Insights
  async getFinancialInsights() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/financial-insights`, {
      headers: getHeaders()
    })
    
    if (response.status === 404) {
      console.warn('Financial insights endpoint not found, returning mock data')
      return {
        insights: {
          totalSpent: 1245.50,
          totalBudget: 2000.00,
          budgetUtilization: 62.3,
          topCategories: [
            { category: 'Electronics', amount: 450.00, percentage: 36.1 },
            { category: 'Clothing', amount: 325.50, percentage: 26.1 },
            { category: 'Books', amount: 180.00, percentage: 14.5 }
          ],
          monthlyTrend: [
            { month: 'Jan', amount: 320.50 },
            { month: 'Feb', amount: 425.00 },
            { month: 'Mar', amount: 500.00 }
          ],
          recommendations: [
            'Consider setting a lower budget for Electronics category',
            'Great job staying under budget this month!',
            'You might want to track gift wrapping expenses separately'
          ]
        }
      }
    }
    
    return handleResponse(response)
  }

  // Family Management
  async getFamilies() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/families`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createFamily(familyData: CreateFamilyRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/families`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(familyData)
    })
    return handleResponse(response)
  }

  async updateFamily(familyId: string, familyData: UpdateFamilyRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/families/${familyId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(familyData)
    })
    return handleResponse(response)
  }

  async deleteFamily(familyId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/families/${familyId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async inviteFamilyMember(familyId: string, memberData: InviteFamilyMemberRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/families/${familyId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberData)
    })
    return handleResponse(response)
  }

  async removeFamilyMember(familyId: string, memberId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/families/${familyId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Analytics
  async getAnalytics(filters?: AnalyticsFilters) {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/analytics${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Search
  async search(query: string, type?: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, type })
    })
    return handleResponse(response)
  }

  // Gift Recommendations
  async getRecommendations(personId: string, occasion: string, budget?: number, interests?: string[]) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ personId, occasion, budget, interests })
    })
    return handleResponse(response)
  }

  // Reminders
  async getReminders() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reminders`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Data Export
  async exportData(format: 'json' | 'csv' = 'json') {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/export?format=${format}`, {
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
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data, overwrite })
    })
    return handleResponse(response)
  }

  // Gift Preferences
  async getGiftPreferences(personId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/preferences/${personId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Gift Ideas
  async getGiftIdeas(filters?: { budget?: number; interests?: string[]; occasion?: string; personId?: string }) {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : '';
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/gift-ideas${queryParams}`, {
        method: 'GET',
        headers: getHeaders()
      })
      
      if (response.status === 404) {
        // Return mock data if endpoint doesn't exist
        console.warn('Gift ideas endpoint not found, returning mock data')
        return [
          {
            id: '1',
            title: 'Wireless Headphones',
            description: 'High-quality noise-canceling headphones',
            price: 199.99,
            category: 'Electronics',
            tags: ['music', 'technology', 'entertainment'],
            rating: 4.5,
            image: '/placeholder.svg'
          },
          {
            id: '2', 
            title: 'Coffee Subscription',
            description: 'Monthly premium coffee delivery',
            price: 24.99,
            category: 'Food & Drink',
            tags: ['coffee', 'subscription', 'gourmet'],
            rating: 4.8,
            image: '/placeholder.svg'
          },
          {
            id: '3',
            title: 'Plant Care Kit',
            description: 'Everything needed for indoor gardening',
            price: 49.99,
            category: 'Home & Garden',
            tags: ['plants', 'gardening', 'home'],
            rating: 4.3,
            image: '/placeholder.svg'
          }
        ]
      }
      
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching gift ideas:', error)
      throw error
    }
  }

  async createGiftIdea(ideaData: { name: string; description: string; price: number; category: string; tags: string[] }) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/gift-ideas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(ideaData)
      })
      
      if (response.status === 404) {
        // Return mock success if endpoint doesn't exist
        console.warn('Create gift idea endpoint not found, returning mock success')
        return {
          success: true,
          giftIdea: {
            id: Date.now().toString(),
            title: ideaData.name,
            description: ideaData.description,
            price: ideaData.price,
            category: ideaData.category,
            tags: ideaData.tags,
            rating: 0,
            image: '/placeholder.svg'
          }
        }
      }
      
      return handleResponse(response)
    } catch (error) {
      console.error('Error creating gift idea:', error)
      throw error
    }
  }

  // Reports
  async getReports() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reports`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async createReport(reportData: CreateReportRequest) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reportData)
    })
    return handleResponse(response)
  }

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'json') {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reports/${reportId}/export?format=${format}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return response.blob()
  }

  async deleteReport(reportId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reports/${reportId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Billing & Invoices
  async getInvoices() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/invoices`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async getUsage() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/usage`, {
      method: 'GET',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  async cancelSubscription(subscriptionId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  }

  // Enhanced Profile Management
  async updateProfile(updates: UpdateProfileRequest): Promise<User> {
    // Input validation
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Profile updates are required');
    }

    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    if (updates.name && updates.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const endpoint = '/api/profile';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      console.log('🔄 Updating profile...');
      
      const cleanUpdates = {
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.email && { email: updates.email.trim().toLowerCase() }),
      };

      const result = await enhancedFetch<User>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        {
          method: 'PUT',
          body: JSON.stringify(cleanUpdates),
        }
      );
      
      endTimer();
      
      // Clear user validation cache
      apiCache.delete(`${API_CONFIG.BASE_URL}/api/user/validate`);
      
      console.log('✅ Profile update successful');
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<{ success: boolean; preferences: UpdatePreferencesRequest }> {
    // Input validation
    if (!preferences || Object.keys(preferences).length === 0) {
      throw new Error('Preferences are required');
    }

    if (preferences.currency && !/^[A-Z]{3}$/.test(preferences.currency)) {
      throw new Error('Currency must be a valid 3-letter code (e.g., USD, EUR)');
    }

    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      throw new Error('Theme must be light, dark, or system');
    }

    const endpoint = '/api/preferences';
    const endTimer = performanceMonitor.startRequest(endpoint);
    
    try {
      const result = await enhancedFetch<{ success: boolean; preferences: UpdatePreferencesRequest }>(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        {
          method: 'PUT',
          body: JSON.stringify(preferences),
        }
      );
      
      endTimer();
      
      // Clear user validation cache
      apiCache.delete(`${API_CONFIG.BASE_URL}/api/user/validate`);
      
      return result.data!;
    } catch (error) {
      performanceMonitor.recordError(endpoint);
      endTimer();
      throw error;
    }
  }

  // Performance and debugging utilities
  getPerformanceMetrics(): Record<string, { avgTime: number; successRate: number; totalRequests: number }> {
    return performanceMonitor.getMetrics();
  }

  clearCache(): void {
    apiCache.clear();
  }

  clearTokens(): void {
    tokenManager.clearTokens();
  }

}

// Request/Response Logging Middleware (Development only)
if (import.meta.env.DEV) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    
    console.group(`🌐 API ${method} ${url}`);
    console.log('Request:', { url, method, headers: init?.headers, body: init?.body });
    
    const startTime = performance.now();
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      
      console.log(`Response (${Math.round(endTime - startTime)}ms):`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      console.groupEnd();
      return response;
    } catch (error) {
      const endTime = performance.now();
      console.error(`Error (${Math.round(endTime - startTime)}ms):`, error);
      console.groupEnd();
      throw error;
    }
  };
}

// Create and export the API service instance
export const apiService = new ApiService();

// Export individual functions for backward compatibility
// Export individual methods for backward compatibility
export const {
  healthCheck,
  validateUser,
  testEndpoint,
  login,
  register,
  logout,
  submitContact,
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
  getGiftIdeas,
  createGiftIdea,
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
  cancelSubscription,
  updateProfile,
  updatePreferences,
  getPerformanceMetrics,
  clearCache,
  clearTokens,
} = apiService;

// Type exports for consumers
export type {
  ApiResponse,
  ApiError,
  CreatePersonRequest,
  UpdatePersonRequest,
  CreateGiftRequest,
  UpdateGiftRequest,
  CreateOccasionRequest,
  UpdateOccasionRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateFamilyRequest,
  UpdateFamilyRequest,
  InviteFamilyMemberRequest,
  AnalyticsFilters,
  CreateReportRequest,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
};

export default apiService;

// Global error handler for unhandled API errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'object' && 'status' in event.reason) {
    const apiError = event.reason as ApiError;
    console.error('Unhandled API Error:', {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
      details: apiError.details,
    });
    
    // Handle specific error codes globally
    if (apiError.status === 401) {
      // Redirect to login on unauthorized
      console.warn('Unauthorized access detected, clearing tokens');
      tokenManager.clearTokens();
      apiCache.clear();
    }
  }
}); 