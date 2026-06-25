import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { usersApi } from "@/lib/api/users";
import { toast } from "sonner";
import { UserPlus, ArrowLeft, Store, Hash, Home, Phone as PhoneIcon } from "lucide-react";

export default function CreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailLimitHit, setEmailLimitHit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER",
    phone: "",
    // Seller KYC fields
    shop_name: "",
    aadhaar_number: "",
    address: "",
  });

  const getErrorMessage = (err: any): string => {
    const msg = err?.message?.toLowerCase() || "";
    if (msg.includes("email rate limit") || msg.includes("rate limit") || msg.includes("too many") || msg.includes("over_email_send_rate_limit")) {
      setEmailLimitHit(true);
      return "📧 Email limit exceeded. Disable email confirmation in Supabase → Auth → Settings.";
    }
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return "This email is already registered.";
    }
    if (msg.includes("password")) {
      return "Password must be at least 6 characters.";
    }
    return err?.message || "Unknown error occurred";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailLimitHit(false);

    // Validate seller fields
    if (form.role === 'SELLER') {
      if (!form.shop_name || !form.aadhaar_number || !form.address || !form.phone) {
        toast.error("All KYC fields are required for seller accounts.");
        setLoading(false);
        return;
      }
      if (form.aadhaar_number.length !== 12) {
        toast.error("Aadhaar number must be 12 digits.");
        setLoading(false);
        return;
      }
    }

    try {
      // Call secure backend admin endpoint
      await usersApi.createUser({
        email: form.email,
        password: form.password,
        role: form.role,
        name: form.name,
        phone: form.phone,
        shop_name: form.shop_name,
        aadhaar_number: form.aadhaar_number,
        address: form.address,
      });

      toast.success(`✅ ${form.role} account "${form.name}" created successfully!`);
      navigate("/admin/users", { replace: true });
    } catch (err: any) {
      const friendlyMsg = getErrorMessage(err.response?.data?.error ? { message: err.response.data.error } : err);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const isSeller = form.role === 'SELLER';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {emailLimitHit && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <p className="font-black text-amber-800 text-sm mb-2">⚠️ Supabase Email Limit Reached</p>
          <p className="text-amber-700 text-xs font-medium leading-relaxed">
            Free tier allows 2 signup emails/hour.<br/>
            <strong>Supabase → Authentication → Settings → Email Auth → Disable "Confirm email"</strong>
          </p>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 bg-amber-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-amber-600 transition">
            Open Supabase Dashboard →
          </a>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Create User Account</h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1">Only admins can create seller accounts</p>
          </div>
        </div>

        <div className="mb-6 bg-blue-50 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-700 font-bold">💡 Tip: Disable <span className="underline">"Confirm email"</span> in Supabase Auth Settings to avoid email limits.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 ml-1">Account Role</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'BUYER', label: 'Buyer', emoji: '🛍️' },
                { value: 'SELLER', label: 'Seller', emoji: '🏪' },
                { value: 'ADMIN', label: 'Admin', emoji: '⚙️' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({...form, role: r.value})}
                  className={`py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                    form.role === r.value
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200'
                  }`}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 ml-1">Full Name</label>
              <input 
                required autoComplete="name"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Full Name"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 ml-1">Phone Number</label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required autoComplete="tel"
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="+91 9876543210"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 ml-1">Email Address</label>
            <input 
              type="email" required autoComplete="email"
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              placeholder="user@example.com"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 ml-1">Password (min 6 characters)</label>
            <input 
              type="password" required autoComplete="new-password"
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold" 
            />
          </div>

          {/* SELLER KYC FIELDS */}
          {isSeller && (
            <div className="border-2 border-indigo-100 bg-indigo-50/30 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
              <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest text-center">
                🔒 KYC Verification — Required for Seller
              </p>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 ml-1">Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required={isSeller}
                    value={form.shop_name} 
                    onChange={e => setForm({...form, shop_name: e.target.value})} 
                    placeholder="Shop Name"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-semibold" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 ml-1">Aadhaar Number (12 digits)</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required={isSeller}
                    maxLength={12}
                    pattern="\d{12}"
                    value={form.aadhaar_number} 
                    onChange={e => setForm({...form, aadhaar_number: e.target.value.replace(/\D/g, '')})} 
                    placeholder="XXXXXXXXXXXX"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold tracking-[0.3em]" 
                  />
                </div>
                <p className="text-[9px] text-slate-400 ml-1">{form.aadhaar_number.length}/12 digits</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 ml-1">Shop Address</label>
                <div className="relative">
                  <Home className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    required={isSeller}
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                    placeholder="Full shop address..."
                    rows={2}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-semibold resize-none" 
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-3">
                <p className="text-[10px] text-green-700 font-bold">
                  ✅ Admin-created seller accounts are automatically approved and can log in immediately.
                </p>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-600 transition flex items-center justify-center gap-3 uppercase text-sm tracking-widest mt-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : <><UserPlus className="w-5 h-5" /> Create {form.role} Account</>}
          </button>
        </form>
      </div>
    </div>
  );
}
