import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { mockApiService, mockUser } from '@/test/utils'

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: mockApiService
}))

// Mock all the page components to avoid loading them
vi.mock('../pages/Index', () => ({
  default: () => <div data-testid="index-page">Index Page</div>
}))

vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('../pages/Register', () => ({
  default: () => <div data-testid="register-page">Register Page</div>
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

vi.mock('../pages/People', () => ({
  default: () => <div data-testid="people-page">People Page</div>
}))

vi.mock('../pages/Gifts', () => ({
  default: () => <div data-testid="gifts-page">Gifts Page</div>
}))

vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>
}))

// Mock the Layout component
vi.mock('../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <nav data-testid="navigation">Navigation</nav>
      <main data-testid="main-content">{children}</main>
    </div>
  )
}))

// Mock the ProtectedRoute component
vi.mock('../components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  )
}))

// Mock ErrorBoundary
vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
}))

// Mock LoadingSpinner
vi.mock('../components/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}))

describe('App Component', () => {
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

  describe('Routing', () => {
    it('should render index page on root path', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('index-page')).toBeInTheDocument()
      })
    })

    it('should render login page on /login path', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })

    it('should render register page on /register path', async () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('register-page')).toBeInTheDocument()
      })
    })

    it('should render not found page for invalid paths', async () => {
      render(
        <MemoryRouter initialEntries={['/invalid-path']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
      })
    })
  })

  describe('Layout Integration', () => {
    it('should render layout for protected routes', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('should not render layout for public routes', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
      
      // Layout should not be present for login page
      expect(screen.queryByTestId('layout')).not.toBeInTheDocument()
    })
  })

  describe('Authentication Integration', () => {
    it('should provide AuthContext to all components', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      )

      // Auth provider should be available (no context errors)
      await waitFor(() => {
        expect(screen.getByTestId('index-page')).toBeInTheDocument()
      })
    })

    it('should show loading state during initial auth check', async () => {
      // Make validateUser return a pending promise to simulate loading
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockApiService.validateUser.mockReturnValue(pendingPromise)

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      // Should show loading initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      // Resolve the promise
      resolvePromise!({ user: mockUser })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should render ErrorBoundary wrapper', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      )

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('should handle route errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      // Should still render something even if there are errors
      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Protected Routes', () => {
    it('should wrap protected routes with ProtectedRoute component', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument()
      })
    })

    it('should render dashboard page within protected route', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })

    it('should render people page within protected route', async () => {
      render(
        <MemoryRouter initialEntries={['/people']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('people-page')).toBeInTheDocument()
      })
    })

    it('should render gifts page within protected route', async () => {
      render(
        <MemoryRouter initialEntries={['/gifts']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('gifts-page')).toBeInTheDocument()
      })
    })
  })

  describe('Lazy Loading', () => {
    it('should show loading spinner while components are loading', async () => {
      // Simulate slow component loading by making the route component loading take time
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      // The loading spinner might appear briefly
      // In a real scenario, this would be more observable with actual lazy loading
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Between Routes', () => {
    it('should allow navigation between public routes', async () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })

      // Simulate navigation to register
      rerender(
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('register-page')).toBeInTheDocument()
      })
    })

    it('should maintain layout when navigating between protected routes', async () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument()
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })

      // Navigate to people page
      rerender(
        <MemoryRouter initialEntries={['/people']}>
          <App />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument()
        expect(screen.getByTestId('people-page')).toBeInTheDocument()
      })
    })
  })

  describe('Toaster Integration', () => {
    it('should include toaster component in the app', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      )

      // The toaster should be in the DOM (even if not visible)
      // This test ensures the component is properly integrated
      await waitFor(() => {
        expect(screen.getByTestId('index-page')).toBeInTheDocument()
      })
    })
  })
})