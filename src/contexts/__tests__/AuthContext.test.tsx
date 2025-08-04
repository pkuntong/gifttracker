import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockApiService, mockUser, mockLocalStorage, setupApiMocks } from '@/test/utils'
import { ApiError } from '@/types/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: mockApiService
}))

// Mock utils
vi.mock('@/utils/api-helpers', () => ({
  isApiError: vi.fn((error: unknown) => error && typeof (error as { status?: number }).status === 'number'),
  getErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error) return error.message
    if (error && (error as { message?: string }).message) return (error as { message: string }).message
    return 'An unexpected error occurred'
  })
}))

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth()
  
  return (
    <div>
      <div data-testid="user-email">{auth.user?.email || 'No user'}</div>
      <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <div data-testid="error">{auth.error || 'No error'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => auth.login('test@example.com', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => auth.register('test@example.com', 'password', 'Test User')}
      >
        Register
      </button>
      <button 
        data-testid="logout-btn" 
        onClick={() => auth.logout()}
      >
        Logout
      </button>
      <button 
        data-testid="clear-error-btn" 
        onClick={() => auth.clearError()}
      >
        Clear Error
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('AuthProvider', () => {
    it('should provide initial state correctly', async () => {
      mockApiService.validateUser.mockRejectedValue(new Error('No token'))
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initially loading should be true
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true')
      
      // Wait for auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('No error')
    })

    it('should restore user from localStorage on mount', async () => {
      const storedUser = JSON.stringify(mockUser)
      const token = 'valid-token'
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(storedUser) // First call for 'user'
        .mockReturnValueOnce(token) // Second call for 'authToken'
      
      mockApiService.validateUser.mockResolvedValue({ user: mockUser })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      expect(mockApiService.validateUser).toHaveBeenCalled()
    })

    it('should handle login successfully', async () => {
      const user = userEvent.setup()
      mockApiService.login.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'new-token' }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      await act(async () => {
        await user.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      expect(mockApiService.login).toHaveBeenCalledWith('test@example.com', 'password')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'new-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    })

    it('should handle login failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      mockApiService.login.mockRejectedValue(new Error(errorMessage))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      await act(async () => {
        await user.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
    })

    it('should handle registration successfully', async () => {
      const user = userEvent.setup()
      mockApiService.register.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'new-token' }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      await act(async () => {
        await user.click(screen.getByTestId('register-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      expect(mockApiService.register).toHaveBeenCalledWith('test@example.com', 'password', 'Test User')
    })

    it('should handle registration failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Email already exists'
      mockApiService.register.mockRejectedValue(new Error(errorMessage))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      await act(async () => {
        await user.click(screen.getByTestId('register-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    })

    it('should handle logout successfully', async () => {
      const user = userEvent.setup()
      
      // Setup initial authenticated state
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockUser))
        .mockReturnValueOnce('token')
      mockApiService.validateUser.mockResolvedValue({ user: mockUser })
      mockApiService.logout.mockResolvedValue({})

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for user to be loaded
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      })

      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should clear error when clearError is called', async () => {
      const user = userEvent.setup()
      
      // Trigger an error first
      mockApiService.login.mockRejectedValue(new Error('Test error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      // Trigger error
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error')
      })

      // Clear error
      await act(async () => {
        await user.click(screen.getByTestId('clear-error-btn'))
      })

      expect(screen.getByTestId('error')).toHaveTextContent('No error')
    })

    it('should handle token validation failure gracefully', async () => {
      const storedUser = JSON.stringify(mockUser)
      const token = 'invalid-token'
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(storedUser)
        .mockReturnValueOnce(token)
      
      mockApiService.validateUser.mockRejectedValue(new Error('Invalid token'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle 404 validation error by keeping user logged in', async () => {
      const storedUser = JSON.stringify(mockUser)
      const token = 'token'
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(storedUser)
        .mockReturnValueOnce(token)
      
      const error404 = new Error('404 - Not Found')
      mockApiService.validateUser.mockRejectedValue(error404)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      // Should keep user logged in when validation endpoint returns 404
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
    })

    it('should handle login without user data in response', async () => {
      const user = userEvent.setup()
      mockApiService.login.mockResolvedValue({
        user: null,
        session: { access_token: 'token' }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      await act(async () => {
        await user.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed - no user data received')
      })

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    })
  })
})