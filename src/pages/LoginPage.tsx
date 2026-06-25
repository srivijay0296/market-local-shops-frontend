/**
 * LoginPage.tsx  (/login)
 *
 * Shell page: premium split-screen layout.
 * All auth logic lives in the three sub-components:
 *   EmailLogin  → email + password
 *   PhoneLogin  → OTP flow
 *   Signup      → buyer registration
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Store, Users, Package, Zap, ChevronRight, Sparkles, Mail, Phone } from "lucide-react";

import EmailLogin from "@/components/EmailLogin";
import PhoneLogin from "@/components/PhoneLogin";
import Signup     from "@/components/Signup";

// Auth tab types
type Tab = "email" | "phone" | "signup";

// ── Left-panel feature row ────────────────────────────────────
function Feature({ icon: Icon, color, text }: { icon: any; color: string; text: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">{text}</span>
      <ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: Store,   color: "from-violet-500 to-indigo-500", text: "500+ Verified Local Shops" },
  { icon: Package, color: "from-indigo-500 to-blue-500",   text: "Direct Manufacturer Prices" },
  { icon: Users,   color: "from-blue-500 to-cyan-500",     text: "Trusted by 10,000+ Buyers"  },
  { icon: Zap,     color: "from-amber-500 to-orange-500",  text: "Flash Deals Every Day"      },
];

// ── Method toggle pill ────────────────────────────────────────
function MethodToggle({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: "email", icon: Mail,  label: "Email"     },
    { id: "phone", icon: Phone, label: "Phone OTP" },
  ];
  return (
    <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl mb-7 gap-1">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl",
            "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            active === id
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "text-slate-500 hover:text-slate-300",
          ].join(" ")}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("email");

  const showSignup = tab === "signup";

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#030712]">

      {/* ══════════ LEFT — BRANDING PANEL ══════════ */}
      <aside className="hidden lg:flex flex-col w-[480px] xl:w-[540px] shrink-0 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0a0f2c] to-[#030712]" />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[80px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[55%] w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px] animate-pulse delay-500" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">
                Namma<span className="text-indigo-400">Market</span>
              </span>
              <div className="text-[8px] text-white/30 font-bold uppercase tracking-[0.3em]">Textile Hub</div>
            </div>
          </Link>

          {/* Hero */}
          <div className="my-auto py-12">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Premium Marketplace</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6">
              Your Local<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                Market Hub
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 max-w-xs">
              Connect directly with verified local shops, wholesale fabrics,
              and master craftsmen in Bargur Market.
            </p>
            <div className="space-y-3">
              {FEATURES.map((f) => <Feature key={f.text} {...f} />)}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-10 pt-8 border-t border-white/5">
            <Stat value="500+" label="Shops"    />
            <Stat value="50K+" label="Products" />
            <Stat value="10K+" label="Buyers"   />
          </div>
        </div>
      </aside>

      {/* ══════════ RIGHT — AUTH FORM ══════════ */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute top-[15%] right-[8%] w-[280px] h-[280px] bg-indigo-600/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          


          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white">
              Namma<span className="text-indigo-400">Market</span>
            </span>
          </div>

          {/* ── Signup form ── */}
          {showSignup ? (
            <Signup onLoginClick={() => setTab("email")} />
          ) : (
            <>
              {/* Login method toggle (Email / Phone OTP) */}
              <MethodToggle active={tab} onChange={setTab} />

              {/* Render active auth method */}
              {tab === "email" ? (
                <EmailLogin onSignupClick={() => setTab("signup")} />
              ) : (
                <PhoneLogin />
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* SOCIAL AUTH GOOGLE */}
              <button
                onClick={async () => {
                   const { supabase } = await import("@/lib/supabase");
                   await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin
                    }
                  });
                }}
                className="
                  w-full py-4 rounded-2xl border border-white/10 bg-[#ea4335]/10 
                  text-[#ea4335] hover:bg-[#ea4335]/20 hover:border-[#ea4335]/30
                  text-[10px] font-black uppercase tracking-widest transition-all duration-300
                  flex items-center justify-center gap-3 mb-3
                "
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Signup toggle */}
              <button
                onClick={() => setTab("signup")}
                className="
                  w-full py-3.5 rounded-2xl border border-white/10 bg-white/5
                  text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10
                  text-[10px] font-black uppercase tracking-widest transition-all duration-300
                  flex items-center justify-center gap-2
                "
              >
                <Sparkles className="w-3.5 h-3.5" /> New here? Create a free buyer account
              </button>
            </>
          )}

          {/* Back to shop */}
          <div className="text-center mt-8">
            <Link to="/" className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition">
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
