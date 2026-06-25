import { useState } from "react";
import { toast } from "sonner";
import { X, Mail, Lock, User, Plus, Loader2, UserPlus, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    aadhaarId: "",
    role: "buyer" as "buyer" | "seller"
  });

  if (!showAuthModal) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const loggedUser = await login(formData.email, formData.password);
        
        if (!loggedUser) {
          toast.error("Auth Failed: Check email and password.");
          setLoading(false);
          return;
        }

        toast.success("Identity Verified.");

        // 🚀 ADMIN REDIRECT LOGIC
        if (loggedUser.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        const newUser = await signup({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        if (newUser) {
          toast.success("Identity Created.");
          if (newUser.role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      }
      setShowAuthModal(false);
    } catch (err: any) {
      toast.error(err.message || "Security Drift Detected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white p-10 md:p-14 animate-in zoom-in-95 duration-700 overflow-hidden">

        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full translate-x-40 -translate-y-40 blur-[100px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full -translate-x-32 translate-y-32 blur-[100px] opacity-40"></div>

        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-900 hover:text-white transition-all ring-1 ring-slate-100 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-12 relative">
          <div className="flex justify-center mb-8">
            <div className="bg-slate-900 p-5 rounded-[2.5rem] shadow-2xl shadow-indigo-200 transform -rotate-3 hover:rotate-0 transition-transform">
              {authMode === 'login' ? <Shield className="w-12 h-12 text-indigo-400" /> : <UserPlus className="w-12 h-12 text-indigo-400" />}
            </div>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            namma market
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">Advanced Command Authorization</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-7 relative">
          {authMode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Identity Name</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-15 pr-7 py-6 bg-slate-50 border-transparent rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black"
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div className="flex gap-4 p-1 bg-slate-50 rounded-[2rem] border border-slate-100">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'buyer' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400'}`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'seller' })}
                className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'seller' ? 'bg-white shadow-xl text-amber-600' : 'text-slate-400'}`}
              >
                Seller
              </button>
            </div>
          )}

          {authMode === 'signup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Contact Signal (Phone)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">📞</span>
                  <input
                    type="tel"
                    placeholder="91XXXXXXXX"
                    required={authMode === 'signup'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-15 pr-7 py-6 bg-slate-50 border-transparent rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Government Node (Aadhaar)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">🆔</span>
                  <input
                    type="text"
                    placeholder="12-digit UID"
                    required={authMode === 'signup'}
                    value={formData.aadhaarId}
                    onChange={(e) => setFormData({ ...formData, aadhaarId: e.target.value })}
                    className="w-full pl-15 pr-7 py-6 bg-slate-50 border-transparent rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Digital Mail</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="email"
                placeholder="email@example.com"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-15 pr-7 py-6 bg-slate-50 border-transparent rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Encrypted Cipher</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="password"
                placeholder="••••••••"
                required
                autoComplete={authMode === 'login' ? "current-password" : "new-password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-15 pr-7 py-6 bg-slate-50 border-transparent rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (authMode === 'login' ? "VERIFY ACCESS" : "GENERATE IDENTITY")}
          </button>
        </form>

        <div className="mt-12 text-center pb-4">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all"
          >
            {authMode === 'login' ? "Identity Required? Create Portal Access" : "Identity Verified? Login to Command Center"}
          </button>
        </div>

      </div>
    </div>
  );
}
