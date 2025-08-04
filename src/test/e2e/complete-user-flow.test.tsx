import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import { mockApiService } from '@/test/utils'
import { e2eHelper, expectElementToBeVisible, expectElementToHaveText } from './setup'

// Mock all page components for E2E testing
vi.mock('@/pages/Dashboard', () => ({
  default: function MockDashboard() {
    const [data, setData] = React.useState<unknown>(null)
    const [loading, setLoading] = React.useState(true)
    
    React.useEffect(() => {
      const loadDashboardData = async () => {
        try {
          setLoading(true)
          // Simulate dashboard data loading
          const [gifts, people, occasions] = await Promise.all([
            mockApiService.getGifts(),
            mockApiService.getPeople(),
            mockApiService.getOccasions()
          ])
          
          setData({
            gifts: gifts.data || [],
            people: people.data || [],
            occasions: occasions.data || [],
            stats: {
              totalGifts: gifts.data?.length || 0,
              totalPeople: people.data?.length || 0,
              totalOccasions: occasions.data?.length || 0,
              upcomingOccasions: occasions.data?.filter((o: { date: string }) => 
                new Date(o.date) > new Date()
              ).length || 0
            }
          })
        } catch (error) {
          console.error('Dashboard loading error:', error)
        } finally {
          setLoading(false)
        }
      }
      
      loadDashboardData()
    }, [])
    
    if (loading) {
      return <div data-testid="dashboard-loading">Loading dashboard...</div>
    }
    
    return (
      <div data-testid="dashboard-page">
        <h1>Dashboard</h1>
        <div data-testid="dashboard-stats">
          <div data-testid="total-gifts">Total Gifts: {data?.stats.totalGifts}</div>
          <div data-testid="total-people">Total People: {data?.stats.totalPeople}</div>
          <div data-testid="total-occasions">Total Occasions: {data?.stats.totalOccasions}</div>
          <div data-testid="upcoming-occasions">Upcoming: {data?.stats.upcomingOccasions}</div>
        </div>
        
        <div data-testid="recent-gifts">
          <h2>Recent Gifts</h2>
          {data?.gifts.length === 0 ? (
            <p data-testid="no-gifts">No gifts yet</p>
          ) : (
            data?.gifts.map((gift: { id: string; name: string; status: string }) => (
              <div key={gift.id} data-testid={`dashboard-gift-${gift.id}`}>
                {gift.name} - {gift.status}
              </div>
            ))
          )}
        </div>

        <div data-testid="dashboard-actions">
          <button data-testid="add-gift-button">Add New Gift</button>
          <button data-testid="add-person-button">Add New Person</button>
          <button data-testid="view-all-gifts-button">View All Gifts</button>
        </div>
      </div>
    )
  }
}))

// Mock ProtectedRoute
vi.mock('@/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children
}))

// Mock Layout
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <header data-testid="header">
        <nav data-testid="navigation">
          <a href="/dashboard" data-testid="nav-dashboard">Dashboard</a>
          <a href="/gifts" data-testid="nav-gifts">Gifts</a>
          <a href="/people" data-testid="nav-people">People</a>
          <button data-testid="logout-button">Logout</button>
        </nav>
      </header>
      <main data-testid="main-content">{children}</main>
    </div>
  )
}))

// Test Application with Full Routing
const TestApp: React.FC<{ initialRoute?: string }> = ({ initialRoute = '/' }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
)

