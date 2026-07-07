import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "@/lib/api/products";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { DataTable } from "@/components/admin/DataTable";
import { Package, AlertCircle, Search, X, Loader2 } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProducts();
      setProducts(data || []);
    } catch (err: any) {
      console.error("DEBUG: Products API Error:", err);
      toast.error(`Fetch error`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
       await productsApi.deleteProduct(deleteId);
       toast.success("Product deleted successfully!");
       setProducts(prev => prev.filter(p => p.id !== deleteId));
    } catch (err: any) {
       toast.error(`Delete failed`);
    } finally {
       setDeleteId(null);
    }
  };

  if (loading && !products.length) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Registry...</p>
    </div>
  );

  const columns = [
    {
      header: "Product Details",
      accessorKey: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-200 flex items-center justify-center text-slate-400">
            {row.images?.[0] ? (
              <img src={row.images[0]} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="font-black text-slate-800 text-sm uppercase italic">{row.name}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{row.category || "General"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessorKey: (row: any) => <span className="font-black text-slate-900">₹{row.price || 0}</span>,
    },
    {
      header: "Status",
      accessorKey: (row: any) => (
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${row.is_approved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${row.is_approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                {row.is_approved ? 'Live' : 'Vetting'}
            </span>
        </div>
      )
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Product Registry</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global Asset Inventory</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
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
              to="/admin/products/create"
              className="bg-slate-900 text-white font-black px-8 py-4 rounded-[2rem] shadow-2xl hover:scale-105 transition-all text-[10px] uppercase tracking-widest"
            >
              + Add Asset
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <DataTable
            data={filteredProducts}
            columns={columns}
            loading={loading}
            emptyMessage="No assets found in registry."
            onDelete={(id) => setDeleteId(id.toString())}
            editRoute={(id) => `/admin/products/edit/${id}`}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Purge Asset?"
        message="Are you sure you want to permanently delete this product record?"
      />
    </div>
  );
}
