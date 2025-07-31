import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import { mockApiService, mockUser } from '@/test/utils'

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: mockApiService
}))

// Mock complex page components
vi.mock('@/pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard - Welcome {mockUser.name}!</div>
}))

// Mock the ProtectedRoute component
vi.mock('@/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children
}))

// Mock Layout component
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <nav data-testid="navigation">Navigation</nav>
      <main>{children}</main>
    </div>
  )
}))

// Test app component with routing
const TestApp: React.FC<{ initialRoute?: string }> = ({ initialRoute = '/login' }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
)

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true
    })
    
    // Default API mock responses
    mockApiService.validateUser.mockRejectedValue(new Error('No token'))
  })

  describe('Complete Login Flow', () => {
    it('should handle complete login to dashboard flow', async () => {
      const user = userEvent.setup()
      
      mockApiService.login.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      render(<TestApp initialRoute="/login" />)

      // Should start at login page
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, mockUser.email)
      await user.type(passwordInput, 'password123')

      // Submit form
      await act(async () => {
        await user.click(submitButton)
      })

      // Should call login API
      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalledWith(mockUser.email, 'password123')
      })

      // Should store auth data
      expect(window.localStorage.setItem).toHaveBeenCalledWith('authToken', 'token123')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))

      // Should navigate to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })

      expect(screen.getByText(`Dashboard - Welcome ${mockUser.name}!`)).toBeInTheDocument()
    })

    it('should handle login error and allow retry', async () => {
      const user = userEvent.setup()
      
      // First attempt fails
      mockApiService.login
        .mockRejectedValueOnce(new Error('Invalid credentials'))
        .mockResolvedValueOnce({
          user: mockUser,
          session: { access_token: 'token123' }
        })

      render(<TestApp initialRoute="/login" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, mockUser.email)
      await user.type(passwordInput, 'wrongpassword')

      // First attempt - should fail
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Correct the password and retry
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correctpassword')

      await act(async () => {
        await user.click(submitButton)
      })

      // Should eventually reach dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      
      mockApiService.login.mockRejectedValue(new Error('Network error'))

      render(<TestApp initialRoute="/login" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, mockUser.email)
      await user.type(passwordInput, 'password123')

      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Should remain on login page
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
    })
  })

  describe('Complete Registration Flow', () => {
    it('should handle complete registration to dashboard flow', async () => {
      const user = userEvent.setup()
      
      mockApiService.register.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      render(<TestApp initialRoute="/register" />)

      // Should start at register page
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
      })

      // Fill in registration form
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(nameInput, mockUser.name!)
      await user.type(emailInput, mockUser.email)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      // Submit form
      await act(async () => {
        await user.click(submitButton)
      })

      // Should call register API
      await waitFor(() => {
        expect(mockApiService.register).toHaveBeenCalledWith(
          mockUser.email,
          'password123',
          mockUser.name
        )
      })

      // Should store auth data
      expect(window.localStorage.setItem).toHaveBeenCalledWith('authToken', 'token123')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))

      // Should navigate to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })

    it('should handle registration validation errors', async () => {
      const user = userEvent.setup()
      
      mockApiService.register.mockRejectedValue(new Error('Email already exists'))

      render(<TestApp initialRoute="/register" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      // Should remain on registration page
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
    })

    it('should validate password confirmation', async () => {
      const user = userEvent.setup()

      render(<TestApp initialRoute="/register" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')

      await act(async () => {
        await user.click(submitButton)
      })

      // Should show password mismatch error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })

      // Should not call register API
      expect(mockApiService.register).not.toHaveBeenCalled()
    })
  })

  describe('Authentication State Persistence', () => {
    it('should restore authenticated state on page refresh', async () => {
      const mockLocalStorage = {
        getItem: vi.fn()
          .mockReturnValueOnce(JSON.stringify(mockUser)) // user
          .mockReturnValueOnce('token123'), // authToken
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      mockApiService.validateUser.mockResolvedValue({ user: mockUser })

      render(<TestApp initialRoute="/dashboard" />)

      // Should load user from localStorage and validate
      await waitFor(() => {
        expect(mockApiService.validateUser).toHaveBeenCalled()
      })

      // Should show dashboard with user data
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })

      expect(screen.getByText(`Dashboard - Welcome ${mockUser.name}!`)).toBeInTheDocument()
    })

    it('should handle invalid stored auth data', async () => {
      const mockLocalStorage = {
        getItem: vi.fn()
          .mockReturnValueOnce(JSON.stringify(mockUser)) // user
          .mockReturnValueOnce('invalid-token'), // authToken
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      mockApiService.validateUser.mockRejectedValue(new Error('Invalid token'))

      render(<TestApp initialRoute="/dashboard" />)

      // Should attempt to validate token
      await waitFor(() => {
        expect(mockApiService.validateUser).toHaveBeenCalled()
      })

      // Should clear invalid auth data
      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
      })

      // Should redirect to login (in a real app - here we'd need to test routing)
      // Since we're testing at component level, we just verify auth state is cleared
    })
  })

  describe('Navigation Between Auth Pages', () => {
    it('should navigate from login to register', async () => {
      const user = userEvent.setup()

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )

      // Should start at login
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })

      // Click sign up link
      const signUpLink = screen.getByRole('link', { name: /sign up/i })
      await user.click(signUpLink)

      // Should navigate to register page
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
      })
    })

    it('should navigate from register to login', async () => {
      const user = userEvent.setup()

      render(
        <MemoryRouter initialEntries={['/register']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )

      // Should start at register
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
      })

      // Click sign in link
      const signInLink = screen.getByRole('link', { name: /sign in/i })
      await user.click(signInLink)

      // Should navigate to login page
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle session expiration gracefully', async () => {
      const user = userEvent.setup()
      
      // Start with valid session
      const mockLocalStorage = {
        getItem: vi.fn()
          .mockReturnValueOnce(JSON.stringify(mockUser))
          .mockReturnValueOnce('expired-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      // First validation fails (session expired)
      mockApiService.validateUser.mockRejectedValue(new Error('Session expired'))

      render(<TestApp initialRoute="/dashboard" />)

      // Should attempt validation and fail
      await waitFor(() => {
        expect(mockApiService.validateUser).toHaveBeenCalled()
      })

      // Should clear auth data
      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
      })
    })

    it('should handle multiple concurrent login attempts', async () => {
      const user = userEvent.setup()
      
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })
      mockApiService.login.mockReturnValue(loginPromise)

      render(<TestApp initialRoute="/login" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, mockUser.email)
      await user.type(passwordInput, 'password123')

      // Rapidly click submit multiple times
      await act(async () => {
        await user.click(submitButton)
        await user.click(submitButton)
        await user.click(submitButton)
      })

      // Should only make one API call
      expect(mockApiService.login).toHaveBeenCalledTimes(1)

      // Resolve the login
      resolveLogin!({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })
  })
})