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

  const effectivePrice: number = product?.price ?? 0;
  const originalPrice: number = product?.original_price ?? Math.round(effectivePrice * 1.3);
  const vendorName: string = product?.shops?.name ?? 'Premium Seller';
  const imageUrl: string = product?.image_url ?? (product?.images && product.images[0]) ?? '/placeholder.svg';
  const showPrice: boolean = product?.price != null;
  const discount: number = originalPrice > 0 ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;
  const rating: number | string = product?.rating ?? '4.8';

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)), show: true });
  };

  const handleQuickAdd = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isFlying) return;
    setIsFlying(true);
    try {
      addToCart(product, 1);
      await new Promise((res) => setTimeout(res, 800));
      toast.success('Added to cart successfully');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setIsFlying(false);
    }
  };

  const handleEnquiry = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setShowEnquiryModal(true);
  };

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
      const payload = {
        product_id: product?.id,
        message: enquiryMessage.trim(),
        user_id: user?.id ?? null,
      };
      await backendApi.post('/enquiries', payload);
      toast.success('Enquiry sent! The seller will contact you.');
      setShowEnquiryModal(false);
      setEnquiryMessage('');
    } catch (err: unknown) {
      toast.error('Failed to send enquiry');
    } finally {
      setSendingEnquiry(false);
    }
  };

  return (
    <>
      <div className="premium-card group flex flex-col h-full relative">
        <Link to={`/product/${product?.id}`} className="block relative aspect-[4/5] overflow-hidden bg-background">
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

          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPos((prev) => ({ ...prev, show: false }))}
            className="w-full h-full cursor-zoom-in"
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
                style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`, backgroundSize: '250%' }}
              />
            )}

            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white">
                <span className="text-[10px] font-bold text-success uppercase tracking-wider">Verified</span>
                <Check className="w-3 h-3 text-success stroke-[3]" />
              </div>
            </div>

            {!showPrice && (
              <div className="absolute top-4 right-4 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                Enquiry Only
              </div>
            )}
            {showPrice && discount > 5 && (
              <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                -{discount}%
              </div>
            )}
          </div>
        </Link>

        <div className="p-5 flex flex-col flex-grow bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest truncate">{vendorName}</p>
            <div className="bg-primary/20 text-foreground text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              {rating} <Star className="w-3 h-3 text-primary fill-current" />
            </div>
          </div>

          <Link to={`/product/${product?.id}`} className="group-hover:text-primary transition-colors">
            <h3 className="font-display font-bold text-foreground text-lg line-clamp-2 mb-3 leading-tight">
              {product?.name}
            </h3>
          </Link>

          <div className="flex items-end gap-3 mt-auto">
            {showPrice ? (
              <>
                <span className="text-xl font-display font-black text-foreground">{formatPrice(effectivePrice)}</span>
                {discount > 5 && <span className="text-sm text-foreground/40 line-through mb-0.5 font-semibold">{formatPrice(originalPrice)}</span>}
              </>
            ) : (
              <span className="text-sm font-bold text-accent uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Contact Seller
              </span>
            )}
          </div>

          <div className="mt-5 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {showPrice ? (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={isFlying}
                className="w-full bg-background border-2 border-primary text-foreground py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isFlying ? 'Adding...' : 'Add To Cart'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnquiry}
                className="w-full bg-accent text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Enquire Now
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEnquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4"
            onClick={() => setShowEnquiryModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-float border border-border" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-black text-foreground text-xl">Send Enquiry</h3>
                  <p className="text-sm text-foreground/60 font-medium">Regarding: {product?.name}</p>
                </div>
              </div>

              <textarea
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                placeholder="Hi, I'm interested in this product..."
                rows={4}
                className="w-full bg-background border-2 border-transparent rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:border-primary/50 transition-colors"
              />

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="flex-1 py-3 bg-background text-foreground/70 rounded-xl font-bold hover:bg-background/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEnquiry}
                  disabled={sendingEnquiry}
                  className="flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {sendingEnquiry ? 'Sending...' : 'Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
