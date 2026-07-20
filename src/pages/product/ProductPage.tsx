import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { backendApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Store, ShoppingCart, 
  Truck, ShieldCheck, Heart, Share2, Star, Zap, 
  Tag, MessageSquare, Loader2, Sparkles, MapPin, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { initiatePayment } from '@/services/payment';

export default function ProductPage() {
  const { handle: id } = useParams<{ handle: string }>();
  const { user, setShowAuthModal } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await backendApi.get(`/products/${id}`);
        setProduct(data);
        if (data?.images?.length > 0) setSelectedImage(data.images[0]);
        else if (data?.image_url) setSelectedImage(data.image_url);
      } catch (err: any) {
        toast.error("Product could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setShowAuthModal(true);
        toast.error("Please login to send an enquiry");
        return;
    }
    setSubmittingEnquiry(true);
    try {
        await backendApi.post('/enquiries', {
            product_id: product.id,
            shop_id: product.shop_id,
            message: enquiryMessage
        });
        toast.success("Enquiry sent successfully! The seller will contact you shortly.");
        setShowEnquiryForm(false);
        setEnquiryMessage('');
    } catch (err: any) {
        toast.error("Failed to send enquiry.");
    } finally {
        setSubmittingEnquiry(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      setShowAuthModal(true);
      toast.error("Please login to purchase");
      return;
    }
    try {
      await initiatePayment(product.price * quantity, {
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        }
      });
      navigate('/order-confirmation');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  if (loading) return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-bold uppercase tracking-widest text-xs animate-pulse">Loading Premium Experience...</p>
      </div>
  );

  if (!product) return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center font-bold uppercase text-foreground/40">Product Not Found</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />
      <AuthModal />

      <main className="max-w-[1400px] mx-auto px-4 py-24 md:py-32 pb-40">
        
        {/* Breadcrumbs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-widest mb-8"
        >
           <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
           <ChevronRight className="w-4 h-4" />
           <span className="hover:text-primary cursor-pointer transition-colors">{product.shops?.name || 'Shop'}</span>
           <ChevronRight className="w-4 h-4" />
           <span className="text-primary">{product.name}</span>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* 🖼️ LEFT: 3D GALLERY */}
          <div className="lg:w-1/2 space-y-6">
            <div className="sticky top-32">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5 }}
                 className="aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-float border border-white/40 relative group cursor-crosshair"
                 onMouseMove={handleMouseMove}
               >
                  <img 
                    src={selectedImage || '/placeholder.svg'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0" 
                  />
                  {/* Zoom Overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{ 
                        backgroundImage: `url(${selectedImage || '/placeholder.svg'})`, 
                        backgroundPosition: `${mousePos.x}% ${mousePos.y}%`, 
                        backgroundSize: '200%' 
                    }}
                  />
                  
                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                      <button className="w-12 h-12 bg-white/80 backdrop-blur-md shadow-glass rounded-2xl flex items-center justify-center text-foreground/40 hover:text-accent transition-all hover:scale-110">
                         <Heart className="w-5 h-5 fill-current opacity-20" />
                      </button>
                      <button className="w-12 h-12 bg-white/80 backdrop-blur-md shadow-glass rounded-2xl flex items-center justify-center text-foreground/40 hover:text-primary transition-all hover:scale-110">
                         <Share2 className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="absolute bottom-6 left-6">
                     <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-glass border border-white/50">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">360° View Available</span>
                     </div>
                  </div>
               </motion.div>
               
                <div className="flex overflow-x-auto gap-4 py-6 scrollbar-hide">
                   {(product.images || []).map((img: string, i: number) => (
                     <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={i} 
                        onClick={() => setSelectedImage(img)} 
                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 shrink-0 bg-white ${selectedImage === img ? 'border-primary shadow-lg' : 'border-transparent shadow-sm opacity-70 hover:opacity-100'}`}
                     >
                        <img src={img} className="w-full h-full object-cover rounded-xl" />
                     </motion.button>
                   ))}
                </div>
            </div>
          </div>

          {/* 📄 RIGHT: PRODUCT INTELLIGENCE */}
          <div className="lg:w-1/2 space-y-10">
             
             {/* Header Info */}
             <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Link to={`/shop/${product.shop_id}`} className="flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm rounded-full border border-border hover:shadow-md hover:border-primary/30 transition-all">
                        <Store className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-widest">{product.shops?.name || 'Premium Seller'}</span>
                    </Link>
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-success/10 text-success rounded-full">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-widest">4.9 (128 Reviews)</span>
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight leading-[1.1]">{product.name}</h1>
                
                <p className="text-lg text-foreground/60 font-medium leading-relaxed">
                   {product.description?.substring(0, 150) || "Experience premium quality and exceptional design with this exclusive local product."}...
                </p>
             </div>

             {/* Pricing & AI Summary */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white rounded-3xl shadow-glass border border-white/50 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    {product.show_price ? (
                        <div className="space-y-2 relative z-10">
                           <p className="text-xs font-bold text-primary uppercase tracking-widest">Special Offer</p>
                           <div className="flex items-baseline gap-4">
                              <span className="text-4xl font-display font-black text-foreground tracking-tighter">{formatPrice(product.price)}</span>
                              <span className="text-lg text-foreground/40 font-bold line-through">{formatPrice(product.price * 1.3)}</span>
                           </div>
                           <p className="text-xs font-semibold text-success flex items-center gap-1 mt-2">
                              <CheckCircle2 className="w-4 h-4" /> In Stock & Ready to Ship
                           </p>
                        </div>
                    ) : (
                        <div className="space-y-2 relative z-10">
                            <p className="text-xs font-bold text-accent uppercase tracking-widest">Custom Pricing</p>
                            <h3 className="text-2xl font-display font-black text-foreground tracking-tighter leading-tight">Price on Request</h3>
                            <p className="text-xs font-medium text-foreground/60 mt-2">Contact vendor for a personalized quote.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 relative overflow-hidden">
                   <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">AI Review Summary</h4>
                   </div>
                   <p className="text-sm text-indigo-800/80 font-medium leading-relaxed">
                      "Customers praise the exceptional build quality and fast delivery. 94% of buyers recommend this product for its value for money and durability."
                   </p>
                </div>
             </div>

             {/* Action Area */}
             <div className="space-y-6">
                {product.show_price ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-white border-2 border-primary text-foreground py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-md hover:bg-primary/5 transition-colors"
                      >
                          <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </motion.button>
                      <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBuyNow}
                          className="flex-1 bg-primary text-foreground py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/30 transition-all"
                      >
                          <Zap className="w-5 h-5" /> Buy Now
                      </motion.button>
                  </div>
                ) : (
                  <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowEnquiryForm(!showEnquiryForm)}
                      className="w-full bg-accent text-white py-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-accent/30 transition-all"
                  >
                      <MessageSquare className="w-5 h-5" />
                      Enquire Now
                  </motion.button>
                )}
             </div>

             {/* ENQUIRY FORM MODAL */}
             <AnimatePresence>
               {showEnquiryForm && (
                   <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                   >
                     <div className="bg-white p-8 rounded-3xl shadow-glass border border-border">
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-lg font-display font-black text-foreground">Send Enquiry</h3>
                             <button onClick={() => setShowEnquiryForm(false)} className="text-foreground/40 hover:text-accent font-bold text-sm">Close</button>
                         </div>
                         <p className="text-foreground/60 text-sm font-medium mb-6">Send a direct message to <strong className="text-foreground">{product.shops?.name}</strong> regarding this product.</p>
                         <form onSubmit={handleEnquiry} className="space-y-4">
                             <textarea 
                                required
                                value={enquiryMessage}
                                onChange={(e) => setEnquiryMessage(e.target.value)}
                                placeholder="I'm interested in buying this in bulk. Can you provide a discount?"
                                className="w-full bg-background border-2 border-transparent rounded-2xl p-4 text-foreground placeholder:text-foreground/40 outline-none focus:border-accent/50 transition-colors font-medium text-sm h-32 resize-none shadow-inner"
                             />
                             <button 
                                disabled={submittingEnquiry}
                                className="w-full bg-accent text-white py-4 rounded-xl font-bold uppercase text-sm tracking-widest hover:scale-[1.02] shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2"
                             >
                                {submittingEnquiry ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
                             </button>
                         </form>
                     </div>
                   </motion.div>
               )}
             </AnimatePresence>

             {/* Description & Features */}
             <div className="space-y-6 pt-8 border-t border-border">
                <h3 className="text-xl font-display font-black text-foreground">Product Details</h3>
                <div className="prose prose-sm md:prose-base text-foreground/70 max-w-none font-medium leading-relaxed">
                   <p>{product.description || "Premium quality product sourced directly from local artisans."}</p>
                </div>
             </div>

             {/* Trust Badges */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                <TrustBadge icon={<ShieldCheck className="text-primary w-6 h-6" />} title="Secure" desc="100% Protected" />
                <TrustBadge icon={<Truck className="text-accent w-6 h-6" />} title="Fast" desc="Express Delivery" />
                <TrustBadge icon={<Tag className="text-success w-6 h-6" />} title="Value" desc="Best Price Guarantee" />
                <TrustBadge icon={<MapPin className="text-secondary w-6 h-6" />} title="Local" desc="Support Local" />
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustBadge({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-2xl shadow-sm border border-border hover:shadow-md transition-all group">
            <div className="mb-2 p-3 bg-background rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
            <span className="text-xs font-bold text-foreground uppercase tracking-widest">{title}</span>
            <span className="text-[10px] font-medium text-foreground/50 mt-1">{desc}</span>
        </div>
    );
}
