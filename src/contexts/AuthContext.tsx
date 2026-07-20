import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { backendApi } from '@/lib/api/client';
import axios from 'axios';

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_approved: boolean;
  shop_id?: string;
  phone?: string;
  address?: string;
  aadhaar_number?: string;
  aadhaarId?: string; // alias for aadhaar_number used in some forms
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_status?: string;
  subscription_plan?: string;
  payment_status?: string;
  subscription_expires_at?: string;
  last_payment_id?: string;
  payment_date?: string;
  expiry_date?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileFetchError: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (data: any) => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  signInWithOtp: (email: string) => Promise<boolean>;
  loginWithOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, token: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  /** Normalize raw backend profile DTO → frontend User interface */
  const normalizeProfile = (data: any): User | null => {
    if (!data || !data.email) return null;
    return {
      id: String(data.id),
      name: data.name || data.username || data.email,
      email: data.email,
      // Backend stores CUSTOMER; frontend calls it BUYER — normalize here
      role: (data.role === 'CUSTOMER' ? 'BUYER' : (data.role || 'BUYER')) as UserRole,
      is_approved: data.is_approved ?? true,
      shop_id: data.shop_id ? String(data.shop_id) : undefined,
      phone: data.phone,
      address: data.address,
    };
  };

  const fetchProfileWithDeduplication = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const { data } = await backendApi.get('/auth/profile');
      return normalizeProfile(data);
    } catch (err: any) {
      // 401 = token expired or invalid — clear storage silently
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token');
        delete backendApi.defaults.headers.common['Authorization'];
        return null;
      }
      console.error('Failed to fetch profile', err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log('Loading: true (initializeAuth)');
      try {
        console.log('📡 Auth Node: Initializing identity sync...');
        // Restore auth header from stored token before profile fetch
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          backendApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        const profile = await fetchProfileWithDeduplication();

        if (profile) {
          setProfileFetchError(null);
          setUser(profile);
          console.log('✅ Identity calibrated:', profile?.email);
        } else {
          console.log('ℹ️ Auth Node: No active session found.');
          setProfileFetchError(null);
          setUser(null);
        }
      } catch (err: any) {
        console.error('❌ Nexus Auth Collision:', err.message || err);
        setProfileFetchError(err.message || 'Failed to load user profile');
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('Loading: false (initializeAuth)');
      }
    };

    initializeAuth();
  }, []);

  // 🔐 LOGIN COMMAND
  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      // ✅ Backend expects { email, password } — NOT { username, password }
      const { data } = await backendApi.post('/auth/login', { email: email.trim().toLowerCase(), password });

      const token = data?.token || data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        // ✅ Immediately set the Authorization header for subsequent requests
        backendApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Build user profile from login response (AuthResponse DTO) or fetch separately
      let profile: User | null = null;
      if (data?.id && data?.email) {
        profile = normalizeProfile(data);
      } else {
        profile = await fetchProfileWithDeduplication();
      }

      if (!profile) {
        setProfileFetchError('Profile record could not be retrieved from the database.');
      } else {
        setProfileFetchError(null);
      }
      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Login failed';
      setProfileFetchError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 📝 SIGNUP COMMAND
  const signup = async (data: any): Promise<User | null> => {
    setIsLoading(true);
    try {
      await backendApi.post('/auth/register', data);
      
      // Auto login after signup
      return await login(data.email, data.password);
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 LOGOUT COMMAND
  const logout = async () => {
    try {
      await backendApi.post('/auth/logout');
    } catch (err) {
      console.error('Logout API Fault:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('sb-token');
      // ✅ Clear the default Authorization header
      delete backendApi.defaults.headers.common['Authorization'];
      console.info('🔓 User logged out successfully.');
    }
  };

  const resetPassword = async (email: string) => {
    console.warn("resetPassword not fully implemented in Spring Boot migration yet.");
    return true;
  };

  const signInWithOtp = async (email: string) => {
    console.warn("signInWithOtp not fully implemented in Spring Boot migration yet.");
    return true;
  };

  const loginWithOTP = async (email: string) => {
    console.warn("loginWithOTP not fully implemented in Spring Boot migration yet.");
    return true;
  };

  const verifyOTP = async (email: string, token: string) => {
    console.warn("verifyOTP not fully implemented in Spring Boot migration yet.");
    return true;
  };

  const refreshProfile = async () => {
    try {
      const profile = await fetchProfileWithDeduplication();
      setUser(profile);
    } catch (err) {
      console.error('refreshProfile failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      profileFetchError,
      login,
      signup,
      logout,
      resetPassword,
      signInWithOtp,
      loginWithOTP,
      verifyOTP,
      refreshProfile,
      showAuthModal,
      setShowAuthModal,
      authMode,
      setAuthMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
