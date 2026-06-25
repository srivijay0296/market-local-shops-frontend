import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, loginUser, registerUser } from '@/services/api';

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

  const activeFetches = React.useRef<Map<string, Promise<any>>>(new Map());

  const fetchProfileWithDeduplication = async (userId?: string): Promise<any> => {
    let finalId = userId;
    if (!finalId) {
      const { data: { session } } = await supabase.auth.getSession();
      finalId = session?.user?.id;
    }
    if (!finalId) return null;

    if (activeFetches.current.has(finalId)) {
      console.log(`[AuthContext] Reusing active profile fetch promise for userId: ${finalId}`);
      return activeFetches.current.get(finalId)!;
    }

    const promise = getCurrentUser(finalId).finally(() => {
      activeFetches.current.delete(finalId!);
    });

    activeFetches.current.set(finalId, promise);
    return promise;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log("Loading: true (initializeAuth)");
      try {
          console.log('📡 Auth Node: Initializing identity sync...');
          const { data: { session } } = await supabase.auth.getSession();
          console.log("Session:", session);
          if (session?.user) {
            console.log("User:", session.user);
            const profile = await fetchProfileWithDeduplication(session.user.id);
            console.log("Profile:", profile);
            console.log("Role:", profile?.role);
            if (!profile) {
              setProfileFetchError("Profile record could not be retrieved from the database.");
            } else {
              setProfileFetchError(null);
            }
            setUser(profile);
            console.log('✅ Identity calibrated:', profile?.email);
          } else {
            console.log('ℹ️ Auth Node: No active session found.');
            setProfileFetchError(null);
            setUser(null);
          }
      } catch (err: any) {
          console.error('❌ Nexus Auth Collision:', err.message || err);
          setProfileFetchError(err.message || "Failed to load user profile");
          setUser(null);
      } finally {
          setIsLoading(false);
          console.log("Loading: false (initializeAuth)");
      }
    };

    initializeAuth();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔑 Auth State Update: ${event}`);
      console.log("Session:", session);
      setIsLoading(true);
      console.log("Loading: true (onAuthStateChange)");
      try {
        if (session?.user) {
          console.log("User:", session.user);
          const profile = await fetchProfileWithDeduplication(session.user.id);
          console.log("Profile:", profile);
          console.log("Role:", profile?.role);
          if (!profile) {
            setProfileFetchError("Profile record could not be retrieved from the database.");
          } else {
            setProfileFetchError(null);
          }
          setUser(profile);
          console.info('✅ Auth state – user logged in:', profile?.email);
        } else {
          setProfileFetchError(null);
          setUser(null);
          console.warn('⚠️ Auth state – no active session (user logged out or session expired)');
        }
      } catch (err: any) {
        console.error('❌ onAuthStateChange callback error:', err.message || err);
        setProfileFetchError(err.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
        console.log("Loading: false (onAuthStateChange)");
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  // 🔐 LOGIN COMMAND
  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    console.log("Loading: true (login)");
    try {
      console.log(`🔐 Attempting login for ${email}...`);
      const result = await loginUser(email, password);
      console.log("Login Result:", result);
      
      if (result.data?.user) {
        console.log("User:", result.data.user);
        const profile = await fetchProfileWithDeduplication(result.data.user.id);
        console.log("Profile:", profile);
        console.log("Role:", profile?.role);
        if (!profile) {
          setProfileFetchError("Profile record could not be retrieved from the database.");
        } else {
          setProfileFetchError(null);
        }
        setUser(profile);
        console.log('✅ Login verified. Node status: ACTIVE');
        return profile;
      }
      setProfileFetchError(null);
      return null;
    } catch (err: any) {
      console.error('❌ Access Denied:', err.message || err);
      setProfileFetchError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
      console.log("Loading: false (login)");
    }
  };

  // 📝 SIGNUP COMMAND
  const signup = async (data: any): Promise<User | null> => {
    setIsLoading(true);
    try {
      console.log('📝 Initializing new node registration...');
      const result = await registerUser(data);
      
      if (result.user) {
          console.log('✅ Registration successful. Calibrating session...');
          return await login(data.email, data.password);
      }
      return null;
    } catch (err: any) {
      console.error('❌ Registration Aborted:', err.message || err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 LOGOUT COMMAND
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('sb-token');
      console.info('🔓 User logged out successfully.');
    } catch (err) {
      console.error('Logout Fault:', err);
      console.error('🔓 Logout error details:', err);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return !error;
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return !error;
  };

  const loginWithOTP = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return true;
  };

  const verifyOTP = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    const profile = await fetchProfileWithDeduplication();
    setUser(profile);
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
