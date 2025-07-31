/**
 * API Helper Utilities
 * 
 * Common utility functions for API operations including validation,
 * formatting, error handling, and data transformation.
 */

import type { ApiError, FilterParams, PaginationParams } from '@/types/api';

// Input Validation Helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateCurrency = (currency: string): boolean => {
  const currencyRegex = /^[A-Z]{3}$/;
  return currencyRegex.test(currency);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Data Sanitization Helpers
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Query Parameter Helpers
export const buildQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

export const buildFilterQuery = (filters: FilterParams): string => {
  return buildQueryParams(filters);
};

export const buildPaginationQuery = (pagination: PaginationParams): string => {
  return buildQueryParams(pagination);
};

// Date and Time Helpers
export const formatDateForApi = (date: Date): string => {
  return date.toISOString();
};

export const parseDateFromApi = (dateString: string): Date => {
  return new Date(dateString);
};

export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Error Handling Helpers
export const createApiError = (
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>
): ApiError => {
  return {
    message,
    code,
    status,
    details,
  };
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    'status' in error
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (isApiError(error)) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
};

// HTTP Status Code Helpers
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
};

export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

export const isServerError = (status: number): boolean => {
  return status >= 500 && status < 600;
};

export const isRetryableError = (status: number): boolean => {
  return (
    status === 429 || // Too Many Requests
    status === 502 || // Bad Gateway
    status === 503 || // Service Unavailable
    status === 504    // Gateway Timeout
  );
};

// Data Transformation Helpers
export const transformKeys = <T extends Record<string, unknown>>(
  obj: T,
  transformer: (key: string) => string
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = transformer(key);
    result[newKey] = value;
  });
  
  return result;
};

export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const objectToCamelCase = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
  return transformKeys(obj, toCamelCase);
};

export const objectToSnakeCase = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
  return transformKeys(obj, toSnakeCase);
};

// File Handling Helpers
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

// Retry Logic Helpers
export const exponentialBackoff = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
};

export const jitterDelay = (delay: number, jitterFactor: number = 0.1): number => {
  const jitter = delay * jitterFactor * Math.random();
  return delay + jitter;
};

// Cache Key Helpers
export const createCacheKey = (endpoint: string, params?: Record<string, unknown>): string => {
  const baseKey = endpoint.replace(/^\/+|\/+$/g, '').replace(/\//g, '_');
  
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${baseKey}_${btoa(sortedParams)}`;
};

// Performance Helpers
export const measureTime = async <T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  const result = await operation();
  const endTime = performance.now();
  
  return {
    result,
    duration: endTime - startTime,
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Security Helpers
export const maskSensitiveData = (data: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
  const masked = { ...data };
  
  Object.keys(masked).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      masked[key] = '***';
    }
  });
  
  return masked;
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// URL Helpers
export const joinPaths = (...paths: string[]): string => {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
};

export const isAbsoluteUrl = (url: string): boolean => {
  return /^https?:\/\//.test(url);
};

// Type Guards
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

// Logging Helpers
export const logApiCall = (
  method: string,
  url: string,
  duration: number,
  status: number,
  requestId?: string
): void => {
  const logLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
  const message = `${method} ${url} - ${status} (${Math.round(duration)}ms)`;
  
  console[logLevel](message, requestId ? { requestId } : undefined);
};

// Environment Helpers
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (import.meta.env.DEV) return 'development';
  if (import.meta.env.PROD) return 'production';
  return 'test';
};