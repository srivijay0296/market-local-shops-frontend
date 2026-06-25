import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { toast } from "sonner";
import { formatPrice } from "@/lib/constants";
import {
  Package, Plus, Trash2, Clock, Store, Settings, 
  Image as ImageIcon, LayoutGrid, BadgeCheck, MapPin, 
  ChevronRight, ToggleLeft, ToggleRight, MessageSquare,
  BarChart3, Users, IndianRupee
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function SellerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'profile' | 'enquiries'>('products');
  
  // Data States
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    description: "", 
    category: "", 
    images: [] as string[],
    show_price: true
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN'))) {
      navigate("/");
      return;
    }
    if (user) loadDashboardData();
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Shop
      let shopData = null;
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*, markets(*)')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (error) throw error;
        shopData = data;
      } catch (e) {
        console.warn("Failed fetching shop with markets, falling back to simple shops select:", e);
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (error) throw error;
        shopData = data;
      }
      setShop(shopData);

      if (shopData) {
        // 2. Fetch Products for this specific shop (Requirement 1 & 6)
        let productsData = [];
        try {
          const { data, error } = await supabase
            .from('products')
            .select(`
              id,
              name,
              price,
              image_url,
              images,
              description,
              is_approved,
              category,
              created_at,
              shops (
                  id,
                  name
              )
            `)
            .eq('shop_id', shopData.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          productsData = data || [];
        } catch (e) {
          console.warn("Failed fetching products with shop join, falling back to simple products select:", e);
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', shopData.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          productsData = data || [];
        }
        setProducts(productsData);

        // 3. Fetch Enquiries for this seller
        const { data: enquiriesData, error: enquiriesError } = await supabase
          .from('enquiries')
          .select('*, profiles(name, email), products(name)')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (enquiriesError) {
          // Fallback query if foreign key aliases fail
          const { data: fallbackEnquiries } = await supabase
            .from('enquiries')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false });
          setEnquiries(fallbackEnquiries || []);
        } else {
          setEnquiries(enquiriesData || []);
        }
      }
    } catch (err: any) {
      console.error('Dashboard Load Error:', err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) {
      toast.error("Active shop profile required to list products");
      return;
    }

    if (!newProduct.name || !newProduct.category) {
      toast.error("Required fields missing: Name and Category.");
      return;
    }

    setSaving(true);
    try {
      const productImages = newProduct.images.length > 0 ? newProduct.images : ["https://placehold.co/600x400.png"];
      const { data, error } = await supabase
        .from('products')
        .insert([{
          seller_id: user.id,
          shop_id: (user as any)?.shop_id || shop.id,
          name: newProduct.name,
          price: parseFloat(newProduct.price) || 0,
          description: newProduct.description,
          category: newProduct.category,
          images: productImages,
          image_url: productImages[0],
          is_approved: false // Requires admin moderation
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success(`${newProduct.name} provisioned successfully! Pending approval.`);
      setNewProduct({ name: "", price: "", description: "", category: "", images: [], show_price: true });
      setShowAddProduct(false);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Product Creation Failure");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product removed from inventory");
    } catch (err: any) {
      toast.error("Deletion failed");
    }
  };

  if (loading || authLoading) return (
     <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
       <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
       <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Seller Node...</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <AuthModal />
      
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 pb-20">
        
        {/* 🏢 HUB HEADER */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 mb-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
               <Store className="w-48 h-48" />
           </div>
           
           <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-200">
             <Store className="w-12 h-12 text-white" />
           </div>
           
           <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                    {shop?.name || "Initializing..."}
                  </h1>
                  <BadgeCheck className="w-6 h-6 text-indigo-500 fill-current" />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center justify-center md:justify-start gap-2">
                 <MapPin className="w-3 h-3"/> {shop?.markets?.name || "Central Nexus"}
              </p>
           </div>

           <div className="flex items-center gap-4 relative z-10 flex-wrap justify-center md:justify-end">
              {false && (
                <div className="bg-purple-50 px-6 py-2 rounded-full border border-purple-100 flex items-center gap-1.5 shadow-sm">
                  <span className="text-purple-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                    ⭐ Free Trial
                  </span>
                  <span className="text-purple-500 font-bold text-[9px] uppercase tracking-wider">
                    ({Math.max(0, Math.ceil((new Date(user.trial_end_date || '').getTime() - Date.now()) / (1000 * 3600 * 24)))} days remaining)
                  </span>
                </div>
              )}
              <div className="bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
                  <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Active Node</span>
              </div>
              <button 
                onClick={() => navigate(`/shop/${shop?.id}`)}
                className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* 📑 NAVIGATION */}
        <div className="flex items-center gap-8 mb-10 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 overflow-x-auto scrollbar-hide ring-1 ring-black/[0.02]">
           {[
             { id: 'products', icon: LayoutGrid, label: "Inventory" },
             { id: 'analytics', icon: BarChart3, label: "Analytics" },
             { id: 'enquiries', icon: MessageSquare, label: "Enquiries" },
             { id: 'profile', icon: Settings, label: "Hub Config" },
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 activeTab === tab.id 
                 ? "bg-slate-900 text-white shadow-2xl scale-105" 
                 : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
               }`}
             >
               <tab.icon className="w-4 h-4" /> {tab.label}
             </button>
           ))}
        </div>

        {/* 🖥️ CONTENT AREA */}
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-2">
           
           {/* --- INVENTORY TAB --- */}
           {activeTab === 'products' && (
             <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                       <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Active Inventory</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage and provision new assets to the marketplace</p>
                   </div>
                   <button 
                     onClick={() => setShowAddProduct(!showAddProduct)} 
                     className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-[1.05] active:scale-[0.98] transition-all flex items-center gap-3"
                   >
                      {showAddProduct ? <Settings className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {showAddProduct ? "CLOSE INTERFACE" : "PROVISION NEW ASSET"}
                   </button>
                </div>

                {showAddProduct && (
                   <form onSubmit={handleCreateProduct} className="bg-white p-10 rounded-[3rem] border border-indigo-100 shadow-[0_20px_50px_rgba(79,70,229,0.1)] animate-in slide-in-from-top-6 space-y-8">
                      <div className="flex items-center gap-4 text-indigo-600">
                          <div className="p-3 bg-indigo-50 rounded-2xl"><Plus className="w-6 h-6" /></div>
                          <h3 className="text-xl font-black uppercase italic tracking-tighter">Product Provisioning Form</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* LEFT: BASICS */}
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Asset Name</label>
                              <input 
                                required value={newProduct.name}
                                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                placeholder="E.G. HAND-WOVEN SILK SAREE" 
                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 font-black text-sm uppercase placeholder:text-slate-300" 
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Price Point (₹)</label>
                                  <div className="relative">
                                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                      <input 
                                        type="number" value={newProduct.price}
                                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                        placeholder="0.00" 
                                        className="w-full bg-slate-50 border border-slate-100 py-5 pl-12 pr-4 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 font-black text-sm" 
                                      />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Category Branch</label>
                                  <select 
                                    value={newProduct.category} required
                                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 font-black text-[11px] uppercase"
                                  >
                                    <option value="">SELECT BRANCH</option>
                                    <option value="Sarees">Sarees / Textiles</option>
                                    <option value="Cotton">Cotton / Fabrics</option>
                                    <option value="Silk">Silk Collections</option>
                                    <option value="Wholesale">Wholesale Bulk</option>
                                  </select>
                               </div>
                           </div>

                           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                               <div>
                                   <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Price Visibility</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">If disabled, show "Enquiry Only"</p>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => setNewProduct({...newProduct, show_price: !newProduct.show_price})}
                                 className="transition-transform active:scale-90"
                               >
                                 {newProduct.show_price ? <ToggleRight className="w-10 h-10 text-indigo-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                               </button>
                           </div>
                        </div>

                        {/* RIGHT: ASSETS */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Visual Assets (Multi-Upload)</label>
                               <ImageUpload 
                                  maxImages={5} 
                                  onUpload={(urls) => setNewProduct(prev => ({ ...prev, images: urls }))} 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Product Intelligence (Desc)</label>
                               <textarea 
                                 value={newProduct.description}
                                 onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                                 placeholder="DESCRIBE THE ASSET QUALITY, WEAVE, AND CRAFTSMANSHIP..."
                                 className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 font-medium text-xs h-32 resize-none" 
                               />
                            </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-95">
                           {saving ? "SYNCING TO NEXUS..." : "COMMENCE LISTING"}
                        </button>
                        <button type="button" onClick={() => setShowAddProduct(false)} className="px-12 py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">
                           CANCEL
                        </button>
                      </div>
                   </form>
                )}

                {/* PRODUCT GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                   {products.map(p => (
                      <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                        <div className="aspect-[4/5] bg-slate-50 flex items-center justify-center relative overflow-hidden">
                          {p.images?.[0] ? (
                              <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          ) : <Package className="w-10 h-10 text-slate-200" />}
                          
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2">
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 active:scale-90 transition-all">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                          </div>

                          {!p.is_approved && (
                              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                                  <div className="text-center">
                                      <Clock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                      <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Pending HQ Approval</span>
                                  </div>
                              </div>
                          )}
                        </div>
                        <div className="p-5 space-y-2">
                           <div className="flex justify-between items-start gap-2">
                               <h4 className="font-black text-slate-800 text-xs uppercase italic tracking-tight line-clamp-2">{p.name}</h4>
                               <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">{p.category}</span>
                           </div>
                           <div className="flex items-center justify-between pt-2">
                               <span className="text-indigo-600 font-black text-sm italic">{p.show_price ? `₹${p.price}` : 'ENQUIRY ONLY'}</span>
                           </div>
                        </div>
                      </div>
                   ))}
                </div>

                {products.length === 0 && !showAddProduct && (
                    <div className="py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <Package className="w-10 h-10 text-indigo-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic">Your Inventory is Empty</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs">Start provisioning products to reach thousands of potential buyers.</p>
                        <button 
                            onClick={() => setShowAddProduct(true)}
                            className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
                        >
                            Spawn First Asset
                        </button>
                    </div>
                )}
             </div>
           )}

           {/* --- ENQUIRIES TAB --- */}
           {activeTab === 'enquiries' && (
               <div className="space-y-6">
                   <div className="flex items-center justify-between">
                       <div>
                           <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Buyer Pulse (Enquiries)</h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time interest from the marketplace network</p>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {enquiries.map(enq => (
                           <div key={enq.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col gap-4 group">
                               <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                       <Users className="w-5 h-5 text-indigo-600" />
                                   </div>
                                   <div>
                                       <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{enq.profiles?.name || 'Anonymous Buyer'}</p>
                                       <p className="text-[9px] text-indigo-400 font-bold">{enq.profiles?.email}</p>
                                   </div>
                               </div>
                               <div className="space-y-2">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regarding Asset:</p>
                                   <p className="text-xs font-black text-slate-800 italic uppercase underline decoration-indigo-200 underline-offset-4">{enq.products?.name}</p>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-2xl">
                                   <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">"{enq.message}"</p>
                               </div>
                               <div className="flex justify-between items-center mt-2">
                                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{new Date(enq.created_at).toLocaleDateString()}</span>
                                   <a 
                                      href={`mailto:${enq.profiles?.email}`}
                                      className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                    >
                                      Respond Now
                                    </a>
                               </div>
                           </div>
                       ))}
                       {enquiries.length === 0 && (
                           <div className="col-span-full py-24 text-center">
                               <MessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                               <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No buyer pulses detected yet.</p>
                           </div>
                       )}
                   </div>
               </div>
           )}

           {/* ANALYTICS (MOCK) */}
           {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                        <BarChart3 className="w-8 h-8 text-indigo-400 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Impressions</p>
                        <h4 className="text-5xl font-black italic tracking-tighter">1,240</h4>
                        <div className="mt-8 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[65%]"></div>
                            </div>
                            <span className="text-[10px] font-black text-indigo-400">+12%</span>
                        </div>
                    </div>
                    <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl">
                        <MessageSquare className="w-8 h-8 text-white/50 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Buyer Interests</p>
                        <h4 className="text-5xl font-black italic tracking-tighter">{enquiries.length}</h4>
                        <p className="text-[10px] mt-4 font-bold opacity-60 uppercase">Direct connection requests</p>
                    </div>
                </div>
           )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
