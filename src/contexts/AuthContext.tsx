import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/services/api'

interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  const clearError = () => setError(null)

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.login(email, password)
      
      if (response.user) {
        setUser(response.user)
        localStorage.setItem('authToken', response.session?.access_token || '')
        localStorage.setItem('user', JSON.stringify(response.user))
      } else {
        throw new Error('Login failed - no user data received')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.register(email, password, name)
      
      if (response.user) {
        setUser(response.user)
        localStorage.setItem('authToken', response.session?.access_token || '')
        localStorage.setItem('user', JSON.stringify(response.user))
      } else {
        throw new Error('Registration failed - no user data received')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await apiService.logout()
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setIsLoading(false)
    }
  }

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('authToken')
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 