import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Lock, Check, AlertTriangle, Crown, Store, User, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionBlocker() {
  return null;
  
  const { user, logout } = useAuth();
  const { isActive, loading, startPayment } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Allow access to Profile, Login, and Signup pages without blocking
  const isProfilePage = location.pathname === '/profile';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  const isSubscriptionExpired = !isActive;

  // The subscription/pay blocker only applies to users with the 'SELLER' role.
  // Buyers and Admins are not restricted.
  if (loading || !user || user.role !== 'SELLER' || !isSubscriptionExpired || isProfilePage || isAuthPage) {
    return null;
  }

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await startPayment('seller', plan);
      // Success will refresh the user profile inside SubscriptionContext
    } catch (err: any) {
      console.error('Subscription purchase failed:', err);
      setErrorMessage('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start p-4 md:p-8 bg-[#0C0A1C] text-white overflow-y-auto font-sans selection:bg-purple-500/30">
      
      {/* 🔮 Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none translate-y-1/3" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,#080612_100%)] pointer-events-none" />

      {/* 🚀 Header / Top Navigation */}
      <header className="relative w-full max-w-6xl flex items-center justify-between py-6 px-4 md:px-8 border-b border-white/[0.06] mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-wider uppercase italic bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            NAMMA MARKET
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <User className="w-4 h-4 text-purple-400" />
            Profile
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all text-xs font-bold uppercase tracking-wider text-purple-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* 🛡️ Content Section */}
      <main className="relative w-full max-w-5xl flex flex-col items-center gap-12 z-10 my-auto pb-16">
        
        {/* Title area */}
        <div className="text-center max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-500/5 animate-pulse">
            ⭐ Free Trial Expired
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent uppercase italic leading-none pt-2">
            Upgrade Your Business
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
            Your 15-day free trial has ended. Choose a plan to continue using Namma Market.
          </p>
        </div>

        {/* ⏱️ Animated Countdown Cards (Locked at 0 because expired) */}
        <div className="grid grid-cols-4 gap-3 max-w-md w-full">
          {[
            { value: '00', label: 'Days' },
            { value: '00', label: 'Hours' },
            { value: '00', label: 'Minutes' },
            { value: '00', label: 'Seconds' },
          ].map((unit, i) => (
            <div key={i} className="flex flex-col items-center bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 shadow-xl shadow-purple-950/10 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-50" />
              <span className="text-3xl md:text-4xl font-black tracking-widest text-purple-400/90 font-mono select-none">
                {unit.value}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* ❌ Error Message Display */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl max-w-md w-full text-rose-300 shadow-lg shadow-rose-950/10">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider">{errorMessage}</span>
          </div>
        )}

        {/* 📦 Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative">
          
          {/* Processing overlay wrapper */}
          {isProcessing && (
            <div className="absolute inset-0 bg-[#0C0A1C]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-3xl">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-black text-xs uppercase tracking-widest text-purple-400 animate-pulse">
                Synchronizing with Payment Gateway...
              </p>
            </div>
          )}

          {/* Plan 1: Monthly */}
          <div className="bg-white/[0.02] backdrop-blur-lg border border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.04] rounded-[2rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl hover:shadow-purple-950/20 relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Standard Node
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                  Monthly
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  Monthly Plan
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">₹999</span>
                  <span className="text-slate-400 text-xs font-semibold">/ month</span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-6 space-y-4">
                {[
                  'Unlimited Shops',
                  'Unlimited Products',
                  'Orders & Invoicing',
                  'Marketplace Analytics',
                  'Priority Support',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={isProcessing}
              className="mt-8 w-full py-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-purple-600 hover:border-purple-500 hover:scale-[1.02] text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
            >
              Subscribe Monthly
            </button>
          </div>

          {/* Plan 2: Yearly (Highlighted) */}
          <div className="bg-gradient-to-b from-purple-950/20 to-indigo-950/20 backdrop-blur-lg border-2 border-purple-500/50 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 shadow-[0_20px_50px_rgba(124,58,237,0.15)] relative overflow-hidden group hover:scale-[1.01] hover:border-purple-400">
            {/* Top highlight label */}
            <div className="absolute top-0 right-8 bg-purple-500 text-[#0C0A1C] text-[9px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-md">
              Save ₹1,989
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-purple-300">
                  Value Choice
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500 text-[#0C0A1C] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                  Yearly
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white group-hover:text-purple-200 transition-colors flex items-center gap-2">
                  Yearly Plan <Crown className="w-5 h-5 text-purple-400 fill-purple-400/20" />
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">₹11,999</span>
                  <span className="text-purple-300 text-xs font-semibold">/ year</span>
                </div>
              </div>

              <div className="border-t border-purple-500/10 pt-6 space-y-4">
                {[
                  'Everything in Monthly Plan',
                  'Significant Savings (Save ₹1,989)',
                  'Uninterrupted 1-Year Operation',
                  'Dedicated Account Executive',
                  'Free Setup & Integration Audit',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-purple-300" />
                    </div>
                    <span className="text-xs font-medium text-purple-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={isProcessing}
              className="mt-8 w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              Subscribe Yearly
            </button>
          </div>

        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/[0.04] w-full max-w-2xl text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500/50" />
            Secured by Razorpay
          </div>
          <span>•</span>
          <div>256-bit SSL Protection</div>
          <span>•</span>
          <div>Instant Node Activation</div>
        </div>

      </main>
    </div>
  );
}
