import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Clock, Store, Mail, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";

export default function PendingApprovalPage() {
  const { user, logout, refreshProfile } = useAuth();

  const steps = [
    { icon: Store,       label: "Shop Registered",   done: true  },
    { icon: ShieldCheck, label: "Admin Reviewing",    done: false, active: true },
    { icon: Mail,        label: "Approval Email Sent", done: false },
    { icon: ArrowRight,  label: "Access Granted",     done: false },
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center ring-4 ring-amber-500/10">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white text-center mb-2 tracking-tight">
            Account Under Review
          </h1>
          <p className="text-slate-400 text-sm text-center font-medium leading-relaxed mb-8">
            Hi <span className="text-white font-bold">{user?.name}</span>! Your seller account has been received.
            Our team will review and approve your shop within <span className="text-amber-400 font-bold">24–48 hours</span>.
          </p>

          {/* Progress steps */}
          <div className="space-y-3 mb-8">
            {steps.map(({ icon: Icon, label, done, active }, i) => (
              <div key={i} className={`
                flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all
                ${done   ? 'bg-emerald-500/10 border-emerald-500/20' :
                  active ? 'bg-amber-500/10 border-amber-500/20 animate-pulse' :
                           'bg-white/5 border-white/5 opacity-40'}
              `}>
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${done ? 'bg-emerald-500/20' : active ? 'bg-amber-500/20' : 'bg-white/5'}
                `}>
                  <Icon className={`w-4 h-4 ${done ? 'text-emerald-400' : active ? 'text-amber-400' : 'text-slate-500'}`} />
                </div>
                <span className={`text-sm font-bold ${done ? 'text-emerald-300' : active ? 'text-amber-300' : 'text-slate-500'}`}>
                  {label}
                </span>
                {done && (
                  <div className="ml-auto">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                {active && (
                  <span className="ml-auto text-[9px] text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* What to expect */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 mb-6">
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">What happens next?</p>
            <ul className="space-y-1.5">
              {[
                'Admin verifies your shop details and Aadhaar',
                'You receive an email notification on approval',
                'Log back in to access your seller dashboard',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400 font-medium">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => refreshProfile()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white hover:border-white/20 uppercase tracking-widest transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Check Approval Status
            </button>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:from-indigo-500 hover:to-violet-500 transition"
            >
              <Store className="w-3.5 h-3.5" /> Browse the Marketplace
            </Link>

            <button
              onClick={logout}
              className="w-full text-center text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
