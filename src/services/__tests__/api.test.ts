import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiService } from '../api'

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key')
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001')

// Create a new instance for testing
const apiService = new ApiService()

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock data
const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockPerson = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  relationship: 'friend',
  birthday: '1990-01-15',
  notes: 'Loves books',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
}

// Helper to create mock response
const createMockResponse = (data: unknown, status = 200, ok = true) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  headers: new Headers({
    'content-type': 'application/json'
  }),
  redirected: false,
  statusText: ok ? 'OK' : 'Error',
  type: 'basic' as ResponseType,
  url: '',
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: vi.fn(),
  blob: vi.fn(),
  formData: vi.fn()
})

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true
    })
  })

  describe('Basic API Methods', () => {
    it('should be an instance of ApiService', () => {
      expect(apiService).toBeInstanceOf(ApiService)
    })

    it('should have login method', () => {
      expect(typeof apiService.login).toBe('function')
    })

    it('should have register method', () => {
      expect(typeof apiService.register).toBe('function')
    })

    it('should have logout method', () => {
      expect(typeof apiService.logout).toBe('function')
    })

    it('should have validateUser method', () => {
      expect(typeof apiService.validateUser).toBe('function')
    })

    it('should have getPeople method', () => {
      expect(typeof apiService.getPeople).toBe('function')
    })

    it('should have createPerson method', () => {
      expect(typeof apiService.createPerson).toBe('function')
    })
  })

  describe('Authentication Input Validation', () => {
    it('should validate email format in login', async () => {
      await expect(apiService.login('invalid-email', 'password')).rejects.toThrow('Please enter a valid email address')
    })

    it('should require email in login', async () => {
      await expect(apiService.login('', 'password')).rejects.toThrow('Email is required')
    })

    it('should require password in login', async () => {
      await expect(apiService.login('test@example.com', '')).rejects.toThrow('Password is required')
    })

    it('should validate email format in register', async () => {
      await expect(apiService.register('invalid-email', 'password', 'name')).rejects.toThrow('Please enter a valid email address')
    })

    it('should require all fields in register', async () => {
      await expect(apiService.register('', 'password', 'name')).rejects.toThrow('Email is required')
      await expect(apiService.register('test@example.com', '', 'name')).rejects.toThrow('Password is required')
      await expect(apiService.register('test@example.com', 'password', '')).rejects.toThrow('Name is required')
    })

    it('should validate password strength in register', async () => {
      await expect(apiService.register('test@example.com', '123', 'name')).rejects.toThrow('Password must be at least 6 characters long')
    })
  })

  describe('API Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(apiService.login('test@example.com', 'password123')).rejects.toThrow('Network error')
    })

    it('should handle HTTP error responses', async () => {
      const errorResponse = { 
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }
      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, 401, false))

      await expect(apiService.login('test@example.com', 'wrongpassword')).rejects.toThrow()
    })
  })

  describe('Successful Operations', () => {
    it('should handle successful login', async () => {
      const loginResponse = {
        data: {
          user: mockUser,
          session: { access_token: 'token123' }
        }
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse))

      const result = await apiService.login('test@example.com', 'password123')

      expect(result.user.email).toBe(mockUser.email)
      expect(result.session.access_token).toBe('token123')
    })

    it('should handle successful registration', async () => {
      const registerResponse = {
        data: {
          user: mockUser,
          session: { access_token: 'token123' }
        }
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(registerResponse))

      const result = await apiService.register('test@example.com', 'password123', 'Test User')

      expect(result.user.email).toBe(mockUser.email)
      expect(result.session.access_token).toBe('token123')
    })

    it('should handle successful logout', async () => {
      const logoutResponse = {
        data: { success: true }
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(logoutResponse))

      const result = await apiService.logout()

      expect(result.success).toBe(true)
    })

    it('should handle successful user validation', async () => {
      const validationResponse = {
        data: { user: mockUser, valid: true }
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(validationResponse))

      const result = await apiService.validateUser()

      expect(result.user?.email).toBe(mockUser.email)
      expect(result.valid).toBe(true)
    })

    it('should handle successful person creation', async () => {
      const personResponse = {
        data: mockPerson
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(personResponse))

      const personData = {
        name: 'John Doe',
        email: 'john@example.com',
        relationship: 'friend'
      }

      const result = await apiService.createPerson(personData)

      expect(result.name).toBe(mockPerson.name)
      expect(result.email).toBe(mockPerson.email)
    })

    it('should handle successful getPeople', async () => {
      const peopleResponse = {
        data: [mockPerson]
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(peopleResponse))

      const result = await apiService.getPeople()

      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toEqual(mockPerson)
    })
  })

  describe('Request Configuration', () => {
    it('should make requests with correct headers', async () => {
      const mockResponse = {
        data: { success: true }
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

      await apiService.login('test@example.com', 'password123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        })
      )
    })

    it('should include auth headers when token is available', async () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('Bearer test-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      const mockResponse = {
        data: [mockPerson]
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

      await apiService.getPeople()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Health Check', () => {
    it('should perform health check', async () => {
      const healthResponse = {
        data: {
          status: 'healthy',
          timestamp: '2023-01-01T00:00:00Z',
          version: '1.0.0'
        }
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(healthResponse))

      const result = await apiService.healthCheck()

      expect(result.status).toBe('healthy')
      expect(result.timestamp).toBeDefined()
    })
  })
})