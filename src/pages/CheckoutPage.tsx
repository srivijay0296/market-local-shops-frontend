import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { backendApi } from '@/lib/api/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api/orders';
import { formatPrice, SHIPPING_RULES } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { ChevronRight, Lock, Truck, ShieldCheck, CreditCard, User, Mail, Phone, MapPin, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: 'Bargur',
    state: 'Tamil Nadu',
    zip: '',
    country: 'India',
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const total = cartTotal + shippingCost;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.address || !shippingAddress.zip) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep('payment');
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    
    try {
      const response = await backendApi.post('/payment/order', {
          amount: total, 
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
      });

      const data = response.data;

      if (!data?.id) {
        throw new Error('Payment initialization failed');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
        amount: data.amount,
        currency: data.currency,
        name: 'Namma Market',
        description: 'Premium Asset Provisioning',
        order_id: data.id,
        handler: async function (response: any) {
          await finalizeOrder(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: { color: '#0F172A' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment network offline or rejected');
    } finally {
      setLoading(false);
    }
  };

  const finalizeOrder = async (paymentId: string, razorpayOrderId?: string, signature?: string) => {
    setLoading(true);
    try {
      if (signature && razorpayOrderId) {
          await backendApi.post('/payment/verify', {
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature
          });
      }

      const order = await ordersApi.createOrder({
        userId: user?.id,
        total: total,
        address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
        items: cart,
        customerName: shippingAddress.name,
        customerPhone: shippingAddress.phone,
        customerEmail: shippingAddress.email
      });

      if (!order) throw new Error("Order protocol failed");

      clearCart();
      toast.success('Asset provisioning successful!');
      navigate(`/order-confirmation?orderId=${order.id}`);
    } catch (err: any) {
      console.error('Finalize error:', err);
      toast.error('Provisioning failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        
        {/* SECURE CHECKOUT HEADER */}
        <div className="flex flex-col items-center mb-16 space-y-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success relative overflow-hidden group">
            <Lock className="w-8 h-8 relative z-10" />
            <div className="absolute inset-0 bg-success/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground text-center">
            Secure <span className="text-primary">Checkout</span>
          </h1>
          <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs">End-to-end encrypted provisioning</p>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex items-center w-full max-w-lg relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0" />
            <motion.div 
              initial={false}
              animate={{ width: step === 'payment' ? '100%' : '50%' }}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0" 
            />
            
            <div className="flex justify-between w-full relative z-10">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step === 'shipping' ? 'bg-primary text-foreground shadow-lg shadow-primary/20 scale-110' : 'bg-success text-white'}`}>
                  {step === 'payment' ? <ShieldCheck className="w-6 h-6" /> : '1'}
                </div>
                <span className={`text-[10px] font-bold mt-4 uppercase tracking-widest ${step === 'shipping' ? 'text-primary' : 'text-success'}`}>Protocol</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step === 'payment' ? 'bg-primary text-foreground shadow-lg shadow-primary/20 scale-110' : 'bg-white border-2 border-border text-foreground/40'}`}>
                  2
                </div>
                <span className={`text-[10px] font-bold mt-4 uppercase tracking-widest ${step === 'payment' ? 'text-primary' : 'text-foreground/40'}`}>Verification</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* MAIN FORM */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {step === 'shipping' ? (
                <motion.div 
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Truck className="w-6 h-6" /></div>
                    <h2 className="text-2xl font-display font-black text-foreground">Delivery Protocol</h2>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="space-y-8">
                    
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest border-b border-border pb-2">Identity Matrix</h3>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <FloatingInput icon={<User />} label="Full Name" type="text" value={shippingAddress.name} onChange={e => setShippingAddress({...shippingAddress, name: e.target.value})} />
                        <FloatingInput icon={<Phone />} label="Phone Number" type="tel" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} />
                      </div>
                        <FloatingInput icon={<Mail />} label="Email Address" type="email" value={shippingAddress.email} onChange={e => setShippingAddress({...shippingAddress, email: e.target.value})} />
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest border-b border-border pb-2">Destination Node</h3>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-5 w-5 h-5 text-foreground/40" />
                        <textarea rows={3} required value={shippingAddress.address} onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })} placeholder="Full Address (House No, Street, Area)"
                          className="w-full bg-background border-2 border-transparent focus:border-primary/50 py-4 pl-12 pr-4 rounded-xl outline-none transition-colors font-medium text-sm resize-none"></textarea>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <FloatingInput label="City" type="text" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
                        <FloatingInput label="ZIP / PIN Code" type="text" value={shippingAddress.zip} onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})} />
                      </div>
                      
                      <div className="relative opacity-70">
                         <input type="text" value={shippingAddress.state} readOnly className="w-full bg-background border-2 border-transparent py-4 px-4 rounded-xl font-medium text-sm cursor-not-allowed" />
                         <span className="absolute top-1 left-4 text-[9px] font-bold text-foreground/50 uppercase tracking-widest">State Region</span>
                      </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-5 text-sm">
                      Initialize Final Phase <ChevronRight className="w-5 h-5 ml-2 inline" />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-dark text-white rounded-xl"><CreditCard className="w-6 h-6" /></div>
                      <h2 className="text-2xl font-display font-black text-foreground">Payment Authorization</h2>
                    </div>
                    <button onClick={() => setStep('shipping')} className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Edit Node</button>
                  </div>
                  
                  <div className="p-6 bg-background rounded-2xl border border-border mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2"><Target className="w-3 h-3" /> Target Destination:</p>
                    <p className="text-lg font-bold text-foreground relative z-10">{shippingAddress.name}</p>
                    <p className="text-sm text-foreground/70 font-medium mt-1 relative z-10">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.zip}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="border-2 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 bg-white border-primary/20 hover:border-primary shadow-sm hover:shadow-md transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-full border-4 border-primary/20 group-hover:border-primary transition-all bg-white relative flex items-center justify-center shrink-0">
                         <div className="w-3 h-3 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-foreground text-lg">Razorpay Nexus</p>
                        <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mt-1">Cards, UPI, Wallets, NetBanking</p>
                      </div>
                      <ShieldCheck className="w-10 h-10 text-success shrink-0" />
                    </div>
                    
                    <button 
                      onClick={handleRazorpayPayment}
                      disabled={loading}
                      className="w-full btn-primary py-5 text-sm"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : `Authorize Payment — ${formatPrice(total)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-8 rounded-3xl shadow-glass border border-border sticky top-32">
              <h3 className="text-lg font-display font-black text-foreground mb-6 flex items-center gap-2">
                 <Package className="w-5 h-5 text-primary" /> Asset Summary
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 p-3 bg-background rounded-2xl border border-border/50">
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0">
                      <img src={item.image_url || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-foreground/50">Qty: {item.quantity}</span>
                        <span className="font-black text-sm">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex justify-between text-sm font-medium text-foreground/70">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-foreground/70">Routing Fee</span>
                  <span className="text-success font-bold">COMPLIMENTARY</span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total Authorization</span>
                  <span className="text-2xl font-display font-black text-primary">{formatPrice(total)}</span>
                </div>
                
                <div className="mt-6 pt-4 bg-success/5 rounded-xl border border-success/10 p-4">
                  <div className="flex items-center gap-3 text-xs text-success font-bold">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>256-bit AES encryption active. Payment data is never stored locally.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function FloatingInput({ icon, label, type, value, onChange }: { icon?: React.ReactNode, label: string, type: string, value: string, onChange: (e:any) => void }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      {icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-foreground/40'}`}>{icon}</div>}
      <input 
        required type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full bg-background border-2 transition-colors py-4 ${icon ? 'pl-12' : 'pl-4'} pr-4 rounded-xl outline-none font-medium text-sm text-foreground ${focused ? 'border-primary/50 bg-white' : 'border-transparent'}`} 
      />
      <label className={`absolute left-${icon ? '12' : '4'} transition-all pointer-events-none uppercase tracking-widest font-bold ${active ? 'top-1 text-[9px] text-primary' : 'top-1/2 -translate-y-1/2 text-xs text-foreground/40'}`}>
        {label}
      </label>
    </div>
  );
}

