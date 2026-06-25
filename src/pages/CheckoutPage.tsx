import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api/orders';
import { formatPrice, SHIPPING_RULES } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { ChevronRight, Lock, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

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
      // 1. Create order on the server
      const { backendApi } = await import('@/services/api');
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
        name: 'BTM Textile Market',
        description: 'Elite Fabrics from Bargur',
        order_id: data.id,
        handler: async function (response: any) {
          await finalizeOrder(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: { color: '#2874f0' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const simulateSuccessfulPayment = async () => {
    toast.success('Simulating successful payment for demo');
    await finalizeOrder('demo_pay_' + Date.now(), 'demo_order_' + Date.now());
  };

  const finalizeOrder = async (paymentId: string, razorpayOrderId?: string, signature?: string) => {
    setLoading(true);
    try {
      // 1. Verify Payment if signature exists
      if (signature && razorpayOrderId) {
          const { backendApi } = await import('@/services/api');
          await backendApi.post('/payment/verify', {
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature
          });
      }

      // 2. Create order with items using ordersApi
      const order = await ordersApi.createOrder({
        userId: user?.id,
        total: total,
        address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
        items: cart,
        customerName: shippingAddress.name,
        customerPhone: shippingAddress.phone,
        customerEmail: shippingAddress.email
      });


      if (!order) throw new Error("Order creation returned no data");


      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation?orderId=${order.id}`);
    } catch (err: any) {
      console.error('Finalize order error:', err);
      toast.error('Failed to save order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      <Header />
      <AuthModal />
      <CartDrawer />

      <div className="mt-20 sm:mt-24 max-w-6xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-10 overflow-hidden">
          <div className="flex items-center w-full max-w-md">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 'shipping' ? 'bg-[#2a4f5f] text-white' : 'bg-emerald-500 text-white'}`}>
                {step === 'payment' ? '✓' : '1'}
              </div>
              <span className="text-[10px] font-bold mt-1 text-gray-500 uppercase">Address</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === 'payment' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 'payment' ? 'bg-[#2a4f5f] text-white' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
              <span className="text-[10px] font-bold mt-1 text-gray-500 uppercase">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {step === 'shipping' ? (
              <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#2874f0]" /> Delivery Address
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
                      <input type="text" required value={shippingAddress.name} onChange={e => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:border-[#2874f0] outline-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label>
                      <input type="tel" required value={shippingAddress.phone} onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:border-[#2874f0] outline-none text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address *</label>
                    <input type="email" required value={shippingAddress.email} onChange={e => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded focus:border-[#2874f0] outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Address (House No, Street, Area) *</label>
                    <textarea rows={3} required value={shippingAddress.address} onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded focus:border-[#2874f0] outline-none text-sm resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">City *</label>
                      <input type="text" required value={shippingAddress.city} onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:border-[#2874f0] outline-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">PIN Code *</label>
                      <input type="text" required value={shippingAddress.zip} onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:border-[#2874f0] outline-none text-sm" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                      <input type="text" value={shippingAddress.state} readOnly className="w-full px-4 py-2 border rounded bg-gray-50 text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#fb641b] text-white py-4 rounded font-bold hover:bg-[#e65a15] transition shadow-md uppercase tracking-wider">
                    Deliver to this address
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 rounded shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#2874f0]" /> Payment Options
                  </h2>
                  <button onClick={() => setStep('shipping')} className="text-xs font-bold text-[#2874f0] hover:underline uppercase">Change Address</button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded border border-dashed border-gray-200 mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Delivering to:</p>
                  <p className="text-sm font-bold text-gray-800">{shippingAddress.name}</p>
                  <p className="text-xs text-gray-500">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.zip}</p>
                </div>

                <div className="space-y-4">
                  <div className="border rounded p-6 flex items-center gap-6 bg-slate-50 border-[#2a4f5f]/30 hover:border-[#2a4f5f] transition-all cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-4 border-[#2a4f5f]/20 group-hover:border-[#2a4f5f] transition-all bg-white" />
                    <div className="flex-1">
                      <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Razorpay Secure</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cards, UPI, Wallets Protected</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-[#2a4f5f]" />
                  </div>
                  
                  <button 
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                    className="w-full bg-[#2a4f5f] text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                  >
                    {loading ? 'Processing...' : `Initialize Payment - ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Price Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price ({cart.length} items)</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="border-t border-dashed pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Amount Payable</span>
                  <span className="text-lg font-bold text-gray-800">{formatPrice(total)}</span>
                </div>
                <div className="pt-2 text-[10px] text-green-600 font-bold bg-green-50 p-2 text-center rounded">
                  You will save {formatPrice(0)} on this order
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  <span>Safe and Secure Payments. 100% Authentic products.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

