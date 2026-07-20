import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, ArrowLeft, Store, ExternalLink } from "lucide-react";

// 🔥 SWIPER
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useMarketPage } from "@/hooks/useMarketPage";

export default function MarketPage() {
  const {
    slug,
    markets,
    selectedMarket,
    marketShops,
    loading,
    error
  } = useMarketPage();

  // --- MARKET DETAIL VIEW ---
  if (slug) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="p-8 bg-white rounded-2xl border shadow-lg text-center">
            <p className="text-sm font-bold text-slate-700">Loading market details...</p>
          </div>
        </div>
      );
    }

    if (error || !selectedMarket) {
      return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-3">Market not available</h2>
            <p className="text-sm text-slate-500 mb-6">{error || 'The requested market could not be found.'}</p>
            <Link to="/markets" className="px-6 py-3 bg-[#2a4f5f] text-white rounded-xl font-bold">Back to markets</Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header />
        
        {/* Banner */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
           <img 
              src={selectedMarket.image_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200"} 
              className="w-full h-full object-cover"
              alt={selectedMarket.name}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937] via-transparent to-transparent flex flex-col justify-end p-6 md:p-12">
              <div className="max-w-7xl mx-auto w-full">
                 <Link to="/markets" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-bold transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back to Markets
                 </Link>
                 <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">{selectedMarket.name}</h1>
                 <p className="text-blue-100 flex items-center gap-2 font-bold uppercase tracking-widest text-xs md:text-sm">
                    <MapPin className="w-4 h-4" /> {selectedMarket.location}
                 </p>
              </div>
           </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-12">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column: Info */}
              <div className="lg:col-span-1 space-y-8">
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h2 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight italic border-b-4 border-blue-600 w-fit">About Market</h2>
                    <p className="text-slate-600 font-medium leading-relaxed">
                       {selectedMarket.description || "Welcome to one of Bargur's premier textile hubs. Known for traditional craftsmanship and wholesale availability."}
                    </p>
                 </div>

                 <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
                    <h3 className="text-lg font-black mb-2 tracking-tight">Active Shops</h3>
                    <p className="text-4xl font-black">{marketShops.length}</p>
                    <p className="text-blue-100 text-xs mt-2 font-bold uppercase tracking-widest leading-none">Verified Registered Partners</p>
                 </div>
              </div>

              {/* Right Column: Shops List */}
              <div className="lg:col-span-2">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-slate-800">Available Shops</h2>
                    <div className="h-1 w-24 bg-slate-200 rounded-full hidden md:block"></div>
                 </div>

                 {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                 ) : marketShops.length === 0 ? (
                    <div className="bg-white p-16 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                       <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                       <p className="text-slate-500 font-bold">No shops registered in this market yet.</p>
                       <Link to={`/admin/shops/create?market_id=${selectedMarket.id}`} className="text-blue-600 text-sm font-black mt-2 inline-block uppercase tracking-wider">+ Register First Shop</Link>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {marketShops.map(shop => (
                          <Link 
                            key={shop.id} 
                            to={`/seller/${shop.id}`}
                            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between"
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl italic border border-blue-100">
                                   {shop.name[0].toUpperCase()}
                                </div>
                                <div>
                                   <h4 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{shop.name}</h4>
                                   <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase tracking-wide">
                                         {shop.category || 'Textile'}
                                      </span>
                                   </div>
                                </div>
                             </div>
                             <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </Link>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </main>

        <Footer />
      </div>
    );
  }

  // --- ALL MARKETS LIST VIEW ---
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      {/* HERO */}
      <div className="bg-gradient-to-r from-[#172554] to-[#1e3a8a] text-white pt-32 pb-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
           <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic">Explore Markets</h1>
           <p className="text-blue-200 text-lg md:text-xl font-medium tracking-wide">Discover every textile landmark across the Bargur valley</p>
        </div>
      </div>

      {/* SLIDER SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-[-40px] relative z-20 mb-20">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
           <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter italic flex items-center gap-3">
              <span className="w-12 h-[4px] bg-blue-600 rounded-full"></span> Popular Market Hubs
           </h2>

           {loading ? (
             <div className="flex gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-60 w-64 bg-slate-100 animate-pulse rounded-3xl" />)}
             </div>
           ) : (
             <Swiper
               spaceBetween={20}
               slidesPerView={'auto'}
               className="pb-8"
             >
               {markets.map((m) => (
                 <SwiperSlide key={m.id} className="!w-72">
                   <Link to={`/market/${m.slug}`}>
                     <div className="bg-slate-50 group rounded-3xl overflow-hidden border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all p-4 cursor-pointer h-full">
                       <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-4">
                          <img
                            src={m.image_url || `https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800`}
                            alt={m.name}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                            onError={(e: any) => {
                              e.target.src = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800";
                            }}
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-blue-800 uppercase shadow-sm">Hot</div>
                       </div>

                       <h3 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-none truncate">
                         {m.name}
                       </h3>

                       <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-2 uppercase tracking-widest">
                         <MapPin className="w-3 h-3 text-blue-500" />
                         {m.location}
                       </p>
                     </div>
                   </Link>
                 </SwiperSlide>
               ))}
             </Swiper>
           )}
        </div>
      </div>

      {/* GRID VIEW */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-10">
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">All Textile Bazaars</h2>
           <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">{markets.length} Markets Found</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {markets.map((m) => (
            <Link key={m.id} to={`/market/${m.slug}`} className="group bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500">
                <div className="h-64 relative overflow-hidden">
                   <img
                      src={m.image_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800"}
                      alt={m.name}
                      className="w-full h-full object-cover transition duration-1000 group-hover:scale-110"
                      onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800"; }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest w-fit mb-3">
                         <MapPin className="w-3 h-3" /> {m.location}
                      </div>
                      <h3 className="text-white font-black text-3xl tracking-tighter italic uppercase leading-none">{m.name}</h3>
                   </div>
                </div>

                <div className="p-8">
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                    {m.description || "The primary source for Bargur traditional textiles and locally famous retail hubs."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                     <span className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                        Visit BazaarHub 
                        <span className="text-xl">→</span>
                     </span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}