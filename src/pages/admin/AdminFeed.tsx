import { useState, useEffect } from "react";
import { ShieldAlert, Trash2, CheckCircle2, AlertTriangle, EyeOff, LayoutGrid, Image as ImageIcon } from "lucide-react";
import { backendApi } from '@/lib/api/client';
import { toast } from "sonner";
import { SellerPost } from "@/lib/api/sellerPosts";

export default function AdminFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ total: 0, flagged: 0, pending: 0 });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data } = await backendApi.get('/seller_posts', { params: { sort: 'created_at_desc' } });
      setPosts(data || []);

      // Calculate simple analytics
      const total = data?.length || 0;
      const flagged = data?.filter(p => p.status === 'rejected').length || 0;
      const pending = data?.filter(p => p.status === 'pending').length || 0;
      setAnalytics({ total, flagged, pending });
    } catch (err) {
      toast.error("Failed to load feed content");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await backendApi.patch(`/seller_posts/${id}`, { status });
      toast.success(`Post marked as ${status}`);
      setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
      
      // Update analytics
      setAnalytics(prev => ({
         ...prev,
         flagged: status === 'rejected' ? prev.flagged + 1 : prev.flagged,
         pending: status === 'pending' ? prev.pending + 1 : (prev.pending > 0 ? prev.pending - 1 : 0)
      }));
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this post?")) return;
    try {
      await backendApi.delete(`/seller_posts/${id}`);
      toast.success("Spam post removed completely");
      setPosts(posts.filter(p => p.id !== id));
      setAnalytics(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
               <ShieldAlert className="w-6 h-6 text-red-500" /> Content Moderation
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review seller posts, remove spam, and enforce community guidelines.</p>
          </div>
          <button onClick={loadContent} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
             Refresh Feed
          </button>
       </div>

       {/* Quick Analytics Row */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <LayoutGrid className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black text-slate-800">{analytics.total}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Posts</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black text-slate-800">{analytics.pending}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Review</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                <EyeOff className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black text-slate-800">{analytics.flagged}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rejected/Spam</p>
             </div>
          </div>
       </div>

       {/* Posts Grid */}
       {loading ? (
          <div className="flex justify-center p-12">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {posts.map(post => {
                const isVideo = post.media_type === 'video' || !!post.video_url;
                const mediaUrl = post.media_urls?.[0] || post.video_url || post.media_url;

                return (
                   <div key={post.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col group relative">
                      {/* Status Ribbon */}
                      {post.status === 'rejected' && (
                         <div className="absolute top-3 left-[-30px] w-32 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest text-center py-1 -rotate-45 z-10 shadow-lg">
                            REJECTED
                         </div>
                      )}
                      {post.status === 'pending' && (
                         <div className="absolute top-3 right-[-30px] w-32 bg-orange-500 text-white text-[10px] uppercase font-black tracking-widest text-center py-1 rotate-45 z-10 shadow-lg">
                            REVIEW
                         </div>
                      )}
                      
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                         {isVideo ? (
                            <video src={mediaUrl} className="w-full h-full object-cover opacity-80" />
                         ) : mediaUrl ? (
                            <img src={mediaUrl} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <ImageIcon className="w-12 h-12" />
                            </div>
                         )}
                         
                         {/* Hover Admin Actions Overlay */}
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <button onClick={() => handleDelete(post.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-xs font-bold w-36 justify-center">
                               <Trash2 className="w-4 h-4" /> Delete Spam
                            </button>
                            {post.status !== 'approved' && (
                               <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-xs font-bold w-36 justify-center">
                                  <CheckCircle2 className="w-4 h-4" /> Approve
                               </button>
                            )}
                            {post.status !== 'rejected' && (
                               <button onClick={() => handleUpdateStatus(post.id, 'rejected')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 text-xs font-bold w-36 justify-center">
                                  <EyeOff className="w-4 h-4" /> Reject/Hide
                               </button>
                            )}
                         </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                         <h4 className="font-bold text-sm text-slate-800 truncate mb-1">{post.title || post.caption || "Untitled"}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">{post.description || post.caption}</p>
                         <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 flex justify-between uppercase tracking-wider">
                            <span>{post.sellers?.shop_name || post.seller_id.substring(0,8)}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                );
             })}

             {posts.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
                   <ShieldAlert className="w-16 h-16 mb-4 text-slate-300" />
                   <h3 className="text-xl font-bold">No Posts to Moderate</h3>
                   <p className="text-sm mt-2">All feed content is currently empty or has been reviewed.</p>
                </div>
             )}
          </div>
       )}
    </div>
  );
}
