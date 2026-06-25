import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import {
   MapPin,
   Phone,
   Store,
   ShieldCheck,
   ChevronRight,
   Package,
   Info,
   Grid,
   Tag,
   MessageSquare
} from "lucide-react";

export default function SellerProfilePage() {
   const { id } = useParams();

   const [seller, setSeller] = useState<any>(null);
   const [posts, setPosts] = useState<any[]>([]);
   const [products, setProducts] = useState<any[]>([]);
   const [activeTab, setActiveTab] = useState("products");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (id) loadData();
   }, [id]);

   const loadData = async () => {
      if (!id || id === 'undefined') {
         setLoading(false);
         return;
      }
      setLoading(true);

      try {
         // 🔥 Fetch Shop Details
         const { data: sellerData, error: sErr } = await supabase
            .from("shops")
            .select("*, market:markets(name)")
            .eq("id", id)
            .maybeSingle();

         if (sErr) throw sErr;
         setSeller(sellerData);

         if (sellerData) {
             // 🔥 Fetch Products
             const { data: productData, error: pErr } = await supabase
                .from("products")
                .select("*")
                .eq("shop_id", id)
                .order("created_at", { ascending: false });

             if (pErr) console.warn("Failed to load products for shop");
             setProducts(productData || []);

             // 🔥 Fetch Feed Posts
             const { data: postData } = await supabase
                .from("seller_posts")
                .select("*")
                .eq("shop_id", id)
                .order("created_at", { ascending: false });

             setPosts(postData || []);
         }
      } catch (err) {
         console.error("Profile Load Error:", err);
      }

      setLoading(false);
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#2a4f5f] border-t-transparent rounded-full animate-spin" />
         </div>
      );
   }

   if (!seller) {
      return (
         <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-4xl font-black text-slate-800 uppercase italic mb-4">Shop Not Registered</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">The requested digital hub does not exist in our registry.</p>
            <Link to="/shops" className="bg-[#2a4f5f] text-white px-10 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Return to Hub Explorer</Link>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#F1F3F6] font-sans">
         <Header />
         <AuthModal />
         <CartDrawer />

         <main className="pb-24 pt-20">
            {/* 🔥 PREMIUM BRAND BANNER */}
            <div className="relative h-[40vh] md:h-[45vh] w-full overflow-hidden">
               <img 
                  src={seller.image_url || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200"} 
                  className="w-full h-full object-cover"
                  alt={seller.name}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#2a4f5f] via-slate-900/40 to-transparent"></div>
               
               <div className="absolute bottom-0 left-0 w-full p-8 md:p-14">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
                     <div className="flex items-center gap-8">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] p-2 shadow-2xl flex items-center justify-center shrink-0 border-4 border-white/20 rotate-3 transition-transform hover:rotate-0">
                           <div className="w-full h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl font-black text-[#2a4f5f] border border-slate-100 overflow-hidden">
                              {seller.name[0].toUpperCase()}
                           </div>
                        </div>
                        <div className="space-y-3">
                           <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">{seller.name}</h1>
                           <div className="flex flex-wrap items-center gap-4">
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                                 <MapPin className="w-3 h-3 text-[#ffe11b]" /> {seller.location || "Bargur Local"}
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                                 <ShieldCheck className="w-3 h-3 text-emerald-400" /> BTM Verified Vendor
                              </span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="hidden md:flex flex-col items-end text-right">
                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.4em] mb-1">Corporate Identity</p>
                        <p className="text-white font-black text-sm uppercase italic">HUB: {seller.market?.name || "Main Market"}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* 🔥 INTERACTIVE HUB TABS */}
            <div className="sticky top-20 z-40 bg-white border-b border-slate-100 shadow-sm">
               <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                  <div className="flex">
                     <button 
                        onClick={() => setActiveTab("products")}
                        className={`flex items-center gap-3 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'products' ? 'text-[#2a4f5f]' : 'text-slate-400 opacity-60 hover:opacity-100'}`}
                     >
                        <Tag className="w-4 h-4" /> Boutique Inventory
                        {activeTab === 'products' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2a4f5f]" />}
                     </button>
                     <button 
                        onClick={() => setActiveTab("posts")}
                        className={`flex items-center gap-3 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'posts' ? 'text-[#2a4f5f]' : 'text-slate-400 opacity-60 hover:opacity-100'}`}
                     >
                        <MessageSquare className="w-4 h-4" /> Live Market Feed
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2a4f5f]" />}
                     </button>
                  </div>
                  
                  <div className="hidden lg:flex items-center gap-6">
                     <div className="h-10 w-[1px] bg-slate-100"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#2a4f5f] flex items-center gap-2">
                        <Package className="w-4 h-4" /> {products.length} Items Listed
                     </span>
                  </div>
               </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-14">
               {activeTab === 'products' ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {products.length > 0 ? products.map((product) => (
                        <ProductCard key={product.id} product={{ ...product, shops: seller }} />
                     )) : (
                        <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[4rem] bg-white/40 flex flex-col items-center justify-center gap-6">
                           <Package className="w-16 h-16 text-slate-200" />
                           <div>
                               <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Inventory Syncing in Progress</h3>
                               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">New arrivals are currently being digitized by the vendor.</p>
                           </div>
                           <Link to="/products" className="mt-4 px-8 py-3 bg-[#2a4f5f] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-900 transition-all">Explore Central Market</Link>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {posts.length > 0 ? posts.map((post) => (
                        <div key={post.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group">
                           <div className="h-80 relative overflow-hidden rounded-3xl mb-6">
                              <img src={post.media_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#2a4f5f] shadow-xl">Latest Update</div>
                           </div>
                           <p className="text-slate-600 font-medium leading-relaxed italic">"{post.content}"</p>
                        </div>
                     )) : (
                        <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[4rem] bg-white/40 flex flex-col items-center justify-center gap-6">
                           <MessageSquare className="w-16 h-16 text-slate-200" />
                           <div>
                               <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Communication Feed Quiet</h3>
                               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">The vendor has not published any live broadcasts today.</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </main>

         <Footer />
      </div>
   );
}