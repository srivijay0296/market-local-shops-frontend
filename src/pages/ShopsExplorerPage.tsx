import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { sellersApi, Seller } from "@/lib/api/sellers";
import { marketsApi, Market } from "@/lib/api/markets";
import { MapPin, ArrowRight, Search, Store, Star, BadgeCheck, ShieldCheck, Zap, Filter, Compass, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ShopCard({ seller, index }: { seller: Seller; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/seller/${seller.id}`}
        className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 border border-border flex flex-col h-full hover:-translate-y-1"
      >
        {/* Banner */}
        <div className="relative h-32 w-full bg-background overflow-hidden">
          {seller.shop_banner ? (
            <img src={seller.shop_banner} alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Image Overlay */}
        <div className="absolute top-20 left-6 w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg z-10 group-hover:-translate-y-2 transition-transform duration-500">
           <div className="w-full h-full rounded-xl bg-background overflow-hidden flex items-center justify-center">
              {seller.profile_image ? (
                 <img src={seller.profile_image} alt={seller.shop_name} className="w-full h-full object-cover" />
              ) : <Store className="w-8 h-8 text-primary" />}
           </div>
        </div>

        {/* Content */}
        <div className="pt-12 p-6 flex flex-col flex-grow bg-white relative">
           
           <div className="absolute top-4 right-4 flex items-center gap-1 bg-success/10 px-2 py-1 rounded-md">
               <Zap className="w-3 h-3 text-success fill-success" />
               <span className="text-[9px] font-bold text-success uppercase tracking-widest">Verified</span>
           </div>

           <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-black text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{seller.shop_name}</h3>
              <BadgeCheck className="w-5 h-5 text-primary fill-primary/10 shrink-0" />
           </div>
           
           <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-4 flex items-center gap-1">
              <UserIcon className="w-3 h-3" /> {seller.owner_name || "Enterprise Partner"}
           </p>

           <p className="text-sm text-foreground/70 line-clamp-2 mb-6 leading-relaxed flex-grow">
              {seller.description || "Premium quality textiles and wholesale provisions directly from authenticated suppliers."}
           </p>

           <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/60">
                 <MapPin className="w-4 h-4 text-accent" />
                 <span className="truncate max-w-[120px]">{seller.location || "Central Hub"}</span>
              </div>
              <div className="flex items-center gap-1">
                 <Star className="w-4 h-4 text-primary fill-primary" />
                 <span className="text-xs font-bold text-foreground">4.9</span>
              </div>
           </div>
        </div>
      </Link>
    </motion.div>
  );
}

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

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
    <div className="min-h-screen bg-background">
      <Header />
      <AuthModal />
      
      <main className="pb-24">
        
        {/* --- Hero Section --- */}
        <div className="relative bg-dark text-white pt-32 pb-24 overflow-hidden">
           <div className="absolute inset-0 overflow-hidden">
               <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[140%] bg-gradient-to-b from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl opacity-50 transform rotate-12 pointer-events-none" />
           </div>

           <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="max-w-2xl">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-6"
                  >
                    <ShieldCheck className="w-4 h-4 text-success" /> 100% Authenticated Network
                 </motion.div>
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 leading-none"
                  >
                    Global <span className="text-primary">Supply</span> Network
                 </motion.h1>
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/60 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl"
                  >
                    Access premium wholesale markets, verify suppliers in real-time, and provision inventory at enterprise scale.
                 </motion.p>
                 
                 {/* Search Box */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative max-w-xl group"
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all group-hover:bg-primary/30" />
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center shadow-2xl">
                      <Search className="w-6 h-6 text-white/50 ml-4 pointer-events-none" />
                      <input 
                         type="text"
                         placeholder="Query network nodes, suppliers, or locations..."
                         value={search}
                         onChange={e => setSearch(e.target.value)}
                         className="flex-1 bg-transparent text-white placeholder:text-white/40 px-4 py-3 outline-none text-base font-medium"
                      />
                      <button className="btn-primary py-3 px-8 text-sm">Query</button>
                    </div>
                 </motion.div>
              </div>
           </div>
        </div>

        {/* --- Featured Network Nodes --- */}
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
           <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x">
              {sellers.slice(0, 5).map((s, i) => (
                 <motion.div 
                    key={s.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="snap-start"
                 >
                   <Link to={`/seller/${s.id}`} className="min-w-[320px] bg-white rounded-3xl p-6 shadow-xl shadow-dark/5 border border-border flex items-center gap-5 hover:scale-105 transition-transform shrink-0 group">
                      <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shrink-0 border border-border overflow-hidden">
                         {s.profile_image ? (
                            <img src={s.profile_image} className="w-full h-full object-cover" />
                         ) : <Store className="w-8 h-8 text-primary/50" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <h4 className="font-display font-black text-foreground text-base truncate group-hover:text-primary transition-colors">{s.shop_name}</h4>
                         <p className="text-[10px] font-bold text-foreground/50 uppercase flex items-center gap-1 mt-1 tracking-widest">
                            <MapPin className="w-3 h-3 text-accent" /> {s.location || "Core Network"}
                         </p>
                         <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center">
                               {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-primary fill-primary" />)}
                            </div>
                            <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">Elite</span>
                         </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                   </Link>
                 </motion.div>
              ))}
           </div>
        </div>

        {/* --- Explorer Grid --- */}
        <div className="max-w-7xl mx-auto px-4 mt-12">
           <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
              <div>
                 <h2 className="text-3xl font-display font-black text-foreground flex items-center gap-3">
                    <Compass className="w-8 h-8 text-primary" /> Network Explorer
                 </h2>
                 <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest mt-2">Active Nodes: {filtered.length} Providers</p>
              </div>

              {/* Advanced Filter System */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full lg:w-auto">
                 <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-2xl border border-border shadow-sm">
                    <div className="px-3 flex items-center gap-2 border-r border-border">
                       <Filter className="w-4 h-4 text-foreground/40" />
                       <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Region</span>
                    </div>
                    <button 
                       onClick={() => setSelectedMarketId(null)}
                       className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!selectedMarketId ? 'bg-dark text-white shadow-md' : 'bg-transparent text-foreground/60 hover:bg-background'}`}
                    >
                       Global
                    </button>
                    {markets.map(m => (
                       <button 
                          key={m.id}
                          onClick={() => setSelectedMarketId(m.id)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedMarketId === m.id ? 'bg-dark text-white shadow-md' : 'bg-transparent text-foreground/60 hover:bg-background'}`}
                       >
                          {m.name}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                 {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="h-[380px] bg-white rounded-3xl animate-pulse shadow-sm border border-border" />
                 ))}
              </div>
           ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                 <AnimatePresence>
                   {filtered.map((s, i) => (
                      <ShopCard key={s.id} seller={s} index={i} />
                   ))}
                 </AnimatePresence>
              </div>
           ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32 bg-white rounded-3xl border border-dashed border-border shadow-sm"
              >
                 <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store className="w-12 h-12 text-foreground/20" />
                 </div>
                 <h3 className="text-xl font-display font-black text-foreground mb-2">No active nodes found</h3>
                 <p className="text-sm font-medium text-foreground/50">Adjust your query parameters or region filters to discover suppliers.</p>
              </motion.div>
           )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
