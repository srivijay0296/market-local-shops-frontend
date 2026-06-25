// src/contexts/SubscriptionContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Subscription {
  id: string;
  user_id: string;
  role: 'buyer' | 'seller';
  plan: string;
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
}

interface SubscriptionContextValue {
  subscription: Subscription | null | undefined;
  isActive: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  createTrial: (role: 'buyer' | 'seller') => Promise<void>;
  startPayment: (role: 'buyer' | 'seller', period: 'monthly' | 'yearly') => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading, refreshProfile } = useAuth();

  // Determine active status:
  // Subscriptions are disabled, all users have active access.
  const isActive = true;
  const isSeller = user?.role === 'SELLER';

  // Construct a virtual subscription object for backwards compatibility if needed by any views
  const subscription: Subscription | null = user ? {
    id: user.id,
    user_id: user.id,
    role: isSeller ? 'seller' : 'buyer',
    plan: user.subscription_plan || 'FREE',
    status: isActive ? 'active' : 'expired',
    start_date: user.trial_start_date || user.created_at || new Date().toISOString(),
    end_date: user.subscription_expires_at || user.trial_end_date || new Date().toISOString(),
  } : null;

  const createTrial = async (role: 'buyer' | 'seller') => {
    // Staging / no-op: Fields are already automatically initialized in the database profiles table via migration.
    await refreshProfile();
  };

  const startPayment = async (role: 'buyer' | 'seller', period: 'monthly' | 'yearly') => {
    if (!user) return;
    
    // Amount matching the requested pricing card parameters
    const amount = period === 'monthly' ? 999 : 11999;
    const { initiatePayment } = await import('@/lib/razorpay');

    await initiatePayment({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SeRgU6MPAPAxcl',
      amount: amount * 100, // in paise
      currency: 'INR',
      name: 'Namma Market',
      description: `${period.toUpperCase()} Seller Subscription Plan`,
      notes: { user_id: user.id, plan: period, role },
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || '',
      },
      handler: async (response) => {
        const startDate = new Date();
        const endDate = new Date();
        if (period === 'yearly') {
          endDate.setDate(startDate.getDate() + 365);
        } else {
          endDate.setDate(startDate.getDate() + 30);
        }

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'ACTIVE',
              payment_status: 'PAID',
              subscription_plan: period.toUpperCase(),
              payment_date: startDate.toISOString(),
              expiry_date: endDate.toISOString(),
              subscription_expires_at: endDate.toISOString(),
              last_payment_id: response.razorpay_payment_id || response.id || 'pay_unknown'
            })
            .eq('id', user.id);

          if (error) throw error;
          await refreshProfile();
        } catch (err) {
          console.error('Failed to update subscription in profiles database table:', err);
        }
      }
    });
  };

  const value: SubscriptionContextValue = {
    subscription,
    isActive,
    loading: authLoading,
    refresh: refreshProfile,
    createTrial,
    startPayment,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
