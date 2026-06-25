import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10 mb-8 border-4 border-white">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Access Restricted</h1>
      <p className="text-slate-500 font-medium max-w-md mb-10">
        You do not have the required administrative clearance to access this sector of the management console.
      </p>
      
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
}
