import { useState, useEffect, useRef } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import SellerPostCard from "@/components/SellerPostCard";
import { sellerPostsApi, SellerPost } from '@/lib/api/sellerPosts';
import { categoriesApi } from '@/lib/api/categories';
import { marketsApi, Market } from '@/lib/api/markets';
import { Grid, PlaySquare, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerFeed() {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Filters
  const [categories, setCategories] = useState<any[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  useEffect(() => {
    const init = async () => {
       const [cats, mkts] = await Promise.all([
          categoriesApi.getCategories(),
          marketsApi.getMarkets()
       ]);
       setCategories(cats || []);
       setMarkets(mkts || []);
    };
    init();
  }, []);

  const fetchFeed = async (reset = false) => {
    if (reset) {
       setPage(0);
       setHasMore(true);
       setLoading(true);
    }
    
    try {
       const currentPage = reset ? 0 : page;
       let data = [];
       
       if (activeTab === 'posts') {
         data = await sellerPostsApi.getGlobalPosts(10, currentPage, selectedCategory);
         if (reset) setPosts(data);
         else setPosts(p => [...p, ...data]);
       } else {
         data = await sellerPostsApi.getReelsFeed(5, currentPage);
         if (reset) setReels(data);
         else setReels(p => [...p, ...data]);
       }

       if (data.length < (activeTab === 'posts' ? 10 : 5)) {
         setHasMore(false);
       }
       setPage(currentPage + 1);
    } catch (err) {
       console.error(err);
       toast.error("Failed to load feed");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
     fetchFeed(true);
  }, [activeTab, selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        fetchFeed();
      }
    }, { threshold: 1.0 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, activeTab, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="flex-1 pt-20 md:pt-28 pb-20">
        
        {/* Sticky Filters & Tabs Header */}
        <div className="bg-white sticky top-16 md:top-24 z-30 shadow-sm border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between px-4 py-2 gap-3">
           
           {/* Tabs */}
           <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'posts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                 <Grid className="w-4 h-4" /> Feed
              </button>
              <button 
                onClick={() => setActiveTab('reels')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'reels' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                 <PlaySquare className="w-4 h-4" /> Reels
              </button>
           </div>

           {/* Category Scroller */}
           {activeTab === 'posts' && (
             <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <button 
                   onClick={() => setSelectedCategory('')}
                   className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap tracking-wider transition-colors border ${
                      selectedCategory === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                   }`}
                >
                   All
                </button>
                {categories.map(cat => (
                   <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap tracking-wider transition-colors border ${
                         selectedCategory === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                   >
                      {cat.name}
                   </button>
                ))}
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6">
           {activeTab === 'posts' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {posts.map(post => (
                  <SellerPostCard 
                     key={post.id} 
                     post={{
                       ...post,
                       seller_id: post.shops?.id,
                       seller_name: post.shops?.name,
                       seller_location: post.shops?.location,
                       profile_image: post.shops?.image_url
                     }} 
                  />
                ))}
             </div>
           ) : (
             <div className="max-w-md mx-auto h-[80vh] overflow-y-auto snap-y snap-mandatory scrollbar-hide rounded-[2rem] border-[8px] border-slate-900 bg-black shadow-2xl relative">
                {reels.map(reel => (
                  <div key={reel.id} className="h-full w-full snap-start relative bg-black">
                     <video 
                       src={reel.video_url || reel.media_url} 
                       className="w-full h-full object-cover" 
                       loop 
                       autoPlay 
                       playsInline 
                       muted={true}
                     />
                     
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                     
                     {/* Overlay Details */}
                     <div className="absolute bottom-0 left-0 right-16 p-4">
                        <div className="flex items-center gap-2 mb-3">
                           <img src={reel.shops?.image_url || ''} className="w-10 h-10 rounded-full border-2 border-white object-cover bg-slate-200" alt="" />
                           <h4 className="text-white font-black text-sm uppercase tracking-tight flex items-center gap-1 shadow-black drop-shadow-md">
                              {reel.shops?.name} <CheckCircle2 className="w-4 h-4 text-blue-400 fill-white" />
                           </h4>
                           <button className="px-3 py-1 bg-transparent border border-white text-white rounded-full text-[10px] font-bold ml-2 hover:bg-white hover:text-black transition">Follow</button>
                        </div>
                        <h3 className="text-white font-bold text-sm mb-1">{reel.title || reel.caption}</h3>
                        <p className="text-white/80 text-xs line-clamp-2">{reel.description || reel.caption}</p>
                     </div>
                     
                     {/* Right Side Actions */}
                     <div className="absolute bottom-4 right-2 flex flex-col items-center gap-6">
                        <button className="group flex flex-col items-center gap-1">
                           <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white/20 transition">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                           </div>
                           <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.post_likes?.[0]?.count || 0}</span>
                        </button>
                     </div>
                  </div>
                ))}
                
                {reels.length === 0 && !loading && (
                   <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                      <PlaySquare className="w-16 h-16 mb-4 opacity-50" />
                      <p className="font-bold">No Reels Available</p>
                      <p className="text-xs mt-2 opacity-70">Check back later for exciting videos from sellers.</p>
                   </div>
                )}
             </div>
           )}

           {loading && (
             <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin"></div>
             </div>
           )}

           <div ref={loaderRef} className="h-10 w-full" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
