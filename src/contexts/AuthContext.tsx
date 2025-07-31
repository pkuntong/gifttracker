import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/services/api'
import type { ApiError } from '@/types/api'
import { isApiError, getErrorMessage } from '@/utils/api-helpers'

interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
  preferences?: {
    currency?: string
    timezone?: string
    theme?: 'light' | 'dark' | 'system'
    notifications?: boolean
    language?: string
    subscription?: {
      plan: 'FREE' | 'PREMIUM'
      status: 'active' | 'inactive' | 'cancelled'
    }
  }
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
      
      console.log('🚀 Attempting login with:', email)
      const response = await apiService.login(email, password)
      console.log('📨 Login response received')
      
      if (response.user) {
        console.log('✅ User data received, setting user state')
        setUser(response.user)
        // Token management is handled by the API service now
        localStorage.setItem('user', JSON.stringify(response.user))
        console.log('💾 User data saved to localStorage')
        console.log('👤 User set successfully:', response.user.name)
      } else {
        console.log('❌ No user data in response')
        throw new Error('Login failed - no user data received')
      }
    } catch (err: unknown) {
      console.error('🚨 Login error:', err)
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      console.log('🏁 Login process complete, setting isLoading to false')
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
        // Token management is handled by the API service now
        localStorage.setItem('user', JSON.stringify(response.user))
        console.log('✅ Registration successful for:', response.user.name)
      } else {
        throw new Error('Registration failed - no user data received')
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
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
      console.log('✅ Logout successful')
    } catch (err: unknown) {
      console.error('❌ Logout error (continuing anyway):', err)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
      // Token clearing is handled by the API service
      setIsLoading(false)
    }
  }

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...')
        const storedUser = localStorage.getItem('user')
        
        console.log('📦 Stored user:', storedUser ? 'exists' : 'missing')
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            
            // Validate token with server
            console.log('🔐 Validating token with server...')
            const response = await apiService.validateUser()
            console.log('✅ Token validation successful')
            
            if (response.user) {
              console.log('✅ Setting user from server validation')
              setUser(response.user)
              // Update localStorage with fresh user data
              localStorage.setItem('user', JSON.stringify(response.user))
            } else if (response.valid) {
              // Token is valid but no user data returned, use stored data
              console.log('✅ Token valid, using stored user data')
              setUser(userData)
            } else {
              throw new Error('Token validation failed')
            }
          } catch (validationError) {
            console.log('❌ Token validation failed:', validationError)
            
            // Check if it's a network/endpoint error vs auth error
            if (isApiError(validationError) && validationError.status === 404) {
              console.log('⚠️ Validation endpoint not found (404), using stored user data')
              const userData = JSON.parse(storedUser)
              setUser(userData)
            } else if (isApiError(validationError) && validationError.status === 401) {
              console.log('❌ Authentication expired, clearing data')
              apiService.clearTokens()
              localStorage.removeItem('user')
              setUser(null)
            } else {
              console.log('⚠️ Network error during validation, using stored data temporarily')
              const userData = JSON.parse(storedUser)
              setUser(userData)
            }
          }
        } else {
          console.log('❌ No stored authentication found')
          setUser(null)
        }
      } catch (err) {
        console.error('🚨 Auth check error:', err)
        apiService.clearTokens()
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        console.log('🏁 Auth check complete, setting isLoading to false')
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