# Gift Tracker API Architecture

## Overview

The Gift Tracker API service provides a comprehensive, type-safe, and performant interface for managing gifts, people, occasions, budgets, and related data. The architecture emphasizes security, reliability, and developer experience.

## Key Features

### 🔒 Security
- **Secure Token Management**: JWT tokens with automatic refresh
- **Input Validation**: Comprehensive validation for all inputs
- **Data Sanitization**: Automatic cleaning of user inputs
- **Environment Variable Protection**: No hardcoded secrets

### ⚡ Performance
- **Request Caching**: Intelligent caching with configurable TTL
- **Request Batching**: Automatic batching of concurrent requests
- **Retry Logic**: Exponential backoff with jitter
- **Performance Monitoring**: Built-in metrics collection

### 🛡️ Reliability
- **Error Handling**: Comprehensive error recovery
- **Type Safety**: Full TypeScript support
- **Circuit Breaker**: Prevents cascade failures
- **Graceful Degradation**: Fallback mechanisms

### 👨‍💻 Developer Experience
- **Comprehensive Types**: Full type definitions for all APIs
- **Request/Response Logging**: Development-time debugging
- **Mock Data Support**: Fallback data for development
- **Performance Metrics**: Built-in performance monitoring

## Architecture Components

### 1. API Service Class (`ApiService`)

The core service class provides all API methods with consistent error handling, caching, and retry logic.

```typescript
const apiService = new ApiService();

// All methods return typed responses
const people: Person[] = await apiService.getPeople();
const user: User = await apiService.login(email, password);
```

### 2. Token Management (`TokenManager`)

Secure token storage and management with automatic refresh capabilities.

```typescript
class TokenManager {
  getToken(): string | null
  setToken(token: string): void
  getRefreshToken(): string | null
  setRefreshToken(token: string): void
  clearTokens(): void
  isTokenExpired(token: string): boolean
}
```

### 3. Request Cache (`ApiCache`)

Intelligent caching system with TTL support for improved performance.

```typescript
class ApiCache {
  set(key: string, data: unknown, ttl?: number): void
  get<T>(key: string): T | null
  clear(): void
  delete(key: string): void
}
```

### 4. Request Queue (`RequestQueue`)

Batches concurrent requests to improve performance and reduce server load.

```typescript
class RequestQueue {
  add(url: string, options: RequestInit): Promise<Response>
}
```

### 5. Performance Monitor (`PerformanceMonitor`)

Tracks API performance metrics for monitoring and optimization.

```typescript
class PerformanceMonitor {
  startRequest(endpoint: string): () => void
  recordError(endpoint: string): void
  getMetrics(): Record<string, MetricData>
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/user/validate` - Token validation

### User Management
- `PUT /api/profile` - Update user profile
- `PUT /api/preferences` - Update user preferences

### People Management
- `GET /api/people` - List all people
- `POST /api/people` - Create new person
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

### Gift Management
- `GET /api/gifts` - List all gifts
- `POST /api/gifts` - Create new gift
- `PUT /api/gifts/:id` - Update gift
- `DELETE /api/gifts/:id` - Delete gift

### Occasion Management
- `GET /api/occasions` - List all occasions
- `POST /api/occasions` - Create new occasion
- `PUT /api/occasions/:id` - Update occasion
- `DELETE /api/occasions/:id` - Delete occasion

### Budget Management
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Additional Features
- `POST /api/contact` - Contact form submission
- `GET /api/search` - Search across all data
- `GET /api/analytics` - Analytics data
- `GET /api/recommendations` - Gift recommendations
- `GET /api/export` - Data export
- `POST /api/import` - Data import

## Error Handling

### Error Types

```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

### Error Recovery

The API service implements automatic error recovery:

1. **Token Refresh**: Automatic token refresh on 401 errors
2. **Retry Logic**: Exponential backoff for retryable errors
3. **Fallback Data**: Mock data in development mode
4. **Graceful Degradation**: Continues operation where possible

## Caching Strategy

### Cache Levels

1. **Browser Cache**: HTTP cache headers
2. **API Cache**: In-memory request cache
3. **Local Storage**: Persistent user data

### Cache Keys

Cache keys are generated based on endpoint and parameters:

```typescript
const cacheKey = createCacheKey('/api/people', { filter: 'active' });
// Result: "api_people_ZmlsdGVyPWFjdGl2ZQ=="
```

### Cache Invalidation

- **Time-based**: Automatic TTL expiration
- **Event-based**: Manual invalidation on data changes
- **User-triggered**: Clear cache functionality

## Performance Optimization

### Request Batching

Multiple concurrent requests are automatically batched:

```typescript
// These requests will be batched together
const [people, gifts, occasions] = await Promise.all([
  apiService.getPeople(),
  apiService.getGifts(),
  apiService.getOccasions()
]);
```

### Retry Strategy

Failed requests are automatically retried with exponential backoff:

1. Initial request fails
2. Wait 1 second, retry
3. Wait 2 seconds, retry  
4. Wait 4 seconds, retry
5. Fail permanently

### Performance Monitoring

Built-in metrics tracking:

```typescript
const metrics = apiService.getPerformanceMetrics();
console.log(metrics);
// {
//   "/api/people": {
//     avgTime: 245,
//     successRate: 0.98,
//     totalRequests: 150
//   }
// }
```

## Security Considerations

### Token Security

- Tokens stored in memory when possible
- Automatic token refresh before expiration
- Secure token transmission (HTTPS only)
- Token rotation on security events

### Input Validation

All inputs are validated:

```typescript
// Email validation
if (!validateEmail(email)) {
  throw new Error('Please enter a valid email address');
}

