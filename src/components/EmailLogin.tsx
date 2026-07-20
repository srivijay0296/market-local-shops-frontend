import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import FloatingInput from "@/components/FloatingInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface EmailLoginProps {
  onSignupClick?: () => void;
}

export default function EmailLogin({ onSignupClick }: EmailLoginProps) {
  const { login, resetPassword, signInWithOtp } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/";

  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const user = await login(data.email.toLowerCase(), data.password);
      if (!user) {
        setLoading(false);
        toast.error("Authentication Failed: Invalid credentials.");
        return;
      }

      const role       = user.role?.toUpperCase();
      const isApproved = user.is_approved;

      if (role === "SELLER" && !isApproved) {
        toast.warning("Your seller account is pending admin approval");
        navigate("/pending-approval", { replace: true });
        return;
      }

      setSuccess(true);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      await new Promise((r) => setTimeout(r, 800));

      if (role === "ADMIN")  navigate("/admin", { replace: true });
      else if (role === "SELLER") navigate("/seller", { replace: true });
      else navigate(from === "/login" ? "/" : from, { replace: true });

    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const currentEmail = watch("email");

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm">Sign in to your Namma Market account</p>
      </div>

      <div>
        <FloatingInput
          id="login-email"
          icon={Mail}
          label="Email Address"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.email.message}</p>}
      </div>

      <div>
        <FloatingInput
          id="login-password"
          icon={Lock}
          label="Password"
          type={showPw ? "text" : "password"}
          {...register("password")}
          placeholder="Your password"
          showToggle
          toggled={showPw}
          onToggle={() => setShowPw((p) => !p)}
        />
        {errors.password && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.password.message}</p>}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={async () => {
             if (!currentEmail || errors.email) { toast.error("Enter a valid email to receive login link"); return; }
             setLoading(true);
             const ok = await signInWithOtp(currentEmail);
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
            if (!currentEmail || errors.email) {
              toast.error("Please enter a valid email first");
              return;
            }
            const ok = await resetPassword(currentEmail);
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
