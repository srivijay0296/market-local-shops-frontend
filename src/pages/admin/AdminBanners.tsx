import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Image as ImageIcon, Video, Plus, Trash2, CheckCircle2, XCircle, PlayCircle, ToggleRight, ToggleLeft } from "lucide-react";

export default function AdminBanners() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [newSortOrder, setNewSortOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if ((user as any)?.isDemo) {
      toast.error("Action disabled in Demo Mode: Cannot modify database.");
      return;
    }

    try {
      const { error } = await supabase
        .from('banners')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(currentStatus ? 'Banner deactivated.' : 'Banner activated.');
      setBanners(banners.map(b => b.id === id ? { ...b, active: !currentStatus } : b));
    } catch (err: any) {
      toast.error(err.message || "Failed to update banner");
    }
  };

  const handleDelete = async (id: string) => {
    if ((user as any)?.isDemo) {
      toast.error("Action disabled in Demo Mode: Cannot delete records.");
      return;
    }

    if (!confirm('Are you sure you want to delete this banner? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Banner deleted successfully.');
      setBanners(banners.filter(b => b.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete banner");
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((user as any)?.isDemo) {
      toast.error("Action disabled in Demo Mode: Cannot create new records.");
      return;
    }

    if (!newTitle || !newUrl) {
      toast.error("Title and Media URL are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('banners')
        .insert({
          title: newTitle,
          image_url: newUrl,
          link: newLink || null,
          type: newType,
          sort_order: newSortOrder,
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Banner added successfully!');
      setBanners([...banners, data].sort((a, b) => a.sort_order - b.sort_order));
      
      // Reset Form
      setNewTitle('');
      setNewUrl('');
      setNewLink('');
      setNewType('image');
      setIsAdding(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Homepage Banners</h2>
          <p className="text-sm text-slate-500 mt-1">Manage the image and video slider on the main storefront.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition font-bold text-sm"
        >
          {isAdding ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Add New Banner'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Create New Banner</h3>
          <form onSubmit={handleAddBanner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Banner Title/Text Overlay <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Festival Season Sale!" 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Media URL (Image or Video) <span className="text-red-500">*</span></label>
                <input 
                  type="url" 
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg" 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Media Type</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    type="button" 
                    onClick={() => setNewType('image')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition ${newType === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ImageIcon className="w-4 h-4" /> Image
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewType('video')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition ${newType === 'video' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Destination Link (Optional)</label>
                <input 
                  type="text" 
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  placeholder="e.g. /category/silk" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Where the 'Shop Now' button goes.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sort Order</label>
                <input 
                  type="number" 
                  value={newSortOrder}
                  onChange={e => setNewSortOrder(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl shadow-md hover:bg-blue-800 transition font-bold disabled:opacity-50"
               >
                 {isSubmitting ? 'Saving...' : 'Save Banner'}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500">Loading banners...</div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white border text-center relative border-slate-200 rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition">
              {/* Media Preview */}
              <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
                {banner.type === 'video' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <Video className="w-12 h-12 text-slate-700" />
                  </div>
                ) : (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                   {banner.active ? (
                     <span className="px-2.5 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">Active</span>
                   ) : (
                     <span className="px-2.5 py-1 bg-slate-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">Hidden</span>
                   )}
                </div>
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-lg">
                  {banner.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                </div>
              </div>

              {/* Data */}
              <div className="p-5 text-left">
                <h3 className="font-bold text-slate-800 text-lg line-clamp-1 mb-1" title={banner.title}>{banner.title}</h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-2 mb-4">
                  <span>Order: {banner.sort_order}</span>
                  {banner.link && <span className="truncate max-w-[120px]">Link: {banner.link}</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleToggleActive(banner.id, banner.active)}
                    className={`flex items-center gap-1.5 text-sm font-bold transition ${banner.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                  >
                    {banner.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {banner.active ? 'Disable' : 'Enable'}
                  </button>

                   <button 
                    onClick={() => handleDelete(banner.id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {!loading && banners.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No banners found</p>
            <p className="text-sm mt-1">Add a new image or video banner to populate the storefront slider.</p>
          </div>
        )}
      </div>
    </div>
  );
}
