import React, { useState, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Star, Check, Plus, MessageSquare, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { backendApi } from '@/lib/api/client';
import { toast } from 'sonner';
import axios from 'axios';

interface ProductCardProps {
  product: any;
  compact?: boolean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const [isFlying, setIsFlying] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const imgRef = useRef<HTMLDivElement | null>(null);

  // Derived values with safe fallbacks
  const effectivePrice: number = product?.price ?? 0;
  const originalPrice: number = product?.original_price ?? Math.round(effectivePrice * 1.3);
  const vendorName: string = product?.shops?.name ?? 'Namma Market';
  const imageUrl: string = product?.image_url ?? (product?.images && product.images[0]) ?? '/placeholder.svg';
  const showPrice: boolean = product?.price != null;
  const discount: number = originalPrice > 0 ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;
  const rating: number | string = product?.rating ?? '4.5';

  // Mouse move handler for zoom preview
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)), show: true });
  };

  // Quick add to cart with fly animation
  const handleQuickAdd = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isFlying) return;
    setIsFlying(true);
    try {
      // Add to cart (context)
      addToCart(product, 1);
      // small delay to let animation run
      await new Promise((res) => setTimeout(res, 800));
      toast.success('Added to cart');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to cart');
    } finally {
      setIsFlying(false);
    }
  };

  // Open enquiry modal
  const handleEnquiry = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setShowEnquiryModal(true);
  };

  // Submit enquiry to backend
  const submitEnquiry = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!enquiryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setSendingEnquiry(true);
    try {
      // Payload: adapt fields to your backend contract
      const payload = {
        product_id: product?.id,
        message: enquiryMessage.trim(),
        user_id: user?.id ?? null,
      };

      // backendApi is assumed to be an axios instance
      await backendApi.post('/enquiries', payload);
      // If backend returns non-2xx, axios will throw and we land in catch
      toast.success('Enquiry sent! The seller will contact you.');
      setShowEnquiryModal(false);
      setEnquiryMessage('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        // If your backend uses a specific code like PGRST204, check it here
        if (body && (body.code === 'PGRST204' || (body.message && String(body.message).includes('category_id')))) {
          console.warn("⚠️ 'category_id' column missing in products table. Neutralizing field.");
          toast.error('Enquiry failed due to backend schema. Contact admin.');
        } else {
          toast.error((err as Error).message ?? 'Failed to send enquiry');
        }
      } else {
        console.error(err);
        toast.error('Failed to send enquiry');
      }
    } finally {
      setSendingEnquiry(false);
    }
  };

  return (
    <>
      <div className="product-card group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full border border-slate-100 overflow-hidden relative">
        {/* Image + Link */}
        <Link to={`/product/${product?.id}`} className="block">
          {/* Fly-to-Cart Animation */}
          <AnimatePresence>
            {isFlying && (
              <motion.div
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 0.1, x: 400, y: -800, rotate: 45 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="fixed z-[999] pointer-events-none w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
                style={{
                  left: imgRef.current?.getBoundingClientRect().left ?? 0,
                  top: imgRef.current?.getBoundingClientRect().top ?? 0,
                }}
              >
                <img src={imageUrl} className="w-full h-full object-cover" alt="flying" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Area */}
          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPos((prev) => ({ ...prev, show: false }))}
            className="relative aspect-[4/5] overflow-hidden bg-slate-50 cursor-zoom-in"
          >
            <img
              src={imageUrl}
              alt={product?.name}
              className={`w-full h-full object-cover transition-transform duration-1000 ${zoomPos.show ? 'opacity-0' : 'group-hover:scale-110'}`}
              loading="lazy"
            />

            {zoomPos.show && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`, backgroundSize: '300%' }}
              />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white">
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Verified</span>
                <div className="bg-indigo-600 rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                </div>
              </div>
            </div>

            {!showPrice && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-xl">
                Enquiry Only
              </div>
            )}
            {showPrice && discount > 5 && (
              <div className="absolute top-4 right-4 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl">
                -{discount}%
              </div>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{vendorName}</p>
            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
              {rating} <Star className="w-3 h-3 fill-current" />
            </div>
          </div>

          <Link to={`/product/${product?.id}`} className="group-hover:text-indigo-700 transition-colors">
            <h3 className="font-black text-slate-800 text-base line-clamp-2 mb-3 uppercase tracking-tight leading-tight">
              {product?.name}
            </h3>
          </Link>

          {/* Price display */}
          <div className="flex items-end gap-3 mt-auto">
            {showPrice ? (
              <>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">{formatPrice(effectivePrice)}</span>
                {discount > 5 && <span className="text-sm text-slate-300 line-through mb-1 font-bold">{formatPrice(originalPrice)}</span>}
              </>
            ) : (
              <span className="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Contact Seller
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            {showPrice ? (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={isFlying}
                className="w-full bg-indigo-600 text-white py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-90 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {isFlying ? 'Adding...' : 'Add To Bag'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnquiry}
                className="w-full bg-amber-500 text-white py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 active:scale-90"
              >
                <Phone className="w-4 h-4" /> Enquire Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={() => setShowEnquiryModal(false)}
        >
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase">Send Enquiry</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">Regarding: {product?.name}</p>
              </div>
            </div>

            <textarea
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              placeholder="Hi, I'm interested in this product. Can you share more details..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400"
            />

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowEnquiryModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitEnquiry}
                disabled={sendingEnquiry}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition disabled:opacity-50"
              >
                {sendingEnquiry ? 'Sending...' : 'Send Enquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
