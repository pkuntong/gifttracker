import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock API service
export const mockApiService = {
  // Authentication
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  validateUser: vi.fn(),
  healthCheck: vi.fn(),
  // People
  createPerson: vi.fn(),
  updatePerson: vi.fn(),
  deletePerson: vi.fn(),
  getPeople: vi.fn(),
  // Gifts - fixed method names to match actual API
  createGift: vi.fn(),
  updateGift: vi.fn(),
  deleteGift: vi.fn(),
  getGifts: vi.fn(),
  // Occasions
  createOccasion: vi.fn(),
  updateOccasion: vi.fn(),
  deleteOccasion: vi.fn(),
  getOccasions: vi.fn(),
  // Analytics
  getAnalytics: vi.fn(),
  getAdvancedAnalytics: vi.fn(),
}

// Mock user data
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  preferences: {
    currency: 'USD',
    timezone: 'America/New_York',
    theme: 'light' as const,
    notifications: true,
    language: 'en',
    subscription: {
      plan: 'FREE' as const,
      status: 'active' as const
    }
  }
}

// Mock person data
export const mockPerson = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  relationship: 'friend',
  birthday: '1990-01-15',
  notes: 'Loves books and coffee',
  avatar: null,
  familyId: null,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
}

// Mock gift data
export const mockGift = {
  id: '1',
  name: 'Coffee Maker',
  description: 'High-quality coffee maker',
  price: 99.99,
  currency: 'USD',
  status: 'planned' as const,
  recipientId: '1',
  occasionId: '1',
  notes: 'Birthday gift',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
}

// Mock occasion data
export const mockOccasion = {
  id: '1',
  name: 'John\'s Birthday',
  date: '2024-01-15',
  type: 'birthday' as const,
  personId: '1',
  description: 'Annual birthday celebration',
  budget: 200,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
}

// Test wrapper component
interface AllProvidersProps {
  children: React.ReactNode
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Setup function for tests that need mocked API
export const setupApiMocks = () => {
  vi.mock('@/services/api', () => ({
    apiService: mockApiService
  }))
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  })
}

// Helper to wait for async operations
export const waitForAsyncOperations = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to create mock promises
export const createMockPromise = <T>(value: T, shouldReject = false) => {
  return shouldReject ? Promise.reject(value) : Promise.resolve(value)
}

// Error boundary test helper
export const ErrorBoundaryTestHelper: React.FC<{ children: React.ReactNode; shouldThrow?: boolean }> = ({ 
  children, 
  shouldThrow = false 
}) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <>{children}</>
}