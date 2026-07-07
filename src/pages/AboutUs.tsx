import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Award, ShieldCheck, Truck, Users, Sprout, ShoppingBag, Store } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Narrative Hero */}
      <div className="relative pt-40 pb-24 overflow-hidden bg-slate-900 text-white">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
         <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase italic leading-none">The Namma <br /> Heritage</h1>
            <p className="text-xl md:text-2xl text-blue-200 font-medium max-w-2xl mx-auto leading-relaxed">
               Revolutionizing the Bargur textile ecosystem through digital craftsmanship and global retail connectivity.
            </p>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-32 space-y-40">
         {/* Mission Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
               <div className="h-1.5 w-24 bg-[#ffe11b]" />
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic italic">Bargur's Pride, <br /> Global Reach</h2>
               <p className="text-slate-600 text-lg font-medium leading-relaxed">
                  Namma Market (Bargur Marketplace) was founded with a singular vision: to empower the thousands of weavers and shop owners across the Bargur valley with a first-class digital infrastructure.
               </p>
               <p className="text-slate-600 font-medium leading-relaxed">
                  We aren't just an e-commerce platform; we are the digital heartbeat of a heritage industry. From the smallest manufacturing units to the largest wholesale hubs, we provide the tools for Bargur’s finest to showcase their mastery to the world.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="aspect-[4/5] bg-blue-50 rounded-[2.5rem] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1528459840556-42d833923461?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
               </div>
               <div className="aspect-[4/5] bg-[#2a4f5f] rounded-[2.5rem] mt-12 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
               </div>
            </div>
         </div>

         {/* Core Values */}
         <div className="bg-slate-50 p-20 rounded-[4rem] border border-slate-100">
            <h3 className="text-center text-4xl font-black text-slate-800 mb-16 uppercase tracking-tighter italic">Namma Market Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#2a4f5f] mx-auto mb-6 shadow-xl group-hover:bg-[#2a4f5f] group-hover:text-white transition-all duration-500"><Award /></div>
                  <h4 className="font-black text-lg uppercase tracking-tight mb-2">Heritage First</h4>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">Preserving the traditional weaving techniques of the Bargur valley while embracing modern retail demands.</p>
               </div>
               <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><ShieldCheck /></div>
                  <h4 className="font-black text-lg uppercase tracking-tight mb-2">Fair Trade</h4>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">Connecting manufacturers directly to consumers, ensuring fair pricing for buyers and maximum revenue for producers.</p>
               </div>
               <div className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500"><Users /></div>
                  <h4 className="font-black text-lg uppercase tracking-tight mb-2">One Community</h4>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">A unified platform for all retailers, from high-street boutiques to local market stalls.</p>
               </div>
            </div>
         </div>

         {/* Call to Action */}
         <div className="text-center bg-[#2a4f5f] p-24 rounded-[5rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-40 -translate-y-40 group-hover:scale-150 transition-transform duration-1000"></div>
            <h2 className="text-5xl font-black mb-8 italic tracking-tighter uppercase relative z-10">Bargur's Future is Digital.</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
               <Link to="/products" className="bg-[#ffe11b] text-slate-900 px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-[#ffe11b]/20 hover:scale-105 transition-all">Start Shopping</Link>
               <Link to="/sellers" className="bg-white/10 backdrop-blur-md text-white px-12 py-5 rounded-[2rem] font-black border border-white/20 uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all">Become a Partner</Link>
            </div>
         </div>
      </main>

      <Footer />
    </div>
  );
}
