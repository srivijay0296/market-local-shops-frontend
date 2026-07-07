import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api/client";
import { toast } from "sonner";
import { UserPlus, ArrowLeft, Mail, Lock, User, Shield } from "lucide-react";

export default function AdminUsersCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🛡️ High-Privilege Provisioning Link
      const response = await api.post('/admin/users/create', form);
      const resData = response.data;
      if (response.status >= 400) throw new Error(resData.error || 'Provisioning sequence failed.');

      toast.success(`Identity Node ${form.name} Synced Successfully!`);
      navigate("/admin/users");
    } catch (err) {
      toast.error(`Provisioning Protocol Breached: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <button 
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-8 font-black uppercase text-[10px] tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Registry
      </button>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Create User</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Provision new account to Nexus</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Full Name"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="email" required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="user@nexus.com"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Credential</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="password" required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permissions Tier</label>
            <div className="grid grid-cols-3 gap-3">
              {['BUYER', 'SELLER', 'ADMIN'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({...form, role})}
                  className={`py-3 rounded-xl border-2 text-[10px] font-black tracking-widest transition-all ${
                    form.role === role 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? "PROVISIONING..." : <><Shield className="w-4 h-4" /> COMMENCE CREATION</>}
          </button>
        </form>
      </div>
    </div>
  );
}
