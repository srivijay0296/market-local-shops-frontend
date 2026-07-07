import { useState, useEffect } from "react";
import { shopsApi } from "@/lib/api/shops";
import { toast } from "sonner";
import { Store, Check, X, Search, MapPin, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSellers() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSellers = async () => {
    try {
      setLoading(true);
      // Fetch all shops for admin review
      const data = await shopsApi.getShops({ status: 'all' as any }); 
      setSellers(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await shopsApi.approveShop(id);
      toast.success("Shop approved successfully");
      fetchSellers();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await shopsApi.rejectShop(id);
      toast.error("Shop rejected");
      fetchSellers();
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  const filteredVendors = sellers.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Seller HQ</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Operational</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sellers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 pl-11 pr-5 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Network...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Entity</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Store className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase tracking-tight italic">{v.name || 'Nexus Shop'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{v.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{v.profiles?.name || 'Authorized Seller'}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                           <MapPin className="w-3 h-3" /> {v.location || 'Bargur Central'}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                       {v.is_approved ? (
                         <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50">Verified</span>
                       ) : v.status === 'rejected' ? (
                         <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-50">Terminated</span>
                       ) : (
                         <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-50 animate-pulse">Pending Auth</span>
                       )}
                    </td>
                    <td className="p-6">
                       <div className="flex items-center justify-end gap-3">
                          {!v.is_approved && (
                            <button 
                              onClick={() => handleApprove(v.id)} 
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                            >
                                Authorize
                            </button>
                          )}
                          {v.status !== 'rejected' && (
                            <button 
                              onClick={() => handleReject(v.id)} 
                              className="px-4 py-2 bg-white text-rose-500 border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                            >
                                Deny
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No entities found in current sector.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
