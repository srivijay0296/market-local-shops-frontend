import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { sellersApi, Seller } from "@/lib/api/sellers";
import { marketsApi, Market } from "@/lib/api/markets";
import { MapPin, ArrowRight, Search, Store, Star, BadgeCheck, ShieldCheck, Zap, Filter } from "lucide-react";

// --- Shop Card ---
// ... (ShopCard component remains the same)
function ShopCard({ seller, index }: { seller: Seller; index: number }) {
  return (
    <Link
      to={`/seller/${seller.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Banner */}
      <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
        {seller.shop_banner ? (
          <img src={seller.shop_banner} alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        )}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Profile Image Overlay */}
      <div className="absolute top-12 left-4 w-16 h-16 rounded-2xl bg-white p-1 shadow-md z-10">
         <div className="w-full h-full rounded-xl bg-slate-50 overflow-hidden border border-gray-100 flex items-center justify-center">
            {seller.profile_image ? (
               <img src={seller.profile_image} alt={seller.shop_name} className="w-full h-full object-cover" />
            ) : <Store className="w-6 h-6 text-blue-600" />}
         </div>
      </div>

      {/* Content */}
      <div className="pt-10 p-5 flex flex-col flex-grow">
         <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-black text-slate-800 text-base group-hover:text-[#2874f0] transition-colors">{seller.shop_name}</h3>
            <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />
         </div>
         
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <UserIcon className="w-3 h-3" /> {seller.owner_name || "Verified Seller"}
         </p>

         <p className="text-xs text-slate-500 line-clamp-2 mb-4 italic leading-relaxed">
            {seller.description || "Premium quality textiles and wholesale sarees directly from Bargur weavers."}
         </p>

         <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
               <MapPin className="w-3 h-3 text-orange-500" />
               <span className="truncate max-w-[100px]">{seller.location || "Bargur"}</span>
            </div>
            <div className="px-2 py-1 bg-green-50 rounded-lg flex items-center gap-1 text-[9px] font-black text-green-700 uppercase">
               <Zap className="w-3 h-3 fill-current" /> Top Rated
            </div>
         </div>
      </div>
    </Link>
  );
}

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

// --- Main Page ---
export default function ShopsExplorerPage() {
  const [searchParams] = useSearchParams();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(searchParams.get('marketId'));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, mData] = await Promise.all([
         sellersApi.getAllSellers(),
         marketsApi.getMarkets()
      ]);
      setSellers(sData || []);
      setMarkets(mData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sellers.filter(s => {
    const matchesSearch = s.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
                         s.location?.toLowerCase().includes(search.toLowerCase());
    const matchesMarket = !selectedMarketId || s.market_id === selectedMarketId;
    return matchesSearch && matchesMarket;
  });

  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      <Header />
      <AuthModal />
      
      <main className="pb-24">
        
        {/* --- Hero Section --- */}
        <div className="relative bg-[#2874f0] text-white pt-24 pb-20 overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="max-w-2xl">
                 <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 text-[10px] font-black uppercase tracking-widest mb-6">
                    <ShieldCheck className="w-4 h-4 text-[#ffe11b]" /> 100% Verified Sellers
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black italic tracking-tight mb-6 leading-tight">
                    Discover Our <br/> <span className="text-[#ffe11b]">Wholesale</span> Hubs
                 </h1>
                 <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed mb-8 opacity-90">
                    Connect directly with the finest weavers and shop owners from the famous Namma Market. Premium quality, wholesale rates, and verified trust.
                 </p>
                 
                 {/* Search Bar */}
                 <div className="relative max-w-lg shadow-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input 
                       type="text"
                       placeholder="Find a shop or market branch..."
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                       className="w-full bg-white text-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none text-sm font-bold shadow-xl shadow-blue-900/40"
                    />
                 </div>
              </div>
           </div>

           {/* Decorative Elements */}
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-white/5 rounded-full pointer-events-none" />
           <div className="absolute bottom-0 right-0 w-1/3 h-full overflow-hidden opacity-20 pointer-events-none hidden lg:block">
              <Store className="w-96 h-96 absolute -bottom-10 -right-10 text-white" />
           </div>
        </div>

        {/* --- Featured Slider (Horizontal Scroll) --- */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
           <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide">
              {sellers.slice(0, 5).map((s) => (
                 <Link key={s.id} to={`/seller/${s.id}`} className="min-w-[280px] md:min-w-[340px] bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-4 hover:scale-105 transition-transform shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                       {s.profile_image ? (
                          <img src={s.profile_image} className="w-full h-full object-cover" />
                       ) : <Store className="w-8 h-8 text-blue-600" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <h4 className="font-black text-slate-800 text-sm truncate">{s.shop_name}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-500" /> {s.location || "Bargur"}
                       </p>
                       <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                             {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-[#ffe11b] fill-current" />)}
                          </div>
                          <span className="text-[9px] font-black text-blue-600 uppercase">Popular</span>
                       </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                 </Link>
              ))}
           </div>
        </div>

        {/* --- Shop Grid --- */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
              <div>
                 <h2 className="text-2xl font-black text-slate-800 italic">Explore <span className="text-[#2874f0]">Shops</span></h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Found {filtered.length} matching sellers</p>
              </div>

              {/* Market Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                 <div className="flex items-center gap-2 shrink-0 pr-4">
                    <Filter className="w-4 h-4 text-slate-300 mr-1" />
                    <button 
                       onClick={() => setSelectedMarketId(null)}
                       className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${!selectedMarketId ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                    >
                       All
                    </button>
                    {markets.map(m => (
                       <button 
                          key={m.id}
                          onClick={() => setSelectedMarketId(m.id)}
                          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${selectedMarketId === m.id ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                       >
                          {m.name}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="h-64 bg-white rounded-2xl animate-pulse shadow-sm" />
                 ))}
              </div>
           ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                 {filtered.map((s, i) => (
                    <ShopCard key={s.id} seller={s} index={i} />
                 ))}
              </div>
           ) : (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                 <Store className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                 <h3 className="text-lg font-black text-slate-400 italic">No shops found matching your search.</h3>
              </div>
           )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
