import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService, ApiError } from '@/services/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for development
const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  createdAt: new Date().toISOString(),
  preferences: {
    currency: 'USD',
    timezone: 'UTC',
    notifications: true,
    theme: 'system'
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // In development mode, use mock user if API fails
          try {
            const user = await ApiService.getCurrentUser();
            setUser(user);
          } catch (error) {
            console.log('API not available, using mock user for development');
            // Use mock user for development
            setUser(mockUser);
            localStorage.setItem('authToken', 'mock-token');
            localStorage.setItem('userData', JSON.stringify(mockUser));
          }
        } else {
          // For development, auto-login with mock user
          console.log('No token found, using mock user for development');
          setUser(mockUser);
          localStorage.setItem('authToken', 'mock-token');
          localStorage.setItem('userData', JSON.stringify(mockUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, token } = await ApiService.login(email, password);
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      // For development, use mock login if API fails
      console.log('API not available, using mock login for development');
      setUser(mockUser);
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { user, token } = await ApiService.register(name, email, password);
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      // For development, use mock registration if API fails
      console.log('API not available, using mock registration for development');
      const newUser = { ...mockUser, name, email };
      setUser(newUser);
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 