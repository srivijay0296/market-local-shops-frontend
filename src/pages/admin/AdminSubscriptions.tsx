import { useState, useEffect } from "react";
import { backendApi } from '@/lib/api/client';
import { toast } from "sonner";
import { CreditCard, Search, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AdminSubscriptions() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSellers = async () => {
    try {
      setLoading(true);
      // Query profiles table for all sellers
      const { data } = await backendApi.get('/profiles', { params: { role: 'SELLER', sort: 'trial_start_date_desc' } });
      setSellers(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load subscription list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysDiff = (endDateStr: string) => {
    if (!endDateStr) return -1;
    const diff = new Date(endDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Subscription Monitoring</h2>
          <p className="text-sm text-slate-500 mt-1">Track active trials, renewals, and expired accounts.</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading billing ledgers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                  <th className="p-4">Subscriber</th>
                  <th className="p-4 text-center">Plan Tier</th>
                  <th className="p-4 text-center">Validity / Expiry Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Payment Log ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSellers.map((s) => {
                  const status = s.subscription_status || 'TRIAL';
                  const isTrial = status === 'TRIAL';
                  const endDateStr = isTrial ? s.trial_end_date : (s.subscription_expires_at || s.expiry_date);
                  
                  const daysLeft = getDaysDiff(endDateStr);
                  const isExpired = daysLeft < 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{s.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          s.subscription_plan === 'YEARLY' ? 'bg-purple-100 text-purple-700' :
                          s.subscription_plan === 'MONTHLY' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {s.subscription_plan || 'FREE'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 text-slate-600 text-sm">
                              <Calendar className="w-3.5 h-3.5" /> 
                              {endDateStr ? new Date(endDateStr).toLocaleDateString() : 'N/A'}
                            </div>
                            {endDateStr && (
                              isExpired ? (
                                <span className="text-[10px] text-red-500 font-bold mt-1">Expired {Math.abs(daysLeft)} days ago</span>
                              ) : (
                                <span className="text-[10px] text-green-600 font-bold mt-1">{daysLeft} days left</span>
                              )
                            )}
                         </div>
                      </td>
                      <td className="p-4 text-center">
                         {isExpired ? (
                           <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold border border-red-100">
                             <AlertTriangle className="w-3 h-3"/> Locked Out
                           </span>
                         ) : (
                           <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                             isTrial 
                               ? 'text-orange-600 bg-orange-50 border-orange-100' 
                               : 'text-green-600 bg-green-50 border-green-100'
                           }`}>
                             {isTrial ? 'Free Trial' : 'Active'}
                           </span>
                         )}
                      </td>
                      <td className="p-4 text-right">
                         <span className="text-xs text-slate-400 font-mono">
                           {s.last_payment_id ? s.last_payment_id.substring(0, 12) : 'No payments'}
                         </span>
                      </td>
                    </tr>
                  )
                })}
                {filteredSellers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No subscription records found.
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
