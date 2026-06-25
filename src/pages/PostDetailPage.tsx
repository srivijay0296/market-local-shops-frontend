import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SellerPostCard from "@/components/SellerPostCard";
import { sellerPostsApi } from "@/lib/api/sellerPosts";
import { ChevronLeft, Share2, MessageSquare, Heart, Bookmark, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await sellerPostsApi.getPostById(id);
        if (data) {
          setPost(data);
        } else {
          toast.error("Post not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-black text-slate-800 uppercase italic mb-4">Post Missing</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">The requested feed item has expired or never existed.</p>
        <Link to="/stories" className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Return to Stories Feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Navigation */}
          <Link 
            to="/stories" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 font-bold uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Discover
          </Link>

          {/* Premium Post Container */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-white">
            <SellerPostCard 
              post={{
                ...post,
                seller_id: post.shops?.id,
                seller_name: post.shops?.name,
                seller_location: post.shops?.location,
                profile_image: post.shops?.image_url
              }} 
            />
          </div>

          {/* Related Metadata / Engagement Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Views</span>
                <span className="text-2xl font-black text-slate-800 italic tracking-tighter">1.2K+</span>
             </div>
             <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Location</span>
                <span className="text-sm font-black text-blue-600 uppercase tracking-tight">{post.shops?.location || "Bargur Local"}</span>
             </div>
          </div>
          
          <div className="mt-6 p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Connect with {post.shops?.name}</h3>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Direct Manufacturer Connection</p>
             </div>
             <Link 
                to={`/shop/${post.shops?.id}`}
                className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition shadow-lg"
             >
                Visit Digital Shop
             </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
