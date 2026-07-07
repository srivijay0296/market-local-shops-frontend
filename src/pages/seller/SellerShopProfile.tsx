import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { marketsApi, Market } from "@/lib/api/markets";
import { shopsApi } from "@/lib/api/shops";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { Store, MapPin, Phone, User, ShieldCheck, ChevronRight, Hash, Info } from "lucide-react";
import { toast } from "sonner";

export default function SellerShopProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "", // Just for UI, might use profiles for this
    phone: user?.phone || "",
    address: "",
    description: "",
    market_id: "",
    image_url: ""
  });

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    
    const initData = async () => {
      try {
        const marketData = await marketsApi.getMarkets();
        setMarkets(marketData);
        if (marketData.length > 0) {
           setFormData(prev => ({ ...prev, market_id: marketData[0].id }));
        }

        // Check if user already has a shop
        const shops = await shopsApi.getShops({ approved: 'all' });
        const myShop = shops.find((s: any) => s.owner_id === user.id);
        
        if (myShop) {
          toast.info("You already have a shop registered.");
          navigate("/seller");
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.name || !formData.market_id || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        market_id: formData.market_id,
        image_url: formData.image_url
      };

      await shopsApi.createShop(payload);

      toast.success("Registration successful! Your shop is pending approval. 🚀");
      navigate("/seller");
    } catch(err: any) {
      console.error("Registration Error:", err);
      toast.error(err.response?.data?.error || "Failed to register shop");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    const url = urls[0];
    if (url) {
      setFormData(prev => ({ ...prev, image_url: url }));
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
           
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#2874f0] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tight mb-4">Start Selling on <br/>Namma Market</h2>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed opacity-90">
                       Reach more customers and grow your business with our digital platform.
                    </p>
                    
                    <div className="mt-8 space-y-4">
                       <div className="flex items-center gap-3 text-xs font-bold">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">1</div>
                          Setup Shop Profile
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">2</div>
                          Admin Verification
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">3</div>
                          Start Selling!
                       </div>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-800 text-sm">Trusted Platform</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure and Verified Shops</p>
                 </div>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-white space-y-6">
              
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <Store className="w-3 h-3 text-[#2874f0]" /> Shop Main Image
                 </label>
                 <ImageUpload 
                   onUpload={handleImageUpload} 
                   maxFiles={1} 
                   bucket="shop-images"
                 />
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#2874f0]" /> Market Location *
                 </label>
                 <select 
                    required
                    value={formData.market_id} 
                    onChange={e => setFormData({...formData, market_id: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-[#2874f0] focus:bg-white outline-none transition font-bold text-slate-800 appearance-none"
                 >
                    <option value="" disabled>Select a Market</option>
                    {markets.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                 </select>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                    <Store className="w-3 h-3 text-[#2874f0]" /> Shop Name *
                 </label>
                 <input
                    required
                    placeholder="Enter your shop name"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-[#2874f0] focus:bg-white outline-none transition font-semibold"
                    value={formData.name}
                    onChange={(e)=>setFormData({...formData, name: e.target.value})}
                 />
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#2874f0]" /> Contact Phone *
                 </label>
                 <input
                    required
                    placeholder="Business phone number"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-[#2874f0] focus:bg-white outline-none transition font-semibold"
                    value={formData.phone}
                    onChange={(e)=>setFormData({...formData, phone: e.target.value})}
                 />
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-[#2874f0]" /> Shop Description
                 </label>
                 <textarea
                    placeholder="Tell us about your products..."
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl h-24 focus:border-[#2874f0] focus:bg-white outline-none transition resize-none font-medium"
                    value={formData.description}
                    onChange={(e)=>setFormData({...formData, description: e.target.value})}
                 />
              </div>

              <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-[#fb641b] text-white font-black uppercase tracking-widest px-8 py-5 rounded-[1.5rem] shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                 {loading ? "Registering..." : "Register My Shop"}
                 <ChevronRight className="w-5 h-5" />
              </button>
           </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
