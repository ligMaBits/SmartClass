import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async (token: string) => {
    try {
      // Set the token in the Authorization header
      api.setAuthToken(token);
      
      // Try to fetch the current user's data
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('smartClassUser');

        if (token && storedUser) {
          try {
            // Validate the token
            const userData = await validateToken(token);
            if (userData) {
              setUser(userData);
            } else {
              // If token validation fails, clear everything
              localStorage.removeItem('token');
              localStorage.removeItem('smartClassUser');
            }
          } catch (error) {
            console.error('Failed to validate token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('smartClassUser');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response;
      
      // Store the token
      localStorage.setItem('token', token);
      
      // Set the user in state
      setUser(user);
      // Store user in localStorage
      localStorage.setItem('smartClassUser', JSON.stringify(user));
      
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response;
      
      // Store the token
      localStorage.setItem('token', token);
      
      // Set the user in state
      setUser(user);
      // Store user in localStorage
      localStorage.setItem('smartClassUser', JSON.stringify(user));
      
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred during registration");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('smartClassUser');
    api.removeAuthToken();
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
