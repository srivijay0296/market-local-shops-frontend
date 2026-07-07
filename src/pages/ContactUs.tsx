import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-24 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic italic">Connect with Namma Market</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">Namma Market Official Support Hub</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
               <h2 className="text-2xl font-black text-[#2a4f5f] mb-8 uppercase tracking-tighter italic">Market Headquarters</h2>
               <div className="space-y-6">
                  <div className="flex items-start gap-6">
                     <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2a4f5f] shrink-0"><MapPin /></div>
                     <div>
                        <p className="font-black uppercase text-xs text-slate-400 tracking-widest">Global Base</p>
                        <p className="text-slate-700 font-bold">12/4B Market Road, Bargur Textile Hub, Krishnagiri DT, Tamil Nadu - 635104</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-6">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0"><Phone /></div>
                     <div>
                        <p className="font-black uppercase text-xs text-slate-400 tracking-widest">Support Line</p>
                        <p className="text-slate-700 font-bold">+91 93607 40513 (Mon - Sat, 9AM - 8PM)</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-6">
                     <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0"><Mail /></div>
                     <div>
                        <p className="font-black uppercase text-xs text-slate-400 tracking-widest">Digital Mail</p>
                        <p className="text-slate-700 font-bold">support@btmtextilemarket.com</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#2a4f5f] p-10 rounded-[3rem] text-white shadow-2xl shadow-[#2a4f5f]/20 group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
               <MessageSquare className="w-12 h-12 mb-6" />
               <h3 className="text-2xl font-black tracking-tight italic">Wholesale Inquiries?</h3>
               <p className="text-blue-100 font-medium mt-2 leading-relaxed">For bulk manufacturing orders and B2B vendor partnerships, please visit our Seller Hub or contact our local regional managers directly.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
             <form className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Full Name</label>
                   <input type="text" className="w-full p-6 bg-slate-50 rounded-[2rem] border-transparent focus:bg-white focus:border-[#2a4f5f] transition-all outline-none font-bold text-sm" placeholder="John Doe" />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Email Address</label>
                   <input type="email" className="w-full p-6 bg-slate-50 rounded-[2rem] border-transparent focus:bg-white focus:border-[#2a4f5f] transition-all outline-none font-bold text-sm" placeholder="john@example.com" />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Message Narrative</label>
                   <textarea rows={4} className="w-full p-6 bg-slate-50 rounded-[2rem] border-transparent focus:bg-white focus:border-[#2a4f5f] transition-all outline-none font-bold text-sm" placeholder="How can we assist you today?"></textarea>
                </div>
                <button className="w-full bg-[#2a4f5f] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#2a4f5f]/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3">
                   <Send className="w-5 h-5" /> Dispatch Inquiry
                </button>
             </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
