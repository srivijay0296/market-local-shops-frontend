/**
 * Signup.tsx
 * BUYER-only self-registration.
 * Sellers are created by Admin → shows info notice.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2, CheckCircle2, Sparkles, Phone } from "lucide-react";
import FloatingInput from "@/components/FloatingInput";

interface SignupProps {
  onLoginClick?: () => void;
}

export default function Signup({ onLoginClick }: SignupProps) {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "BUYER" });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const validate = () => {
    if (!form.name.trim())   return "Full name is required";
    if (!form.email.trim())  return "Email address is required";
    if (!form.email.includes("@")) return "Enter a valid email address";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await signup({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        phone:    form.phone.trim() || undefined,
        role:     form.role,
      });

      setSuccess(true);
      toast.success("Account created! Welcome to Namma Market 🎉");
      await new Promise((r) => setTimeout(r, 900));
      navigate("/", { replace: true });
    } catch (err: any) {
      let msg = err.message || "Signup failed";
      if (msg.includes("already registered") || msg.includes("already exists"))
        msg = "This email is already registered. Try logging in instead.";
      else if (msg.includes("Password should"))
        msg = "Password must be at least 8 characters long.";
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
        <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
        <p className="text-slate-400 text-sm mb-6">Taking you to the marketplace...</p>
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Create Account</h2>
        <p className="text-slate-400 text-sm">Join Namma Market — it's free</p>
      </div>

      <FloatingInput id="signup-name"  icon={User}  label="Full Name"      type="text"  value={form.name}     onChange={set("name")}     placeholder="Your full name"    required />
      <FloatingInput id="signup-email" icon={Mail}  label="Email Address"  type="email" value={form.email}    onChange={set("email")}    placeholder="you@example.com"   required />
      <FloatingInput id="signup-phone" icon={Phone} label="Phone (optional)" type="tel" value={form.phone}    onChange={set("phone")}    placeholder="+91 XXXXX XXXXX" />
      <FloatingInput id="signup-pw"    icon={Lock}  label="Password"                    value={form.password} onChange={set("password")} placeholder="Min 8 characters" required
        showToggle toggled={showPw} onToggle={() => setShowPw((p) => !p)} />

      {/* Role Selection Dropdown */}
      <div className="space-y-1">
        <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Account Type</label>
        <select
          id="signup-role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-4 text-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 cursor-pointer"
        >
          <option value="BUYER" className="bg-slate-950 text-slate-200">🛒 Buyer (Shop & Purchase)</option>
          <option value="SELLER" className="bg-slate-950 text-slate-200">🏪 Seller (Manage Shop & Products)</option>
          <option value="ADMIN" className="bg-slate-950 text-slate-200">🛡️ Admin (Manage Platform)</option>
        </select>
      </div>

      {error && (
        <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

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
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create Free Account</>}
      </button>

      {onLoginClick && (
        <p className="text-center text-slate-500 text-xs font-bold">
          Already have an account?{" "}
          <button type="button" onClick={onLoginClick}
            className="text-indigo-400 hover:text-white transition font-black uppercase tracking-widest"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  );
}
