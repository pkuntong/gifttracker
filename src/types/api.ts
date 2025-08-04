/**
 * API Client Types for Gift Tracker Application
 * 
 * This file contains comprehensive type definitions for API requests,
 * responses, and error handling to ensure type safety across the application.
 */

// Base API Response Types
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

// Pagination and Filtering
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string[];
  category?: string[];
  tags?: string[];
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    preferences?: {
      currency?: string;
      timezone?: string;
      theme?: 'light' | 'dark' | 'system';
      notifications?: boolean;
      language?: string;
    };
  };
  session: {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export type RegisterResponse = LoginResponse;

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

// User Management Types
export interface UserValidationResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    preferences?: Record<string, unknown>;
  };
  valid: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdatePreferencesRequest {
  currency?: string;
  timezone?: string;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

// Contact Form Types
export interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  id?: string;
  message?: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  services?: {
    database?: 'healthy' | 'degraded' | 'unhealthy';
    cache?: 'healthy' | 'degraded' | 'unhealthy';
    external_apis?: 'healthy' | 'degraded' | 'unhealthy';
  };
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  [endpoint: string]: {
    avgTime: number;
    successRate: number;
    totalRequests: number;
    errorRate: number;
    lastError?: string;
  };
}

// Request Configuration Types
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  skipAuth?: boolean;
  skipQueue?: boolean;
}

// Batch Request Types
export interface BatchRequest {
  requests: Array<{
    method: string;
    endpoint: string;
    body?: Record<string, unknown>;
    id?: string;
  }>;
}

export interface BatchResponse {
  responses: Array<{
    id?: string;
    status: number;
    data?: unknown;
    error?: ApiError;
  }>;
}

// WebSocket Types (for real-time features)
export interface WebSocketMessage {
  type: 'notification' | 'update' | 'error' | 'heartbeat';
  data?: unknown;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

// File Upload Types
export interface FileUploadRequest {
  file: File;
  category?: 'avatar' | 'gift_image' | 'document';
  metadata?: Record<string, unknown>;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

// Search Types
export interface SearchRequest {
  query: string;
  type?: 'all' | 'people' | 'gifts' | 'occasions' | 'budgets';
  filters?: FilterParams;
  pagination?: PaginationParams;
}

export interface SearchResponse {
  results: Array<{
    id: string;
    type: 'person' | 'gift' | 'occasion' | 'budget' | 'family' | 'gift-idea';
    title: string;
    description: string;
    tags: string[];
    relevance: number;
    data: Record<string, unknown>;
  }>;
  total: number;
  suggestions?: string[];
}

// Analytics Types
export interface AnalyticsRequest {
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
  groupBy?: string;
  filters?: FilterParams;
}

export interface AnalyticsResponse {
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    value: number;
    change?: number;
  }>;
  insights: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    actionable?: boolean;
  }>;
}

// Export/Import Types
export interface ExportRequest {
  format: 'json' | 'csv' | 'pdf';
  dataTypes: string[];
  filters?: FilterParams;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
  size: number;
}

export interface ImportRequest {
  file: File;
  format: 'json' | 'csv';
  options?: {
    overwrite?: boolean;
    skipDuplicates?: boolean;
    validateOnly?: boolean;
  };
}

export interface ImportResponse {
  success: boolean;
  importId: string;
  preview?: {
    totalRecords: number;
    validRecords: number;
    errors: Array<{
      row: number;
      field?: string;
      message: string;
    }>;
  };
  processed?: {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

// Notification Types
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: string[];
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channels: ('email' | 'push' | 'sms' | 'in_app')[];
  scheduledFor?: string;
  data?: Record<string, unknown>;
}

export interface NotificationResponse {
  id: string;
  status: 'queued' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

// Cache Types
export interface CacheInfo {
  key: string;
  ttl: number;
  size: number;
  hitRate: number;
  missRate: number;
}

// API Client Configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  maxConcurrentRequests: number;
  defaultCacheTTL: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  authTokenKey: string;
  refreshTokenKey: string;
  rateLimitHeaders: {
    limit: string;
    remaining: string;
    reset: string;
  };
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Request Interceptor Types
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: Error) => Error | Promise<Error>;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: ApiError) => ApiError | Promise<ApiError>;
}

// Webhook Types (for external integrations)
export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}

// API Testing Types
export interface ApiTestResult {
  endpoint: string;
  method: HttpMethod;
  status: 'pass' | 'fail';
  responseTime: number;
  error?: string;
  timestamp: string;
}

export interface ApiHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  endpoints: ApiTestResult[];
  metrics: PerformanceMetrics;
  uptime: number;
  lastChecked: string;
}

// Budget Management Types
export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent?: number;
  remaining?: number;
  category: string;
  period: 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'exceeded';
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  budgetId?: string;
  giftId?: string;
  personId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancialInsight {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  category: 'budget' | 'spending' | 'savings' | 'trend';
  value?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface BudgetApiResponse {
  budgets?: Budget[];
  data?: Budget[];
}

export interface ExpenseApiResponse {
  expenses?: Expense[];
  data?: Expense[];
}

export interface FinancialInsightsApiResponse {
  insights?: FinancialInsight[];
  data?: FinancialInsight[];
}