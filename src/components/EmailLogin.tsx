/**
 * EmailLogin.tsx
 * Email + Password login with role-based redirect.
 * Handles: wrong password, email not found, seller pending approval.
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import FloatingInput from "@/components/FloatingInput";

interface EmailLoginProps {
  onSignupClick?: () => void;
}

export default function EmailLogin({ onSignupClick }: EmailLoginProps) {
  const { login, resetPassword, signInWithOtp } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/";

  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !pw) { setError("Email and password are required"); return; }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), pw);
      if (!user) {
        setLoading(false);
        setError("Invalid email or password. Please verify your credentials.");
        toast.error("Authentication Failed: Invalid credentials.");
        return;
      }

      const role       = user.role?.toUpperCase();
      const isApproved = user.is_approved;

      // Block unapproved sellers right here — clear UX
      if (role === "SELLER" && !isApproved) {
        toast.warning("Your seller account is pending admin approval");
        navigate("/pending-approval", { replace: true });
        return;
      }

      setSuccess(true);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      await new Promise((r) => setTimeout(r, 800));

      if (role === "ADMIN")  navigate("/admin",            { replace: true });
      else if (role === "SELLER") navigate("/seller", { replace: true });
      else navigate(from === "/login" ? "/" : from, { replace: true });

    } catch (err: any) {
      const msg = err.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Welcome back!</h2>
        <p className="text-slate-400 text-sm mb-6">Taking you to your dashboard...</p>
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm">Sign in to your Namma Market account</p>
      </div>

      <FloatingInput
        id="login-email"
        icon={Mail}
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        required
      />

      <FloatingInput
        id="login-password"
        icon={Lock}
        label="Password"
        value={pw}
        onChange={setPw}
        placeholder="Your password"
        required
        showToggle
        toggled={showPw}
        onToggle={() => setShowPw((p) => !p)}
      />

      {error && (
        <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={async () => {
             if (!email) { toast.error("Enter email to receive login link"); return; }
             setLoading(true);
             const ok = await signInWithOtp(email);
             setLoading(false);
             if (ok) toast.success("Magic Link sent! Check your inbox.");
             else toast.error("Failed to send Magic Link.");
          }}
          className="text-[10px] text-indigo-400 hover:text-white font-black uppercase tracking-widest transition"
        >
          Use Magic Link
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!email) {
              toast.error("Please enter your email first");
              return;
            }
            const ok = await resetPassword(email);
            if (ok) toast.success("Password reset link sent to your email!");
            else toast.error("Failed to send reset link. Please try again.");
          }}
          className="text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest transition"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          group w-full relative overflow-hidden
          bg-gradient-to-r from-indigo-600 to-violet-600
          hover:from-indigo-500 hover:to-violet-500
          text-white font-black py-4 rounded-2xl
          shadow-2xl shadow-indigo-500/25
          transition-all duration-300 flex items-center justify-center gap-3
          uppercase text-xs tracking-[0.2em] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Sign In</>}
      </button>

      {onSignupClick && (
        <p className="text-center text-slate-500 text-xs font-bold">
          No account?{" "}
          <button
            type="button"
            onClick={onSignupClick}
            className="text-indigo-400 hover:text-white transition font-black uppercase tracking-widest"
          >
            Create one free
          </button>
        </p>
      )}
    </form>
  );
}
