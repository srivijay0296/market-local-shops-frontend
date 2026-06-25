/**
 * PhoneLogin.tsx
 * Step 1: Phone input → Send OTP
 * Step 2: OTP entry → Verify → get role → redirect
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Phone, ShieldCheck, Loader2, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import OtpInput from "@/components/OtpInput";
import FloatingInput from "@/components/FloatingInput";

type Step = "phone" | "otp" | "success";

interface PhoneLoginProps {
  onBack?: () => void;
}

export default function PhoneLogin({ onBack }: PhoneLoginProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/";

  const [step,        setStep]        = useState<Step>("phone");
  const [phone,       setPhone]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error,       setError]       = useState("");

  // Countdown for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const normalizePhone = (raw: string) =>
    raw.trim().startsWith("+") ? raw.trim() : `+91${raw.trim().replace(/^0/, "")}`;

  // ── Step 1: Send OTP ─────────────────────────────────────────
  const sendOTP = async () => {
    setError("");
    if (!phone.trim()) { setError("Enter a valid phone number"); return; }
    const normalized = normalizePhone(phone);
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ 
        phone: normalized,
      });
      if (otpError) throw otpError;
      setStep("otp");
      setResendTimer(60);
      toast.success(`OTP sent to ${normalized} 📱`);
    } catch (err: any) {
      const msg = err.message?.includes("Phone")
        ? "Invalid phone number format. Use 10 digits or +91XXXXXXXXXX"
        : err.message || "Failed to send OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────
  const verifyOTP = async () => {
    setError("");
    if (otp.length !== 6) { setError("Enter all 6 digits"); return; }
    const normalized = normalizePhone(phone);
    setLoading(true);
    try {
      const { data, error: vErr } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: otp,
        type: "sms",
      });
      if (vErr) throw vErr;
      if (!data.user) throw new Error("Verification failed — no user returned");

      // Fetch role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_approved, name")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = (profile?.role || "BUYER").toUpperCase();
      const isApproved = profile?.is_approved ?? true;

      setStep("success");
      toast.success(`Welcome${profile?.name ? `, ${profile.name}` : ""}! 🎉`);

      await new Promise((r) => setTimeout(r, 900));

      // Role-based redirect with seller approval check
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "SELLER") {
        navigate(isApproved ? "/seller" : "/pending-approval", { replace: true });
      } else {
        navigate(from === "/login" ? "/" : from, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err.message?.includes("Invalid") || err.message?.includes("expired")
          ? "Invalid or expired OTP. Please try again."
          : err.message || "OTP verification failed";
      setError(msg);
      toast.error(msg);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Step: phone ───────────────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Phone Login</h2>
          <p className="text-slate-400 text-sm">Enter your mobile number to receive OTP</p>
        </div>

        <FloatingInput
          id="phone"
          icon={Phone}
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+91 XXXXX XXXXX"
          required
        />

        {error && (
          <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            ⚠ {error}
          </p>
        )}

        <button
          onClick={sendOTP}
          disabled={loading || !phone.trim()}
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Phone className="w-4 h-4" /> Send OTP</>}
        </button>

        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition w-full justify-center">
            <ArrowLeft className="w-3.5 h-3.5" /> Switch to Email
          </button>
        )}
      </div>
    );
  }

  // ── Step: otp ─────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
        <div>
          <button
            onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
            className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Change Number
          </button>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest">OTP Sent</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Enter Verification Code</h2>
          <p className="text-slate-400 text-sm">
            Sent to <span className="text-white font-bold">{normalizePhone(phone)}</span>
          </p>
        </div>

        <OtpInput value={otp} onChange={setOtp} disabled={loading} autoFocus />

        {error && (
          <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center">
            ⚠ {error}
          </p>
        )}

        <button
          onClick={verifyOTP}
          disabled={loading || otp.length < 6}
          className="
            w-full bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            text-white font-black py-4 rounded-2xl
            shadow-2xl shadow-indigo-500/25
            transition-all duration-300 flex items-center justify-center gap-3
            uppercase text-xs tracking-[0.2em] active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Verify &amp; Login</>}
        </button>

        {/* Resend */}
        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-slate-500 text-xs font-bold">
              Resend available in <span className="text-indigo-400 tabular-nums">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => { setOtp(""); sendOTP(); }}
              className="text-xs text-indigo-400 font-bold hover:text-white transition flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3 h-3" /> Resend OTP
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Step: success ─────────────────────────────────────────────
  return (
    <div className="text-center py-16 animate-in fade-in zoom-in-95">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Verified!</h2>
      <p className="text-slate-400 text-sm mb-6">Redirecting you now...</p>
      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
    </div>
  );
}
