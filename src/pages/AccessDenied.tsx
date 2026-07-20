import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[30%] right-[30%] w-72 h-72 bg-rose-500/10 rounded-full blur-[100px]" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/20 mb-8 border border-rose-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Clearance <span className="text-rose-500">Denied</span>
        </h1>
        
        <p className="text-slate-400 font-medium max-w-md mb-10 text-sm leading-relaxed">
          You do not have the required administrative clearance to access this sector of the management console. Intrusion logged.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-white/10 hover:bg-slate-200 hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Safety
        </Link>
      </div>
    </div>
  );
}
