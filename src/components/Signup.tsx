import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2, CheckCircle2, Sparkles, Phone } from "lucide-react";
import FloatingInput from "@/components/FloatingInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Full name is required (min 2 chars)."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupProps {
  onLoginClick?: () => void;
}

export default function Signup({ onLoginClick }: SignupProps) {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", role: "BUYER" }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setApiError("");
    setLoading(true);
    try {
      await signup({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
        role: data.role,
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
      setApiError(msg);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Create Account</h2>
        <p className="text-slate-400 text-sm">Join Namma Market — it's free</p>
      </div>

      <div>
        <FloatingInput id="signup-name" icon={User} label="Full Name" type="text" {...register("name")} placeholder="Your full name" />
        {errors.name && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.name.message}</p>}
      </div>

      <div>
        <FloatingInput id="signup-email" icon={Mail} label="Email Address" type="email" {...register("email")} placeholder="you@example.com" />
        {errors.email && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.email.message}</p>}
      </div>

      <div>
        <FloatingInput id="signup-phone" icon={Phone} label="Phone (optional)" type="tel" {...register("phone")} placeholder="+91 XXXXX XXXXX" />
        {errors.phone && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.phone.message}</p>}
      </div>

      <div>
        <FloatingInput id="signup-pw" icon={Lock} label="Password" type={showPw ? "text" : "password"} {...register("password")} placeholder="Min 8 characters" 
          showToggle toggled={showPw} onToggle={() => setShowPw((p) => !p)} />
        {errors.password && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Account Type</label>
        <select
          id="signup-role"
          {...register("role")}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-4 text-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 cursor-pointer"
        >
          <option value="BUYER" className="bg-slate-950 text-slate-200">🛒 Buyer (Shop & Purchase)</option>
          <option value="SELLER" className="bg-slate-950 text-slate-200">🏪 Seller (Manage Shop & Products)</option>
          <option value="ADMIN" className="bg-slate-950 text-slate-200">🛡️ Admin (Manage Platform)</option>
        </select>
        {errors.role && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.role.message}</p>}
      </div>

      {apiError && (
        <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="shrink-0">⚠</span>
          <span>{apiError}</span>
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
