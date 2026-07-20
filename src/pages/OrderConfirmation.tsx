import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { backendApi } from '@/lib/api/client';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { CheckCircle, Package, Truck, MapPin, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data: orderData } = await backendApi.get(`/orders/${orderId}`);
        if (orderData) setOrder(orderData);

        const { data: itemsData } = await backendApi.get(`/orders/${orderId}/items`);
        if (itemsData) setItems(itemsData);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="max-w-4xl mx-auto px-4 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-border p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-success/10 to-transparent pointer-events-none" />
          
          <div className="text-center relative z-10 mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 relative group"
            >
              <div className="absolute inset-0 bg-success/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50" />
              <CheckCircle className="w-12 h-12 text-success relative z-10" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">Provisioning <span className="text-success">Confirmed</span></h1>
            <p className="text-foreground/60 font-medium text-lg max-w-lg mx-auto">Your asset provisioning protocol has been initiated successfully over the secure network.</p>
            
            {orderId && (
              <div className="mt-6 inline-flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-xl">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Protocol ID:</span>
                 <span className="font-mono text-sm font-bold text-foreground">#{orderId.slice(0, 12).toUpperCase()}</span>
              </div>
            )}
          </div>

          {order && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              {/* Timeline */}
              <div className="mb-12 relative">
                <div className="absolute top-6 inset-x-10 h-1 bg-background rounded-full overflow-hidden">
                   <div className="w-1/4 h-full bg-success" />
                </div>
                <div className="flex items-center justify-between px-4 relative z-10">
                  {[
                    { icon: CheckCircle, label: 'Authorized', active: true },
                    { icon: Package, label: 'Packaged', active: false },
                    { icon: Truck, label: 'In Transit', active: false },
                    { icon: MapPin, label: 'Received', active: false },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-colors ${s.active ? 'bg-success text-white border-success shadow-lg shadow-success/20' : 'bg-white text-foreground/30 border-border'}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${s.active ? 'text-success' : 'text-foreground/40'}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Items */}
                <div className="border border-border rounded-3xl overflow-hidden bg-background">
                  <div className="px-6 py-4 border-b border-border bg-white flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-widest">Asset Manifest</h3>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="divide-y divide-border">
                    {items.map(item => (
                      <div key={item.id} className="px-6 py-5 flex justify-between items-center bg-white hover:bg-background/50 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.product_name || "Enterprise Asset"}</p>
                          {item.variant_title && <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mt-1">{item.variant_title}</p>}
                          <p className="text-xs text-foreground/60 mt-1">QTY: {item.quantity}</p>
                        </div>
                        <p className="font-black text-sm text-foreground">{formatPrice(item.total || 0)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="border border-border rounded-3xl p-6 bg-white shadow-sm">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-widest mb-6 pb-4 border-b border-border flex items-center gap-2">
                       <Package className="w-4 h-4 text-accent" /> Authorization Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60 font-medium">Subtotal</span>
                        <span className="font-bold text-foreground">{formatPrice(order.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60 font-medium">Network Routing</span>
                        <span className="font-bold text-success bg-success/10 px-2 py-0.5 rounded uppercase tracking-widest text-[10px]">{order.shipping === 0 ? 'Complimentary' : formatPrice(order.shipping)}</span>
                      </div>
                      <div className="border-t border-border pt-4 flex justify-between items-center mt-2">
                        <span className="font-bold text-foreground">Total Authorized</span>
                        <span className="text-2xl font-display font-black text-primary">{formatPrice(order.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="border border-border rounded-3xl p-6 bg-background relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                      <h4 className="font-bold text-sm text-foreground uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                         <MapPin className="w-4 h-4 text-primary" /> Destination Node
                      </h4>
                      <p className="text-sm font-medium text-foreground/70 leading-relaxed relative z-10">
                        <span className="font-bold text-foreground block mb-1">{order.shipping_address.name}</span>
                        {order.shipping_address.address}<br />
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br />
                        {order.shipping_address.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-border">
            <Link to="/products" className="flex-1 btn-primary py-4 text-sm flex items-center justify-center gap-2">
              Continue Provisioning <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex-1 py-4 bg-background text-foreground border border-border rounded-full font-bold text-sm uppercase tracking-widest text-center hover:bg-border/50 transition-colors">
              Return to Core
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
