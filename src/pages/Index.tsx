import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import HomepageSlider from "@/components/HomepageSlider";
import SellerPostCard from "@/components/SellerPostCard";
import { getPosts, getShops, getProducts, getMarkets } from "@/services/api";
import { Store, MapPin, Search, ArrowRight, Zap, ShieldCheck, LayoutGrid, Shirt, Package, Scissors, Truck, Award } from 'lucide-react';

const categories = [
   {
      id: 'textiles',
      name: 'Textiles',
      icon: LayoutGrid,
      img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=300',
      color: 'bg-blue-500',
      tag: 'Wholesale'
   },
   {
      id: 'mens-wear',
      name: 'Mens Wear',
      icon: Shirt,
      img: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=300',
      color: 'bg-indigo-500',
      tag: 'New'
   },
   {
      id: 'ladies-special',
      name: 'Ladies Special',
      icon: Scissors,
      img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=300',
      color: 'bg-rose-500',
      tag: 'Trending'
   },
   {
      id: 'raw-materials',
      name: 'Raw Materials',
      icon: Package,
      img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=300',
      color: 'bg-amber-500',
      tag: 'B2B'
   },
];

export default function Index() {
   const [markets, setMarkets] = useState<any[]>([]);
   const [shops, setShops] = useState<any[]>([]);
   const [globalPosts, setGlobalPosts] = useState<any[]>([]);
   const [recentProducts, setRecentProducts] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadHomeData = async () => {
         try {
            // 🛡️ Safe-Fail Parallel Loading: Ensure one failure doesn't crash the UI
            const [marketsData, productsData, shopsData, postsData] = await Promise.all([
               getMarkets().catch(() => []),
               getProducts({ onlyApproved: true }).catch(() => []),
               getShops({ status: 'approved' }).catch(() => []),
               getPosts(6).catch(() => []), 
            ]);
            setMarkets(marketsData || []);
            setRecentProducts(productsData || []);
            setShops(shopsData || []);
            setGlobalPosts(postsData || []);
         } catch (err) {
            console.error("🌌 Home Portal Sync failure:", err);
         } finally {
            setLoading(false);
         }
      };
      loadHomeData();
   }, []);

   return (
      <div className="min-h-screen bg-[#F1F3F6] font-sans">
         <Header />
         <AuthModal />
         <CartDrawer />

         <main className="pb-10 pt-24 md:pt-32">
            
            {/* 🔥 CATEGORY NAVIGATION */}
            <div className="max-w-7xl mx-auto px-4 mb-10">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {categories.map((c) => (
                     <Link
                        key={c.id}
                        to={`/products?category_id=${c.id}`}
                        className="group relative h-40 md:h-56 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 bg-white border border-slate-50"
                     >
                        <img src={c.img} className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-6 flex flex-col justify-end">
                           <div className={`w-8 h-8 rounded-xl ${c.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:rotate-12 transition-transform`}>
                              <c.icon className="w-5 h-5" />
                           </div>
                           <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tighter italic leading-none">{c.name}</h3>
                           <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">{c.tag} ✦ Explore</span>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>

            {/* 🔥 VALUE PROPOSITION */}
            <div className="max-w-7xl mx-auto px-4 mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
               <BenefitCard icon={<Truck />} title="Namma Express" desc="Local Priority Delivery" color="bg-orange-500" />
               <BenefitCard icon={<ShieldCheck />} title="Verified Shops" desc="Direct Quality Assurance" color="bg-blue-500" />
               <BenefitCard icon={<Award />} title="Master Craft" desc="Handpicked Silk & Sarees" color="bg-purple-500" />
               <BenefitCard icon={<Zap />} title="Flash Deals" desc="Direct Manufacturing Price" color="bg-amber-500" />
            </div>

            {/* 🔥 HERO SECTION */}
            <div className="max-w-7xl mx-auto px-4 mb-20 flex flex-col items-center text-center gap-6 relative overflow-hidden pt-10">
               <h1 className="text-6xl md:text-8xl font-black text-slate-800 tracking-tighter leading-[0.9] italic uppercase">
                  Namma<span className="text-[#2a4f5f]">Market</span>
                  <br />
                  <span className="text-[#2a4f5f] flex items-center gap-4 justify-center text-3xl md:text-5xl mt-4">Smart Hub <Zap className="w-12 h-12 fill-current animate-bounce text-yellow-500" /></span>
               </h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-xl">
                  Authentic Weaver Direct Access ✦ Headquarters :: Bargur Market
               </p>
               <div className="flex gap-4 mt-4">
                  <Link to="/products" className="px-10 py-5 bg-[#2a4f5f] text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-[#2a4f5f]/20 hover:bg-slate-900 transition-all active:scale-95">Browse Inventory</Link>
                  <Link to="/sellers" className="px-10 py-5 bg-white text-slate-800 border border-slate-100 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95">Open Your Shop</Link>
               </div>
            </div>

            {/* 🔥 SLIDER */}
            <div className="max-w-7xl mx-auto px-4 mb-16">
               <HomepageSlider />
            </div>

            {/* 🔥 PRODUCTS */}
            <section className="max-w-7xl mx-auto px-4 mb-8">
               <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Zap /> Trending
               </h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {loading
                     ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-60 bg-gray-200 animate-pulse rounded-2xl" />
                     ))
                     : recentProducts.slice(0, 8).map((p) => (
                        <ProductCard key={p.id} product={p} />
                     ))
                  }
               </div>
            </section>

             {/* 🔥 MARKETS */}
            <section className="max-w-7xl mx-auto px-4 mb-10">
               <h2 className="font-bold mb-4">🏪 Markets ({markets?.length || 0})</h2>
               <div className="grid md:grid-cols-3 gap-6">
                  {Array.isArray(markets) && markets.map((m) => (
                     <Link key={m?.id || Math.random()} to={`/market/${m?.slug}`} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="h-48 overflow-hidden relative">
                           <img src={m?.image_url || "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800"} alt={m?.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                              <h3 className="text-white font-bold text-xl">{m?.name || 'Unnamed Market'}</h3>
                              <p className="text-blue-100 text-xs flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {m?.location || 'Nexus Point'}</p>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            </section>

            {/* 🔥 SELLER FEED */}
            {Array.isArray(globalPosts) && globalPosts.length > 0 && (
               <section className="max-w-7xl mx-auto px-4 mb-10">
                  <h2 className="font-bold mb-4 flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" /> Seller Updates
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {globalPosts.map((post) => (
                        <SellerPostCard
                           key={post?.id || Math.random()}
                           post={{
                              ...post,
                              seller_id: post?.shops?.id,
                              seller_name: post?.shops?.name,
                              seller_location: post?.shops?.location,
                              profile_image: post?.shops?.image_url
                           }}
                        />
                     ))}
                  </div>
               </section>
            )}

         </main>
         <Footer />
      </div>
   );
}

function BenefitCard({ icon, title, desc, color }: any) {
   return (
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all duration-500 group">
         <div className={`p-3 ${color || 'bg-slate-50'} rounded-2xl transition-transform group-hover:scale-110 text-white`}>
            {icon}
         </div>
         <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{desc}</p>
         </div>
      </div>
   );
}