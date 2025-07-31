import { beforeAll, afterAll } from 'vitest'

// E2E test setup and utilities
export class E2ETestHelper {
  private static instance: E2ETestHelper
  private testData: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): E2ETestHelper {
    if (!E2ETestHelper.instance) {
      E2ETestHelper.instance = new E2ETestHelper()
    }
    return E2ETestHelper.instance
  }

  // Create test user data
  createTestUser(overrides: Partial<any> = {}) {
    const testUser = {
      id: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      },
      ...overrides
    }
    
    this.testData.set(`user-${testUser.id}`, testUser)
    return testUser
  }

  // Create test person data
  createTestPerson(userId: string, overrides: Partial<any> = {}) {
    const testPerson = {
      id: `test-person-${Date.now()}`,
      name: `Test Person ${Date.now()}`,
      email: `person-${Date.now()}@example.com`,
      relationship: 'friend',
      birthday: '1990-01-15',
      notes: 'Created for testing',
      avatar: null,
      familyId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
      ...overrides
    }
    
    this.testData.set(`person-${testPerson.id}`, testPerson)
    return testPerson
  }

  // Create test gift data
  createTestGift(recipientId: string, overrides: Partial<any> = {}) {
    const testGift = {
      id: `test-gift-${Date.now()}`,
      name: `Test Gift ${Date.now()}`,
      description: 'A test gift',
      price: 99.99,
      currency: 'USD',
      status: 'planned' as const,
      recipientId,
      occasionId: null,
      notes: 'Test gift notes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
    
    this.testData.set(`gift-${testGift.id}`, testGift)
    return testGift
  }

  // Create test occasion data
  createTestOccasion(personId: string, overrides: Partial<any> = {}) {
    const testOccasion = {
      id: `test-occasion-${Date.now()}`,
      name: `Test Occasion ${Date.now()}`,
      date: '2024-12-25',
      type: 'holiday' as const,
      personId,
      description: 'A test occasion',
      budget: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
    
    this.testData.set(`occasion-${testOccasion.id}`, testOccasion)
    return testOccasion
  }

  // Get stored test data
  getTestData(key: string) {
    return this.testData.get(key)
  }

  // Clear all test data
  clearTestData() {
    this.testData.clear()
  }

  // Simulate API delay
  async delay(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Create complete test scenario
  async createCompleteTestScenario() {
    const user = this.createTestUser()
    const person = this.createTestPerson(user.id)
    const occasion = this.createTestOccasion(person.id)
    const gift = this.createTestGift(person.id, { occasionId: occasion.id })

    return {
      user,
      person,
      occasion,
      gift
    }
  }

  // Mock successful API responses for a complete scenario
  mockCompleteScenario(apiService: any, scenario: any) {
    // Auth mocks
    apiService.login.mockResolvedValue({
      user: scenario.user,
      session: { access_token: 'test-token' }
    })
    apiService.validateUser.mockResolvedValue({ user: scenario.user })
    apiService.logout.mockResolvedValue({})

    // People mocks
    apiService.getPeople.mockResolvedValue({ 
      data: [scenario.person], 
      total: 1 
    })
    apiService.getPerson.mockResolvedValue(scenario.person)
    apiService.createPerson.mockImplementation(async (data: any) => ({
      ...scenario.person,
      ...data,
      id: `new-person-${Date.now()}`
    }))
    apiService.updatePerson.mockImplementation(async (id: string, data: any) => ({
      ...scenario.person,
      ...data,
      id
    }))
    apiService.deletePerson.mockResolvedValue({ success: true })

    // Gifts mocks
    apiService.getGifts.mockResolvedValue({ 
      data: [scenario.gift], 
      total: 1 
    })
    apiService.getGift.mockResolvedValue(scenario.gift)
    apiService.createGift.mockImplementation(async (data: any) => ({
      ...scenario.gift,
      ...data,
      id: `new-gift-${Date.now()}`
    }))
    apiService.updateGift.mockImplementation(async (id: string, data: any) => ({
      ...scenario.gift,
      ...data,
      id
    }))
    apiService.deleteGift.mockResolvedValue({ success: true })

    // Occasions mocks
    apiService.getOccasions.mockResolvedValue({ 
      data: [scenario.occasion], 
      total: 1 
    })
    apiService.getOccasion.mockResolvedValue(scenario.occasion)
    apiService.createOccasion.mockImplementation(async (data: any) => ({
      ...scenario.occasion,
      ...data,
      id: `new-occasion-${Date.now()}`
    }))
    apiService.updateOccasion.mockImplementation(async (id: string, data: any) => ({
      ...scenario.occasion,
      ...data,
      id
    }))
    apiService.deleteOccasion.mockResolvedValue({ success: true })

    return scenario
  }

  // Mock API error responses
  mockApiErrors(apiService: any, errorType: 'network' | 'auth' | 'validation' | 'server') {
    const errors = {
      network: new Error('Network error'),
      auth: new Error('Unauthorized'),
      validation: new Error('Validation failed'),
      server: new Error('Internal server error')
    }

    const error = errors[errorType]

    // Apply error to all API methods
    Object.keys(apiService).forEach(method => {
      if (typeof apiService[method] === 'function') {
        apiService[method].mockRejectedValue(error)
      }
    })
  }

  // Wait for async operations to complete
  async waitForAsyncOperations() {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  // Create mock localStorage
  createMockLocalStorage() {
    const storage: { [key: string]: string } = {}
    
    return {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key])
      }),
      key: vi.fn(),
      length: 0
    }
  }

  // Setup authenticated environment
  setupAuthenticatedEnvironment(user: any) {
    const mockStorage = this.createMockLocalStorage()
    mockStorage.setItem('user', JSON.stringify(user))
    mockStorage.setItem('authToken', 'test-token')
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    })
    
    return mockStorage
  }

  // Clean up after tests
  cleanup() {
    this.clearTestData()
    vi.clearAllMocks()
  }
}

// Global test helper instance
export const e2eHelper = E2ETestHelper.getInstance()

// Common test data generators
export const generateTestEmail = () => `test-${Date.now()}@example.com`
export const generateTestName = () => `Test User ${Date.now()}`
export const generateTestId = (prefix: string = 'test') => `${prefix}-${Date.now()}`

// Common assertions
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument()
  expect(element).toHaveTextContent(text)
}

export const expectFormToBeValid = (form: HTMLFormElement) => {
  expect(form).toBeInTheDocument()
  expect(form.checkValidity()).toBe(true)
}

export const expectFormToBeInvalid = (form: HTMLFormElement) => {
  expect(form).toBeInTheDocument()
  expect(form.checkValidity()).toBe(false)
}

// Test lifecycle hooks
beforeAll(() => {
  // Global setup
  console.log('Starting E2E tests...')
})

afterAll(() => {
  // Global cleanup
  e2eHelper.cleanup()
  console.log('E2E tests completed.')
})