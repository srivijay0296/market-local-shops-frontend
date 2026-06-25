import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { shopsApi } from "@/lib/api/shops";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { DataTable } from "@/components/admin/DataTable";
import { Store, CheckCircle, Clock, Search, X, Loader2 } from "lucide-react";

export default function AdminShops() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const marketFilter = searchParams.get("market_id");

  const [shops, setShops] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await shopsApi.getShops({ marketId: marketFilter || undefined });
      setShops(data || []);
    } catch (err: any) {
      console.error("DEBUG: Shop Fetch Error:", err);
      toast.error(`Fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await shopsApi.approveShop(id);
      toast.success(`Shop approved successfully!`);
      fetchShops();
    } catch (err: any) {
      toast.error(`Approval failed`);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [marketFilter]);

  const filteredShops = shops.filter(s => {
    const safeName = String(s.name || "");
    const search = String(searchTerm).toLowerCase();
    return safeName.toLowerCase().includes(search);
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await shopsApi.deleteShop(deleteId);
      toast.success("Shop erased successfully!");
      setShops(prev => prev.filter(s => s.id !== deleteId));
    } catch (err: any) {
      toast.error(`Delete failed`);
    } finally {
      setDeleteId(null);
    }
  };

  if (loading && !shops.length) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Shops...</p>
    </div>
  );

  const columns = [
    {
      header: "Business Name",
      accessorKey: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm">
             <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-slate-800 text-sm uppercase italic">{String(row.name || "Unknown Business")}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">
              {row.owner_name || "Independent"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Authorization",
      accessorKey: (row: any) => {
        const isApproved = row.is_approved;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"} uppercase tracking-widest`}>
            {isApproved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} 
            {isApproved ? "Approved" : "Pending"}
          </span>
        );
      },
    },
    {
        header: "Operations",
        accessorKey: (row: any) => (
          <div className="flex items-center gap-2">
            {!row.is_approved && (
              <button 
                onClick={() => handleApprove(row.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition shadow-sm"
              >
                Approve
              </button>
            )}
            <button 
                onClick={() => setDeleteId(row.id)}
                className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition shadow-sm border border-rose-100"
            >
                <X className="w-4 h-4" />
            </button>
          </div>
        )
      },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Shop Directory</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Managing Vendor Nodes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center relative z-10">
            <div className="relative w-full sm:w-80 group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
                <input 
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-bold placeholder:text-slate-400"
                />
            </div>

            <Link
              to="/admin/shops/create"
              className="bg-slate-900 text-white font-black px-8 py-4 rounded-[2rem] shadow-2xl hover:scale-105 transition-all text-[10px] uppercase tracking-widest"
            >
              + Register Shop
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <DataTable
            data={filteredShops}
            columns={columns}
            loading={loading}
            emptyMessage={searchTerm ? `No shops matching "${searchTerm}".` : "No shops listed."}
            onDelete={(id) => setDeleteId(id.toString())}
            editRoute={(id) => `/admin/shops/edit/${id}`}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Deregister Shop?"
        message="Are you sure you want to permanently delete this shop node?"
      />
    </div>
  );
}
