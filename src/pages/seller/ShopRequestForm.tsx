import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { backendApi } from '@/lib/api/client';
import { Store, Phone, Mail, FileText, CheckCircle, Store as StoreIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShopRequestForm() {
  const { user, isAuthenticated, loginWithOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  
  // OTP State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Form State
  const [markets, setMarkets] = useState<{ id: string | number, name: string }[]>([]);
  const [formData, setFormData] = useState({
    shop_name: "",
    phone: "",
    market_id: "",
    aadhaar_id: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            phone: user.phone || prev.phone,
            aadhaar_id: user.aadhaarId || prev.aadhaar_id
        }));
    }
  }, [user]);

  useEffect(() => {
    const fetchMarketsFromAPI = async () => {
      try {
        setLoading(true);
        const { data } = await backendApi.get('/markets');
        setMarkets(data || []);
      } catch (err: any) {
        console.error("Database fetch failed:", err.message);
        toast.error("Could not load markets.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketsFromAPI();
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter email");
    setAuthLoading(true);
    try {
      await loginWithOTP(email);
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter OTP");
    setAuthLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success("Verified successfully!");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return toast.error("Please verify your identity first");
    
    setLoading(true);
    try {
      if (!formData.shop_name.trim() || !formData.phone.trim() || !formData.market_id || !formData.aadhaar_id.trim()) {
        throw new Error("Please fill all required fields");
      }

      if (!(/^\d+$/i.test(String(user.id)) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(user.id)))) {
        throw new Error("Invalid identity session (User ID format invalid).");
      }
      if (!(/^\d+$/i.test(String(formData.market_id)) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(formData.market_id)))) {
        throw new Error("Please select a valid Market Hub.");
      }

      const insertPayload = {
        user_id: user.id,
        email: user.email,
        shop_name: formData.shop_name,
        phone: formData.phone,
        aadhaar_id: formData.aadhaar_id,
        market_id: formData.market_id,
        description: formData.description,
        status: "pending",
      };
      
      console.log("SHOP REQUEST PAYLOAD", insertPayload);
      await backendApi.post('/shop_requests', insertPayload);
      
      setSubmitted(true);
      toast.success("Shop request submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          <div className="bg-[#2a4f5f] p-10 text-center text-white relative">
            <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20 shadow-2xl">
              <StoreIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Sell on NammaMart</h1>
            <p className="text-blue-100/80 font-bold text-[10px] uppercase tracking-[0.3em]">Premium Vendor Infrastructure</p>
          </div>

          <div className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
                <p className="text-slate-500 mb-8">Your shop request is now pending admin approval.</p>
                <button onClick={() => navigate('/')} className="px-10 py-4 bg-[#2a4f5f] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest">Return to Central</button>
              </div>
            ) : !isAuthenticated ? (
              <div>
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <p className="text-sm font-semibold">Verify identity to submit request</p>
                </div>
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                     <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-transparent focus:border-indigo-500 border" placeholder="email@example.com" />
                     <button type="submit" disabled={authLoading} className="w-full py-5 bg-[#2a4f5f] text-white font-black uppercase text-xs tracking-widest rounded-2xl">Authorize Identity</button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none text-center text-lg tracking-widest font-mono" placeholder="••••••" />
                    <button type="submit" disabled={authLoading} className="w-full py-5 bg-[#2a4f5f] text-white font-black uppercase text-xs tracking-widest rounded-2xl">Confirm OTP</button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="p-4 bg-green-50 text-green-800 rounded-xl mb-4 border border-green-100 flex items-center gap-2">
                   <CheckCircle className="w-4 h-4" />
                   <p className="text-xs font-bold uppercase tracking-tight">Verified as {user.email}</p>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 text-left">Shop Identity</label>
                   <input type="text" required value={formData.shop_name} onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-transparent focus:border-indigo-500 border" placeholder="Proposed Shop Name" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Contact</label>
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-transparent focus:border-indigo-500 border" placeholder="Phone Number" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Identity Node (Aadhaar)</label>
                      <input type="text" required value={formData.aadhaar_id} onChange={(e) => setFormData({ ...formData, aadhaar_id: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-transparent focus:border-indigo-500 border" placeholder="Aadhaar ID Proof" />
                    </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Target Market</label>
                   <select required value={formData.market_id} onChange={(e) => setFormData({ ...formData, market_id: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-transparent focus:border-indigo-500 border appearance-none font-bold text-sm">
                     <option value="">Select Market Hub</option>
                     {markets.map(m => (
                       <option key={m.id} value={m.id}>{m.name}</option>
                     ))}
                   </select>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Business Logic (Description)</label>
                   <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-transparent focus:border-indigo-500 border" placeholder="Tell us about your business..." />
                 </div>

                 <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl hover:bg-[#2a4f5f] transition-all">
                   {loading ? "TRANSMITTING..." : "INITIALIZE VENDOR REQUEST"}
                 </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
