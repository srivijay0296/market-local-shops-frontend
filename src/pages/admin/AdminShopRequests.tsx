import React, { useState, useEffect } from "react";
import { shopsApi } from "@/lib/api/shops";
import { Check, X, Store, Mail, Phone, Calendar, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminShopRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await shopsApi.getRequests();
      setRequests(data || []);
    } catch (err: any) {
      if (err.code !== "42P01") toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: any) => {
    const confirm = window.confirm(`Approve shop '${req.shop_name}'?`);
    if (!confirm) return;

    try {
      await shopsApi.approveRequest(req);
      toast.success(`Shop ${req.shop_name} approved and created!`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve request.");
    }
  };

  const handleReject = async (req: any) => {
    const confirm = window.confirm(`Reject shop '${req.shop_name}'?`);
    if (!confirm) return;

    try {
      await shopsApi.rejectRequest(req.id);
      toast.success("Request rejected.");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = requests.filter(r => 
    r.shop_name.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Shop Requests</h2>
          <p className="text-slate-500 font-medium">Review and approve new seller onboarding applications.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search shops or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E3A8A] outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 pl-6">Shop Info</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Aadhaar ID</th>
                <th className="p-4">Market</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold animate-pulse">
                    Loading Requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">No shop requests found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-800 font-black flex items-center justify-center rounded-xl">
                          {req.shop_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{req.shop_name}</p>
                          <p className="text-xs text-slate-500 max-w-[140px] truncate">{req.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                         <div className="flex items-center gap-1.5 text-slate-700">
                           <Mail className="w-3.5 h-3.5" /> {req.email}
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-700">
                           <Phone className="w-3.5 h-3.5" /> {req.phone}
                         </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700 font-mono">
                      {req.aadhaar_id || "N/A"}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-600">
                      {req.market?.name || "Global Market"}
                    </td>
                    <td className="p-4">
                      {req.status === 'pending' && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold uppercase">Pending</span>}
                      {req.status === 'approved' && <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold uppercase">Approved</span>}
                      {req.status === 'rejected' && <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-bold uppercase">Rejected</span>}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                       {req.status === 'pending' && (
                         <>
                           <button onClick={() => handleApprove(req)} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition" title="Approve & Create Shop">
                             <Check className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleReject(req)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition" title="Reject Request">
                             <X className="w-4 h-4" />
                           </button>
                         </>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
