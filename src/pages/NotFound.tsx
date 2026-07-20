import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-rose-500/10 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-400 mb-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/20 rotate-12 hover:rotate-0 transition-transform duration-500">
          <Compass className="w-10 h-10" />
        </div>
        
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 tracking-tighter mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-widest text-[14px]">
          Sector Uncharted
        </h2>
        
        <p className="text-slate-400 font-medium max-w-md mb-10 text-sm leading-relaxed">
          The requested coordinate <code className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{location.pathname}</code> could not be resolved in the Namma Market matrix.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-white/10 hover:bg-slate-200 hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Genesis
        </Link>
      </div>
    </div>
  );
}
