import { useState } from "react";
import { Link } from "react-router-dom";
import { SellerPost, sellerPostsApi } from "@/lib/api/sellerPosts";
import { Clock, MessageCircle, MapPin, BadgeCheck, Heart, Share2, Bookmark, Tag, ChevronLeft, ChevronRight, Send, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SellerPostCardProps {
  post: SellerPost & { 
    seller_id?: string;
    seller_name?: string; 
    seller_location?: string; 
    profile_image?: string;
    post_likes?: { count: number }[];
    post_saves?: { count: number }[];
    post_comments?: { count: number }[];
    has_liked?: boolean;
    has_saved?: boolean;
  };
}

export default function SellerPostCard({ post: initialPost }: SellerPostCardProps) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(initialPost.has_liked || false);
  const [isSaved, setIsSaved] = useState(initialPost.has_saved || false);
  const [likesCount, setLikesCount] = useState(initialPost.post_likes?.[0]?.count || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const shopId = post.seller_id;
  const isVideo = post.media_type === 'video' || !!post.video_url;
  const mediaUrls = post.media_urls?.length ? post.media_urls : (post.media_url ? [post.media_url] : []);
  const displayTitle = post.title || post.caption || "Update";
  const displayDesc = post.description || post.caption;

  const handleLike = async () => {
    if (!user) return toast.error("Please login to like posts");
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
    try {
      await sellerPostsApi.toggleLike(post.id, user.id);
    } catch(err) {
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
      toast.error("Failed to like post");
    }
  };

  const handleSave = async () => {
    if (!user) return toast.error("Please login to save posts");
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    try {
      await sellerPostsApi.toggleSave(post.id, user.id);
      if (newSavedState) toast.success("Saved to your collections");
    } catch(err) {
      setIsSaved(!newSavedState);
      toast.error("Failed to save post");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: `Check out this post from ${post.seller_name}`,
        url: `${window.location.origin}/post/${post.id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Recently';

  const nextImage = () => setCurrentImageIndex(i => (i + 1) % mediaUrls.length);
  const prevImage = () => setCurrentImageIndex(i => (i - 1 + mediaUrls.length) % mediaUrls.length);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-3 flex items-center gap-3">
         <Link 
            to={shopId ? `/seller-shop?id=${shopId}` : '#'}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 overflow-hidden shrink-0 block"
         >
            {post.profile_image ? (
               <img src={post.profile_image} className="w-full h-full object-cover" alt="Profile" />
            ) : <div className="w-full h-full flex items-center justify-center text-[10px] font-black italic bg-blue-50 text-blue-600">NM</div>}
         </Link>
         <div className="flex-1 overflow-hidden">
            <Link to={shopId ? `/seller-shop?id=${shopId}` : '#'} className="flex items-center gap-1 hover:text-blue-600 transition">
               <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{post.seller_name || 'Namma Seller'}</h4>
               <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />
            </Link>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-0.5 truncate">
               <MapPin className="w-3 h-3" /> {post.location || post.seller_location || 'Bargur'}
            </p>
         </div>
         <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo}
         </div>
      </div>

      {/* Media Content */}
      <Link to={`/post/${post.id}`} className="block">
        <div className="aspect-[4/5] bg-black relative group overflow-hidden flex items-center justify-center">
        {isVideo ? (
          <video 
            src={post.video_url || post.media_url} 
            className="w-full h-full object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline
          />
        ) : mediaUrls.length > 0 ? (
          <>
            <img src={mediaUrls[currentImageIndex]} className="w-full h-full object-cover" alt="Post contents" />
            
            {/* Image Slider Controls */}
            {mediaUrls.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <ChevronLeft className="w-5 h-5 ml-[-2px]" />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <ChevronRight className="w-5 h-5 ml-[2px]" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {mediaUrls.map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'} transition-all`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
           <div className="text-white/50 text-sm font-bold">No Media</div>
        )}
        
        {post.offer_tag && (
           <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest rounded shadow-lg transform -rotate-2">
              {post.offer_tag}
           </div>
        )}
      </div>

      {/* Post Actions (Instagram Style) */}
      <div className="p-3 pb-1 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={handleLike} className="group flex items-center gap-1.5 text-slate-600 transition">
               <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-slate-400'}`} />
               {likesCount > 0 && <span className="text-xs font-bold">{likesCount}</span>}
            </button>
            <button 
               className="flex items-center gap-1.5 text-slate-600 hover:text-blue-500 transition" 
               onClick={async () => {
                  setShowComments(true);
                  setLoadingComments(true);
                  try {
                    const data = await sellerPostsApi.getComments(post.id);
                    setComments(data);
                  } catch(err) {
                    toast.error("Failed to load comments");
                  } finally {
                    setLoadingComments(false);
                  }
               }}
            >
               <MessageCircle className="w-6 h-6" />
               {(post.post_comments?.[0]?.count || 0) > 0 && <span className="text-xs font-bold">{post.post_comments?.[0]?.count}</span>}
            </button>
            <button onClick={handleShare} className="text-slate-600 hover:text-slate-400 transition">
               <Share2 className="w-5 h-5" />
            </button>
         </div>
         <button onClick={handleSave} className="text-slate-600 transition">
            <Bookmark className={`w-6 h-6 transition-all ${isSaved ? 'fill-blue-500 text-blue-500' : 'hover:text-slate-400'}`} />
         </button>
      </div>

      {/* Content */}
      <div className="p-3 pt-1 flex-1 flex flex-col">
         {/* Title & Price Row */}
         <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-black text-slate-900 leading-tight flex-1 line-clamp-2">
               {displayTitle}
            </h3>
            {post.price && (
               <div className="text-[#2874f0] font-black shrink-0">
                 ₹{post.price.toLocaleString('en-IN')}
               </div>
            )}
         </div>

         <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 flex-1 relative z-10">
            {displayDesc && displayDesc !== displayTitle && (
              <>
                 <span className="font-bold text-slate-800 mr-1">{post.seller_name}</span>
                 {displayDesc}
              </>
            )}
         </p>

         {post.category && (
            <div className="mt-2 flex items-center gap-1">
               <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {post.category}
               </span>
            </div>
         )}
        </div>
      </Link>
      {/* Comment Modal */}
      {showComments && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" /> Comments
              </h3>
              <button onClick={() => setShowComments(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition">
                <Clock className="w-5 h-5 rotate-45" /> {/* Close icon via rotate Clock */}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {loadingComments ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-2xl" />)}
                </div>
              ) : comments.length > 0 ? (
                comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase shrink-0 italic">
                      {c.profiles?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none">
                        <p className="text-[10px] font-black text-slate-800 mb-1">{c.profiles?.name || "User"}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                      </div>
                      <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tight">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-30 select-none">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No comments yet</p>
                </div>
              )}
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user || !newComment.trim()) return toast.error("Please login/enter comment");
                try {
                  const data = await sellerPostsApi.addComment(post.id, user.id, newComment);
                  setComments([...comments, data]);
                  setNewComment("");
                  toast.success("Comment added!");
                } catch(err) {
                  toast.error("Failed to add comment");
                }
              }}
              className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2"
            >
              <input 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts..." 
                className="flex-1 bg-white border border-slate-100 rounded-full px-5 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 font-bold" 
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition"
              >
                 <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