// Password strength validation
const { valid, errors } = validatePassword(password);
if (!valid) {
  throw new Error(errors.join(', '));
}
```

### Data Sanitization

User inputs are automatically sanitized:

```typescript
const cleanData = {
  name: sanitizeString(input.name),
  email: sanitizeEmail(input.email),
  notes: sanitizeHtml(input.notes)
};
```

## Development Features

### Request Logging

In development mode, all requests are logged:

```
🌐 API POST /api/auth/login
Request: { email: "user@example.com", password: "***" }
Response (245ms): { status: 200, user: {...} }
```

### Mock Data Fallbacks

When endpoints return 404 in development, mock data is provided:

```typescript
if (response.status === 404 && import.meta.env.DEV) {
  console.warn('⚠️ Endpoint not found, returning mock data');
  return mockPeopleData;
}
```

### Performance Metrics

Built-in performance monitoring in development:

```typescript
if (import.meta.env.DEV) {
  console.log('📊 API Performance:', apiService.getPerformanceMetrics());
}
```

## Usage Examples

### Basic Usage

```typescript
import { apiService } from '@/services/api';

// Login user
const { user, session } = await apiService.login(email, password);

// Create a person
const person = await apiService.createPerson({
  name: 'John Doe',
  email: 'john@example.com',
  relationship: 'Friend'
});

// Get all people with caching
const people = await apiService.getPeople(); // Cached for 5 minutes
```

### Error Handling

```typescript
try {
  const user = await apiService.login(email, password);
} catch (error) {
  if (isApiError(error)) {
    console.error(`API Error: ${error.message} (${error.code})`);
    
    if (error.status === 401) {
      // Redirect to login
    } else if (error.status === 429) {
      // Show rate limit message
    }
  }
}
```

### Advanced Features

```typescript
// Clear cache manually
apiService.clearCache();

// Get performance metrics
const metrics = apiService.getPerformanceMetrics();

// Clear authentication tokens
apiService.clearTokens();
```

## Migration Guide

### From Old API Service

The new API service maintains backward compatibility while adding new features:

```typescript
// Old way (still works)
const people = await getPeople();

// New way (recommended)
const people = await apiService.getPeople();
```

### Breaking Changes

1. **Error Format**: Errors now use the `ApiError` interface
2. **Response Format**: All responses use the `ApiResponse<T>` wrapper
3. **Type Safety**: Stricter type checking for request/response data

### Upgrade Steps

1. Update imports to use new type definitions
2. Replace error handling with new `ApiError` format
3. Update response handling for new `ApiResponse<T>` format
4. Test all API integrations thoroughly

## Best Practices

### Request Optimization

```typescript
// ✅ Good: Use caching for frequently accessed data
const people = await apiService.getPeople(); // Cached

// ✅ Good: Batch related requests
const [people, gifts] = await Promise.all([
  apiService.getPeople(),
  apiService.getGifts()
]);

// ❌ Bad: Sequential requests
const people = await apiService.getPeople();
const gifts = await apiService.getGifts();
```

### Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const user = await apiService.login(email, password);
} catch (error) {
  if (isApiError(error) && error.status === 401) {
    showLoginError('Invalid credentials');
  } else {
    showGenericError();
  }
}

// ❌ Bad: Generic error handling
try {
  const user = await apiService.login(email, password);
} catch (error) {
  console.error(error);
}
```

### Type Safety

```typescript
// ✅ Good: Use typed interfaces
interface CreatePersonRequest {
  name: string;
  email?: string;
  relationship: string;
}

const person = await apiService.createPerson(personData);

// ❌ Bad: Untyped objects
const person = await apiService.createPerson({
  name: 'John',
  // TypeScript won't catch typos
  realationship: 'Friend'
});
```

## Troubleshooting

### Common Issues

1. **Token Expiration**: Automatically handled by token refresh
2. **Network Errors**: Automatically retried with backoff
3. **Rate Limiting**: Respect retry-after headers
4. **Cache Issues**: Use `clearCache()` to reset

### Debug Mode

Enable detailed logging in development:

```typescript
// API calls are automatically logged in development
console.log(apiService.getPerformanceMetrics());
```

### Performance Issues

Monitor API performance:

```typescript
const metrics = apiService.getPerformanceMetrics();
const slowEndpoints = Object.entries(metrics)
  .filter(([, data]) => data.avgTime > 1000)
  .map(([endpoint]) => endpoint);
```

## Future Enhancements

### Planned Features

1. **WebSocket Support**: Real-time updates
2. **Offline Support**: Background sync capabilities
3. **GraphQL Integration**: Query optimization
4. **Request Deduplication**: Eliminate duplicate requests
5. **Advanced Caching**: Redis/external cache support

### API Versioning

Future versions will maintain backward compatibility:

```typescript
// v2 API (future)
const apiServiceV2 = new ApiService({ version: 'v2' });
```