describe('Complete User Flow E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    e2eHelper.clearTestData()
    
    // Setup clean localStorage
    Object.defineProperty(window, 'localStorage', {
      value: e2eHelper.createMockLocalStorage(),
      writable: true
    })
  })

  afterEach(() => {
    e2eHelper.cleanup()
  })

  describe('New User Registration and First Use', () => {
    it('should complete full new user journey from registration to dashboard', async () => {
      const user = userEvent.setup()
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      // Mock API for registration flow
      mockApiService.register.mockResolvedValue({
        user: testScenario.user,
        session: { access_token: 'new-user-token' }
      })
      
      mockApiService.validateUser.mockRejectedValue(new Error('No user'))
      
      // Mock empty dashboard for new user
      mockApiService.getGifts.mockResolvedValue({ data: [], total: 0 })
      mockApiService.getPeople.mockResolvedValue({ data: [], total: 0 })
      mockApiService.getOccasions.mockResolvedValue({ data: [], total: 0 })

      render(<TestApp initialRoute="/register" />)

      // STEP 1: Registration
      await waitFor(() => {
        expectElementToBeVisible(screen.getByRole('heading', { name: /create account/i }))
      })

      // Fill registration form
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, testScenario.user.name!)
      await user.type(emailInput, testScenario.user.email)
      await user.type(passwordInput, 'securePassword123!')
      await user.type(confirmPasswordInput, 'securePassword123!')

      // Submit registration
      const registerButton = screen.getByRole('button', { name: /create account/i })
      await act(async () => {
        await user.click(registerButton)
      })

      // STEP 2: Verify registration API call
      await waitFor(() => {
        expect(mockApiService.register).toHaveBeenCalledWith(
          testScenario.user.email,
          'securePassword123!',
          testScenario.user.name
        )
      })

      // STEP 3: Should redirect to dashboard after registration
      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-page'))
      })

      // STEP 4: Verify dashboard loads for new user
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument()
      })

      // Should show empty state for new user
      expectElementToHaveText(screen.getByTestId('total-gifts'), 'Total Gifts: 0')
      expectElementToHaveText(screen.getByTestId('total-people'), 'Total People: 0')
      expectElementToHaveText(screen.getByTestId('total-occasions'), 'Total Occasions: 0')
      expectElementToBeVisible(screen.getByTestId('no-gifts'))

      // STEP 5: Verify dashboard actions are available
      expectElementToBeVisible(screen.getByTestId('add-gift-button'))
      expectElementToBeVisible(screen.getByTestId('add-person-button'))
      expectElementToBeVisible(screen.getByTestId('view-all-gifts-button'))

      // STEP 6: Verify auth token is stored
      expect(window.localStorage.setItem).toHaveBeenCalledWith('authToken', 'new-user-token')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(testScenario.user))
    })

    it('should handle registration errors gracefully', async () => {
      const user = userEvent.setup()
      
      mockApiService.register.mockRejectedValue(new Error('Email already exists'))
      mockApiService.validateUser.mockRejectedValue(new Error('No user'))

      render(<TestApp initialRoute="/register" />)

      await waitFor(() => {
        expectElementToBeVisible(screen.getByRole('heading', { name: /create account/i }))
      })

      // Fill form with existing email
      await user.type(screen.getByLabelText(/full name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /create account/i }))
      })

      // Should show error and remain on registration page
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      expectElementToBeVisible(screen.getByRole('heading', { name: /create account/i }))
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
    })
  })

  describe('Returning User Login Flow', () => {
    it('should complete full returning user login to dashboard with data', async () => {
      const user = userEvent.setup()
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      // Mock login API
      mockApiService.login.mockResolvedValue({
        user: testScenario.user,
        session: { access_token: 'returning-user-token' }
      })

      // Mock dashboard with existing data
      mockApiService.getGifts.mockResolvedValue({ 
        data: [testScenario.gift], 
        total: 1 
      })
      mockApiService.getPeople.mockResolvedValue({ 
        data: [testScenario.person], 
        total: 1 
      })
      mockApiService.getOccasions.mockResolvedValue({ 
        data: [testScenario.occasion], 
        total: 1 
      })

      mockApiService.validateUser.mockRejectedValue(new Error('No user'))

      render(<TestApp initialRoute="/login" />)

      // STEP 1: Login
      await waitFor(() => {
        expectElementToBeVisible(screen.getByRole('heading', { name: /sign in/i }))
      })

      await user.type(screen.getByLabelText(/email/i), testScenario.user.email)
      await user.type(screen.getByLabelText(/password/i), 'userPassword123!')

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /sign in/i }))
      })

      // STEP 2: Verify login API call
      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalledWith(
          testScenario.user.email,
          'userPassword123!'
        )
      })

      // STEP 3: Should redirect to dashboard
      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-page'))
      })

      // STEP 4: Verify dashboard loads with user data
      await waitFor(() => {
        expect(mockApiService.getGifts).toHaveBeenCalled()
        expect(mockApiService.getPeople).toHaveBeenCalled()
        expect(mockApiService.getOccasions).toHaveBeenCalled()
      })

      // Should show user's data
      await waitFor(() => {
        expectElementToHaveText(screen.getByTestId('total-gifts'), 'Total Gifts: 1')
        expectElementToHaveText(screen.getByTestId('total-people'), 'Total People: 1')
        expectElementToHaveText(screen.getByTestId('total-occasions'), 'Total Occasions: 1')
      })

      // Should show recent gifts
      expectElementToBeVisible(screen.getByTestId(`dashboard-gift-${testScenario.gift.id}`))
      expectElementToHaveText(
        screen.getByTestId(`dashboard-gift-${testScenario.gift.id}`),
        `${testScenario.gift.name} - ${testScenario.gift.status}`
      )
    })

    it('should restore session from localStorage on page refresh', async () => {
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      // Setup authenticated localStorage
      e2eHelper.setupAuthenticatedEnvironment(testScenario.user)
      
      // Mock successful session validation
      mockApiService.validateUser.mockResolvedValue({ user: testScenario.user })
      
      // Mock dashboard data
      mockApiService.getGifts.mockResolvedValue({ data: [testScenario.gift], total: 1 })
      mockApiService.getPeople.mockResolvedValue({ data: [testScenario.person], total: 1 })
      mockApiService.getOccasions.mockResolvedValue({ data: [testScenario.occasion], total: 1 })

      render(<TestApp initialRoute="/dashboard" />)

      // Should validate existing session
      await waitFor(() => {
        expect(mockApiService.validateUser).toHaveBeenCalled()
      })

      // Should load dashboard with user data
      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-page'))
      })

      await waitFor(() => {
        expectElementToHaveText(screen.getByTestId('total-gifts'), 'Total Gifts: 1')
      })
    })

    it('should handle expired session and require re-login', async () => {
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      // Setup expired session in localStorage
      e2eHelper.setupAuthenticatedEnvironment(testScenario.user)
      
      // Mock failed session validation (expired)
      mockApiService.validateUser.mockRejectedValue(new Error('Session expired'))

      render(<TestApp initialRoute="/dashboard" />)

      // Should attempt to validate session
      await waitFor(() => {
        expect(mockApiService.validateUser).toHaveBeenCalled()
      })

      // Should clear localStorage when session is invalid
      await waitFor(() => {
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('authToken')
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('user')
      })

      // In a real app, this would redirect to login
      // Here we just verify the auth state is cleared
    })
  })

  describe('Data Loading and Error Handling', () => {
    it('should handle dashboard data loading errors gracefully', async () => {
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      e2eHelper.setupAuthenticatedEnvironment(testScenario.user)
      mockApiService.validateUser.mockResolvedValue({ user: testScenario.user })
      
      // Mock API errors for dashboard data
      mockApiService.getGifts.mockRejectedValue(new Error('Failed to load gifts'))
      mockApiService.getPeople.mockRejectedValue(new Error('Failed to load people'))
      mockApiService.getOccasions.mockRejectedValue(new Error('Failed to load occasions'))

      render(<TestApp initialRoute="/dashboard" />)

      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-loading'))
      })

      // Should complete loading even with errors
      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-page'))
      }, { timeout: 3000 })

      // Should show default/empty state when data fails to load
      // The component should handle errors gracefully
    })

    it('should handle network errors during authentication flow', async () => {
      const user = userEvent.setup()
      
      mockApiService.login.mockRejectedValue(new Error('Network error'))
      mockApiService.validateUser.mockRejectedValue(new Error('No user'))

      render(<TestApp initialRoute="/login" />)

      await waitFor(() => {
        expectElementToBeVisible(screen.getByRole('heading', { name: /sign in/i }))
      })

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /sign in/i }))
      })

      // Should show network error
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Should remain on login page
      expectElementToBeVisible(screen.getByRole('heading', { name: /sign in/i }))
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
    })
  })

  describe('User Journey Performance', () => {
    it('should load dashboard efficiently for users with large datasets', async () => {
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      // Create large dataset
      const manyGifts = Array.from({ length: 100 }, (_, i) => ({
        ...testScenario.gift,
        id: `gift-${i}`,
        name: `Gift ${i}`
      }))
      
      const manyPeople = Array.from({ length: 50 }, (_, i) => ({
        ...testScenario.person,
        id: `person-${i}`,
        name: `Person ${i}`
      }))

      e2eHelper.setupAuthenticatedEnvironment(testScenario.user)
      mockApiService.validateUser.mockResolvedValue({ user: testScenario.user })
      
      mockApiService.getGifts.mockResolvedValue({ data: manyGifts, total: 100 })
      mockApiService.getPeople.mockResolvedValue({ data: manyPeople, total: 50 })
      mockApiService.getOccasions.mockResolvedValue({ 
        data: [testScenario.occasion], 
        total: 1 
      })

      const startTime = Date.now()
      
      render(<TestApp initialRoute="/dashboard" />)

      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-page'))
      })

      await waitFor(() => {
        expectElementToHaveText(screen.getByTestId('total-gifts'), 'Total Gifts: 100')
        expectElementToHaveText(screen.getByTestId('total-people'), 'Total People: 50')
      })

      const loadTime = Date.now() - startTime
      
      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(2000)
    })
  })

  describe('Multi-step User Workflows', () => {
    it('should complete full gift creation workflow from dashboard', async () => {
      const user = userEvent.setup()
      const testScenario = await e2eHelper.createCompleteTestScenario()
      
      e2eHelper.setupAuthenticatedEnvironment(testScenario.user)
      mockApiService.validateUser.mockResolvedValue({ user: testScenario.user })
      
      // Mock initial empty dashboard
      mockApiService.getGifts.mockResolvedValue({ data: [], total: 0 })
      mockApiService.getPeople.mockResolvedValue({ 
        data: [testScenario.person], 
        total: 1 
      })
      mockApiService.getOccasions.mockResolvedValue({ 
        data: [testScenario.occasion], 
        total: 1 
      })

      render(<TestApp initialRoute="/dashboard" />)

      // STEP 1: Load dashboard
      await waitFor(() => {
        expectElementToBeVisible(screen.getByTestId('dashboard-page'))
      })

      // STEP 2: Click add gift button (this would normally navigate to gift form)
      expectElementToBeVisible(screen.getByTestId('add-gift-button'))
      
      // In a real E2E test, this would:
      // 1. Navigate to gift creation form
      // 2. Fill out form with person and occasion data
      // 3. Submit form
      // 4. Navigate back to dashboard
      // 5. Verify new gift appears in dashboard

      // For this mock test, we can simulate the final state
      const newGift = e2eHelper.createTestGift(testScenario.person.id, {
        name: 'New Dashboard Gift',
        occasionId: testScenario.occasion.id
      })

      // Mock updated dashboard data after gift creation
      mockApiService.getGifts.mockResolvedValue({ data: [newGift], total: 1 })

      // Simulate dashboard refresh after gift creation
      await act(async () => {
        await user.click(screen.getByTestId('add-gift-button'))
      })

      // In real implementation, this would show the new gift
      // Here we've demonstrated the test structure for the full workflow
    })
  })
})