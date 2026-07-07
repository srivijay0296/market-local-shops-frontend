import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getShopById, getProducts, sendEnquiry } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { MapPin, Phone, Mail, Store, ArrowLeft, Package, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const { user } = useAuth();

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [enquiryProduct, setEnquiryProduct] = useState<any>(null);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    if (shopId) loadShopData();
  }, [shopId]);

  const loadShopData = async () => {
    try {
      const [shopData, productData] = await Promise.all([
        getShopById(shopId!),
        getProducts({ shopId: shopId!, onlyApproved: true }),
      ]);
      setShop(shopData);
      setProducts(productData);
    } catch (err: any) {
      console.error('Shop load error:', err);
      setError(err.message || 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  const handleEnquiry = async () => {
    if (!user) { toast.error("Please login to send enquiry"); return; }
    if (!enquiryMsg.trim()) { toast.error("Enter your message"); return; }
    setSendingEnquiry(true);
    try {
      await sendEnquiry({
        buyer_id: user.id,
        seller_id: enquiryProduct.seller_id || enquiryProduct.shops?.owner_id,
        product_id: enquiryProduct.id,
        message: enquiryMsg.trim(),
      });
      toast.success("Enquiry sent! The seller will contact you.");
      setEnquiryProduct(null);
      setEnquiryMsg('');
    } catch (err: any) {
      toast.error(err.message || "Failed to send enquiry");
    } finally {
      setSendingEnquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="pt-28 md:pt-36 pb-16 max-w-7xl mx-auto px-4">
        {/* Back */}
        <Link to="/shops" className="inline-flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest mb-6 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> All Shops
        </Link>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Loading shop...</p>
            </div>
          </div>
        ) : error || !shop ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center bg-white rounded-3xl p-10 shadow-xl border border-slate-100 max-w-sm">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Shop Not Found</h2>
              <p className="text-slate-400 text-sm mb-6">{error || "This shop doesn't exist."}</p>
              <Link to="/shops" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition">
                Browse All Shops
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Shop Hero */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
              <div className="relative h-52 md:h-72">
                <img
                  src={shop.image_url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200'}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[9px] text-white/70 font-black uppercase tracking-[0.3em]">
                      {shop.is_approved ? '✅ Verified Shop' : '⏳ Pending Verification'}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">{shop.name}</h1>
                </div>
              </div>

              <div className="p-8 flex flex-wrap gap-6 items-center justify-between">
                <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500">
                  {shop.address && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {shop.address}
                    </span>
                  )}
                  {shop.profiles?.phone && (
                    <a href={`tel:${shop.profiles.phone}`} className="flex items-center gap-2 hover:text-indigo-600 transition">
                      <Phone className="w-4 h-4 text-indigo-400" />
                      {shop.profiles.phone}
                    </a>
                  )}
                  {shop.profiles?.email && (
                    <a href={`mailto:${shop.profiles.email}`} className="flex items-center gap-2 hover:text-indigo-600 transition">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      {shop.profiles.email}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-800">{products.length}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Products</p>
                  </div>
                </div>
              </div>

              {shop.description && (
                <div className="px-8 pb-8">
                  <p className="text-slate-500 text-sm font-medium border-t border-slate-100 pt-6">{shop.description}</p>
                </div>
              )}
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div className="flex gap-3 flex-wrap mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                        : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-xl uppercase tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Products ({filtered.length})
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No products listed yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Enquiry Modal */}
      {enquiryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setEnquiryProduct(null)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase">Send Enquiry</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">Re: {enquiryProduct.name}</p>
              </div>
            </div>
            <textarea
              value={enquiryMsg}
              onChange={(e) => setEnquiryMsg(e.target.value)}
              placeholder="Hi, I'm interested in this product..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEnquiryProduct(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-xs tracking-widest">Cancel</button>
              <button
                onClick={handleEnquiry}
                disabled={sendingEnquiry}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition disabled:opacity-50"
              >
                {sendingEnquiry ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}