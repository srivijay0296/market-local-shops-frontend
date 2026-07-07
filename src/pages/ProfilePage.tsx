import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { User, Mail, Phone, MapPin, Package, Heart, ShieldCheck, LogOut, ChevronRight, Edit2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usersApi } from "@/lib/api/users";

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
     name: "",
     phone: "",
     address: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
       navigate("/");
       return;
    }
    if (user) {
        setProfile({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || ""
        });
    }
  }, [user, authLoading]);

  const handleUpdate = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     try {
        await usersApi.updateUser(user!.id, {
            name: profile.name,
            phone: profile.phone,
            address: profile.address
        });
        toast.success("Profile updated successfully! ✨");
     } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to update profile");
     } finally {
        setLoading(false);
     }
  };

  if (authLoading) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Identity...</p>
      </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      <AuthModal />
      
      <main className="flex-grow pt-32 pb-20 px-4">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-4">
               <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center mb-4 overflow-hidden">
                     <User className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="font-black text-slate-900 italic uppercase tracking-tighter text-xl leading-tight">
                     {profile.name || "Namma Member"}
                  </h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 bg-indigo-50 px-3 py-1 rounded-full">
                      {user.role}
                  </p>
               </div>

               <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  <nav className="flex flex-col">
                     <Link to="/orders" className="flex items-center justify-between p-5 hover:bg-slate-50 transition border-b border-slate-50 group">
                        <div className="flex items-center gap-3">
                           <Package className="w-4 h-4 text-indigo-600" />
                           <span className="text-sm font-black uppercase tracking-tight text-slate-700">My Orders</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                     </Link>
                     <Link to="/cart" className="flex items-center justify-between p-5 hover:bg-slate-50 transition border-b border-slate-50 group">
                        <div className="flex items-center gap-3">
                           <Heart className="w-4 h-4 text-pink-500" />
                           <span className="text-sm font-black uppercase tracking-tight text-slate-700">Wishlist</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                     </Link>
                     {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center justify-between p-5 hover:bg-slate-50 transition border-b border-slate-50 group">
                           <div className="flex items-center gap-3">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-black uppercase tracking-tight text-slate-700">Admin Core</span>
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                     )}
                     <button onClick={logout} className="flex items-center gap-3 p-5 hover:bg-rose-50 text-rose-600 transition">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-black uppercase tracking-tight">Sign Out</span>
                     </button>
                  </nav>
               </div>
            </div>

            {/* Main Content: Account Settings */}
            <div className="md:col-span-3 space-y-8">
               <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-900/5 border border-white">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                     <div>
                        <h2 className="text-3xl font-black text-slate-900 italic uppercase flex items-center gap-3 tracking-tighter leading-none">
                           <Edit2 className="w-8 h-8 text-indigo-600" /> Profile <span className="text-indigo-600">Sync</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Personal Identity Matrix</p>
                     </div>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Legit Name</label>
                           <div className="relative">
                              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input 
                                 type="text" 
                                 value={profile.name} 
                                 onChange={e => setProfile({...profile, name: e.target.value})}
                                 placeholder="Identity Name" 
                                 className="w-full bg-slate-50 border-2 border-slate-50 p-5 pl-14 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition font-black uppercase italic text-sm"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Email Node</label>
                           <div className="relative opacity-60">
                              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input 
                                 disabled
                                 type="email" 
                                 value={user?.email} 
                                 className="w-full bg-slate-100 border-2 border-slate-100 p-5 pl-14 rounded-2xl outline-none font-bold italic"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Phone Link</label>
                           <div className="relative">
                              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input 
                                 type="text" 
                                 value={profile.phone} 
                                 onChange={e => setProfile({...profile, phone: e.target.value})}
                                 placeholder="Mobile Protocol" 
                                 className="w-full bg-slate-50 border-2 border-slate-50 p-5 pl-14 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition font-black italic text-sm"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Deployment Area</label>
                           <div className="relative">
                              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input 
                                 type="text" 
                                 value={profile.address} 
                                 onChange={e => setProfile({...profile, address: e.target.value})}
                                 placeholder="Geo-Location Tag" 
                                 className="w-full bg-slate-50 border-2 border-slate-50 p-5 pl-14 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition font-black italic text-sm"
                              />
                           </div>
                        </div>
                     </div>

                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full md:w-auto px-16 py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition disabled:opacity-50"
                     >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Changes"}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </main>

      <Footer />
    </div>
  );
}
