import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendApi } from '@/lib/api/client';
import { toast } from "sonner";
import { Lock, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import FloatingInput from "@/components/FloatingInput";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await backendApi.post('/auth/reset-password', { password });
      setSuccess(true);
      toast.success("Password updated successfully! 🎉");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white">Security Updated</h2>
          <p className="text-slate-400">Your password has been reset successfully. Redirecting you to login...</p>
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Set New Password</h1>
            <p className="text-slate-400 text-sm">Please enter a strong password to secure your account.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <FloatingInput
              id="new-password"
              icon={Lock}
              label="New Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min 6 characters"
              required
              showToggle
            />

            <FloatingInput
              id="confirm-password"
              icon={Lock}
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat password"
              required
            />

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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
