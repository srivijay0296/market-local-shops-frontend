import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlaySquare, Plus, Settings, IndianRupee, Loader2, Trash2, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { formatPrice } from "@/lib/constants";

interface BroadcastsTabProps {
  posts: any[];
  showAddPost: boolean;
  setShowAddPost: (val: boolean) => void;
  newPost: {
    title: string;
    description: string;
    media_url: string;
    media_type: "image" | "video";
    price: string;
    offer_tag: string;
    category: string;
  };
  setNewPost: (val: any) => void;
  handleCreatePost: (e: React.FormEvent) => void;
  handleDeletePost: (id: string) => void;
  saving: boolean;
}

export const BroadcastsTab = React.memo(function BroadcastsTab({
  posts,
  showAddPost,
  setShowAddPost,
  newPost,
  setNewPost,
  handleCreatePost,
  handleDeletePost,
  saving
}: BroadcastsTabProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-foreground">Market Broadcasts & Reels</h2>
          <p className="text-xs font-medium text-foreground/50 mt-1">Publish live updates, video reels, and exclusive offers to the local network</p>
        </div>
        <button 
          onClick={() => setShowAddPost(!showAddPost)} 
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-md ${showAddPost ? 'bg-background text-foreground border border-border' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
        >
          {showAddPost ? <Settings className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddPost ? "Close Form" : "Create Broadcast"}
        </button>
      </div>

      {/* ADD POST FORM */}
      <AnimatePresence>
        {showAddPost && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreatePost} 
            className="bg-card p-8 md:p-10 rounded-[28px] border border-border shadow-glass space-y-6 overflow-hidden"
          >
            <div className="flex items-center gap-3 text-foreground pb-4 border-b border-border/60">
              <div className="p-2.5 bg-primary/10 text-accent rounded-xl"><Plus className="w-5 h-5" /></div>
              <h3 className="text-lg font-display font-black uppercase tracking-tight">Publish New Broadcast</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Broadcast Title *</label>
                  <input 
                    required value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    placeholder="e.g. Exclusive Festive Silk Saree Sale!" 
                    className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm text-foreground placeholder:text-foreground/30" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Price (₹, Optional)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input 
                        type="number" value={newPost.price}
                        onChange={e => setNewPost({...newPost, price: e.target.value})}
                        placeholder="0.00" 
                        className="w-full bg-background border border-border/80 focus:border-primary/50 py-4 pl-12 pr-4 rounded-xl outline-none transition-colors font-medium text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Offer Tag (Optional)</label>
                    <input 
                      value={newPost.offer_tag}
                      onChange={e => setNewPost({...newPost, offer_tag: e.target.value})}
                      placeholder="e.g. Flat 20% OFF" 
                      className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Media Type</label>
                    <select 
                      value={newPost.media_type}
                      onChange={e => setNewPost({...newPost, media_type: e.target.value as any})}
                      className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm text-foreground"
                    >
                      <option value="image">Image Post</option>
                      <option value="video">Video Reel</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Category</label>
                    <select 
                      value={newPost.category}
                      onChange={e => setNewPost({...newPost, category: e.target.value})}
                      className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm text-foreground"
                    >
                      <option value="">Select Category</option>
                      <option value="Sarees">Sarees / Textiles</option>
                      <option value="Cotton">Cotton / Fabrics</option>
                      <option value="Silk">Silk Collections</option>
                      <option value="Handicrafts">Handicrafts</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Media Asset</label>
                  <div className="bg-background rounded-xl border border-dashed border-border p-4">
                    <ImageUpload bucket="seller-posts" onUpload={(urls) => setNewPost(prev => ({ ...prev, media_url: urls[0] }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Description / Caption</label>
                  <textarea 
                    value={newPost.description}
                    onChange={e => setNewPost({...newPost, description: e.target.value})}
                    placeholder="Write a catchy caption or describe your offer/broadcast detail..."
                    className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm h-28 resize-none" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/60">
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3.5 disabled:opacity-50 text-xs">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Publish Broadcast"}
              </button>
              <button type="button" onClick={() => setShowAddPost(false)} className="px-10 py-3.5 bg-background text-foreground/70 border border-border font-bold rounded-xl hover:bg-border/40 transition-colors uppercase text-xs tracking-wider">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* POSTS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {posts.map(p => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={p.id} 
            className="bg-card rounded-[22px] border border-border shadow-glass flex flex-col overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-[4/5] bg-background flex items-center justify-center relative overflow-hidden">
              {p.media_type === 'video' || p.video_url ? (
                <video src={p.media_url || p.video_url} className="w-full h-full object-cover" controls={false} />
              ) : p.media_url ? (
                <img src={p.media_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <PlaySquare className="w-10 h-10 text-foreground/20" />
              )}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => handleDeletePost(p.id)} title="Delete Broadcast" className="p-2 bg-card text-red-500 rounded-xl shadow-md border border-border/60 hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {p.status === 'rejected' && (
                <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center p-3">
                  <div className="text-center bg-card p-2.5 rounded-xl border border-border shadow-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 mx-auto mb-1 animate-pulse" />
                    <span className="text-[9px] font-bold text-foreground/80 uppercase tracking-wider">Rejected</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <h4 className="font-bold text-foreground text-xs line-clamp-2 leading-snug">{p.title}</h4>
                {p.offer_tag && (
                  <span className="inline-block px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-wider rounded">{p.offer_tag}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">{p.category || 'Broadcast'}</span>
                <span className="text-accent font-black text-xs">{p.price ? formatPrice(p.price) : 'Broadcast'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && !showAddPost && (
        <div className="py-24 bg-card rounded-[28px] border border-border shadow-glass text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-background rounded-full border border-border/60 flex items-center justify-center mb-6">
            <PlaySquare className="w-8 h-8 text-foreground/30" />
          </div>
          <h3 className="text-lg font-display font-black text-foreground">No Broadcasts Active</h3>
          <p className="text-xs text-foreground/50 font-medium mt-2 max-w-sm px-4">Publish updates, special discounts or video reels to engage local customers in the market.</p>
          <button 
            onClick={() => setShowAddPost(true)}
            className="mt-6 btn-primary py-3 text-xs"
          >
            Create First Broadcast
          </button>
        </div>
      )}
    </div>
  );
});
