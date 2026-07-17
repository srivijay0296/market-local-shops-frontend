import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { Edit2, Trash2, MapPin, Tag, Plus, Save, X, Loader2, Store, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { useMarkets, useCreateMarket, useUpdateMarket, useDeleteMarket } from "@/lib/queryHooks";
import { MarketPayload } from "@/lib/api/markets";
import ImageUpload from "@/components/ImageUpload";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Markets() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // ── React Query hooks ────────────────────────────────────────────────────
  const { data: markets = [], isLoading: loading } = useMarkets();
  const createMarket = useCreateMarket();
  const updateMarket = useUpdateMarket();
  const deleteMarket = useDeleteMarket();

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", location: "", description: "", image_url: "" });
  const [submitting, setSubmitting] = useState(false);

  const openCreateDrawer = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", location: "", description: "", image_url: "" });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (m: any) => {
    setEditingId(m.id);
    setForm({ 
      name: m.name || "", 
      slug: m.slug || "", 
      location: m.location || "", 
      description: m.description || "",
      image_url: m.image_url || "" 
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Market name is required.');

    setSubmitting(true);
    try {
      // Auto-generate slug if blank
      const autoSlug = form.name.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const payload: MarketPayload = {
        name: form.name.trim(),
        slug: form.slug.trim() || autoSlug,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        image_url: form.image_url || null,
      };

      console.log('🏪 Market Save Payload:', payload);

      if (editingId) {
        await updateMarket.mutateAsync({ id: editingId, payload });
        toast.success('Market updated successfully!');
      } else {
        await createMarket.mutateAsync(payload);
        toast.success('New market created!');
      }
      setIsDrawerOpen(false);
      setForm({ name: '', slug: '', location: '', description: '', image_url: '' });
    } catch (err: any) {
      console.error('🌌 Market save error:', err);
      toast.error(`Save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    console.log("DEBUG: Preparing to delete Market ID ->", deleteId);
    
    try {
      await deleteMarket.mutateAsync(deleteId);
      toast.success('Market and all associated data deleted successfully!');
    } catch (err: any) {
      console.error("DEBUG: Market Delete Error:", err);
      toast.error(`Could not delete market: ${err.message}`);
    } finally {
      setDeleteId(null);
    }
  };

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    setForm(prev => ({ ...prev, name: val, slug: editingId ? prev.slug : slug }));
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Markets Directory</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor all geographical market locations</p>
        </div>
        
        <button 
          onClick={openCreateDrawer}
          className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Market
        </button>
      </div>

      {/* Table Data list */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="py-5 px-6 text-left w-16">ID</th>
              <th className="py-5 px-6 text-left">Market Details</th>
              <th className="py-5 px-6 text-left">Location Group</th>
              <th className="py-5 px-6 text-right">Settings</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 font-medium animate-pulse">
                  Loading directory data...
                </td>
              </tr>
            ) : markets.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-slate-400 font-medium">
                  <span className="text-4xl block mb-2">🏬</span>
                  No markets found. Let's create one.
                </td>
              </tr>
            ) : (
              markets.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-5 px-6 text-sm font-bold text-slate-400">
                    <span className="truncate block w-12" title={String(m.id)}>#{m.id}</span>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                         {m.image_url ? (
                           <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-xl">🏪</span>
                         )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{m.name}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          {m.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold leading-none border border-slate-200">
                      <MapPin className="w-3 h-3" />
                      {m.location || "Bargur Terminal"}
                    </span>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/shops?market_id=${m.id}`)}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition"
                        title="View Shops in this Market"
                      >
                         <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => openEditDrawer(m)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Edit Market"
                      >
                        <Edit2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete Market"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Unified Add/Edit Side Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto bg-white border-l shadow-2xl p-0">
          <div className="p-8 space-y-8">
            <SheetHeader className="text-left">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                 <Store className="w-6 h-6 text-blue-600" />
              </div>
              <SheetTitle className="text-2xl font-black text-slate-800 tracking-tight">
                {editingId ? "Edit Market Directory" : "Initialize New Market"}
              </SheetTitle>
              <SheetDescription className="font-medium text-slate-500">
                {editingId ? "Refine specifications and visual identification for this market." : "Set up a new geographical textile hub in the platform."}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSave} className="space-y-6 pb-12">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Market Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Central Textile Plaza"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL Slug</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. central-textile-plaza"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location Details</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Main Road, Zone 4"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Market Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the market specialty, history, and major products..."
                  rows={4}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cover Imagery</label>
                <ImageUpload
                  maxImages={1}
                  bucket="market-images"
                  folder="covers"
                  single={true}
                  onUpload={(urls) => setForm({ ...form, image_url: urls[0] || "" })}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-slate-200 transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-6 py-4 bg-blue-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? "Save Changes" : "Initialize Market"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Market?"
        message="Are you absolutely sure you want to delete this market? This will remove all directory data tied to it."
      />
    </div>
  );
}
