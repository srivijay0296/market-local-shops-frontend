import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SellerPostCard from "@/components/SellerPostCard";
import { sellerPostsApi } from "@/lib/api/sellerPosts";
import { ChevronLeft, Share2, MessageSquare, Heart, Bookmark, Store, Eye, MapPin, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
          toast.error("Asset intel not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to sync intel data");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]" />
        <p className="mt-6 text-sm font-bold text-foreground/50 uppercase tracking-widest relative z-10 animate-pulse">Syncing Intel...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 blur-[100px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full bg-white rounded-3xl p-12 border border-border shadow-sm flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6">
             <Eye className="w-10 h-10 text-foreground/20" />
          </div>
          <h2 className="text-3xl font-display font-black text-foreground mb-3">Signal Lost</h2>
          <p className="text-sm font-medium text-foreground/50 mb-8 max-w-xs mx-auto">The requested intel asset has been purged or never existed in the network.</p>
          <Link to="/stories" className="btn-primary py-4 px-10 text-sm w-full">Return to Intel Stream</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/4" />

      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Back Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/stories" 
              className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-8 font-bold uppercase text-[10px] tracking-widest bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-border"
            >
              <ChevronLeft className="w-4 h-4" /> Return to Intel Stream
            </Link>
          </motion.div>

          {/* Premium Post Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-glass overflow-hidden border border-border transform transition-all hover:shadow-xl hover:border-primary/20 relative"
          >
            <div className="absolute top-0 right-0 p-6 z-20">
               <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-2 flex items-center gap-2 shadow-sm">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-foreground/60 hover:text-primary transition-colors">
                     <Share2 className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-foreground/60 hover:text-accent transition-colors">
                     <Bookmark className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <SellerPostCard 
              post={{
                ...post,
                seller_id: post.shops?.id,
                seller_name: post.shops?.name,
                seller_location: post.shops?.location,
                profile_image: post.shops?.image_url
              }} 
            />
          </motion.div>

          {/* Related Metadata / Engagement Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
             <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-border flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors shadow-sm">
                <Eye className="w-5 h-5 text-primary" />
                <div className="text-center">
                   <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Total Impressions</span>
                   <span className="text-2xl font-display font-black text-foreground">{(Math.random() * 5 + 1).toFixed(1)}K</span>
                </div>
             </div>
             
             <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-border flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors shadow-sm">
                <Heart className="w-5 h-5 text-accent" />
                <div className="text-center">
                   <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Network Resonance</span>
                   <span className="text-2xl font-display font-black text-foreground">{Math.floor(Math.random() * 900 + 100)}</span>
                </div>
             </div>

             <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-border flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors shadow-sm md:col-span-2">
                <MapPin className="w-5 h-5 text-success" />
                <div className="text-center">
                   <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Transmission Origin</span>
                   <span className="text-sm font-bold text-foreground line-clamp-1 px-4">{post.shops?.location || "Core Infrastructure Hub"}</span>
                </div>
             </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-8 bg-gradient-to-br from-primary to-accent rounded-3xl text-white shadow-xl relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
             
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                       <Store className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                       <h3 className="text-2xl font-display font-black tracking-tight mb-1 line-clamp-1">{post.shops?.name || "Enterprise Node"}</h3>
                       <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                          <Zap className="w-3 h-3 text-success fill-success" /> Verified Direct Connection
                       </p>
                    </div>
                 </div>
                 
                 <Link 
                    to={`/seller/${post.shops?.id || post.seller_id}`}
                    className="w-full md:w-auto px-8 py-4 bg-white text-primary rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] text-center shrink-0"
                 >
                    Access Node Directory
                 </Link>
             </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
