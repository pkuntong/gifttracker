import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/services/api'

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
      console.log('📨 Login response:', response)
      
      if (response.user) {
        console.log('✅ User data received, setting user state')
        setUser(response.user)
        localStorage.setItem('authToken', response.session?.access_token || '')
        localStorage.setItem('user', JSON.stringify(response.user))
        console.log('💾 User data saved to localStorage')
        console.log('👤 User set successfully:', response.user)
      } else {
        console.log('❌ No user data in response')
        throw new Error('Login failed - no user data received')
      }
    } catch (err: any) {
      console.error('🚨 Login error:', err)
      setError(err.message || 'Login failed')
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
        console.log('🔍 Checking authentication...')
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('authToken')
        
        console.log('📦 Stored user:', storedUser)
        console.log('🔑 Stored token:', token ? 'exists' : 'missing')
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser)
          console.log('✅ Setting user from localStorage:', userData)
          setUser(userData)
        } else {
          console.log('❌ No stored authentication found')
        }
        // No automatic mock user creation - users must sign in properly
      } catch (err) {
        console.error('🚨 Auth check error:', err)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
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