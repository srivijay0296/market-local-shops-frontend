import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, LayoutGrid, BadgeCheck, MapPin, 
  ChevronRight, MessageSquare, BarChart3, 
  Sparkles, PlaySquare, Settings, Loader2 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useSellerDashboard, SellerTabType } from "@/hooks/useSellerDashboard";

// Lazy load seller dashboard tabs for peak performance
const InventoryTab = lazy(() => import("@/components/seller/dashboard/InventoryTab").then(m => ({ default: m.InventoryTab })));
const EnquiriesTab = lazy(() => import("@/components/seller/dashboard/EnquiriesTab").then(m => ({ default: m.EnquiriesTab })));
const AnalyticsTab = lazy(() => import("@/components/seller/dashboard/AnalyticsTab").then(m => ({ default: m.AnalyticsTab })));
const BroadcastsTab = lazy(() => import("@/components/seller/dashboard/BroadcastsTab").then(m => ({ default: m.BroadcastsTab })));
const ShopSettingsTab = lazy(() => import("@/components/seller/dashboard/ShopSettingsTab").then(m => ({ default: m.ShopSettingsTab })));

export default function SellerDashboard() {
  const {
    user,
    authLoading,
    activeTab,
    setActiveTab,
    shop,
    products,
    posts,
    enquiries,
    loading,
    saving,
    showAddProduct,
    setShowAddProduct,
    newProduct,
    setNewProduct,
    showAddPost,
    setShowAddPost,
    newPost,
    setNewPost,
    handleCreatePost,
    handleDeletePost,
    handleCreateProduct,
    handleDeleteProduct
  } = useSellerDashboard();

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-bold uppercase tracking-widest text-xs animate-pulse">Loading Seller Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Decorative Blob Elements */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 dark:bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <Header />
      <AuthModal />
      
      <main className="max-w-[1400px] mx-auto px-4 py-24 md:py-32 pb-20 relative z-10">
        
        {/* 🏢 HUB HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 border border-border flex flex-col md:flex-row items-center gap-8 mb-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg relative z-10">
            <Store className="w-14 h-14 text-primary-foreground" />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-display font-black text-foreground tracking-tight leading-none">
                {shop?.name || "Initializing..."}
              </h1>
              <BadgeCheck className="w-6 h-6 text-accent fill-current shrink-0" />
            </div>
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent"/> {shop?.markets?.name || "Central Nexus"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
            <div className="bg-emerald-500/10 px-5 py-2.5 rounded-full border border-emerald-500/20 flex items-center gap-2 w-full sm:w-auto justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Active Vendor</span>
            </div>
            <button 
              onClick={() => window.location.href = `/shop/${shop?.id}`}
              className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 px-8 py-3"
            >
              View Shop <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* AI Recommendation Box */}
        {activeTab === "products" && products.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-primary/20 rounded-[20px] p-5 flex items-start gap-4"
          >
            <div className="p-2.5 bg-card rounded-xl border border-border shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">AI Recommendation</h4>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
                Consider uploading 360° images for your top 3 products. Listings with high-quality visual assets receive up to 40% more customer enquiries.
              </p>
            </div>
          </motion.div>
        )}

        {/* 📑 NAVIGATION */}
        <div className="flex items-center gap-2 mb-10 bg-card/60 backdrop-blur-md p-1.5 rounded-[20px] shadow-sm border border-border overflow-x-auto scrollbar-hide">
          {[
            { id: "products", icon: LayoutGrid, label: "Inventory" },
            { id: "posts", icon: PlaySquare, label: "Broadcasts" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "enquiries", icon: MessageSquare, label: "Enquiries" },
            { id: "profile", icon: Settings, label: "Settings" }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SellerTabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-slate-900 dark:bg-slate-800 text-white shadow-md scale-[1.01]" 
                  : "text-foreground/50 hover:text-foreground hover:bg-card/50"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
            </button>
          ))}
        </div>

        {/* 🖥️ CONTENT AREA */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
              {activeTab === "products" && (
                <InventoryTab
                  products={products}
                  showAddProduct={showAddProduct}
                  setShowAddProduct={setShowAddProduct}
                  newProduct={newProduct}
                  setNewProduct={setNewProduct}
                  handleCreateProduct={handleCreateProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  saving={saving}
                />
              )}

              {activeTab === "enquiries" && <EnquiriesTab enquiries={enquiries} />}

              {activeTab === "analytics" && <AnalyticsTab enquiriesCount={enquiries.length} />}

              {activeTab === "posts" && (
                <BroadcastsTab
                  posts={posts}
                  showAddPost={showAddPost}
                  setShowAddPost={setShowAddPost}
                  newPost={newPost}
                  setNewPost={setNewPost}
                  handleCreatePost={handleCreatePost}
                  handleDeletePost={handleDeletePost}
                  saving={saving}
                />
              )}

              {activeTab === "profile" && (
                <ShopSettingsTab 
                  shop={shop} 
                  onRefresh={() => window.location.reload()} 
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
