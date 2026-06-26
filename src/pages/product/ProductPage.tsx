import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { backendApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { 
  ChevronRight, Store, Minus, Plus, ShoppingCart, 
  Truck, ShieldCheck, Heart, Share2, Star, Zap, 
  Tag, MessageSquare, Loader2, IndianRupee 
} from 'lucide-react';
import { toast } from 'sonner';
import { initiatePayment } from '@/services/payment';

export default function ProductPage() {
  const { handle: id } = useParams<{ handle: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
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
        console.error('Product Load Error:', err);
        toast.error("Asset node not found in Nexus");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Authentication required to send enquiry pulses");
        return;
    }
    setSubmittingEnquiry(true);
    try {
        await backendApi.post('/enquiries', {
            product_id: product.id,
            shop_id: product.shop_id,
            message: enquiryMessage
        });
        toast.success("Enquiry Pulse Transmitted Successfully! The seller will contact you shortly.");
        setShowEnquiryForm(false);
        setEnquiryMessage('');
    } catch (err: any) {
        toast.error("Transmission Failure: Could not send enquiry.");
    } finally {
        setSubmittingEnquiry(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to initiate purchase protocol.");
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
      // Handle success (e.g., redirect to orders or update state)
      navigate('/order-confirmation');
    } catch (err) {
      // Error handled by the service toast
    }
  };

  if (loading) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">Decoding Asset Data...</p>
      </div>
  );

  if (!product) return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center font-black uppercase text-slate-400">Asset Void: Node Not Found</div>
      </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AuthModal />

      <main className="max-w-7xl mx-auto px-4 py-20 pt-32 pb-40">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* 🖼️ LEFT: VISUAL ASSETS */}
          <div className="lg:w-[45%] space-y-6">
            <div className="sticky top-32">
               <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl relative group">
                  <img src={selectedImage || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute top-6 right-6">
                      <button className="w-12 h-12 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all hover:scale-110">
                         <Heart className="w-5 h-5 fill-current opacity-20" />
                      </button>
                  </div>
               </div>
               
                <div className="flex overflow-x-auto gap-4 py-6 scrollbar-hide">
                   {(product.images || []).map((img: string, i: number) => (
                     <button key={i} onClick={() => setSelectedImage(img)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 whitespace-nowrap shrink-0 ${selectedImage === img ? 'border-indigo-600 scale-105 shadow-lg' : 'border-slate-100 opacity-60'}`}>
                        <img src={img} className="w-full h-full object-cover rounded-xl" />
                     </button>
                   ))}
                </div>

               <div className="grid grid-cols-1 gap-4 mt-4">
                  {product.show_price ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-amber-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95">
                            <ShoppingCart className="w-5 h-5" /> Add to Cart
                        </button>
                        <button 
                            onClick={handleBuyNow}
                            className="bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Zap className="w-5 h-5" /> Buy Now
                        </button>
                    </div>
                  ) : (
                    <button 
                        onClick={() => setShowEnquiryForm(!showEnquiryForm)}
                        className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/50 to-indigo-600/0 -translate-x-full group-hover:animate-shimmer" />
                        <MessageSquare className="w-6 h-6" />
                        ENQUIRE NOW
                    </button>
                  )}
               </div>
            </div>
          </div>

          {/* 📄 RIGHT: DATA INTELLIGENCE */}
          <div className="lg:w-[55%] space-y-8">
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>MARKETPLACE</span>
                   <ChevronRight className="w-3 h-3" />
                   <span className="text-indigo-600">PRODUCT NODE</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{product.name}</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pristine Quality</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Store className="w-4 h-4" /> {product.shops?.name || 'Local Merchant'}
                    </span>
                </div>
             </div>

             <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                {product.show_price ? (
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Calculated Node Value</p>
                       <div className="flex items-baseline gap-4">
                          <span className="text-5xl font-black text-slate-900 tracking-tighter italic">{formatPrice(product.price)}</span>
                          <span className="text-lg text-slate-400 font-bold line-through italic opacity-50">{formatPrice(product.price * 1.4)}</span>
                       </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Enquiry Only Model</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-tight">Price concealed by merchant</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 bg-white/50 px-4 py-2 rounded-full inline-block">Contact vendor for custom quote</p>
                    </div>
                )}
                <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-500/5 rotate-12" />
             </div>

             {/* ENQUIRY FORM MODAL/INLINE */}
             {showEnquiryForm && (
                 <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-500">
                     <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xl font-black uppercase italic tracking-tighter">Transmission Portal</h3>
                         <button onClick={() => setShowEnquiryForm(false)} className="opacity-60 hover:opacity-100 font-black">CLOSE [X]</button>
                     </div>
                     <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6 opacity-80 leading-relaxed">Send a secure inquiry pulse to <strong>{product.shops?.name}</strong> regarding this asset node.</p>
                     <form onSubmit={handleEnquiry} className="space-y-4">
                         <textarea 
                            required
                            value={enquiryMessage}
                            onChange={(e) => setEnquiryMessage(e.target.value)}
                            placeholder="WHAT ARE YOUR SPECIFICATIONS? (E.G. BULK ORDER, COLOR CUSTOMIZATION...)"
                            className="w-full bg-white/10 border border-white/20 rounded-3xl p-6 text-white placeholder:text-white/30 outline-none focus:bg-white/20 transition-all font-medium text-xs h-32 resize-none"
                         />
                         <button 
                            disabled={submittingEnquiry}
                            className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] shadow-2xl transition-all flex items-center justify-center gap-2"
                         >
                            {submittingEnquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                            Execute Transmission
                         </button>
                     </form>
                 </div>
             )}

             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                   <div className="w-6 h-1 bg-indigo-600 rounded-full" /> Node Specifications
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-3xl border border-slate-50 italic">
                   {product.description || "No further data transmitted for this node."}
                </p>
             </div>

             <div className="grid grid-cols-3 gap-6 pt-8">
                <TrustBadge icon={<ShieldCheck className="text-indigo-600" />} label="Verified Asset" />
                <TrustBadge icon={<Truck className="text-blue-500" />} label="Fast Sync" />
                <TrustBadge icon={<Tag className="text-emerald-500" />} label="Fair Logic" />
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
            <div className="mb-3 group-hover:scale-125 transition-transform">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        </div>
    );
}

function SendIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
