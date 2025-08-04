import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'
import { AuthProvider } from '@/contexts/AuthContext'
import { mockApiService, mockUser } from '@/test/utils'

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: mockApiService
}))

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
)

describe('Login Page', () => {
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

  describe('Rendering', () => {
    it('should render login form elements', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
    })

    it('should render loading state when auth is loading', async () => {
      // Make auth loading state true
      const pendingPromise = new Promise(() => {}) // Never resolves
      mockApiService.validateUser.mockReturnValue(pendingPromise)

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Should show some loading indicator or the form should be disabled
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('should have proper form accessibility', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
    })
  })

  describe('Form Interaction', () => {
    it('should update form fields when user types', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.click(submitButton)

      // Should show validation messages or prevent submission
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toBeInvalid()
      expect(passwordInput).toBeInvalid()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger blur event

      expect(emailInput).toBeInvalid()
    })
  })

  describe('Authentication Flow', () => {
    it('should handle successful login', async () => {
      const user = userEvent.setup()
      
      mockApiService.login.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalledWith('test@example.com', 'password123')
      })

      // Should navigate after successful login
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle login failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid email or password'
      
      mockApiService.login.mockRejectedValue(new Error(errorMessage))

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')

      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should show loading state during login', async () => {
      const user = userEvent.setup()
      
      // Create a promise that we can control
      let resolveLogin: (value: unknown) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })
      mockApiService.login.mockReturnValue(loginPromise)

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      await act(async () => {
        await user.click(submitButton)
      })

      // Should show loading state
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()

      // Resolve the login
      resolveLogin!({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      
      // First, cause an error
      mockApiService.login.mockRejectedValue(new Error(errorMessage))

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')

      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      // Now type in the email field - error should clear
      await user.clear(emailInput)
      await user.type(emailInput, 'new@example.com')

      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should redirect authenticated users to dashboard', async () => {
      // Mock user as already authenticated
      mockApiService.validateUser.mockResolvedValue({ user: mockUser })
      
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

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should have working sign-up link', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
      })

      const signUpLink = screen.getByRole('link', { name: /sign up/i })
      expect(signUpLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Form Submission', () => {
    it('should submit form on Enter key press', async () => {
      const user = userEvent.setup()
      
      mockApiService.login.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      await act(async () => {
        await user.keyboard('{Enter}')
      })

      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should prevent multiple submissions', async () => {
      const user = userEvent.setup()
      
      // Make login take some time
      let resolveLogin: (value: unknown) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })
      mockApiService.login.mockReturnValue(loginPromise)

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Click submit button multiple times rapidly
      await act(async () => {
        await user.click(submitButton)
        await user.click(submitButton)
        await user.click(submitButton)
      })

      // Should only call login once
      expect(mockApiService.login).toHaveBeenCalledTimes(1)

      // Resolve the login
      resolveLogin!({
        user: mockUser,
        session: { access_token: 'token123' }
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Error Recovery', () => {
    it('should allow retry after error', async () => {
      const user = userEvent.setup()
      
      // First call fails, second succeeds
      mockApiService.login
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          user: mockUser,
          session: { access_token: 'token123' }
        })

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // First attempt - should fail
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Second attempt - should succeed
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })

      expect(mockApiService.login).toHaveBeenCalledTimes(2)
    })
  })
})